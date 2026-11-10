import type { OnboardingRegisterFormListItem } from '@/types/employee/employment/onboarding/register-form';
import {
  REGISTER_FORM_SOURCE,
  REGISTER_FORM_TAB,
  REGISTER_FORM_TAG,
  REGISTER_STATUS,
} from '@/services/api/employee/employment/onboarding/register-form/config';

const TAB_REGISTER_STATUS: Record<string, string[]> = {
  PENDING: [
    REGISTER_STATUS.UN_SENT,
    REGISTER_STATUS.WAIT_COMMIT,
    REGISTER_STATUS.CONFIRM,
    REGISTER_STATUS.RECHECK,
  ],
  COMPLETED: [
    REGISTER_STATUS.PASSED,
    REGISTER_STATUS.REJECTED,
    REGISTER_STATUS.ABANDON,
  ],
};

const SOURCE_NAME_MAP: Record<string, string> = {
  [REGISTER_FORM_SOURCE.HR_INVITE]: 'HR邀请',
  [REGISTER_FORM_SOURCE.STAFF_QR]: '员工扫码',
  [REGISTER_FORM_SOURCE.HR_SUBMIT]: 'HR提交',
};

const STATUS_NAME_MAP: Record<string, string> = {
  [REGISTER_STATUS.UN_SENT]: '未发送',
  [REGISTER_STATUS.WAIT_COMMIT]: '待提交',
  [REGISTER_STATUS.CONFIRM]: '审批中',
  [REGISTER_STATUS.RECHECK]: '已退回',
  [REGISTER_STATUS.PASSED]: '已同意',
  [REGISTER_STATUS.REJECTED]: '已拒绝',
  [REGISTER_STATUS.ABANDON]: '已放弃',
};

