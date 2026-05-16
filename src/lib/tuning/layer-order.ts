/**
 * Form layer ordering: field ids plus a reserved token for the submit control.
 * Used by UX tuning (structure layers), preview, and export.
 */

import type { ComponentSchema, FieldDefinition } from '@/lib/watsonx/types';

/** Reserved id for the submit button row in layer lists (never a real field id). */
export const SUBMIT_BUTTON_LAYER_ID = '__submit__' as const;

/**
 * Default layer list: all fields in schema order, then submit.
 */
export function defaultLayerOrder(fieldIds: string[]): string[] {
  return [...fieldIds, SUBMIT_BUTTON_LAYER_ID];
}

/**
 * Merge saved layer order with the current schema: drop unknown ids, dedupe,
 * append missing fields, ensure exactly one submit token (append if missing).
 */
export function reconcileLayerOrderWithSchema(
  schema: ComponentSchema,
  saved: string[]
): string[] | null {
  if (!saved?.length) return null;
  const fieldIds = schema.fields.map((f) => f.id);
  const fieldSet = new Set(fieldIds);
  const SUBMIT = SUBMIT_BUTTON_LAYER_ID;

  const seenField = new Set<string>();
  const out: string[] = [];
  let submitCount = 0;

  for (const id of saved) {
    if (id === SUBMIT) {
      submitCount += 1;
      if (submitCount === 1) out.push(SUBMIT);
      continue;
    }
    if (!fieldSet.has(id) || seenField.has(id)) continue;
    seenField.add(id);
    out.push(id);
  }

  for (const id of fieldIds) {
    if (!seenField.has(id)) out.push(id);
  }

  if (!out.includes(SUBMIT)) out.push(SUBMIT);
  if (out.filter((x) => x === SUBMIT).length !== 1) return null;
  if (out.filter((x) => x !== SUBMIT).length !== fieldIds.length) return null;

  return out;
}

/**
 * Resolved layer order for preview / UI (never empty when there are fields).
 */
export function getEffectiveLayerOrder(schema: ComponentSchema): string[] {
  const ids = schema.fields.map((f) => f.id);
  if (ids.length === 0) return [SUBMIT_BUTTON_LAYER_ID];
  if (!schema.layerOrder?.length) return defaultLayerOrder(ids);
  const merged = reconcileLayerOrderWithSchema(schema, schema.layerOrder);
  return merged ?? defaultLayerOrder(ids);
}

/**
 * After canvas drag reorders fields only, rebuild full layer order while keeping
 * the submit token in the same "before / after field sets" partition.
 */
export function layerOrderAfterCanvasFieldReorder(
  previousLayerOrder: string[] | undefined,
  newFieldOrder: string[]
): string[] {
  const SUBMIT = SUBMIT_BUTTON_LAYER_ID;
  const prev =
    previousLayerOrder?.includes(SUBMIT) && previousLayerOrder.length > 0
      ? [...previousLayerOrder]
      : [...newFieldOrder, SUBMIT];
  const submitIdx = prev.indexOf(SUBMIT);
  const beforeIds = new Set(prev.slice(0, submitIdx).filter((id) => id !== SUBMIT));
  const afterIds = new Set(prev.slice(submitIdx + 1).filter((id) => id !== SUBMIT));
  const beforeList = newFieldOrder.filter((id) => beforeIds.has(id));
  const afterList = newFieldOrder.filter((id) => afterIds.has(id));
  const rest = newFieldOrder.filter((id) => !beforeIds.has(id) && !afterIds.has(id));
  return [...beforeList, SUBMIT, ...rest, ...afterList];
}

/**
 * Merge a visible-only layer permutation (design canvas) back into a full layer list.
 */
export function mergeVisibleLayerReorder(
  fullLayerOrder: string[],
  visibleLayerOrderAfterDrag: string[],
  allFields: FieldDefinition[],
  formData: Record<string, unknown>
): string[] {
  const visible = new Set(
    allFields
      .filter((f) => !f.conditional || shouldShowFieldForLayer(f, formData))
      .map((f) => f.id)
  );
  visible.add(SUBMIT_BUTTON_LAYER_ID);

  const isVisibleToken = (id: string) =>
    id === SUBMIT_BUTTON_LAYER_ID || visible.has(id);

  let i = 0;
  return fullLayerOrder.map((token) => {
    if (!isVisibleToken(token)) return token;
    return visibleLayerOrderAfterDrag[i++] ?? token;
  });
}

function shouldShowFieldForLayer(field: FieldDefinition, formData: Record<string, unknown>): boolean {
  if (!field.conditional) return true;
  const { field: conditionField, value: conditionValue } = field.conditional;
  return formData[conditionField] === conditionValue;
}

// Made with Bob
