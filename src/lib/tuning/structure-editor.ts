/**
 * Structure Editor
 * 
 * Manages field operations for component schemas including add, remove, reorder,
 * and modify operations. Handles layout changes and field validation.
 */

import type { ComponentSchema, FieldDefinition } from '@/lib/watsonx/types';

/**
 * Structure Editor Class
 * 
 * Provides methods for modifying component structure
 */
export class StructureEditor {
  /**
   * Add a new field to the schema
   */
  addField(
    schema: ComponentSchema,
    field: FieldDefinition,
    position?: number
  ): ComponentSchema {
    const updatedSchema = { ...schema };
    const fields = [...schema.fields];

    // Ensure field has a unique ID
    if (!field.id) {
      field.id = this.generateFieldId(fields);
    }

    // Validate field doesn't already exist
    if (fields.some(f => f.id === field.id)) {
      throw new Error(`Field with ID "${field.id}" already exists`);
    }

    // Insert at position or append
    if (position !== undefined && position >= 0 && position <= fields.length) {
      fields.splice(position, 0, field);
    } else {
      fields.push(field);
    }

    updatedSchema.fields = fields;
    return updatedSchema;
  }

  /**
   * Remove a field from the schema
   */
  removeField(
    schema: ComponentSchema,
    fieldId: string
  ): ComponentSchema {
    const updatedSchema = { ...schema };
    const fields = schema.fields.filter(f => f.id !== fieldId);

    if (fields.length === schema.fields.length) {
      throw new Error(`Field with ID "${fieldId}" not found`);
    }

    updatedSchema.fields = fields;
    return updatedSchema;
  }

  /**
   * Reorder fields based on new order array
   */
  reorderFields(
    schema: ComponentSchema,
    newOrder: string[]
  ): ComponentSchema {
    const updatedSchema = { ...schema };
    const fieldMap = new Map(schema.fields.map(f => [f.id, f]));

    // Validate all field IDs exist
    const missingIds = newOrder.filter(id => !fieldMap.has(id));
    if (missingIds.length > 0) {
      throw new Error(`Fields not found: ${missingIds.join(', ')}`);
    }

    // Validate all fields are included
    if (newOrder.length !== schema.fields.length) {
      throw new Error('New order must include all fields');
    }

    // Create new ordered array
    updatedSchema.fields = newOrder
      .map(id => fieldMap.get(id))
      .filter(Boolean) as FieldDefinition[];

    return updatedSchema;
  }

  /**
   * Move a field up in the order
   */
  moveFieldUp(
    schema: ComponentSchema,
    fieldId: string
  ): ComponentSchema {
    const index = schema.fields.findIndex(f => f.id === fieldId);
    
    if (index === -1) {
      throw new Error(`Field with ID "${fieldId}" not found`);
    }

    if (index === 0) {
      // Already at the top
      return schema;
    }

    const newOrder = schema.fields.map(f => f.id);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    return this.reorderFields(schema, newOrder);
  }

  /**
   * Move a field down in the order
   */
  moveFieldDown(
    schema: ComponentSchema,
    fieldId: string
  ): ComponentSchema {
    const index = schema.fields.findIndex(f => f.id === fieldId);
    
    if (index === -1) {
      throw new Error(`Field with ID "${fieldId}" not found`);
    }

    if (index === schema.fields.length - 1) {
      // Already at the bottom
      return schema;
    }

    const newOrder = schema.fields.map(f => f.id);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    return this.reorderFields(schema, newOrder);
  }

