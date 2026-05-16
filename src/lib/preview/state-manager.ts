/**
 * Preview State Manager
 * 
 * Manages preview state, form data, validation, and change notifications.
 * Provides a centralized state management system for the preview system.
 */

import type { ComponentSchema, FieldDefinition } from '../watsonx/types';
import type { PreviewState, StateChangeListener, ValidationResult } from './types';
import { DEFAULT_PREVIEW_STATE } from './types';
import { resolveValidationConfig } from '@/lib/tuning/behavior-schema';

/**
 * Preview State Manager Class
 * 
 * Handles all state management for the preview system including:
 * - Form data tracking
 * - Validation logic
 * - Error management
 * - Change notifications
 */
export class PreviewStateManager {
  private state: PreviewState;
  private schema: ComponentSchema;
  private listeners: Set<StateChangeListener>;
  private validationTimeouts: Map<string, NodeJS.Timeout>;

  constructor(schema: ComponentSchema, initialState?: Partial<PreviewState>) {
    this.schema = schema;
    this.listeners = new Set();
    this.validationTimeouts = new Map();
    this.state = this.initializeState(initialState);
  }

  /**
   * Initialize state with defaults and initial values
   */
  private initializeState(initialState?: Partial<PreviewState>): PreviewState {
    const formData: Record<string, any> = {};
    for (const field of this.schema.fields) {
      if (field.type === 'checkbox') {
        formData[field.id] = false;
      } else if (field.type === 'select' && field.options && field.options.length > 0) {
        formData[field.id] = field.options[0].value;
      } else {
        formData[field.id] = '';
      }
    }

    return {
      ...DEFAULT_PREVIEW_STATE,
      ...initialState,
      formData: {
        ...formData,
        ...(initialState?.formData || {})
      }
    };
  }

  /**
   * Get current state (immutable copy)
   */
  getState(): PreviewState {
    return {
      ...this.state,
      formData: { ...this.state.formData },
      errors: { ...this.state.errors }
    };
  }

  /**
   * Update a single field value (validation timing follows schema.validation.showErrors).
   */
  updateField(fieldId: string, value: any): void {
    const field = this.schema.fields.find((f) => f.id === fieldId);
    if (!field) {
      console.warn(`Field ${fieldId} not found in schema`);
      return;
    }

    this.state.formData[fieldId] = value;

    const existingTimeout = this.validationTimeouts.get(fieldId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.validationTimeouts.delete(fieldId);
    }

    const { showErrors, validateDebounceMs } = resolveValidationConfig(this.schema);

    if (showErrors === 'onChange') {
      const ms = validateDebounceMs;
      if (ms === 0) {
        this.validateField(fieldId);
      } else {
        const timeout = setTimeout(() => {
          this.validateField(fieldId);
          this.validationTimeouts.delete(fieldId);
        }, ms);
        this.validationTimeouts.set(fieldId, timeout);
      }
    } else if (showErrors === 'onBlur' || showErrors === 'onSubmit') {
      delete this.state.errors[fieldId];
    }

    this.notifyListeners();
  }

  /**
   * Run validation for one field (e.g. on blur when showErrors is onBlur/onChange).
   */
  blurField(fieldId: string): void {
    const field = this.schema.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const existingTimeout = this.validationTimeouts.get(fieldId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.validationTimeouts.delete(fieldId);
    }

    const { showErrors } = resolveValidationConfig(this.schema);
    if (showErrors === 'onBlur' || showErrors === 'onChange') {
      this.validateField(fieldId);
    }

    this.notifyListeners();
  }

  /**
   * First field id with an error, in schema field order (visible / non-conditional skipped same as validateAll).
   */
  getFirstInvalidFieldIdInOrder(): string | null {
    for (const field of this.schema.fields) {
      if (field.conditional && !this.shouldShowField(field)) continue;
      if (this.state.errors[field.id]) return field.id;
    }
    return null;
  }

  /**
   * Update multiple fields at once
   */
  updateFields(updates: Record<string, any>): void {
    for (const [fieldId, value] of Object.entries(updates)) {
      this.state.formData[fieldId] = value;
    }
    this.validateAll();
    this.notifyListeners();
  }

