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
import {
  type ComponentSchema,
  type ComponentSchemaMetaPatch,
  type FieldDefinition,
  DEFAULT_SUBMIT_BUTTON_LABEL,
} from '../watsonx/types';
import type { RendererProps, PreviewTheme } from './types';
import { cn, formatSchemaDisplayName } from '../utils';
import { getContrastForegroundForHex } from '@/lib/tuning/color-contrast';
import { resolveSubmitButtonPresentation } from '@/lib/tuning/submit-button-style';
import {
  SUBMIT_BUTTON_LAYER_ID,
  getEffectiveLayerOrder,
  mergeVisibleLayerReorder,
} from '@/lib/tuning/layer-order';
import { DesignFieldRow } from '@/components/builder/design-field-row';
import { resolveValidationConfig } from '@/lib/tuning/behavior-schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/** Preview-only field UI options (from schema.validation). */
interface PreviewFieldCtx {
  errorPosition: 'below' | 'inline' | 'tooltip';
  showRequiredIndicators: boolean;
  onFieldBlur?: (fieldId: string) => void;
  autoFocusFirst: boolean;
}

type DesignFieldCopyPatch = Partial<
  Pick<FieldDefinition, 'label' | 'placeholder' | 'options'>
>;

interface DesignCopyEditConfig {
  enabled: boolean;
  onFieldCopyCommit?: (fieldId: string, patch: DesignFieldCopyPatch) => void;
}

/**
 * Inline text editor for design-mode preview copy; commits on blur to limit undo churn.
 */
function DesignEditableText({
  value,
  onCommit,
  multiline = false,
  className,
  'aria-label': ariaLabel,
}: {
  value: string;
  onCommit: (next: string) => void;
  multiline?: boolean;
  className?: string;
  'aria-label'?: string;
}): ReactElement {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const baseClass = cn(
    'w-full min-w-0 rounded border border-dashed border-primary/40 bg-primary/5 px-1.5 py-1 outline-none transition-colors',
    'focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary',
    className
  );

  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        data-design-edit
        rows={3}
        className={cn(baseClass, 'min-h-[4.5rem] resize-y')}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== value) onCommit(draft);
        }}
        onPointerDown={(e) => stop(e)}
        onClick={(e) => stop(e)}
      />
    );
  }

  return (
    <input
      type="text"
      aria-label={ariaLabel}
      data-design-edit
      className={baseClass}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onCommit(draft);
      }}
      onPointerDown={(e) => stop(e)}
      onClick={(e) => stop(e)}
    />
  );
}

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

/** True when schema tuning sets a custom body text color (labels, titles, etc.). */
function hasPreviewTextColorOverride(schema: ComponentSchema): boolean {
  return Boolean(schema.styling?.textColor);
}

