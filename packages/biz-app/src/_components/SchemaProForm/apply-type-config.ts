/**
 * 按 fieldType 应用 typeConfigJson（对齐 PC applyTypeConfigToColumn）
 * 不改 vant：映射到 fieldProps / componentProps / rules / 扩展元数据
 */
import { h } from 'vue';
import type { ProFormColumn, ProFormOption } from 'vant';
import type { SchemaFieldItem, SchemaFieldTypeConfig } from './types';
import {
  getSchemaFieldMapping,
  parseTypeConfigJson,
} from './transform-schema-utils';
import {
  createDataSourceLoadOptions,
  getDataSourceFieldDefaults,
  getDataSourceOptions,
  isKnownDataSource,
} from './dataSource';

/** Schema 扩展列元数据（ProForm 忽略未知键，运行时联动用） */
export type SchemaProFormColumn = ProFormColumn & {
  propReadOnly?: string;
  parentColumnName?: string;
  dictCode?: string;
  maxLevel?: number;
  schemaFieldType?: string;
};

export type SchemaOption = ProFormOption & {
  /** 级联：所属上级选项 value */
  parentValue?: string | number;
};

/** Java/后端 dateFormat → DatePicker columnsType */
export function resolveDateColumnsType(
  fieldType: string,
  dateFormat?: string,
): Array<'year' | 'month' | 'day'> | undefined {
  if (fieldType === 'TIME') return undefined;
  const raw = String(dateFormat || '').trim();
  const normalized = raw.replace(/yyyy/gi, 'YYYY').replace(/dd/g, 'DD');
  if (fieldType === 'DATE') {
    if (!raw || normalized === 'YYYY-MM-DD' || normalized === 'YYYY/MM/DD') {
      return ['year', 'month', 'day'];
    }
    if (normalized === 'YYYY-MM' || normalized === 'YYYY/MM') {
      return ['year', 'month'];
    }
    if (normalized === 'YYYY') {
      return ['year'];
    }
    return ['year', 'month', 'day'];
  }
  if (fieldType === 'DATETIME') {
    return ['year', 'month', 'day'];
  }
  return ['year', 'month', 'day'];
}

/** TIME / DATETIME 的时分秒列：格式含 ss 则带秒，否则到分 */
export function resolveTimeColumnsType(
  dateFormat?: string,
): Array<'hour' | 'minute' | 'second'> {
  const raw = String(dateFormat || 'HH:mm');
  if (/ss/i.test(raw)) {
    return ['hour', 'minute', 'second'];
  }
  return ['hour', 'minute'];
}

/**
 * 解析上传大小展示值（对齐 PC resolveUploadSizeFromTypeConfig）
 * 兼容 "8MB"；返回数值 + 单位，供提示文案；再换算字节供 Uploader
 */
export function resolveUploadSizeDisplay(typeConfig: SchemaFieldTypeConfig):
  | {
      maxSize: number;
      sizeUnit: 'MB' | 'KB';
    }
  | undefined {
  const unitRaw = typeConfig.uploadUnit ?? typeConfig.sizeUnit;
  let unit: 'MB' | 'KB' =
    String(unitRaw || 'MB').toUpperCase() === 'KB' ? 'KB' : 'MB';
  const raw =
    typeConfig.imageSizeLimit ?? typeConfig.fileSizeLimit ?? typeConfig.maxSize;
  if (raw == null || raw === '') {
    return undefined;
  }
  let amount: number | undefined;
  if (typeof raw === 'number') {
    amount = raw;
  } else {
    const text = String(raw).trim();
    const match = text.match(/^(\d+(?:\.\d+)?)\s*(MB|KB)?$/i);
    if (match) {
      amount = Number(match[1]);
      const matchedUnit = match[2]?.toUpperCase();
      if (matchedUnit === 'KB' || matchedUnit === 'MB') {
        unit = matchedUnit;
      }
    } else {
      amount = Number(text);
    }
  }
  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }
  return { maxSize: amount, sizeUnit: unit };
}

/** 上传大小 → 字节（供 Uploader / UploaderFile maxSize） */
export function resolveUploadSizeBytes(typeConfig: SchemaFieldTypeConfig) {
  const display = resolveUploadSizeDisplay(typeConfig);
  if (!display) return undefined;
  return display.sizeUnit === 'KB'
    ? display.maxSize * 1024
    : display.maxSize * 1024 * 1024;
}

