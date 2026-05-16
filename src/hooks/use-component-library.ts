'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ComponentSchema } from '@/lib/watsonx/types';
import {
  appendLibraryEntry,
  LIBRARY_STORAGE_KEY,
  readLibraryEntries,
  removeLibraryEntry,
  type LibraryEntry,
} from '@/lib/library/component-library';

/**
 * Client-side saved components list (localStorage) with cross-tab refresh.
 */
export function useComponentLibrary() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(readLibraryEntries());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LIBRARY_STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const saveFromBuilder = useCallback(
    (params: { schema: ComponentSchema; code: string; sourcePrompt?: string }): LibraryEntry | null => {
      const { entry, write } = appendLibraryEntry({
        schema: params.schema,
        code: params.code,
        sourcePrompt: params.sourcePrompt,
      });
      if (!write.ok || !entry) {
        if (write.reason === 'quota') {
          toast.error('Library is full', {
            description: 'Browser storage quota exceeded. Remove entries or free disk space.',
          });
        } else {
          toast.error('Could not save to library', {
            description: 'Storage may be unavailable or disabled.',
          });
        }
        return null;
      }
      refresh();
      return entry;
    },
    [refresh]
  );

  const removeEntry = useCallback(
    (entryId: string) => {
      const write = removeLibraryEntry(entryId);
      if (!write.ok) {
        if (write.reason === 'quota') {
          toast.error('Could not update library', { description: 'Storage quota exceeded.' });
        } else {
          toast.error('Could not remove entry', { description: 'Storage may be unavailable.' });
        }
        return;
      }
      refresh();
      toast.success('Removed from library');
    },
    [refresh]
  );

  const getEntry = useCallback(
    (entryId: string) => entries.find((e) => e.entryId === entryId),
    [entries]
  );

  return { entries, refresh, saveFromBuilder, removeEntry, getEntry };
}

// Made with Bob
