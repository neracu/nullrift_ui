/**
 * Resolves where a new field should be inserted when replaying structure changes.
 */

import type { ComponentSchema } from '@/lib/watsonx/types';
import type { FieldAdditionEntry } from '@/types/tuning';

/**
 * Merges a saved field order with the current schema so reorder never drops new ids
 * or keeps removed ids (e.g. after `addField` while `fieldsReordered` is still stale).
 */
export function reconcileFieldOrderWithSchema(
  schema: ComponentSchema,
  savedOrder: string[]
): string[] | null {
  if (!savedOrder.length) return null;
  const currentIds = schema.fields.map((f) => f.id);
  if (!currentIds.length) return null;

  const idSet = new Set(currentIds);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of savedOrder) {
    if (!idSet.has(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }

  for (const id of currentIds) {
    if (!seen.has(id)) result.push(id);
  }

  if (result.length !== currentIds.length) return null;
  return result;
}

export function resolveFieldInsertIndex(
  schema: ComponentSchema,
  entry: FieldAdditionEntry
): number {
  if (entry.insertAfterFieldId) {
    const i = schema.fields.findIndex((f) => f.id === entry.insertAfterFieldId);
    if (i === -1) return schema.fields.length;
    return Math.min(i + 1, schema.fields.length);
  }
  if (entry.insertAt !== undefined) {
    return Math.max(0, Math.min(entry.insertAt, schema.fields.length));
  }
  return schema.fields.length;
}

// Made with Bob
