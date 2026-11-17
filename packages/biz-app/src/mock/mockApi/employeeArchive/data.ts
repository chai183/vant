import type { ArchiveRecord, ArchiveWorkflow } from '@/types/employeeArchive';
import {
  rosterDetailFormColumns,
  rosterDetailBasicFormData,
  rosterDetailSingleFormByTab,
  rosterDetailMultiRecordByTab,
  rosterDetailLeaderDetail,
} from '../employee/roster/detail-data';
import {
  adaptArchiveSchema,
  adaptArchiveRecords,
} from '@/services/api/employeeArchive/entity';
import { getRosterDetailTabKind } from '@/services/api/employee/roster/tab';

/** 开发样本：沿用真实花名册字段，权限仅为联调样本，不是业务默认权限。 */
export const archivePersonalAuth = rosterDetailFormColumns.map((set) => ({
  setCode: set.setCode,
  groupList: set.children.map((group) => ({
    groupCode: group.groupCode,
    fieldList: group.children.map((field, index) => ({
      fieldCode: field.fieldCode,
      columnName: field.fieldCode,
      fieldName: field.fieldName,
      systemConfig: {
        authType:
          index === 0 && set.setCode === 'tab_staff_info'
            ? 'readonly'
            : index === 1 && set.setCode === 'tab_staff_info'
              ? 'hide'
              : 'editable',
        isApproval: index % 2 === 0,
        editable: !['CALCULATE', 'ADVANCED', 'DISPLAY'].includes(
          field.fieldType,
        ),
      },
    })),
  })),
}));

/** 与既有详情 Mock 相同的初始值，按员工 ID 和信息集隔离保存结果。 */
export function archiveMockRecords(setCode: string): ArchiveRecord[] {
  const schema = adaptArchiveSchema(rosterDetailFormColumns, setCode);
  const kind = getRosterDetailTabKind(setCode);
  const rows =
    kind === 'basic'
      ? [rosterDetailBasicFormData]
      : kind === 'singleForm'
        ? [rosterDetailSingleFormByTab[setCode] || {}]
        : kind === 'leader'
          ? [rosterDetailLeaderDetail]
          : rosterDetailMultiRecordByTab[setCode] || [];
  return adaptArchiveRecords(schema, rows);
}

/** 仅开发服务器内存持久化；重启后恢复初始数据。 */
export const archiveWorkflowState = new Map<string, ArchiveWorkflow>();
