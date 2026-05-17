/**
 * Structure controls: sortable layer list (Figma-style) and field property inspector.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Copy,
  GripVertical,
  Plus,
  Trash2,
  Layers,
  ListTree,
  Files,
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldDefinition } from '@/lib/watsonx/types';
import type { ComponentSchema } from '@/lib/watsonx/types';
import { FIELD_TYPE_OPTIONS, LAYOUT_OPTIONS } from '@/types/tuning';
import { SUBMIT_BUTTON_LAYER_ID, getEffectiveLayerOrder } from '@/lib/tuning/layer-order';
import { cn } from '@/lib/utils';

const TUNING_SELECT_TRIGGER =
  'h-9 border-sidebar-border bg-sidebar-accent/25 text-sm text-sidebar-foreground focus:ring-sidebar-ring';
const TUNING_SELECT_CONTENT =
  'border-sidebar-border/70 bg-sidebar/85 text-sidebar-foreground backdrop-blur-xl backdrop-saturate-150';
const TUNING_SELECT_ITEM =
  'cursor-pointer focus:bg-sidebar-accent focus:text-sidebar-accent-foreground';
const TUNING_FIELD_INPUT =
  'border-sidebar-border bg-sidebar-accent/20 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar';

/** Radix Select requires `value` to match an item; schemas may carry unknown layout strings. */
function coerceLayout(
  layout: ComponentSchema['layout'] | undefined | null
): ComponentSchema['layout'] {
  if (layout && LAYOUT_OPTIONS.some((o) => o.value === layout)) return layout;
  return 'single-column';
}

const DEFAULT_SELECT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
];

function maxColSpanForLayout(layout: ComponentSchema['layout']): 1 | 2 | 3 {
  if (layout === 'grid') return 3;
  if (layout === 'two-column') return 2;
  return 1;
}

export interface StructureControlsProps {
  schema: ComponentSchema;
  highlightedFieldIds?: string[];
  onFieldSelectionChange?: (fieldIds: string[]) => void;
  onAddField: (
    field: FieldDefinition,
    options?: { insertAt?: number; insertAfterFieldId?: string }
  ) => void;
  onRemoveField: (fieldId: string) => void;
  onReorderLayers: (newOrder: string[]) => void;
  onModifyField: (fieldId: string, changes: Partial<FieldDefinition>) => void;
  onLayoutChange: (layout: ComponentSchema['layout']) => void;
  onDuplicateFields: (fieldIds: string[]) => void;
  disabled?: boolean;
}

interface SortableLayerRowProps {
  field: FieldDefinition;
  disabled: boolean;
  selected: boolean;
  highlighted: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  rowRef: (el: HTMLDivElement | null) => void;
}

