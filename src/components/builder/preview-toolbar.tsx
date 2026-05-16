/**
 * Preview Toolbar Component
 * 
 * Provides action buttons for the preview (export, copy, fullscreen).
 */

'use client';

import React from 'react';
import { Download, Copy, Maximize2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PreviewToolbarProps } from '@/lib/preview/types';
import { cn } from '@/lib/utils';

/**
 * Preview Toolbar Component
 */
export function PreviewToolbar({
  canExport = true,
  canCopy = true,
  onExport,
  onCopy,
  onFullscreen
}: PreviewToolbarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/20 px-4 py-3">
      <div className="text-xs text-slate-400">
        Interactive preview • Click to interact
      </div>

      <div className="flex items-center gap-2">
        {/* Copy Button */}
        {canCopy && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3 gap-2 text-slate-400 hover:text-white hover:bg-white/5',
              copied && 'text-green-400'
            )}
            onClick={handleCopy}
            disabled={!onCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-xs">Copy Code</span>
              </>
            )}
          </Button>
        )}

        {/* Export Button */}
        {canExport && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-2 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={onExport}
            disabled={!onExport}
          >
            <Download className="h-4 w-4" />
            <span className="text-xs">Export</span>
          </Button>
        )}

        {/* Fullscreen Button */}
        {onFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-2 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={onFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">Fullscreen</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// Made with Bob