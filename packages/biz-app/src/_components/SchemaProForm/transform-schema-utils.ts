/**
 * schema 转换基础工具（无业务依赖，供 apply-type-config / transform-schema 共用）
 */
import type { SchemaFieldItem, SchemaFieldTypeConfig } from './types';

/** 图片/附件回显统一为控件列表；保留文件 ID，不编造预览地址或上传结果。 */
export function normalizeSchemaUploadFiles(
  value: unknown,
): Record<string, unknown>[] {
  const files = Array.isArray(value)
    ? value
    : value == null || value === ''
      ? []
      : [value];
  return files.flatMap<Record<string, unknown>>((item) => {
    if (item && typeof item === 'object') {
      const row = item as Record<string, unknown>;
      const response = row.response as
        | {
            body?: Record<string, unknown>;
            fileId?: string;
            id?: string;
            fileName?: string;
            originalName?: string;
          }
        | undefined;
      const source = response?.body || response;
      const name =
        row.name ||
        row.fileName ||
        row.originalName ||
        source?.originalName ||
        source?.fileName;
      const url = row.url || row.fileUrl || row.previewUrl || row.downloadUrl;
      const fileId = row.fileId || row.id || source?.fileId || source?.id;
      return [
        {
          ...row,
          ...(name ? { name } : {}),
          ...(url ? { url } : {}),
          ...(fileId ? { fileId } : {}),
          ...(row.status === 'success' ? { status: 'done' } : {}),
        },
      ];
    }
    const text = String(item);
    if (/^(https?:|data:|blob:|\/)/.test(text)) return [{ url: text }];
    return text
      .split(',')
      .map((fileId) => fileId.trim())
      .filter(Boolean)
      .map((fileId) => ({ fileId, name: fileId }));
  });
}

/** 与 PC ProForm 一致：控件列表裁剪为附件 ID 与原名，不夹带本地文件或展示地址。 */
export function normalizeSchemaUploadSubmit(value: unknown) {
  return normalizeSchemaUploadFiles(value).map((file) => {
    const fileId = String(file.fileId || file.id || '').trim();
    if (!fileId) throw new Error('附件缺少文件 ID，请完成上传后保存');
    return {
      fileId,
      fileName: String(file.fileName || file.originalName || file.name || ''),
    };
  });
}

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
