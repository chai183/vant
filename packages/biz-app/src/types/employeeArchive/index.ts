import type {
  SchemaFieldItem,
  SchemaFieldSet,
} from '@/_components/SchemaProForm/types';

/** 个人授权只控制权限；字段类型与约束仍来自花名册信息集。 */
export type ArchivePermission = {
  setCode: string;
  groupCode?: string;
  columnName?: string;
  permission: 'hide' | 'readonly' | 'editable';
  needsApproval?: boolean;
};

export type ArchiveField = SchemaFieldItem & {
  fieldCode: string;
  permission?: ArchivePermission['permission'];
  needsApproval?: boolean;
};

export type ArchiveSchema = Omit<SchemaFieldSet, 'groupList'> & {
  groupList: Array<{
    groupCode: string;
    groupName: string;
    fieldList: ArchiveField[];
  }>;
};

/** 同名字段按分组保存，银行卡等分组不会互相覆盖。 */
export type ArchiveRecord = {
  id: string;
  groups: Record<string, Record<string, unknown>>;
  /** 基础信息银行卡需整表回传，编辑当前组时也保留其他账号及其 ID。 */
  accounts?: Record<string, unknown>[];
};

/** 本地草稿 key 不作为后端记录 ID 提交。 */
export type ArchiveDraft = ArchiveRecord & { key: string };

export type ArchiveChange = {
  groupCode: string;
  columnName: string;
  value: unknown;
};

/** 页面内部变更描述；通过 API entity 转为 PC 各编辑协议，不直接发送。 */
export type ArchiveSubmission = {
  staffId: string;
  setCode: string;
  records: Array<{ id: string; changes: ArchiveChange[] }>;
};

export type ArchivePending = {
  recordId: string;
  changes: ArchiveChange[];
};

/** 开发联调的已生效记录与待审状态，正式状态查询协议待后端提供。 */
export type ArchiveWorkflow = {
  records: ArchiveRecord[] | null;
  pending: ArchivePending[];
};

/** PC 各编辑接口的行数据，customFields 由 systemFlag=0 拆入。 */
export type ArchiveEditRow = {
  id?: string;
  customFields?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ArchiveEditRequest = {
  url: string;
  data: {
    staffId: string;
    setCode?: string;
    forceSave?: boolean;
    regularFlag?: number;
    staffBasicInfo?: ArchiveEditRow;
    staffAccountInfo?: ArchiveEditRow[] | null;
    educationList?: ArchiveEditRow[];
    workExperienceList?: ArchiveEditRow[];
    familyList?: ArchiveEditRow[];
    certificateList?: ArchiveEditRow[];
    performanceList?: ArchiveEditRow[];
    concurrentPositionList?: ArchiveEditRow[];
    staffBenefitInfo?: ArchiveEditRow;
    staffSalaryTaxInfo?: ArchiveEditRow;
    staffTaxInfo?: ArchiveEditRow;
    reportingLine?: Record<string, string>;
    list?: ArchiveEditRow[];
  };
};
