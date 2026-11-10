/**
 * 后端信息集 schema（add-entry/field/search）→ vant ProForm columns
 * 对齐 PC digital-workforce ProForm/transform-schema，控件映射到移动端内置 component
 */
import type {
  ProFormBuiltinComponent,
  ProFormColumn,
  ProFormOption,
} from 'vant';
import {
  applyTypeConfigToColumn,
  type SchemaOption,
  type SchemaProFormColumn,
} from './apply-type-config';
import type {
  SchemaFieldGroup,
  SchemaFieldItem,
  SchemaFieldSet,
} from './types';
import {
  getSchemaFieldKey,
  getSchemaFieldMapping,
  parseTypeConfigJson,
  unwrapLabelValue,
} from './transform-schema-utils';

export {
  getSchemaFieldKey,
  getSchemaFieldMapping,
  parseTypeConfigJson,
  isLabelValue,
  unwrapLabelValue,
  toLabelValue,
} from './transform-schema-utils';

export {
  applyTypeConfigToColumn,
  resolveDateColumnsType,
  resolveTimeColumnsType,
  resolveUploadSizeBytes,
  resolveUploadSizeDisplay,
  resolveUploadAccept,
  resolveUploadMaxCount,
  buildUploadTipLines,
} from './apply-type-config';

export type { SchemaOption, SchemaProFormColumn } from './apply-type-config';

/** 后端 fieldType → vant ProForm component */
export const DEFAULT_SCHEMA_FIELD_TYPE_MAP: Record<
  string,
  ProFormBuiltinComponent | (string & Record<never, never>)
> = {
  BOOLEAN: 'radioGroup',
  INTEGER: 'field',
  DOUBLE: 'field',
  DATE: 'datePicker',
  TIME: 'schemaTimePicker',
  DATETIME: 'schemaDateTimePicker',
  OPTION: 'radioPicker',
  TEXT: 'field',
  LONG_TEXT: 'field',
  IMAGE: 'uploader',
  FILE: 'uploaderFile',
};

export const BOOLEAN_FIELD_OPTIONS: ProFormOption[] = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

export type ResolveSchemaField = (
  field: SchemaFieldItem,
  column: ProFormColumn,
) => Partial<ProFormColumn> | void;

export type TransformSchemaOptions = {
  fieldOptions?: Record<string, ProFormOption[]>;
  /** dictCode / dictId → options（OPTION 无 field.options 时回退） */
  dictOptions?: Record<string, SchemaOption[]>;
  /** 当前表单 model（用于 parentField 过滤 options） */
  model?: Record<string, unknown>;
  fieldTypeMap?: Record<string, ProFormBuiltinComponent | string>;
  resolveSchemaField?: ResolveSchemaField;
  /** 是否展示 groupName（默认 true → 静态折叠） */
  showGroupName?: boolean;
};

export function flattenSchemaFields(schema: SchemaFieldSet[] = []) {
  const list: SchemaFieldItem[] = [];
  (schema || []).forEach((setItem) => {
    (setItem?.groupList || []).forEach((group) => {
      (group?.fieldList || []).forEach((field) => {
        if (field?.isEntryConfig === false) return;
        if (!getSchemaFieldKey(field)) return;
        list.push(field);
      });
    });
  });
  return list;
}

/**
 * 从 schema 收集 OPTION 字段的 dictCode / dictId（去重）
 * 供 SchemaProForm 批量拉一层字典
 */
export function collectSchemaDictCodes(schema: SchemaFieldSet[] = []) {
  const codes: string[] = [];
  const seen = new Set<string>();
  flattenSchemaFields(schema).forEach((field) => {
    if (field?.fieldType !== 'OPTION') return;
    const typeConfig = parseTypeConfigJson(field);
    const raw = typeConfig.dictCode ?? typeConfig.dictId;
    const code = raw != null ? String(raw).trim() : '';
    if (!code || seen.has(code)) return;
    seen.add(code);
    codes.push(code);
  });
  return codes;
}

function isMultiRowSet(setItem?: SchemaFieldSet | null) {
  return Number(setItem?.singleDataFlag) === 0;
}

