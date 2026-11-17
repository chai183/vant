import { cloneDeep, isEqual } from 'lodash-es';
import type {
  ArchiveDraft,
  ArchivePermission,
  ArchiveRecord,
  ArchiveSchema,
  ArchivePending,
  ArchiveSubmission,
  ArchiveField,
} from '@/types/employeeArchive';
import type { RosterTeamAuthNode } from '@/types/employee/roster';
import { archiveFieldPermission } from '@/services/api/employeeArchive/entity';
import {
  buildRosterTeamAuthIndex,
  isRosterFieldAllowed,
} from '@/pages/roster/utils/teamAuth';
import {
  createModelFromSchema,
  unwrapLabelValue,
} from '@/_components/SchemaProForm/transform-schema';
import { ROSTER_DETAIL_BASIC_TAB } from '@/services/api/employee/roster/config';
import { normalizeSchemaUploadFiles } from '@/_components/SchemaProForm/transform-schema-utils';

/** 比较业务值：控件的数字转文本、标签和文件回显不算修改，不改写草稿。 */
function comparableValue(field: ArchiveField, raw: unknown) {
  const value = unwrapLabelValue(raw);
  if (['IMAGE', 'IMG', 'FILE'].includes(field.fieldType))
    return normalizeSchemaUploadFiles(value).map((file) =>
      file.fileId != null ? String(file.fileId) : file,
    );
  if (value == null || value === '') return '';
  if (field.fieldType === 'BOOLEAN') {
    if (value === true || value === 1 || value === '1' || value === 'true')
      return 1;
    if (value === false || value === 0 || value === '0' || value === 'false')
      return 0;
  }
  if (
    ['INTEGER', 'DOUBLE'].includes(field.fieldType) &&
    (typeof value === 'number' ||
      (typeof value === 'string' && value.trim() !== '')) &&
    Number.isFinite(Number(value))
  )
    return Number(value);
  if (
    ['TEXT', 'LONG_TEXT', 'OPTION'].includes(field.fieldType) &&
    (typeof value === 'string' || typeof value === 'number')
  )
    return String(value);
  return value;
}

/** 仅做团队授权裁剪，保留每个字段的完整元数据。 */
export function archiveTeamSchema(
  schema: ArchiveSchema,
  selected: RosterTeamAuthNode[],
): ArchiveSchema {
  const index = buildRosterTeamAuthIndex(selected, true);
  return {
    ...schema,
    groupList: schema.groupList
      .map((group) => ({
        ...group,
        fieldList: group.fieldList.filter((field) =>
          isRosterFieldAllowed(
            index,
            schema.setCode,
            field.fieldCode,
            group.groupCode,
          ),
        ),
      }))
      .filter((group) => group.fieldList.length),
  };
}

/** 个人权限只进入编辑 schema；未配置的字段保留展示，不自行赋予编辑权。 */
export function archiveEditSchema(
  schema: ArchiveSchema,
  rules: ArchivePermission[],
  pending: ArchivePending[] = [],
): ArchiveSchema {
  return {
    ...schema,
    groupList: schema.groupList
      .map((group) => ({
        ...group,
        fieldList: group.fieldList.flatMap((field) => {
          const rule = archiveFieldPermission(
            rules,
            schema.setCode,
            group.groupCode,
            field.columnName,
          );
          if (rule?.permission === 'hide') return [];
          const permission =
            field.disabled ||
            field.displayOnly ||
            field.fieldType === 'CALCULATE' ||
            field.fieldType === 'DISPLAY' ||
            field.fieldType === 'ADVANCED'
              ? 'readonly'
              : rule?.permission || 'readonly';
          // 基础信息有待审申请时，所有需审批字段禁改；其余信息集整体禁改。
          const pendingLocked =
            pending.length > 0 &&
            (schema.setCode !== ROSTER_DETAIL_BASIC_TAB ||
              rule?.needsApproval === true);
          return [
            {
              ...field,
              permission,
              needsApproval: rule?.needsApproval,
              disabled: Boolean(field.disabled || pendingLocked),
            },
          ];
        }),
      }))
      .filter((group) => group.fieldList.length),
  };
}

