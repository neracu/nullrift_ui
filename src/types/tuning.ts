/**
 * Tuning System Types
 * 
 * Type definitions for the UX tuning panel system including
 * style overrides, structure changes, behavior settings, and history management.
 */

import type { ComponentSchema, FieldDefinition } from '@/lib/watsonx/types';

/**
 * Complete tuning state for a component
 */
export interface TuningState {
  /** Component being tuned */
  componentId: string;
  
  /** Style customizations */
  styleOverrides: StyleOverrides;
  
  /** Structure modifications */
  structureChanges: StructureChanges;
  
  /** Behavior settings */
  behaviorSettings: BehaviorSettings;
  
  /** History of changes for undo/redo */
  history: HistoryEntry[];
  
  /** Current position in history */
  historyIndex: number;
}

/**
 * Style override options
 */
export interface StyleOverrides {
  // Border & Spacing
  /** Border radius preset */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  /** Spacing preset */
  spacing?: 'compact' | 'normal' | 'relaxed';

  /** Form / preview surface theme (mirrors StylingConfig.theme). */
  theme?: 'light' | 'dark' | 'system';
  
  // Colors
  /** Primary color (hex) */
  primaryColor?: string;
  
  /** Secondary color (hex) */
  secondaryColor?: string;
  
  /** Background color (hex) */
  backgroundColor?: string;
  
  /** Text color (hex) */
  textColor?: string;
  
  // Typography
  /** Font family */
  fontFamily?: 'sans' | 'serif' | 'mono';
  
  /** Font size preset */
  fontSize?: 'sm' | 'base' | 'lg';
  
  // Custom
  /** Additional Tailwind classes */
  customClasses?: string[];
}

/**
 * Structure modification tracking
 */
export interface StructureChanges {
  /** Fields that have been added */
  fieldsAdded: FieldDefinition[];
  
  /** IDs of fields that have been removed */
  fieldsRemoved: string[];
  
  /** New order of field IDs (if reordered) */
  fieldsReordered: string[];
  
  /** Modifications to existing fields */
  fieldsModified: Record<string, Partial<FieldDefinition>>;
  
  /** Layout change (if any) */
  layoutChanged?: 'single-column' | 'two-column' | 'grid' | 'custom';
}

/**
 * Behavior configuration options
 */
export interface BehaviorSettings {
  /** When to validate fields */
  validationMode?: 'onBlur' | 'onChange' | 'onSubmit';
  
  /** Show validation errors inline */
  showErrorsInline?: boolean;
  
  /** Auto-focus first field on mount */
  autoFocus?: boolean;
  
  /** Submit form on Enter key */
  submitOnEnter?: boolean;
  
  /** Show required field indicators */
  showRequiredIndicators?: boolean;
}

/**
 * History entry for undo/redo
 */
export interface HistoryEntry {
  /** Timestamp of change */
  timestamp: number;
  
  /** Type of change */
  type: 'style' | 'structure' | 'behavior';
  
  /** Changes made (partial state) */
  changes: Partial<TuningState>;
  
  /** Human-readable description */
  description: string;
  
  /** Previous state (for undo) */
  previousState?: Partial<TuningState>;
}

/**
 * Tuning control definition for UI
 */
export interface TuningControl {
  /** Unique control ID */
  id: string;
  
  /** Control category */
  category: 'style' | 'structure' | 'behavior';
  
  /** Display label */
  label: string;
  
  /** Control type */
  type: 'slider' | 'color' | 'select' | 'toggle' | 'text' | 'number';
  
  /** Current value */
  value: any;
  
  /** Control options */
  options?: {
    /** Minimum value (for slider/number) */
    min?: number;
    
    /** Maximum value (for slider/number) */
    max?: number;
    
    /** Step increment (for slider/number) */
    step?: number;
    
    /** Choices for select */
    choices?: Array<{ label: string; value: any }>;
    
    /** Placeholder text */
    placeholder?: string;
  };
  
  /** Change handler */
  onChange: (value: any) => void;
  
  /** Optional description/help text */
  description?: string;
  
  /** Whether control is disabled */
  disabled?: boolean;
}

/**
 * Tuning panel section configuration
 */
export interface TuningSection {
  /** Section ID */
  id: string;
  
  /** Section title */
  title: string;
  
  /** Section icon (Lucide icon name) */
  icon?: string;
  
  /** Whether section is open by default */
  defaultOpen?: boolean;
  
  /** Controls in this section */
  controls: TuningControl[];
}

/**
 * Options for useTuning hook
 */
export interface UseTuningOptions {
  /** Initial tuning state */
  initialState?: Partial<TuningState>;
  
  /** Callback when schema changes */
  onSchemaChange?: (schema: ComponentSchema) => void;
  
  /** Callback when code changes */
  onCodeChange?: (code: string) => void;
  
  /** Callback when any tuning state changes */
  onStateChange?: (state: TuningState) => void;
  
  /** Maximum history size (default: 50) */
  maxHistorySize?: number;
  
  /** Enable auto-save to localStorage */
  autoSave?: boolean;
  
  /** localStorage key for auto-save */
  storageKey?: string;
}

/**
 * Return type for useTuning hook
 */
export interface UseTuningReturn {
  /** Current tuning state */
  state: TuningState;
  
  /** Current schema with tuning applied */
  currentSchema: ComponentSchema;
  
  /** Current code with tuning applied */
  currentCode: string;
  
  // Style operations
  /** Update style overrides */
  updateStyle: (overrides: Partial<StyleOverrides>) => void;
  
