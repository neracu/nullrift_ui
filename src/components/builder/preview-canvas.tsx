/**
 * Preview Canvas Component
 *
 * Main container for the interactive preview system with controls and frame.
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PreviewControls } from './preview-controls';
import { PreviewFrame } from './preview-frame';
import { usePreview } from '@/hooks/use-preview';
import type { PreviewProps } from '@/lib/preview/types';
import { cn } from '@/lib/utils';

/**
 * Preview Canvas Component
 *
 * Orchestrates the preview system with controls and frame.
 */
export function PreviewCanvas({
  schema,
  code,
  initialState,
  onStateChange,
  onError,
  onSubmit,
}: PreviewProps) {
  const preview = usePreview(schema, {
    initialState,
    onStateChange,
    onSubmit,
    onValidationError: (errors) => {
      console.log('Validation errors:', errors);
    },
  });

  return (
    <Card className="overflow-hidden border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-black/20 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Interactive Preview</h2>
            <p className="mt-1 text-xs text-slate-400">{schema.name || 'Generated Component'}</p>
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
    </Card>
  );
}

// Made with Bob
