import {
  REGISTER_FORM_APPROVAL_NOTIFY,
  REGISTER_FORM_TAB,
  REGISTER_STATUS,
  REGISTER_STATUS_OPTIONS,
} from '@/services/api/employee/employment/onboarding/register-form/config';

export {
  REGISTER_FORM_LIST_TYPE,
  REGISTER_FORM_TAB,
  REGISTER_FORM_VIEW_TAB,
  REGISTER_STATUS,
  REGISTER_STATUS_MAP,
  REGISTER_STATUS_OPTIONS,
  isRegisterFormCommittedTag,
  REGISTER_FORM_APPROVAL_ACTION,
  REGISTER_FORM_APPROVAL_ACTION_CONFIG,
  REGISTER_FORM_APPROVAL_NOTIFY,
  REGISTER_FORM_APPROVAL_OPINION_MAX_LENGTH,
  REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT,
  REGISTER_FORM_TEMPLATE_YES_NO,
  REGISTER_FORM_UPDATE_STATUS,
} from '@/services/api/employee/employment/onboarding/register-form/config';

/** 审批通知方式选项（单条 / 批量共用） */
export const APPROVAL_NOTIFY_OPTIONS = [
  {
    value: REGISTER_FORM_APPROVAL_NOTIFY.EMAIL,
    label: '邮件（发送至候选人个人邮箱）',
  },
  {
    value: REGISTER_FORM_APPROVAL_NOTIFY.SMS,
    label: '短信',
  },
] as const;

/** 待处理 Tab 状态筛选项 */
const PENDING_STATUS_CODES = new Set<string>([
  REGISTER_STATUS.CONFIRM,
  REGISTER_STATUS.RECHECK,
  REGISTER_STATUS.WAIT_COMMIT,
  REGISTER_STATUS.UN_SENT,
]);

/** 已处理 Tab 状态筛选项 */
const COMPLETED_STATUS_CODES = new Set<string>([
  REGISTER_STATUS.PASSED,
  REGISTER_STATUS.REJECTED,
  REGISTER_STATUS.ABANDON,
]);

export function getRegisterFormStatusOptions(isCompleted: boolean) {
  const allowed = isCompleted ? COMPLETED_STATUS_CODES : PENDING_STATUS_CODES;
  return REGISTER_STATUS_OPTIONS.filter((item) =>
    allowed.has(String(item.value)),
  );
}

/** 部门筛选 mock 选项 */
export const DEPARTMENT_OPTIONS = [
  { text: '全部部门', value: '' },
  { text: '内容文字均折行自适应', value: 'dept-1' },
  { text: '科技研发中心', value: 'dept-2' },
  { text: '人力资源部', value: 'dept-3' },
  { text: '风险管理部', value: 'dept-4' },
  { text: '内容运营中心', value: 'dept-5' },
];

/** 员工类型选项（填写表单） */
export const STAFF_TYPE_OPTIONS = [
  { text: '全职', value: 'fulltime' },
  { text: '兼职', value: 'parttime' },
  { text: '实习', value: 'intern' },
  { text: '外派', value: 'expat' },
];

export const STAFF_TYPE_LABEL_MAP: Record<string, string> = {
  fulltime: '全职',
  parttime: '兼职',
  intern: '实习',
  expat: '外派',
};

export function formatPhone(phone?: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }
  return phone || '-';
}

export function getListTypeByTab(tab: string) {
  return tab === REGISTER_FORM_TAB.COMPLETED ? 2 : 1;
}

/** 批量操作反馈页 sessionStorage key */
export const BATCH_FEEDBACK_STORAGE_KEY =
  'onboarding-register-form-batch-feedback';

export const EMPTY_BATCH_FEEDBACK = {
  successCount: 0,
  failCount: 0,
  failList: [] as Array<{ id: string; name: string; reason: string }>,
};

export {
  CONFIRM_ENTRY_BATCH_TIP,
  CONFIRM_ENTRY_SINGLE_TIP,
  REGISTER_FORM_EDIT_TYPE,
} from '@/services/api/employee/employment/onboarding/config';