  /**
   * Modify field properties
   */
  modifyField(
    schema: ComponentSchema,
    fieldId: string,
    changes: Partial<FieldDefinition>
  ): ComponentSchema {
    const updatedSchema = { ...schema };
    const fieldIndex = updatedSchema.fields.findIndex(f => f.id === fieldId);

    if (fieldIndex === -1) {
      throw new Error(`Field with ID "${fieldId}" not found`);
    }

    // Don't allow changing the field ID
    if (changes.id && changes.id !== fieldId) {
      throw new Error('Cannot change field ID');
    }

    // Merge changes with existing field (deep-merge layout bucket)
    updatedSchema.fields = [...schema.fields];
    const prevField = schema.fields[fieldIndex];
    const mergedLayout =
      changes.layout !== undefined || prevField.layout
        ? { ...prevField.layout, ...changes.layout }
        : undefined;
    updatedSchema.fields[fieldIndex] = {
      ...prevField,
      ...changes,
      id: fieldId,
      ...(mergedLayout !== undefined ? { layout: mergedLayout } : {}),
    };

    return updatedSchema;
  }

  /**
   * Change the layout of the component
   */
  changeLayout(
    schema: ComponentSchema,
    layout: 'single-column' | 'two-column' | 'grid' | 'custom'
  ): ComponentSchema {
    return {
      ...schema,
      layout,
    };
  }

  /**
   * Duplicate a field
   */
  duplicateField(
    schema: ComponentSchema,
    fieldId: string
  ): ComponentSchema {
    const field = schema.fields.find(f => f.id === fieldId);
    
    if (!field) {
      throw new Error(`Field with ID "${fieldId}" not found`);
    }

    // Create a copy with a new ID
    const duplicatedField: FieldDefinition = {
      ...field,
      id: this.generateFieldId(schema.fields),
      label: `${field.label} (Copy)`,
    };

    // Insert after the original field
    const position = schema.fields.findIndex(f => f.id === fieldId) + 1;
    return this.addField(schema, duplicatedField, position);
  }

  /**
   * Get field by ID
   */
  getField(
    schema: ComponentSchema,
    fieldId: string
  ): FieldDefinition | undefined {
    return schema.fields.find(f => f.id === fieldId);
  }

  /**
   * Check if field exists
   */
  hasField(
    schema: ComponentSchema,
    fieldId: string
  ): boolean {
    return schema.fields.some(f => f.id === fieldId);
  }

  /**
   * Get field index
   */
  getFieldIndex(
    schema: ComponentSchema,
    fieldId: string
  ): number {
    return schema.fields.findIndex(f => f.id === fieldId);
  }

  /**
   * Validate field definition
   */
  validateField(field: Partial<FieldDefinition>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!field.id) {
      errors.push('Field ID is required');
    }

    if (!field.type) {
      errors.push('Field type is required');
    }

    if (!field.label) {
      errors.push('Field label is required');
    }

    // Validate field type
    const validTypes = ['input', 'select', 'textarea', 'checkbox', 'radio', 'date', 'file'];
    if (field.type && !validTypes.includes(field.type)) {
      errors.push(`Invalid field type: ${field.type}`);
    }

