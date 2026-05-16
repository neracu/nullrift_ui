export interface WatsonxConfig {
  apiKey: string;
  projectId: string;
  modelId: string;
  apiUrl: string;
  /** watsonx ML API `version` query parameter (date, e.g. 2024-05-31). */
  apiVersion: string;
}

export interface GenerationRequest {
  prompt: string;
  parameters?: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
  };
}

export type ComponentCategory = 'form' | 'card' | 'modal' | 'layout' | 'data-display' | 'navigation' | 'feedback';

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface FieldDefinition {
  id: string;
  type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    field: string;
    value: any;
  };
}

export interface StylingConfig {
  theme?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  spacing?: 'compact' | 'normal' | 'relaxed';
  fontFamily?: string;
  customClasses?: string[];
}

export interface ValidationConfig {
  onSubmit?: 'validate' | 'submit';
  showErrors?: 'onBlur' | 'onChange' | 'onSubmit';
  errorPosition?: 'below' | 'inline' | 'tooltip';
}

export interface StateDefinition {
  name: string;
  type: string;
  initialValue: any;
}

export interface ComponentSchema {
  id: string;
  name: string;
  description: string;
  category?: ComponentCategory;
  props: PropDefinition[];
  fields: FieldDefinition[];
  styling: StylingConfig;
  layout: 'single-column' | 'two-column' | 'grid' | 'custom';
  validation?: ValidationConfig;
  state?: StateDefinition[];
  createdAt: string;
}

export interface GenerationResponse {
  schema: ComponentSchema;
  metadata: {
    model: string;
    tokensUsed: number;
    generationTime: number;
    fallback?: boolean;
    recovered?: boolean;
  };
}

// Made with Bob
