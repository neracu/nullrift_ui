/**
 * Sortable field shell for design-mode canvas: drag handle + selection chrome.
 */

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Columns2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface DesignFieldRowProps {
  id: string;
  disabledSortable: boolean;
  selected: boolean;
  showColTool: boolean;
  colSpanLabel: string;
  onColCycle: () => void;
  onSelect: (additive: boolean) => void;
  children: React.ReactNode;
  colSpanClass: string;
}

/**
 * One sortable field row with drag handle (design mode only).
 */
export function DesignFieldRow({
  id,
  disabledSortable,
  selected,
  showColTool,
  colSpanLabel,
  onColCycle,
  onSelect,
  children,
  colSpanClass,
}: DesignFieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: disabledSortable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-field-id={id}
      className={cn(
        'relative flex gap-1 rounded-md border border-transparent bg-transparent p-1 transition-colors',
        colSpanClass,
        selected && 'border-primary bg-primary/5 ring-1 ring-primary/40',
        isDragging && 'z-10 opacity-90 shadow-md'
      )}
    >
      <button
        type="button"
        className={cn(
          'mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border border-border',
          'text-slate-500 hover:bg-muted hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
          disabledSortable && 'pointer-events-none opacity-40'
        )}
        aria-label={`Drag to reorder field ${id}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(e.metaKey || e.ctrlKey);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(e.metaKey || e.ctrlKey);
            }
          }}
        >
          <div className="pointer-events-none">{children}</div>
        </div>
        {showColTool && selected && (
          <div className="pointer-events-auto mt-1 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs text-slate-800 dark:text-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                onColCycle();
              }}
            >
              <Columns2 className="size-3.5" />
              {colSpanLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
