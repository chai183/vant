import { showImagePreview } from 'vant';
import type { RosterDetailField } from '@/types/employee/roster';

function isEmptyValue(value: unknown) {
  if (value == null) return true;
  if (value === '') return true;
  if (Array.isArray(value) && !value.length) return true;
  return false;
}

function readMappedValue(
  field: RosterDetailField,
  record: Record<string, unknown>,
) {
  const mapKey = String(field.fieldMapping || '').trim();
  if (
    mapKey &&
    Object.prototype.hasOwnProperty.call(record, mapKey) &&
    !isEmptyValue(record[mapKey])
  ) {
    return record[mapKey];
  }
  if (Object.prototype.hasOwnProperty.call(record, field.fieldCode)) {
    return record[field.fieldCode];
  }
  return undefined;
}

function unwrapObjectValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const row = value as Record<string, unknown>;
  return row.staffName ?? row.label ?? row.name ?? '';
}

/** 是否图片字段 */
export function isRosterImageField(field: RosterDetailField) {
  const type = String(field.fieldType || '')
    .trim()
    .toUpperCase();
  return type === 'IMAGE' || type === 'IMG';
}

/** 是否文件字段 */
export function isRosterFileField(field: RosterDetailField) {
  return (
    String(field.fieldType || '')
      .trim()
      .toUpperCase() === 'FILE'
  );
}

/** 原始字段值 */
export function readRosterFieldRaw(
  field: RosterDetailField,
  record: Record<string, unknown> = {},
) {
  return readMappedValue(field, record);
}

/** 图片地址列表 */
export function readRosterImageUrls(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  const text = String(value || '').trim();
  if (!text) return [];
  if (text.includes(',')) {
    return text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (
    /^https?:\/\//.test(text) ||
    text.startsWith('data:') ||
    text.startsWith('/')
  ) {
    return [text];
  }
  return [text];
}

/** 能直接预览的图片地址 */
export function getRosterDisplayImages(value: unknown) {
  return readRosterImageUrls(value).filter(
    (item) =>
      /^https?:\/\//.test(item) ||
      item.startsWith('data:') ||
      item.startsWith('/'),
  );
}

/** 司龄等带说明图标的字段 */
export function isRosterTipField(field: RosterDetailField) {
  return (
    field.fieldCode === 'historicalYears' ||
    String(field.fieldName || '').includes('司龄')
  );
}

/** 预览图片 */
export function previewRosterImages(urls: string[], start = 0) {
  if (!urls.length) return;
  showImagePreview({
    images: urls,
    startPosition: start,
  });
}

/** 字段展示文案。映射字段优先。 */
export function formatRosterFieldValue(
  field: RosterDetailField,
  record: Record<string, unknown> = {},
) {
  if (field.fieldLabel) return field.fieldLabel;
  const type = String(field.fieldType || '')
    .trim()
    .toUpperCase();
  const value = unwrapObjectValue(readMappedValue(field, record));
  if (type === 'IMAGE' || type === 'IMG' || type === 'FILE') {
    return isEmptyValue(value) ? '' : '已上传';
  }
  if (type === 'BOOLEAN') {
    const hit = (field.options || []).find(
      (option) => String(option.value) === String(value),
    );
    if (hit) return hit.label;
    if (value === 1 || value === '1' || value === true) return '是';
    if (value === 0 || value === '0' || value === false) return '否';
  }
  if (Array.isArray(value)) {
    return value.filter((item) => !isEmptyValue(item)).join('、');
  }
  if (isEmptyValue(value)) return '';
  return String(value);
}
