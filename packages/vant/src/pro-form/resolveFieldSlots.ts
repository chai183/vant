import { h, type Component, type Slots, type VNodeChild } from 'vue';
import type { ProFormColumn, ProFormRenderContext } from './types';

export const PRO_FORM_FIELD_SLOT_NAMES = [
  'label',
  'label-comment',
  'label-tooltip',
  'label-action',
  'input-comment',
  'input-bottom',
  'input-left',
  'left-icon',
  'right-icon',
  'error-message',
  'bottom',
  'extra',
] as const;

export type ProFormFieldSlotName = (typeof PRO_FORM_FIELD_SLOT_NAMES)[number];

type ProFormColumnFieldSlot = NonNullable<
  NonNullable<ProFormColumn['fieldSlots']>[ProFormFieldSlotName]
>;

type ProFormFieldSlot = (props?: Record<string, unknown>) => VNodeChild;

export type ProFormFieldSlots = Partial<
  Record<ProFormFieldSlotName, ProFormFieldSlot>
>;

type ProFormColumnFieldSlotRender = (
  ctx: ProFormRenderContext,
) => VNodeChild;

function normalizeColumnFieldSlot(
  slot: ProFormColumnFieldSlot,
  ctx: ProFormRenderContext,
): ProFormFieldSlot | undefined {
  if (typeof slot === 'string') {
    return () => slot;
  }

  if (typeof slot === 'function') {
    return () => (slot as ProFormColumnFieldSlotRender)(ctx);
  }

  return () => h(slot as Component, ctx.bindProps());
}

export function resolveColumnFieldSlots(
  column: ProFormColumn,
  ctx: ProFormRenderContext,
): ProFormFieldSlots {
  const result: ProFormFieldSlots = {};
  const columnSlots = column.fieldSlots;

  if (!columnSlots) {
    return result;
  }

  for (const fieldSlot of PRO_FORM_FIELD_SLOT_NAMES) {
    const slot = columnSlots[fieldSlot];
    if (slot != null) {
      const normalized = normalizeColumnFieldSlot(slot, ctx);
      if (normalized) {
        result[fieldSlot] = normalized;
      }
    }
  }

  return result;
}

export function resolveFieldSlots(
  slots: Slots,
  columnSlotName: string,
): ProFormFieldSlots {
  const result: ProFormFieldSlots = {};

  for (const fieldSlot of PRO_FORM_FIELD_SLOT_NAMES) {
    const proFormSlot = slots[`${fieldSlot}-${columnSlotName}`];
    if (proFormSlot) {
      result[fieldSlot] = proFormSlot;
    }
  }

  return result;
}

/** 合并 column.fieldSlots 与模板插槽，模板插槽优先级更高 */
export function mergeFieldSlots(
  columnSlots: ProFormFieldSlots,
  templateSlots: ProFormFieldSlots,
): ProFormFieldSlots {
  return { ...columnSlots, ...templateSlots };
}
