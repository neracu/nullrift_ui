import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PreviewStateManager } from '@/lib/preview/state-manager';
import type { ComponentSchema } from '@/lib/watsonx/types';

function schemaWithValidation(
  validation: NonNullable<ComponentSchema['validation']>
): ComponentSchema {
  return {
    id: 'c1',
    name: 'Form',
    description: '',
    props: [],
    fields: [
      {
        id: 'f1',
        type: 'input',
        label: 'One',
        validation: { required: true, message: 'Required' },
      },
    ],
    styling: {},
    layout: 'single-column',
    validation,
    createdAt: '',
  };
}

describe('PreviewStateManager validation timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces validate when showErrors is onChange', () => {
    const m = new PreviewStateManager(
      schemaWithValidation({ showErrors: 'onChange', validateDebounceMs: 150 })
    );
    m.updateField('f1', 'ok');
    vi.advanceTimersByTime(150);
    expect(m.getErrors().f1).toBeUndefined();

    m.updateField('f1', '');
    vi.advanceTimersByTime(150);
    expect(m.getErrors().f1).toBe('Required');
  });

  it('does not validate on change when showErrors is onSubmit', () => {
    const m = new PreviewStateManager(schemaWithValidation({ showErrors: 'onSubmit' }));
    m.updateField('f1', '');
    expect(m.getErrors().f1).toBeUndefined();
    expect(m.validateAll()).toBe(false);
    expect(m.getErrors().f1).toBe('Required');
  });

  it('validates on blur when showErrors is onBlur', () => {
    const m = new PreviewStateManager(schemaWithValidation({ showErrors: 'onBlur' }));
    m.updateField('f1', '');
    expect(m.getErrors().f1).toBeUndefined();
    m.blurField('f1');
    expect(m.getErrors().f1).toBe('Required');
  });

  it('does not validate on blur when showErrors is onSubmit', () => {
    const m = new PreviewStateManager(schemaWithValidation({ showErrors: 'onSubmit' }));
    m.updateField('f1', '');
    m.blurField('f1');
    expect(m.getErrors().f1).toBeUndefined();
  });

  it('returns first invalid field id in schema order', () => {
    const multi: ComponentSchema = {
      id: 'c1',
      name: 'Form',
      description: '',
      props: [],
      fields: [
        { id: 'a', type: 'input', label: 'A', validation: { required: true } },
        { id: 'b', type: 'input', label: 'B', validation: { required: true } },
      ],
      styling: {},
      layout: 'single-column',
      validation: { showErrors: 'onSubmit' },
      createdAt: '',
    };
    const m = new PreviewStateManager(multi);
    m.validateAll();
    expect(m.getFirstInvalidFieldIdInOrder()).toBe('a');
  });
});

// Made with Bob
