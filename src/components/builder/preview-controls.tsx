/**
 * Preview Controls Component
 *
 * Viewport, zoom, canvas mode, and reset for the preview canvas.
 */

'use client';

import React from 'react';
import { Monitor, Smartphone, Tablet, Maximize, ZoomIn, ZoomOut, RotateCcw, PenLine, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PreviewControlsProps, ViewportSize, PreviewCanvasMode } from '@/lib/preview/types';
import { cn } from '@/lib/utils';

/**
 * Preview Controls Component
 */
export function PreviewControls({
  viewport,
  zoom,
  isLoading = false,
  onViewportChange,
  onZoomChange,
  onReset,
  canvasMode = 'interact',
  onCanvasModeChange,
}: PreviewControlsProps) {
  const viewportOptions: Array<{ value: ViewportSize; icon: React.ReactNode; label: string }> = [
    { value: 'mobile', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
    { value: 'tablet', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
    { value: 'desktop', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
    { value: 'full', icon: <Maximize className="h-4 w-4" />, label: 'Full' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onCanvasModeChange && (
        <div
          className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/20 p-1"
          role="group"
          aria-label="Preview mode"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={cn(
              'h-8 gap-1.5 px-2 sm:px-3',
              canvasMode === 'interact'
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            )}
            aria-pressed={canvasMode === 'interact'}
            onClick={() => onCanvasModeChange('interact')}
            title="Interact — use the form (I)"
          >
            <MousePointer2 className="h-4 w-4" />
            <span className="hidden text-xs sm:inline">Interact</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={cn(
              'h-8 gap-1.5 px-2 sm:px-3',
              canvasMode === 'design'
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            )}
            aria-pressed={canvasMode === 'design'}
            onClick={() => onCanvasModeChange('design')}
            title="Design — layout on canvas (D)"
          >
            <PenLine className="h-4 w-4" />
            <span className="hidden text-xs sm:inline">Design</span>
          </Button>
        </div>
      )}

      {/* Viewport Selector */}
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
        {viewportOptions.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={cn(
              'h-8 px-3 gap-2 transition-colors',
              viewport === option.value
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
            onClick={() => onViewportChange(option.value)}
            title={option.label}
          >
            {option.icon}
            <span className="hidden sm:inline text-xs">{option.label}</span>
          </Button>
        ))}
      </div>

      {/* Reset — same outer chrome as viewport row so height matches Full / zoom */}
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className={cn(
            'h-8 px-3 gap-2 transition-colors',
            'text-slate-400 hover:text-white hover:bg-white/5'
          )}
          onClick={onReset}
          title="Reset preview"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Reset</span>
        </Button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading || zoom <= 50}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/5"
          onClick={() => onZoomChange(zoom - 10)}
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <span className="min-w-[3rem] text-center text-xs font-medium text-slate-300">
          {zoom}%
        </span>

        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading || zoom >= 200}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/5"
          onClick={() => onZoomChange(zoom + 10)}
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Made with Bob