  /**
   * Validate a single field
   */
  validateField(fieldId: string): ValidationResult {
    const field = this.schema.fields.find(f => f.id === fieldId);
    if (!field || !field.validation) {
      // No validation rules, field is valid
      delete this.state.errors[fieldId];
      return { isValid: true };
    }

    const value = this.state.formData[fieldId];
    const validation = field.validation;

    // Required validation
    if (validation.required && !value) {
      const error = validation.message || `${field.label} is required`;
      this.state.errors[fieldId] = error;
      return { isValid: false, error };
    }

    // Skip other validations if field is empty and not required
    if (!value && !validation.required) {
      delete this.state.errors[fieldId];
      return { isValid: true };
    }

    // Min length validation
    if (validation.minLength && value.length < validation.minLength) {
      const error = validation.message || `${field.label} must be at least ${validation.minLength} characters`;
      this.state.errors[fieldId] = error;
      return { isValid: false, error };
    }

    // Max length validation
    if (validation.maxLength && value.length > validation.maxLength) {
      const error = validation.message || `${field.label} must be at most ${validation.maxLength} characters`;
      this.state.errors[fieldId] = error;
      return { isValid: false, error };
    }

    // Pattern validation (regex)
    if (validation.pattern) {
      try {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          const error = validation.message || `${field.label} format is invalid`;
          this.state.errors[fieldId] = error;
          return { isValid: false, error };
        }
      } catch (e) {
        console.error(`Invalid regex pattern for field ${fieldId}:`, validation.pattern);
      }
    }

    // Field is valid, clear any errors
    delete this.state.errors[fieldId];
    return { isValid: true };
  }

  /**
   * Validate all fields
   */
  validateAll(): boolean {
    let isValid = true;

    for (const field of this.schema.fields) {
      // Skip conditional fields that shouldn't be shown
      if (field.conditional && !this.shouldShowField(field)) {
        delete this.state.errors[field.id];
        continue;
      }

      const result = this.validateField(field.id);
      if (!result.isValid) {
        isValid = false;
      }
    }

    this.notifyListeners();
    return isValid;
  }

  /**
   * Check if a conditional field should be shown
   */
  private shouldShowField(field: FieldDefinition): boolean {
    if (!field.conditional) return true;

    const { field: conditionField, value: conditionValue } = field.conditional;
    const actualValue = this.state.formData[conditionField];

    return actualValue === conditionValue;
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.state.errors = {};
    this.notifyListeners();
  }

  /**
   * Clear error for specific field
   */
  clearFieldError(fieldId: string): void {
    delete this.state.errors[fieldId];
    this.notifyListeners();
  }

  /**
   * Reset form data to initial values
   */
  resetFormData(): void {
    const formData: Record<string, any> = {};
    for (const field of this.schema.fields) {
      if (field.type === 'checkbox') {
        formData[field.id] = false;
      } else if (field.type === 'select' && field.options && field.options.length > 0) {
        formData[field.id] = field.options[0].value;
      } else {
        formData[field.id] = '';
      }
    }

    this.state.formData = formData;
    this.state.errors = {};
    this.notifyListeners();
  }

  /**
   * Update viewport
   */
  setViewport(viewport: PreviewState['viewport']): void {
    this.state.viewport = viewport;
    this.notifyListeners();
  }

  /**
   * Update theme
   */
  setTheme(theme: PreviewState['theme']): void {
    this.state.theme = theme;
    this.notifyListeners();
  }

  /**
   * Update zoom level (50-200%)
   */
  setZoom(zoom: number): void {
    this.state.zoom = Math.max(50, Math.min(200, zoom));
    this.notifyListeners();
  }

  /**
   * Update render mode
   */
  setMode(mode: PreviewState['mode']): void {
    this.state.mode = mode;
    this.notifyListeners();
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
    this.notifyListeners();
  }

  /**
   * Set error state
   */
  setError(error: Error | null): void {
    this.state.error = error;
    this.notifyListeners();
  }

  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  /**
   * Get form data for submission
   */
  getFormData(): Record<string, any> {
    return { ...this.state.formData };
  }

  /**
   * Get validation errors
   */
  getErrors(): Record<string, string> {
    return { ...this.state.errors };
  }

  /**
   * Check if form has any errors
   */
  hasErrors(): boolean {
    return Object.keys(this.state.errors).length > 0;
  }

  /**
   * Get visible fields (respecting conditional logic)
   */
  getVisibleFields(): FieldDefinition[] {
    return this.schema.fields.filter(field => this.shouldShowField(field));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Clear all validation timeouts
    this.validationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.validationTimeouts.clear();
    
    // Clear all listeners
    this.listeners.clear();
  }
}

/**
 * Create a new preview state manager instance
 */
export function createPreviewStateManager(
  schema: ComponentSchema,
  initialState?: Partial<PreviewState>
): PreviewStateManager {
  return new PreviewStateManager(schema, initialState);
}

// Made with Bob