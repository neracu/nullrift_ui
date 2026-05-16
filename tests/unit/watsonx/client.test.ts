/**
 * Unit Tests for WatsonxClient
 * 
 * Tests the core functionality of the watsonx.ai client including
 * retry logic, error handling, caching, and rate limiting.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/watsonx/iam-token', () => ({
  getIamAccessToken: vi.fn().mockResolvedValue('test-iam-access-token'),
}));

import { WatsonxClient, WatsonxError } from '@/lib/watsonx/client';
import type { WatsonxConfig, GenerationRequest } from '@/lib/watsonx/types';

// Mock fetch
global.fetch = vi.fn();

const mockConfig: WatsonxConfig = {
  apiKey: 'test-api-key',
  projectId: 'test-project-id',
  modelId: 'ibm/granite-13b-chat-v2',
  apiUrl: 'https://test.ml.cloud.ibm.com',
  apiVersion: '2024-05-31',
};

const mockRequest: GenerationRequest = {
  prompt: 'Create a login form with email and password fields',
  parameters: {
    max_tokens: 2000,
    temperature: 0.7,
    top_p: 0.9
  }
};

const mockSuccessResponse = {
  results: [{
    generated_text: JSON.stringify({
      name: 'LoginForm',
      description: 'A login form component',
      props: [],
      fields: [
        {
          id: 'email',
          type: 'input',
          label: 'Email',
          validation: { required: true }
        }
      ],
      styling: {
        theme: 'dark',
        primaryColor: '#3b82f6',
        borderRadius: 'md',
        spacing: 'normal'
      },
      layout: 'single-column'
    }),
    input_token_count: 100,
    generated_token_count: 200
  }]
};

describe('WatsonxClient', () => {
  let client: WatsonxClient;

  beforeEach(() => {
    client = new WatsonxClient(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    client.clearCache();
  });

  describe('generateComponent', () => {
    it('should generate component successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      });

      const result = await client.generateComponent(mockRequest);

      const calledUrl = String((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]);
      expect(calledUrl).toContain("version=2024-05-31");

      expect(result.schema).toBeDefined();
      expect(result.schema.name).toBe('LoginForm');
      expect(result.schema.fields).toHaveLength(1);
      expect(result.metadata.model).toBe(mockConfig.modelId);
      expect(result.metadata.tokensUsed).toBe(300);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      await expect(client.generateComponent(mockRequest))
        .rejects
        .toThrow(WatsonxError);
    });

    it('should retry on retryable errors', async () => {
      // First call fails with 500
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      // Second call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      });

      const result = await client.generateComponent(mockRequest);

      expect(result.schema).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid request'
      });

      await expect(client.generateComponent(mockRequest))
        .rejects
        .toThrow(WatsonxError);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors', async () => {
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      await expect(client.generateComponent(mockRequest))
        .rejects
        .toThrow(WatsonxError);
    });

    it('should cache successful requests', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });

      // First call
      await client.generateComponent(mockRequest);
      
      // Second call should use cache
      await client.generateComponent(mockRequest);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle rate limiting', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });

      const startTime = Date.now();
      
      // Make two rapid requests
      await client.generateComponent(mockRequest);
      await client.generateComponent({ ...mockRequest, prompt: 'Different prompt' });

      const duration = Date.now() - startTime;
      
      // Should take at least 1 second due to rate limiting
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    it('should use fallback schema on parse error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{
            generated_text: 'Invalid JSON response',
            input_token_count: 100,
            generated_token_count: 200
          }]
        })
      });

      const result = await client.generateComponent(mockRequest);

      expect(result.schema).toBeDefined();
      expect(result.metadata.fallback).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should classify errors correctly', async () => {
      const testCases = [
        { status: 401, retryable: false },
        { status: 403, retryable: false },
        { status: 429, retryable: true },
        { status: 500, retryable: true },
        { status: 503, retryable: true }
      ];

      for (const testCase of testCases) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: testCase.status,
          statusText: 'Error',
          text: async () => 'Error'
        });

        try {
          await client.generateComponent(mockRequest);
        } catch (error) {
          expect(error).toBeInstanceOf(WatsonxError);
          expect((error as WatsonxError).retryable).toBe(testCase.retryable);
        }
      }
    });
  });

  describe('statistics', () => {
    it('should track request statistics', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });

      await client.generateComponent(mockRequest);
      await client.generateComponent({ ...mockRequest, prompt: 'Different' });

      const stats = client.getStats();
      
      expect(stats.requestCount).toBe(2);
      expect(stats.lastRequestTime).toBeGreaterThan(0);
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });

      await client.generateComponent(mockRequest);
      
      let stats = client.getStats();
      expect(stats.cacheSize).toBe(1);

      client.clearCache();
      
      stats = client.getStats();
      expect(stats.cacheSize).toBe(0);
    });
  });
});

// Made with Bob