function isFlatMultiRowSet(setItem?: SchemaFieldSet | null) {
  return isMultiRowSet(setItem) && setItem?.layout === 'flat';
}

function normalizeBooleanDefault(raw: unknown) {
  if (raw == null || raw === '') return '';
  if (raw === true || raw === 1 || raw === '1' || raw === 'yes') return 1;
  if (raw === false || raw === 0 || raw === '0' || raw === 'no') return 0;
  return raw;
}

function getFieldDefaultValue(field: SchemaFieldItem) {
  const config = parseTypeConfigJson(field);
  if (field?.fieldType === 'BOOLEAN') {
    return normalizeBooleanDefault(
      config.booleanDefault ?? config.defaultValue ?? field?.defaultValue,
    );
  }
  if (field?.fieldType === 'INTEGER' || field?.fieldType === 'DOUBLE') {
    const raw = config.defaultValue ?? field?.defaultValue;
    if (raw === '' || raw == null) return undefined;
    const num = Number(raw);
    return Number.isFinite(num) ? num : undefined;
  }
  if (config.defaultValue != null) return config.defaultValue;
  if (field?.defaultValue != null) return field.defaultValue;
  if (field?.fieldType === 'IMAGE' || field?.fieldType === 'FILE') return [];
  return '';
}

function createMultiRowDefaultItem(
  setItem: SchemaFieldSet,
  defaults: Record<string, unknown> = {},
) {
  const defaultItem: Record<string, unknown> = {};
  (setItem?.groupList || []).forEach((group) => {
    (group?.fieldList || []).forEach((field) => {
      const fieldKey = getSchemaFieldKey(field);
      if (field?.isEntryConfig === false || !fieldKey) return;
      defaultItem[fieldKey] = getFieldDefaultValue(field);
      const mapping = getSchemaFieldMapping(field);
      if (mapping && Object.prototype.hasOwnProperty.call(defaults, mapping)) {
        defaultItem[mapping] = defaults[mapping];
      }
    });
  });
  return defaultItem;
}

/**
 * 按 schema 生成空表单 model（默认值取 typeConfigJson / field.defaultValue）
 */
export function createModelFromSchema(
  schema: SchemaFieldSet[] = [],
  defaults: Record<string, unknown> = {},
) {
  const model: Record<string, unknown> = {};
  (schema || []).forEach((setItem) => {
    if (isFlatMultiRowSet(setItem)) {
      (setItem.groupList || []).forEach((group) => {
        const key = group?.groupCode;
        if (!key) return;
        if (Object.prototype.hasOwnProperty.call(defaults, key)) {
          model[key] = defaults[key];
          return;
        }
        const defaultItem: Record<string, unknown> = {};
        (group.fieldList || []).forEach((field) => {
          const fieldKey = getSchemaFieldKey(field);
          if (field?.isEntryConfig === false || !fieldKey) return;
          defaultItem[fieldKey] = getFieldDefaultValue(field);
          const mapping = getSchemaFieldMapping(field);
          if (
            mapping &&
            Object.prototype.hasOwnProperty.call(defaults, mapping)
          ) {
            defaultItem[mapping] = defaults[mapping];
          }
        });
        model[key] = [defaultItem];
      });
      return;
    }

    if (isMultiRowSet(setItem)) {
      const key = setItem?.setCode;
      if (!key) return;
      if (Object.prototype.hasOwnProperty.call(defaults, key)) {
        model[key] = defaults[key];
        return;
      }
      model[key] = [createMultiRowDefaultItem(setItem, defaults)];
      return;
    }

    (setItem?.groupList || []).forEach((group) => {
      (group?.fieldList || []).forEach((field) => {
        const fieldKey = getSchemaFieldKey(field);
        if (field?.isEntryConfig === false || !fieldKey) return;
        if (Object.prototype.hasOwnProperty.call(defaults, fieldKey)) {
          model[fieldKey] = defaults[fieldKey];
        } else {
          model[fieldKey] = getFieldDefaultValue(field);
        }
        const mapping = getSchemaFieldMapping(field);
        if (
          mapping &&
          Object.prototype.hasOwnProperty.call(defaults, mapping)
        ) {
          model[mapping] = defaults[mapping];
        }
      });
    });
  });
  return model;
}

