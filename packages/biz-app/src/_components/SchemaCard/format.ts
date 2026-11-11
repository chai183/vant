import { showImagePreview } from 'vant';
import { getSchemaFieldMapping } from '@/_components/SchemaProForm/transform-schema-utils';
import type { SchemaCardField } from './types';

function isEmptyValue(value: unknown) {
  if (value == null) return true;
  if (value === '') return true;
  if (Array.isArray(value) && !value.length) return true;
  return false;
}

function unwrapObjectValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const row = value as Record<string, unknown>;
  return row.staffName ?? row.label ?? row.name ?? '';
}

function readFileUrl(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const row = value as Record<string, unknown>;
  return String(
    row.url || row.objectUrl || row.content || row.thumbUrl || '',
  ).trim();
}

function isDisplayableUrl(url: string) {
  return (
    /^https?:\/\//.test(url) ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/')
  );
}

/** 字段取值 key */
export function getSchemaCardFieldName(field: SchemaCardField) {
  return String(field.name || field.fieldCode || field.columnName || '').trim();
}

/** 字段展示名 */
export function getSchemaCardFieldLabel(field: SchemaCardField) {
  return String(field.label || field.fieldName || '').trim();
}

/** 回显映射名 */
export function getSchemaCardFieldMapping(field: SchemaCardField) {
  const mapping = String(field.mapping || field.fieldMapping || '').trim();
  if (mapping) return mapping;
  return getSchemaFieldMapping({
    columnName: getSchemaCardFieldName(field),
    fieldName: getSchemaCardFieldLabel(field),
    fieldType: String(field.fieldType || ''),
    typeConfigJson: field.typeConfigJson as never,
  });
}

/** 原始值：映射字段优先 */
export function readSchemaCardRaw(
  field: SchemaCardField,
  record: Record<string, unknown> = {},
) {
  const mapKey = getSchemaCardFieldMapping(field);
  if (
    mapKey &&
    Object.prototype.hasOwnProperty.call(record, mapKey) &&
    !isEmptyValue(record[mapKey])
  ) {
    return record[mapKey];
  }
  const name = getSchemaCardFieldName(field);
  if (name && Object.prototype.hasOwnProperty.call(record, name)) {
    return record[name];
  }
  return undefined;
}

export function isSchemaCardImageField(field: SchemaCardField) {
  const type = String(field.fieldType || '')
    .trim()
    .toUpperCase();
  return type === 'IMAGE' || type === 'IMG';
}

export function isSchemaCardFileField(field: SchemaCardField) {
  return (
    String(field.fieldType || '')
      .trim()
      .toUpperCase() === 'FILE'
  );
}

export function isSchemaCardTipField(field: SchemaCardField) {
  if (field.tip) return true;
  const name = getSchemaCardFieldName(field);
  const label = getSchemaCardFieldLabel(field);
  return name === 'historicalYears' || label.includes('司龄');
}

/** 可预览图片地址 */
export function getSchemaCardImages(value: unknown) {
  const list = Array.isArray(value)
    ? value
    : isEmptyValue(value)
      ? []
      : [value];
  return list
    .map((item) => readFileUrl(item))
    .filter((item) => item && isDisplayableUrl(item));
}

/** 附件名 */
export function getSchemaCardFiles(value: unknown) {
  const list = Array.isArray(value)
    ? value
    : isEmptyValue(value)
      ? []
      : [value];
  return list
    .map((item) => {
      if (typeof item === 'string') {
        return {
          name: item,
          url: isDisplayableUrl(item) ? item : '',
        };
      }
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const url = readFileUrl(item);
      const name = String(row.name || row.fileName || url || '附件');
      return { name, url };
    })
    .filter(Boolean) as Array<{ name: string; url: string }>;
}

export function previewSchemaCardImages(urls: string[], start = 0) {
  if (!urls.length) return;
  showImagePreview({
    images: urls,
    startPosition: start,
  });
}

function matchOptionLabel(options: SchemaCardField['options'], value: unknown) {
  if (!options?.length || isEmptyValue(value)) return '';
  const hit = options.find((option) => String(option.value) === String(value));
  return hit ? String(hit.label) : '';
}

/** 字段展示文案 */
export function formatSchemaCardValue(
  field: SchemaCardField,
  record: Record<string, unknown> = {},
) {
  if (field.fieldLabel) return field.fieldLabel;
  const type = String(field.fieldType || '')
    .trim()
    .toUpperCase();
  const raw = unwrapObjectValue(readSchemaCardRaw(field, record));
  if (type === 'IMAGE' || type === 'IMG' || type === 'FILE') {
    return '';
  }
  const optionLabel = matchOptionLabel(field.options, raw);
  if (optionLabel) return optionLabel;
  if (type === 'BOOLEAN') {
    if (raw === 1 || raw === '1' || raw === true) return '是';
    if (raw === 0 || raw === '0' || raw === false) return '否';
  }
  if (Array.isArray(raw)) {
    return raw
      .map(
        (item) => matchOptionLabel(field.options, item) || String(item ?? ''),
      )
      .filter((item) => item !== '')
      .join('、');
  }
  if (isEmptyValue(raw)) return '';
  return String(raw);
}
