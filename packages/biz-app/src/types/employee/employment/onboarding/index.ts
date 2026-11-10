/**
 * 待入职 / 入职登记表单相关类型
 * 信息集结构与 SchemaProForm 共用，便于花名册等复用
 */
export type {
  SchemaFieldTypeConfig as WaitEntryFormFieldTypeConfig,
  SchemaFieldItem as WaitEntryFormFieldItem,
  SchemaFieldGroup as WaitEntryFormFieldGroup,
  SchemaFieldSet as WaitEntryFormFieldSet,
} from '@/_components/SchemaProForm/types';

export type {
  SchemaFieldTypeConfig,
  SchemaFieldItem,
  SchemaFieldGroup,
  SchemaFieldSet,
} from '@/_components/SchemaProForm/types';

/** 查询新增待入职 / 填写表单字段配置入参 */
export interface WaitEntryCreateFormFieldsParams {
  /** 设置类型，新增待入职固定传 entry-wait */
  type: string;
}

/** 确认入职失败项（对齐 PC WaitEntryConfirmFailItem） */
export interface WaitEntryConfirmFailItem {
  staffName?: string;
  errorMessage?: string;
  errorMsg?: string;
  isGoConfirmPage?: boolean;
}

/** 确认入职返参（单条 / 批量共用） */
export interface WaitEntryConfirmResult {
  successCount?: number;
  failCount?: number;
  failList?: WaitEntryConfirmFailItem[];
  isGoConfirmPage?: boolean;
  controlWarnResult?: Record<string, unknown> | null;
}
