import type {
  WatsonxConfig,
  GenerationRequest,
  GenerationResponse,
  ComponentSchema,
} from "./types";
import { buildEnhancedPrompt, detectCategory } from "./prompts";
import { parseAndValidate, handleParseError, createFallbackSchema } from "./parser";
import { getIamAccessToken } from "./iam-token";

/**
 * Error types for better error handling
 */
export class WatsonxError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'WatsonxError';
  }
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

/**
 * Request cache for deduplication
 */
const requestCache = new Map<string, Promise<GenerationResponse>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class WatsonxClient {
  private config: WatsonxConfig;
  private retryConfig: RetryConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config: WatsonxConfig, retryConfig?: Partial<RetryConfig>) {
    this.config = config;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Generate component with automatic retry and error handling
   */
  async generateComponent(
    request: GenerationRequest
  ): Promise<GenerationResponse> {
    const cacheKey = this.getCacheKey(request);
    
    // Check cache first
    const cached = requestCache.get(cacheKey);
    if (cached) {
      console.log('Returning cached response');
      return cached;
    }

    // Create new request promise
    const requestPromise = this.generateWithRetry(request);
    
    // Cache the promise
    requestCache.set(cacheKey, requestPromise);
    
    // Clear cache after TTL
    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, CACHE_TTL);

    return requestPromise;
  }

  /**
   * Generate with retry logic
   */
  private async generateWithRetry(
    request: GenerationRequest,
    attempt: number = 1
  ): Promise<GenerationResponse> {
    try {
      return await this.generateInternal(request);
    } catch (error) {
      const watsonxError = this.handleError(error);
      
      // Check if we should retry
      if (watsonxError.retryable && attempt < this.retryConfig.maxRetries) {
        const delay = this.calculateBackoff(attempt);
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        
        await this.sleep(delay);
        return this.generateWithRetry(request, attempt + 1);
      }
      
      // Max retries reached or non-retryable error
      throw watsonxError;
    }
  }

  /**
   * IBM watsonx text generation requires a `version` query parameter on the URL.
   */
  private getTextGenerationRequestUrl(): string {
    const base = `${this.config.apiUrl.replace(/\/$/, "")}/ml/v1/text/generation`;
    const url = new URL(base);
    url.searchParams.set("version", this.config.apiVersion);
    return url.toString();
  }

  /**
   * Internal generation logic
   */
  private async generateInternal(
    request: GenerationRequest
  ): Promise<GenerationResponse> {
    const startTime = Date.now();
    
    // Rate limiting
    await this.enforceRateLimit();
    
    // Build enhanced prompt
    const category = detectCategory(request.prompt);
    const enhancedPrompt = buildEnhancedPrompt(request.prompt, category);
    
    // Make API request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const iamAccessToken = await getIamAccessToken(this.config.apiKey);
      const generationUrl = this.getTextGenerationRequestUrl();

      const response = await fetch(
        generationUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${iamAccessToken}`,
          },
          body: JSON.stringify({
            model_id: this.config.modelId,
            project_id: this.config.projectId,
            input: enhancedPrompt,
            parameters: request.parameters || {
              max_new_tokens: 2000,
              temperature: 0.7,
              top_p: 0.9,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new WatsonxError(
          `API error: ${response.statusText}`,
          'API_ERROR',
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json();

      if (!data.results || !data.results[0]) {
        throw new WatsonxError(
          'Invalid API response structure',
          'INVALID_RESPONSE',
          undefined,
          false
        );
      }

      // Parse and validate response
      const generatedText = data.results[0].generated_text;
      const parseResult = parseAndValidate(generatedText);
      
      if (!parseResult.success) {
        console.error('Parse error:', parseResult.error);
        
        // Try error recovery
        const recoveryResult = handleParseError(
          new Error(parseResult.error || 'Parse failed'),
          generatedText
        );
        
        if (!recoveryResult.success) {
          // Use fallback schema as last resort
          console.warn('Using fallback schema');
          const fallbackSchema = createFallbackSchema(request.prompt);
          
          return {
            schema: fallbackSchema,
            metadata: {
              model: this.config.modelId,
              tokensUsed: data.results[0].input_token_count + data.results[0].generated_token_count,
              generationTime: Date.now() - startTime,
              fallback: true
            },
          };
        }
        
        return {
          schema: recoveryResult.schema!,
          metadata: {
            model: this.config.modelId,
            tokensUsed: data.results[0].input_token_count + data.results[0].generated_token_count,
            generationTime: Date.now() - startTime,
            recovered: true
          },
        };
      }

      return {
        schema: parseResult.schema!,
        metadata: {
          model: this.config.modelId,
          tokensUsed: data.results[0].input_token_count + data.results[0].generated_token_count,
          generationTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof WatsonxError) {
        throw error;
      }

      if (
        error instanceof Error &&
        (error.message.startsWith("IAM token request failed") ||
          error.message === "IAM token response missing access_token")
      ) {
        throw new WatsonxError(error.message, "API_ERROR", 401, false);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new WatsonxError(
          'Request timeout',
          'TIMEOUT',
          408,
          true
        );
      }
      
      throw new WatsonxError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR',
        undefined,
        false
      );
    }
  }

  /**
   * Handle and classify errors
   */
  private handleError(error: unknown): WatsonxError {
    if (error instanceof WatsonxError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new WatsonxError(
        error.message,
        'UNKNOWN_ERROR',
        undefined,
        false
      );
    }
    
    return new WatsonxError(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      undefined,
      false
    );
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
      this.retryConfig.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000; // 1 request per second
    
    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Generate cache key for request
   */
  private getCacheKey(request: GenerationRequest): string {
    return `${request.prompt}:${JSON.stringify(request.parameters || {})}`;
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: requestCache.size,
      lastRequestTime: this.lastRequestTime
    };
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    requestCache.clear();
  }
}

// Made with Bob
