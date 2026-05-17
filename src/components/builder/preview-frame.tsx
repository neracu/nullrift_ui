/**
 * Preview Frame Component
 * 
 * Renders the component in an isolated container with proper viewport sizing.
 * Uses direct rendering instead of iframe for better performance and simpler implementation.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { DynamicRenderer } from '@/lib/preview/renderer';
import type { PreviewFrameProps, PreviewTheme } from '@/lib/preview/types';
import { VIEWPORT_CONFIGS } from '@/lib/preview/types';
import { cn } from '@/lib/utils';

/**
 * Preview Frame Component
 * 
 * Renders the component preview with viewport sizing and theme support
 */
export function PreviewFrame({
  schema,
  code,
  state,
  onFieldChange,
  onFieldBlur,
  onSubmit,
  onReady,
  onError,
  canvasMode = 'interact',
  selectedFieldIds = [],
  onFieldCanvasSelect,
  onCanvasReorder,
  onCanvasLayerReorder,
  onCycleFieldColSpan,
  onDesignSchemaMetaChange,
  onDesignFieldCopyChange,
}: PreviewFrameProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get viewport configuration
  const viewportConfig = VIEWPORT_CONFIGS[state.viewport];

  const schemaTheme = schema.styling?.theme;
  const effectiveTheme: PreviewTheme =
    schemaTheme === 'light' || schemaTheme === 'dark' ? schemaTheme : state.theme;

  // Initialize preview
  useEffect(() => {
    try {
      setIsReady(true);
      onReady?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize preview');
      setError(error);
      onError?.(error);
    }
  }, [onReady, onError]);

  // Handle form submission
  const handleSubmit = (data: Record<string, any>) => {
    onSubmit(data);
  };

  // Loading state
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
          <p className="text-sm text-sidebar-foreground/65">Loading preview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-sidebar-foreground">Preview Error</p>
          <p className="text-xs text-sidebar-foreground/65">{error.message}</p>
        </div>
      </div>
    );
  }

  // Calculate container styles
  const containerStyle: React.CSSProperties = {
    maxWidth: state.viewport === 'full' ? '100%' : `${viewportConfig.width}px`,
    minHeight: state.viewport === 'full' ? 'auto' : `${Math.min(viewportConfig.height, 800)}px`,
    transform: `scale(${state.zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease-in-out'
  };

  return (
    <div className="relative w-full overflow-auto">
      {/* Viewport Label */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="text-xs font-medium text-sidebar-foreground/60">
          {viewportConfig.icon} {viewportConfig.label}
        </span>
        {state.viewport !== 'full' && (
          <span className="text-xs text-sidebar-foreground/50">
            {viewportConfig.width} × {viewportConfig.height}
          </span>
        )}
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div
          style={containerStyle}
          className={cn(
            'w-full rounded-lg border shadow-2xl transition-all duration-200',
            effectiveTheme === 'dark'
              ? 'bg-sidebar border-sidebar-border'
              : 'bg-white border-slate-200'
          )}
        >
          {/* Render Component */}
          <div className="p-4">
            <DynamicRenderer
              schema={schema}
              formData={state.formData}
              errors={state.errors}
              theme={effectiveTheme}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              onSubmit={handleSubmit}
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
        </div>
      </div>

      {/* Zoom Indicator */}
      {state.zoom !== 100 && (
        <div className="mt-4 text-center">
          <span className="text-xs text-sidebar-foreground/55">
            Zoom: {state.zoom}%
          </span>
        </div>
      )}
    </div>
  );
}

// Made with Bob