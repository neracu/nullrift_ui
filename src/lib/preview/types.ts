/**
 * Preview System Types
 * 
 * Type definitions for the interactive preview system including
 * viewport configurations, preview state, and renderer props.
 */

import type { ComponentSchema } from '../watsonx/types';

/**
 * Preview canvas: interact with the form vs design (layout) editing.
 */
export type PreviewCanvasMode = 'interact' | 'design';

/**
 * Viewport size options for responsive preview
 */
export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'full';

/**
 * Theme options for preview
 */
export type PreviewTheme = 'light' | 'dark' | 'system';

/**
 * Rendering mode for preview
 */
export type RenderMode = 'schema' | 'code' | 'hybrid';

/**
 * Viewport configuration with dimensions
 */
export interface ViewportConfig {
  size: ViewportSize;
  width: number;
  height: number;
  label: string;
  icon: string;
}

/**
 * Complete preview state
 */
export interface PreviewState {
  /** Current rendering mode */
  mode: RenderMode;
  
  /** Current viewport size */
  viewport: ViewportSize;
  
  /** Current theme */
  theme: PreviewTheme;
  
  /** Zoom level (50-200%) */
  zoom: number;
  
  /** Form field values */
  formData: Record<string, any>;
  
  /** Validation errors by field ID */
  errors: Record<string, string>;
  
  /** Whether preview is interactive */
  isInteractive: boolean;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  error?: Error | null;
}

/**
 * Props for PreviewCanvas component
 */
export interface PreviewProps {
  /** Component schema from generation */
  schema: ComponentSchema;
  
  /** Generated code */
  code: string;
  
  /** Initial preview state */
  initialState?: Partial<PreviewState>;
  
  /** Callback when state changes */
  onStateChange?: (state: PreviewState) => void;
  
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  
  /** Callback when form is submitted */
  onSubmit?: (data: Record<string, any>) => void;

  /** Design vs interact preview */
  canvasMode?: PreviewCanvasMode;

  /** Selected field ids on the canvas (design mode) */
  selectedFieldIds?: string[];

  /** Field picked on canvas */
  onFieldCanvasSelect?: (fieldId: string, opts: { additive: boolean }) => void;

  /** Reorder after drag-drop on canvas */
  onCanvasReorder?: (newFieldOrder: string[]) => void;

  /** Cycle column span for a field (grid / two-column) */
  onCycleFieldColSpan?: (fieldId: string) => void;

  /** Toggle interact vs design (passed to preview controls) */
  onCanvasModeChange?: (mode: PreviewCanvasMode) => void;
}

/**
 * Props for DynamicRenderer component
 */
export interface RendererProps {
  /** Component schema to render */
  schema: ComponentSchema;
  
  /** Current form data */
  formData: Record<string, any>;
  
  /** Validation errors */
  errors: Record<string, string>;
  
  /** Current theme */
  theme: PreviewTheme;
  
  /** Callback when field value changes */
  onFieldChange: (fieldId: string, value: any) => void;
  
  /** Callback when form is submitted */
  onSubmit: (data: Record<string, any>) => void;
  
  /** Callback when validation fails */
  onValidationError?: (fieldId: string, error: string) => void;

  /** Design vs interact preview */
  canvasMode?: PreviewCanvasMode;

  selectedFieldIds?: string[];

  onFieldCanvasSelect?: (fieldId: string, opts: { additive: boolean }) => void;

  onCanvasReorder?: (newFieldOrder: string[]) => void;

  onCycleFieldColSpan?: (fieldId: string) => void;
}

/**
 * Props for PreviewFrame component
 */
export interface PreviewFrameProps {
  /** Component schema */
  schema: ComponentSchema;
  
  /** Generated code */
  code: string;
  
  /** Current preview state */
  state: PreviewState;
  
  /** Callback when field changes */
  onFieldChange: (fieldId: string, value: any) => void;
  
  /** Callback when form submits */
  onSubmit: (data: Record<string, any>) => void;
  
  /** Callback when ready */
  onReady?: () => void;
  
  /** Callback when error occurs */
  onError?: (error: Error) => void;

  /** Design vs interact preview */
  canvasMode?: PreviewCanvasMode;

  selectedFieldIds?: string[];

  onFieldCanvasSelect?: (fieldId: string, opts: { additive: boolean }) => void;

  onCanvasReorder?: (newFieldOrder: string[]) => void;

  onCycleFieldColSpan?: (fieldId: string) => void;
}

/**
 * Props for PreviewControls component
 */
export interface PreviewControlsProps {
  /** Current viewport */
  viewport: ViewportSize;
  
  /** Current theme */
  theme: PreviewTheme;
  
  /** Current zoom level */
  zoom: number;
  
  /** Whether preview is loading */
  isLoading?: boolean;
  
  /** Callback when viewport changes */
  onViewportChange: (viewport: ViewportSize) => void;
  
  /** Callback when theme changes */
  onThemeChange: (theme: PreviewTheme) => void;
  
  /** Callback when zoom changes */
  onZoomChange: (zoom: number) => void;
  
  /** Callback when reset is clicked */
  onReset: () => void;

  /** Interact vs design canvas */
  canvasMode?: PreviewCanvasMode;

  onCanvasModeChange?: (mode: PreviewCanvasMode) => void;
}

/**
 * Message types for iframe communication
 */
export type IframeMessageType = 
  | 'render'
  | 'update'
  | 'error'
  | 'ready'
  | 'submit'
  | 'fieldChange'
  | 'validationError';

/**
 * Message structure for iframe communication
 */
export interface IframeMessage {
  type: IframeMessageType;
  payload: any;
  timestamp?: number;
}

/**
 * State change listener function
 */
export type StateChangeListener = (state: PreviewState) => void;

/**
 * Field validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Viewport configurations constant
 */
export const VIEWPORT_CONFIGS: Record<ViewportSize, ViewportConfig> = {
  mobile: {
    size: 'mobile',
    width: 375,
    height: 667,
    label: 'iPhone SE',
    icon: '📱'
  },
  tablet: {
    size: 'tablet',
    width: 768,
    height: 1024,
    label: 'iPad',
    icon: '📱'
  },
  desktop: {
    size: 'desktop',
    width: 1440,
    height: 900,
    label: 'Desktop',
    icon: '💻'
  },
  full: {
    size: 'full',
    width: 9999,
    height: 9999,
    label: 'Full Width',
    icon: '🖥️'
  }
};

/**
 * Theme style configurations
 */
export const THEME_STYLES = {
  light: {
    background: 'bg-white',
    text: 'text-slate-900',
    border: 'border-slate-200',
    card: 'bg-white',
    input: 'bg-white border-slate-300'
  },
  dark: {
    background: 'bg-slate-950',
    text: 'text-slate-100',
    border: 'border-slate-800',
    card: 'bg-slate-900',
    input: 'bg-slate-900 border-slate-700'
  }
} as const;

/**
 * Default preview state
 */
export const DEFAULT_PREVIEW_STATE: PreviewState = {
  mode: 'schema',
  viewport: 'desktop',
  theme: 'dark',
  zoom: 100,
  formData: {},
  errors: {},
  isInteractive: true,
  isLoading: false,
  error: null
};

// Made with Bob