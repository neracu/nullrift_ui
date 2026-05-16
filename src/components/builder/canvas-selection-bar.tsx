/**
 * Floating actions for multi-selected fields in design mode.
 */

'use client';

import { CopyPlus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CanvasSelectionBarProps {
  count: number;
  onRemove: () => void;
  onDuplicate: () => void;
  onClear: () => void;
  className?: string;
}

/**
 * Minimal pill bar for batch field operations on the preview canvas.
 */
export function CanvasSelectionBar({
  count,
  onRemove,
  onDuplicate,
  onClear,
  className,
}: CanvasSelectionBarProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-full border border-border',
        'bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md',
        className
      )}
      role="toolbar"
      aria-label="Selected fields actions"
    >
      <span className="text-muted-foreground">
        {count} selected
      </span>
      <Button type="button" size="sm" variant="secondary" className="h-8 gap-1" onClick={onDuplicate}>
        <CopyPlus className="size-3.5" />
        Duplicate
      </Button>
      <Button type="button" size="sm" variant="destructive" className="h-8 gap-1" onClick={onRemove}>
        <Trash2 className="size-3.5" />
        Remove
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={onClear} aria-label="Clear selection">
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

// Made with Bob