/** Labels and static copy inherit `form` color when tuning overrides body text. */
function previewStaticTextClass(
  theme: PreviewTheme,
  textColorOverride: boolean,
  base: string
): string {
  return cn(
    base,
    !textColorOverride && (theme === 'dark' ? 'text-slate-200' : 'text-slate-700')
  );
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
  onFieldBlur,
  onSubmit,
  onValidationError: _unusedValidation,
  canvasMode = 'interact',
  selectedFieldIds = [],
  onFieldCanvasSelect,
  onCanvasReorder,
  onCanvasLayerReorder,
  onCycleFieldColSpan,
  onDesignSchemaMetaChange,
  onDesignFieldCopyChange,
}: RendererProps): ReactElement {
  const selectedSet = useMemo(() => new Set(selectedFieldIds), [selectedFieldIds]);

  const vCfg = useMemo(() => resolveValidationConfig(schema), [schema]);

  const designCopy: DesignCopyEditConfig = useMemo(
    () => ({
      enabled: canvasMode === 'design',
      onFieldCopyCommit: onDesignFieldCopyChange,
    }),
    [canvasMode, onDesignFieldCopyChange]
  );

  const firstInteractiveFieldId = useMemo(() => {
    if (canvasMode === 'design') return undefined;
    const first = schema.fields.find(
      (f) => !f.conditional || shouldShowField(f, formData)
    );
    return first?.id;
  }, [schema.fields, formData, canvasMode]);

  const fieldCtx: PreviewFieldCtx = useMemo(
    () => ({
      errorPosition: vCfg.errorPosition,
      showRequiredIndicators: vCfg.showRequiredIndicators,
      onFieldBlur,
      autoFocusFirst: vCfg.autoFocus,
    }),
    [vCfg.errorPosition, vCfg.showRequiredIndicators, vCfg.autoFocus, onFieldBlur]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (canvasMode === 'design') return;
    onSubmit(formData);
  };

  const spacing = schema.styling?.spacing ?? 'normal';

  const fullLayerOrder = useMemo(() => getEffectiveLayerOrder(schema), [schema]);

  const visibleSet = useMemo(
    () =>
      new Set(
        schema.fields
          .filter((field) => !field.conditional || shouldShowField(field, formData))
          .map((f) => f.id)
      ),
    [schema.fields, formData]
  );

  const visibleLayerOrdered = useMemo(
    () =>
      fullLayerOrder.filter(
        (id) => id === SUBMIT_BUTTON_LAYER_ID || visibleSet.has(id)
      ),
    [fullLayerOrder, visibleSet]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    if (canvasMode !== 'design') return;
    if (!onCanvasLayerReorder && !onCanvasReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (onCanvasLayerReorder) {
      const ol = visibleLayerOrdered;
      const oldIndex = ol.indexOf(String(active.id));
      const newIndex = ol.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      const nextVisible = arrayMove(ol, oldIndex, newIndex);
      const mergedLayer = mergeVisibleLayerReorder(
        fullLayerOrder,
        nextVisible,
        schema.fields,
        formData
      );
      onCanvasLayerReorder(mergedLayer);
      return;
    }

    const visibleIds = visibleLayerOrdered.filter((id) => id !== SUBMIT_BUTTON_LAYER_ID);
    const oldIndex = visibleIds.indexOf(String(active.id));
    const newIndex = visibleIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const nextVisible = arrayMove(visibleIds, oldIndex, newIndex);
    const merged = mergeVisibleReorder(schema.fields, nextVisible, formData);
    onCanvasReorder?.(merged);
  };

  const sortableDesignIds = onCanvasLayerReorder ? visibleLayerOrdered : visibleLayerOrdered.filter((id) => id !== SUBMIT_BUTTON_LAYER_ID);

  const showColTool = schema.layout === 'two-column' || schema.layout === 'grid';
  const textColorOverride = hasPreviewTextColorOverride(schema);

  const buildFieldInner = (field: FieldDefinition) => (
    <div className="space-y-2">
      {createFieldElement(
        field,
        formData,
        errors,
        theme,
        onFieldChange,
        textColorOverride,
        fieldCtx,
        false,
        designCopy
      )}
    </div>
  );

  let layoutElement: ReactElement;

  if (canvasMode === 'design') {
    const gridClass = layoutContainerClass(schema.layout, spacing);
    const isStack = schema.layout === 'single-column' || schema.layout === 'custom';

    layoutElement = (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sortableDesignIds}>
          <div className={cn(isStack ? 'flex flex-col gap-3' : gridClass)}>
            {sortableDesignIds.map((token) => {
              if (token === SUBMIT_BUTTON_LAYER_ID) {
                return (
                  <DesignFieldRow
                    key={SUBMIT_BUTTON_LAYER_ID}
                    id={SUBMIT_BUTTON_LAYER_ID}
                    disabledSortable={!onCanvasLayerReorder}
                    selected={selectedSet.has(SUBMIT_BUTTON_LAYER_ID)}
                    showColTool={false}
                    colSpanLabel=""
                    colSpanClass=""
                    onColCycle={() => {}}
                    onSelect={() => {}}
                  >
                    {submitPreviewBlock(schema, theme, true, onDesignSchemaMetaChange)}
                  </DesignFieldRow>
                );
              }
              const field = schema.fields.find((f) => f.id === token);
              if (!field) return null;
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
    const fieldMap = new Map<string, ReactElement | null>();
    schema.fields.forEach((field) => {
      if (field.conditional && !shouldShowField(field, formData)) {
        fieldMap.set(field.id, null);
        return;
      }
      const autoFocusThis =
        field.id === firstInteractiveFieldId && fieldCtx.autoFocusFirst;
      fieldMap.set(
        field.id,
        <div
          key={field.id}
          data-preview-field={field.id}
          className={cn('space-y-2', fieldColSpanClass(schema.layout, field.layout?.colSpan))}
        >
          {createFieldElement(
            field,
            formData,
            errors,
            theme,
            onFieldChange,
            textColorOverride,
            fieldCtx,
            autoFocusThis,
            designCopy
          )}
        </div>
      );
    });

    const layerOrder = getEffectiveLayerOrder(schema);
    const segments: ReactElement[] = [];
    let bucket: ReactElement[] = [];
    let segKey = 0;
    const flushBucket = () => {
      const cells = bucket.filter(Boolean) as ReactElement[];
      bucket = [];
      if (cells.length === 0) return;
      segments.push(
        <div key={`lay-${segKey++}`} className="space-y-6">
          {applyLayout(cells, schema.layout, spacing)}
        </div>
      );
    };

    for (const token of layerOrder) {
      if (token === SUBMIT_BUTTON_LAYER_ID) {
        flushBucket();
        segments.push(
          <div key={`sub-${segKey++}`} className="space-y-6">
            {submitPreviewBlock(schema, theme, false, undefined, true)}
          </div>
        );
      } else {
        const cell = fieldMap.get(token);
        if (cell) bucket.push(cell);
      }
    }
    flushBucket();

    layoutElement = <div className="space-y-6">{segments}</div>;
  }

  return createFormWrapper(
    schema,
    theme,
    handleSubmit,
    canvasMode === 'design',
    vCfg.submitOnEnter,
    canvasMode === 'design' ? onDesignSchemaMetaChange : undefined,
    layoutElement
  );
}

/**
 * Wrap control for tooltip error display (Radix Tooltip; requires TooltipProvider ancestor).
 */
function wrapTooltipControl(
  error: string | undefined,
  errorPosition: PreviewFieldCtx['errorPosition'],
  node: ReactElement
): ReactElement {
  if (errorPosition !== 'tooltip' || !error) return node;
  return (
    <Tooltip open={Boolean(error)} delayDuration={0}>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs border border-red-600 bg-red-950 text-xs text-red-100"
        role="alert"
      >
        {error}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Create field element based on type
 */
function createFieldElement(
  field: FieldDefinition,
  formData: Record<string, any>,
  errors: Record<string, string>,
  theme: PreviewTheme,
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  autoFocus: boolean,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const value = formData[field.id] ?? '';
  const error = errors[field.id];
  const isRequired = field.validation?.required ?? false;

  switch (field.type) {
    case 'input':
      return createInputField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        autoFocus,
        designCopy
      );

    case 'textarea':
      return createTextareaField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        autoFocus,
        designCopy
      );

    case 'select':
      return createSelectField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        autoFocus,
        designCopy
      );

    case 'checkbox':
      return createCheckboxField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        designCopy
      );

    case 'radio':
      return createRadioField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        designCopy
      );

    case 'date':
      return createDateField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        autoFocus,
        designCopy
      );

    case 'file':
      return createFileField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        autoFocus,
        designCopy
      );

    default:
      return createInputField(
        field,
        value,
        error,
        theme,
        isRequired,
        onFieldChange,
        textColorOverride,
        ctx,
        autoFocus,
        designCopy
      );
  }
}

