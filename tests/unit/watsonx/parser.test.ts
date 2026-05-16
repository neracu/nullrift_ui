/**
 * Unit Tests for Response Parser
 * 
 * Tests JSON extraction, validation, and error handling
 */

import { describe, it, expect } from 'vitest';
import {
  parseAndValidate,
  extractJSON,
  validateSchema,
  createFallbackSchema,
  sanitizeResponse,
  looksLikeJSON
} from '@/lib/watsonx/parser';
import type { ComponentSchema } from '@/lib/watsonx/types';

describe('Response Parser', () => {
  describe('extractJSON', () => {
    it('should extract valid JSON from plain text', () => {
      const text = '{"name": "TestComponent", "description": "Test"}';
      const result = extractJSON(text);
      
      expect(result).toEqual({
        name: 'TestComponent',
        description: 'Test'
      });
    });

    it('should extract JSON from markdown code blocks', () => {
      const text = '```json\n{"name": "TestComponent"}\n```';
      const result = extractJSON(text);
      
      expect(result).toEqual({ name: 'TestComponent' });
    });

    it('should extract JSON with markdown headers', () => {
      const text = '## Response:\n```json\n{"name": "TestComponent"}\n```';
      const result = extractJSON(text);
      
      expect(result).toEqual({ name: 'TestComponent' });
    });

    it('should handle JSON with surrounding text', () => {
      const text = 'Here is the component:\n{"name": "TestComponent"}\nEnd of response';
      const result = extractJSON(text);
      
      expect(result).toEqual({ name: 'TestComponent' });
    });

    it('should extract JSON from array wrapper', () => {
      const text = '[{"name": "TestComponent"}]';
      const result = extractJSON(text);
      
      expect(result).toEqual({ name: 'TestComponent' });
    });

    it('should handle malformed JSON with common errors', () => {
      // Trailing comma
      const text = '{"name": "Test",}';
      const result = extractJSON(text);
      
      expect(result).toEqual({ name: 'Test' });
    });

    it('should throw on completely invalid JSON', () => {
      const text = 'This is not JSON at all';
      
      expect(() => extractJSON(text)).toThrow();
    });
  });

  describe('parseAndValidate', () => {
    const validSchema = {
      name: 'LoginForm',
      description: 'A login form',
      props: [],
      fields: [
        {
          id: 'email',
          type: 'input' as const,
          label: 'Email',
          placeholder: 'Enter email',
          validation: {
            required: true,
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
            message: 'Invalid email'
          }
        }
      ],
      styling: {
        theme: 'dark' as const,
        primaryColor: '#3b82f6',
        borderRadius: 'md',
        spacing: 'normal'
      },
      layout: 'single-column' as const
    };

    it('should parse valid schema successfully', () => {
      const text = JSON.stringify(validSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema).toBeDefined();
      expect(result.schema?.name).toBe('LoginForm');
    });

    it('should handle validation errors', () => {
      const invalidSchema = {
        // Missing required fields
        description: 'Test'
      };
      
      const text = JSON.stringify(invalidSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid field types', () => {
      const invalidSchema = {
        ...validSchema,
        fields: [
          {
            id: 'test',
            type: 'invalid-type', // Invalid type
            label: 'Test'
          }
        ]
      };
      
      const text = JSON.stringify(invalidSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(false);
    });

    it('should handle partial schemas with defaults', () => {
      const partialSchema = {
        name: 'TestForm',
        description: 'Test',
        fields: []
        // Missing props, styling, layout
      };
      
      const text = JSON.stringify(partialSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema?.props).toEqual([]);
      expect(result.schema?.styling).toBeDefined();
      expect(result.schema?.layout).toBeDefined();
    });

    it('should handle markdown formatted responses', () => {
      const text = '```json\n' + JSON.stringify(validSchema) + '\n```';
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema?.name).toBe('LoginForm');
    });

    it('should handle nested JSON structures', () => {
      const nestedSchema = {
        ...validSchema,
        fields: [
          {
            id: 'address',
            type: 'input' as const,
            label: 'Address',
            validation: {
              required: true,
              minLength: 10,
              maxLength: 200,
              message: 'Address must be between 10 and 200 characters'
            }
          }
        ]
      };
      
      const text = JSON.stringify(nestedSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema?.fields[0].validation).toBeDefined();
      expect(result.schema?.fields[0].validation?.minLength).toBe(10);
    });

    it('should sanitize and validate styling config', () => {
      const schemaWithStyling = {
        ...validSchema,
        styling: {
          theme: 'dark' as const,
          primaryColor: '#3b82f6',
          borderRadius: 'xl',
          spacing: 'compact'
        }
      };
      
      const text = JSON.stringify(schemaWithStyling);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema?.styling).toBeDefined();
      expect(result.schema?.styling.theme).toBe('dark');
    });
  });

  describe('error handling', () => {
    it('should provide helpful error messages', () => {
      const invalidText = '{"name": 123}'; // name should be string
      const result = parseAndValidate(invalidText);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('validation');
    });

    it('should handle empty responses', () => {
      const result = parseAndValidate('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle null/undefined responses', () => {
      const result = parseAndValidate('null');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle very large schemas', () => {
      const largeSchema = {
        name: 'LargeForm',
        description: 'A form with many fields',
        props: [],
        fields: Array.from({ length: 50 }, (_, i) => ({
          id: `field${i}`,
          type: 'input' as const,
          label: `Field ${i}`,
          validation: { required: i % 2 === 0 }
        })),
        styling: {
          theme: 'light' as const,
          primaryColor: '#000000',
          borderRadius: 'md',
          spacing: 'normal'
        },
        layout: 'grid' as const
      };
      
      const text = JSON.stringify(largeSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema?.fields).toHaveLength(50);
    });

    it('should handle unicode characters', () => {
      const unicodeSchema = {
        name: 'UnicodeForm',
        description: 'Form with unicode: 你好 🎉',
        props: [],
        fields: [
          {
            id: 'name',
            type: 'input' as const,
            label: 'Name (名前)',
            placeholder: 'Enter your name'
          }
        ],
        styling: {
          theme: 'light' as const,
          primaryColor: '#000000',
          borderRadius: 'md',
          spacing: 'normal'
        },
        layout: 'single-column' as const
      };
      
      const text = JSON.stringify(unicodeSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema?.description).toContain('你好');
      expect(result.schema?.fields[0].label).toContain('名前');
    });

    it('should handle special characters in strings', () => {
      const specialSchema = {
        name: 'SpecialForm',
        description: 'Form with "quotes" and \'apostrophes\'',
        props: [],
        fields: [
          {
            id: 'test',
            type: 'input' as const,
            label: 'Test & Special <chars>',
            placeholder: 'Enter value'
          }
        ],
        styling: {
          theme: 'light' as const,
          primaryColor: '#000000',
          borderRadius: 'md',
          spacing: 'normal'
        },
        layout: 'single-column' as const
      };
      
      const text = JSON.stringify(specialSchema);
      const result = parseAndValidate(text);
      
      expect(result.success).toBe(true);
      expect(result.schema?.description).toContain('quotes');
      expect(result.schema?.fields[0].label).toContain('&');
    });
  });

  describe('utility functions', () => {
    it('should detect JSON-like text', () => {
      expect(looksLikeJSON('{}')).toBe(true);
      expect(looksLikeJSON('[]')).toBe(true);
      expect(looksLikeJSON('not json')).toBe(false);
    });

    it('should sanitize responses', () => {
      const dirty = '## Response:\n```json\n{"test": "value"}\n```';
      const clean = sanitizeResponse(dirty);
      
      expect(clean).not.toContain('##');
      expect(clean).not.toContain('```');
    });

    it('should create fallback schemas', () => {
      const fallback = createFallbackSchema('Create a login form');
      
      expect(fallback.name).toBe('FallbackComponent');
      expect(fallback.fields).toBeDefined();
      expect(fallback.fields.length).toBeGreaterThan(0);
    });
  });
});

// Made with Bob