/**
 * Export System Orchestrator
 * 
 * Main entry point for the export system. Coordinates between different
 * exporters, handles file bundling, and manages the export process.
 */

import JSZip from 'jszip';
import type { ComponentSchema } from '@/lib/watsonx/types';
import type { TuningState } from '@/types/tuning';
import { normalizeFieldAdditionEntries } from '@/types/tuning';
import { StructureEditor } from '@/lib/tuning/structure-editor';
import { reconcileFieldOrderWithSchema, resolveFieldInsertIndex } from '@/lib/tuning/field-insert';
import type {
  ExportRequest,
  ExportResponse,
  ExportFile,
  ExportFormat,
  ExportOptions,
  Exporter,
  CodeGenerationContext,
} from '@/types/export';
import { DEFAULT_EXPORT_OPTIONS } from '@/types/export';
import { ReactExporter } from './react-exporter';
import { VueExporter } from './vue-exporter';
import { HTMLExporter } from './html-exporter';

/**
 * Export manager class
 */
export class ExportManager {
  private exporters: Map<ExportFormat, Exporter>;

  constructor() {
    this.exporters = new Map<ExportFormat, Exporter>();
    this.exporters.set('react-ts', new ReactExporter());
    this.exporters.set('react-js', new ReactExporter());
    this.exporters.set('vue', new VueExporter());
    this.exporters.set('html', new HTMLExporter());
  }

  /**
   * Export component to specified format
   */
  async export(request: ExportRequest): Promise<ExportResponse> {
    const { schema, format, options = {}, tuningState } = request;

    // Merge with default options
    const mergedOptions: ExportOptions = {
      ...DEFAULT_EXPORT_OPTIONS,
      ...options,
    };

    // Get appropriate exporter
    const exporter = this.exporters.get(format);
    if (!exporter) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    // Validate schema
    const validation = exporter.validate(schema);
    if (!validation.valid) {
      throw new Error(`Schema validation failed: ${validation.errors?.join(', ')}`);
    }

    // Apply tuning state to schema if provided
    const finalSchema = tuningState 
      ? this.applyTuningToSchema(schema, tuningState)
      : schema;

    // Create generation context
    const context: CodeGenerationContext = {
      schema: finalSchema,
      tuningState,
      options: mergedOptions,
      componentName: mergedOptions.componentName || finalSchema.name,
      fileNameBase: this.toKebabCase(mergedOptions.componentName || finalSchema.name),
    };

    // Generate files
    const files = await exporter.generate(context);

    // Calculate metadata
    const totalSize = files.reduce((sum, file) => {
      const size = new Blob([file.content]).size;
      file.size = size;
      return sum + size;
    }, 0);

    // Create ZIP if multiple files
    let zipData: string | undefined;
    if (files.length > 1 && !mergedOptions.bundled) {
      zipData = await this.createZip(files, context.fileNameBase);
    }

    return {
      success: true,
      files,
      zipData,
      metadata: {
        format,
        timestamp: new Date().toISOString(),
        fileCount: files.length,
        totalSize,
        componentName: context.componentName,
        options: mergedOptions,
      },
    };
  }

