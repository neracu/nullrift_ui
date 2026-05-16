/**
 * Code Generator for Component Schemas
 * 
 * Transforms ComponentSchema into production-ready React TSX code
 * with TypeScript types, validation logic, and proper formatting.
 */

import {
  type ComponentSchema,
  type FieldDefinition,
  type PropDefinition,
  type StylingConfig,
  DEFAULT_SUBMIT_BUTTON_LABEL,
} from '../watsonx/types';

export interface GeneratedCode {
  component: string;
  types: string;
  styles?: string;
  tests?: string;
}

export class CodeBuilder {
  /**
   * Generate complete React component from schema
   */
  generateReactComponent(schema: ComponentSchema): GeneratedCode {
    const imports = this.generateImports(schema);
    const types = this.generateTypeDefinitions(schema);
    const component = this.generateComponentBody(schema);
    
    const code = `${imports}\n\n${types}\n\n${component}`;
    
    return {
      component: this.formatCode(code),
      types: this.generateStandaloneTypes(schema),
      styles: this.generateStyles(schema)
    };
  }

  /**
   * Generate imports based on component needs
   */
  private generateImports(schema: ComponentSchema): string {
    return `import React, { useState } from 'react';`;
  }

  /** Whether the field has any validation rule we emit into generated code. */
  private fieldHasValidators(field: FieldDefinition): boolean {
    const v = field.validation;
    if (!v) return false;
    return !!(v.required || v.minLength != null || v.maxLength != null || v.pattern);
  }

