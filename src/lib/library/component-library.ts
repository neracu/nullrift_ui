import type { ComponentSchema } from '@/lib/watsonx/types';

/** localStorage key for saved builder components (versioned for future migrations). */
export const LIBRARY_STORAGE_KEY = 'nullrift.builder.library.v1' as const;

export interface LibraryEntry {
  entryId: string;
  savedAt: string;
  sourcePrompt?: string;
  schema: ComponentSchema;
  code: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isComponentSchemaLike(value: unknown): value is ComponentSchema {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.id)) return false;
  if (!isNonEmptyString(value.name)) return false;
  if (typeof value.description !== 'string') return false;
  if (!Array.isArray(value.fields)) return false;
  if (!isRecord(value.styling)) return false;
  if (typeof value.layout !== 'string') return false;
  if (!Array.isArray(value.props)) return false;
  if (typeof value.createdAt !== 'string') return false;
  return true;
}

function isLibraryEntryLike(value: unknown): value is LibraryEntry {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.entryId)) return false;
  if (typeof value.savedAt !== 'string') return false;
  if (value.sourcePrompt !== undefined && typeof value.sourcePrompt !== 'string') return false;
  if (!isComponentSchemaLike(value.schema)) return false;
  if (!isNonEmptyString(value.code)) return false;
  return true;
}

function deepCloneSchema(schema: ComponentSchema): ComponentSchema {
  return structuredClone(schema) as ComponentSchema;
}

/**
 * Reads persisted library entries from localStorage, newest first by `savedAt`.
 * Invalid or corrupt data yields an empty list (never throws).
 */
export function readLibraryEntries(): LibraryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw?.trim()) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter(isLibraryEntryLike);
    valid.sort((a, b) => (a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0));
    return valid;
  } catch {
    return [];
  }
}

export type WriteLibraryResult = { ok: true } | { ok: false; reason: 'quota' | 'unknown' };

/**
 * Persists the full library array. Returns a result so callers can toast on failure.
 */
export function writeLibraryEntries(entries: LibraryEntry[]): WriteLibraryResult {
  if (typeof window === 'undefined') return { ok: false, reason: 'unknown' };
  try {
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(entries));
    return { ok: true };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, reason: 'quota' };
    }
    return { ok: false, reason: 'unknown' };
  }
}

export interface AppendLibraryInput {
  schema: ComponentSchema;
  code: string;
  sourcePrompt?: string;
}

/**
 * Appends a new entry with a fresh id and timestamp. Clones schema before storing.
 */
export function appendLibraryEntry(input: AppendLibraryInput): {
  entry: LibraryEntry | null;
  write: WriteLibraryResult;
} {
  const entry: LibraryEntry = {
    entryId: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    sourcePrompt: input.sourcePrompt?.trim() || undefined,
    schema: deepCloneSchema(input.schema),
    code: input.code,
  };
  const next = [...readLibraryEntries(), entry];
  const write = writeLibraryEntries(next);
  if (!write.ok) return { entry: null, write };
  return { entry, write };
}

/**
 * Removes one entry by id and rewrites storage.
 */
export function removeLibraryEntry(entryId: string): WriteLibraryResult {
  const next = readLibraryEntries().filter((e) => e.entryId !== entryId);
  return writeLibraryEntries(next);
}

// Made with Bob
