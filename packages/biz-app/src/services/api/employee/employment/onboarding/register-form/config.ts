import { API_PREFIX } from '@/services/api/employee/config';

export {
  getRegisterStatusLabel,
  REGISTER_STATUS,
  REGISTER_STATUS_MAP,
  REGISTER_STATUS_OPTIONS,
  REGISTER_STATUS_VALUE_ENUM,
} from '@/services/api/employee/employment/onboarding/config';

/** 入职登记表子页 Tab */
export const REGISTER_FORM_TAB = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

/** Tab 对应后端 listType：1 待处理 / 2 已处理 */
export const REGISTER_FORM_LIST_TYPE = {
  [REGISTER_FORM_TAB.PENDING]: 1,
  [REGISTER_FORM_TAB.COMPLETED]: 2,
} as const;

/** 后端 tag：1 已承诺，其余不展示 */
export const REGISTER_FORM_TAG_CODE = {
  COMMITTED: 1,
} as const;

export const REGISTER_FORM_TAG = {
  COMMITTED: REGISTER_FORM_TAG_CODE.COMMITTED,
};

export function isRegisterFormCommittedTag(tag: unknown) {
  return String(tag ?? '').trim() === String(REGISTER_FORM_TAG_CODE.COMMITTED);
}

/** 数据来源：1 HR邀请 / 2 员工扫码 / 3 HR提交 */
export const REGISTER_FORM_SOURCE = {
  HR_INVITE: 1,
  STAFF_QR: 2,
  HR_SUBMIT: 3,
} as const;

export const REGISTER_FORM_SOURCE_MAP: Record<string, string> = {
  [REGISTER_FORM_SOURCE.HR_INVITE]: 'HR邀请',
  [REGISTER_FORM_SOURCE.STAFF_QR]: '员工扫码',
  [REGISTER_FORM_SOURCE.HR_SUBMIT]: 'HR提交',
};

/** 分页接口地址 */
export const ONBOARDING_REGISTER_FORM_PAGE_URL = `${API_PREFIX}/entry-registration-form/page`;

/** 批量删除接口地址 */
export const ONBOARDING_REGISTER_FORM_DELETE_URL = `${API_PREFIX}/entry-registration-form/delete-batch`;

/** 查看页详情接口 */
export const ONBOARDING_REGISTER_FORM_VIEW_DETAIL_URL = `${API_PREFIX}/entry-registration-form/detail`;

/** 查看 / 编辑页内容 Tab */
export const REGISTER_FORM_VIEW_TAB = {
  /** 基本信息 */
  BASIC: 'basic',
  /** 附件材料 */
  ATTACHMENT: 'attachment',
  /** 员工承诺 */
  COMMITMENT: 'commitment',
} as const;

/** 模板入职材料回显：GET .../attachment-setting/getById/{id} */
export const ONBOARDING_REGISTER_FORM_TEMPLATE_MATERIAL_URL = `${API_PREFIX}/entry/entry-template/attachment-setting/getById`;

/** 入职登记模板主详情：POST .../entry-template/detail/{id} */
export const ONBOARDING_REGISTER_FORM_TEMPLATE_DETAIL_URL = `${API_PREFIX}/entry/entry-template/detail`;

/** 入职登记模板表单字段：POST .../entry-template/detail/field/{id} */
export const ONBOARDING_REGISTER_FORM_TEMPLATE_FORM_CONTENT_URL = `${API_PREFIX}/entry/entry-template/detail/field`;

/** 模板开关：1 是 / 0 否 */
export const REGISTER_FORM_TEMPLATE_YES_NO = {
  YES: 1,
  NO: 0,
} as const;

/** 员工承诺默认文案（模板未配置时兜底） */
export const REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT =
  '本人承诺以上所填写的全部内容真实，有效，不存在任何隐瞒与不实的情况，更无遗漏之处，我了解若是被雇佣的话，我所提供的任何错误的说明或者信息可以成为被解雇的理由。';

/** 模板材料 Mock 兜底（对齐 PC REGISTER_FORM_MATERIAL_FALLBACK_ITEMS） */
export const REGISTER_FORM_MATERIAL_FALLBACK_ITEMS = [
  {
    id: 'mat-001',
    name: '学历证书',
    description: '请上传个人获得的学历证书照片',
    type: 'IMAGE',
  },
  {
    id: 'mat-002',
    name: '学位证书',
    description: '请上传个人获得的学位证书照片',
    type: 'IMAGE',
  },
  {
    id: 'mat-003',
    name: '离职证明',
    description: '请上传上家公司的离职证明',
    type: 'FILE',
  },
];

/** 编辑接口地址 */
export const ONBOARDING_REGISTER_FORM_EDIT_URL = `${API_PREFIX}/entry-registration-form/edit`;

/** 退回接口地址 */
export const ONBOARDING_REGISTER_FORM_RETURN_URL = `${API_PREFIX}/entry-registration-form/recheck`;

/** 拒绝接口地址 */
export const ONBOARDING_REGISTER_FORM_REJECT_URL = `${API_PREFIX}/entry-registration-form/rejected`;

/** 同意接口地址 */
export const ONBOARDING_REGISTER_FORM_APPROVE_URL = `${API_PREFIX}/entry-registration-form/passed`;

/** 表单更新状态：1 正常 / 2 草稿 */
export const REGISTER_FORM_UPDATE_STATUS = {
  NORMAL: 1,
  DRAFT: 2,
} as const;

/** 审批操作 - 通知方式（页面 checkbox 值） */
export const REGISTER_FORM_APPROVAL_NOTIFY = {
  EMAIL: 'email',
  SMS: 'sms',
} as const;

/** 审批操作 - 后端 notifyType：1 短信 / 2 邮件 / 3 短信+邮件 */
export const REGISTER_FORM_APPROVAL_NOTIFY_TYPE = {
  SMS: 1,
  EMAIL: 2,
  BOTH: 3,
} as const;

/** 审批操作类型 */
export const REGISTER_FORM_APPROVAL_ACTION = {
  RETURN: 'return',
  REJECT: 'reject',
  APPROVE: 'approve',
} as const;

export const REGISTER_FORM_APPROVAL_ACTION_CONFIG = {
  [REGISTER_FORM_APPROVAL_ACTION.RETURN]: {
    title: '退回',
    confirmText: '确认退回',
    /** 退回意见必填 */
    commentRequired: true,
    failFallback: '退回失败',
  },
  [REGISTER_FORM_APPROVAL_ACTION.REJECT]: {
    title: '拒绝',
    confirmText: '确认拒绝',
    commentRequired: false,
    failFallback: '拒绝失败',
  },
  [REGISTER_FORM_APPROVAL_ACTION.APPROVE]: {
    title: '同意',
    confirmText: '确认同意',
    commentRequired: false,
    failFallback: '同意失败',
  },
} as const;

/** 审批意见最大字数（弹层） */
export const REGISTER_FORM_APPROVAL_OPINION_MAX_LENGTH = 200;