export function resolveUploadAccept(typeConfig: SchemaFieldTypeConfig) {
  const formats = typeConfig.allowedFormats ?? typeConfig.formats;
  if (!Array.isArray(formats) || !formats.length) return undefined;
  return formats
    .map((item) => {
      const text = String(item || '').trim();
      if (!text) return '';
      return text.startsWith('.') ? text : `.${text}`;
    })
    .filter(Boolean)
    .join(',');
}

export function resolveUploadMaxCount(typeConfig: SchemaFieldTypeConfig) {
  if (typeConfig.uploadCount == null) return undefined;
  const n = Number(typeConfig.uploadCount);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * 上传限制底部说明（对齐 PC UploadField buildUploadTipLines）
 * 有传且大于 0 才生成对应文案
 */
export function buildUploadTipLines(options: {
  mode: 'image' | 'file';
  limit?: number;
  maxSize?: number;
  sizeUnit?: string;
  accept?: string;
}): string[] {
  const isImage = options.mode === 'image';
  const unit = isImage ? '张图片' : '个文件';
  const single = isImage ? '单张图片' : '单个文件';
  const typeLabel = isImage ? '图片' : '文件';
  const sizeLabel = String(options.sizeUnit || 'MB').toUpperCase();
  const extText = String(options.accept || '')
    .split(',')
    .map((item) => item.trim().replace(/^\./, '').toLowerCase())
    .filter(Boolean)
    .join('、');

  const hasLimit = options.limit != null && Number(options.limit) > 0;
  const hasMaxSize = options.maxSize != null && Number(options.maxSize) > 0;
  const lines: string[] = [];

  if (hasLimit && hasMaxSize) {
    lines.push(
      `最多上传${options.limit}${unit}，${single}不能超过${options.maxSize}${sizeLabel}`,
    );
  } else if (hasLimit) {
    lines.push(`最多上传${options.limit}${unit}`);
  } else if (hasMaxSize) {
    lines.push(`${single}不能超过${options.maxSize}${sizeLabel}`);
  }

  if (extText) {
    lines.push(`支持上传${extText}格式的${typeLabel}`);
  }
  return lines;
}

function pushRule(
  fieldProps: Record<string, unknown>,
  rule: Record<string, unknown>,
) {
  const prev = Array.isArray(fieldProps.rules) ? [...fieldProps.rules] : [];
  prev.push(rule);
  fieldProps.rules = prev;
}

/** INTEGER / DOUBLE：min / max / decimalPlaces → rules */
export function applyNumberTypeConfig(
  fieldProps: Record<string, unknown>,
  fieldType: string,
  typeConfig: SchemaFieldTypeConfig,
  label: string,
) {
  const min =
    typeConfig.minimumValue != null && typeConfig.minimumValue !== ''
      ? Number(typeConfig.minimumValue)
      : undefined;
  const max =
    typeConfig.maximumValue != null && typeConfig.maximumValue !== ''
      ? Number(typeConfig.maximumValue)
      : undefined;
  const decimalPlaces =
    typeConfig.decimalPlaces != null && typeConfig.decimalPlaces !== ''
      ? Math.max(0, Number(typeConfig.decimalPlaces))
      : undefined;

  if (min != null && Number.isFinite(min)) {
    fieldProps.min = min;
  }
  if (max != null && Number.isFinite(max)) {
    fieldProps.max = max;
  }
  if (
    fieldType === 'DOUBLE' &&
    decimalPlaces != null &&
    Number.isFinite(decimalPlaces)
  ) {
    fieldProps.decimalPlaces = decimalPlaces;
  }

  if (
    (min != null && Number.isFinite(min)) ||
    (max != null && Number.isFinite(max)) ||
    (decimalPlaces != null && Number.isFinite(decimalPlaces))
  ) {
    pushRule(fieldProps, {
      validator: (value: unknown) => {
        if (value === '' || value == null) return true;
        const num = Number(value);
        if (!Number.isFinite(num)) {
          return `${label}须为数字`;
        }
        if (min != null && Number.isFinite(min) && num < min) {
          return `${label}不能小于${min}`;
        }
        if (max != null && Number.isFinite(max) && num > max) {
          return `${label}不能大于${max}`;
        }
        if (
          fieldType === 'DOUBLE' &&
          decimalPlaces != null &&
          Number.isFinite(decimalPlaces)
        ) {
          const text = String(value);
          const dot = text.indexOf('.');
          if (dot >= 0 && text.length - dot - 1 > decimalPlaces) {
            return `${label}最多${decimalPlaces}位小数`;
          }
        }
        if (fieldType === 'INTEGER' && !Number.isInteger(num)) {
          return `${label}须为整数`;
        }
        return true;
      },
    });
  }
}

function applyUploadTypeConfig(
  column: SchemaProFormColumn,
  typeConfig: SchemaFieldTypeConfig,
  fieldType: string,
) {
  const maxCount = resolveUploadMaxCount(typeConfig);
  const sizeDisplay = resolveUploadSizeDisplay(typeConfig);
  const maxSizeBytes = resolveUploadSizeBytes(typeConfig);
  const accept = resolveUploadAccept(typeConfig);
  column.componentProps = {
    ...column.componentProps,
    ...(maxCount != null ? { maxCount } : {}),
    ...(maxSizeBytes != null ? { maxSize: maxSizeBytes } : {}),
    ...(accept ? { accept } : {}),
  };
  column.defaultValue = [];

  // 与 PC UploadField 一致：label 下展示限制说明
  column.fieldProps = {
    ...column.fieldProps,
    labelAlign: 'top',
  };
  const tipLines = buildUploadTipLines({
    mode: fieldType === 'IMAGE' ? 'image' : 'file',
    limit: maxCount,
    maxSize: sizeDisplay?.maxSize,
    sizeUnit: sizeDisplay?.sizeUnit,
    accept,
  });
  if (tipLines.length) {
    column.fieldSlots = {
      ...column.fieldSlots,
      'label-comment': () =>
        h(
          'div',
          { class: 'schema-pro-form-upload-tips' },
          tipLines.map((tip) =>
            h('div', { class: 'schema-pro-form-upload-tip' }, `*${tip}`),
          ),
        ),
    };
  }
}

function applyDateTypeConfig(
  column: SchemaProFormColumn,
  fieldType: string,
  typeConfig: SchemaFieldTypeConfig,
) {
  if (fieldType === 'TIME') {
    // 自定义控件只做 input 插槽内容；外层 Field 与 datePicker 一致用 is-link
    // 不设 fieldProps.readonly，避免 bindProps 把其当成表单只读导致无法打开
    column.component = 'schemaTimePicker' as SchemaProFormColumn['component'];
    column.fieldProps = {
      ...column.fieldProps,
      isLink: true,
    };
    column.componentProps = {
      ...column.componentProps,
      columnsType: resolveTimeColumnsType(typeConfig.dateFormat),
    };
    return;
  }
  if (fieldType === 'DATETIME') {
    // PickerGroup：日期 + 时间一次选完
    column.component =
      'schemaDateTimePicker' as SchemaProFormColumn['component'];
    column.fieldProps = {
      ...column.fieldProps,
      isLink: true,
    };
    column.componentProps = {
      ...column.componentProps,
      dateColumnsType: resolveDateColumnsType('DATE', typeConfig.dateFormat),
      timeColumnsType: resolveTimeColumnsType(typeConfig.dateFormat),
    };
    return;
  }
  if (fieldType === 'DATE') {
    column.component = 'datePicker';
    const columnsType = resolveDateColumnsType(
      fieldType,
      typeConfig.dateFormat,
    );
    column.componentProps = {
      ...column.componentProps,
      ...(columnsType ? { columnsType } : {}),
    };
  }
}

function applyOptionTypeConfig(
  column: SchemaProFormColumn,
  field: SchemaFieldItem,
  typeConfig: SchemaFieldTypeConfig,
  options: {
    dictOptions?: Record<string, SchemaOption[]>;
    model?: Record<string, unknown>;
  },
) {
  const dictCode = typeConfig.dictCode ?? typeConfig.dictId;
  if (dictCode != null && String(dictCode).trim() !== '') {
    column.dictCode = String(dictCode);
    if (!column.options?.length && options.dictOptions?.[column.dictCode]) {
      column.options = options.dictOptions[column.dictCode];
    }
  }
  if (typeConfig.level != null && String(typeConfig.level) !== '') {
    column.maxLevel = Number(typeConfig.level);
    column.componentProps = {
      ...column.componentProps,
      maxLevel: Number(typeConfig.level),
    };
  }
  const parentKey =
    typeConfig.parentColumnName ??
    typeConfig.parentFieldCode ??
    typeConfig.parentFieldId;
  if (parentKey != null && String(parentKey).trim() !== '') {
    column.parentColumnName = String(parentKey);
  }

  // 按上级字段过滤带 parentValue 的 options
  if (column.parentColumnName && Array.isArray(column.options)) {
    const parentRaw = options.model?.[column.parentColumnName];
    const parentValue =
      parentRaw != null &&
      typeof parentRaw === 'object' &&
      !Array.isArray(parentRaw) &&
      'value' in (parentRaw as object)
        ? (parentRaw as { value: unknown }).value
        : parentRaw;
    const parentText =
      parentValue == null || parentValue === '' ? '' : String(parentValue);
    column.options = (column.options as SchemaOption[]).filter((item) => {
      if (item.parentValue == null || item.parentValue === '') {
        return !parentText;
      }
      if (!parentText) return false;
      return String(item.parentValue) === parentText;
    });
  }

  // dataSource + isList：弹层打开时 loadOptions 拉接口（对齐 PC dataSource）
  const dataSource = String(field?.dataSource || '').trim();
  if (dataSource && isKnownDataSource(dataSource)) {
    const defaults = getDataSourceFieldDefaults(dataSource);
    const isCheckbox =
      column.component === 'checkboxPicker' || defaults.multiple === true;
    column.component = isCheckbox ? 'checkboxPicker' : 'radioPicker';
    if (
      isCheckbox &&
      (column.defaultValue == null || column.defaultValue === '')
    ) {
      column.defaultValue = [];
    }
    column.componentProps = {
      ...defaults,
      ...column.componentProps,
      isList: true,
      loadOptions: createDataSourceLoadOptions(dataSource),
    };
    delete column.componentProps.multiple;
    // 回显：缓存命中带 options；否则用 fieldMapping 文案兜底
    const cached = getDataSourceOptions(dataSource);
    if (cached.length) {
      column.options = cached;
      column.componentProps.options = cached;
    } else if (
      column.propReadOnly &&
      options.model &&
      options.model[column.name || ''] != null &&
      options.model[column.name || ''] !== ''
    ) {
      const value = options.model[column.name || ''];
      const labelText = options.model[column.propReadOnly];
      if (labelText != null && labelText !== '') {
        column.options = [
          { label: String(labelText), value: value as string | number },
        ];
        column.componentProps.options = column.options;
      }
    }
  }
}

/**
 * 将 typeConfigJson 应用到已构建的基础 column
 */
export function applyTypeConfigToColumn(
  column: SchemaProFormColumn,
  field: SchemaFieldItem,
  extras: {
    dictOptions?: Record<string, SchemaOption[]>;
    model?: Record<string, unknown>;
  } = {},
): SchemaProFormColumn {
  const typeConfig = parseTypeConfigJson(field);
  const {fieldType} = field;
  column.schemaFieldType = fieldType;

  const fieldMapping = getSchemaFieldMapping(field);
  if (fieldMapping) {
    column.propReadOnly = fieldMapping;
  }

  if (fieldType === 'TEXT' || fieldType === 'LONG_TEXT') {
    if (typeConfig.valueLength != null) {
      column.fieldProps = {
        ...column.fieldProps,
        maxlength: Number(typeConfig.valueLength),
        showWordLimit: true,
      };
    }
  }

  if (fieldType === 'OPTION') {
    applyOptionTypeConfig(column, field, typeConfig, extras);
  }

  if (fieldType === 'INTEGER' || fieldType === 'DOUBLE') {
    const fieldProps = { ...(column.fieldProps || {}) } as Record<
      string,
      unknown
    >;
    applyNumberTypeConfig(
      fieldProps,
      fieldType,
      typeConfig,
      field.fieldName || field.columnName,
    );
    column.fieldProps = fieldProps;
  }

  if (
    fieldType === 'DATE' ||
    fieldType === 'TIME' ||
    fieldType === 'DATETIME'
  ) {
    applyDateTypeConfig(column, fieldType, typeConfig);
  }

  if (fieldType === 'IMAGE' || fieldType === 'FILE') {
    applyUploadTypeConfig(column, typeConfig, fieldType);
  }

  return column;
}
