import { cloneDeep, isEqual } from 'lodash-es';
import type {
  ArchiveSubmission,
  ArchiveWorkflow,
  ArchiveEditRequest,
  ArchiveEditRow,
} from '@/types/employeeArchive';
import {
  archivePersonalAuth,
  archiveMockRecords,
  archiveWorkflowState,
} from './data';
import {
  adaptArchivePermissions,
  archiveFieldPermission,
  adaptArchiveSchema,
  archiveUploadIds,
  isArchiveAccountGroup,
} from '@/services/api/employeeArchive/entity';
import { rosterDetailFormColumns } from '../employee/roster/detail-data';
import { rosterSettingsMockState } from '../employee/roster/settings/data';
import { adaptRosterTeamAuthTree } from '@/services/api/employee/roster/entity';
import {
  archiveTeamSchema,
  archiveEditSchema,
  archiveFieldLocked,
} from '@/pages/employeeArchive/utils/permissions';
import {
  ARCHIVE_ADDABLE_SETS,
  ARCHIVE_EDIT_APIS,
} from '@/services/api/employeeArchive/config';
import { getRosterDetailTabKind } from '@/services/api/employee/roster/tab';
import { unwrapLabelValue } from '@/_components/SchemaProForm/transform-schema';

export function readArchiveMockState(
  staffId: string,
  setCode: string,
): ArchiveWorkflow {
  return cloneDeep(
    archiveWorkflowState.get(JSON.stringify([staffId, setCode])) || {
      records: null,
      pending: [],
    },
  );
}

/** 开发 Mock 也从权限配置判断审批，不信任客户端传入审批标记。 */
export function submitArchiveMock(data: ArchiveSubmission) {
  const fail = (errorMsg: string) => ({
    body: null,
    errorCode: 'ARCHIVE_INVALID',
    errorMsg,
  });
  if (!data.staffId || !data.setCode || !Array.isArray(data.records))
    return fail('档案提交参数不完整');
  const key = JSON.stringify([data.staffId, data.setCode]);
  const state = readArchiveMockState(data.staffId, data.setCode);
  state.records ||= archiveMockRecords(data.setCode);
  const permissions = adaptArchivePermissions(archivePersonalAuth);
  const schema = archiveEditSchema(
    archiveTeamSchema(
      adaptArchiveSchema(rosterDetailFormColumns, data.setCode),
      adaptRosterTeamAuthTree(rosterSettingsMockState.selected),
    ),
    permissions,
  );
  const multi = getRosterDetailTabKind(data.setCode) === 'multiRecord';
  let hasPending = false;
  for (const item of data.records) {
    let record = state.records.find((row) => row.id === item.id);
    if (item.id && !record) return fail('记录不存在，请刷新后重试');
    if (!record && !ARCHIVE_ADDABLE_SETS.includes(data.setCode))
      return fail('此信息集不支持新增记录');
    if (!record) {
      record = { id: `archive-${crypto.randomUUID()}`, groups: {} };
      state.records.push(record);
    }
    const pending = { recordId: record.id, changes: [] as typeof item.changes };
    for (const change of item.changes) {
      const field = schema.groupList
        .find((group) => group.groupCode === change.groupCode)
        ?.fieldList.find((field) => field.columnName === change.columnName);
      if (
        field?.permission !== 'editable' ||
        archiveFieldLocked(
          state.pending,
          record.id,
          change.groupCode,
          change.columnName,
          multi,
        )
      )
        return fail('字段不可编辑或正在审批中');
      if (field.needsApproval == null) return fail('该字段尚未配置审批方式');
      const rule = archiveFieldPermission(
        permissions,
        data.setCode,
        change.groupCode,
        change.columnName,
      );
      if (rule?.needsApproval) pending.changes.push(cloneDeep(change));
      else {
        (record.groups[change.groupCode] ||= {})[change.columnName] = cloneDeep(
          change.value,
        );
        const metadata = field.typeConfigJson as { fieldMapping?: string };
        if (metadata?.fieldMapping) {
          const label = field.options?.find(
            (option) => option.value === change.value,
          )?.label;
          // 修改原值后移除旧显示文案，不能保留与新值冲突的 fieldMapping。
          delete record.groups[change.groupCode][metadata.fieldMapping];
          if (label != null)
            record.groups[change.groupCode][metadata.fieldMapping] = label;
        }
      }
    }
    if (pending.changes.length) {
      state.pending.push(pending);
      hasPending = true;
    }
  }
  archiveWorkflowState.set(key, cloneDeep(state));
  return {
    body: { pending: hasPending },
    errorCode: '000000',
    errorMsg: '操作成功',
  };
}

/** 开发 Mock 接收与 PC 相同的请求体；只把实际变化交给权限/待审样本处理。 */
export function submitArchiveEditMock(
  setCode: string,
  data: ArchiveEditRequest['data'],
) {
  const fail = (errorMsg: string) => ({
    body: false,
    errorCode: 'ARCHIVE_INVALID',
    errorMsg,
  });
  if (
    !data.staffId ||
    (setCode === 'tab_staff_education' && data.forceSave !== true)
  )
    return fail('档案提交参数不完整');
  const api = ARCHIVE_EDIT_APIS[setCode];
  const schema = adaptArchiveSchema(rosterDetailFormColumns, setCode);
  if (!schema.groupList.length) return fail('信息集不存在');
  const records =
    readArchiveMockState(data.staffId, setCode).records ||
    archiveMockRecords(setCode);
  const body = data as Record<string, unknown>;
  const rows: ArchiveEditRow[] =
    api?.mode === 'basic'
      ? [data.staffBasicInfo || {}]
      : api?.mode === 'leader'
        ? [data.reportingLine || {}]
        : api?.mode === 'object'
          ? [(body[api.key] as ArchiveEditRow) || {}]
          : ((body[api?.key || 'list'] || []) as ArchiveEditRow[]);
  if (!Array.isArray(rows)) return fail('信息集记录必须为数组');
  const submission: ArchiveSubmission = {
    staffId: data.staffId,
    setCode,
    records: rows.flatMap((row) => {
      const multi = !api || api.mode === 'list';
      const original = multi
        ? records.find((item) => item.id && item.id === row.id)
        : records[0];
      const changes = schema.groupList.flatMap((group) => {
        const account =
          api?.mode === 'basic' && isArchiveAccountGroup(group.groupCode);
        // null 的账号表示不修改，不能把它当作清空账号。
        if (account && data.staffAccountInfo == null) return [];
        const accountIndex =
          original?.accounts?.findIndex((item) =>
            group.fieldList.every(
              (field) =>
                item[field.columnName] ===
                original?.groups[group.groupCode]?.[field.columnName],
            ),
          ) ?? -1;
        const source = account ? data.staffAccountInfo?.[accountIndex] : row;
        if (!source) return [];
        const values = { ...source, ...source.customFields };
        return group.fieldList.flatMap((field) => {
          if (!Object.hasOwn(values, field.columnName)) return [];
          const value = values[field.columnName];
          let previous = unwrapLabelValue(
            original?.groups[group.groupCode]?.[field.columnName],
          );
          const upload = ['IMAGE', 'IMG', 'FILE'].includes(field.fieldType);
          if (upload) previous = archiveUploadIds(previous);
          if (
            isEqual(value, previous) ||
            (field.fieldType === 'BOOLEAN' &&
              Number(value) === Number(previous))
          )
            return [];
          // 仅回显请求中的文件 ID；上传/预览服务由 SchemaProForm 后续统一接入。
          const displayValue =
            upload && typeof value === 'string'
              ? value
                  .split(',')
                  .filter(Boolean)
                  .map((fileId) => ({ fileId, name: fileId }))
              : value;
          return [
            {
              groupCode: group.groupCode,
              columnName: field.columnName,
              value: displayValue,
            },
          ];
        });
      });
      return changes.length
        ? [{ id: original?.id || String(row.id || ''), changes }]
        : [];
    }),
  };
  const result = submitArchiveMock(submission);
  return { ...result, body: result.errorCode === '000000' };
}
