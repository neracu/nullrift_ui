/**
 * Prompt Engineering System for watsonx.ai
 * 
 * This module provides intelligent prompt templates and few-shot examples
 * to improve the quality and consistency of AI-generated component schemas.
 */

import type { ComponentSchema } from "./types";

export type ComponentCategory = 'form' | 'card' | 'modal' | 'layout' | 'data-display' | 'navigation' | 'feedback';

export interface PromptTemplate {
  system: string;
  instructions: string[];
  fewShot: FewShotExample[];
  outputFormat: string;
}

export interface FewShotExample {
  input: string;
  output: Partial<ComponentSchema>;
}

/**
 * System prompts for different component categories
 */
export const SYSTEM_PROMPTS: Record<ComponentCategory, string> = {
  form: `You are an expert UI/UX designer and React developer specializing in form components. 
You create accessible, user-friendly forms with proper validation and error handling.
Focus on: field types, validation rules, error messages, and user experience.`,

  card: `You are an expert UI/UX designer and React developer specializing in card components.
You create visually appealing, responsive cards with proper hierarchy and spacing.
Focus on: layout structure, content organization, visual hierarchy, and interactivity.`,

  modal: `You are an expert UI/UX designer and React developer specializing in modal dialogs.
You create accessible, user-friendly modals with proper focus management and keyboard navigation.
Focus on: accessibility, user actions, escape handling, and overlay behavior.`,

  layout: `You are an expert UI/UX designer and React developer specializing in layout components.
You create responsive, flexible layouts that work across all screen sizes.
Focus on: responsive design, grid systems, spacing, and component composition.`,

  'data-display': `You are an expert UI/UX designer and React developer specializing in data display components.
You create clear, scannable data presentations with proper formatting and hierarchy.
Focus on: data structure, readability, sorting, filtering, and pagination.`,

  navigation: `You are an expert UI/UX designer and React developer specializing in navigation components.
You create intuitive, accessible navigation with clear hierarchy and user feedback.
Focus on: navigation patterns, active states, mobile responsiveness, and accessibility.`,

  feedback: `You are an expert UI/UX designer and React developer specializing in feedback components.
You create clear, actionable feedback messages with appropriate visual indicators.
Focus on: message clarity, visual hierarchy, action buttons, and dismissal behavior.`
};

/**
 * Few-shot examples for better generation quality
 */
export const FEW_SHOT_EXAMPLES: Record<ComponentCategory, FewShotExample[]> = {
  form: [
    {
      input: "Create a login form with email and password fields",
      output: {
        name: "LoginForm",
        description: "A secure login form with email and password authentication",
        category: "form",
        fields: [
          {
            id: "email",
            type: "input",
            label: "Email Address",
            placeholder: "you@example.com",
            validation: {
              required: true,
              pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
              message: "Please enter a valid email address"
            }
          },
          {
            id: "password",
            type: "input",
            label: "Password",
            placeholder: "Enter your password",
            validation: {
              required: true,
              minLength: 8,
              message: "Password must be at least 8 characters"
            }
          }
        ],
        styling: {
          theme: "dark",
          primaryColor: "#3b82f6",
          borderRadius: "md",
          spacing: "normal"
        },
        layout: "single-column"
      }
    }
  ],
  
  card: [
    {
      input: "Create a product card with image, title, price, and add to cart button",
      output: {
        name: "ProductCard",
        description: "A product card displaying product information with purchase action",
        category: "card",
        props: [
          { name: "image", type: "string", required: true, defaultValue: "" },
          { name: "title", type: "string", required: true, defaultValue: "" },
          { name: "price", type: "number", required: true, defaultValue: 0 },
          { name: "onAddToCart", type: "function", required: false, defaultValue: undefined }
        ],
        fields: [],
        styling: {
          theme: "light",
          primaryColor: "#10b981",
          borderRadius: "lg",
          spacing: "normal"
        },
        layout: "single-column"
      }
    }
  ],
  
  modal: [
    {
      input: "Create a confirmation modal for delete actions",
      output: {
        name: "DeleteConfirmationModal",
        description: "A modal dialog to confirm destructive delete actions",
        category: "modal",
        props: [
          { name: "isOpen", type: "boolean", required: true, defaultValue: false },
          { name: "onConfirm", type: "function", required: true, defaultValue: undefined },
          { name: "onCancel", type: "function", required: true, defaultValue: undefined },
          { name: "itemName", type: "string", required: false, defaultValue: "this item" }
        ],
        fields: [],
        styling: {
          theme: "dark",
          primaryColor: "#ef4444",
          borderRadius: "lg",
          spacing: "normal"
        },
        layout: "single-column"
      }
    }
  ],
  
  layout: [],
  'data-display': [],
  navigation: [],
  feedback: []
};