  /**
   * Create ZIP file from exported files
   */
  private async createZip(files: ExportFile[], baseName: string): Promise<string> {
    const zip = new JSZip();

    // Add each file to ZIP
    files.forEach(file => {
      const path = file.path || file.name;
      zip.file(path, file.content);
    });

    // Generate ZIP as base64
    const zipBlob = await zip.generateAsync({ 
      type: 'base64',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    return zipBlob;
  }

  /**
   * Apply tuning state to schema
   */
  private applyTuningToSchema(
    schema: ComponentSchema,
    tuningState: TuningState
  ): ComponentSchema {
    const { styleOverrides, structureChanges, behaviorSettings } = tuningState;

    // Clone schema to avoid mutations
    const tunedSchema: ComponentSchema = JSON.parse(JSON.stringify(schema));

    // Apply style overrides
    if (styleOverrides) {
      if (styleOverrides.borderRadius) {
        tunedSchema.styling.borderRadius = styleOverrides.borderRadius;
      }
      if (styleOverrides.spacing) {
        tunedSchema.styling.spacing = styleOverrides.spacing;
      }
      if (styleOverrides.primaryColor) {
        tunedSchema.styling.primaryColor = styleOverrides.primaryColor;
      }
      if (styleOverrides.secondaryColor) {
        tunedSchema.styling.secondaryColor = styleOverrides.secondaryColor;
      }
      if (styleOverrides.backgroundColor) {
        tunedSchema.styling.backgroundColor = styleOverrides.backgroundColor;
      }
      if (styleOverrides.textColor) {
        tunedSchema.styling.textColor = styleOverrides.textColor;
      }
      if (styleOverrides.fontFamily) {
        tunedSchema.styling.fontFamily = styleOverrides.fontFamily;
      }
      if (styleOverrides.fontSize) {
        tunedSchema.styling.fontSize = styleOverrides.fontSize;
      }
      if (styleOverrides.customClasses) {
        tunedSchema.styling.customClasses = styleOverrides.customClasses;
      }
    }

    // Apply structure changes
    if (structureChanges) {
      const structureEditor = new StructureEditor();
      let working: ComponentSchema = tunedSchema;

      const additions = normalizeFieldAdditionEntries(structureChanges.fieldsAdded);
      additions.forEach((entry) => {
        const { field } = entry;
        if (!structureEditor.hasField(working, field.id)) {
          const pos = resolveFieldInsertIndex(working, entry);
          working = structureEditor.addField(working, field, pos);
        }
      });

      structureChanges.fieldsRemoved.forEach((fieldId) => {
        if (structureEditor.hasField(working, fieldId)) {
          working = structureEditor.removeField(working, fieldId);
        }
      });

      Object.entries(structureChanges.fieldsModified).forEach(([fieldId, changes]) => {
        if (structureEditor.hasField(working, fieldId)) {
          working = structureEditor.modifyField(working, fieldId, changes);
        }
      });

      if (structureChanges.fieldsReordered.length > 0) {
        const mergedOrder = reconcileFieldOrderWithSchema(working, structureChanges.fieldsReordered);
        if (mergedOrder) {
          working = structureEditor.reorderFields(working, mergedOrder);
        }
      }

      if (structureChanges.layoutChanged) {
        working = structureEditor.changeLayout(working, structureChanges.layoutChanged);
      }

      tunedSchema.fields = working.fields;
      tunedSchema.layout = working.layout;
    }

    // Apply behavior settings
    if (behaviorSettings && tunedSchema.validation) {
      if (behaviorSettings.validationMode) {
        tunedSchema.validation.showErrors = behaviorSettings.validationMode;
      }
    }

    return tunedSchema;
  }

  /**
   * Get available exporters
   */
  getAvailableFormats(): ExportFormat[] {
    return Array.from(this.exporters.keys());
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(format: string): format is ExportFormat {
    return this.exporters.has(format as ExportFormat);
  }

  // Helper methods
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}

/**
 * Singleton instance
 */
export const exportManager = new ExportManager();

/**
 * Convenience function to export component
 */
export async function exportComponent(request: ExportRequest): Promise<ExportResponse> {
  return exportManager.export(request);
}

/**
 * Create download URL from base64 ZIP data
 */
export function createDownloadUrl(zipData: string, filename: string): string {
  const blob = base64ToBlob(zipData, 'application/zip');
  return URL.createObjectURL(blob);
}

/**
 * Convert base64 to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Trigger browser download
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download ZIP file
 */
export function downloadZip(zipData: string, filename: string): void {
  const blob = base64ToBlob(zipData, 'application/zip');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from language
 */
export function getFileExtension(language: string): string {
  const extensionMap: Record<string, string> = {
    typescript: '.ts',
    javascript: '.js',
    html: '.html',
    css: '.css',
    json: '.json',
    markdown: '.md',
    vue: '.vue',
  };
  return extensionMap[language] || '.txt';
}

/**
 * Get language from filename
 */
export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    vue: 'vue',
  };
  return languageMap[ext || ''] || 'text';
}

// Re-export types for convenience
export type {
  ExportRequest,
  ExportResponse,
  ExportFile,
  ExportFormat,
  ExportOptions,
  Exporter,
  CodeGenerationContext,
};

export { DEFAULT_EXPORT_OPTIONS } from '@/types/export';

// Made with Bob