    // Validate select/radio options
    if ((field.type === 'select' || field.type === 'radio') && (!field.options || field.options.length === 0)) {
      errors.push(`${field.type} field must have options`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a new field with default values
   */
  createDefaultField(
    type: FieldDefinition['type'],
    existingFields: FieldDefinition[]
  ): FieldDefinition {
    const id = this.generateFieldId(existingFields);
    const label = this.generateFieldLabel(type, existingFields);

    const baseField: FieldDefinition = {
      id,
      type,
      label,
      placeholder: `Enter ${label.toLowerCase()}`,
    };

    // Add type-specific defaults
    switch (type) {
      case 'select':
      case 'radio':
        return {
          ...baseField,
          options: [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
          ],
        };

      case 'checkbox':
        return {
          ...baseField,
          placeholder: undefined,
        };

      case 'textarea':
        return {
          ...baseField,
          placeholder: `Enter ${label.toLowerCase()}...`,
        };

      case 'date':
        return {
          ...baseField,
          placeholder: 'Select date',
        };

      case 'file':
        return {
          ...baseField,
          placeholder: 'Choose file',
        };

      default:
        return baseField;
    }
  }

  /**
   * Generate a unique field ID
   */
  private generateFieldId(existingFields: FieldDefinition[]): string {
    const existingIds = new Set(existingFields.map(f => f.id));
    let counter = existingFields.length + 1;
    let id = `field_${counter}`;

    while (existingIds.has(id)) {
      counter++;
      id = `field_${counter}`;
    }

    return id;
  }

  /**
   * Generate a field label based on type
   */
  private generateFieldLabel(
    type: FieldDefinition['type'],
    existingFields: FieldDefinition[]
  ): string {
    const typeLabels: Record<FieldDefinition['type'], string> = {
      input: 'Text Field',
      textarea: 'Text Area',
      select: 'Dropdown',
      checkbox: 'Checkbox',
      radio: 'Radio Group',
      date: 'Date',
      file: 'File Upload',
    };

    const baseLabel = typeLabels[type] || 'Field';
    const existingLabels = new Set(existingFields.map(f => f.label));
    
    if (!existingLabels.has(baseLabel)) {
      return baseLabel;
    }

    let counter = 2;
    let label = `${baseLabel} ${counter}`;

    while (existingLabels.has(label)) {
      counter++;
      label = `${baseLabel} ${counter}`;
    }

    return label;
  }

  /**
   * Update field validation rules
   */
  updateFieldValidation(
    schema: ComponentSchema,
    fieldId: string,
    validation: FieldDefinition['validation']
  ): ComponentSchema {
    return this.modifyField(schema, fieldId, { validation });
  }

  /**
   * Update field conditional logic
   */
  updateFieldConditional(
    schema: ComponentSchema,
    fieldId: string,
    conditional: FieldDefinition['conditional']
  ): ComponentSchema {
    return this.modifyField(schema, fieldId, { conditional });
  }

  /**
   * Clear all conditional logic from a field
   */
  clearFieldConditional(
    schema: ComponentSchema,
    fieldId: string
  ): ComponentSchema {
    return this.modifyField(schema, fieldId, { conditional: undefined });
  }

  /**
   * Get fields that depend on a specific field (via conditional logic)
   */
  getDependentFields(
    schema: ComponentSchema,
    fieldId: string
  ): FieldDefinition[] {
    return schema.fields.filter(
      f => f.conditional && f.conditional.field === fieldId
    );
  }

  /**
   * Check if a field can be safely removed (no dependencies)
   */
  canRemoveField(
    schema: ComponentSchema,
    fieldId: string
  ): { canRemove: boolean; reason?: string } {
    const dependentFields = this.getDependentFields(schema, fieldId);

    if (dependentFields.length > 0) {
      return {
        canRemove: false,
        reason: `Cannot remove: ${dependentFields.length} field(s) depend on this field`,
      };
    }

    return { canRemove: true };
  }

  /**
   * Remove field and clear dependencies
   */
  removeFieldWithDependencies(
    schema: ComponentSchema,
    fieldId: string
  ): ComponentSchema {
    let updatedSchema = { ...schema };

    // Clear conditional logic from dependent fields
    const dependentFields = this.getDependentFields(schema, fieldId);
    dependentFields.forEach(field => {
      updatedSchema = this.clearFieldConditional(updatedSchema, field.id);
    });

    // Remove the field
    updatedSchema = this.removeField(updatedSchema, fieldId);

    return updatedSchema;
  }

  /**
   * Get field statistics
   */
  getFieldStats(schema: ComponentSchema): {
    total: number;
    byType: Record<string, number>;
    required: number;
    conditional: number;
  } {
    const stats = {
      total: schema.fields.length,
      byType: {} as Record<string, number>,
      required: 0,
      conditional: 0,
    };

    schema.fields.forEach(field => {
      // Count by type
      stats.byType[field.type] = (stats.byType[field.type] || 0) + 1;

      // Count required
      if (field.validation?.required) {
        stats.required++;
      }

      // Count conditional
      if (field.conditional) {
        stats.conditional++;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const structureEditor = new StructureEditor();

// Made with Bob