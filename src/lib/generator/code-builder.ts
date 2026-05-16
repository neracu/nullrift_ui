/**
 * Code Generator for Component Schemas
 * 
 * Transforms ComponentSchema into production-ready React TSX code
 * with TypeScript types, validation logic, and proper formatting.
 */

import type { ComponentSchema, FieldDefinition, PropDefinition } from '../watsonx/types';

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
    const imports: string[] = [
      `import React, { useState } from 'react';`
    ];

    // Add form-related imports if needed
    if (schema.fields.length > 0) {
      imports.push(`import { useForm } from 'react-hook-form';`);
    }

    // Add icon imports if needed
    const needsIcons = schema.fields.some(f => f.type === 'checkbox' || f.type === 'radio');
    if (needsIcons) {
      imports.push(`import { Check, X } from 'lucide-react';`);
    }

    return imports.join('\n');
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

    return `export function ${schema.name}(props: ${schema.name}Props) {
  ${stateHooks}

  ${handleSubmit}

  return (
    <div className="${className}">
      <form onSubmit={handleSubmit} className="space-y-4">
        ${fields}
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-${schema.styling.primaryColor || 'blue-500'} text-white rounded-${schema.styling.borderRadius || 'md'} hover:opacity-90 transition-opacity"
        >
          Submit
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
      .filter(field => field.validation)
      .map(field => {
        const validation = field.validation!;
        const checks: string[] = [];

        if (validation.required) {
          checks.push(`if (!formData.${field.id}) return '${validation.message || 'This field is required'}';`);
        }

        if (validation.minLength) {
          checks.push(`if (formData.${field.id}.length < ${validation.minLength}) return 'Minimum length is ${validation.minLength}';`);
        }

        if (validation.maxLength) {
          checks.push(`if (formData.${field.id}.length > ${validation.maxLength}) return 'Maximum length is ${validation.maxLength}';`);
        }

        if (validation.pattern) {
          checks.push(`if (!/${validation.pattern}/.test(formData.${field.id})) return '${validation.message || 'Invalid format'}';`);
        }

        if (checks.length === 0) return '';

        return `    ${field.id}: () => {\n      ${checks.join('\n      ')}\n      return null;\n    }`;
      })
      .filter(Boolean);

    if (rules.length === 0) return '';

    return `const validators = {\n${rules.join(',\n')}\n  };`;
  }

  /**
   * Generate submit handler
   */
  private generateSubmitHandler(schema: ComponentSchema): string {
    return `const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<Record<keyof ${schema.name}FormData, string>> = {};
    let hasErrors = false;
    
    ${schema.fields.filter(f => f.validation).map(field => `
    const ${field.id}Error = validate${this.capitalize(field.id)}(formData.${field.id});
    if (${field.id}Error) {
      newErrors.${field.id} = ${field.id}Error;
      hasErrors = true;
    }`).join('')}
    
    setErrors(newErrors);
    
    if (hasErrors) return;
    
    // Submit form
    console.log('Form submitted:', formData);
    ${schema.props.some(p => p.name === 'onSubmit') ? 'props.onSubmit?.(formData);' : ''}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    return `<div className="p-4">
        <h2 className="text-2xl font-bold mb-2">{props.title || '${schema.name}'}</h2>
        <p className="text-gray-600">{props.description || '${schema.description}'}</p>
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
    
    // Border radius
    classes.push(`rounded-${schema.styling.borderRadius || 'lg'}`);
    
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