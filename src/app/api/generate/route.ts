import { NextRequest, NextResponse } from "next/server";
import { WatsonxClient, WatsonxError } from "@/lib/watsonx/client";
import { watsonxConfig, validateWatsonxConfig } from "@/config/watsonx";
import { generateCode } from "@/lib/generator/code-builder";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Request logging
 */
interface RequestLog {
  timestamp: string;
  prompt: string;
  success: boolean;
  duration: number;
  error?: string;
}

const requestLogs: RequestLog[] = [];
const MAX_LOGS = 100;

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true };
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

/**
 * Log request
 */
function logRequest(log: RequestLog) {
  requestLogs.push(log);
  if (requestLogs.length > MAX_LOGS) {
    requestLogs.shift();
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${log.timestamp}] ${log.success ? '✓' : '✗'} ${log.prompt.substring(0, 50)}... (${log.duration}ms)`);
    if (log.error) {
      console.error(`  Error: ${log.error}`);
    }
  }
}

/**
 * Validate request body
 */
function validateRequestBody(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.prompt || typeof body.prompt !== 'string') {
    return { valid: false, error: 'Invalid prompt: must be a non-empty string' };
  }

  if (body.prompt.length < 10) {
    return { valid: false, error: 'Prompt is too short (minimum 10 characters)' };
  }

  if (body.prompt.length > 2000) {
    return { valid: false, error: 'Prompt is too long (maximum 2000 characters)' };
  }

  if (body.parameters) {
    if (typeof body.parameters !== 'object') {
      return { valid: false, error: 'Parameters must be an object' };
    }

    const { max_new_tokens, temperature, top_p } = body.parameters;

    if (max_new_tokens !== undefined && (typeof max_new_tokens !== 'number' || max_new_tokens < 100 || max_new_tokens > 4000)) {
      return { valid: false, error: 'max_new_tokens must be between 100 and 4000' };
    }

    if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 1)) {
      return { valid: false, error: 'temperature must be between 0 and 1' };
    }

    if (top_p !== undefined && (typeof top_p !== 'number' || top_p < 0 || top_p > 1)) {
      return { valid: false, error: 'top_p must be between 0 and 1' };
    }
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let prompt = '';

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${resetIn} seconds.`,
          code: 'RATE_LIMIT_EXCEEDED'
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime!.toString()
          }
        }
      );
    }

    // Validate configuration
    try {
      validateWatsonxConfig();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: error instanceof Error ? error.message : 'watsonx.ai is not properly configured',
          code: 'CONFIG_ERROR',
          hint: 'Please check your .env.local file and ensure WATSONX_API_KEY and WATSONX_PROJECT_ID are set'
        },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const validation = validateRequestBody(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: validation.error,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    prompt = body.prompt;
    const { parameters } = body;

    // Initialize watsonx.ai client
    const client = new WatsonxClient(watsonxConfig);

    // Generate component schema
    console.log(`Generating component for prompt: "${prompt.substring(0, 50)}..."`);
    const result = await client.generateComponent({
      prompt,
      parameters,
    });

    // Generate code from schema
    const generatedCode = generateCode(result.schema);

    // Log successful request
    logRequest({
      timestamp: new Date().toISOString(),
      prompt,
      success: true,
      duration: Date.now() - startTime
    });

    // Return response with generated code
    // Frontend expects: { success: true, code: string }
    return NextResponse.json({
      success: true,
      code: generatedCode.component, // Return the component code as string
      schema: result.schema,
      metadata: result.metadata,
      generatedCode: generatedCode // Include full generated code object for future use
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log failed request
    logRequest({
      timestamp: new Date().toISOString(),
      prompt: prompt || 'unknown',
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Handle WatsonxError specifically
    if (error instanceof WatsonxError) {
      const statusCode = error.statusCode || 500;
      
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          retryable: error.retryable,
          message: getErrorMessage(error.code),
          hint: getErrorHint(error.code)
        },
        { status: statusCode }
      );
    }

    // Handle generic errors
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        hint: 'Please try again or contact support if the issue persists'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check and stats
 */
export async function GET() {
  try {
    validateWatsonxConfig();
    
    return NextResponse.json({
      status: 'ok',
      configured: true,
      stats: {
        totalRequests: requestLogs.length,
        successRate: requestLogs.length > 0
          ? (requestLogs.filter(l => l.success).length / requestLogs.length * 100).toFixed(2) + '%'
          : 'N/A',
        averageDuration: requestLogs.length > 0
          ? Math.round(requestLogs.reduce((sum, l) => sum + l.duration, 0) / requestLogs.length) + 'ms'
          : 'N/A'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      configured: false,
      error: error instanceof Error ? error.message : 'Configuration error'
    }, { status: 500 });
  }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'API_ERROR': 'Failed to communicate with watsonx.ai API',
    'TIMEOUT': 'Request timed out. The AI service took too long to respond',
    'PARSE_ERROR': 'Failed to parse AI response. The generated content was invalid',
    'VALIDATION_ERROR': 'Generated schema failed validation',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please slow down',
    'CONFIG_ERROR': 'watsonx.ai is not properly configured',
    'UNKNOWN_ERROR': 'An unexpected error occurred'
  };
  
  return messages[code] || 'An error occurred during generation';
}

/**
 * Get helpful hint for error
 */
function getErrorHint(code: string): string {
  const hints: Record<string, string> = {
    'API_ERROR': 'Check your API credentials and network connection',
    'TIMEOUT': 'Try simplifying your prompt or try again later',
    'PARSE_ERROR': 'Try rephrasing your prompt to be more specific',
    'VALIDATION_ERROR': 'Try a different prompt or adjust your requirements',
    'RATE_LIMIT_EXCEEDED': 'Wait a moment before making another request',
    'CONFIG_ERROR': 'Ensure WATSONX_API_KEY and WATSONX_PROJECT_ID are set in .env.local',
    'UNKNOWN_ERROR': 'Please try again or contact support'
  };
  
  return hints[code] || 'Please try again';
}

// Made with Bob