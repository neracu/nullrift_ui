/**
 * Unit Tests for Prompt Engineering System
 * 
 * Tests prompt templates, category detection, and prompt building
 */

import { describe, it, expect } from 'vitest';
import {
  buildEnhancedPrompt,
  detectCategory,
  getPromptTemplate,
  SYSTEM_PROMPTS,
  FEW_SHOT_EXAMPLES,
  type ComponentCategory
} from '@/lib/watsonx/prompts';

describe('Prompt Engineering', () => {
  describe('detectCategory', () => {
    it('should detect form category', () => {
      expect(detectCategory('Create a login form')).toBe('form');
      expect(detectCategory('Build a registration form with validation')).toBe('form');
      expect(detectCategory('Make an input field for email')).toBe('form');
    });

    it('should detect card category', () => {
      expect(detectCategory('Create a product card')).toBe('card');
      expect(detectCategory('Build a user profile card')).toBe('card');
      expect(detectCategory('Design a pricing card')).toBe('card');
    });

    it('should detect modal category', () => {
      expect(detectCategory('Create a confirmation modal')).toBe('modal');
      expect(detectCategory('Build a dialog for delete confirmation')).toBe('modal');
      expect(detectCategory('Make a popup for alerts')).toBe('modal');
    });

    it('should detect layout category', () => {
      expect(detectCategory('Create a dashboard layout')).toBe('layout');
      expect(detectCategory('Build a landing page section')).toBe('layout');
      expect(detectCategory('Design a sidebar navigation')).toBe('layout');
    });

    it('should detect data-display category', () => {
      expect(detectCategory('Create a data table')).toBe('data-display');
      expect(detectCategory('Build a list of items')).toBe('data-display');
      expect(detectCategory('Make a chart component')).toBe('data-display');
    });

    it('should detect navigation category', () => {
      expect(detectCategory('Create a navbar')).toBe('navigation');
      expect(detectCategory('Build a menu component')).toBe('navigation');
      expect(detectCategory('Design breadcrumbs')).toBe('navigation');
    });

    it('should detect feedback category', () => {
      expect(detectCategory('Create a toast notification')).toBe('feedback');
      expect(detectCategory('Build an alert component')).toBe('feedback');
      expect(detectCategory('Make a loading spinner')).toBe('feedback');
    });

    it('should default to form for ambiguous prompts', () => {
      expect(detectCategory('Create something')).toBe('form');
      expect(detectCategory('Build a component')).toBe('form');
    });
  });

  describe('buildEnhancedPrompt', () => {
    it('should build prompt with system instructions', () => {
      const prompt = buildEnhancedPrompt('Create a login form');
      
      expect(prompt).toContain('You are an expert');
      expect(prompt).toContain('Create a login form');
    });

    it('should include category-specific template', () => {
      const formPrompt = buildEnhancedPrompt('Create a login form');
      const cardPrompt = buildEnhancedPrompt('Create a product card');
      
      expect(formPrompt).toContain('form');
      expect(cardPrompt).toContain('card');
    });

    it('should include few-shot examples', () => {
      const prompt = buildEnhancedPrompt('Create a contact form');
      
      expect(prompt).toContain('Example');
      expect(prompt).toContain('Input:');
      expect(prompt).toContain('Output:');
    });

    it('should include JSON format instructions', () => {
      const prompt = buildEnhancedPrompt('Create a form');
      
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('schema');
    });

    it('should handle explicit category', () => {
      const prompt = buildEnhancedPrompt('Create something', 'modal');
      
      expect(prompt).toContain('modal');
    });
  });

  describe('getPromptTemplate', () => {
    it('should return templates for all categories', () => {
      const categories: ComponentCategory[] = ['form', 'card', 'modal', 'layout', 'data-display', 'navigation', 'feedback'];
      
      categories.forEach(category => {
        const template = getPromptTemplate(category);
        expect(template).toBeDefined();
        expect(template.system).toBeTruthy();
        expect(template.instructions).toBeDefined();
      });
    });

    it('should have consistent template structure', () => {
      const categories: ComponentCategory[] = ['form', 'card', 'modal', 'layout', 'data-display', 'navigation', 'feedback'];
      
      categories.forEach(category => {
        const template = getPromptTemplate(category);
        expect(template).toHaveProperty('system');
        expect(template).toHaveProperty('instructions');
        expect(template).toHaveProperty('outputFormat');
        expect(Array.isArray(template.instructions)).toBe(true);
      });
    });

    it('should have meaningful system prompts', () => {
      const categories: ComponentCategory[] = ['form', 'card', 'modal'];
      
      categories.forEach(category => {
        const template = getPromptTemplate(category);
        expect(template.system.length).toBeGreaterThan(50);
        expect(template.system).toContain('expert');
      });
    });

    it('should have clear instructions', () => {
      const categories: ComponentCategory[] = ['form', 'card'];
      
      categories.forEach(category => {
        const template = getPromptTemplate(category);
        expect(template.instructions.length).toBeGreaterThan(0);
        template.instructions.forEach(instruction => {
          expect(instruction.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('FEW_SHOT_EXAMPLES', () => {
    it('should have examples for all categories', () => {
      const categories: ComponentCategory[] = ['form', 'card', 'modal', 'layout', 'data-display', 'navigation', 'feedback'];
      
      categories.forEach(category => {
        const examples = FEW_SHOT_EXAMPLES[category];
        expect(examples).toBeDefined();
        expect(examples.length).toBeGreaterThan(0);
      });
    });

    it('should have valid example structure', () => {
      Object.values(FEW_SHOT_EXAMPLES).flat().forEach(example => {
        expect(example).toHaveProperty('input');
        expect(example).toHaveProperty('output');
        expect(example.input).toBeTruthy();
        expect(example.output).toBeDefined();
      });
    });

    it('should have realistic examples', () => {
      const formExamples = FEW_SHOT_EXAMPLES.form;
      
      formExamples.forEach(example => {
        expect(example.output).toHaveProperty('name');
        expect(example.output).toHaveProperty('description');
        expect(example.output).toHaveProperty('fields');
        expect(Array.isArray(example.output.fields)).toBe(true);
      });
    });

    it('should have diverse examples per category', () => {
      Object.entries(FEW_SHOT_EXAMPLES).forEach(([category, examples]) => {
        const inputs = examples.map(ex => ex.input);
        const uniqueInputs = new Set(inputs);
        
        // Each example should be unique
        expect(uniqueInputs.size).toBe(inputs.length);
      });
    });
  });

  describe('prompt quality', () => {
    it('should generate prompts with sufficient context', () => {
      const prompt = buildEnhancedPrompt('Create a complex registration form');
      
      // Should be detailed enough
      expect(prompt.length).toBeGreaterThan(500);
    });

    it('should include validation requirements', () => {
      const prompt = buildEnhancedPrompt('Create a form with validation');
      
      expect(prompt.toLowerCase()).toContain('validation');
    });

    it('should include styling guidance', () => {
      const prompt = buildEnhancedPrompt('Create a styled component');
      
      expect(prompt.toLowerCase()).toContain('styling');
    });

    it('should emphasize JSON output format', () => {
      const prompt = buildEnhancedPrompt('Create anything');
      
      expect(prompt).toContain('JSON');
      expect(prompt.toLowerCase()).toContain('format');
    });
  });

  describe('edge cases', () => {
    it('should handle empty prompts', () => {
      const prompt = buildEnhancedPrompt('');
      
      expect(prompt).toBeTruthy();
      expect(prompt).toContain('expert');
    });

    it('should handle very long prompts', () => {
      const longPrompt = 'Create a form with ' + 'many fields '.repeat(100);
      const result = buildEnhancedPrompt(longPrompt);
      
      expect(result).toContain(longPrompt);
    });

    it('should handle special characters in prompts', () => {
      const specialPrompt = 'Create a form with "quotes" and \'apostrophes\' & symbols';
      const result = buildEnhancedPrompt(specialPrompt);
      
      expect(result).toContain(specialPrompt);
    });

    it('should handle unicode in prompts', () => {
      const unicodePrompt = 'Create a form with 你好 and 🎉';
      const result = buildEnhancedPrompt(unicodePrompt);
      
      expect(result).toContain(unicodePrompt);
    });
  });
});

// Made with Bob