/**
 * 按 systemFlag 收集系统字段 key
 * systemFlag=1：系统固定；systemFlag=0：自定义进 customFields
 * 字段上完全没有 systemFlag 时不拆分
 */
function collectSystemFieldKeys(groups: SchemaFieldGroup[] = []) {
  const systemKeys = new Set<string>();
  let hasSystemFlagMeta = false;
  (groups || []).forEach((group) => {
    (group?.fieldList || []).forEach((field) => {
      if (field?.systemFlag != null) hasSystemFlagMeta = true;
      if (Number(field?.systemFlag) === 0) return;
      const fieldKey = getSchemaFieldKey(field);
      if (fieldKey) systemKeys.add(fieldKey);
      const mapping = getSchemaFieldMapping(field);
      if (mapping) systemKeys.add(mapping);
    });
  });
  return { systemKeys, hasSystemFlagMeta };
}

/**
 * 拆系统字段 + customFields（对齐花名册 / PC）
 * 无 systemFlag 元数据时不拆，整行原样返回
 */
export function splitCustomFieldsOnRow(
  row: Record<string, unknown> = {},
  groups: SchemaFieldGroup[] = [],
) {
  const { systemKeys, hasSystemFlagMeta } = collectSystemFieldKeys(groups);
  if (!hasSystemFlagMeta || !row || typeof row !== 'object') {
    return row && typeof row === 'object' ? { ...row } : {};
  }
  const fixed: Record<string, unknown> = {};
  const customFields: Record<string, unknown> = {};
  Object.keys(row).forEach((key) => {
    if (key === 'customFields') return;
    if (systemKeys.has(key)) {
      fixed[key] = unwrapLabelValue(row[key]);
      return;
    }
    customFields[key] = unwrapLabelValue(row[key]);
  });
  if (Object.keys(customFields).length) {
    fixed.customFields = customFields;
  }
  return fixed;
}

function flattenCustomFieldsOnRow(row: Record<string, unknown> = {}) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return {};
  const result = { ...row };
  const custom = result.customFields;
  delete result.customFields;
  if (custom && typeof custom === 'object' && !Array.isArray(custom)) {
    Object.assign(result, custom as Record<string, unknown>);
  }
  return result;
}

function pickGroupDataFromRow(
  group: SchemaFieldGroup,
  row: Record<string, unknown> = {},
) {
  const next: Record<string, unknown> = {};
  if (!row || typeof row !== 'object') return next;
  (group?.fieldList || []).forEach((field) => {
    const fieldKey = getSchemaFieldKey(field);
    if (!fieldKey) return;
    if (Object.prototype.hasOwnProperty.call(row, fieldKey)) {
      next[fieldKey] = unwrapLabelValue(row[fieldKey]);
    }
    const mapping = getSchemaFieldMapping(field);
    if (mapping && Object.prototype.hasOwnProperty.call(row, mapping)) {
      next[mapping] = row[mapping];
    }
  });
  return next;
}

function pickFlatRowFromGroups(
  groups: SchemaFieldGroup[] = [],
  row: Record<string, unknown> = {},
) {
  const next: Record<string, unknown> = {};
  (groups || []).forEach((group) => {
    Object.assign(next, pickGroupDataFromRow(group, row));
  });
  return splitCustomFieldsOnRow(next, groups);
}

/**
 * 按 schema + model 组装提交参数
 * 格式：{ [setCode]: [ { fieldKey: value, customFields? } ] }
 */
