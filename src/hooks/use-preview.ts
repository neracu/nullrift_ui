/**
 * usePreview Hook
 * 
 * React hook for managing preview state with the PreviewStateManager.
 * Provides a clean API for components to interact with preview state.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ComponentSchema } from '@/lib/watsonx/types';
import { PreviewStateManager } from '@/lib/preview/state-manager';
import type { PreviewState, ViewportSize, PreviewTheme, RenderMode } from '@/lib/preview/types';
import { resolveValidationConfig } from '@/lib/tuning/behavior-schema';

/**
 * Hook options
 */
export interface UsePreviewOptions {
  /** Initial preview state */
  initialState?: Partial<PreviewState>;
  
  /** Callback when state changes */
  onStateChange?: (state: PreviewState) => void;
  
  /** Callback when form is submitted */
  onSubmit?: (data: Record<string, any>) => void;
  
  /** Callback when validation fails */
  onValidationError?: (errors: Record<string, string>) => void;
}

/**
 * Hook return value
 */
export interface UsePreviewReturn {
  /** Current preview state */
  state: PreviewState;
  
  /** Update a single field value */
  updateField: (fieldId: string, value: any) => void;
  
  /** Update multiple fields at once */
  updateFields: (updates: Record<string, any>) => void;
  
  /** Set viewport size */
  setViewport: (viewport: ViewportSize) => void;
  
  /** Set theme */
  setTheme: (theme: PreviewTheme) => void;
  
  /** Set zoom level */
  setZoom: (zoom: number) => void;
  
  /** Set render mode */
  setMode: (mode: RenderMode) => void;
  
  /** Validate all fields */
  validateAll: () => boolean;
  
  /** Clear all errors */
  clearErrors: () => void;
  
  /** Clear specific field error */
  clearFieldError: (fieldId: string) => void;

  /** Notify manager that a field lost focus (blur validation). */
  blurField: (fieldId: string) => void;
  
  /** Reset form to initial state */
  reset: () => void;
  
  /** Submit form */
  submit: () => void;
  
  /** Get form data */
  getFormData: () => Record<string, any>;
  
  /** Check if form has errors */
  hasErrors: () => boolean;
  
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  
  /** Set error state */
  setError: (error: Error | null) => void;
}

/**
 * usePreview Hook
 * 
 * Manages preview state for a component schema
 */
export function usePreview(
  schema: ComponentSchema,
  options: UsePreviewOptions = {}
): UsePreviewReturn {
  const { initialState, onStateChange, onSubmit, onValidationError } = options;
  
  // State manager instance (persists across renders)
  const stateManagerRef = useRef<PreviewStateManager | null>(null);
  
  // React state for triggering re-renders
  const [state, setState] = useState<PreviewState>(() => {
    const manager = new PreviewStateManager(schema, initialState);
    stateManagerRef.current = manager;
    return manager.getState();
  });

  // Initialize state manager and subscribe to changes
  useEffect(() => {
    const manager = new PreviewStateManager(schema, initialState);
    stateManagerRef.current = manager;
    
    // Subscribe to state changes
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
      onStateChange?.(newState);
    });
    
    // Set initial state
    setState(manager.getState());
    
    // Cleanup
    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, [schema, initialState, onStateChange]);

  /**
   * Update a single field value
   */
  const updateField = useCallback((fieldId: string, value: any) => {
    stateManagerRef.current?.updateField(fieldId, value);
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates: Record<string, any>) => {
    stateManagerRef.current?.updateFields(updates);
  }, []);

  /**
   * Set viewport size
   */
  const setViewport = useCallback((viewport: ViewportSize) => {
    stateManagerRef.current?.setViewport(viewport);
  }, []);

  /**
   * Set theme
   */
  const setTheme = useCallback((theme: PreviewTheme) => {
    stateManagerRef.current?.setTheme(theme);
  }, []);

  /**
   * Set zoom level (50-200%)
   */
  const setZoom = useCallback((zoom: number) => {
    stateManagerRef.current?.setZoom(zoom);
  }, []);

  /**
   * Set render mode
   */
  const setMode = useCallback((mode: RenderMode) => {
    stateManagerRef.current?.setMode(mode);
  }, []);

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    const isValid = stateManagerRef.current?.validateAll() ?? false;
    
    if (!isValid && onValidationError) {
      const errors = stateManagerRef.current?.getErrors() ?? {};
      onValidationError(errors);
    }
    
    return isValid;
  }, [onValidationError]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    stateManagerRef.current?.clearErrors();
  }, []);

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback((fieldId: string) => {
    stateManagerRef.current?.clearFieldError(fieldId);
  }, []);

  const blurField = useCallback((fieldId: string) => {
    stateManagerRef.current?.blurField(fieldId);
  }, []);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    stateManagerRef.current?.resetFormData();
  }, []);

  /**
   * Submit form
   */
  const submit = useCallback(() => {
    const manager = stateManagerRef.current;
    const isValid = manager?.validateAll() ?? false;

    if (isValid && onSubmit) {
      const formData = manager?.getFormData() ?? {};
      onSubmit(formData);
      return;
    }

    if (!isValid && onValidationError) {
      const errors = manager?.getErrors() ?? {};
      onValidationError(errors);
    }

    if (!isValid && manager) {
      const cfg = resolveValidationConfig(schema);
      if (cfg.scrollToFirstError) {
        const fieldId = manager.getFirstInvalidFieldIdInOrder();
        if (fieldId && typeof document !== 'undefined') {
          queueMicrotask(() => {
            document
              .querySelector(`[data-preview-field="${fieldId}"]`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
      }
    }
  }, [schema, onSubmit, onValidationError]);

  /**
   * Get form data
   */
  const getFormData = useCallback((): Record<string, any> => {
    return stateManagerRef.current?.getFormData() ?? {};
  }, []);

  /**
   * Check if form has errors
   */
  const hasErrors = useCallback((): boolean => {
    return stateManagerRef.current?.hasErrors() ?? false;
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((isLoading: boolean) => {
    stateManagerRef.current?.setLoading(isLoading);
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: Error | null) => {
    stateManagerRef.current?.setError(error);
  }, []);

  return {
    state,
    updateField,
    updateFields,
    setViewport,
    setTheme,
    setZoom,
    setMode,
    validateAll,
    clearErrors,
    clearFieldError,
    blurField,
    reset,
    submit,
    getFormData,
    hasErrors,
    setLoading,
    setError
  };
}

/**
 * usePreviewControls Hook
 * 
 * Simplified hook for preview controls (viewport, theme, zoom)
 */
export function usePreviewControls(initialViewport: ViewportSize = 'desktop') {
  const [viewport, setViewport] = useState<ViewportSize>(initialViewport);
  const [theme, setTheme] = useState<PreviewTheme>('dark');
  const [zoom, setZoom] = useState<number>(100);

  const increaseZoom = useCallback(() => {
    setZoom(prev => Math.min(200, prev + 10));
  }, []);

  const decreaseZoom = useCallback(() => {
    setZoom(prev => Math.max(50, prev - 10));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const reset = useCallback(() => {
    setViewport(initialViewport);
    setTheme('dark');
    setZoom(100);
  }, [initialViewport]);

  return {
    viewport,
    theme,
    zoom,
    setViewport,
    setTheme,
    setZoom,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    toggleTheme,
    reset
  };
}

// Made with Bob