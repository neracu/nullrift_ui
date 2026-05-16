/**
 * Unit Tests for Code Generator
 * 
 * Tests React TSX component generation from schemas
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeBuilder } from '@/lib/generator/code-builder';
import type { ComponentSchema } from '@/lib/watsonx/types';

describe('Code Generator', () => {
  let codeBuilder: CodeBuilder;

  beforeEach(() => {
    codeBuilder = new CodeBuilder();
  });
  const basicSchema: ComponentSchema = {
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
        placeholder: 'Enter your email',
        validation: {
          required: true,
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          message: 'Invalid email address'
        }
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
  };

  describe('generateReactComponent', () => {
    it('should generate valid React component', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result).toBeDefined();
      expect(result.component).toBeTruthy();
      expect(result.component).toContain('export');
      expect(result.component).toContain('TestForm');
    });

    it('should include component name', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('TestForm');
    });

    it('should include field labels', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('Email');
    });

    it('should include validation logic', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('required');
    });

    it('should generate TypeScript types', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.types).toBeTruthy();
      expect(result.types).toContain('interface');
    });

    it('should generate styles', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.styles).toBeTruthy();
    });

    it('should handle multiple fields', () => {
      const multiFieldSchema: ComponentSchema = {
        ...basicSchema,
        fields: [
          {
            id: 'name',
            type: 'input',
            label: 'Name',
            validation: { required: true }
          },
          {
            id: 'email',
            type: 'input',
            label: 'Email',
            validation: { required: true }
          },
          {
            id: 'message',
            type: 'textarea',
            label: 'Message',
            validation: { required: false }
          }
        ]
      };
      
      const result = codeBuilder.generateReactComponent(multiFieldSchema);
      
      expect(result.component).toContain('Name');
      expect(result.component).toContain('Email');
      expect(result.component).toContain('Message');
    });

    it('should handle select fields', () => {
      const selectSchema: ComponentSchema = {
        ...basicSchema,
        fields: [
          {
            id: 'country',
            type: 'select',
            label: 'Country',
            options: [
              { label: 'USA', value: 'us' },
              { label: 'UK', value: 'uk' }
            ]
          }
        ]
      };
      
      const result = codeBuilder.generateReactComponent(selectSchema);
      
      expect(result.component).toContain('Country');
      expect(result.component).toContain('select');
    });

    it('should handle checkbox fields', () => {
      const checkboxSchema: ComponentSchema = {
        ...basicSchema,
        fields: [
          {
            id: 'agree',
            type: 'checkbox',
            label: 'I agree to terms'
          }
        ]
      };
      
      const result = codeBuilder.generateReactComponent(checkboxSchema);
      
      expect(result.component).toContain('checkbox');
      expect(result.component).toContain('I agree to terms');
    });

    it('should handle textarea fields', () => {
      const textareaSchema: ComponentSchema = {
        ...basicSchema,
        fields: [
          {
            id: 'bio',
            type: 'textarea',
            label: 'Biography',
            placeholder: 'Tell us about yourself'
          }
        ]
      };
      
      const result = codeBuilder.generateReactComponent(textareaSchema);
      
      expect(result.component).toContain('textarea');
      expect(result.component).toContain('Biography');
    });

    it('should include state management', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('useState');
    });

    it('should include form submission handler', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('onSubmit') || 
      expect(result.component).toContain('handleSubmit');
    });

    it('should apply styling configuration', () => {
      const styledSchema: ComponentSchema = {
        ...basicSchema,
        styling: {
          theme: 'light',
          primaryColor: '#ff0000',
          borderRadius: 'lg',
          spacing: 'relaxed'
        }
      };
      
      const result = codeBuilder.generateReactComponent(styledSchema);
      
      expect(result.component).toBeTruthy();
      expect(result.styles).toContain('color') || expect(result.styles).toContain('theme');
    });

    it('should handle different layouts', () => {
      const gridSchema: ComponentSchema = {
        ...basicSchema,
        layout: 'grid'
      };
      
      const result = codeBuilder.generateReactComponent(gridSchema);
      
      expect(result.component).toContain('grid') || expect(result.component).toContain('Grid');
    });

    it('should generate accessible components', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      // Should include accessibility attributes
      expect(result.component).toContain('aria-') || 
      expect(result.component).toContain('label');
    });

    it('should handle validation messages', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('Invalid email') || 
      expect(result.component).toContain('error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty fields array', () => {
      const emptySchema: ComponentSchema = {
        ...basicSchema,
        fields: []
      };
      
      const result = codeBuilder.generateReactComponent(emptySchema);
      
      expect(result.component).toBeTruthy();
    });

    it('should handle complex validation rules', () => {
      const complexSchema: ComponentSchema = {
        ...basicSchema,
        fields: [
          {
            id: 'password',
            type: 'input',
            label: 'Password',
            validation: {
              required: true,
              minLength: 8,
              maxLength: 50,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              message: 'Password must contain uppercase, lowercase, and number'
            }
          }
        ]
      };
      
      const result = codeBuilder.generateReactComponent(complexSchema);
      
      expect(result.component).toContain('Password');
    });

    it('should handle special characters in labels', () => {
      const specialSchema: ComponentSchema = {
        ...basicSchema,
        fields: [
          {
            id: 'test',
            type: 'input',
            label: 'Test & Special <chars>'
          }
        ]
      };
      
      const result = codeBuilder.generateReactComponent(specialSchema);
      
      expect(result.component).toBeTruthy();
    });

    it('should handle long component names', () => {
      const longNameSchema: ComponentSchema = {
        ...basicSchema,
        name: 'VeryLongComponentNameThatShouldStillWork'
      };
      
      const result = codeBuilder.generateReactComponent(longNameSchema);
      
      expect(result.component).toContain('VeryLongComponentNameThatShouldStillWork');
    });

    it('should handle unicode in labels', () => {
      const unicodeSchema: ComponentSchema = {
        ...basicSchema,
        fields: [
          {
            id: 'name',
            type: 'input',
            label: 'Name (名前) 🎉'
          }
        ]
      };
      
      const result = codeBuilder.generateReactComponent(unicodeSchema);
      
      expect(result.component).toBeTruthy();
    });
  });

  describe('code quality', () => {
    it('should generate properly formatted code', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      // Should have proper indentation
      expect(result.component).toContain('  '); // At least some indentation
    });

    it('should include imports', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('import') || 
      expect(result.component).toContain('React');
    });

    it('should export component', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      expect(result.component).toContain('export');
    });

    it('should generate valid JSX', () => {
      const result = codeBuilder.generateReactComponent(basicSchema);
      
      // Should have opening and closing tags
      const openTags = (result.component.match(/<\w+/g) || []).length;
      const closeTags = (result.component.match(/<\/\w+>/g) || []).length;
      
      // Should have balanced tags (roughly)
      expect(Math.abs(openTags - closeTags)).toBeLessThan(5);
    });
  });
});

// Made with Bob