export function buildSubmitPayload(
  schema: SchemaFieldSet[] = [],
  model: Record<string, unknown> = {},
) {
  const payload: Record<string, Array<Record<string, unknown>>> = {};
  (schema || []).forEach((setItem) => {
    const setCode = setItem?.setCode;
    if (!setCode) return;
    const groups = setItem.groupList || [];

    if (isFlatMultiRowSet(setItem)) {
      const groupRows = groups
        .filter((group) => group?.groupCode)
        .map((group) => ({
          rows: Array.isArray(model[group.groupCode])
            ? (model[group.groupCode] as Record<string, unknown>[])
            : [],
          group,
        }));
      const maxLen = Math.max(0, ...groupRows.map((item) => item.rows.length));
      const list: Array<Record<string, unknown>> = [];
      for (let index = 0; index < maxLen; index += 1) {
        const item: Record<string, unknown> = {};
        groupRows.forEach(({ rows, group }) => {
          Object.assign(item, pickGroupDataFromRow(group, rows[index] || {}));
        });
        list.push(splitCustomFieldsOnRow(item, groups));
      }
      payload[setCode] = list;
      return;
    }

    if (isMultiRowSet(setItem)) {
      const rows = Array.isArray(model[setCode])
        ? (model[setCode] as Record<string, unknown>[])
        : [];
      payload[setCode] = rows.map((row) => pickFlatRowFromGroups(groups, row));
      return;
    }

    payload[setCode] = [pickFlatRowFromGroups(groups, model)];
  });
  return payload;
}

/**
 * formData → createModelFromSchema 可用的 defaults
 * 与 buildSubmitPayload 互逆
 */
export function flattenSubmitPayload(
  schema: SchemaFieldSet[] = [],
  payload: Record<string, unknown> = {},
) {
  const defaults: Record<string, unknown> = {};
  (schema || []).forEach((setItem) => {
    const setCode = setItem?.setCode;
    if (!setCode) return;
    const setData = payload?.[setCode];
    if (setData == null) return;
    const list = Array.isArray(setData) ? setData : [];

    if (isFlatMultiRowSet(setItem)) {
      (setItem.groupList || []).forEach((group) => {
        if (!group?.groupCode) return;
        defaults[group.groupCode] = list.map((item) =>
          pickGroupDataFromRow(
            group,
            flattenCustomFieldsOnRow(
              (item && typeof item === 'object' ? item : {}) as Record<
                string,
                unknown
              >,
            ),
          ),
        );
      });
      return;
    }

    if (isMultiRowSet(setItem)) {
      defaults[setCode] = list.map((item) => {
        const flat = flattenCustomFieldsOnRow(
          (item && typeof item === 'object' ? item : {}) as Record<
            string,
            unknown
          >,
        );
        const next: Record<string, unknown> = {};
        (setItem.groupList || []).forEach((group) => {
          Object.assign(next, pickGroupDataFromRow(group, flat));
        });
        return next;
      });
      return;
    }

    const first = list[0];
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const flat = flattenCustomFieldsOnRow(first as Record<string, unknown>);
      (setItem.groupList || []).forEach((group) => {
        Object.assign(defaults, pickGroupDataFromRow(group, flat));
      });
    }
  });
  return defaults;
}

/**
 * 按 schema + formData 回填 model；extra 补 fieldMapping / 信息卡平铺字段
 */
export function createModelFromSubmitPayload(
  schema: SchemaFieldSet[] = [],
  payload: Record<string, unknown> = {},
  extra: Record<string, unknown> = {},
) {
  const defaults = {
    ...flattenSubmitPayload(schema, payload),
    ...extra,
  };
  return createModelFromSchema(schema, defaults);
}

/**
 * 单条信息集：不展示 setName，把 groupList 的 groupName 提升为 setName 做区块标题
 * 多行信息集：整集一个区块（对齐 PC AddDialog）
 */
export function mapGroupNameAsSetName(schema: SchemaFieldSet[] = []) {
  return (schema || []).flatMap((setItem) => {
    const groups = setItem?.groupList || [];
    if (!groups.length) return [];
    if (Number(setItem?.singleDataFlag) === 0) {
      return [setItem];
    }
    return groups.map((group) => ({
      ...setItem,
      setName: group.groupName || '',
      setCode: group.groupCode || setItem.setCode || '',
      groupList: [{ ...group, groupName: '' }],
    }));
  });
}

