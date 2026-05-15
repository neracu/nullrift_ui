export interface WatsonxConfig {
  apiKey: string;
  projectId: string;
  modelId: string;
  apiUrl: string;
}

export interface GenerationRequest {
  prompt: string;
  parameters?: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
  };
}

export interface ComponentSchema {
  id: string;
  name: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
  fields: Array<{
    id: string;
    type: "input" | "select" | "textarea" | "checkbox";
    label: string;
    placeholder?: string;
    validation?: {
      required?: boolean;
      pattern?: string;
      message?: string;
    };
  }>;
  styling: {
    theme?: "light" | "dark";
    primaryColor?: string;
    borderRadius?: "sm" | "md" | "lg" | "xl";
    spacing?: "compact" | "normal" | "relaxed";
  };
  layout: "single-column" | "two-column" | "grid";
  createdAt: string;
}

export interface GenerationResponse {
  schema: ComponentSchema;
  metadata: {
    model: string;
    tokensUsed: number;
    generationTime: number;
  };
}

// Made with Bob
