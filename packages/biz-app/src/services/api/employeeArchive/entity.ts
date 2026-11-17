import type {
  ArchivePermission,
  ArchiveRecord,
  ArchiveSchema,
  ArchiveWorkflow,
  ArchiveSubmission,
  ArchiveEditRequest,
  ArchiveEditRow,
} from '@/types/employeeArchive';
import { cloneDeep } from 'lodash-es';
import { unwrapLabelValue } from '@/_components/SchemaProForm/transform-schema';
import { API_PREFIX } from '@/services/api/employee/config';
import { ARCHIVE_EDIT_APIS, ARCHIVE_FIELD_DATA_SOURCES } from './config';
import {
  getRosterDetailTabKind,
  isRosterDetailCustomTab,
} from '@/services/api/employee/roster/tab';

/** 与 PC 配置适配保持一致，不把缺失审批方式当成 false。 */
function readPermissionFlag(value: unknown) {
  if (value === true || value === 1 || value === '1' || value === 'true')
    return true;
  if (value === false || value === 0 || value === '0' || value === 'false')
    return false;
  return undefined;
}

/** 花名册元数据原样保留，额外补齐动态表单所需的 columnName。 */
export function adaptArchiveSchema(
  body: unknown,
  setCode: string,
): ArchiveSchema {
  const list = Array.isArray(body) ? body : [];
  const source = list.find((item) => item?.setCode === setCode);
  const groups = Array.isArray(source?.children) ? source.children : [];
  return {
    setCode,
    setName: String(source?.setName || ''),
    singleDataFlag: source?.singleDataFlag,
    groupList: groups
      .map((group: Record<string, unknown>) => ({
        groupCode: String(group.groupCode || ''),
        groupName: String(group.groupName || ''),
        fieldList: (Array.isArray(group.children)
          ? group.children
          : []
        ).flatMap((field) => {
          if (!field?.fieldCode) return [];
          const config = field.typeConfigJson;
          // 展示映射位于字段顶层时仍交给通用表单处理，不以映射键保存原值。
          const typeConfig =
            typeof config === 'string' ? JSON.parse(config) : config || {};
          // PC 详情字段把字典、数值和上传限制放在顶层；收拢为 SchemaProForm 配置。
          // 已有 typeConfigJson 优先，避免替换其他页面原本使用的配置结构。
          const topConfig = Object.fromEntries(
            [
              'dictCode',
              'dictId',
              'level',
              'parentColumnName',
              'defaultValue',
              'minimumValue',
              'maximumValue',
              'decimalPlaces',
              'dateFormat',
              'uploadCount',
              'imageSizeLimit',
              'fileSizeLimit',
              'uploadUnit',
              'allowedFormats',
              'formats',
              'maxSize',
              'sizeUnit',
            ]
              .filter((key) => field[key] != null && field[key] !== '')
              .map((key) => [key, field[key]]),
          );
          return [
            {
              ...field,
              columnName: String(field.fieldCode),
              fieldType: String(field.fieldType || '').toUpperCase(),
              dataSource:
                field.dataSource ||
                (typeConfig.dictCode ||
                typeConfig.dictId ||
                field.dictCode ||
                field.dictId
                  ? undefined
                  : String(field.fieldType).toUpperCase() === 'DEPARTMENT'
                    ? 'department'
                    : String(field.fieldType).toUpperCase() === 'JOBCATEGORY'
                      ? 'jobCategory'
                      : String(field.fieldType).toUpperCase() === 'PERSON'
                        ? 'orgUser'
                        : ARCHIVE_FIELD_DATA_SOURCES[field.fieldCode]),
              required: readPermissionFlag(field.required) === true,
              ...(field.disabled != null
                ? { disabled: readPermissionFlag(field.disabled) === true }
                : {}),
              typeConfigJson: {
                ...topConfig,
                ...(Number(field.length ?? field.maxLength) > 0
                  ? { valueLength: Number(field.length ?? field.maxLength) }
                  : {}),
                ...typeConfig,
                ...(field.fieldMapping
                  ? { fieldMapping: field.fieldMapping }
                  : {}),
              },
            },
          ];
        }),
      }))
      .filter((group: { groupCode: string }) => group.groupCode),
  };
}

