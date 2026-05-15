import type {
  WatsonxConfig,
  GenerationRequest,
  GenerationResponse,
  ComponentSchema,
} from "./types";

export class WatsonxClient {
  private config: WatsonxConfig;

  constructor(config: WatsonxConfig) {
    this.config = config;
  }

  async generateComponent(
    request: GenerationRequest
  ): Promise<GenerationResponse> {
    const enhancedPrompt = this.buildPrompt(request.prompt);

    const response = await fetch(
      `${this.config.apiUrl}/ml/v1/text/generation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model_id: this.config.modelId,
          project_id: this.config.projectId,
          input: enhancedPrompt,
          parameters: request.parameters || {
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`watsonx.ai API error: ${response.statusText}`);
    }

    const data = await response.json();
    const schema = this.parseResponse(data.results[0].generated_text);

    return {
      schema,
      metadata: {
        model: this.config.modelId,
        tokensUsed:
          data.results[0].input_token_count +
          data.results[0].generated_token_count,
        generationTime: Date.now(),
      },
    };
  }

  private buildPrompt(userPrompt: string): string {
    return `You are an expert UI/UX designer and React developer. Generate a component schema based on the following request:

User Request: ${userPrompt}

Output a JSON schema with the following structure:
{
  "name": "ComponentName",
  "description": "Brief description",
  "props": [
    {
      "name": "propName",
      "type": "string | number | boolean",
      "required": true,
      "defaultValue": "value"
    }
  ],
  "fields": [
    {
      "id": "field1",
      "type": "input | select | textarea | checkbox",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "validation": {
        "required": true,
        "pattern": "regex pattern",
        "message": "Error message"
      }
    }
  ],
  "styling": {
    "theme": "light | dark",
    "primaryColor": "#hex",
    "borderRadius": "sm | md | lg | xl",
    "spacing": "compact | normal | relaxed"
  },
  "layout": "single-column | two-column | grid"
}

Generate ONLY valid JSON, no additional text.`;
  }

  private parseResponse(text: string): ComponentSchema {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from watsonx.ai");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return this.transformToSchema(parsed);
  }

  private transformToSchema(data: any): ComponentSchema {
    return {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      props: data.props || [],
      fields: data.fields || [],
      styling: data.styling || {},
      layout: data.layout || "single-column",
      createdAt: new Date().toISOString(),
    };
  }
}

// Made with Bob
