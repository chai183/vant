/**
 * schema 转换基础工具（无业务依赖，供 apply-type-config / transform-schema 共用）
 */
import type { SchemaFieldItem, SchemaFieldTypeConfig } from './types';

/** schema 字段 key：取 columnName */
export function getSchemaFieldKey(field?: SchemaFieldItem | null) {
  return field?.columnName || '';
}

export function parseTypeConfigJson(
  field?: SchemaFieldItem | null,
): SchemaFieldTypeConfig {
  const raw = field?.typeConfigJson;
  if (raw == null || raw === '') return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

/** 只读回显字段名：typeConfigJson.fieldMapping */
export function getSchemaFieldMapping(field?: SchemaFieldItem | null) {
  const mapping = parseTypeConfigJson(field)?.fieldMapping;
  if (mapping == null || mapping === '') return '';
  return String(mapping);
}

/** 是否 { label, value } 回显对象 */
export function isLabelValue(value: unknown): value is {
  label?: unknown;
  value: unknown;
} {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, 'value'),
  );
}

/** 取出实际绑定 / 提交值（{ label, value } → value） */
export function unwrapLabelValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => unwrapLabelValue(item));
  }
  if (isLabelValue(value)) {
    return value.value;
  }
  return value;
}

export function toLabelValue(value: unknown, label?: unknown) {
  const unwrapped = unwrapLabelValue(value);
  if (unwrapped == null || unwrapped === '') {
    return unwrapped ?? '';
  }
  const text =
    label == null || label === ''
      ? isLabelValue(value)
        ? value.label
        : ''
      : label;
  if (text == null || text === '') {
    return unwrapped;
  }
  return { label: String(text), value: unwrapped };
}
