/**
 * Dynamic Component Renderer
 *
 * Converts ComponentSchema to interactive React elements using React.createElement().
 * Handles form state, validation, and user interactions.
 */

'use client';

import React, { type ReactElement, type FormEvent, type CSSProperties, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { ComponentSchema, FieldDefinition } from '../watsonx/types';
import type { RendererProps, PreviewTheme } from './types';
import { cn, formatSchemaDisplayName } from '../utils';
import { DesignFieldRow } from '@/components/builder/design-field-row';

/** Focus ring uses `--preview-primary` set on the preview form. */
const PREVIEW_FOCUS_RING =
  'focus:outline-none focus:ring-2 focus:ring-[color:var(--preview-primary)]';

const BORDER_RADIUS_TAILWIND: Record<
  NonNullable<ComponentSchema['styling']['borderRadius']>,
  string
> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

/**
 * Resolves schema.styling (including tuning overrides) for the live preview.
 */
function resolvePreviewStyling(schema: ComponentSchema) {
  const s = schema.styling ?? {};
  const br = s.borderRadius ?? 'md';

  let fontFamilyClass = 'font-sans';
  if (s.fontFamily === 'serif') fontFamilyClass = 'font-serif';
  else if (s.fontFamily === 'mono') fontFamilyClass = 'font-mono';

  let fontSizeClass = 'text-base';
  if (s.fontSize === 'sm') fontSizeClass = 'text-sm';
  else if (s.fontSize === 'lg') fontSizeClass = 'text-lg';

  return {
    primaryColor: s.primaryColor ?? '#3b82f6',
    secondaryColor: s.secondaryColor ?? '#ec4899',
    backgroundColor: s.backgroundColor,
    textColor: s.textColor,
    borderRadiusClass: BORDER_RADIUS_TAILWIND[br] ?? 'rounded-md',
    fontFamilyClass,
    fontSizeClass,
  };
}

function fieldColSpanClass(
  layout: ComponentSchema['layout'],
  colSpan?: 1 | 2 | 3
): string {
  if (!colSpan || colSpan <= 1) return '';
  if (layout === 'two-column') {
    if (colSpan >= 2) return 'md:col-span-2';
  }
  if (layout === 'grid') {
    if (colSpan === 2) return 'sm:col-span-2';
    if (colSpan === 3) return 'sm:col-span-2 lg:col-span-3';
  }
  return '';
}

function mergeVisibleReorder(
  allFields: FieldDefinition[],
  visibleOrder: string[],
  formData: Record<string, unknown>
): string[] {
  const visibleSet = new Set(
    allFields.filter((f) => shouldShowField(f, formData)).map((f) => f.id)
  );
  let vi = 0;
  return allFields.map((f) => {
    if (!visibleSet.has(f.id)) return f.id;
    return visibleOrder[vi++] ?? f.id;
  });
}

function layoutContainerClass(
  layout: ComponentSchema['layout'],
  spacing: 'compact' | 'normal' | 'relaxed'
): string {
  const stackGap =
    spacing === 'compact' ? 'space-y-2' : spacing === 'relaxed' ? 'space-y-6' : 'space-y-4';
  const gridGap =
    spacing === 'compact' ? 'gap-2' : spacing === 'relaxed' ? 'gap-6' : 'gap-4';

  switch (layout) {
    case 'single-column':
      return stackGap;
    case 'two-column':
      return cn('grid grid-cols-1 md:grid-cols-2', gridGap);
    case 'grid':
      return cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', gridGap);
    default:
      return stackGap;
  }
}

/**
 * Main Dynamic Renderer Component
 *
 * Renders a component from schema with full interactivity
 */
export function DynamicRenderer({
  schema,
  formData,
  errors,
  theme,
  onFieldChange,
  onSubmit,
  onValidationError: _unusedValidation,
  canvasMode = 'interact',
  selectedFieldIds = [],
  onFieldCanvasSelect,
  onCanvasReorder,
  onCycleFieldColSpan,
}: RendererProps): ReactElement {
  const selectedSet = useMemo(() => new Set(selectedFieldIds), [selectedFieldIds]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (canvasMode === 'design') return;
    onSubmit(formData);
  };

  const spacing = schema.styling?.spacing ?? 'normal';

  const visibleFields = schema.fields.filter(
    (field) => !field.conditional || shouldShowField(field, formData)
  );
  const visibleIds = visibleFields.map((f) => f.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    if (canvasMode !== 'design' || !onCanvasReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = visibleIds.indexOf(String(active.id));
    const newIndex = visibleIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const nextVisible = arrayMove(visibleIds, oldIndex, newIndex);
    const merged = mergeVisibleReorder(schema.fields, nextVisible, formData);
    onCanvasReorder(merged);
  };

  const showColTool = schema.layout === 'two-column' || schema.layout === 'grid';

  const buildFieldInner = (field: FieldDefinition) => (
    <div className="space-y-2">
      {createFieldElement(field, formData, errors, theme, onFieldChange)}
    </div>
  );

  let layoutElement: ReactElement;

  if (canvasMode === 'design') {
    const gridClass = layoutContainerClass(schema.layout, spacing);
    const isStack = schema.layout === 'single-column' || schema.layout === 'custom';

    layoutElement = (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={visibleIds}>
          <div className={cn(isStack ? 'flex flex-col gap-3' : gridClass)}>
            {visibleFields.map((field) => {
              const selected = selectedSet.has(field.id);
              const spanClass = fieldColSpanClass(schema.layout, field.layout?.colSpan);
              const colLabel =
                field.layout?.colSpan && field.layout.colSpan > 1
                  ? `Span ${field.layout.colSpan}`
                  : 'Span 1';

              return (
                <DesignFieldRow
                  key={field.id}
                  id={field.id}
                  disabledSortable={false}
                  selected={selected}
                  showColTool={showColTool}
                  colSpanLabel={colLabel}
                  colSpanClass={spanClass}
                  onColCycle={() => onCycleFieldColSpan?.(field.id)}
                  onSelect={(additive) => onFieldCanvasSelect?.(field.id, { additive })}
                >
                  {buildFieldInner(field)}
                </DesignFieldRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  } else {
    const fieldElements = schema.fields.map((field) => {
      if (field.conditional && !shouldShowField(field, formData)) {
        return null;
      }
      return (
        <div key={field.id} className={cn('space-y-2', fieldColSpanClass(schema.layout, field.layout?.colSpan))}>
          {createFieldElement(field, formData, errors, theme, onFieldChange)}
        </div>
      );
    });
    layoutElement = applyLayout(fieldElements, schema.layout, spacing);
  }

  return createFormWrapper(layoutElement, schema, theme, handleSubmit, canvasMode === 'design');
}

/**
 * Check if conditional field should be shown
 */
function shouldShowField(
  field: FieldDefinition,
  formData: Record<string, any>
): boolean {
  if (!field.conditional) return true;

  const { field: conditionField, value: conditionValue } = field.conditional;
  const actualValue = formData[conditionField];

  return actualValue === conditionValue;
}

/**
 * Create field element based on type
 */
function createFieldElement(
  field: FieldDefinition,
  formData: Record<string, any>,
  errors: Record<string, string>,
  theme: PreviewTheme,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  const value = formData[field.id] ?? '';
  const error = errors[field.id];
  const isRequired = field.validation?.required ?? false;

  switch (field.type) {
    case 'input':
      return createInputField(field, value, error, theme, isRequired, onFieldChange);
    
    case 'textarea':
      return createTextareaField(field, value, error, theme, isRequired, onFieldChange);
    
    case 'select':
      return createSelectField(field, value, error, theme, isRequired, onFieldChange);
    
    case 'checkbox':
      return createCheckboxField(field, value, error, theme, onFieldChange);
    
    case 'radio':
      return createRadioField(field, value, error, theme, isRequired, onFieldChange);
    
    case 'date':
      return createDateField(field, value, error, theme, isRequired, onFieldChange);
    
    case 'file':
      return createFileField(field, value, error, theme, isRequired, onFieldChange);
    
    default:
      return createInputField(field, value, error, theme, isRequired, onFieldChange);
  }
}

/**
 * Create input field
 */
function createInputField(
  field: FieldDefinition,
  value: any,
  error: string | undefined,
  theme: PreviewTheme,
  isRequired: boolean,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  const inputClasses = cn(
    'w-full px-3 py-2 rounded-md border transition-colors',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'bg-slate-900 border-slate-700 text-slate-100'
      : 'bg-white border-slate-300 text-slate-900',
    error && 'border-red-500 focus:ring-red-500'
  );

  return (
    <>
      <label
        htmlFor={field.id}
        className={cn(
          'block text-sm font-medium mb-1',
          theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
        )}
      >
        {field.label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={field.id}
        type="text"
        value={value}
        placeholder={field.placeholder}
        className={inputClasses}
        required={isRequired}
        onChange={(e) => onFieldChange(field.id, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Create textarea field
 */
function createTextareaField(
  field: FieldDefinition,
  value: any,
  error: string | undefined,
  theme: PreviewTheme,
  isRequired: boolean,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  const textareaClasses = cn(
    'w-full px-3 py-2 rounded-md border transition-colors resize-y',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'bg-slate-900 border-slate-700 text-slate-100'
      : 'bg-white border-slate-300 text-slate-900',
    error && 'border-red-500 focus:ring-red-500'
  );

  return (
    <>
      <label
        htmlFor={field.id}
        className={cn(
          'block text-sm font-medium mb-1',
          theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
        )}
      >
        {field.label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={field.id}
        value={value}
        placeholder={field.placeholder}
        className={textareaClasses}
        required={isRequired}
        rows={4}
        onChange={(e) => onFieldChange(field.id, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Create select field
 */
function createSelectField(
  field: FieldDefinition,
  value: any,
  error: string | undefined,
  theme: PreviewTheme,
  isRequired: boolean,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  const selectClasses = cn(
    'w-full px-3 py-2 rounded-md border transition-colors',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'bg-slate-900 border-slate-700 text-slate-100'
      : 'bg-white border-slate-300 text-slate-900',
    error && 'border-red-500 focus:ring-red-500'
  );

  return (
    <>
      <label
        htmlFor={field.id}
        className={cn(
          'block text-sm font-medium mb-1',
          theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
        )}
      >
        {field.label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={field.id}
        value={value}
        className={selectClasses}
        required={isRequired}
        onChange={(e) => onFieldChange(field.id, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      >
        {field.placeholder && (
          <option value="" disabled>
            {field.placeholder}
          </option>
        )}
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Create checkbox field
 */
function createCheckboxField(
  field: FieldDefinition,
  value: any,
  error: string | undefined,
  theme: PreviewTheme,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  const checked = Boolean(value);

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          id={field.id}
          type="checkbox"
          checked={checked}
          className={cn(
            'w-4 h-4 rounded border transition-colors accent-[color:var(--preview-secondary)]',
            PREVIEW_FOCUS_RING,
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-300',
            error && 'border-red-500'
          )}
          onChange={(e) => onFieldChange(field.id, e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
        />
        <label
          htmlFor={field.id}
          className={cn(
            'text-sm font-medium',
            theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
          )}
        >
          {field.label}
        </label>
      </div>
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Create radio field
 */
function createRadioField(
  field: FieldDefinition,
  value: any,
  error: string | undefined,
  theme: PreviewTheme,
  isRequired: boolean,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  return (
    <>
      <fieldset>
        <legend
          className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
          )}
        >
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </legend>
        <div className="space-y-2">
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <input
                id={`${field.id}-${option.value}`}
                type="radio"
                name={field.id}
                value={option.value}
                checked={value === option.value}
                className={cn(
                  'w-4 h-4 border transition-colors accent-[color:var(--preview-secondary)]',
                  PREVIEW_FOCUS_RING,
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-white border-slate-300'
                )}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                aria-invalid={!!error}
              />
              <label
                htmlFor={`${field.id}-${option.value}`}
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                )}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Create date field
 */
function createDateField(
  field: FieldDefinition,
  value: any,
  error: string | undefined,
  theme: PreviewTheme,
  isRequired: boolean,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  const inputClasses = cn(
    'w-full px-3 py-2 rounded-md border transition-colors',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'bg-slate-900 border-slate-700 text-slate-100'
      : 'bg-white border-slate-300 text-slate-900',
    error && 'border-red-500 focus:ring-red-500'
  );

  return (
    <>
      <label
        htmlFor={field.id}
        className={cn(
          'block text-sm font-medium mb-1',
          theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
        )}
      >
        {field.label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={field.id}
        type="date"
        value={value}
        className={inputClasses}
        required={isRequired}
        onChange={(e) => onFieldChange(field.id, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Create file field
 */
function createFileField(
  field: FieldDefinition,
  value: any,
  error: string | undefined,
  theme: PreviewTheme,
  isRequired: boolean,
  onFieldChange: (fieldId: string, value: any) => void
): ReactElement {
  const inputClasses = cn(
    'w-full px-3 py-2 rounded-md border transition-colors',
    PREVIEW_FOCUS_RING,
    'file:mr-4 file:py-1 file:px-3 file:rounded file:border-0',
    'file:text-sm file:font-medium',
    theme === 'dark'
      ? 'bg-slate-900 border-slate-700 text-slate-100 file:bg-slate-800 file:text-slate-200'
      : 'bg-white border-slate-300 text-slate-900 file:bg-slate-100 file:text-slate-700',
    error && 'border-red-500 focus:ring-red-500'
  );

  return (
    <>
      <label
        htmlFor={field.id}
        className={cn(
          'block text-sm font-medium mb-1',
          theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
        )}
      >
        {field.label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={field.id}
        type="file"
        className={inputClasses}
        required={isRequired}
        onChange={(e) => {
          const file = e.target.files?.[0];
          onFieldChange(field.id, file?.name || '');
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {error && (
        <p
          id={`${field.id}-error`}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Apply layout to field elements
 */
function applyLayout(
  fieldElements: (ReactElement | null)[],
  layout: ComponentSchema['layout'],
  spacing: 'compact' | 'normal' | 'relaxed' = 'normal'
): ReactElement {
  const validFields = fieldElements.filter(Boolean);
  const stackGap =
    spacing === 'compact' ? 'space-y-2' : spacing === 'relaxed' ? 'space-y-6' : 'space-y-4';
  const gridGap =
    spacing === 'compact' ? 'gap-2' : spacing === 'relaxed' ? 'gap-6' : 'gap-4';

  switch (layout) {
    case 'single-column':
      return <div className={stackGap}>{validFields}</div>;

    case 'two-column':
      return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2', gridGap)}>
          {validFields}
        </div>
      );

    case 'grid':
      return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', gridGap)}>
          {validFields}
        </div>
      );

    case 'custom':
    default:
      return <div className={stackGap}>{validFields}</div>;
  }
}

/**
 * Create form wrapper with styling
 */
function createFormWrapper(
  content: ReactElement,
  schema: ComponentSchema,
  theme: PreviewTheme,
  onSubmit: (e: FormEvent<HTMLFormElement>) => void,
  designMode = false
): ReactElement {
  const { styling } = schema;
  const spacing = styling.spacing || 'normal';
  const ps = resolvePreviewStyling(schema);

  const spacingClasses = {
    compact: 'p-4',
    normal: 'p-6',
    relaxed: 'p-8'
  };

  const bgOverride = Boolean(ps.backgroundColor);
  const textOverride = Boolean(ps.textColor);

  const formStyle: CSSProperties = {
    ['--preview-primary' as string]: ps.primaryColor,
    ['--preview-secondary' as string]: ps.secondaryColor,
    ...(bgOverride && ps.backgroundColor ? { backgroundColor: ps.backgroundColor } : {}),
  };

  const formClasses = cn(
    'w-full max-w-2xl mx-auto border',
    ps.borderRadiusClass,
    ps.fontFamilyClass,
    ps.fontSizeClass,
    spacingClasses[spacing],
    !bgOverride &&
      (theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
  );

  return (
    <form
      onSubmit={onSubmit}
      className={formClasses}
      style={formStyle}
      noValidate
      aria-label={designMode ? 'Component layout (design mode)' : undefined}
    >
      {/* Form Title */}
      {schema.name && (
        <h2
          className={cn(
            'text-2xl font-semibold mb-6',
            !textOverride && (theme === 'dark' ? 'text-slate-100' : 'text-slate-900')
          )}
          style={textOverride && ps.textColor ? { color: ps.textColor } : undefined}
        >
          {formatSchemaDisplayName(schema.name)}
        </h2>
      )}

      {/* Form Description */}
      {schema.description && (
        <p
          className={cn(
            'text-sm mb-6',
            !textOverride && (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')
          )}
          style={
            textOverride && ps.textColor
              ? { color: ps.textColor, opacity: 0.88 }
              : undefined
          }
        >
          {schema.description}
        </p>
      )}

      {/* Form Fields */}
      {content}

      {/* Submit Button */}
      <div className={cn('mt-6', designMode && 'pointer-events-none opacity-40')}>
        <button
          type="submit"
          style={{ backgroundColor: ps.primaryColor }}
          className={cn(
            'w-full px-4 py-2 rounded-md font-medium transition-opacity',
            'text-white hover:opacity-90 active:opacity-80',
            'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2',
            theme === 'dark' ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'
          )}
        >
          Submit
        </button>
      </div>
    </form>
  );
}

// Made with Bob