/** 入职登记表 mock 列表（对齐设计稿演示数据） */
export const onboardingRegisterFormMockList: OnboardingRegisterFormListItem[] =
  [
    {
      id: 'register-form-1',
      processFormId: 'entry-1',
      entryProcessFormId: 'entry-1',
      templateId: 'register-form-template-1',
      name: '刘宗',
      phone: '15866368845',
      identityCard: '330102199001011234',
      staffType: 'fulltime',
      staffTypeName: '全职',
      enrollDate: '2026-08-30',
      departmentId: 'dept-1',
      departmentName: '内容文字均折行自适应',
      positionId: 'pos-1',
      positionName: '产品经理',
      tag: REGISTER_FORM_TAG.COMMITTED,
      submitTime: '2025-01-02 09:30:00',
      source: REGISTER_FORM_SOURCE.HR_INVITE,
      registerStatus: REGISTER_STATUS.CONFIRM,
      serialNo: 'RF20250102001',
      remark: '',
    },
    {
      id: 'register-form-2',
      processFormId: 'entry-2',
      entryProcessFormId: 'entry-2',
      templateId: 'register-form-template-1',
      name: '李丽萍',
      phone: '15866368845',
      identityCard: '330102199202022345',
      staffType: 'fulltime',
      staffTypeName: '全职',
      enrollDate: '2026-08-30',
      departmentId: 'dept-1',
      departmentName: '内容文字均折行自适应',
      positionId: 'pos-2',
      positionName: '设计师',
      tag: REGISTER_FORM_TAG.COMMITTED,
      submitTime: '2025-01-02 09:30:00',
      source: REGISTER_FORM_SOURCE.STAFF_QR,
      registerStatus: REGISTER_STATUS.CONFIRM,
      serialNo: 'RF20250102002',
      remark: '',
    },
    {
      id: 'register-form-3',
      processFormId: 'entry-3',
      entryProcessFormId: 'entry-3',
      templateId: 'register-form-template-1',
      name: '张三',
      phone: '15988689532',
      staffType: 'intern',
      staffTypeName: '实习',
      enrollDate: '2026-05-28',
      departmentId: 'dept-2',
      departmentName: '科技研发中心',
      positionId: 'pos-3',
      positionName: '前端工程师',
      tag: REGISTER_FORM_TAG.COMMITTED,
      submitTime: '2026-05-01 09:30:00',
      source: REGISTER_FORM_SOURCE.HR_INVITE,
      registerStatus: REGISTER_STATUS.CONFIRM,
    },
    {
      id: 'register-form-4',
      processFormId: 'entry-4',
      entryProcessFormId: 'entry-4',
      name: '高小红',
      phone: '15988689533',
      staffType: 'parttime',
      staffTypeName: '兼职',
      enrollDate: '2026-06-15',
      departmentId: 'dept-3',
      departmentName: '人力资源部',
      positionId: 'pos-4',
      positionName: '招聘专员',
      tag: '',
      submitTime: '2026-05-02 10:15:00',
      source: REGISTER_FORM_SOURCE.STAFF_QR,
      registerStatus: REGISTER_STATUS.RECHECK,
    },
    {
      id: 'register-form-5',
      processFormId: 'entry-5',
      entryProcessFormId: 'entry-5',
      name: '王芳',
      phone: '15988689536',
      staffType: 'fulltime',
      staffTypeName: '全职',
      enrollDate: '2026-06-01',
      departmentId: 'dept-2',
      departmentName: '科技研发中心',
      positionId: 'pos-5',
      positionName: '后端工程师',
      tag: '',
      submitTime: '2026-05-06 14:20:00',
      finishTime: '2026-05-07 10:00:00',
      source: REGISTER_FORM_SOURCE.HR_SUBMIT,
      registerStatus: REGISTER_STATUS.PASSED,
    },
    {
      id: 'register-form-6',
      processFormId: 'entry-6',
      entryProcessFormId: 'entry-6',
      name: '赵强',
      phone: '15988689537',
      staffType: 'fulltime',
      staffTypeName: '全职',
      enrollDate: '2026-05-20',
      departmentId: 'dept-4',
      departmentName: '风险管理部',
      positionId: 'pos-6',
      positionName: '风控专员',
      tag: '',
      submitTime: '2026-05-07 09:10:00',
      finishTime: '2026-05-08 16:30:00',
      source: REGISTER_FORM_SOURCE.HR_SUBMIT,
      registerStatus: REGISTER_STATUS.REJECTED,
    },
    {
      id: 'register-form-7',
      processFormId: 'entry-7',
      entryProcessFormId: 'entry-7',
      name: '陈静',
      phone: '15988689538',
      staffType: 'fulltime',
      staffTypeName: '全职',
      enrollDate: '2026-06-10',
      departmentId: 'dept-3',
      departmentName: '人力资源部',
      positionId: 'pos-7',
      positionName: 'HRBP',
      tag: '',
      submitTime: '2026-05-08 11:00:00',
      finishTime: '2026-05-09 10:00:00',
      source: REGISTER_FORM_SOURCE.STAFF_QR,
      registerStatus: REGISTER_STATUS.ABANDON,
    },
    {
      id: 'register-form-8',
      processFormId: 'entry-8',
      entryProcessFormId: 'entry-8',
      name: '周杰',
      phone: '13800138001',
      staffType: 'fulltime',
      staffTypeName: '全职',
      enrollDate: '2026-09-01',
      departmentId: 'dept-5',
      departmentName: '内容运营中心',
      positionId: 'pos-8',
      positionName: '运营专员',
      tag: REGISTER_FORM_TAG.COMMITTED,
      submitTime: '2026-05-10 08:20:00',
      source: REGISTER_FORM_SOURCE.HR_INVITE,
      registerStatus: REGISTER_STATUS.WAIT_COMMIT,
    },
  ];

/** 按 Tab 过滤 mock 列表 */
export function filterRegisterFormListByTab(listType?: string | number) {
  const normalized = String(listType ?? '');
  const isCompleted =
    normalized === '2' ||
    normalized === String(REGISTER_FORM_TAB.COMPLETED) ||
    normalized === 'COMPLETED';
  const tabKey = isCompleted
    ? REGISTER_FORM_TAB.COMPLETED
    : REGISTER_FORM_TAB.PENDING;
  const statusList =
    TAB_REGISTER_STATUS[
      tabKey === REGISTER_FORM_TAB.COMPLETED ? 'COMPLETED' : 'PENDING'
    ] ?? [];
  return onboardingRegisterFormMockList.filter((item) =>
    statusList.includes(String(item.registerStatus || '')),
  );
}

