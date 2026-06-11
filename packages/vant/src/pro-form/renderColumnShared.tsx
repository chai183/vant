import { h, type Component, type VNode } from 'vue';
import { Field } from '../field';
import { renderBuiltinInput } from './renderBuiltinInput';
import { renderBuiltinField } from './renderBuiltinField';
import { mergeRenderBindProps } from './mergeRenderBindProps';
import { resolveColumnFieldSlots } from './resolveFieldSlots';
import {
  resolveFormDisabled,
  resolveFormReadonly,
} from './resolveFormState';
import type { FieldProps } from '../field/Field';
import type {
  ProFormColumn,
  ProFormComponentRender,
  ProFormNestedColumnItem,
  ProFormRenderContext,
} from './types';

/**
 * 内置控件分两类渲染路径：
 * - input：作为 Field 的 input 插槽内容（Switch、Checkbox 等）
 * - field：自带 Field 封装的复合控件（Picker、DatePicker 等）
 */
export const BUILTIN_INPUT_COMPONENTS = new Set([
  'switch',
  'checkbox',
  'checkboxGroup',
  'radio',
  'radioGroup',
  'stepper',
  'rate',
  'slider',
  'uploader',
]);

export const BUILTIN_FIELD_COMPONENTS = new Set([
  'picker',
  'radioPicker',
  'checkboxPicker',
  'datePicker',
  'area',
  'areaStepCascader',
  'calendar',
  'fieldMoney',
  'fieldChildren',
  'rangeInput',
  'uploaderFile',
]);

export function isBuiltinInputComponent(component: string) {
  return BUILTIN_INPUT_COMPONENTS.has(component);
}

export function isBuiltinFieldComponent(component: string) {
  return BUILTIN_FIELD_COMPONENTS.has(component);
}

type RenderContextOptions = {
  model: Record<string, unknown>;
  value: unknown;
  setValue: (value: unknown) => void;
  formDisabled?: boolean;
  formReadonly?: boolean;
};

/** 为 render / 插槽 / components 注册提供统一上下文 */
export function buildRenderContext(
  column: ProFormColumn,
  options: RenderContextOptions,
): ProFormRenderContext {
  const fieldProps = column.fieldProps ?? {};

  return {
    column,
    model: options.model,
    value: options.value,
    disabled: resolveFormDisabled(
      options.formDisabled,
      fieldProps,
      column.componentProps,
    ),
    readonly: resolveFormReadonly(
      options.formReadonly,
      fieldProps,
      column.componentProps,
    ),
    setValue: options.setValue,
    bindProps: (extra) => ({
      ...column.componentProps,
      ...extra,
      column,
      model: options.model,
      modelValue: options.value,
      disabled: resolveFormDisabled(options.formDisabled, fieldProps, {
        ...column.componentProps,
        ...extra,
      }),
      readonly: resolveFormReadonly(options.formReadonly, fieldProps, {
        ...column.componentProps,
        ...extra,
      }),
      'onUpdate:modelValue': options.setValue,
    }),
  };
}

/** 渲染自定义组件：函数形式自动 merge bindProps，组件形式直接 h() 并绑定 */
export function renderCustomNode(
  render: ProFormComponentRender | Component,
  ctx: ProFormRenderContext,
): VNode | VNode[] | null {
  if (typeof render === 'function') {
    const node = (render as ProFormComponentRender)(ctx);
    return mergeRenderBindProps(node, ctx) as VNode | VNode[] | null;
  }
  return h(render as Component, ctx.bindProps());
}

type ColumnContentOptions = {
  formDisabled?: boolean;
  formReadonly?: boolean;
};

/**
 * 渲染 column 的控件内容（不含 ProForm 层的 hidden / 整项插槽 / name-label 绑定）。
 * 用于 rangeInput start/end、fieldChildren row 等嵌套场景。
 */
export function renderColumnContent(
  column: ProFormColumn,
  ctx: ProFormRenderContext,
  options: ColumnContentOptions = {},
): VNode | VNode[] | null {
  const fieldProps = (column.fieldProps ?? {}) as Partial<FieldProps>;
  const fieldSlots = resolveColumnFieldSlots(column, ctx);

  if (column.render) {
    return renderCustomNode(column.render, ctx);
  }

  const component = column.component;

  if (component && isBuiltinFieldComponent(component)) {
    return renderBuiltinField({
      column,
      value: ctx.value,
      setValue: ctx.setValue,
      fieldProps,
      fieldSlots,
      formDisabled: options.formDisabled,
      formReadonly: options.formReadonly,
    });
  }

  if (component && isBuiltinInputComponent(component)) {
    return renderBuiltinInput(ctx);
  }

  return (
    <Field {...fieldProps}>
      {{
        ...fieldSlots,
      }}
    </Field>
  );
}

function normalizeRenderNode(node: VNode | VNode[] | null | undefined): VNode {
  if (Array.isArray(node)) {
    return node[0];
  }
  return node as VNode;
}

function toProFormColumn(item: ProFormNestedColumnItem): ProFormColumn {
  if (typeof item === 'function') {
    return { name: '' };
  }
  return { name: '', ...item };
}

/** 将嵌套项（渲染函数或 column 配置）统一为 () => VNode */
export function createNestedItemRender(
  item: ProFormNestedColumnItem,
  options: ColumnContentOptions,
): () => VNode {
  if (typeof item === 'function') {
    return () => normalizeRenderNode(item());
  }

  const column = toProFormColumn(item);
  const ctx = buildRenderContext(column, {
    model: {},
    value: '',
    setValue: () => {},
    formDisabled: options.formDisabled,
    formReadonly: options.formReadonly,
  });

  return () => normalizeRenderNode(renderColumnContent(column, ctx, options));
}
