/** 入职登记表分页查询入参（页面侧命名） */
export interface OnboardingRegisterFormPageParams {
  listType?: number | string;
  staffName?: string;
  phone?: string;
  identityCard?: string;
  staffType?: string | string[];
  enrollDateStart?: string;
  enrollDateEnd?: string;
  departmentId?: string | string[];
  positionId?: string | string[];
  submitTimeStart?: string;
  submitTimeEnd?: string;
  registerStatus?: string | string[];
  remark?: string;
  serialNo?: string;
  source?: number | string;
  pageNum?: number;
  pageSize?: number;
}

/** 入职登记表列表行 */
export interface OnboardingRegisterFormListItem {
  id: string;
  processFormId?: string;
  entryProcessFormId?: string;
  templateId?: string;
  name?: string;
  phone?: string;
  identityCard?: string;
  staffType?: string;
  staffTypeName?: string;
  enrollDate?: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionName?: string;
  tag?: number | string;
  tagName?: string;
  submitTime?: string;
  finishTime?: string;
  source?: number | string;
  sourceName?: string;
  registerStatus?: string;
  registerStatusName?: string;
  approveStatus?: string;
  entryStatus?: string | number;
  serialNo?: string;
  remark?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  idCardType?: string;
}

export interface OnboardingRegisterFormPageResult {
  records: OnboardingRegisterFormListItem[];
  total: number;
}

/** 查看页概要 */
export interface OnboardingRegisterFormViewDetail {
  id?: string;
  entryProcessFormId?: string;
  templateId?: string;
  name?: string;
  avatar?: string;
  tag?: number | string;
  tagName?: string;
  identityCard?: string;
  phone?: string;
  email?: string;
  registerStatus?: string;
  registerStatusName?: string;
  departmentName?: string;
  positionName?: string;
  staffType?: string;
  staffTypeName?: string;
  enrollDate?: string;
}

export interface OnboardingRegisterFormPersonInfo {
  formData?: Record<string, Array<Record<string, unknown>>>;
  materials?: Array<{
    materialId?: string;
    fileList?: Array<{
      fileId?: string;
      fileName?: string;
      url?: string;
    }>;
  }>;
  commitment?: {
    signed?: boolean;
    signedAt?: string;
    signId?: string;
    signUrl?: string;
  };
}

export interface OnboardingRegisterFormDetailResult {
  viewDetail?: OnboardingRegisterFormViewDetail;
  templateId?: string;
  formContent?: unknown[];
  formData?: OnboardingRegisterFormPersonInfo['formData'];
  materials?: OnboardingRegisterFormPersonInfo['materials'];
  commitment?: OnboardingRegisterFormPersonInfo['commitment'];
  registerTemplate?: Record<string, unknown>;
  formAttachmentList?: unknown[];
}

export interface OnboardingRegisterFormEditParams {
  id: string;
  formUpdateStatus?: number;
  formData?: OnboardingRegisterFormPersonInfo['formData'];
  attachmentList?: unknown[];
}

export interface OnboardingRegisterFormApproveParams {
  id: string;
  notifyMethods?: string[];
  comment?: string;
  remark?: string;
}

/** 批量操作失败项 */
export interface BatchOperationFailItem {
  id: string;
  name: string;
  reason: string;
}

/** 批量操作反馈 */
export interface BatchOperationFeedback {
  successCount: number;
  failCount: number;
  failList: BatchOperationFailItem[];
}

export type OnboardingRegisterFormReturnParams =
  OnboardingRegisterFormApproveParams;
export type OnboardingRegisterFormRejectParams =
  OnboardingRegisterFormApproveParams;

/** 入职登记模板详情（填写页按开关决定步骤） */
export interface OnboardingRegisterFormTemplateDetail {
  id: string;
  name: string;
  /** 引导页 */
  enableGuide: boolean;
  guideTitle: string;
  guideContent: string;
  /** 表单内容 */
  enableForm: boolean;
  formContent: unknown[];
  /** 入职材料 */
  enableAttach: boolean;
  /** 承诺与签名 */
  staffPromise: boolean;
  promiseContent: string;
  /** 是否要求手写签名 */
  signature: boolean;
}

/** 填写入职登记表（移动端本地提交） */
export interface OnboardingRegisterFormFillParams {
  name: string;
  phone: string;
  staffType?: string;
  staffTypeName?: string;
  departmentId?: string;
  departmentName?: string;
  enrollDate?: string;
  templateId?: string;
  committed?: boolean;
  /** 1 正常提交 / 2 存草稿 */
  formUpdateStatus?: number;
  /** 按信息集拆分的表单数据（对齐 add-entry field/search） */
  formData?: Record<string, Array<Record<string, unknown>>>;
  materials?: OnboardingRegisterFormPersonInfo['materials'];
  commitment?: OnboardingRegisterFormPersonInfo['commitment'];
  registerTemplate?: Record<string, unknown>;
  formContent?: unknown[];
}