/** PC appPersonalAuth 的 authType/auth、editable、isApproval 语义。 */
export function adaptArchivePermissions(body: unknown): ArchivePermission[] {
  const source = body as { data?: unknown; setList?: unknown } | null;
  const list = Array.isArray(body)
    ? body
    : Array.isArray(source?.data)
      ? source.data
      : Array.isArray(source?.setList)
        ? source.setList
        : [];
  const rules: ArchivePermission[] = [];
  const readRule = (
    row: Record<string, unknown>,
    setCode: string,
    groupCode?: string,
    field = false,
  ) => {
    const config = (row.systemConfig || {}) as Record<string, unknown>;
    const auth = config.authType ?? config.auth;
    const permission =
      auth === 'hide' || auth === 'hidden'
        ? 'hide'
        : auth === 'editable' && readPermissionFlag(config.editable) !== false
          ? 'editable'
          : 'readonly';
    rules.push({
      setCode,
      groupCode,
      // columnName 是真实字段名；没有时仅接受 fieldCode 的精确匹配，不截前缀、不按名称猜测。
      columnName: field
        ? String(row.columnName || row.fieldCode || '')
        : undefined,
      permission,
      needsApproval: readPermissionFlag(config.isApproval),
    });
  };
  list.forEach((set) => {
    const setCode = String(set?.setCode || '');
    if (!setCode) return;
    const groups = Array.isArray(set.groupList) ? set.groupList : [];
    const fields = Array.isArray(set.fieldList) ? set.fieldList : [];
    if (!groups.length && !fields.length) readRule(set, setCode);
    groups.forEach(
      (group: {
        groupCode?: string;
        fieldList?: Record<string, unknown>[];
      }) => {
        (group.fieldList || []).forEach((field) =>
          readRule(field, setCode, group.groupCode, true),
        );
      },
    );
    fields.forEach((field: Record<string, unknown>) =>
      readRule(field, setCode, undefined, true),
    );
  });
  return rules;
}

export function archiveFieldPermission(
  rules: ArchivePermission[],
  setCode: string,
  groupCode: string,
  columnName: string,
) {
  return (
    rules.find(
      (item) =>
        item.setCode === setCode &&
        item.groupCode === groupCode &&
        item.columnName === columnName,
    ) ||
    rules.find(
      (item) =>
        item.setCode === setCode &&
        !item.groupCode &&
        item.columnName === columnName,
    ) ||
    rules.find((item) => item.setCode === setCode && !item.columnName)
  );
}

/** 接收既有详情数据；分组值优先，其他字段仍使用花名册已有的平铺结果。 */
export function adaptArchiveRecords(
  schema: ArchiveSchema,
  rows: Record<string, unknown>[],
): ArchiveRecord[] {
  return rows.map((row) => ({
    id: String(
      row.id ||
        schema.groupList
          .filter((group) => !isArchiveAccountGroup(group.groupCode))
          .map(
            (group) =>
              (row[group.groupCode] as Record<string, unknown> | undefined)?.id,
          )
          .find(Boolean) ||
        '',
    ),
    ...(schema.setCode === 'tab_staff_info'
      ? {
          accounts: cloneDeep(
            Array.isArray(row.staffAccountInfo)
              ? row.staffAccountInfo
              : schema.groupList
                  .filter((group) => isArchiveAccountGroup(group.groupCode))
                  .flatMap((group) =>
                    Array.isArray(row[group.groupCode])
                      ? row[group.groupCode]
                      : row[group.groupCode]
                        ? [row[group.groupCode]]
                        : [],
                  ),
          ),
        }
      : {}),
    groups: Object.fromEntries(
      schema.groupList.map((group) => {
        const nested = row[group.groupCode];
        const source = Array.isArray(nested)
          ? nested[0] || {}
          : nested && typeof nested === 'object'
            ? nested
            : row;
        const data = { ...source, ...(source.customFields || {}) };
        return [
          group.groupCode,
          Object.fromEntries([
            ['id', data.id],
            ['defaultFlag', data.defaultFlag],
            ...group.fieldList.flatMap((field) => {
              const mapping = (
                field.typeConfigJson as { fieldMapping?: string }
              )?.fieldMapping;
              return [
                [
                  field.columnName,
                  field.fieldType.toLowerCase() === 'person' &&
                  data[field.columnName]?.staffId
                    ? {
                        value: data[field.columnName].staffId,
                        label: data[field.columnName].staffName || '',
                      }
                    : data[field.columnName],
                ],
                ...(mapping ? [[mapping, data[mapping]]] : []),
              ];
            }),
          ]),
        ];
      }),
    ),
  }));
}

