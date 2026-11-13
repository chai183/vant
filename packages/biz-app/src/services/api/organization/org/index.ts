import type { RosterOrgNode, RosterStaffPage } from '@/types/employee/roster';
import apiClient from '@/services/api';
import { ORG_DEPT_STAFF_URL, ORG_TREE_URL } from './config';
import { adaptOrgTree } from './entity';
import { adaptRosterStaffPage } from '@/services/api/employee/roster/entity';

interface ApiResponse<T> {
  success?: boolean;
  body?: T;
  message?: string;
  errorMsg?: string;
}

const EMPTY_STAFF_PAGE: RosterStaffPage = { records: [], total: 0 };

/**
 * 组织完整树。
 * POST /dthr-organization/v4/org-organization/tree
 * mode 不传精简树，才能拿到 onDutyCount / onDutyTotalCount。
 */
export async function getOrgTreeApi() {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ORG_TREE_URL,
    method: 'post',
    data: { mode: null, status: 1 },
  });
  return {
    ...response,
    body: response.success ? adaptOrgTree(response.body) : [],
  } as ApiResponse<RosterOrgNode[]>;
}

/**
 * 按部门 id 查该部门的人。
 * orgId 为 UNGROUPED 时表示未分组员工，需后端按该约定返回。
 */
export async function getDeptStaffApi(orgId: string) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ORG_DEPT_STAFF_URL,
    method: 'post',
    data: { orgId },
  });
  return {
    ...response,
    body: response.success
      ? adaptRosterStaffPage(response.body)
      : { ...EMPTY_STAFF_PAGE },
  } as ApiResponse<RosterStaffPage>;
}
