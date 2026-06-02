import { isDef } from '../utils';
import type { FieldProps } from '../field/Field';

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
