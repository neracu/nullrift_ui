/**
 * Style Transformer
 * 
 * Applies style overrides to component schemas and generates updated Tailwind classes.
 * Handles color customization, spacing, borders, typography, and custom classes.
 */

import type { ComponentSchema, StylingConfig } from '@/lib/watsonx/types';
import type { StyleOverrides } from '@/types/tuning';

/**
 * Style Transformer Class
 * 
 * Transforms component styling based on user-defined overrides
 */
export class StyleTransformer {
  /**
   * Apply style overrides to a component schema
   */
  applyStyleOverrides(
    schema: ComponentSchema,
    overrides: StyleOverrides
  ): ComponentSchema {
    const updatedSchema: ComponentSchema = {
      ...schema,
      styling: {
        ...schema.styling,
        ...this.convertOverridesToStyling(overrides),
      },
    };

    return updatedSchema;
  }

  /**
   * Convert style overrides to StylingConfig format.
   * Uses `in` so explicit `undefined` from the panel resets merged styling keys.
   */
  private convertOverridesToStyling(overrides: StyleOverrides): Partial<StylingConfig> {
    const styling: Partial<StylingConfig> = {};

    if ('borderRadius' in overrides) {
      styling.borderRadius = overrides.borderRadius;
    }

    if ('spacing' in overrides) {
      styling.spacing = overrides.spacing;
    }

    if ('primaryColor' in overrides) {
      styling.primaryColor = overrides.primaryColor;
    }

    if ('secondaryColor' in overrides) {
      styling.secondaryColor = overrides.secondaryColor;
    }

    if ('backgroundColor' in overrides) {
      styling.backgroundColor = overrides.backgroundColor;
    }

    if ('textColor' in overrides) {
      styling.textColor = overrides.textColor;
    }

    if ('fontFamily' in overrides) {
      styling.fontFamily = overrides.fontFamily;
    }

    if ('fontSize' in overrides) {
      styling.fontSize = overrides.fontSize;
    }

    if ('customClasses' in overrides) {
      styling.customClasses = overrides.customClasses;
    }

    return styling;
  }

  /**
   * Generate Tailwind classes from style overrides
   */
  generateTailwindClasses(overrides: StyleOverrides): string[] {
    const classes: string[] = [];

    // Border radius
    if (overrides.borderRadius && overrides.borderRadius !== 'none') {
      classes.push(`rounded-${overrides.borderRadius}`);
    }

    // Spacing
    if (overrides.spacing) {
      const spacingClasses = this.getSpacingClasses(overrides.spacing);
      classes.push(...spacingClasses);
    }

    // Font family
    if (overrides.fontFamily) {
      classes.push(`font-${overrides.fontFamily}`);
    }

    // Font size
    if (overrides.fontSize) {
      classes.push(`text-${overrides.fontSize}`);
    }

    // Custom classes
    if (overrides.customClasses) {
      classes.push(...overrides.customClasses);
    }

    return classes;
  }

  /**
   * Get spacing classes based on preset
   */
  private getSpacingClasses(spacing: 'compact' | 'normal' | 'relaxed'): string[] {
    switch (spacing) {
      case 'compact':
        return ['space-y-2', 'p-4', 'gap-2'];
      case 'relaxed':
        return ['space-y-6', 'p-8', 'gap-6'];
      case 'normal':
      default:
        return ['space-y-4', 'p-6', 'gap-4'];
    }
  }

  /**
   * Update component code with new styles
   * 
   * This is a simplified implementation that updates className attributes.
   * For production, consider using an AST parser for more robust transformations.
   */
  updateComponentCode(
    code: string,
    overrides: StyleOverrides
  ): string {
    let updatedCode = code;

    // Generate new classes
    const newClasses = this.generateTailwindClasses(overrides);
    
    if (newClasses.length === 0) {
      return updatedCode;
    }

    // Find and update form wrapper className
    // This is a simplified regex-based approach
    const formClassRegex = /className="([^"]*form[^"]*)"/g;
    updatedCode = updatedCode.replace(formClassRegex, (match, existingClasses) => {
      const mergedClasses = this.mergeClasses(existingClasses, newClasses);
      return `className="${mergedClasses}"`;
    });

    // Update container className if present
    const containerClassRegex = /className="([^"]*container[^"]*)"/g;
    updatedCode = updatedCode.replace(containerClassRegex, (match, existingClasses) => {
      const mergedClasses = this.mergeClasses(existingClasses, newClasses);
      return `className="${mergedClasses}"`;
    });

    // Apply color overrides via CSS variables (if colors are specified)
    if (overrides.primaryColor || overrides.secondaryColor || overrides.backgroundColor) {
      updatedCode = this.injectColorVariables(updatedCode, overrides);
    }

    return updatedCode;
  }

