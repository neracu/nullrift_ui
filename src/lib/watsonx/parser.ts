/**
 * Response Parser for watsonx.ai
 * 
 * This module handles parsing and validation of AI-generated responses,
 * extracting JSON from text and ensuring schema compliance.
 */

import { z } from 'zod';
import type { ComponentSchema, FieldDefinition, PropDefinition } from './types';

/**
 * Zod schema for validation
 */
const PropDefinitionSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'function']),
  required: z.boolean(),
  defaultValue: z.any().optional(),
  description: z.string().optional()
});

const FieldDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(['input', 'select', 'textarea', 'checkbox', 'radio', 'date', 'file']),
  label: z.string(),
  placeholder: z.string().optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  validation: z.object({
    required: z.boolean().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional()
  }).optional(),
  conditional: z.object({
    field: z.string(),
    value: z.any()
  }).optional()
});

const StylingConfigSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']).optional(),
  spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
  fontFamily: z.string().optional(),
  fontSize: z.enum(['sm', 'base', 'lg']).optional(),
  customClasses: z.array(z.string()).optional(),
  submitButtonVariant: z.enum(['solid', 'outline', 'ghost', 'secondary']).optional(),
  submitButtonSize: z.enum(['sm', 'default', 'lg']).optional(),
  submitButtonFullWidth: z.boolean().optional()
});

const ValidationConfigSchema = z.object({
  onSubmit: z.enum(['validate', 'submit']).optional(),
  showErrors: z.enum(['onBlur', 'onChange', 'onSubmit']).optional(),
  errorPosition: z.enum(['below', 'inline', 'tooltip']).optional(),
  scrollToFirstError: z.boolean().optional(),
  validateDebounceMs: z.union([z.literal(0), z.literal(150), z.literal(300)]).optional(),
  showRequiredIndicators: z.boolean().optional(),
  autoFocus: z.boolean().optional(),
  submitOnEnter: z.boolean().optional(),
});

const StateDefinitionSchema = z.object({
  name: z.string(),
  type: z.string(),
  initialValue: z.any()
});

const ComponentSchemaValidator = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(['form', 'card', 'modal', 'layout', 'data-display', 'navigation', 'feedback']).optional(),
  /** Models often emit only `fields`; treat missing/null as no React props. */
  props: z.preprocess(
    (value) => (value === undefined || value === null ? [] : value),
    z.array(PropDefinitionSchema)
  ),
  fields: z.array(FieldDefinitionSchema),
  styling: StylingConfigSchema.default({}),
  layout: z.enum(['single-column', 'two-column', 'grid', 'custom']).default('single-column'),
  layerOrder: z.array(z.string()).optional(),
  validation: ValidationConfigSchema.optional(),
  state: z.array(StateDefinitionSchema).optional(),
  submitButtonLabel: z.string().optional()
});

export interface ParsedResponse {
  success: boolean;
  schema?: ComponentSchema;
  error?: string;
  details?: string;
}

/**
 * Returns the first top-level `{ ... }` slice using brace depth, ignoring `{`/`}` inside strings.
 * Avoids greedy `\\{[\\s\\S]*\\}` which runs to the last `}` and breaks on `}{` or trailing prose.
 */