/**
 * Common instructions for all component types
 */
const COMMON_INSTRUCTIONS = [
  "Generate ONLY valid JSON matching the exact schema structure",
  "Use PascalCase for component names (e.g., 'ContactForm', not 'contact-form')",
  "Include descriptive labels and placeholders for all fields",
  "Add appropriate validation rules with clear error messages",
  "Choose colors that match the component's purpose and theme",
  "Ensure the component is accessible and follows best practices",
  "Do not include any explanatory text, only the JSON output"
];

/**
 * Category-specific instructions
 */
const CATEGORY_INSTRUCTIONS: Record<ComponentCategory, string[]> = {
  form: [
    "Include proper field types (input, select, textarea, checkbox, radio, date, file)",
    "Add validation rules for required fields, patterns, min/max length",
    "Provide clear error messages for validation failures",
    "Consider conditional fields based on other field values",
    "Include submit button behavior in the schema"
  ],
  
  card: [
    "Define all props needed for the card content",
    "Consider hover states and interactive elements",
    "Include proper image handling and alt text",
    "Add action buttons or links as needed",
    "Ensure responsive layout for different screen sizes"
  ],
  
  modal: [
    "Include isOpen prop for visibility control",
    "Add onClose/onCancel handlers for dismissal",
    "Include primary action button (onConfirm, onSubmit, etc.)",
    "Consider keyboard navigation (Escape to close)",
    "Add overlay/backdrop behavior"
  ],
  
  layout: [
    "Define flexible grid or flex layout structure",
    "Include responsive breakpoints",
    "Add spacing and gap properties",
    "Consider nested component slots",
    "Ensure mobile-first responsive design"
  ],
  
  'data-display': [
    "Define data structure and field types",
    "Include sorting and filtering capabilities",
    "Add pagination if needed",
    "Consider loading and empty states",
    "Ensure data is properly formatted"
  ],
  
  navigation: [
    "Include navigation items with labels and links",
    "Add active state indicators",
    "Consider mobile menu behavior",
    "Include accessibility attributes",
    "Add keyboard navigation support"
  ],
  
  feedback: [
    "Include message type (success, error, warning, info)",
    "Add appropriate icons for visual feedback",
    "Include action buttons if needed",
    "Add auto-dismiss behavior option",
    "Consider animation and transitions"
  ]
};

/**
 * JSON schema structure for output validation
 */
const OUTPUT_SCHEMA = `
{
  "name": "ComponentName",
  "description": "Brief description of the component",
  "category": "form | card | modal | layout | data-display | navigation | feedback",
  "props": [
    {
      "name": "propName",
      "type": "string | number | boolean | object | array | function",
      "required": true,
      "defaultValue": "value",
      "description": "Prop description"
    }
  ],
  "fields": [
    {
      "id": "fieldId",
      "type": "input | select | textarea | checkbox | radio | date | file",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "options": [{ "label": "Option 1", "value": "value1" }],
      "validation": {
        "required": true,
        "minLength": 3,
        "maxLength": 100,
        "pattern": "regex pattern",
        "message": "Error message"
      },
      "conditional": {
        "field": "otherFieldId",
        "value": "expectedValue"
      }
    }
  ],
  "styling": {
    "theme": "light | dark | system",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "borderRadius": "none | sm | md | lg | xl | 2xl | full",
    "spacing": "compact | normal | relaxed",
    "fontFamily": "font name",
    "customClasses": ["class1", "class2"]
  },
  "layout": "single-column | two-column | grid | custom",
  "validation": {
    "onSubmit": "validate | submit",
    "showErrors": "onBlur | onChange | onSubmit",
    "errorPosition": "below | inline | tooltip"
  },
  "state": [
    {
      "name": "stateName",
      "type": "string | number | boolean | object | array",
      "initialValue": "value"
    }
  ]
}`;

