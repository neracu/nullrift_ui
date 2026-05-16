/**
 * Merges successive Partial<FieldDefinition> updates for tuning `fieldsModified`
 * so replay from the base schema retains all edits per field.
 */

import type { FieldDefinition } from '@/lib/watsonx/types';

export function mergeFieldPartial(
  previous: Partial<FieldDefinition> | undefined,
  changes: Partial<FieldDefinition>
): Partial<FieldDefinition> {
  const out: Partial<FieldDefinition> = { ...previous };

  for (const key of Object.keys(changes) as (keyof FieldDefinition)[]) {
    if (key === 'layout') {
      if (changes.layout === undefined) {
        delete out.layout;
      } else {
        out.layout = { ...out.layout, ...changes.layout };
      }
      continue;
    }
    if (key === 'validation') {
      if (changes.validation === undefined) {
        delete out.validation;
      } else {
        out.validation = { ...out.validation, ...changes.validation };
      }
      continue;
    }
    if (key === 'options') {
      out.options = changes.options;
      continue;
    }
    if (key === 'conditional') {
      out.conditional = changes.conditional;
      continue;
    }
    const value = changes[key];
    if (value === undefined && key !== 'id') {
      Reflect.deleteProperty(out, key);
    } else {
      (out as Record<string, unknown>)[key as string] = value;
    }
  }

  return out;
}

// Made with Bob
