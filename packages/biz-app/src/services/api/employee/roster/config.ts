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
