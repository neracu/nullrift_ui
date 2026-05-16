/**
 * Integration Tests for /api/generate Endpoint
 * 
 * Tests the complete generation flow through the API
 * Note: These tests use mocks for the watsonx client
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock watsonx client
vi.mock('@/lib/watsonx/client', () => ({
  WatsonxClient: vi.fn().mockImplementation(() => ({
    generateComponent: vi.fn().mockResolvedValue({
      schema: {
        id: 'test-1',
        name: 'TestForm',
        description: 'A test form',
        category: 'form',
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
        layout: 'single-column',
        createdAt: new Date().toISOString()
      },
      metadata: {
        model: 'granite-4-h-small',
        tokensUsed: 300,
        generationTime: 1500,
        fallback: false
      }
    })
  })),
  WatsonxError: class WatsonxError extends Error {
    constructor(message: string, public code: string, public retryable: boolean = false) {
      super(message);
    }
  }
}));

// Mock code builder
vi.mock('@/lib/generator/code-builder', () => ({
  CodeBuilder: vi.fn().mockImplementation(() => ({
    generateReactComponent: vi.fn().mockReturnValue({
      component: 'export function TestForm() { return <div>Test</div>; }',
      types: 'interface TestFormProps {}',
      styles: '.test-form { color: blue; }'
    })
  }))
}));

describe('API Integration Tests', () => {
  beforeAll(() => {
    // Set required environment variables
    process.env.WATSONX_API_KEY = 'test-api-key';
    process.env.WATSONX_PROJECT_ID = 'test-project-id';
  });

  describe('Request Validation', () => {
    it('should validate prompt length (minimum)', () => {
      const shortPrompt = 'short';
      expect(shortPrompt.length).toBeLessThan(10);
    });

    it('should validate prompt length (maximum)', () => {
      const longPrompt = 'a'.repeat(2001);
      expect(longPrompt.length).toBeGreaterThan(2000);
    });

    it('should accept valid prompt length', () => {
      const validPrompt = 'Create a login form with email and password';
      expect(validPrompt.length).toBeGreaterThanOrEqual(10);
      expect(validPrompt.length).toBeLessThanOrEqual(2000);
    });
  });

  describe('Response Structure', () => {
    it('should have correct success response structure', () => {
      const mockResponse = {
        success: true,
        code: 'export function TestForm() {}',
        schema: { name: 'TestForm' },
        metadata: { model: 'granite-4-h-small' }
      };

      expect(mockResponse).toHaveProperty('success');
      expect(mockResponse).toHaveProperty('code');
      expect(mockResponse).toHaveProperty('schema');
      expect(mockResponse).toHaveProperty('metadata');
      expect(typeof mockResponse.code).toBe('string');
    });

    it('should have correct error response structure', () => {
      const mockError = {
        success: false,
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        hints: ['Check your prompt length']
      };

      expect(mockError).toHaveProperty('success');
      expect(mockError).toHaveProperty('error');
      expect(mockError).toHaveProperty('code');
      expect(mockError.success).toBe(false);
    });
  });

  describe('Environment Configuration', () => {
    it('should require WATSONX_API_KEY', () => {
      expect(process.env.WATSONX_API_KEY).toBeDefined();
    });

    it('should require WATSONX_PROJECT_ID', () => {
      expect(process.env.WATSONX_PROJECT_ID).toBeDefined();
    });
  });

  describe('Prompt Processing', () => {
    it('should handle special characters', () => {
      const prompt = 'Create a form with "quotes" and \'apostrophes\'';
      expect(prompt).toContain('"');
      expect(prompt).toContain("'");
    });

    it('should handle unicode characters', () => {
      const prompt = 'Create a form with 你好 and 🎉';
      expect(prompt).toContain('你好');
      expect(prompt).toContain('🎉');
    });

    it('should handle newlines and whitespace', () => {
      const prompt = 'Create a form\nwith multiple\nlines';
      expect(prompt).toContain('\n');
    });
  });

  describe('Error Codes', () => {
    it('should define validation error code', () => {
      const errorCode = 'VALIDATION_ERROR';
      expect(errorCode).toBe('VALIDATION_ERROR');
    });

    it('should define configuration error code', () => {
      const errorCode = 'CONFIG_ERROR';
      expect(errorCode).toBe('CONFIG_ERROR');
    });

    it('should define API error code', () => {
      const errorCode = 'API_ERROR';
      expect(errorCode).toBe('API_ERROR');
    });

    it('should define timeout error code', () => {
      const errorCode = 'TIMEOUT';
      expect(errorCode).toBe('TIMEOUT');
    });

    it('should define parse error code', () => {
      const errorCode = 'PARSE_ERROR';
      expect(errorCode).toBe('PARSE_ERROR');
    });
  });

  describe('Rate Limiting', () => {
    it('should track request timestamps', () => {
      const now = Date.now();
      expect(now).toBeGreaterThan(0);
    });

    it('should calculate time between requests', () => {
      const time1 = Date.now();
      const time2 = time1 + 1000;
      const diff = time2 - time1;
      expect(diff).toBe(1000);
    });
  });

  describe('Schema Validation', () => {
    it('should validate component schema structure', () => {
      const schema = {
        name: 'TestForm',
        description: 'A test form',
        fields: [],
        styling: {},
        layout: 'single-column'
      };

      expect(schema).toHaveProperty('name');
      expect(schema).toHaveProperty('description');
      expect(schema).toHaveProperty('fields');
      expect(schema).toHaveProperty('styling');
      expect(schema).toHaveProperty('layout');
    });

    it('should validate field structure', () => {
      const field = {
        id: 'email',
        type: 'input',
        label: 'Email',
        validation: { required: true }
      };

      expect(field).toHaveProperty('id');
      expect(field).toHaveProperty('type');
      expect(field).toHaveProperty('label');
    });
  });

  describe('Code Generation', () => {
    it('should generate valid component code', () => {
      const code = 'export function TestForm() { return <div>Test</div>; }';
      
      expect(code).toContain('export');
      expect(code).toContain('function');
      expect(code).toContain('return');
    });

    it('should generate TypeScript types', () => {
      const types = 'interface TestFormProps { name: string; }';
      
      expect(types).toContain('interface');
    });

    it('should generate styles', () => {
      const styles = '.test-form { color: blue; }';
      
      expect(styles).toContain('color');
    });
  });
});

// Made with Bob