/** 单个后端字段 → vant ProFormColumn */
export function buildSchemaFieldColumn(
  field: SchemaFieldItem,
  options: TransformSchemaOptions = {},
): SchemaProFormColumn {
  const {
    fieldOptions = {},
    dictOptions = {},
    model,
    fieldTypeMap = DEFAULT_SCHEMA_FIELD_TYPE_MAP,
    resolveSchemaField,
  } = options;

  const typeConfig = parseTypeConfigJson(field);
  const {fieldType} = field;
  const name = getSchemaFieldKey(field);
  const label = field.fieldName || name;
  const required = Boolean(field.required);
  let component = (fieldTypeMap[fieldType] ||
    'field') as ProFormColumn['component'];

  if (fieldType === 'DISPLAY' || field.displayOnly) {
    component = 'field';
  }

  const isBooleanField = fieldType === 'BOOLEAN';
  const dictCode = typeConfig.dictCode ?? typeConfig.dictId;
  const dictOptionList =
    dictCode != null && String(dictCode).trim() !== ''
      ? dictOptions[String(dictCode)]
      : undefined;
  const optionsList = (field.options ||
    fieldOptions[name] ||
    dictOptionList) as SchemaOption[] | undefined;
  const resolvedOptions =
    optionsList || (isBooleanField ? BOOLEAN_FIELD_OPTIONS : undefined);

  const isInputLike =
    component === 'field' &&
    fieldType !== 'DATE' &&
    fieldType !== 'TIME' &&
    fieldType !== 'DATETIME' &&
    fieldType !== 'OPTION' &&
    fieldType !== 'BOOLEAN';
  const isNumberInput = fieldType === 'INTEGER' || fieldType === 'DOUBLE';
  const placeholder =
    field.placeholder ||
    (isInputLike || isNumberInput ? `请输入${label}` : `请选择${label}`);

  const fieldProps: Record<string, unknown> = {
    placeholder,
  };

  if (required) {
    fieldProps.required = true;
    fieldProps.rules = [
      {
        required: true,
        message:
          isInputLike || isNumberInput ? `请输入${label}` : `请选择${label}`,
      },
    ];
  }

  if (field.disabled) {
    fieldProps.disabled = true;
  }

  if (fieldType === 'LONG_TEXT') {
    fieldProps.type = 'textarea';
    fieldProps.rows = 3;
    fieldProps.autosize = true;
  }

  if (fieldType === 'INTEGER') {
    fieldProps.type = 'digit';
  }

  if (fieldType === 'DOUBLE') {
    fieldProps.type = 'number';
  }

  let column: SchemaProFormColumn = {
    name,
    label,
    component,
    fieldProps,
  };

  const defaultValue = getFieldDefaultValue(field);
  if (defaultValue !== '' && defaultValue !== undefined) {
    column.defaultValue = defaultValue;
  }

  if (resolvedOptions?.length) {
    column.options = resolvedOptions;
  }

  if (component === 'radioGroup') {
    column.fieldProps = {
      ...fieldProps,
      labelAlign: 'top',
    };
    column.componentProps = {
      direction: 'horizontal',
      options: resolvedOptions || BOOLEAN_FIELD_OPTIONS,
    };
  }

  if (component === 'radioPicker' && resolvedOptions?.length) {
    column.options = resolvedOptions;
  }

  // typeConfigJson → props / rules / 元数据（含上传、日期、数值、OPTION）
  column = applyTypeConfigToColumn(column, field, { dictOptions, model });

  if (typeof resolveSchemaField === 'function') {
    const patched = resolveSchemaField(field, column);
    if (patched && typeof patched === 'object') {
      return {
        ...column,
        ...patched,
        fieldProps: {
          ...column.fieldProps,
          ...patched.fieldProps,
        },
        componentProps: {
          ...column.componentProps,
          ...patched.componentProps,
        },
      };
    }
  }

  return column;
}

function buildGroupFieldColumns(
  group: SchemaFieldGroup,
  options: TransformSchemaOptions = {},
) {
  return (group?.fieldList || [])
    .filter(
      (field) => field?.isEntryConfig !== false && getSchemaFieldKey(field),
    )
    .map((field) => buildSchemaFieldColumn(field, options));
}