function sliceBalancedJsonObject(text: string, start: number): string | null {
  if (start < 0 || start >= text.length || text[start] !== '{') {
    return null;
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (c === '\\') {
        escape = true;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return null;
}

/**
 * Extract JSON from text response
 * Handles various formats and edge cases including markdown formatting
 */
export function extractJSON(text: string): object {
  // Remove markdown headers (## Response:, # Output:, etc.)
  let cleaned = text.replace(/^#+\s+.*$/gm, '');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remove any "Response:" or similar prefixes
  cleaned = cleaned.replace(/^.*?Response:\s*/i, '');
  cleaned = cleaned.replace(/^.*?Output:\s*/i, '');
  
  const start = cleaned.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON object found in response');
  }
  let jsonText = sliceBalancedJsonObject(cleaned, start);
  if (!jsonText) {
    throw new Error('No JSON object found in response');
  }
  
  // Clean up common issues
  jsonText = jsonText
    .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
    .replace(/\n/g, ' ') // Remove newlines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    // Try to fix common JSON errors
    jsonText = fixCommonJSONErrors(jsonText);
    return JSON.parse(jsonText);
  }
}

/**
 * Fix common JSON formatting errors
 */
function fixCommonJSONErrors(jsonText: string): string {
  return jsonText
    // Fix unquoted keys
    .replace(/(\w+):/g, '"$1":')
    // Fix single quotes
    .replace(/'/g, '"')
    // Fix trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix missing commas between properties
    .replace(/"\s*"([^"]+)":/g, '", "$1":');
}

/**
 * Validate schema structure using Zod
 */
export function validateSchema(data: unknown): ComponentSchema {
  try {
    const validated = ComponentSchemaValidator.parse(data);
    
    // Add required fields that might be missing
    return {
      id: crypto.randomUUID(),
      ...validated,
      createdAt: new Date().toISOString()
    } as ComponentSchema;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('; ');
      throw new Error(`Schema validation failed: ${issues}`);
    }
    throw error;
  }
}

/**
 * Sanitize response text before parsing
 * Handles markdown formatting and other common issues
 */
export function sanitizeResponse(text: string): string {
  return text
    .trim()
    // Remove markdown headers
    .replace(/^#+\s+.*$/gm, '')
    // Remove markdown code blocks
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    // Remove "Response:" or "Output:" prefixes
    .replace(/^.*?Response:\s*/i, '')
    .replace(/^.*?Output:\s*/i, '')
    // Remove any leading/trailing non-JSON text
    .replace(/^[^{]*/, '')
    .replace(/[^}]*$/, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'");
}

/**
 * Parse and validate response from watsonx.ai
 */
export function parseAndValidate(text: string): ParsedResponse {
  try {
    // Sanitize input
    const sanitized = sanitizeResponse(text);
    
    // Extract JSON
    const json = extractJSON(sanitized);
    
    // Validate schema
    const schema = validateSchema(json);
    
    return {
      success: true,
      schema
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      details: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Handle parse errors with fallback strategies
 */
export function handleParseError(error: Error, originalText: string): ParsedResponse {
  console.error('Parse error:', error.message);
  console.error('Original text:', originalText.substring(0, 500));
  
  // Try alternative parsing strategies
  const strategies = [
    () => tryExtractFromCodeBlock(originalText),
    () => tryExtractFromArray(originalText),
    () => tryPartialParse(originalText)
  ];
  
  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result) {
        return {
          success: true,
          schema: result
        };
      }
    } catch (e) {
      // Continue to next strategy
      continue;
    }
  }
  
  // All strategies failed
  return {
    success: false,
    error: 'Failed to parse response after trying all strategies',
    details: error.message
  };
}

/**
 * Try to extract JSON from code block
 */
function tryExtractFromCodeBlock(text: string): ComponentSchema | null {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    const inner = codeBlockMatch[1].trim();
    const idx = inner.indexOf('{');
    const objectSlice = idx >= 0 ? sliceBalancedJsonObject(inner, idx) : null;
    if (!objectSlice) {
      return null;
    }
    const json = JSON.parse(objectSlice);
    return validateSchema(json);
  }
  return null;
}

/**
 * Try to extract JSON from array (if response is wrapped in array)
 */
function tryExtractFromArray(text: string): ComponentSchema | null {
  const bracketIdx = text.indexOf('[');
  if (bracketIdx === -1) {
    return null;
  }
  const objStart = text.indexOf('{', bracketIdx);
  if (objStart === -1) {
    return null;
  }
  const objectSlice = sliceBalancedJsonObject(text, objStart);
  if (!objectSlice) {
    return null;
  }
  try {
    const json = JSON.parse(objectSlice);
    return validateSchema(json);
  } catch {
    return null;
  }
}

/**
 * Try partial parsing with defaults
 */
function tryPartialParse(text: string): ComponentSchema | null {
  try {
    const json = extractJSON(text);
    
    // Add defaults for missing required fields
    const partial = {
      name: 'GeneratedComponent',
      description: 'AI-generated component',
      props: [],
      fields: [],
      styling: {
        theme: 'dark' as const,
        primaryColor: '#3b82f6',
        borderRadius: 'md' as const,
        spacing: 'normal' as const
      },
      layout: 'single-column' as const,
      ...json
    };
    
    return validateSchema(partial);
  } catch (error) {
    return null;
  }
}

/**
 * Create a fallback schema when parsing fails completely
 */
export function createFallbackSchema(prompt: string): ComponentSchema {
  return {
    id: crypto.randomUUID(),
    name: 'FallbackComponent',
    description: `Component generated from: ${prompt.substring(0, 100)}`,
    category: 'form',
    props: [],
    fields: [
      {
        id: 'field1',
        type: 'input',
        label: 'Field 1',
        placeholder: 'Enter value',
        validation: {
          required: true,
          message: 'This field is required'
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
}

/**
 * Validate individual field definition
 */
export function validateField(field: unknown): FieldDefinition {
  return FieldDefinitionSchema.parse(field);
}

/**
 * Validate individual prop definition
 */
export function validateProp(prop: unknown): PropDefinition {
  return PropDefinitionSchema.parse(prop);
}

/**
 * Check if response looks like valid JSON
 */
export function looksLikeJSON(text: string): boolean {
  const trimmed = text.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

/**
 * Extract confidence score from response (if available)
 */
export function extractConfidence(text: string): number {
  const confidenceMatch = text.match(/confidence[:\s]+(\d+\.?\d*)/i);
  if (confidenceMatch) {
    return parseFloat(confidenceMatch[1]);
  }
  return 0.8; // Default confidence
}

// Made with Bob