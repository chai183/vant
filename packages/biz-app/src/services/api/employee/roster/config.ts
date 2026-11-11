import { API_PREFIX } from '@/services/api/employee/config';

/**
 * 花名册上下文。
 * 组织树没有「我的部门」和「当前用户是不是组织负责人」，由这个接口给出。
 */
export const ROSTER_CONTEXT_URL = `${API_PREFIX}/mobile-roster/context`;

/**
 * 花名册人员全量。
 * 搜索先用这份数据在页面上匹配；后端提供搜索接口后替换。
 */
export const ROSTER_STAFF_URL = `${API_PREFIX}/mobile-roster/staff`;

/** 详情 Tab 集合。无入参。 */
export const ROSTER_DETAIL_TABS_URL = `${API_PREFIX}/staff-info-field/roster-detail-set/get`;

/**
 * 信息集表单字段。
 * 详情按当前 Tab 传 setCode，只返回这一页的分组和字段。
 */
export const ROSTER_DETAIL_FORM_COLUMNS_URL = `${API_PREFIX}/staff-info-field/roster-display-form/get`;

/** 基础信息详情。只传 staffId。 */
export const ROSTER_DETAIL_BASIC_URL = `${API_PREFIX}/staff-basic/detail`;

/** 直属领导详情。只传 staffId。 */
export const ROSTER_DETAIL_LEADER_URL = `${API_PREFIX}/staff-report/detail`;

/** 自定义信息集详情。传 setCode + staffId。 */
export const ROSTER_DETAIL_CUSTOM_URL = `${API_PREFIX}/archive/info/detail`;

/** 固定多行信息集详情路径 */
export const ROSTER_DETAIL_MULTI_RECORD_PATH: Record<string, string> = {
  tab_staff_education: `${API_PREFIX}/staff-education/detail`,
  tab_staff_job_history: `${API_PREFIX}/staff-work-experience/detail`,
  tab_staff_family_member: `${API_PREFIX}/staff-family/detail`,
  tab_staff_certificate: `${API_PREFIX}/staff-certificate/detail`,
  tab_staff_performance: `${API_PREFIX}/staff-performance/detail`,
  tab_staff_internal_concurrent: `${API_PREFIX}/staff-concurrent-position/detail`,
};

/** 固定单条多分组信息集详情路径 */
export const ROSTER_DETAIL_SINGLE_FORM_PATH: Record<string, string> = {
  tab_staff_benefit: `${API_PREFIX}/staff-benefit-info/detail`,
  tab_staff_salary: `${API_PREFIX}/staff-salary-tax-info/detail`,
  tab_staff_subset_ptd: `${API_PREFIX}/staff-tax-info/detail`,
};

/** 基础信息 setCode */
export const ROSTER_DETAIL_BASIC_TAB = 'tab_staff_info';

/** 直属领导 setCode */
export const ROSTER_DETAIL_LEADER_TAB = 'dthr_staff_reporting_line';

/** 成长记录 / 成本中心 / 附件：正式接口未出，先走占位 Mock */
export const ROSTER_DETAIL_GROWTH_TAB = 'GROWTH';
export const ROSTER_DETAIL_COST_TAB = 'COST';
export const ROSTER_DETAIL_ATTACHMENT_TAB = 'ATTACHMENT';

export const ROSTER_DETAIL_GROWTH_CHANGE_URL = `${API_PREFIX}/staff-growth/change-list`;
export const ROSTER_DETAIL_GROWTH_POSITION_URL = `${API_PREFIX}/staff-growth/position-list`;
export const ROSTER_DETAIL_COST_URL = `${API_PREFIX}/staff-cost-center/detail`;
export const ROSTER_DETAIL_ATTACHMENT_URL = `${API_PREFIX}/staff-roster/detail`;

/** 成长记录二级 */
export const ROSTER_DETAIL_GROWTH_SUB_CHANGE = 'change';
export const ROSTER_DETAIL_GROWTH_SUB_POSITION = 'position';

/** 附件二级，对齐占位数据编码 */
export const ROSTER_DETAIL_ATTACH_ROSTER = 'ROSTER_ATTACH';
export const ROSTER_DETAIL_ATTACH_ONBOARD = 'ONBOARDING_ATTACH';