  /**
   * Merge existing classes with new classes, avoiding duplicates
   */
  private mergeClasses(existing: string, newClasses: string[]): string {
    const existingArray = existing.split(' ').filter(Boolean);
    const merged = new Set([...existingArray]);

    // Remove conflicting classes before adding new ones
    newClasses.forEach(newClass => {
      // Remove conflicting rounded-* classes
      if (newClass.startsWith('rounded-')) {
        existingArray.forEach(cls => {
          if (cls.startsWith('rounded-')) {
            merged.delete(cls);
          }
        });
      }

      // Remove conflicting space-y-* classes
      if (newClass.startsWith('space-y-')) {
        existingArray.forEach(cls => {
          if (cls.startsWith('space-y-')) {
            merged.delete(cls);
          }
        });
      }

      // Remove conflicting p-* classes
      if (newClass.startsWith('p-')) {
        existingArray.forEach(cls => {
          if (cls.startsWith('p-') && cls.length <= 4) {
            merged.delete(cls);
          }
        });
      }

      // Remove conflicting gap-* classes
      if (newClass.startsWith('gap-')) {
        existingArray.forEach(cls => {
          if (cls.startsWith('gap-')) {
            merged.delete(cls);
          }
        });
      }

      // Remove conflicting font-* classes
      if (newClass.startsWith('font-')) {
        existingArray.forEach(cls => {
          if (cls.startsWith('font-') && !cls.includes('font-bold') && !cls.includes('font-semibold')) {
            merged.delete(cls);
          }
        });
      }

      // Remove conflicting text-* size classes
      if (newClass.startsWith('text-') && (newClass.includes('sm') || newClass.includes('base') || newClass.includes('lg'))) {
        existingArray.forEach(cls => {
          if (cls.startsWith('text-') && (cls.includes('sm') || cls.includes('base') || cls.includes('lg'))) {
            merged.delete(cls);
          }
        });
      }

      merged.add(newClass);
    });

    return Array.from(merged).join(' ');
  }

  /**
   * Inject color variables into the code
   */
  private injectColorVariables(code: string, overrides: StyleOverrides): string {
    const styleVars: string[] = [];

    if (overrides.primaryColor) {
      styleVars.push(`--color-primary: ${overrides.primaryColor}`);
    }

    if (overrides.secondaryColor) {
      styleVars.push(`--color-secondary: ${overrides.secondaryColor}`);
    }

    if (overrides.backgroundColor) {
      styleVars.push(`--color-background: ${overrides.backgroundColor}`);
    }

    if (overrides.textColor) {
      styleVars.push(`--color-text: ${overrides.textColor}`);
    }

    if (styleVars.length === 0) {
      return code;
    }

    // Create style tag with CSS variables
    const styleTag = `
  <style>
    :root {
      ${styleVars.join(';\n      ')};
    }
  </style>`;

    // Insert style tag before the closing </head> or at the start of the component
    if (code.includes('</head>')) {
      return code.replace('</head>', `${styleTag}\n</head>`);
    } else {
      // For components without <head>, add inline style
      return styleTag + '\n' + code;
    }
  }

  /**
   * Generate CSS for color overrides
   */
  generateColorCSS(overrides: StyleOverrides): string {
    const cssRules: string[] = [];

    if (overrides.primaryColor) {
      cssRules.push(`.text-primary { color: ${overrides.primaryColor}; }`);
      cssRules.push(`.bg-primary { background-color: ${overrides.primaryColor}; }`);
      cssRules.push(`.border-primary { border-color: ${overrides.primaryColor}; }`);
    }

    if (overrides.secondaryColor) {
      cssRules.push(`.text-secondary { color: ${overrides.secondaryColor}; }`);
      cssRules.push(`.bg-secondary { background-color: ${overrides.secondaryColor}; }`);
      cssRules.push(`.border-secondary { border-color: ${overrides.secondaryColor}; }`);
    }

    if (overrides.backgroundColor) {
      cssRules.push(`.bg-custom { background-color: ${overrides.backgroundColor}; }`);
    }

    if (overrides.textColor) {
      cssRules.push(`.text-custom { color: ${overrides.textColor}; }`);
    }

    return cssRules.join('\n');
  }

  /**
   * Apply style overrides to a specific field in the schema
   */
  applyFieldStyles(
    schema: ComponentSchema,
    fieldId: string,
    overrides: Partial<StyleOverrides>
  ): ComponentSchema {
    const updatedSchema = { ...schema };
    const fieldIndex = updatedSchema.fields.findIndex(f => f.id === fieldId);

    if (fieldIndex === -1) {
      return schema;
    }

    // For now, field-specific styling is stored in the field's validation object
    // This can be extended based on requirements
    const field = { ...updatedSchema.fields[fieldIndex] };
    
    // Store style overrides in a custom property (extend FieldDefinition if needed)
    (field as any).styleOverrides = overrides;
    
    updatedSchema.fields[fieldIndex] = field;

    return updatedSchema;
  }

  /**
   * Reset all style overrides
   */
  resetStyles(schema: ComponentSchema): ComponentSchema {
    return {
      ...schema,
      styling: {
        theme: schema.styling.theme,
        // Reset to defaults
        borderRadius: 'md',
        spacing: 'normal',
        primaryColor: undefined,
        secondaryColor: undefined,
        backgroundColor: undefined,
        textColor: undefined,
        fontSize: undefined,
        fontFamily: undefined,
        customClasses: [],
      },
    };
  }

  /**
   * Get default Tailwind classes for a component type
   */
  getDefaultClasses(category?: string): string[] {
    switch (category) {
      case 'form':
        return ['space-y-4', 'p-6', 'rounded-lg', 'bg-white', 'shadow-md'];
      case 'card':
        return ['rounded-lg', 'p-6', 'bg-white', 'shadow-sm', 'border'];
      case 'modal':
        return ['rounded-xl', 'p-8', 'bg-white', 'shadow-2xl', 'max-w-md'];
      default:
        return ['rounded-md', 'p-4'];
    }
  }

  /**
   * Validate color format (hex)
   */
  isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Convert color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Get contrast color (black or white) for a given background color
   */
  getContrastColor(backgroundColor: string): string {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}

// Export singleton instance
export const styleTransformer = new StyleTransformer();

// Made with Bob