export function isArchiveAccountGroup(code: string) {
  return (
    code === 'staffAccountInfo' || code.startsWith('tab_staff_info.bank_card')
  );
}

/** PC 文件值是文件 ID 字符串，不提交 URL、显示文案或本地 File。 */
export function archiveUploadIds(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number') {
    if (/^(https?:|data:|blob:|\/)/.test(String(value)))
      throw new Error('附件仅有预览地址，缺少文件 ID，请重新上传后保存');
    return String(value);
  }
  return (Array.isArray(value) ? value : [value])
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number')
        return archiveUploadIds(item);
      const fileId = item?.fileId || item?.id;
      if (!fileId) throw new Error('附件缺少文件 ID，请重新上传后保存');
      return String(fileId);
    })
    .join(',');
}

/** 仅按原动态字段组装；映射键、临时键不进入请求，自定义字段独立收拢。 */
function archiveEditRow(
  groups: ArchiveSchema['groupList'],
  values: Record<string, Record<string, unknown>>,
  id?: string,
): ArchiveEditRow {
  const row: ArchiveEditRow = {};
  const custom: Record<string, unknown> = {};
  groups.forEach((group) =>
    group.fieldList.forEach((field) => {
      const code = field.columnName;
      if (
        code.startsWith('_') ||
        !Object.hasOwn(values[group.groupCode] || {}, code)
      )
        return;
      let value = unwrapLabelValue(values[group.groupCode][code]);
      if (value === undefined) return;
      if (['IMAGE', 'IMG', 'FILE'].includes(field.fieldType))
        value = archiveUploadIds(value);
      if (
        field.fieldType === 'BOOLEAN' ||
        ['birthdayType', 'hasDegree', 'taxpayerStatus', 'defaultFlag'].includes(
          code,
        )
      ) {
        const boolean = readPermissionFlag(value);
        if (boolean === undefined) return;
        value = boolean ? 1 : 0;
      }
      if (field.systemFlag === 0) custom[code] = value;
      else row[code] = value;
    }),
  );
  if (id !== undefined) row.id = id;
  if (Object.keys(custom).length) row.customFields = custom;
  return row;
}

