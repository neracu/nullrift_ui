/**
 * Export Modal Component
 * 
 * Modal dialog for configuring and exporting components.
 * Allows users to select format, options, preview files, and download.
 */

"use client";

import { useState } from 'react';
import { X, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CodeViewer } from './code-viewer';
import { downloadZip, formatFileSize } from '@/lib/export';
import type { ComponentSchema } from '@/lib/watsonx/types';
import type { TuningState } from '@/types/tuning';
import type { ExportFormat, ExportOptions, ExportResponse } from '@/types/export';
import { FORMAT_LABELS, FORMAT_DESCRIPTIONS } from '@/types/export';

interface ExportModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Component schema to export */
  schema: ComponentSchema;
  
  /** Current tuning state */
  tuningState?: TuningState;
}

type ExportPhase = 'config' | 'generating' | 'preview' | 'error';

/**
 * Export modal with format selection and options
 */
export function ExportModal({
  isOpen,
  onClose,
  schema,
  tuningState,
}: ExportModalProps) {
  const [phase, setPhase] = useState<ExportPhase>('config');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('react-ts');
  const [options, setOptions] = useState<ExportOptions>({
    includeTypes: true,
    includeTests: false,
    includeStorybook: false,
    bundled: false,
    includePackageJson: true,
    includeReadme: true,
    includeComments: true,
  });
  const [exportResult, setExportResult] = useState<ExportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle export generation
   */
  const handleExport = async () => {
    setPhase('generating');
    setError(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema,
          format: selectedFormat,
          options,
          tuningState,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const result: ExportResponse = await response.json();
      setExportResult(result);
      setPhase('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setPhase('error');
    }
  };

  /**
   * Handle download
   */
  const handleDownload = () => {
    if (!exportResult) return;

    if (exportResult.files.length === 1) {
      // Single file - download directly
      const file = exportResult.files[0];
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (exportResult.zipData) {
      // Multiple files - download as ZIP
      const filename = `${exportResult.metadata.componentName.toLowerCase()}-${selectedFormat}.zip`;
      downloadZip(exportResult.zipData, filename);
    }
  };

  /**
   * Reset and close
   */
  const handleClose = () => {
    setPhase('config');
    setExportResult(null);
    setError(null);
    onClose();
  };

  /**
   * Update option
   */
  const updateOption = (key: keyof ExportOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Check if option is applicable to current format
   */
  const isOptionApplicable = (option: keyof ExportOptions): boolean => {
    const applicability: Record<keyof ExportOptions, ExportFormat[]> = {
      includeTypes: ['react-ts', 'vue'],
      includeTests: ['react-ts', 'react-js', 'vue'],
      includeStorybook: ['react-ts', 'react-js', 'vue'],
      bundled: ['html'],
      includePackageJson: ['react-ts', 'react-js', 'vue'],
      includeReadme: ['react-ts', 'react-js', 'vue', 'html'],
      includeComments: ['react-ts', 'react-js', 'vue', 'html'],
      componentName: ['react-ts', 'react-js', 'vue', 'html'],
    };

    return applicability[option]?.includes(selectedFormat) ?? true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Export Component
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {phase === 'config' && (
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Export Format
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['react-ts', 'react-js', 'vue', 'html'] as ExportFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all
                        ${
                          selectedFormat === format
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="font-semibold text-gray-900 mb-1">
                        {FORMAT_LABELS[format]}
                      </div>
                      <div className="text-sm text-gray-600">
                        {FORMAT_DESCRIPTIONS[format]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Export Options
                </Label>
                <div className="space-y-3">
                  {isOptionApplicable('includeTypes') && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Include Type Definitions</div>
                        <div className="text-sm text-gray-600">Generate TypeScript type files</div>
                      </div>
                      <Switch
                        checked={options.includeTypes ?? true}
                        onCheckedChange={(checked) => updateOption('includeTypes', checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable('includeTests') && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Include Tests</div>
                        <div className="text-sm text-gray-600">Generate test files</div>
                      </div>
                      <Switch
                        checked={options.includeTests ?? false}
                        onCheckedChange={(checked) => updateOption('includeTests', checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable('includeStorybook') && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Include Storybook</div>
                        <div className="text-sm text-gray-600">Generate Storybook stories</div>
                      </div>
                      <Switch
                        checked={options.includeStorybook ?? false}
                        onCheckedChange={(checked) => updateOption('includeStorybook', checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable('bundled') && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Single File</div>
                        <div className="text-sm text-gray-600">Bundle everything in one file</div>
                      </div>
                      <Switch
                        checked={options.bundled ?? false}
                        onCheckedChange={(checked) => updateOption('bundled', checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable('includePackageJson') && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Include package.json</div>
                        <div className="text-sm text-gray-600">Add package.json with dependencies</div>
                      </div>
                      <Switch
                        checked={options.includePackageJson ?? true}
                        onCheckedChange={(checked) => updateOption('includePackageJson', checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable('includeReadme') && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Include README</div>
                        <div className="text-sm text-gray-600">Add README with usage instructions</div>
                      </div>
                      <Switch
                        checked={options.includeReadme ?? true}
                        onCheckedChange={(checked) => updateOption('includeReadme', checked)}
                      />
                    </div>
                  )}

                  {isOptionApplicable('includeComments') && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Include Comments</div>
                        <div className="text-sm text-gray-600">Add code comments and JSDoc</div>
                      </div>
                      <Switch
                        checked={options.includeComments ?? true}
                        onCheckedChange={(checked) => updateOption('includeComments', checked)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {phase === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Generating files...</p>
              <p className="text-sm text-gray-600">This may take a moment</p>
            </div>
          )}

          {phase === 'preview' && exportResult && (
            <div className="space-y-4">
              {/* Success message */}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-green-900">Export successful!</div>
                  <div className="text-sm text-green-700">
                    Generated {exportResult.metadata.fileCount} file(s) • {formatFileSize(exportResult.metadata.totalSize)}
                  </div>
                </div>
              </div>

              {/* Code preview */}
              <CodeViewer
                files={exportResult.files}
                title="Generated Files"
                maxHeight="400px"
              />
            </div>
          )}

          {phase === 'error' && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Export failed</p>
              <p className="text-sm text-gray-600 text-center max-w-md">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            onClick={handleClose}
          >
            {phase === 'preview' ? 'Close' : 'Cancel'}
          </Button>

          {phase === 'config' && (
            <Button onClick={handleExport}>
              Generate Export
            </Button>
          )}

          {phase === 'preview' && (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download {exportResult && exportResult.files.length > 1 ? 'ZIP' : 'File'}
            </Button>
          )}

          {phase === 'error' && (
            <Button onClick={() => setPhase('config')}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob