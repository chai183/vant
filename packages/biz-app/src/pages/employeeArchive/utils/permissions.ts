import { cloneDeep, isEqual } from 'lodash-es';
import type {
  ArchiveDraft,
  ArchivePermission,
  ArchiveRecord,
  ArchiveSchema,
  ArchivePending,
  ArchiveSubmission,
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
          return [{ ...field, permission, needsApproval: rule?.needsApproval }];
        }),
      }))
      .filter((group) => group.fieldList.length),
  };
}

/** 待审记录锁定，单条信息集仅锁定待审字段。 */
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
          if (isEqual(value, previous)) return [];
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