/**
 * Detect component category from user prompt
 */
export function detectCategory(prompt: string): ComponentCategory {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.match(/\b(form|input|field|submit|register|login|contact|survey)\b/)) {
    return 'form';
  }
  if (lowerPrompt.match(/\b(card|product|profile|post|article|item)\b/)) {
    return 'card';
  }
  if (lowerPrompt.match(/\b(modal|dialog|popup|overlay|confirm|alert)\b/)) {
    return 'modal';
  }
  if (lowerPrompt.match(/\b(layout|grid|container|section|wrapper)\b/)) {
    return 'layout';
  }
  if (lowerPrompt.match(/\b(table|list|chart|graph|data|display)\b/)) {
    return 'data-display';
  }
  if (lowerPrompt.match(/\b(nav|menu|sidebar|header|footer|breadcrumb)\b/)) {
    return 'navigation';
  }
  if (lowerPrompt.match(/\b(toast|notification|alert|message|feedback|snackbar)\b/)) {
    return 'feedback';
  }
  
  // Default to form if no clear category
  return 'form';
}

/**
 * Build enhanced prompt with templates and examples
 */
export function buildEnhancedPrompt(
  userPrompt: string,
  category?: ComponentCategory
): string {
  const detectedCategory = category || detectCategory(userPrompt);
  const systemPrompt = SYSTEM_PROMPTS[detectedCategory];
  const fewShotExamples = FEW_SHOT_EXAMPLES[detectedCategory];
  const categoryInstructions = CATEGORY_INSTRUCTIONS[detectedCategory];
  
  let prompt = `${systemPrompt}\n\n`;
  
  // Add few-shot examples if available
  if (fewShotExamples.length > 0) {
    prompt += `## Examples:\n\n`;
    fewShotExamples.forEach((example, index) => {
      prompt += `### Example ${index + 1}:\n`;
      prompt += `Input: "${example.input}"\n`;
      prompt += `Output:\n${JSON.stringify(example.output, null, 2)}\n\n`;
    });
  }
  
  // Add instructions
  prompt += `## Instructions:\n`;
  [...COMMON_INSTRUCTIONS, ...categoryInstructions].forEach((instruction, index) => {
    prompt += `${index + 1}. ${instruction}\n`;
  });
  
  // Add output schema
  prompt += `\n## Required Output Schema:\n${OUTPUT_SCHEMA}\n\n`;
  
  // Add user request
  prompt += `## User Request:\n${userPrompt}\n\n`;
  
  // Final instruction
  prompt += `Generate the component schema as valid JSON. Output ONLY the JSON, no additional text or explanation.`;
  
  return prompt;
}

/**
 * Build a simple prompt without examples (for faster generation)
 */
export function buildSimplePrompt(userPrompt: string): string {
  return `You are an expert UI/UX designer and React developer. Generate a component schema based on the following request:

User Request: ${userPrompt}

Output a JSON schema with the following structure:
${OUTPUT_SCHEMA}

Generate ONLY valid JSON, no additional text.`;
}

/**
 * Get prompt template for a specific category
 */
export function getPromptTemplate(category: ComponentCategory): PromptTemplate {
  return {
    system: SYSTEM_PROMPTS[category],
    instructions: [...COMMON_INSTRUCTIONS, ...CATEGORY_INSTRUCTIONS[category]],
    fewShot: FEW_SHOT_EXAMPLES[category],
    outputFormat: OUTPUT_SCHEMA
  };
}

// Made with Bob