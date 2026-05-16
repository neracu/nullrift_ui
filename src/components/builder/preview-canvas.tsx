/**
 * Preview Canvas Component
 * 
 * Main container for the interactive preview system with controls and toolbar.
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PreviewControls } from './preview-controls';
import { PreviewFrame } from './preview-frame';
import { PreviewToolbar } from './preview-toolbar';
import { usePreview } from '@/hooks/use-preview';
import type { PreviewProps } from '@/lib/preview/types';
import { cn } from '@/lib/utils';

/**
 * Preview Canvas Component
 * 
 * Orchestrates the preview system with controls, frame, and toolbar
 */
export function PreviewCanvas({
  schema,
  code,
  initialState,
  onStateChange,
  onError,
  onSubmit,
  onExport
}: PreviewProps) {
  // Use preview hook for state management
  const preview = usePreview(schema, {
    initialState,
    onStateChange,
    onSubmit,
    onValidationError: (errors) => {
      console.log('Validation errors:', errors);
    }
  });

  // Handle copy code
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      console.log('Code copied to clipboard');
    }).catch((err) => {
      console.error('Failed to copy code:', err);
    });
  };

  // Handle export
  const handleExport = () => {
    onExport?.();
  };

  return (
    <Card className="overflow-hidden border-white/10 bg-black/30 backdrop-blur-xl">
      {/* Header with Controls */}
      <div className="border-b border-white/10 bg-black/20 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Interactive Preview
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {schema.name || 'Generated Component'}
            </p>
          </div>
          
          <PreviewControls
            viewport={preview.state.viewport}
            theme={preview.state.theme}
            zoom={preview.state.zoom}
            isLoading={preview.state.isLoading}
            onViewportChange={preview.setViewport}
            onThemeChange={preview.setTheme}
            onZoomChange={preview.setZoom}
            onReset={preview.reset}
          />
        </div>
      </div>

      {/* Preview Frame */}
      <div
        className={cn(
          'relative min-h-[400px] p-8 transition-colors',
          'bg-gradient-to-br from-slate-900 to-slate-800'
        )}
      >
        <PreviewFrame
          schema={schema}
          code={code}
          state={preview.state}
          onFieldChange={preview.updateField}
          onSubmit={preview.submit}
          onError={onError}
        />
      </div>

      {/* Toolbar */}
      <PreviewToolbar
        canExport={true}
        canCopy={true}
        onExport={handleExport}
        onCopy={handleCopy}
      />

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="border-t border-white/10 bg-black/20 px-4 py-2">
          <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300">
            Debug Info
          </summary>
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <div>Viewport: {preview.state.viewport}</div>
            <div>Theme: {preview.state.theme}</div>
            <div>Zoom: {preview.state.zoom}%</div>
            <div>Fields: {Object.keys(preview.state.formData).length}</div>
            <div>Errors: {Object.keys(preview.state.errors).length}</div>
            <div>
              Form Data: 
              <pre className="mt-1 rounded bg-black/50 p-2 text-[10px]">
                {JSON.stringify(preview.state.formData, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
    </Card>
  );
}

// Made with Bob