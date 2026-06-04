import { inject, type ExtractPropTypes, type PropType } from 'vue';
import { FORM_KEY, createNamespace, isDef, omit } from '../../utils';
import type { FieldProps } from '../../field/Field';
import type { ProFormFieldSlots } from '../resolveFieldSlots';
import type { ProFormOption } from '../types';

export function getFormFieldOptions(
  componentProps: Record<string, unknown>,
): ProFormOption[] {
  const options = componentProps.options as ProFormOption[] | undefined;
  return options ?? [];
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
  fieldSlots: {
    type: Object as PropType<ProFormFieldSlots>,
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

const [, , popupT] = createNamespace('popup');

const fieldPopupPropKeys = [
  'popupTitle',
  'title',
  'clearText',
  'deleteText',
  'confirmText',
  'cancelText',
  'clearable',
  'showClearButton',
  'closeIcon',
  'closeIconPosition',
] as const;

/** 从 componentProps 解析 Popup 标题栏，并剥离弹层专用配置 */
export function resolveFieldPopupProps(
  componentProps: Record<string, unknown>,
  options: {
    fallbackTitle?: string;
    /** 左侧删除按钮，点击清空选中值 */
    showClear?: boolean;
    /** 右上角关闭图标，仅关闭弹层 */
    closeable?: boolean;
    /** 取消 + 确认按钮，确认在右上角 */
    confirmable?: boolean;
  } = {},
) {
  const restComponentProps = omit(componentProps, fieldPopupPropKeys);

  const popupTitle =
    (componentProps.popupTitle as string | undefined) ??
    (componentProps.title as string | undefined) ??
    options.fallbackTitle;

  const enableClear =
    componentProps.clearable !== false &&
    componentProps.showClearButton !== false;

  const popupHeaderProps: Record<string, unknown> = {};

  if (popupTitle) {
    popupHeaderProps.title = popupTitle;
  }

  if (options.closeable) {
    popupHeaderProps.closeable = true;
    if (componentProps.closeIcon) {
      popupHeaderProps.closeIcon = componentProps.closeIcon;
    }
    if (componentProps.closeIconPosition) {
      popupHeaderProps.closeIconPosition = componentProps.closeIconPosition;
    }
  } else if (options.confirmable) {
    popupHeaderProps.cancelButtonText =
      (componentProps.cancelText as string | undefined) ??
      popupT('cancel');
    popupHeaderProps.confirmButtonText =
      (componentProps.confirmText as string | undefined) ??
      popupT('confirm');
  } else if (enableClear && options.showClear) {
    popupHeaderProps.cancelButtonText =
      (componentProps.deleteText as string | undefined) ??
      (componentProps.clearText as string | undefined) ??
      popupT('delete');
  }

  return { popupHeaderProps, restComponentProps };
}
