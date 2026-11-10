/**
 * 入职登记表详情元数据 → SchemaProForm schema
 * 对齐 PC templateFormContentToFieldSets / alignRegisterFormDataKeys
 * 兼容模板树（id/groups/children）与详情 formFiledMetaDataList（setCode/groupList/fieldList）
 */
import { parseTypeConfigJson } from '@/_components/SchemaProForm/transform-schema-utils';
import type {
  SchemaFieldItem,
  SchemaFieldSet,
} from '@/_components/SchemaProForm/types';

/** 模板字段类型 → schema fieldType（兼容历史中文值） */
const TEMPLATE_FIELD_TYPE_MAP: Record<string, string> = {
  文本: 'TEXT',
  选项: 'OPTION',
  日期: 'DATE',
  图片: 'IMAGE',
  附件: 'FILE',
  文件: 'FILE',
  电话: 'TEXT',
  数值: 'DOUBLE',
  多行文本: 'LONG_TEXT',
};

/** 待入职 resolve-schema-field 使用的 columnName */
const WAIT_ENTRY_COLUMNS = new Set([
  'name',
  'orgId',
  'positionId',
  'positionCategoryId',
  'staffType',
  'contractType',
  'idCardType',
  'idCardNo',
  'phone',
  'personalEmail',
  'enrollDate',
  'birthday',
  'gender',
]);

/** 模板字段中文名 → 待入职 columnName */
const WAIT_ENTRY_COLUMN_BY_NAME: Record<string, string> = {
  姓名: 'name',
  证件类型: 'idCardType',
  证件号: 'idCardNo',
  证件号码: 'idCardNo',
  手机号码: 'phone',
  手机号: 'phone',
  部门: 'orgId',
  组织: 'orgId',
  职位: 'positionId',
  职务分类: 'positionCategoryId',
  员工类型: 'staffType',
  合同类型: 'contractType',
  个人邮箱: 'personalEmail',
  入职日期: 'enrollDate',
  出生日期: 'birthday',
  生日: 'birthday',
  性别: 'gender',
};

/** 待入职字段 typeConfigJson（仅补字典） */
const WAIT_ENTRY_TYPE_CONFIG: Record<string, Record<string, unknown>> = {
  idCardType: {
    dictId: 'GROUP.Enum.IdCardType',
    level: 1,
  },
  contractType: {
    dictId: 'GROUP.Enum.ContractType',
    level: 1,
  },
  staffType: {
    dictId: 'GROUP.Enum.StaffType',
    level: 1,
  },
  gender: {
    dictId: 'GROUP.Enum.SexType',
    level: 1,
  },
};

/** 其它选项字段：无 columnName 覆盖时仍按字段名补字典 */
const OPTION_DICT_BY_NAME: Record<string, Record<string, unknown>> = {
  证件类型: WAIT_ENTRY_TYPE_CONFIG.idCardType,
  员工类型: WAIT_ENTRY_TYPE_CONFIG.staffType,
  合同类型: WAIT_ENTRY_TYPE_CONFIG.contractType,
  最高学历: { dictId: 'GROUP.Enum.DiplomaType' },
  学历: { dictId: 'GROUP.Enum.DiplomaType' },
  性别: WAIT_ENTRY_TYPE_CONFIG.gender,
};

type RegisterFormField = SchemaFieldItem & {
  fieldCode?: string;
  dictCode?: string;
};

