import { inject, type ExtractPropTypes, type PropType } from 'vue';
import { FORM_KEY, isDef } from '../../utils';
import type { FieldProps } from '../../field/Field';
import type { ProFormOption } from '../types';

export function defaultFormOptions(label = ''): ProFormOption[] {
  return [
    { label: `${label} 1`, value: '1' },
    { label: `${label} 2`, value: '2' },
  ];
}

export function getFormFieldOptions(
  componentProps: Record<string, unknown>,
  fallbackLabel = '',
): ProFormOption[] {
  const options = componentProps.options as ProFormOption[] | undefined;
  return options?.length ? options : defaultFormOptions(fallbackLabel);
}

export function resolveOptionLabel(
  options: ProFormOption[],
  value: unknown,
) {
  return options.find((opt) => opt.value === value)?.label ?? String(value);
}

export function resolveOptionLabels(
  options: ProFormOption[],
  values: unknown[],
) {
  return values.map((value) => resolveOptionLabel(options, value));
}

/** 解析 Field / Form 级状态；弹层类字段仅在 disabled 时拦截 open（readonly 仍可点开） */
export function useFormFieldState(
  getFieldProps: () => Partial<FieldProps> = () => ({}),
) {
  const form = inject(FORM_KEY, null);

  const isDisabled = () => {
    const fieldProps = getFieldProps();
    if (isDef(fieldProps?.disabled)) {
      return fieldProps.disabled;
    }
    return !!form?.props.disabled;
  };

  const isReadonly = () => {
    const fieldProps = getFieldProps();
    if (isDef(fieldProps?.readonly)) {
      return fieldProps.readonly;
    }
    return !!form?.props.readonly;
  };

  const isLocked = () => isDisabled() || isReadonly();

  const guardOpen = (open: () => void) => {
    if (!isDisabled()) {
      open();
    }
  };

  return { isDisabled, isReadonly, isLocked, guardOpen };
}

/** @deprecated 使用 useFormFieldState */
export const useFormFieldDisabled = useFormFieldState;

export const builtinFieldProps = {
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },
  fieldProps: {
    type: Object as PropType<Partial<FieldProps>>,
    default: () => ({}),
  },
  componentProps: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
};

export type BuiltinFieldProps = ExtractPropTypes<typeof builtinFieldProps>;

export const defaultPopupProps = {
  destroyOnClose: true,
  round: true,
  position: 'bottom' as const,
  teleport: 'body',
};