function buildNormalSetContent(
  setItem: SchemaFieldSet,
  fieldOpts: TransformSchemaOptions,
  showGroupName = true,
): ProFormColumn[] {
  const groups = setItem?.groupList || [];

  if (!showGroupName) {
    return groups.flatMap((group) => buildGroupFieldColumns(group, fieldOpts));
  }

  return groups
    .map((group) => {
      const fields = buildGroupFieldColumns(group, fieldOpts);
      if (!fields.length) return null;
      const title = group.groupName || '';
      if (!title) {
        return { content: fields } as ProFormColumn;
      }
      return {
        title,
        name: group.groupCode || group.groupName || '',
        content: fields,
      } as ProFormColumn;
    })
    .filter(Boolean) as ProFormColumn[];
}

function buildMultiRowCollapseContent(
  setItem: SchemaFieldSet,
  fieldOpts: TransformSchemaOptions,
  showGroupName = true,
): ProFormColumn[] {
  const groups = setItem?.groupList || [];
  const min = setItem.collapseMin ?? 0;
  const max = setItem.collapseMax;
  const namedGroups = groups
    .map((group) => {
      const fields = buildGroupFieldColumns(group, fieldOpts);
      if (!fields.length) return null;
      const title = group.groupName || '';
      if (!showGroupName || !title) {
        return { content: fields } as ProFormColumn;
      }
      return {
        title,
        name: group.groupCode || group.groupName || '',
        content: fields,
      } as ProFormColumn;
    })
    .filter(Boolean) as ProFormColumn[];

  if (!namedGroups.length) return [];

  // 仅一个分组时字段直接铺在记录内（对齐 PC，避免与信息集标题重复）
  const recordContent =
    namedGroups.length === 1 ? namedGroups[0]?.content || [] : namedGroups;

  return [
    {
      title: setItem.setName || '',
      name: setItem.setCode,
      addText: `新增${setItem.setName || ''}`,
      min,
      ...(max != null ? { max } : {}),
      defaultItem: createMultiRowDefaultItem(setItem),
      content: recordContent,
    },
  ];
}

/**
 * 后端信息集 JSON → vant ProForm columns
 */
export function transformSchemaToColumns(
  schema: SchemaFieldSet[] = [],
  options: TransformSchemaOptions = {},
): ProFormColumn[] {
  const {
    fieldOptions = {},
    dictOptions = {},
    model,
    fieldTypeMap = DEFAULT_SCHEMA_FIELD_TYPE_MAP,
    resolveSchemaField,
    showGroupName = true,
  } = options;

  const fieldOpts: TransformSchemaOptions = {
    fieldOptions,
    dictOptions,
    model,
    fieldTypeMap,
    resolveSchemaField,
  };

  return (schema || [])
    .map((setItem) => {
      let content: ProFormColumn[] = [];

      if (isFlatMultiRowSet(setItem)) {
        content = (setItem.groupList || [])
          .map((group) => {
            const fields = buildGroupFieldColumns(group, fieldOpts);
            if (!fields.length) return null;
            const min = group.min ?? setItem.collapseMin ?? 0;
            const max = group.max ?? setItem.collapseMax;
            return {
              title: group.groupName || setItem.setName || '',
              name: group.groupCode,
              addText: `新增${setItem.setName || ''}`,
              min,
              ...(max != null ? { max } : {}),
              content: fields,
            } as ProFormColumn;
          })
          .filter(Boolean) as ProFormColumn[];
      } else if (isMultiRowSet(setItem)) {
        content = buildMultiRowCollapseContent(
          setItem,
          fieldOpts,
          showGroupName,
        );
      } else {
        const inner = buildNormalSetContent(setItem, fieldOpts, showGroupName);
        if (setItem.setName) {
          content = [
            {
              title: setItem.setName,
              content: [{ content: inner }],
            },
          ];
        } else {
          content = inner;
        }
      }

      return content;
    })
    .flat()
    .filter((item) => {
      if (!item) return false;
      if (item.content) return item.content.length > 0;
      return Boolean(item.name || item.component || item.render);
    });
}
