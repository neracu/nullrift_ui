import { describe, expect, it } from 'vitest';
import type { ComponentSchema } from '@/lib/watsonx/types';
import {
  applyBehaviorToSchema,
  behaviorSettingsToValidationConfig,
  migrateLegacyBehaviorSettings,
  validationConfigToBehaviorSettings,
} from '@/lib/tuning/behavior-schema';
import { DEFAULT_TUNING_STATE } from '@/types/tuning';

function minimalSchema(validation?: ComponentSchema['validation']): ComponentSchema {
  return {
    id: 'c1',
    name: 'Test',
    description: '',
    props: [],
    fields: [{ id: 'a', type: 'input', label: 'A' }],
    styling: {},
    layout: 'single-column',
    validation,
    createdAt: '',
  };
}

describe('behavior-schema', () => {
  it('hydrates BehaviorSettings from ValidationConfig', () => {
    const b = validationConfigToBehaviorSettings({
      showErrors: 'onChange',
      errorPosition: 'tooltip',
      scrollToFirstError: true,
      validateDebounceMs: 150,
    });
    expect(b.validationMode).toBe('onChange');
    expect(b.errorPosition).toBe('tooltip');
    expect(b.scrollToFirstErrorOnSubmit).toBe(true);
    expect(b.validateDebounceMs).toBe(150);
  });

  it('maps BehaviorSettings to ValidationConfig with zero debounce when not onChange', () => {
    const v = behaviorSettingsToValidationConfig({
      ...DEFAULT_TUNING_STATE.behaviorSettings,
      validationMode: 'onBlur',
      validateDebounceMs: 300,
    });
    expect(v.showErrors).toBe('onBlur');
    expect(v.validateDebounceMs).toBe(0);
  });

  it('applyBehaviorToSchema merges validation and preserves onSubmit', () => {
    const schema = minimalSchema({ onSubmit: 'validate', showErrors: 'onBlur' });
    const next = applyBehaviorToSchema(schema, {
      ...DEFAULT_TUNING_STATE.behaviorSettings,
      validationMode: 'onSubmit',
      errorPosition: 'inline',
    });
    expect(next.validation?.onSubmit).toBe('validate');
    expect(next.validation?.showErrors).toBe('onSubmit');
    expect(next.validation?.errorPosition).toBe('inline');
  });

  it('migrates legacy showErrorsInline to errorPosition', () => {
    const b = migrateLegacyBehaviorSettings({ showErrorsInline: false });
    expect(b.errorPosition).toBe('tooltip');
    const b2 = migrateLegacyBehaviorSettings({ showErrorsInline: true });
    expect(b2.errorPosition).toBe('below');
  });
});

// Made with Bob
