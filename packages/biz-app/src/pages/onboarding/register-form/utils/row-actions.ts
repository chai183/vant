/**
 * 入职登记表列表 / 详情共用的行操作
 */
import { REGISTER_FORM_EDIT_TYPE, REGISTER_STATUS } from '../config';

/** 卡片 / 底栏操作 name */
export const REGISTER_FORM_ROW_ACTION = {
  DETAIL: 'detail',
  EDIT: 'edit',
  APPROVE: 'approve',
  REJECT: 'reject',
  RETURN: 'return',
  CONFIRM_ENTRY: 'confirm-entry',
  START_APPROVAL: 'start-approval',
  DELETE: 'delete',
} as const;

export type RegisterFormRowAction =
  (typeof REGISTER_FORM_ROW_ACTION)[keyof typeof REGISTER_FORM_ROW_ACTION];

export type RegisterFormEditRouteOptions = {
  type?: string;
  entryProcessFormId?: string;
};

/** 按登记状态决定可执行操作 */
export type RegisterFormActionFlags = {
  /** 审批中：同意 / 拒绝 / 退回 / 确认入职 / 发起入职审批 */
  canApprove: boolean;
  /** 待处理可编辑；已退回不支持编辑 */
  canEdit: boolean;
  /** 已退回：仅确认入职、发起入职审批 */
  canRecheckEntry: boolean;
};

export function getRegisterFormActionFlags(
  status?: unknown,
): RegisterFormActionFlags {
  const code = String(status || '');
  const canApprove = code === REGISTER_STATUS.CONFIRM;
  const canRecheckEntry = code === REGISTER_STATUS.RECHECK;
  const canEdit =
    code === REGISTER_STATUS.CONFIRM ||
    code === REGISTER_STATUS.WAIT_COMMIT ||
    code === REGISTER_STATUS.UN_SENT;
  return { canApprove, canEdit, canRecheckEntry };
}

/** 编辑页路由 query（列表 / 详情共用） */
export function buildRegisterFormEditQuery(
  options?: RegisterFormEditRouteOptions,
) {
  const query: Record<string, string> = {};
  if (options?.type) query.type = options.type;
  if (options?.entryProcessFormId) {
    query.entryProcessFormId = options.entryProcessFormId;
  }
  return Object.keys(query).length ? query : undefined;
}

/** 确认入职 → 编辑页（type=confirm） */
export function buildConfirmEntryEditOptions(item: {
  entryProcessFormId?: string;
  processFormId?: string;
}): RegisterFormEditRouteOptions {
  return {
    type: REGISTER_FORM_EDIT_TYPE.CONFIRM,
    entryProcessFormId: item.entryProcessFormId || item.processFormId || '',
  };
}
