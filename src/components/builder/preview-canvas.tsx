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
import { cn, formatSchemaDisplayName } from '@/lib/utils';

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
  canvasMode = 'interact',
  selectedFieldIds = [],
  onFieldCanvasSelect,
  onCanvasReorder,
  onCanvasLayerReorder,
  onCycleFieldColSpan,
  onCanvasModeChange,
  onDesignSchemaMetaChange,
  onDesignFieldCopyChange,
}: PreviewProps) {
  const preview = usePreview(schema, {
    initialState,
    onStateChange,
    onSubmit,
  });

  return (
    <Card className="overflow-hidden border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-black/20 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Interactive Preview</h2>
            <p className="mt-1 text-xs text-slate-400">
              {schema.name ? formatSchemaDisplayName(schema.name) : 'Generated Component'}
            </p>
          </div>

          <PreviewControls
            viewport={preview.state.viewport}
            zoom={preview.state.zoom}
            isLoading={preview.state.isLoading}
            onViewportChange={preview.setViewport}
            onZoomChange={preview.setZoom}
            onReset={preview.reset}
            canvasMode={canvasMode}
            onCanvasModeChange={onCanvasModeChange}
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
          onFieldBlur={preview.blurField}
          onSubmit={preview.submit}
          onError={onError}
          canvasMode={canvasMode}
          selectedFieldIds={selectedFieldIds}
          onFieldCanvasSelect={onFieldCanvasSelect}
          onCanvasReorder={onCanvasReorder}
          onCanvasLayerReorder={onCanvasLayerReorder}
          onCycleFieldColSpan={onCycleFieldColSpan}
          onDesignSchemaMetaChange={onDesignSchemaMetaChange}
          onDesignFieldCopyChange={onDesignFieldCopyChange}
        />
      </div>
    </Card>
  );
}

// Made with Bob
