import type { FieldProps } from '../field/Field';

// 克隆默认值，避免初始化时复用数组/对象引用。
export function cloneDefaultValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return [...value];
  }
  if (value && typeof value === 'object') {
    return { ...(value as Record<string, unknown>) };
  }
  return value;
}

// 判断值是否“有效”，用于筛选项标题高亮和是否选中状态判断。
export function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(hasValue);
  }
  return value !== undefined && value !== null && value !== '';
}

// 将 number/string 配置统一转成 number，非法值回退默认值。
export function toNumber(
  value: number | string | undefined,
  defaultValue: number,
) {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

// 保留用户传入 class，同时追加组件内部 class。
function mergeClassName(className: unknown, extra: string) {
  return className ? [className, extra] : extra;
}

// 给漏斗内 slider 对应 Field 追加专用 class，便于只在本组件内做样式适配。
export function appendSliderFieldClass(
  fieldProps: Partial<FieldProps> | undefined,
  fieldClass: string,
  labelClass: string,
): Partial<FieldProps> {
  const props = { ...(fieldProps ?? {}) } as Record<string, unknown>;
  props.class = mergeClassName(props.class, fieldClass);
  props.labelClass = mergeClassName(props.labelClass, labelClass);
  return props as Partial<FieldProps>;
}
