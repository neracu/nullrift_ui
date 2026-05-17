'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LibraryEntry } from '@/lib/library/component-library';
import { cn } from '@/lib/utils';

const PROMPT_SNIPPET_MAX = 72;

export interface ComponentLibraryPanelProps {
  entries: LibraryEntry[];
  onLoad: (entry: LibraryEntry) => void;
  onRemove: (entryId: string) => void;
  className?: string;
}

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function truncatePrompt(text: string): string {
  const t = text.trim();
  if (t.length <= PROMPT_SNIPPET_MAX) return t;
  return `${t.slice(0, PROMPT_SNIPPET_MAX).trim()}…`;
}

/**
 * Minimal list of saved library entries with load and remove actions.
 */
export function ComponentLibraryPanel({ entries, onLoad, onRemove, className }: ComponentLibraryPanelProps) {
  if (entries.length === 0) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        <p className="rounded-lg border border-dashed border-sidebar-border/55 bg-sidebar-accent/20 px-4 py-10 text-center text-sm text-sidebar-foreground/70 backdrop-blur-sm">
          Nothing saved yet. After you generate a component, use{' '}
          <span className="font-medium text-sidebar-foreground">Save to library</span> in the workspace toolbar.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('min-h-0 flex-1 pr-2', className)}>
      <ul className="flex flex-col gap-2 pb-2 pr-1">
        {entries.map((entry) => (
          <li
            key={entry.entryId}
            className="flex items-stretch gap-2 rounded-lg border border-sidebar-border/55 bg-sidebar-accent/30 px-3 py-2.5 shadow-sm ring-1 ring-sidebar-border/15 backdrop-blur-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{entry.schema.name}</p>
              <p className="mt-0.5 text-xs text-sidebar-foreground/60">{formatSavedAt(entry.savedAt)}</p>
              {entry.sourcePrompt ? (
                <p
                  className="mt-1 line-clamp-2 text-xs text-sidebar-foreground/70"
                  title={entry.sourcePrompt}
                >
                  {truncatePrompt(entry.sourcePrompt)}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col justify-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-sidebar-foreground/55 hover:bg-destructive/15 hover:text-destructive"
                aria-label={`Remove ${entry.schema.name} from library`}
                onClick={() => onRemove(entry.entryId)}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 border-0 bg-sidebar-primary px-2 text-xs text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 focus-visible:ring-sidebar-ring"
                onClick={() => onLoad(entry)}
              >
                Load
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

// Made with Bob