/**
 * Field label row: editable in design mode when a commit handler exists.
 */
function renderFieldLabelHeader(
  field: FieldDefinition,
  theme: PreviewTheme,
  textColorOverride: boolean,
  showReq: boolean,
  designCopy: DesignCopyEditConfig,
  error: string | undefined,
  layout: 'inline' | 'block'
): ReactElement {
  const req = showReq ? <span className="ml-0.5 text-red-500">*</span> : null;
  const canEdit = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);
  const editClass = previewStaticTextClass(theme, textColorOverride, 'text-sm font-medium');
  const staticInline = previewStaticTextClass(
    theme,
    textColorOverride,
    'cursor-default text-sm font-medium'
  );
  const staticBlock = previewStaticTextClass(
    theme,
    textColorOverride,
    'mb-1 block cursor-default text-sm font-medium'
  );

  const editableInner = (
    <DesignEditableText
      aria-label={`Label for field ${field.id}`}
      value={field.label}
      onCommit={(v) => designCopy.onFieldCopyCommit!(field.id, { label: v })}
      className={editClass}
    />
  );

  const editableBlock =
    layout === 'inline' ? (
      <div className="min-w-0 flex-1 space-y-0.5">
        {editableInner}
        <span className="inline-flex items-center">{req}</span>
      </div>
    ) : (
      <div className="mb-1 space-y-0.5">
        {editableInner}
        <span className="inline-flex items-center">{req}</span>
      </div>
    );

  if (layout === 'inline') {
    return (
      <div className="mb-1 flex items-center justify-between gap-2">
        {canEdit ? (
          editableBlock
        ) : (
          <label htmlFor={field.id} className={staticInline}>
            {field.label}
            {req}
          </label>
        )}
        {error ? (
          <span
            id={`${field.id}-error`}
            className="max-w-[55%] shrink-0 text-right text-xs text-red-500"
            role="alert"
          >
            {error}
          </span>
        ) : null}
      </div>
    );
  }

  if (canEdit) {
    return editableBlock;
  }

  return (
    <label htmlFor={field.id} className={staticBlock}>
      {field.label}
      {req}
    </label>
  );
}

