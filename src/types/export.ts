/**
 * Export System Types
 * 
 * Type definitions for the code export system including
 * export requests, responses, file structures, and format-specific options.
 */

import type { ComponentSchema } from '@/lib/watsonx/types';
import type { TuningState } from './tuning';

/**
 * Supported export formats
 */
export type ExportFormat = 'react-ts' | 'react-js' | 'vue' | 'html';

/**
 * Export request from client
 */
export interface ExportRequest {
  /** Component schema to export */
  schema: ComponentSchema;
  
  /** Current tuning state (optional) */
  tuningState?: TuningState;
  
  /** Export format */
  format: ExportFormat;
  
  /** Export options */
  options?: ExportOptions;
}

/**
 * Export configuration options
 */
export interface ExportOptions {
  /** Include TypeScript type definitions (React/Vue) */
  includeTypes?: boolean;
  
  /** Generate test files */
  includeTests?: boolean;
  
  /** Generate Storybook stories */
  includeStorybook?: boolean;
  
  /** Bundle as single file vs multiple files */
  bundled?: boolean;
  
  /** Include package.json with dependencies */
  includePackageJson?: boolean;
  
  /** Include README with usage instructions */
  includeReadme?: boolean;
  
  /** Component name override */
  componentName?: string;
  
  /** Add code comments and JSDoc */
  includeComments?: boolean;
}

/**
 * Export response from API
 */
export interface ExportResponse {
  /** Success status */
  success: boolean;
  
  /** Generated files */
  files: ExportFile[];
  
  /** Download URL for ZIP (if multiple files) */
  downloadUrl?: string;
  
  /** ZIP file as base64 (alternative to URL) */
  zipData?: string;
  
  /** Export metadata */
  metadata: ExportMetadata;
}

/**
 * Individual exported file
 */
export interface ExportFile {
  /** File name with extension */
  name: string;
  
  /** File content */
  content: string;
  
  /** Programming language for syntax highlighting */
  language: 'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'markdown' | 'vue';
  
  /** File path in project structure */
  path?: string;
  
  /** File size in bytes */
  size?: number;
}

/**
 * Export metadata
 */
export interface ExportMetadata {
  /** Export format used */
  format: ExportFormat;
  
  /** Timestamp of export */
  timestamp: string;
  
  /** Total number of files */
  fileCount: number;
  
  /** Total size in bytes */
  totalSize: number;
  
  /** Component name */
  componentName: string;
  
  /** Options used */
  options: ExportOptions;
}

/**
 * Code generation context
 */
export interface CodeGenerationContext {
  /** Component schema */
  schema: ComponentSchema;
  
  /** Tuning state applied */
  tuningState?: TuningState;
  
  /** Export options */
  options: ExportOptions;
  
  /** Component name (processed) */
  componentName: string;
  
  /** File name base (kebab-case) */
  fileNameBase: string;
}

/**
 * Exporter interface that all format exporters must implement
 */
export interface Exporter {
  /** Export format identifier */
  format: ExportFormat;
  
  /** Generate files for this format */
  generate(context: CodeGenerationContext): Promise<ExportFile[]>;
  
  /** Validate if schema is compatible with this format */
  validate(schema: ComponentSchema): { valid: boolean; errors?: string[] };
}

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeTypes: true,
  includeTests: false,
  includeStorybook: false,
  bundled: false,
  includePackageJson: true,
  includeReadme: true,
  includeComments: true,
};

/**
 * Format display names
 */
export const FORMAT_LABELS: Record<ExportFormat, string> = {
  'react-ts': 'React + TypeScript',
  'react-js': 'React + JavaScript',
  'vue': 'Vue 3 (Composition API)',
  'html': 'HTML + CSS + JS',
};

/**
 * Format descriptions
 */
export const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  'react-ts': 'Modern React component with TypeScript, hooks, and type safety',
  'react-js': 'React component with JavaScript and PropTypes',
  'vue': 'Vue 3 Single File Component with Composition API and TypeScript',
  'html': 'Vanilla HTML with Tailwind CSS and vanilla JavaScript',
};

/**
 * Format file extensions
 */
export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  'react-ts': '.tsx',
  'react-js': '.jsx',
  'vue': '.vue',
  'html': '.html',
};

/**
 * Dependencies for each format
 */
export const FORMAT_DEPENDENCIES: Record<ExportFormat, Record<string, string>> = {
  'react-ts': {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
  },
  'react-js': {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'prop-types': '^15.8.1',
  },
  'vue': {
    'vue': '^3.3.0',
  },
  'html': {},
};

/**
 * Dev dependencies for each format
 */
export const FORMAT_DEV_DEPENDENCIES: Record<ExportFormat, Record<string, string>> = {
  'react-ts': {
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
    'typescript': '^5.0.0',
  },
  'react-js': {
    '@babel/core': '^7.22.0',
    '@babel/preset-react': '^7.22.0',
  },
  'vue': {
    '@vitejs/plugin-vue': '^4.2.0',
    'typescript': '^5.0.0',
    'vue-tsc': '^1.8.0',
  },
  'html': {},
};

// Made with Bob