/** 记录级锁定；信息集级的待审限制另由编辑 schema 统一禁用。 */
export function archiveFieldLocked(
  pending: ArchivePending[],
  recordId: string,
  groupCode: string,
  columnName: string,
  multi: boolean,
) {
  return pending.some(
    (item) =>
      item.recordId === recordId &&
      (multi ||
        item.changes.some(
          (field) =>
            field.groupCode === groupCode && field.columnName === columnName,
        )),
  );
}

export function archiveDrafts(
  schema: ArchiveSchema,
  records: ArchiveRecord[],
): ArchiveDraft[] {
  return records.map((record, index) => ({
    ...cloneDeep(record),
    key: record.id || `record-${index}`,
    groups: Object.fromEntries(
      schema.groupList.map((group) => {
        const values = cloneDeep(record.groups[group.groupCode] || {});
        return [
          group.groupCode,
          createModelFromSchema(
            [{ ...schema, singleDataFlag: 1, groupList: [group] }],
            values,
          ),
        ];
      }),
    ),
  }));
}

/** 只提交有编辑权且实际变化的原始字段值，不提交隐藏值、显示映射或审批开关。 */
export function buildArchiveSubmission(
  staffId: string,
  schema: ArchiveSchema,
  drafts: ArchiveDraft[],
  initial: ArchiveDraft[],
  pending: ArchivePending[],
  multi: boolean,
): ArchiveSubmission {
  return {
    staffId,
    setCode: schema.setCode,
    records: drafts.flatMap((record) => {
      const original = initial.find((item) => item.key === record.key);
      const changes = schema.groupList.flatMap((group) =>
        group.fieldList.flatMap((field) => {
          if (
            field.permission !== 'editable' ||
            field.disabled ||
            archiveFieldLocked(
              pending,
              record.id,
              group.groupCode,
              field.columnName,
              multi,
            )
          )
            return [];
          const value = unwrapLabelValue(
            record.groups[group.groupCode]?.[field.columnName],
          );
          const previous = unwrapLabelValue(
            original?.groups[group.groupCode]?.[field.columnName],
          );
          if (
            original &&
            isEqual(
              comparableValue(field, value),
              comparableValue(field, previous),
            )
          )
            return [];
          const submittedValue =
            ['IMAGE', 'IMG', 'FILE'].includes(field.fieldType) &&
            Array.isArray(value)
              ? value.map((file) => ({
                  url: file.url,
                  ...(file.fileId || file.id
                    ? { fileId: file.fileId || file.id }
                    : {}),
                  ...(file.name ? { name: file.name } : {}),
                }))
              : value;
          return [
            {
              groupCode: group.groupCode,
              columnName: field.columnName,
              value: submittedValue ?? null,
            },
          ];
        }),
      );
      return changes.length ? [{ id: record.id, changes }] : [];
    }),
  };
}

/** 确认内容只列出实际改动的字段，分别说明审批后生效与直接生效。 */
export function archiveSubmissionSummary(
  schema: ArchiveSchema,
  submission: ArchiveSubmission,
) {
  const approval = new Set<string>();
  const immediate = new Set<string>();
  submission.records.forEach((record) =>
    record.changes.forEach((change) => {
      const group = schema.groupList.find(
        (item) => item.groupCode === change.groupCode,
      );
      const field = group?.fieldList.find(
        (item) => item.columnName === change.columnName,
      );
      if (!field || field.needsApproval == null)
        throw new Error('修改字段尚未配置审批方式，请联系管理员');
      const label = group?.groupName
        ? `${group.groupName}：${field.fieldName}`
        : field.fieldName;
      (field.needsApproval ? approval : immediate).add(label);
    }),
  );
  return { approval: [...approval], immediate: [...immediate] };
}