  /** Reset styles to default */
  resetStyles: () => void;
  
  // Structure operations
  /** Add a new field */
  addField: (field: FieldDefinition, position?: number) => void;

  /** Remove a field */
  removeField: (fieldId: string) => void;

  /** Remove several fields in one history step */
  removeFields: (fieldIds: string[]) => void;

  /** Duplicate fields (appended) in one history step */
  duplicateFields: (fieldIds: string[]) => void;

  /** True after any tuning change (history non-empty) */
  isDirty: boolean;

  /** Reorder fields */
  reorderFields: (newOrder: string[]) => void;
  
  /** Modify field properties */
  modifyField: (fieldId: string, changes: Partial<FieldDefinition>) => void;
  
  /** Change layout */
  changeLayout: (layout: 'single-column' | 'two-column' | 'grid' | 'custom') => void;
  
  // Behavior operations
  /** Update behavior settings */
  updateBehavior: (settings: Partial<BehaviorSettings>) => void;
  
  // History operations
  /** Undo last change */
  undo: () => void;
  
  /** Redo last undone change */
  redo: () => void;
  
  /** Whether undo is available */
  canUndo: boolean;
  
  /** Whether redo is available */
  canRedo: boolean;
  
  /** Clear history */
  clearHistory: () => void;
  
  // Utility operations
  /** Reset all tuning to initial state */
  reset: () => void;
  
  /** Export tuning configuration */
  exportConfig: () => TuningState;
  
  /** Import tuning configuration */
  importConfig: (config: Partial<TuningState>) => void;
}

/**
 * Field type options for adding new fields
 */
export const FIELD_TYPE_OPTIONS = [
  { label: 'Text Input', value: 'input' },
  { label: 'Text Area', value: 'textarea' },
  { label: 'Select Dropdown', value: 'select' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Radio Buttons', value: 'radio' },
  { label: 'Date Picker', value: 'date' },
  { label: 'File Upload', value: 'file' },
] as const;

/**
 * Border radius options
 */
export const BORDER_RADIUS_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Extra Large', value: 'xl' },
  { label: '2X Large', value: '2xl' },
  { label: 'Full', value: 'full' },
] as const;

/**
 * Spacing options
 */
export const SPACING_OPTIONS = [
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Relaxed', value: 'relaxed' },
] as const;

/**
 * Font family options
 */
export const FONT_FAMILY_OPTIONS = [
  { label: 'Sans Serif', value: 'sans' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'mono' },
] as const;

/**
 * Font size options
 */
export const FONT_SIZE_OPTIONS = [
  { label: 'Small', value: 'sm' },
  { label: 'Base', value: 'base' },
  { label: 'Large', value: 'lg' },
] as const;

/**
 * Theme options for preview / export surface (matches StylingConfig.theme).
 */
export const THEME_OPTIONS = [
  { label: 'System', value: 'system' as const },
  { label: 'Light', value: 'light' as const },
  { label: 'Dark', value: 'dark' as const },
] as const;

/**
 * Curated SaaS-safe palettes for one-click color application in the tuning panel.
 */
export const TUNING_COLOR_PRESETS = [
  {
    id: 'default',
    label: 'Default',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
  },
  {
    id: 'slate',
    label: 'Slate',
    primaryColor: '#334155',
    secondaryColor: '#64748b',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
  },
  {
    id: 'teal',
    label: 'Teal',
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
    backgroundColor: '#f0fdfa',
    textColor: '#134e4a',
  },
  {
    id: 'violet',
    label: 'Violet',
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    backgroundColor: '#faf5ff',
    textColor: '#1e1b4b',
  },
  {
    id: 'amber',
    label: 'Amber',
    primaryColor: '#d97706',
    secondaryColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    textColor: '#422006',
  },
  {
    id: 'dark-surface',
    label: 'Dark UI',
    primaryColor: '#38bdf8',
    secondaryColor: '#94a3b8',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
  },
] as const;

/**
 * Values applied by the Style panel "Reset styles" control: restores defaults and clears optional keys.
 */
export const STYLE_PANEL_RESET_VALUES: Partial<StyleOverrides> = {
  borderRadius: 'md',
  spacing: 'normal',
  fontFamily: 'sans',
  fontSize: 'base',
  primaryColor: undefined,
  secondaryColor: undefined,
  backgroundColor: undefined,
  textColor: undefined,
  theme: undefined,
  customClasses: undefined,
};

/**
 * Layout options
 */
export const LAYOUT_OPTIONS = [
  { label: 'Single Column', value: 'single-column' },
  { label: 'Two Columns', value: 'two-column' },
  { label: 'Grid', value: 'grid' },
  { label: 'Custom', value: 'custom' },
] as const;

/**
 * Validation mode options
 */
export const VALIDATION_MODE_OPTIONS = [
  { label: 'On Blur', value: 'onBlur' },
  { label: 'On Change', value: 'onChange' },
  { label: 'On Submit', value: 'onSubmit' },
] as const;

/**
 * Default tuning state
 */
export const DEFAULT_TUNING_STATE: TuningState = {
  componentId: '',
  styleOverrides: {},
  structureChanges: {
    fieldsAdded: [],
    fieldsRemoved: [],
    fieldsReordered: [],
    fieldsModified: {},
  },
  behaviorSettings: {
    validationMode: 'onBlur',
    showErrorsInline: true,
    autoFocus: false,
    submitOnEnter: true,
    showRequiredIndicators: true,
  },
  history: [],
  historyIndex: -1,
};

// Made with Bob