  /** Tailwind `rounded-*` literals for JIT (no dynamic class names). */
  private resolveRoundedClass(
    radius: StylingConfig['borderRadius'] | undefined,
    fallback: 'md' | 'lg' = 'lg'
  ): string {
    const r = radius ?? fallback;
    const map: Record<string, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    };
    return map[r] ?? map[fallback]!;
  }

  /** Primary submit background: explicit Tailwind utilities only. */
  private resolvePrimaryButtonClasses(schema: ComponentSchema): string {
    const raw = schema.styling.primaryColor?.trim().toLowerCase();
    const hexMap: Record<string, string> = {
      '#3b82f6': 'bg-blue-600 hover:bg-blue-700',
      '#2563eb': 'bg-blue-600 hover:bg-blue-700',
      '#1d4ed8': 'bg-blue-700 hover:bg-blue-800',
      '#10b981': 'bg-emerald-600 hover:bg-emerald-700',
      '#059669': 'bg-emerald-600 hover:bg-emerald-700',
      '#8b5cf6': 'bg-violet-600 hover:bg-violet-700',
      '#7c3aed': 'bg-violet-600 hover:bg-violet-700',
      '#f97316': 'bg-orange-500 hover:bg-orange-600',
      '#ef4444': 'bg-red-500 hover:bg-red-600',
      '#64748b': 'bg-slate-600 hover:bg-slate-700',
    };
    if (raw && hexMap[raw]) return hexMap[raw];
    const tokenMap: Record<string, string> = {
      'blue-500': 'bg-blue-500 hover:bg-blue-600',
      'blue-600': 'bg-blue-600 hover:bg-blue-700',
      'emerald-500': 'bg-emerald-500 hover:bg-emerald-600',
      'emerald-600': 'bg-emerald-600 hover:bg-emerald-700',
      'violet-500': 'bg-violet-500 hover:bg-violet-600',
      'violet-600': 'bg-violet-600 hover:bg-violet-700',
      'orange-500': 'bg-orange-500 hover:bg-orange-600',
      'red-500': 'bg-red-500 hover:bg-red-600',
      'slate-600': 'bg-slate-600 hover:bg-slate-700',
    };
    if (raw && tokenMap[raw]) return tokenMap[raw];
    return 'bg-blue-600 hover:bg-blue-700';
  }

  /**
   * Generate TypeScript type definitions
   */
  private generateTypeDefinitions(schema: ComponentSchema): string {
    const propsType = this.generatePropsType(schema);
    const formDataType = this.generateFormDataType(schema);
    
    let types = propsType;
    if (formDataType) {
      types += `\n\n${formDataType}`;
    }
    
    return types;
  }

  /**
   * Generate props interface
   */
  private generatePropsType(schema: ComponentSchema): string {
    if (schema.props.length === 0) {
      return `export interface ${schema.name}Props {}`;
    }

    const props = schema.props.map(prop => {
      const optional = prop.required ? '' : '?';
      const description = prop.description ? `  /** ${prop.description} */\n` : '';
      return `${description}  ${prop.name}${optional}: ${this.mapPropType(prop.type)};`;
    }).join('\n');

    return `export interface ${schema.name}Props {\n${props}\n}`;
  }

  /**
   * Generate form data type
   */
  private generateFormDataType(schema: ComponentSchema): string | null {
    if (schema.fields.length === 0) {
      return null;
    }

    const fields = schema.fields.map(field => {
      const type = this.mapFieldType(field.type);
      const optional = field.validation?.required ? '' : '?';
      return `  ${field.id}${optional}: ${type};`;
    }).join('\n');

    return `export interface ${schema.name}FormData {\n${fields}\n}`;
  }

  /**
   * Generate component body
   */
  private generateComponentBody(schema: ComponentSchema): string {
    const hasForm = schema.fields.length > 0;
    
    if (hasForm) {
      return this.generateFormComponent(schema);
    } else {
      return this.generateSimpleComponent(schema);
    }
  }

  /**
   * Generate form component
   */
  private generateFormComponent(schema: ComponentSchema): string {
    const stateHooks = this.generateStateHooks(schema);
    const validationRules = this.generateValidationRules(schema);
    const handleSubmit = this.generateSubmitHandler(schema);
    const fields = this.generateFields(schema);
    const className = this.generateClassName(schema);
    const validationBlock = validationRules ? `${validationRules}\n\n  ` : '';
    const submitRounded = this.resolveRoundedClass(schema.styling.borderRadius, 'md');
    const submitPrimary = this.resolvePrimaryButtonClasses(schema);

    return `export function ${schema.name}(props: ${schema.name}Props) {
  ${stateHooks}

  ${validationBlock}${handleSubmit}

  return (
    <div className="${className}">
      <form onSubmit={handleSubmit} className="space-y-4">
        ${fields}
        
        <button
          type="submit"
          className="w-full px-4 py-2 ${submitPrimary} text-white ${submitRounded} transition-colors duration-200"
        >
          {${JSON.stringify(schema.submitButtonLabel?.trim() || DEFAULT_SUBMIT_BUTTON_LABEL)}}
        </button>
      </form>
    </div>
  );
}`;
  }

  /**
   * Generate simple component (non-form)
   */
  private generateSimpleComponent(schema: ComponentSchema): string {
    const className = this.generateClassName(schema);
    const content = this.generateSimpleContent(schema);

    return `export function ${schema.name}(props: ${schema.name}Props) {
  return (
    <div className="${className}">
      ${content}
    </div>
  );
}`;
  }

  /**
   * Generate state hooks
   */
  private generateStateHooks(schema: ComponentSchema): string {
    const hooks: string[] = [];

    // Form state
    if (schema.fields.length > 0) {
      const initialState = schema.fields.map(field => {
        const defaultValue = this.getFieldDefaultValue(field);
        return `    ${field.id}: ${defaultValue}`;
      }).join(',\n');

      hooks.push(`const [formData, setFormData] = useState<${schema.name}FormData>({\n${initialState}\n  });`);
      hooks.push(`const [errors, setErrors] = useState<Partial<Record<keyof ${schema.name}FormData, string>>>({});`);
    }

    // Custom state from schema
    if (schema.state) {
      schema.state.forEach(state => {
        hooks.push(`const [${state.name}, set${this.capitalize(state.name)}] = useState<${state.type}>(${JSON.stringify(state.initialValue)});`);
      });
    }

    return hooks.join('\n  ');
  }

  /**
   * Generate validation rules
   */
  private generateValidationRules(schema: ComponentSchema): string {
    const rules = schema.fields
      .filter((field) => this.fieldHasValidators(field))
      .map((field) => {
        const validation = field.validation!;
        const checks: string[] = [];
        const msg = (fallback: string) =>
          JSON.stringify(validation.message || fallback);
        const id = field.id;

        if (validation.required) {
          if (field.type === 'checkbox') {
            checks.push(
              `if (formData.${id} !== true) return ${msg('This field is required')};`
            );
          } else if (field.type === 'file') {
            checks.push(`if (formData.${id} == null) return ${msg('This field is required')};`);
          } else {
            checks.push(
              `if (typeof formData.${id} !== 'string' || !formData.${id}.trim()) return ${msg('This field is required')};`
            );
          }
        }

        if (field.type !== 'checkbox' && field.type !== 'file') {
          if (validation.minLength != null) {
            checks.push(
              `if (typeof formData.${id} === 'string' && formData.${id}.trim().length > 0 && formData.${id}.length < ${validation.minLength}) return 'Minimum length is ${validation.minLength}';`
            );
          }
          if (validation.maxLength != null) {
            checks.push(
              `if (typeof formData.${id} === 'string' && formData.${id}.length > ${validation.maxLength}) return 'Maximum length is ${validation.maxLength}';`
            );
          }
          if (validation.pattern) {
            const pat = JSON.stringify(validation.pattern);
            checks.push(
              `if (typeof formData.${id} === 'string' && formData.${id}.trim() && !new RegExp(${pat}).test(formData.${id})) return ${msg('Invalid format')};`
            );
          }
        }

        if (checks.length === 0) return '';

        return `    ${field.id}: () => {\n      ${checks.join('\n      ')}\n      return null;\n    }`;
      })
      .filter(Boolean);

    if (rules.length === 0) return '';

    return `const validators = {\n${rules.join(',\n')}\n  } as const;`;
  }

  /**
   * Generate submit handler
   */
  private generateSubmitHandler(schema: ComponentSchema): string {
    const validatedIds = schema.fields
      .filter((f) => this.fieldHasValidators(f))
      .map((f) => f.id);

    const validationLoop =
      validatedIds.length === 0
        ? ''
        : `  const keysWithValidators = [${validatedIds.map((id) => `'${id}'`).join(', ')}] as const;
  for (const key of keysWithValidators) {
    const err = validators[key]?.();
    if (err) {
      newErrors[key] = err;
      hasErrors = true;
    }
  }
`;

    return `const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof ${schema.name}FormData, string>> = {};
    let hasErrors = false;
${validationLoop}
    setErrors(newErrors);
    if (hasErrors) return;
    console.log('Form submitted:', formData);
    ${schema.props.some((p) => p.name === 'onSubmit') ? 'props.onSubmit?.(formData);' : ''}
  };`;
  }

  /**
   * Generate form fields
   */
  private generateFields(schema: ComponentSchema): string {
    return schema.fields.map(field => {
      switch (field.type) {
        case 'input':
          return this.generateInputField(field);
        case 'textarea':
          return this.generateTextareaField(field);
        case 'select':
          return this.generateSelectField(field);
        case 'checkbox':
          return this.generateCheckboxField(field);
        case 'radio':
          return this.generateRadioField(field);
        default:
          return this.generateInputField(field);
      }
    }).join('\n        \n        ');
  }

  /**
   * Generate input field
   */
  private generateInputField(field: FieldDefinition): string {
    return `<div className="space-y-2">
          <label htmlFor="${field.id}" className="block text-sm font-medium">
            ${field.label}${field.validation?.required ? ' *' : ''}
          </label>
          <input
            id="${field.id}"
            type="text"
            value={formData.${field.id}}
            onChange={(e) => setFormData({ ...formData, ${field.id}: e.target.value })}
            placeholder="${field.placeholder || ''}"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.${field.id} && (
            <p className="text-sm text-red-500">{errors.${field.id}}</p>
          )}
        </div>`;
  }

  /**
   * Generate textarea field
   */
  private generateTextareaField(field: FieldDefinition): string {
    return `<div className="space-y-2">
          <label htmlFor="${field.id}" className="block text-sm font-medium">
            ${field.label}${field.validation?.required ? ' *' : ''}
          </label>
          <textarea
            id="${field.id}"
            value={formData.${field.id}}
            onChange={(e) => setFormData({ ...formData, ${field.id}: e.target.value })}
            placeholder="${field.placeholder || ''}"
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.${field.id} && (
            <p className="text-sm text-red-500">{errors.${field.id}}</p>
          )}
        </div>`;
  }

  /**
   * Generate select field
   */
  private generateSelectField(field: FieldDefinition): string {
    const options = field.options || [];
    return `<div className="space-y-2">
          <label htmlFor="${field.id}" className="block text-sm font-medium">
            ${field.label}${field.validation?.required ? ' *' : ''}
          </label>
          <select
            id="${field.id}"
            value={formData.${field.id}}
            onChange={(e) => setFormData({ ...formData, ${field.id}: e.target.value })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Select an option</option>
            ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n            ')}
          </select>
          {errors.${field.id} && (
            <p className="text-sm text-red-500">{errors.${field.id}}</p>
          )}
        </div>`;
  }

  /**
   * Generate checkbox field
   */
  private generateCheckboxField(field: FieldDefinition): string {
    return `<div className="flex items-center space-x-2">
          <input
            id="${field.id}"
            type="checkbox"
            checked={formData.${field.id}}
            onChange={(e) => setFormData({ ...formData, ${field.id}: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="${field.id}" className="text-sm font-medium">
            ${field.label}${field.validation?.required ? ' *' : ''}
          </label>
        </div>`;
  }

  /**
   * Generate radio field
   */
  private generateRadioField(field: FieldDefinition): string {
    const options = field.options || [];
    return `<div className="space-y-2">
          <label className="block text-sm font-medium">
            ${field.label}${field.validation?.required ? ' *' : ''}
          </label>
          <div className="space-y-2">
            ${options.map(opt => `
            <div className="flex items-center space-x-2">
              <input
                id="${field.id}-${opt.value}"
                type="radio"
                name="${field.id}"
                value="${opt.value}"
                checked={formData.${field.id} === '${opt.value}'}
                onChange={(e) => setFormData({ ...formData, ${field.id}: e.target.value })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="${field.id}-${opt.value}" className="text-sm">
                ${opt.label}
              </label>
            </div>`).join('\n            ')}
          </div>
        </div>`;
  }

  /**
   * Generate simple content for non-form components
   */
  private generateSimpleContent(schema: ComponentSchema): string {
    const muted =
      schema.styling.theme === 'dark'
        ? 'text-slate-400'
        : 'text-slate-600 dark:text-slate-400';
    return `<div className="p-4">
        <h2 className="mb-2 text-2xl font-bold">{props.title || '${schema.name}'}</h2>
        <p className="${muted}">{props.description || '${schema.description}'}</p>
      </div>`;
  }

  /**
   * Generate className based on styling config
   */
  private generateClassName(schema: ComponentSchema): string {
    const classes: string[] = [];
    
    // Base classes
    classes.push('w-full max-w-md mx-auto p-6');
    
    // Theme
    if (schema.styling.theme === 'dark') {
      classes.push('bg-gray-900 text-white');
    } else {
      classes.push('bg-white text-gray-900');
    }
    
    classes.push(this.resolveRoundedClass(schema.styling.borderRadius, 'lg'));
    
    // Spacing
    if (schema.styling.spacing === 'compact') {
      classes.push('space-y-2');
    } else if (schema.styling.spacing === 'relaxed') {
      classes.push('space-y-6');
    } else {
      classes.push('space-y-4');
    }
    
    // Shadow
    classes.push('shadow-lg');
    
    return classes.join(' ');
  }

  /**
   * Generate standalone types file
   */
  private generateStandaloneTypes(schema: ComponentSchema): string {
    return `// Generated types for ${schema.name}
${this.generateTypeDefinitions(schema)}

export default ${schema.name}Props;
`;
  }

  /**
   * Generate CSS styles
   */
  private generateStyles(schema: ComponentSchema): string {
    const primaryColor = schema.styling.primaryColor || '#3b82f6';
    
    return `.${schema.name.toLowerCase()} {
  --primary-color: ${primaryColor};
  --border-radius: ${this.mapBorderRadius(schema.styling.borderRadius || 'md')};
}

.${schema.name.toLowerCase()}:focus-within {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
`;
  }

  /**
   * Format code with basic formatting
   */
  private formatCode(code: string): string {
    // Basic formatting - in production, use Prettier
    return code
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();
  }

  /**
   * Helper: Map prop type to TypeScript type
   */
  private mapPropType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'Record<string, any>',
      'array': 'any[]',
      'function': '(...args: any[]) => void'
    };
    return typeMap[type] || 'any';
  }

  /**
   * Helper: Map field type to TypeScript type
   */
  private mapFieldType(type: string): string {
    const typeMap: Record<string, string> = {
      'input': 'string',
      'textarea': 'string',
      'select': 'string',
      'checkbox': 'boolean',
      'radio': 'string',
      'date': 'string',
      'file': 'File | null'
    };
    return typeMap[type] || 'string';
  }

  /**
   * Helper: Get default value for field
   */
  private getFieldDefaultValue(field: FieldDefinition): string {
    switch (field.type) {
      case 'checkbox':
        return 'false';
      case 'file':
        return 'null';
      default:
        return "''";
    }
  }

  /**
   * Helper: Map border radius to CSS value
   */
  private mapBorderRadius(radius: string): string {
    const radiusMap: Record<string, string> = {
      'none': '0',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      '2xl': '1rem',
      'full': '9999px'
    };
    return radiusMap[radius] || '0.375rem';
  }

  /**
   * Helper: Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Convenience function to generate code from schema
 */
export function generateCode(schema: ComponentSchema): GeneratedCode {
  const builder = new CodeBuilder();
  return builder.generateReactComponent(schema);
}

// Made with Bob