function asRecordList(value: unknown) {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function getSectionCode(section: Record<string, unknown> = {}) {
  return String(section.id || section.setCode || '');
}

function getSectionName(section: Record<string, unknown> = {}) {
  return String(section.name || section.setName || '');
}

function getGroupList(section: Record<string, unknown> = {}) {
  const groups = asRecordList(section.groups);
  return groups.length ? groups : asRecordList(section.groupList);
}

function getFieldList(group: Record<string, unknown> = {}) {
  const children = asRecordList(group.children);
  return children.length ? children : asRecordList(group.fieldList);
}

/** 非单条信息集（与模板分段 id 对齐） */
const MULTI_ROW_SET_CODES = new Set([
  'education',
  'work',
  'family',
  'certificate',
]);

function resolveColumnName(
  field: Record<string, unknown>,
  fieldCode: string,
  fieldName: string,
) {
  const backend = String(field.columnName || '').trim();
  if (backend) return backend;
  if (WAIT_ENTRY_COLUMNS.has(fieldCode)) return fieldCode;
  return WAIT_ENTRY_COLUMN_BY_NAME[fieldName] || fieldCode;
}

function resolveSchemaRequired(field: Record<string, unknown>) {
  if (
    field.required !== undefined &&
    field.required !== null &&
    `${field.required}` !== ''
  ) {
    return field.required === true || Number(field.required) === 1;
  }
  const approverRequired = field.approverRequired ?? field.approveRequired;
  return approverRequired === true || Number(approverRequired) === 1;
}

function resolveTypeConfigJson(
  field: Record<string, unknown>,
  columnName: string,
  fieldName: string,
) {
  const parsed = parseTypeConfigJson(field as SchemaFieldItem) || {};
  const dictCode = field.dictCode || field.dictId;
  const fromDict = dictCode ? { dictCode } : {};
  return {
    ...(OPTION_DICT_BY_NAME[fieldName] || {}),
    ...(WAIT_ENTRY_TYPE_CONFIG[columnName] || {}),
    ...fromDict,
    ...parsed,
  };
}

function adaptTemplateField(
  field: Record<string, unknown>,
  section: Record<string, unknown>,
  group: Record<string, unknown>,
): RegisterFormField | null {
  const fieldCode = String(
    field.fieldCode || field.infoFieldId || field.id || '',
  );
  if (!fieldCode) return null;

  const rawType = String(field.fieldType || '');
  const fieldType = TEMPLATE_FIELD_TYPE_MAP[rawType] || rawType || 'TEXT';
  const setCode = getSectionCode(section);
  const setName = getSectionName(section);
  const groupCode = String(group.id || group.groupCode || '');
  const groupName = String(group.name || group.groupName || '');
  const fieldName = String(field.name || field.fieldName || fieldCode);
  const columnName = resolveColumnName(field, fieldCode, fieldName);
  const typeConfigJson = resolveTypeConfigJson(field, columnName, fieldName);
  const dictCode = String(
    typeConfigJson.dictCode ||
      typeConfigJson.dictId ||
      field.dictCode ||
      field.dictId ||
      '',
  );

  return {
    id: null,
    infoFieldId: String(field.infoFieldId || fieldCode),
    setCode,
    setName,
    groupCode,
    groupName,
    fieldCode,
    columnName,
    fieldName,
    fieldType,
    typeConfigJson,
    dictCode,
    options: field.options as RegisterFormField['options'],
    isEntryConfig: true,
    required: resolveSchemaRequired(field),
    entryDisplay: true,
    entryImportDisplay: true,
    entryImportRequired: Number(field.employeeRequired) === 1,
    approveDisplay: Number(field.approverVisible) === 1,
    approveRequired: Number(field.approverRequired) === 1,
    systemFlag: field.systemFlag == null ? undefined : Number(field.systemFlag),
    dataSource: field.dataSource == null ? undefined : String(field.dataSource),
  };
}

/**
 * 详情 formFiledMetaDataList / 模板树 → SchemaProForm fieldSets
 */
export function templateFormContentToFieldSets(
  formContent: unknown[] = [],
): SchemaFieldSet[] {
  return (formContent || [])
    .map((section) => {
      const sectionRecord = (section || {}) as Record<string, unknown>;
      const setCode = getSectionCode(sectionRecord);
      if (!setCode) return null;

      const groupList = getGroupList(sectionRecord)
        .map((group) => {
          const fieldList = getFieldList(group)
            .map((item) => adaptTemplateField(item, sectionRecord, group))
            .filter((item): item is RegisterFormField => Boolean(item));
          if (!fieldList.length) return null;
          return {
            groupCode: String(group.id || group.groupCode || ''),
            groupName: String(group.name || group.groupName || ''),
            fieldList,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

      if (!groupList.length) return null;

      const singleDataFlag =
        sectionRecord.singleDataFlag == null
          ? MULTI_ROW_SET_CODES.has(setCode)
            ? 0
            : 1
          : Number(sectionRecord.singleDataFlag);

      return {
        setCode,
        setName: getSectionName(sectionRecord) || setCode,
        singleDataFlag,
        groupList,
      } as SchemaFieldSet;
    })
    .filter((item): item is SchemaFieldSet => Boolean(item));
}

/** 把 formData 里的模板 fieldCode 同步到 columnName */
export function alignRegisterFormDataKeys(
  fieldSets: unknown[] = [],
  formData: unknown = {},
) {
  if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
    return {};
  }

  const next = JSON.parse(JSON.stringify(formData)) as Record<string, unknown>;

  (fieldSets || []).forEach((setItem) => {
    const setRecord = setItem as Record<string, unknown>;
    const setCode = String(setRecord.setCode || '');
    const setData = setCode ? next[setCode] : null;
    if (setData == null) return;

    const remapFields = (row: unknown) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) return;
      const record = row as Record<string, unknown>;
      asRecordList(setRecord.groupList).forEach((group) => {
        asRecordList(group.fieldList).forEach((field) => {
          const columnName = String(field.columnName || '');
          const fieldCode = String(field.fieldCode || '');
          if (!columnName || !fieldCode || columnName === fieldCode) return;
          if (record[columnName] == null || record[columnName] === '') {
            record[columnName] = record[fieldCode];
          }
        });
      });
    };

    const remapRow = (row: unknown) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) return;
      const record = row as Record<string, unknown>;
      let hasNestedGroup = false;
      asRecordList(setRecord.groupList).forEach((group) => {
        const groupCode = String(group.groupCode || '');
        const groupData = groupCode ? record[groupCode] : null;
        if (
          groupData &&
          typeof groupData === 'object' &&
          !Array.isArray(groupData)
        ) {
          hasNestedGroup = true;
          remapFields(groupData);
        }
      });
      if (!hasNestedGroup) remapFields(record);
    };

    if (Array.isArray(setData)) {
      setData.forEach((item) => remapRow(item));
      return;
    }

    if (typeof setData !== 'object') return;

    const payload = setData as Record<string, unknown>;
    remapRow(payload.singleData);
    asRecordList(payload.rowList).forEach((item) => remapRow(item));
  });

  return next;
}
