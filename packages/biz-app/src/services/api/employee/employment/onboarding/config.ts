import { API_PREFIX } from '@/services/api/employee/config';

/** 查询新增待入职 / 填写表单字段配置 */
export const WAIT_ENTRY_CREATE_FORM_FIELDS_URL = `${API_PREFIX}/entry/staff/add-entry/field/search`;

/** 直属领导信息集编码（新增弹窗不展示，仅详情维护） */
export const DIRECT_MANAGER_SET_CODE = 'direct_manager_type';

/** 字段配置查询类型：新增待入职 / 填写登记表 / 字段类型全场景 */
export const WAIT_ENTRY_FIELD_SEARCH_TYPE = {
  ENTRY_WAIT: 'entry-wait',
  ENTRY_DETAIL: 'entry-detail',
  /** SchemaProForm typeConfigJson 全场景测试 */
  SCHEMA_FIELD_TYPES: 'schema-field-types',
} as const;

/** 入职登记表状态 */
export const REGISTER_STATUS = {
  UN_SENT: 'UN_SENT',
  WAIT_COMMIT: 'WAIT_COMMIT',
  PASSED: 'PASSED',
  REJECTED: 'REJECTED',
  /** 审批中（接口码 CONFIRM） */
  CONFIRM: 'CONFIRM',
  ABANDON: 'ABANDON',
  RECHECK: 'RECHECK',
} as const;

export type RegisterStatusCode =
  (typeof REGISTER_STATUS)[keyof typeof REGISTER_STATUS];

/** 入职登记表状态下拉选项 */
export const REGISTER_STATUS_OPTIONS = [
  { label: '未发送', value: REGISTER_STATUS.UN_SENT },
  { label: '待提交', value: REGISTER_STATUS.WAIT_COMMIT },
  { label: '已同意', value: REGISTER_STATUS.PASSED },
  { label: '已拒绝', value: REGISTER_STATUS.REJECTED },
  { label: '审批中', value: REGISTER_STATUS.CONFIRM },
  { label: '已放弃', value: REGISTER_STATUS.ABANDON },
  { label: '已退回', value: REGISTER_STATUS.RECHECK },
];

/** 入职登记表状态列 valueEnum */
export const REGISTER_STATUS_VALUE_ENUM = {
  [REGISTER_STATUS.UN_SENT]: { text: '未发送', status: 'info' },
  [REGISTER_STATUS.WAIT_COMMIT]: { text: '待提交', status: 'waiting' },
  [REGISTER_STATUS.PASSED]: { text: '已同意', status: 'success' },
  [REGISTER_STATUS.REJECTED]: { text: '已拒绝', status: 'fail' },
  [REGISTER_STATUS.CONFIRM]: { text: '审批中', status: 'waiting' },
  [REGISTER_STATUS.ABANDON]: { text: '已放弃', status: 'normal' },
  [REGISTER_STATUS.RECHECK]: { text: '已退回', status: 'fail' },
};

/** 入职登记表状态码 → 文案 / 点色 */
export const REGISTER_STATUS_MAP: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  [REGISTER_STATUS.UN_SENT]: {
    label: '未发送',
    color: '#dddddd',
    dotColor: '#dddddd',
  },
  [REGISTER_STATUS.WAIT_COMMIT]: {
    label: '待提交',
    color: '#ff8125',
    dotColor: '#ff8125',
  },
  [REGISTER_STATUS.CONFIRM]: {
    label: '审批中',
    color: '#ff8125',
    dotColor: '#ff8125',
  },
  [REGISTER_STATUS.RECHECK]: {
    label: '已退回',
    color: '#ff3234',
    dotColor: '#ff3234',
  },
  [REGISTER_STATUS.PASSED]: {
    label: '已同意',
    color: '#52c41a',
    dotColor: '#52c41a',
  },
  [REGISTER_STATUS.REJECTED]: {
    label: '已拒绝',
    color: '#ff3234',
    dotColor: '#ff3234',
  },
  [REGISTER_STATUS.ABANDON]: {
    label: '已放弃',
    color: '#dddddd',
    dotColor: '#dddddd',
  },
};

/** 入职登记表状态码 → 展示文案 */
export function getRegisterStatusLabel(status: unknown) {
  const code = String(status ?? '');
  if (!code) return '';
  return (
    REGISTER_STATUS_OPTIONS.find((item) => String(item.value) === code)
      ?.label || ''
  );
}

/** 入职登记表模板启停状态（Boolean：true 已启用 / false 已停用） */
export const REGISTER_FORM_TEMPLATE_STATUS = {
  ENABLED: true,
  DISABLED: false,
} as const;

/** 入职模板下拉一次拉取条数（对齐 PC SEND_FORM_TEMPLATE_PAGE_SIZE） */
export const ENTRY_TEMPLATE_PAGE_SIZE = 9999;

/** 入职登记表模板分页：POST /entry/entry-template/page */
export const ONBOARDING_REGISTER_FORM_TEMPLATE_PAGE_URL = `${API_PREFIX}/entry/entry-template/page`;

/** 确认入职（单条 / 批量共用）：POST /entry-process-form/confirm */
export const WAIT_ENTRY_CONFIRM_URL = `${API_PREFIX}/entry-process-form/confirm`;

/** 编辑页 query.type：单条确认入职二次确认后进入，底部可「确认保存并确认入职」 */
export const REGISTER_FORM_EDIT_TYPE = {
  CONFIRM: 'confirm',
} as const;

/** 单条确认入职 - 二次确认文案（【姓名】会被替换） */
export const CONFIRM_ENTRY_SINGLE_TIP =
  '是否对【姓名】进行确认入职操作？确认入职后，入职登记表和入职审批流程将被放弃，之后入职登记表不能再次维护，也不能再次发起入职审批。';

/** 批量确认入职 - 二次确认文案（{count} 为人数） */
export const CONFIRM_ENTRY_BATCH_TIP =
  '是否对已选择的 {count} 名人员进行确认入职操作？确认入职后，入职登记表和入职审批流程将被放弃，之后入职登记表不能再次维护，也不能再次发起入职审批。';

/** 入职二维码 - 扫码说明（对齐 PC QrCodeDialog） */
export const QR_CODE_DESC =
  '候选人可用手机浏览器/微信/钉钉等扫描。进入入职页面，填写并提交入职登记表';

/** 企业二维码图片接口 base（query 动态拼接，对齐 PC） */
export const QR_CODE_IMAGE_BASE_URL =
  'https://xfbhr-uat.nbcb.com.cn:4800/gateway/authcenter/delegate/company/getQrCode';

/** 企业二维码 tId（当前无用户态，先用占位，对齐 PC） */
export const QR_CODE_T_ID = '17890134234598';

/** 企业二维码类型 - 入职 */
export const QR_CODE_TYPE = 'ENTRY';

/** 按模板 code 拼接二维码图片地址（对齐 PC QrCodeDialog.buildQrImageUrl） */
export function buildQrImageUrl(code: string) {
  if (!code) return '';
  const params = new URLSearchParams({
    tId: QR_CODE_T_ID,
    code: String(code),
    qrCodeType: QR_CODE_TYPE,
  });
  return `${QR_CODE_IMAGE_BASE_URL}?${params.toString()}`;
}
