import { describe, expect, it } from 'vitest';
import { mergeFieldPartial } from '@/lib/tuning/merge-field-partial';
import { resolveFieldInsertIndex, reconcileFieldOrderWithSchema } from '@/lib/tuning/field-insert';
import type { ComponentSchema } from '@/lib/watsonx/types';
import type { FieldAdditionEntry } from '@/types/tuning';

describe('mergeFieldPartial', () => {
  it('accumulates distinct top-level keys across successive merges', () => {
    const first = mergeFieldPartial(undefined, { label: 'Email' });
    const second = mergeFieldPartial(first, { placeholder: 'you@example.com' });
    expect(second).toEqual({
      label: 'Email',
      placeholder: 'you@example.com',
    });
  });

  it('deep-merges layout and validation', () => {
    const a = mergeFieldPartial(undefined, { layout: { colSpan: 2 } });
    const b = mergeFieldPartial(a, { validation: { required: true } });
    const c = mergeFieldPartial(b, { layout: { colSpan: 1 } });
    expect(c.layout).toEqual({ colSpan: 1 });
    expect(c.validation).toEqual({ required: true });
  });

  it('replaces options when provided', () => {
    const prev = mergeFieldPartial(undefined, {
      options: [{ label: 'A', value: 'a' }],
    });
    const next = mergeFieldPartial(prev, {
      options: [{ label: 'B', value: 'b' }],
    });
    expect(next.options).toEqual([{ label: 'B', value: 'b' }]);
  });
});

describe('reconcileFieldOrderWithSchema', () => {
  const schema = (): ComponentSchema =>
    ({
      id: 'c1',
      name: 'Test',
      description: '',
      props: [],
      fields: [
        { id: 'a', type: 'input', label: 'A' },
        { id: 'b', type: 'input', label: 'B' },
        { id: 'c', type: 'input', label: 'C' },
      ],
      styling: {},
      layout: 'single-column',
      createdAt: '',
    }) as ComponentSchema;

  it('appends field ids missing from saved reorder (stale after add)', () => {
    const s = schema();
    const merged = reconcileFieldOrderWithSchema(s, ['a', 'b']);
    expect(merged).toEqual(['a', 'b', 'c']);
  });

  it('drops removed ids and keeps relative order for remaining', () => {
    const s = schema();
    s.fields = s.fields.filter((f) => f.id !== 'b');
    const merged = reconcileFieldOrderWithSchema(s, ['a', 'b', 'c']);
    expect(merged).toEqual(['a', 'c']);
  });
});

describe('resolveFieldInsertIndex', () => {
  const base = (): ComponentSchema =>
    ({
      id: 'c1',
      name: 'Test',
      description: '',
      props: [],
      fields: [
        { id: 'a', type: 'input', label: 'A' },
        { id: 'b', type: 'input', label: 'B' },
      ],
      styling: {},
      layout: 'single-column',
      createdAt: '',
    }) as ComponentSchema;

  it('inserts after insertAfterFieldId', () => {
    const schema = base();
    const entry: FieldAdditionEntry = {
      field: { id: 'n', type: 'input', label: 'N' },
      insertAfterFieldId: 'a',
    };
    expect(resolveFieldInsertIndex(schema, entry)).toBe(1);
  });

  it('appends when insertAfterFieldId is missing', () => {
    const schema = base();
    const entry: FieldAdditionEntry = {
      field: { id: 'n', type: 'input', label: 'N' },
    };
    expect(resolveFieldInsertIndex(schema, entry)).toBe(2);
  });
});
