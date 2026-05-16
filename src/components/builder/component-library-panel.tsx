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
      <div className={cn('mt-6 flex-1', className)}>
        <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing saved yet. After you generate a component, use <span className="font-medium text-foreground/80">Save to library</span> in the workspace toolbar.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('mt-6 min-h-0 flex-1 pr-3', className)}>
      <ul className="flex flex-col gap-2 pb-2">
        {entries.map((entry) => (
          <li
            key={entry.entryId}
            className="flex items-stretch gap-2 rounded-lg border border-border/80 bg-muted/10 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{entry.schema.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatSavedAt(entry.savedAt)}</p>
              {entry.sourcePrompt ? (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/90" title={entry.sourcePrompt}>
                  {truncatePrompt(entry.sourcePrompt)}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col justify-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${entry.schema.name} from library`}
                onClick={() => onRemove(entry.entryId)}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={() => onLoad(entry)}>
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
