/**
 * Maps UX tuning behavior settings to ComponentSchema.validation and back,
 * so preview, export, and the tuning panel share one contract.
 */

import type { ComponentSchema, ValidationConfig } from '@/lib/watsonx/types';
import type { BehaviorSettings } from '@/types/tuning';
import { DEFAULT_TUNING_STATE } from '@/types/tuning';

const DEFAULT_VALIDATE_DEBOUNCE_MS = 300 as const;

/** Legacy persisted tuning used `showErrorsInline` boolean; map to `errorPosition`. */
export function migrateLegacyBehaviorSettings(
  raw: Partial<BehaviorSettings> & { showErrorsInline?: boolean }
): BehaviorSettings {
  const defaults = DEFAULT_TUNING_STATE.behaviorSettings;
  const { showErrorsInline, ...rest } = raw;
  let errorPosition = rest.errorPosition ?? defaults.errorPosition;
  if (
    rest.errorPosition === undefined &&
    typeof showErrorsInline === 'boolean'
  ) {
    errorPosition = showErrorsInline ? 'below' : 'tooltip';
  }
  return {
    ...defaults,
    ...rest,
    errorPosition,
  };
}

/**
 * Build ValidationConfig from tuning panel state (explicit defaults for export/preview).
 */
export function behaviorSettingsToValidationConfig(
  settings: BehaviorSettings
): ValidationConfig {
  const d = DEFAULT_TUNING_STATE.behaviorSettings;
  const mode = settings.validationMode ?? d.validationMode!;
  const errorPosition = settings.errorPosition ?? d.errorPosition!;
  const rawDebounce = settings.validateDebounceMs ?? d.validateDebounceMs;
  const validateDebounceMs =
    mode === 'onChange'
      ? rawDebounce === 0 || rawDebounce === 150 || rawDebounce === 300
        ? rawDebounce
        : DEFAULT_VALIDATE_DEBOUNCE_MS
      : 0;

  return {
    showErrors: mode,
    errorPosition,
    scrollToFirstError: settings.scrollToFirstErrorOnSubmit ?? d.scrollToFirstErrorOnSubmit,
    validateDebounceMs,
    showRequiredIndicators:
      settings.showRequiredIndicators ?? d.showRequiredIndicators,
    autoFocus: settings.autoFocus ?? d.autoFocus,
    submitOnEnter: settings.submitOnEnter ?? d.submitOnEnter,
  };
}

/**
 * Hydrate BehaviorSettings from schema.validation (e.g. after AI generation).
 */
export function validationConfigToBehaviorSettings(
  v: ValidationConfig | undefined
): BehaviorSettings {
  const d = DEFAULT_TUNING_STATE.behaviorSettings;
  if (!v) return { ...d };

  return migrateLegacyBehaviorSettings({
    validationMode: v.showErrors ?? d.validationMode,
    errorPosition: v.errorPosition ?? d.errorPosition,
    scrollToFirstErrorOnSubmit: v.scrollToFirstError ?? d.scrollToFirstErrorOnSubmit,
    validateDebounceMs:
      v.validateDebounceMs === 0 || v.validateDebounceMs === 150 || v.validateDebounceMs === 300
        ? v.validateDebounceMs
        : d.validateDebounceMs,
    autoFocus: v.autoFocus ?? d.autoFocus,
    submitOnEnter: v.submitOnEnter ?? d.submitOnEnter,
    showRequiredIndicators: v.showRequiredIndicators ?? d.showRequiredIndicators,
  });
}

/**
 * Merge resolved validation defaults for preview/runtime (read-only helper).
 */
export function resolveValidationConfig(schema: ComponentSchema): Required<
  Pick<
    ValidationConfig,
    | 'showErrors'
    | 'errorPosition'
    | 'scrollToFirstError'
    | 'validateDebounceMs'
    | 'showRequiredIndicators'
    | 'autoFocus'
    | 'submitOnEnter'
  >
> &
  Pick<ValidationConfig, 'onSubmit'> {
  const v = behaviorSettingsToValidationConfig(
    validationConfigToBehaviorSettings(schema.validation)
  );
  const mode = v.showErrors ?? 'onBlur';
  const validateDebounceMs =
    mode === 'onChange'
      ? v.validateDebounceMs === 0 ||
        v.validateDebounceMs === 150 ||
        v.validateDebounceMs === 300
        ? v.validateDebounceMs
        : DEFAULT_VALIDATE_DEBOUNCE_MS
      : 0;

  return {
    onSubmit: schema.validation?.onSubmit,
    showErrors: mode,
    errorPosition: v.errorPosition ?? 'below',
    scrollToFirstError: v.scrollToFirstError ?? false,
    validateDebounceMs,
    showRequiredIndicators: v.showRequiredIndicators ?? true,
    autoFocus: v.autoFocus ?? false,
    submitOnEnter: v.submitOnEnter ?? true,
  };
}

/**
 * Clone schema and attach merged validation from behavior tuning.
 */
export function applyBehaviorToSchema(
  schema: ComponentSchema,
  settings: BehaviorSettings
): ComponentSchema {
  const next = JSON.parse(JSON.stringify(schema)) as ComponentSchema;
  const merged: ValidationConfig = {
    ...next.validation,
    ...behaviorSettingsToValidationConfig(settings),
  };
  next.validation = merged;
  return next;
}

// Made with Bob
