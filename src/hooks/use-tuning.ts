/**
 * useTuning Hook
 * 
 * Centralized state management for component tuning with undo/redo support.
 * Manages style overrides, structure changes, and behavior settings.
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  ComponentSchema,
  ComponentSchemaMetaPatch,
  FieldDefinition,
} from '@/lib/watsonx/types';
import type {
  TuningState,
  StyleOverrides,
  BehaviorSettings,
  HistoryEntry,
  UseTuningOptions,
  UseTuningReturn,
  FieldAdditionEntry,
} from '@/types/tuning';
import { DEFAULT_TUNING_STATE, normalizeFieldAdditionEntries } from '@/types/tuning';
import {
  applyBehaviorToSchema,
  migrateLegacyBehaviorSettings,
  validationConfigToBehaviorSettings,
} from '@/lib/tuning/behavior-schema';
import { StyleTransformer } from '@/lib/tuning/style-transformer';
import { StructureEditor } from '@/lib/tuning/structure-editor';
import { mergeFieldPartial } from '@/lib/tuning/merge-field-partial';
import { reconcileFieldOrderWithSchema, resolveFieldInsertIndex } from '@/lib/tuning/field-insert';
import {
  SUBMIT_BUTTON_LAYER_ID,
  defaultLayerOrder,
  layerOrderAfterCanvasFieldReorder,
  reconcileLayerOrderWithSchema,
} from '@/lib/tuning/layer-order';

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

  const normalizeTuningStateShape = useCallback((s: TuningState): TuningState => {
    return {
      ...s,
      behaviorSettings: migrateLegacyBehaviorSettings(s.behaviorSettings ?? {}),
      structureChanges: {
        ...DEFAULT_TUNING_STATE.structureChanges,
        ...s.structureChanges,
        fieldsAdded: normalizeFieldAdditionEntries(s.structureChanges?.fieldsAdded),
        schemaMetaModified: {
          ...DEFAULT_TUNING_STATE.structureChanges.schemaMetaModified,
          ...(s.structureChanges?.schemaMetaModified ?? {}),
        },
      },
    };
  }, []);

  const seedBehaviorSettings = migrateLegacyBehaviorSettings({
    ...DEFAULT_TUNING_STATE.behaviorSettings,
    ...validationConfigToBehaviorSettings(initialSchema.validation),
    ...initialState?.behaviorSettings,
  });

  // Initialize state
  const [state, setState] = useState<TuningState>(() => {
    const baseState = normalizeTuningStateShape({
      ...DEFAULT_TUNING_STATE,
      componentId: initialSchema.id,
      behaviorSettings: seedBehaviorSettings,
      ...initialState,
      structureChanges: {
        ...DEFAULT_TUNING_STATE.structureChanges,
        ...initialState?.structureChanges,
        fieldsAdded: normalizeFieldAdditionEntries(
          initialState?.structureChanges?.fieldsAdded ?? DEFAULT_TUNING_STATE.structureChanges.fieldsAdded
        ),
      },
    });

    // Try to load from localStorage if autoSave is enabled
    if (autoSave && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<TuningState>;
          if (parsed.componentId === initialSchema.id) {
            return normalizeTuningStateShape({
              ...baseState,
              ...parsed,
              behaviorSettings: migrateLegacyBehaviorSettings({
                ...baseState.behaviorSettings,
                ...(parsed.behaviorSettings ?? {}),
              }),
              structureChanges: {
                ...baseState.structureChanges,
                ...parsed.structureChanges,
                fieldsAdded: normalizeFieldAdditionEntries(
                  parsed.structureChanges?.fieldsAdded ?? baseState.structureChanges.fieldsAdded
                ),
                schemaMetaModified: {
                  ...baseState.structureChanges.schemaMetaModified,
                  ...(parsed.structureChanges?.schemaMetaModified ?? {}),
                },
              },
            });
          }
        }
      } catch (error) {
        console.error('Failed to load tuning state from localStorage:', error);
      }
    }

    return baseState;
  });

  const [currentSchema, setCurrentSchema] = useState(() =>
    applyBehaviorToSchema(initialSchema, seedBehaviorSettings)
  );
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
      const additions = normalizeFieldAdditionEntries(structureChanges.fieldsAdded);
      additions.forEach((entry) => {
        const { field } = entry;
        if (!structureEditor.hasField(updatedSchema, field.id)) {
          const pos = resolveFieldInsertIndex(updatedSchema, entry);
          updatedSchema = structureEditor.addField(updatedSchema, field, pos);
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

      // Apply field reordering (reconcile if stale vs adds/removes)
      if (structureChanges.fieldsReordered.length > 0) {
        const mergedOrder = reconcileFieldOrderWithSchema(
          updatedSchema,
          structureChanges.fieldsReordered
        );
        if (mergedOrder) {
          updatedSchema = structureEditor.reorderFields(updatedSchema, mergedOrder);
        }
      }

      if (structureChanges.layerOrder !== undefined) {
        if (structureChanges.layerOrder.length > 0) {
          const mergedLayer = reconcileLayerOrderWithSchema(
            updatedSchema,
            structureChanges.layerOrder
          );
          if (mergedLayer) {
            const fieldOnly = mergedLayer.filter((id) => id !== SUBMIT_BUTTON_LAYER_ID);
            updatedSchema = structureEditor.reorderFields(updatedSchema, fieldOnly);
            updatedSchema = { ...updatedSchema, layerOrder: mergedLayer };
          }
        } else {
          updatedSchema = { ...updatedSchema, layerOrder: undefined };
        }
      }

      const schemaMeta = structureChanges.schemaMetaModified;
      if (schemaMeta && Object.keys(schemaMeta).length > 0) {
        updatedSchema = { ...updatedSchema, ...schemaMeta };
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

      setCurrentSchema(applyBehaviorToSchema(updatedSchema, newState.behaviorSettings));
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
    (
      field: FieldDefinition,
      options?: { insertAt?: number; insertAfterFieldId?: string }
    ) => {
      const entry: FieldAdditionEntry = {
        field,
        insertAt: options?.insertAt,
        insertAfterFieldId: options?.insertAfterFieldId,
      };

      const baseIds = currentSchema.fields.map((f) => f.id);
      let nextLayer = state.structureChanges.layerOrder?.length
        ? [...state.structureChanges.layerOrder]
        : defaultLayerOrder(baseIds);
      const idxSubmit = nextLayer.indexOf(SUBMIT_BUTTON_LAYER_ID);
      let insertIndex = idxSubmit >= 0 ? idxSubmit : nextLayer.length;
      const after = options?.insertAfterFieldId;
      if (after && nextLayer.includes(after)) {
        insertIndex = nextLayer.indexOf(after) + 1;
      }
      nextLayer = [...nextLayer.slice(0, insertIndex), field.id, ...nextLayer.slice(insertIndex)];

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsAdded: [...state.structureChanges.fieldsAdded, entry],
            layerOrder: nextLayer,
          },
        },
        description: `Added field: ${field.label}`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsAdded: [...state.structureChanges.fieldsAdded, entry],
          layerOrder: nextLayer,
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, currentSchema, addToHistory, applyChanges]
  );

  /**
   * Remove a field
   */
  const removeField = useCallback(
    (fieldId: string) => {
      const removeSet = new Set([fieldId]);
      const nextLayer = state.structureChanges.layerOrder?.length
        ? state.structureChanges.layerOrder.filter((id) => !removeSet.has(id))
        : undefined;

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsRemoved: [...state.structureChanges.fieldsRemoved, fieldId],
            ...(nextLayer ? { layerOrder: nextLayer } : {}),
          },
        },
        description: `Removed field: ${fieldId}`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsRemoved: [...state.structureChanges.fieldsRemoved, fieldId],
          ...(nextLayer ? { layerOrder: nextLayer } : {}),
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Remove multiple fields in a single history entry
   */
  const removeFields = useCallback(
    (fieldIds: string[]) => {
      const unique = [...new Set(fieldIds)].filter(Boolean);
      if (unique.length === 0) return;

      const removeSet = new Set(unique);
      const nextLayer = state.structureChanges.layerOrder?.length
        ? state.structureChanges.layerOrder.filter((id) => !removeSet.has(id))
        : undefined;

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsRemoved: [...state.structureChanges.fieldsRemoved, ...unique],
            ...(nextLayer ? { layerOrder: nextLayer } : {}),
          },
        },
        description:
          unique.length === 1
            ? `Removed field: ${unique[0]}`
            : `Removed ${unique.length} fields`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsRemoved: [...state.structureChanges.fieldsRemoved, ...unique],
          ...(nextLayer ? { layerOrder: nextLayer } : {}),
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Duplicate fields (append clones) in one history step
   */
  const duplicateFields = useCallback(
    (fieldIds: string[]) => {
      const uniqueSorted = [...new Set(fieldIds)].filter(Boolean).sort(
        (a, b) =>
          currentSchema.fields.findIndex((f) => f.id === a) -
          currentSchema.fields.findIndex((f) => f.id === b)
      );
      const additions: FieldAdditionEntry[] = [];
      for (const id of uniqueSorted) {
        const src = currentSchema.fields.find((f) => f.id === id);
        if (!src) continue;
        const copy = JSON.parse(JSON.stringify(src)) as FieldDefinition;
        copy.id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        copy.label = `${src.label} (copy)`;
        additions.push({ field: copy, insertAfterFieldId: id });
      }
      if (additions.length === 0) return;

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsAdded: [...state.structureChanges.fieldsAdded, ...additions],
          },
        },
        description: `Duplicated ${additions.length} field(s)`,
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsAdded: [...state.structureChanges.fieldsAdded, ...additions],
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, currentSchema, addToHistory, applyChanges]
  );

  /**
   * Reorder fields (canvas design mode); keeps submit placement when possible.
   */
  const reorderFields = useCallback(
    (newOrder: string[]) => {
      const nextLayer = layerOrderAfterCanvasFieldReorder(
        state.structureChanges.layerOrder,
        newOrder
      );

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsReordered: newOrder,
            layerOrder: nextLayer,
          },
        },
        description: 'Reordered layers',
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          fieldsReordered: newOrder,
          layerOrder: nextLayer,
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Reorder structure layers (fields + submit) from the tuning panel list.
   */
  const reorderLayers = useCallback(
    (newOrder: string[]) => {
      const merged = reconcileLayerOrderWithSchema(currentSchema, newOrder);
      if (!merged) return;
      const fieldOnly = merged.filter((id) => id !== SUBMIT_BUTTON_LAYER_ID);

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            layerOrder: merged,
            fieldsReordered: fieldOnly,
          },
        },
        description: 'Reordered form layers',
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          layerOrder: merged,
          fieldsReordered: fieldOnly,
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, currentSchema, addToHistory, applyChanges]
  );

  /**
   * Modify field properties
   */
  const modifyField = useCallback(
    (fieldId: string, changes: Partial<FieldDefinition>) => {
      const merged = mergeFieldPartial(
        state.structureChanges.fieldsModified[fieldId],
        changes
      );

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            fieldsModified: {
              ...state.structureChanges.fieldsModified,
              [fieldId]: merged,
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
            [fieldId]: merged,
          },
        },
      };

      setState(newState);
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Update schema title or description (preview heading + exports).
   */
  const modifySchemaMeta = useCallback(
    (changes: ComponentSchemaMetaPatch) => {
      const merged = {
        ...state.structureChanges.schemaMetaModified,
        ...changes,
      };

      addToHistory({
        type: 'structure',
        changes: {
          structureChanges: {
            ...state.structureChanges,
            schemaMetaModified: merged,
          },
        },
        description: 'Updated component copy (title, description, or submit label)',
      });

      const newState = {
        ...state,
        structureChanges: {
          ...state.structureChanges,
          schemaMetaModified: merged,
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
      applyChanges(newState);
    },
    [state, addToHistory, applyChanges]
  );

  /**
   * Undo last change
   */
  const undo = useCallback(() => {
    if (state.historyIndex <= 0) return;

    const newIndex = state.historyIndex - 1;
    const entry = state.history[newIndex];

    if (entry.previousState) {
      const newState = normalizeTuningStateShape({
        ...state,
        ...entry.previousState,
        historyIndex: newIndex,
      });

      setState(newState);
      applyChanges(newState);
    }
  }, [state, applyChanges, normalizeTuningStateShape]);

  /**
   * Redo last undone change
   */
  const redo = useCallback(() => {
    if (state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    const entry = state.history[newIndex];

    const newState = normalizeTuningStateShape({
      ...state,
      ...entry.changes,
      historyIndex: newIndex,
    });

    setState(newState);
    applyChanges(newState);
  }, [state, applyChanges, normalizeTuningStateShape]);

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
    setCurrentSchema(applyBehaviorToSchema(initialSchema, resetState.behaviorSettings));
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
      const merged: TuningState = {
        ...state,
        ...config,
        componentId: initialSchema.id,
        structureChanges: {
          ...state.structureChanges,
          ...config.structureChanges,
          fieldsAdded: normalizeFieldAdditionEntries(
            config.structureChanges?.fieldsAdded ?? state.structureChanges.fieldsAdded
          ),
          schemaMetaModified: {
            ...state.structureChanges.schemaMetaModified,
            ...(config.structureChanges?.schemaMetaModified ?? {}),
          },
        },
      };

      const newState = normalizeTuningStateShape(merged);

      setState(newState);
      applyChanges(newState);
    },
    [state, initialSchema, applyChanges, normalizeTuningStateShape]
  );

  const isDirty = state.history.length > 0;

  return {
    state,
    currentSchema,
    currentCode,
    updateStyle,
    resetStyles,
    addField,
    removeField,
    removeFields,
    duplicateFields,
    isDirty,
    reorderFields,
    reorderLayers,
    modifyField,
    modifySchemaMeta,
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