/** 按筛选条件过滤（移动端支持姓名/手机号/状态/部门/职位/员工类型/入职日期） */
export function filterRegisterFormList(
  listType?: string | number,
  body: Record<string, unknown> = {},
) {
  let list = filterRegisterFormListByTab(listType);

  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const startDate = String(body.startDate ?? '').trim();
  const endDate = String(body.endDate ?? '').trim();
  const orgIds = Array.isArray(body.orgIds) ? body.orgIds.map(String) : [];
  const registerStatusList = Array.isArray(body.registerStatusList)
    ? body.registerStatusList.map(String)
    : [];
  const positionIds = Array.isArray(body.positionIds)
    ? body.positionIds.map(String)
    : [];
  const staffTypes = Array.isArray(body.staffTypes)
    ? body.staffTypes.map(String)
    : [];

  if (name) {
    list = list.filter((item) => String(item.name || '').includes(name));
  }
  if (phone) {
    const normalizedPhone = phone.replace(/\s/g, '');
    list = list.filter((item) =>
      String(item.phone || '')
        .replace(/\s/g, '')
        .includes(normalizedPhone),
    );
  }
  if (registerStatusList.length) {
    list = list.filter((item) =>
      registerStatusList.includes(String(item.registerStatus || '')),
    );
  }
  if (orgIds.length) {
    list = list.filter((item) =>
      orgIds.includes(String(item.departmentId || '')),
    );
  }
  if (positionIds.length) {
    list = list.filter((item) =>
      positionIds.includes(String(item.positionId || '')),
    );
  }
  if (staffTypes.length) {
    list = list.filter((item) =>
      staffTypes.includes(String(item.staffType || '')),
    );
  }
  if (startDate) {
    list = list.filter((item) => String(item.enrollDate || '') >= startDate);
  }
  if (endDate) {
    list = list.filter((item) => String(item.enrollDate || '') <= endDate);
  }

  return list;
}

/** 补全展示字段 */
export function enrichRegisterFormRow(row: OnboardingRegisterFormListItem) {
  const source = String(row.source || '');
  const registerStatus = String(row.registerStatus || '');
  const sourceName = row.sourceName || SOURCE_NAME_MAP[source] || source;
  const committed =
    String(row.tag ?? '').trim() === String(REGISTER_FORM_TAG.COMMITTED);

  return {
    ...row,
    processFormId: row.processFormId || row.entryProcessFormId,
    entryProcessFormId: row.processFormId || row.entryProcessFormId,
    tagName: committed ? '已承诺' : '',
    sourceName,
    registerStatusName:
      row.registerStatusName ||
      STATUS_NAME_MAP[registerStatus] ||
      registerStatus,
  };
}

/** Mock 新增填写记录 */
export function appendRegisterFormRecord(
  payload: Partial<OnboardingRegisterFormListItem>,
) {
  const id = `register-form-${Date.now()}`;
  const row: OnboardingRegisterFormListItem = {
    id,
    processFormId: `entry-${Date.now()}`,
    entryProcessFormId: `entry-${Date.now()}`,
    templateId: payload.templateId || 'register-form-template-1',
    name: payload.name || '',
    phone: payload.phone || '',
    staffType: payload.staffType || 'fulltime',
    staffTypeName: payload.staffTypeName || '全职',
    enrollDate: payload.enrollDate || '',
    departmentId: payload.departmentId || 'dept-1',
    departmentName: payload.departmentName || '',
    tag: payload.tag ?? '',
    submitTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    source: REGISTER_FORM_SOURCE.HR_SUBMIT,
    registerStatus: payload.registerStatus || REGISTER_STATUS.CONFIRM,
    serialNo: `RF${Date.now()}`,
    remark: '',
  };
  onboardingRegisterFormMockList.unshift(row);
  return enrichRegisterFormRow(row);
}