/** PC 整个当前信息集保存：保留其他记录和只读原值，只叠加有权限的变更。 */
export function buildArchiveEditRequest(
  submission: ArchiveSubmission,
  schema: ArchiveSchema,
  original: ArchiveRecord[],
  builtin?: number,
): ArchiveEditRequest {
  const { staffId, setCode } = submission;
  const api = Object.hasOwn(ARCHIVE_EDIT_APIS, setCode)
    ? ARCHIVE_EDIT_APIS[setCode]
    : undefined;
  if (
    !api &&
    (!isRosterDetailCustomTab(setCode, builtin) ||
      getRosterDetailTabKind(setCode) !== 'multiRecord')
  )
    throw new Error('该信息集尚无已确认的保存接口');
  const records = cloneDeep(original);
  submission.records.forEach((change) => {
    let record = change.id
      ? records.find((item) => item.id === change.id)
      : api && api.mode !== 'list'
        ? records[0]
        : undefined;
    if (change.id && !record) throw new Error('记录 ID 不存在，请刷新后重试');
    if (!record) {
      record = { id: '', groups: {} };
      records.push(record);
    }
    change.changes.forEach((field) => {
      if (
        !schema.groupList.some(
          (group) =>
            group.groupCode === field.groupCode &&
            group.fieldList.some(
              (item) => item.columnName === field.columnName,
            ),
        )
      )
        throw new Error('提交字段不属于当前信息集');
      (record.groups[field.groupCode] ||= {})[field.columnName] = field.value;
    });
  });
  const data: ArchiveEditRequest['data'] = { staffId };
  // 本人申请原因与 staffId 同级，不进入各信息集对象或自定义字段。
  if (submission.reason?.trim()) data.reason = submission.reason.trim();
  if (api?.mode === 'basic') {
    const record = records[0] || { id: '', groups: {} };
    const ordinary = schema.groupList.filter(
      (group) => !isArchiveAccountGroup(group.groupCode),
    );
    data.staffBasicInfo = archiveEditRow(ordinary, record.groups);
    if (record.id) data.staffBasicInfo.id = record.id;
    const { regularFlag } = data.staffBasicInfo;
    if (regularFlag === 1 || regularFlag === 2) data.regularFlag = regularFlag;
    delete data.staffBasicInfo.regularFlag;
    delete data.staffBasicInfo.regularDate;
    const accountGroups = schema.groupList.filter((group) =>
      isArchiveAccountGroup(group.groupCode),
    );
    const accountChanged = submission.records.some((item) =>
      item.changes.some((change) => isArchiveAccountGroup(change.groupCode)),
    );
    // PC 约定 null 表示不修改账号，不能因只编辑普通信息提交空数组删除账号。
    data.staffAccountInfo = null;
    if (accountChanged) {
      const changedGroups = new Set(
        submission.records.flatMap((item) =>
          item.changes.map((change) => change.groupCode),
        ),
      );
      const accounts = (record.accounts || []).map((item) => {
        const values = {
          ...item,
          ...((item.customFields as Record<string, unknown>) || {}),
        };
        const row = archiveEditRow(
          accountGroups,
          Object.fromEntries(
            accountGroups.map((group) => [group.groupCode, values]),
          ),
          String(item.id || ''),
        );
        const flag = readPermissionFlag(item.defaultFlag);
        if (flag !== undefined) row.defaultFlag = flag ? 1 : 0;
        return row;
      });
      accountGroups.forEach((group) => {
        if (!changedGroups.has(group.groupCode)) return;
        const originalGroup = original[0]?.groups[group.groupCode] || {};
        const id = String(originalGroup.id || '');
        const index = accounts.findIndex((item) =>
          id
            ? String(item.id) === id
            : group.fieldList.every(
                (field) =>
                  item[field.columnName] === originalGroup[field.columnName],
              ),
        );
        const row = archiveEditRow([group], record.groups, id);
        // 默认银行卡开关不一定出现在动态列中，但 PC 要求它和账号字段同级回传。
        const flag = readPermissionFlag(
          record.groups[group.groupCode]?.defaultFlag,
        );
        if (flag !== undefined) row.defaultFlag = flag ? 1 : 0;
        if (index >= 0) accounts[index] = row;
        else accounts.push(row);
      });
      data.staffAccountInfo = accounts;
    }
  } else if (api?.mode === 'leader') {
    const record = records[0] || { id: '', groups: {} };
    data.reportingLine = {};
    schema.groupList.forEach((group) =>
      group.fieldList
        .filter((field) => field.fieldType.toLowerCase() === 'person')
        .forEach((field) => {
          const value = record.groups[group.groupCode]?.[field.columnName];
          data.reportingLine![field.columnName] = String(
            unwrapLabelValue(value) ?? '',
          );
        }),
    );
  } else {
    const rows = records.map((record) =>
      archiveEditRow(schema.groupList, record.groups, record.id),
    );
    if (api?.mode === 'object')
      Object.assign(data, { [api.key]: rows[0] || {} });
    else if (api) Object.assign(data, { [api.key]: rows });
    else {
      data.setCode = setCode;
      data.list = rows.map((row) => ({ ...row, staffId, setCode }));
    }
    // 已由后端确认，本人教育经历与 PC 一样固定传 true。
    if (setCode === 'tab_staff_education') data.forceSave = true;
  }
  return { url: `${API_PREFIX}${api?.path || '/archive/info/edit'}`, data };
}

export function adaptArchiveWorkflow(
  body: ArchiveWorkflow | undefined,
): ArchiveWorkflow {
  return {
    records: Array.isArray(body?.records) ? body.records : null,
    pending: Array.isArray(body?.pending) ? body.pending : [],
  };
}
