/**
 * useTuning Hook
 * 
 * Centralized state management for component tuning with undo/redo support.
 * Manages style overrides, structure changes, and behavior settings.
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ComponentSchema, FieldDefinition } from '@/lib/watsonx/types';
import type {
  TuningState,
  StyleOverrides,
  BehaviorSettings,
  HistoryEntry,
  UseTuningOptions,
  UseTuningReturn,
} from '@/types/tuning';
import { DEFAULT_TUNING_STATE } from '@/types/tuning';
import { StyleTransformer } from '@/lib/tuning/style-transformer';
import { StructureEditor } from '@/lib/tuning/structure-editor';

/**
 * useTuning Hook
 * 
 * Provides state management and operations for component tuning
 */
export function useTuning(
  initialSchema: ComponentSchema,
  initialCode: string,
  options: UseTuningOptions = {}
): UseTuningReturn {
  const {
    initialState,
    onSchemaChange,
    onCodeChange,
    onStateChange,
    maxHistorySize = 50,
    autoSave = false,
    storageKey = 'nullrift-tuning-state',
  } = options;

  // Initialize transformers
  const styleTransformer = useMemo(() => new StyleTransformer(), []);
  const structureEditor = useMemo(() => new StructureEditor(), []);

  // Initialize state
  const [state, setState] = useState<TuningState>(() => {
    const baseState = {
      ...DEFAULT_TUNING_STATE,
      componentId: initialSchema.id,
      ...initialState,
    };

    // Try to load from localStorage if autoSave is enabled
    if (autoSave && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.componentId === initialSchema.id) {
            return { ...baseState, ...parsed };
          }
        }
      } catch (error) {
        console.error('Failed to load tuning state from localStorage:', error);
      }
    }

    return baseState;
  });

  const [currentSchema, setCurrentSchema] = useState(initialSchema);
  const [currentCode, setCurrentCode] = useState(initialCode);

  // Save to localStorage when state changes
  useEffect(() => {
    if (autoSave && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save tuning state to localStorage:', error);
      }
    }
  }, [state, autoSave, storageKey]);

  // Notify callbacks when schema/code changes
  useEffect(() => {
    onSchemaChange?.(currentSchema);
  }, [currentSchema, onSchemaChange]);

  useEffect(() => {
    onCodeChange?.(currentCode);
  }, [currentCode, onCodeChange]);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  /**
   * Add entry to history
   */
  const addToHistory = useCallback(
    (entry: Omit<HistoryEntry, 'timestamp' | 'previousState'>) => {
      setState((prev) => {
        // Remove any history after current index (for redo)
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);

        // Add new entry
        const historyEntry: HistoryEntry = {
          ...entry,
          timestamp: Date.now(),
          previousState: {
            styleOverrides: prev.styleOverrides,
            structureChanges: prev.structureChanges,
            behaviorSettings: prev.behaviorSettings,
          },
        };

        newHistory.push(historyEntry);

        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }

        return {
          ...prev,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },
    [maxHistorySize]
  );

  /**
   * Apply changes to schema and code
   */
  const applyChanges = useCallback(
    (newState: TuningState) => {
      // Apply style overrides
      let updatedSchema = styleTransformer.applyStyleOverrides(
        initialSchema,
        newState.styleOverrides
      );

      // Apply structure changes
      const { structureChanges } = newState;

      // Apply field additions
      structureChanges.fieldsAdded.forEach((field) => {
        if (!structureEditor.hasField(updatedSchema, field.id)) {
          updatedSchema = structureEditor.addField(updatedSchema, field);
        }
      });

      // Apply field removals
      structureChanges.fieldsRemoved.forEach((fieldId) => {
        if (structureEditor.hasField(updatedSchema, fieldId)) {
          updatedSchema = structureEditor.removeField(updatedSchema, fieldId);
        }
      });

      // Apply field modifications
      Object.entries(structureChanges.fieldsModified).forEach(([fieldId, changes]) => {
        if (structureEditor.hasField(updatedSchema, fieldId)) {
          updatedSchema = structureEditor.modifyField(updatedSchema, fieldId, changes);
        }
      });

      // Apply field reordering
      if (structureChanges.fieldsReordered.length > 0) {
        updatedSchema = structureEditor.reorderFields(
          updatedSchema,
          structureChanges.fieldsReordered
        );
      }

      // Apply layout change
      if (structureChanges.layoutChanged) {
        updatedSchema = structureEditor.changeLayout(
          updatedSchema,
          structureChanges.layoutChanged
        );
      }

      // Update code
      const updatedCode = styleTransformer.updateComponentCode(
        initialCode,
        newState.styleOverrides
      );

      setCurrentSchema(updatedSchema);
      setCurrentCode(updatedCode);
    },
    [initialSchema, initialCode, styleTransformer, structureEditor]
  );

  /**
   * Update style overrides
   */
  const updateStyle = useCallback(
    (overrides: Partial<StyleOverrides>) => {
      const newOverrides = { ...state.styleOverrides, ...overrides };

      addToHistory({
        type: 'style',
        changes: { styleOverrides: newOverrides },
        description: `Updated style: ${Object.keys(overrides).join(', ')}`,
      });

      const newState = {
        ...state,
        styleOverrides: newOverrides,
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Reset styles to default
   */
  const resetStyles = useCallback(() => {
    addToHistory({
      type: 'style',
      changes: { styleOverrides: {} },
      description: 'Reset styles to default',
    });

    const newState = {
      ...state,
      styleOverrides: {},
    };

    setState(newState);
    applyChanges(newState);
  }, [state, addToHistory, applyChanges]);

  /**
   * Add a new field
   */
  const addField = useCallback(
    (field: FieldDefinition, position?: number) => {
      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsAdded: [...state.structureChanges.fieldsAdded, field],
          },
        },
        description: `Added field: ${field.label}`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsAdded: [...state.structureChanges.fieldsAdded, field],
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Remove a field
   */
  const removeField = useCallback(
    (fieldId: string) => {
      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsRemoved: [...state.structureChanges.fieldsRemoved, fieldId],
          },
        },
        description: `Removed field: ${fieldId}`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsRemoved: [...state.structureChanges.fieldsRemoved, fieldId],
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Reorder fields
   */
  const reorderFields = useCallback(
    (newOrder: string[]) => {
      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsReordered: newOrder,
          },
        },
        description: 'Reordered fields',
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsReordered: newOrder,
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Modify field properties
   */
  const modifyField = useCallback(
    (fieldId: string, changes: Partial<FieldDefinition>) => {
      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsModified: {
              ...state.structureChanges.fieldsModified,
              [fieldId]: changes,
            },
          },
        },
        description: `Modified field: ${fieldId}`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsModified: {
            ...state.structureChanges.fieldsModified,
            [fieldId]: changes,
          },
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Change layout
   */
  const changeLayout = useCallback(
    (layout: 'single-column' | 'two-column' | 'grid' | 'custom') => {
      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            layoutChanged: layout,
          },
        },
        description: `Changed layout to: ${layout}`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          layoutChanged: layout,
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Update behavior settings
   */
  const updateBehavior = useCallback(
    (settings: Partial<BehaviorSettings>) => {
      const newSettings = { ...state.behaviorSettings, ...settings };

      addToHistory({
        type: 'behavior',
        changes: { behaviorSettings: newSettings },
        description: `Updated behavior: ${Object.keys(settings).join(', ')}`,
      });

      const newState = {
        ...state,
        behaviorSettings: newSettings,
      };

      setState(newState);
      // Behavior changes don't affect schema/code directly
    },
    [state, addToHistory]
  );

  /**
   * Undo last change
   */
  const undo = useCallback(() => {
    if (state.historyIndex <= 0) return;

    const newIndex = state.historyIndex - 1;
    const entry = state.history[newIndex];

    if (entry.previousState) {
      const newState = {
        ...state,
        ...entry.previousState,
        historyIndex: newIndex,
      };

      setState(newState);
      applyChanges(newState);
    }
  }, [state, applyChanges]);

  /**
   * Redo last undone change
   */
  const redo = useCallback(() => {
    if (state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    const entry = state.history[newIndex];

    const newState = {
      ...state,
      ...entry.changes,
      historyIndex: newIndex,
    };

    setState(newState);
    applyChanges(newState);
  }, [state, applyChanges]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
      historyIndex: -1,
    }));
  }, []);

  /**
   * Reset all tuning to initial state
   */
  const reset = useCallback(() => {
    const resetState = {
      ...DEFAULT_TUNING_STATE,
      componentId: initialSchema.id,
    };

    setState(resetState);
    setCurrentSchema(initialSchema);
    setCurrentCode(initialCode);
  }, [initialSchema, initialCode]);

  /**
   * Export tuning configuration
   */
  const exportConfig = useCallback((): TuningState => {
    return { ...state };
  }, [state]);

  /**
   * Import tuning configuration
   */
  const importConfig = useCallback(
    (config: Partial<TuningState>) => {
      const newState = {
        ...state,
        ...config,
        componentId: initialSchema.id,
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, initialSchema, applyChanges]
  );

  return {
    state,
    currentSchema,
    currentCode,
    updateStyle,
    resetStyles,
    addField,
    removeField,
    reorderFields,
    modifyField,
    changeLayout,
    updateBehavior,
    undo,
    redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    clearHistory,
    reset,
    exportConfig,
    importConfig,
  };
}

// Made with Bob