function SortableLayerRow({
  field,
  disabled,
  selected,
  highlighted,
  onSelect,
  onDuplicate,
  onRemove,
  rowRef,
}: SortableLayerRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const setRefs = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    rowRef(el);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        'flex items-center gap-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/20 px-1.5 py-1 transition-colors duration-200',
        'hover:bg-sidebar-accent/35',
        selected && 'ring-1 ring-sidebar-ring',
        highlighted && 'border-sidebar-primary/55 bg-sidebar-primary/10',
        isDragging && 'z-10 opacity-90 shadow-sm'
      )}
    >
      <button
        type="button"
        className={cn(
          'flex size-7 shrink-0 cursor-grab items-center justify-center rounded border border-sidebar-border',
          'text-sidebar-foreground/65 hover:bg-sidebar-accent/45 active:cursor-grabbing',
          disabled && 'pointer-events-none opacity-40'
        )}
        aria-label={`Drag to reorder ${field.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'min-w-0 flex-1 cursor-pointer rounded px-1 py-0.5 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
        )}
      >
        <div className="truncate text-sm font-medium text-sidebar-foreground">{field.label}</div>
        <div className="flex items-center gap-1.5 truncate text-xs text-sidebar-foreground/65">
          <span className="font-mono text-[11px] leading-tight sm:text-xs">{field.id}</span>
          <span className="text-sidebar-border">·</span>
          <span>{field.type}</span>
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-sidebar-foreground/65 hover:text-sidebar-foreground"
          disabled={disabled}
          title="Duplicate"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Files className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-sidebar-foreground/65 hover:text-destructive"
          disabled={disabled}
          title="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface SortableSubmitLayerRowProps {
  disabled: boolean;
  selected: boolean;
  highlighted: boolean;
  onSelect: () => void;
  rowRef: (el: HTMLDivElement | null) => void;
}

function SortableSubmitLayerRow({
  disabled,
  selected,
  highlighted,
  onSelect,
  rowRef,
}: SortableSubmitLayerRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: SUBMIT_BUTTON_LAYER_ID,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const setRefs = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    rowRef(el);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        'flex items-center gap-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/20 px-1.5 py-1 transition-colors duration-200',
        'hover:bg-sidebar-accent/35',
        selected && 'ring-1 ring-sidebar-ring',
        highlighted && 'border-sidebar-primary/55 bg-sidebar-primary/10',
        isDragging && 'z-10 opacity-90 shadow-sm'
      )}
    >
      <button
        type="button"
        className={cn(
          'flex size-7 shrink-0 cursor-grab items-center justify-center rounded border border-sidebar-border',
          'text-sidebar-foreground/65 hover:bg-sidebar-accent/45 active:cursor-grabbing',
          disabled && 'pointer-events-none opacity-40'
        )}
        aria-label="Drag to reorder submit button"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'min-w-0 flex-1 cursor-pointer rounded px-1 py-0.5 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
        )}
      >
        <div className="truncate text-sm font-medium text-sidebar-foreground">Submit button</div>
        <div className="flex items-center gap-1.5 truncate text-xs text-sidebar-foreground/65">
          <span className="font-mono text-[11px] leading-tight sm:text-xs">{SUBMIT_BUTTON_LAYER_ID}</span>
          <span className="text-sidebar-border">·</span>
          <span>submit</span>
        </div>
      </button>
    </div>
  );
}

/**
 * Structure management: layout, sortable layers, and field properties.
 */
export function StructureControls({
  schema,
  highlightedFieldIds = [],
  onFieldSelectionChange,
  onAddField,
  onRemoveField,
  onReorderLayers,
  onModifyField,
  onLayoutChange,
  onDuplicateFields,
  disabled = false,
}: StructureControlsProps) {
  const rowRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedFieldType, setSelectedFieldType] = useState<FieldDefinition['type']>('input');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [draftLabel, setDraftLabel] = useState('');
  const [draftPlaceholder, setDraftPlaceholder] = useState('');

  const primaryHighlight = highlightedFieldIds[0] ?? null;

  useEffect(() => {
    if (primaryHighlight) {
      setSelectedFieldId(primaryHighlight);
    }
  }, [primaryHighlight]);

  const selectedField = useMemo(
    () => schema.fields.find((f) => f.id === selectedFieldId) ?? null,
    [schema.fields, selectedFieldId]
  );

  useEffect(() => {
    setDraftLabel(selectedField?.label ?? '');
    setDraftPlaceholder(selectedField?.placeholder ?? '');
  }, [selectedField?.id, selectedField?.label, selectedField?.placeholder]);

  useEffect(() => {
    const first = highlightedFieldIds[0];
    if (!first) return;
    const el = rowRefs.current.get(first);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [highlightedFieldIds]);

  useEffect(() => {
    if (selectedFieldId && !schema.fields.some((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(null);
    }
  }, [schema.fields, selectedFieldId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const layerIds = useMemo(() => getEffectiveLayerOrder(schema), [schema]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (disabled) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = layerIds.indexOf(String(active.id));
      const newIndex = layerIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      onReorderLayers(arrayMove(layerIds, oldIndex, newIndex));
    },
    [disabled, layerIds, onReorderLayers]
  );

  const selectField = useCallback(
    (id: string) => {
      setSelectedFieldId(id);
      onFieldSelectionChange?.([id]);
    },
    [onFieldSelectionChange]
  );

  const handleCopyId = useCallback((id: string) => {
    void navigator.clipboard.writeText(id).then(
      () => toast.success('Copied field id'),
      () => toast.error('Could not copy')
    );
  }, []);

  const handleAddField = useCallback(() => {
    if (!newFieldLabel.trim()) {
      toast.error('Enter a field label');
      return;
    }

    const newField: FieldDefinition = {
      id: `field_${Date.now()}`,
      type: selectedFieldType,
      label: newFieldLabel.trim(),
      placeholder: `Enter ${newFieldLabel.trim().toLowerCase()}`,
    };

    if (selectedFieldType === 'select' || selectedFieldType === 'radio') {
      newField.options = [...DEFAULT_SELECT_OPTIONS];
    }

    const insertAfterFieldId =
      selectedFieldId && schema.fields.some((f) => f.id === selectedFieldId)
        ? selectedFieldId
        : undefined;

    onAddField(newField, insertAfterFieldId ? { insertAfterFieldId } : undefined);
    setNewFieldLabel('');
    selectField(newField.id);
  }, [newFieldLabel, onAddField, schema.fields, selectField, selectedFieldId, selectedFieldType]);

  const handleRemove = useCallback(
    (fieldId: string, label: string) => {
      if (!confirm(`Remove field "${label}"?`)) return;
      onRemoveField(fieldId);
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
        onFieldSelectionChange?.([]);
      }
    },
    [onFieldSelectionChange, onRemoveField, selectedFieldId]
  );

  const layoutValue = coerceLayout(schema.layout);
  const maxSpan = maxColSpanForLayout(layoutValue);
  const showSpanControl = maxSpan > 1;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="structure-layout" className="text-xs font-medium text-sidebar-foreground/65">
          Form layout
        </Label>
        <Select
          value={layoutValue}
          onValueChange={(value) => onLayoutChange(value as ComponentSchema['layout'])}
          disabled={disabled}
        >
          <SelectTrigger id="structure-layout" className={TUNING_SELECT_TRIGGER}>
            <SelectValue placeholder="Layout" />
          </SelectTrigger>
          <SelectContent className={TUNING_SELECT_CONTENT}>
            {LAYOUT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className={TUNING_SELECT_ITEM}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-sidebar-foreground/65">
          <ListTree className="size-3.5 shrink-0" aria-hidden />
          <span>Layers</span>
          <span className="text-xs font-normal tabular-nums text-sidebar-foreground/75">
            ({layerIds.length})
          </span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={layerIds}>
            <div className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-md border border-sidebar-border bg-sidebar-accent/15 p-1.5">
              {schema.fields.length === 0 ? (
                <p className="py-3 text-center text-sm text-sidebar-foreground/65">No fields yet.</p>
              ) : null}
              {layerIds.map((layerId) => {
                  if (layerId === SUBMIT_BUTTON_LAYER_ID) {
                    return (
                      <SortableSubmitLayerRow
                        key={SUBMIT_BUTTON_LAYER_ID}
                        disabled={disabled}
                        selected={false}
                        highlighted={false}
                        onSelect={() => {
                          setSelectedFieldId(null);
                          onFieldSelectionChange?.([]);
                        }}
                        rowRef={() => {}}
                      />
                    );
                  }
                  const field = schema.fields.find((f) => f.id === layerId);
                  if (!field) return null;
                  return (
                    <SortableLayerRow
                      key={field.id}
                      field={field}
                      disabled={disabled}
                      selected={selectedFieldId === field.id}
                      highlighted={highlightedFieldIds.includes(field.id)}
                      onSelect={() => selectField(field.id)}
                      onDuplicate={() => onDuplicateFields([field.id])}
                      onRemove={() => handleRemove(field.id, field.label)}
                      rowRef={(el) => {
                        if (el) rowRefs.current.set(field.id, el);
                        else rowRefs.current.delete(field.id);
                      }}
                    />
                  );
                })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {selectedField && (
        <div className="space-y-3 rounded-md border border-sidebar-border bg-sidebar-accent/15 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-sidebar-foreground/65">
            <Layers className="size-3.5 shrink-0" aria-hidden />
            <span>Properties</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-sidebar-foreground/65">Field id</Label>
            <div className="flex gap-1">
              <Input readOnly value={selectedField.id} className={cn(TUNING_FIELD_INPUT, 'h-9 font-mono text-xs')} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 border-sidebar-border bg-sidebar-accent/25 px-2 text-sidebar-foreground hover:bg-sidebar-accent/40"
                onClick={() => handleCopyId(selectedField.id)}
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-label" className="text-xs font-medium text-sidebar-foreground/65">
              Label
            </Label>
            <Input
              id="f-label"
              className={cn(TUNING_FIELD_INPUT, 'h-9 text-sm')}
              value={draftLabel}
              disabled={disabled}
              onChange={(e) => setDraftLabel(e.target.value)}
              onBlur={() => {
                const t = draftLabel.trim();
                if (t && t !== selectedField.label) {
                  onModifyField(selectedField.id, { label: t });
                } else if (!t) {
                  setDraftLabel(selectedField.label);
                }
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-ph" className="text-xs font-medium text-sidebar-foreground/65">
              Placeholder
            </Label>
            <Input
              id="f-ph"
              className={cn(TUNING_FIELD_INPUT, 'h-9 text-sm')}
              value={draftPlaceholder}
              disabled={disabled}
              onChange={(e) => setDraftPlaceholder(e.target.value)}
              onBlur={() => {
                const next = draftPlaceholder.trim();
                if (next !== (selectedField.placeholder ?? '')) {
                  onModifyField(selectedField.id, { placeholder: next || undefined });
                }
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-sidebar-foreground/65">Type</Label>
            <Select
              value={selectedField.type}
              disabled={disabled}
              onValueChange={(value) => {
                const next = value as FieldDefinition['type'];
                const patch: Partial<FieldDefinition> = { type: next };
                if (next === 'select' || next === 'radio') {
                  patch.options = selectedField.options?.length
                    ? selectedField.options
                    : [...DEFAULT_SELECT_OPTIONS];
                } else {
                  patch.options = undefined;
                }
                onModifyField(selectedField.id, patch);
              }}
            >
              <SelectTrigger className={TUNING_SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={TUNING_SELECT_CONTENT}>
                {FIELD_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className={TUNING_SELECT_ITEM}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-sidebar-border/80 bg-sidebar-accent/25 px-2 py-1.5">
            <Label htmlFor="f-req" className="cursor-pointer text-xs font-medium text-sidebar-foreground/65">
              Required
            </Label>
            <Switch
              id="f-req"
              disabled={disabled}
              checked={Boolean(selectedField.validation?.required)}
              onCheckedChange={(checked) =>
                onModifyField(selectedField.id, {
                  validation: { ...selectedField.validation, required: checked },
                })
              }
            />
          </div>

          {showSpanControl && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-sidebar-foreground/65">Column span</Label>
              <Select
                value={String(selectedField.layout?.colSpan ?? 1)}
                disabled={disabled}
                onValueChange={(v) => {
                  const n = Number(v) as 1 | 2 | 3;
                  onModifyField(selectedField.id, {
                    layout: { ...selectedField.layout, colSpan: n },
                  });
                }}
              >
                <SelectTrigger className={TUNING_SELECT_TRIGGER}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={TUNING_SELECT_CONTENT}>
                  {Array.from({ length: maxSpan }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)} className={TUNING_SELECT_ITEM}>
                      {n === 1 ? '1 (default)' : String(n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(selectedField.type === 'select' || selectedField.type === 'radio') && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-sidebar-foreground/65">Options</Label>
              <div className="space-y-1.5">
                {(selectedField.options ?? DEFAULT_SELECT_OPTIONS).map((opt, idx) => (
                  <div key={idx} className="flex gap-1">
                    <Input
                      className={cn(TUNING_FIELD_INPUT, 'h-8 flex-1 text-sm')}
                      placeholder="Label"
                      disabled={disabled}
                      value={opt.label}
                      onChange={(e) => {
                        const opts = [...(selectedField.options ?? DEFAULT_SELECT_OPTIONS)];
                        opts[idx] = { ...opts[idx], label: e.target.value };
                        onModifyField(selectedField.id, { options: opts });
                      }}
                    />
                    <Input
                      className={cn(TUNING_FIELD_INPUT, 'h-8 w-24 shrink-0 font-mono text-xs')}
                      placeholder="value"
                      disabled={disabled}
                      value={opt.value}
                      onChange={(e) => {
                        const opts = [...(selectedField.options ?? DEFAULT_SELECT_OPTIONS)];
                        opts[idx] = { ...opts[idx], value: e.target.value };
                        onModifyField(selectedField.id, { options: opts });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-sidebar-foreground/65 hover:text-destructive"
                      disabled={disabled || (selectedField.options?.length ?? 0) <= 1}
                      title="Remove option"
                      onClick={() => {
                        const opts = [...(selectedField.options ?? DEFAULT_SELECT_OPTIONS)];
                        opts.splice(idx, 1);
                        onModifyField(selectedField.id, { options: opts.length ? opts : [{ label: 'A', value: 'a' }] });
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-full border-sidebar-border bg-sidebar-accent/25 text-xs text-sidebar-foreground hover:bg-sidebar-accent/40"
                  disabled={disabled}
                  onClick={() => {
                    const opts = [...(selectedField.options ?? DEFAULT_SELECT_OPTIONS)];
                    opts.push({ label: `Option ${opts.length + 1}`, value: `option${opts.length + 1}` });
                    onModifyField(selectedField.id, { options: opts });
                  }}
                >
                  <Plus className="mr-1 size-3" />
                  Add option
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 rounded-md border border-sidebar-border bg-sidebar-accent/15 p-3">
        <Label className="text-xs font-medium text-sidebar-foreground/65">Add field</Label>
        <p className="text-xs leading-relaxed text-sidebar-foreground/65">
          New field is inserted after the selected layer, or at the end if none selected.
        </p>
        <Select
          value={selectedFieldType}
          disabled={disabled}
          onValueChange={(value) => setSelectedFieldType(value as FieldDefinition['type'])}
        >
          <SelectTrigger className={TUNING_SELECT_TRIGGER}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={TUNING_SELECT_CONTENT}>
            {FIELD_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className={TUNING_SELECT_ITEM}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={newFieldLabel}
          disabled={disabled}
          onChange={(e) => setNewFieldLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddField();
            }
          }}
          placeholder="Label"
          className={cn(TUNING_FIELD_INPUT, 'h-9 text-sm')}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 w-full border-sidebar-border bg-sidebar-primary text-sm text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          disabled={disabled || !newFieldLabel.trim()}
          onClick={handleAddField}
        >
          <Plus className="mr-1.5 size-3.5" />
          Add field
        </Button>
      </div>

      <div className="flex items-center justify-between border-t border-sidebar-border pt-2 text-xs text-sidebar-foreground/65">
        <span>Required fields</span>
        <span className="tabular-nums text-sidebar-foreground">
          {schema.fields.filter((f) => f.validation?.required).length}
        </span>
      </div>
    </div>
  );
}

// Made with Bob