/**
 * Design-mode placeholder editor under the control.
 */
function renderDesignPlaceholderEditor(
  field: FieldDefinition,
  designCopy: DesignCopyEditConfig
): ReactElement | null {
  if (!designCopy.enabled || !designCopy.onFieldCopyCommit) return null;
  return (
    <div className="mt-1.5 space-y-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Placeholder
      </span>
      <DesignEditableText
        aria-label={`Placeholder for field ${field.id}`}
        value={field.placeholder ?? ''}
        onCommit={(v) => {
          const t = v.trim();
          designCopy.onFieldCopyCommit!(field.id, {
            placeholder: t === '' ? undefined : v,
          });
        }}
        className="text-xs"
      />
    </div>
  );
}

/**
 * Design-mode select option label editors.
 */
function renderDesignSelectOptionLabels(
  field: FieldDefinition,
  designCopy: DesignCopyEditConfig
): ReactElement | null {
  if (!designCopy.enabled || !designCopy.onFieldCopyCommit) return null;
  if (!field.options?.length) return null;
  return (
    <div className="mt-2 space-y-1.5 rounded-md border border-dashed border-primary/30 bg-primary/5 p-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Option labels
      </p>
      <div className="space-y-1.5">
        {field.options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2 text-xs">
            <code className="shrink-0 rounded bg-slate-800/40 px-1 py-0.5 text-[10px] text-slate-400">
              {opt.value}
            </code>
            <DesignEditableText
              aria-label={`Label for option ${opt.value}`}
              value={opt.label}
              onCommit={(next) => {
                const nextOpts = field.options!.map((o) =>
                  o.value === opt.value ? { ...o, label: next } : o
                );
                designCopy.onFieldCopyCommit!(field.id, { options: nextOpts });
              }}
              className="text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
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
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  autoFocus: boolean,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const showReq = isRequired && ctx.showRequiredIndicators;
  const copyEditable = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);
  const inputClasses = cn(
    'w-full px-3 py-2 rounded-md border transition-colors duration-200',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
    error && 'border-red-500 focus:ring-red-500'
  );

  const inputEl = (
    <input
      id={field.id}
      type="text"
      value={value}
      placeholder={field.placeholder}
      className={inputClasses}
      required={isRequired}
      autoFocus={autoFocus}
      onChange={(e) => onFieldChange(field.id, e.target.value)}
      onBlur={() => ctx.onFieldBlur?.(field.id)}
      aria-invalid={!!error}
      aria-label={copyEditable ? field.label : undefined}
      aria-describedby={
        error && ctx.errorPosition !== 'tooltip' ? `${field.id}-error` : undefined
      }
    />
  );

  const wrapped = wrapTooltipControl(error, ctx.errorPosition, inputEl);

  return (
    <>
      {ctx.errorPosition === 'inline'
        ? renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'inline'
          )
        : renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'block'
          )}
      {wrapped}
      {renderDesignPlaceholderEditor(field, designCopy)}
      {ctx.errorPosition === 'below' && error ? (
        <p id={`${field.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
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
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  autoFocus: boolean,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const showReq = isRequired && ctx.showRequiredIndicators;
  const copyEditable = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);
  const textareaClasses = cn(
    'w-full resize-y rounded-md border px-3 py-2 transition-colors duration-200',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
    error && 'border-red-500 focus:ring-red-500'
  );

  const ta = (
    <textarea
      id={field.id}
      value={value}
      placeholder={field.placeholder}
      className={textareaClasses}
      required={isRequired}
      rows={4}
      autoFocus={autoFocus}
      onChange={(e) => onFieldChange(field.id, e.target.value)}
      onBlur={() => ctx.onFieldBlur?.(field.id)}
      aria-invalid={!!error}
      aria-label={copyEditable ? field.label : undefined}
      aria-describedby={
        error && ctx.errorPosition !== 'tooltip' ? `${field.id}-error` : undefined
      }
    />
  );

  const wrapped = wrapTooltipControl(error, ctx.errorPosition, ta);

  return (
    <>
      {ctx.errorPosition === 'inline'
        ? renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'inline'
          )
        : renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'block'
          )}
      {wrapped}
      {renderDesignPlaceholderEditor(field, designCopy)}
      {ctx.errorPosition === 'below' && error ? (
        <p id={`${field.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
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
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  autoFocus: boolean,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const showReq = isRequired && ctx.showRequiredIndicators;
  const copyEditable = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);
  const selectClasses = cn(
    'w-full cursor-pointer rounded-md border px-3 py-2 transition-colors duration-200',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'border-slate-700 bg-slate-900 text-slate-100'
      : 'border-slate-300 bg-white text-slate-900',
    error && 'border-red-500 focus:ring-red-500'
  );

  const sel = (
    <select
      id={field.id}
      value={value}
      className={selectClasses}
      required={isRequired}
      autoFocus={autoFocus}
      onChange={(e) => onFieldChange(field.id, e.target.value)}
      onBlur={() => ctx.onFieldBlur?.(field.id)}
      aria-invalid={!!error}
      aria-label={copyEditable ? field.label : undefined}
      aria-describedby={
        error && ctx.errorPosition !== 'tooltip' ? `${field.id}-error` : undefined
      }
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
  );

  const wrapped = wrapTooltipControl(error, ctx.errorPosition, sel);

  return (
    <>
      {ctx.errorPosition === 'inline'
        ? renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'inline'
          )
        : renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'block'
          )}
      {wrapped}
      {renderDesignPlaceholderEditor(field, designCopy)}
      {renderDesignSelectOptionLabels(field, designCopy)}
      {ctx.errorPosition === 'below' && error ? (
        <p id={`${field.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
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
  isRequired: boolean,
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const checked = Boolean(value);
  const showReq = isRequired && ctx.showRequiredIndicators;
  const copyEditable = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);

  const row = copyEditable ? (
    <div className="flex items-start gap-2">
      <input
        id={field.id}
        type="checkbox"
        checked={checked}
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors duration-200 accent-[color:var(--preview-secondary)]',
          PREVIEW_FOCUS_RING,
          theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white',
          error && 'border-red-500'
        )}
        required={isRequired}
        onChange={(e) => onFieldChange(field.id, e.target.checked)}
        onBlur={() => ctx.onFieldBlur?.(field.id)}
        aria-invalid={!!error}
        aria-label={field.label}
        aria-describedby={
          error && ctx.errorPosition !== 'tooltip' ? `${field.id}-error` : undefined
        }
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <DesignEditableText
          aria-label={`Label for field ${field.id}`}
          value={field.label}
          onCommit={(v) => designCopy.onFieldCopyCommit!(field.id, { label: v })}
          className={previewStaticTextClass(theme, textColorOverride, 'text-sm font-medium')}
        />
        {showReq ? <span className="text-xs text-red-500">*</span> : null}
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <input
        id={field.id}
        type="checkbox"
        checked={checked}
        className={cn(
          'h-4 w-4 rounded border transition-colors duration-200 accent-[color:var(--preview-secondary)]',
          PREVIEW_FOCUS_RING,
          theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white',
          error && 'border-red-500'
        )}
        required={isRequired}
        onChange={(e) => onFieldChange(field.id, e.target.checked)}
        onBlur={() => ctx.onFieldBlur?.(field.id)}
        aria-invalid={!!error}
        aria-describedby={
          error && ctx.errorPosition !== 'tooltip' ? `${field.id}-error` : undefined
        }
      />
      <label
        htmlFor={field.id}
        className={previewStaticTextClass(theme, textColorOverride, 'cursor-pointer text-sm font-medium')}
      >
        {field.label}
        {showReq ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
    </div>
  );

  const wrappedRow =
    ctx.errorPosition === 'tooltip' ? wrapTooltipControl(error, 'tooltip', row) : row;

  return (
    <>
      {ctx.errorPosition === 'inline' ? (
        <div className="flex items-center justify-between gap-2">
          {wrappedRow}
          {error ? (
            <span
              id={`${field.id}-error`}
              className="max-w-[55%] shrink-0 text-right text-xs text-red-500"
              role="alert"
            >
              {error}
            </span>
          ) : null}
        </div>
      ) : (
        wrappedRow
      )}
      {ctx.errorPosition === 'below' && error ? (
        <p id={`${field.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
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
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const showReq = isRequired && ctx.showRequiredIndicators;
  const copyEditable = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);
  const req = showReq ? <span className="ml-0.5 text-red-500">*</span> : null;
  const editLegendClass = previewStaticTextClass(theme, textColorOverride, 'text-sm font-medium');

  const optionsBlock = (
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
              'h-4 w-4 shrink-0 border transition-colors duration-200 accent-[color:var(--preview-secondary)]',
              PREVIEW_FOCUS_RING,
              theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'
            )}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            onBlur={() => ctx.onFieldBlur?.(field.id)}
            aria-invalid={!!error}
            aria-label={copyEditable ? option.label : undefined}
          />
          {copyEditable ? (
            <DesignEditableText
              aria-label={`Label for option ${option.value}`}
              value={option.label}
              onCommit={(next) => {
                const nextOpts = field.options!.map((o) =>
                  o.value === option.value ? { ...o, label: next } : o
                );
                designCopy.onFieldCopyCommit!(field.id, { options: nextOpts });
              }}
              className={previewStaticTextClass(theme, textColorOverride, 'text-sm')}
            />
          ) : (
            <label
              htmlFor={`${field.id}-${option.value}`}
              className={previewStaticTextClass(theme, textColorOverride, 'cursor-pointer text-sm')}
            >
              {option.label}
            </label>
          )}
        </div>
      ))}
    </div>
  );

  const wrappedOptions =
    ctx.errorPosition === 'tooltip' ? wrapTooltipControl(error, 'tooltip', optionsBlock) : optionsBlock;

  const legendInline = copyEditable ? (
    <legend
      className={previewStaticTextClass(
        theme,
        textColorOverride,
        'mb-2 flex w-full items-center justify-between gap-2 text-sm font-medium'
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <DesignEditableText
          aria-label={`Group label for ${field.id}`}
          value={field.label}
          onCommit={(v) => designCopy.onFieldCopyCommit!(field.id, { label: v })}
          className={editLegendClass}
        />
        <span className="inline-flex items-center">{req}</span>
      </div>
      {error ? (
        <span
          id={`${field.id}-error`}
          className="max-w-[55%] shrink-0 text-right text-xs text-red-500"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </legend>
  ) : (
    <legend
      className={previewStaticTextClass(
        theme,
        textColorOverride,
        'mb-2 flex w-full items-center justify-between gap-2 text-sm font-medium'
      )}
    >
      <span>
        {field.label}
        {req}
      </span>
      {error ? (
        <span
          id={`${field.id}-error`}
          className="max-w-[55%] shrink-0 text-right text-xs text-red-500"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </legend>
  );

  const legendBlock = copyEditable ? (
    <legend
      className={previewStaticTextClass(
        theme,
        textColorOverride,
        'mb-2 block text-sm font-medium'
      )}
    >
      <div className="space-y-0.5">
        <DesignEditableText
          aria-label={`Group label for ${field.id}`}
          value={field.label}
          onCommit={(v) => designCopy.onFieldCopyCommit!(field.id, { label: v })}
          className={editLegendClass}
        />
        <span className="inline-flex items-center">{req}</span>
      </div>
    </legend>
  ) : (
    <legend
      className={previewStaticTextClass(
        theme,
        textColorOverride,
        'mb-2 block text-sm font-medium'
      )}
    >
      {field.label}
      {req}
    </legend>
  );

  return (
    <fieldset>
      {ctx.errorPosition === 'inline' ? legendInline : legendBlock}
      {wrappedOptions}
      {ctx.errorPosition === 'below' && error ? (
        <p id={`${field.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
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
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  autoFocus: boolean,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const showReq = isRequired && ctx.showRequiredIndicators;
  const copyEditable = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);
  const inputClasses = cn(
    'w-full rounded-md border px-3 py-2 transition-colors duration-200',
    PREVIEW_FOCUS_RING,
    theme === 'dark'
      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
    error && 'border-red-500 focus:ring-red-500'
  );

  const inp = (
    <input
      id={field.id}
      type="date"
      value={value}
      className={inputClasses}
      required={isRequired}
      autoFocus={autoFocus}
      onChange={(e) => onFieldChange(field.id, e.target.value)}
      onBlur={() => ctx.onFieldBlur?.(field.id)}
      aria-invalid={!!error}
      aria-label={copyEditable ? field.label : undefined}
      aria-describedby={
        error && ctx.errorPosition !== 'tooltip' ? `${field.id}-error` : undefined
      }
    />
  );

  const wrapped = wrapTooltipControl(error, ctx.errorPosition, inp);

  return (
    <>
      {ctx.errorPosition === 'inline'
        ? renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'inline'
          )
        : renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'block'
          )}
      {wrapped}
      {renderDesignPlaceholderEditor(field, designCopy)}
      {ctx.errorPosition === 'below' && error ? (
        <p id={`${field.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
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
  onFieldChange: (fieldId: string, value: any) => void,
  textColorOverride: boolean,
  ctx: PreviewFieldCtx,
  autoFocus: boolean,
  designCopy: DesignCopyEditConfig
): ReactElement {
  const showReq = isRequired && ctx.showRequiredIndicators;
  const copyEditable = designCopy.enabled && Boolean(designCopy.onFieldCopyCommit);
  const inputClasses = cn(
    'w-full rounded-md border px-3 py-2 transition-colors duration-200',
    PREVIEW_FOCUS_RING,
    'file:mr-4 file:rounded file:border-0 file:px-3 file:py-1',
    'file:text-sm file:font-medium',
    theme === 'dark'
      ? 'border-slate-700 bg-slate-900 text-slate-100 file:bg-slate-800 file:text-slate-200'
      : 'border-slate-300 bg-white text-slate-900 file:bg-slate-100 file:text-slate-700',
    error && 'border-red-500 focus:ring-red-500'
  );

  const inp = (
    <input
      id={field.id}
      type="file"
      className={inputClasses}
      required={isRequired}
      autoFocus={autoFocus}
      onChange={(e) => {
        const file = e.target.files?.[0];
        onFieldChange(field.id, file?.name || '');
      }}
      onBlur={() => ctx.onFieldBlur?.(field.id)}
      aria-invalid={!!error}
      aria-label={copyEditable ? field.label : undefined}
      aria-describedby={
        error && ctx.errorPosition !== 'tooltip' ? `${field.id}-error` : undefined
      }
    />
  );

  const wrapped = wrapTooltipControl(error, ctx.errorPosition, inp);

  return (
    <>
      {ctx.errorPosition === 'inline'
        ? renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'inline'
          )
        : renderFieldLabelHeader(
            field,
            theme,
            textColorOverride,
            showReq,
            designCopy,
            error,
            'block'
          )}
      {wrapped}
      {renderDesignPlaceholderEditor(field, designCopy)}
      {ctx.errorPosition === 'below' && error ? (
        <p id={`${field.id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
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
 * Submit control for preview: design (label edit + disabled) or interact (type=submit).
 */
function submitPreviewBlock(
  schema: ComponentSchema,
  theme: PreviewTheme,
  designMode: boolean,
  onDesignSchemaMetaChange: ((patch: ComponentSchemaMetaPatch) => void) | undefined,
  embedded = false
): ReactElement {
  const styling = schema.styling;
  const submitBtn = resolveSubmitButtonPresentation(styling);
  const submitFocusRingClass =
    submitBtn.style.color === '#000000'
      ? 'focus-visible:ring-slate-500'
      : 'focus-visible:ring-white/70';
  const resolvedSubmitLabel = schema.submitButtonLabel?.trim() || DEFAULT_SUBMIT_BUTTON_LABEL;
  const submitWrapClass =
    styling.submitButtonFullWidth === false ? 'flex justify-start' : undefined;

  if (designMode && onDesignSchemaMetaChange) {
    return (
      <div className={cn(!embedded && 'mt-6', 'space-y-2')}>
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Submit button
          </span>
          <DesignEditableText
            aria-label="Submit button label"
            value={schema.submitButtonLabel ?? DEFAULT_SUBMIT_BUTTON_LABEL}
            onCommit={(v) => {
              const t = v.trim();
              onDesignSchemaMetaChange({
                submitButtonLabel: t === '' ? undefined : t,
              });
            }}
            className="text-sm font-medium"
          />
        </div>
        <div className={submitWrapClass}>
          <button
            type="button"
            disabled
            style={submitBtn.style}
            className={cn(
              submitBtn.className,
              'cursor-default opacity-75',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              submitFocusRingClass,
              theme === 'dark' ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
            )}
          >
            {resolvedSubmitLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(!embedded && 'mt-6', submitWrapClass)}>
      <button
        type="submit"
        style={submitBtn.style}
        className={cn(
          submitBtn.className,
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          submitFocusRingClass,
          theme === 'dark' ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
        )}
      >
        {resolvedSubmitLabel}
      </button>
    </div>
  );
}

/**
 * Create form wrapper with styling
 */
function createFormWrapper(
  schema: ComponentSchema,
  theme: PreviewTheme,
  onSubmit: (e: FormEvent<HTMLFormElement>) => void,
  designMode: boolean,
  submitOnEnter: boolean,
  onDesignSchemaMetaChange: ((patch: ComponentSchemaMetaPatch) => void) | undefined,
  formBody: ReactElement
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
    ...(textOverride && ps.textColor ? { color: ps.textColor } : {}),
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
    <TooltipProvider delayDuration={0}>
      <form
        onSubmit={onSubmit}
        onKeyDown={(e) => {
          if (designMode || submitOnEnter) return;
          if (e.key !== 'Enter') return;
          const t = e.target as HTMLElement;
          if (t.tagName === 'INPUT' || t.tagName === 'SELECT') {
            e.preventDefault();
          }
        }}
        className={formClasses}
        style={formStyle}
        noValidate
        aria-label={designMode ? 'Component layout (design mode)' : undefined}
      >
        {/* Form Title */}
        {designMode && onDesignSchemaMetaChange ? (
          <div className="mb-6 space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Title
            </span>
            <DesignEditableText
              aria-label="Component name"
              value={schema.name ?? ''}
              onCommit={(v) => onDesignSchemaMetaChange({ name: v })}
              className={cn(
                'text-2xl font-semibold',
                !textOverride && (theme === 'dark' ? 'text-slate-100' : 'text-slate-900')
              )}
            />
          </div>
        ) : (
          schema.name && (
            <h2
              className={cn(
                'text-2xl font-semibold mb-6',
                !textOverride && (theme === 'dark' ? 'text-slate-100' : 'text-slate-900')
              )}
            >
              {formatSchemaDisplayName(schema.name)}
            </h2>
          )
        )}

        {/* Form Description */}
        {designMode && onDesignSchemaMetaChange ? (
          <div className="mb-6 space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Description
            </span>
            <DesignEditableText
              multiline
              aria-label="Component description"
              value={schema.description ?? ''}
              onCommit={(v) => onDesignSchemaMetaChange({ description: v })}
              className={cn(
                'text-sm',
                !textOverride && (theme === 'dark' ? 'text-slate-400' : 'text-slate-600'),
                textOverride && 'opacity-90'
              )}
            />
          </div>
        ) : (
          schema.description && (
            <p
              className={cn(
                'text-sm mb-6',
                !textOverride && (theme === 'dark' ? 'text-slate-400' : 'text-slate-600'),
                textOverride && 'opacity-90'
              )}
            >
              {schema.description}
            </p>
          )
        )}

        {/* Form body (fields + submit interleaved) */}
        {formBody}
      </form>
    </TooltipProvider>
  );
}

// Made with Bob