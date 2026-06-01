import { isDef } from '../utils';
import type { FieldProps } from '../field/Field';
import type { ProFormBuiltinComponent } from './types';

/** 与 Field.getProp 一致：fieldProps / componentProps 优先于 Form.disabled */
export function resolveFormDisabled(
  formDisabled?: boolean,
  fieldProps?: Partial<FieldProps>,
  componentProps?: Record<string, unknown>,
): boolean | undefined {
  if (isDef(fieldProps?.disabled)) {
    return fieldProps.disabled as boolean;
  }
  if (isDef(componentProps?.disabled)) {
    return componentProps.disabled as boolean;
  }
  return formDisabled;
}

/** 与 Field.getProp 一致：fieldProps / componentProps 优先于 Form.readonly */
export function resolveFormReadonly(
  formReadonly?: boolean,
  fieldProps?: Partial<FieldProps>,
  componentProps?: Record<string, unknown>,
): boolean | undefined {
  if (isDef(fieldProps?.readonly)) {
    return fieldProps.readonly as boolean;
  }
  if (isDef(componentProps?.readonly)) {
    return componentProps.readonly as boolean;
  }
  return formReadonly;
}

const BUILTIN_INPUT_READONLY_COMPONENTS = new Set<ProFormBuiltinComponent>([
  'rate',
  'slider',
  'uploader',
]);

const BUILTIN_FIELD_READONLY_COMPONENTS = new Set([
  'uploaderFile',
  'calendar',
]);

/** 内置 #input 控件：有 readonly API 则透传，否则用 disabled 模拟不可编辑 */
export function mergeBuiltinInputProps(
  component: ProFormBuiltinComponent | string,
  componentProps: Record<string, unknown>,
  state: { readonly?: boolean; disabled?: boolean },
) {
  const props = { ...componentProps };

  if (state.disabled !== undefined) {
    props.disabled = state.disabled;
  }

  if (state.readonly) {
    if (BUILTIN_INPUT_READONLY_COMPONENTS.has(component as ProFormBuiltinComponent)) {
      props.readonly = true;
    } else if (!props.disabled) {
      props.disabled = true;
    }
  }

  return props;
}

/** 内置 field 包装组件（uploaderFile 等）的 componentProps 合并 */
export function mergeBuiltinFieldComponentProps(
  component: string,
  componentProps: Record<string, unknown>,
  state: { readonly?: boolean; disabled?: boolean },
) {
  const props = { ...componentProps };

  if (state.disabled !== undefined) {
    props.disabled = state.disabled;
  }

  if (
    state.readonly &&
    BUILTIN_FIELD_READONLY_COMPONENTS.has(component)
  ) {
    props.readonly = true;
  }

  return props;
}
