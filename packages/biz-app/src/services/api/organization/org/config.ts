import { ORGANIZATION_API_PREFIX } from '@/services/api/organization/config';

/** PC 组织树。花名册用完整树 mode=null，才能拿到人数 */
export const ORG_TREE_URL = `${ORGANIZATION_API_PREFIX}/org-organization/tree`;

/**
 * 查询部门直属人员。
 * 对齐 PC POST /org-organization/page-query-staff，queryType=DIRECT。
 */
export const ORG_DEPT_STAFF_URL = `${ORGANIZATION_API_PREFIX}/org-organization/page-query-staff`;

/**
 * 未分组员工没有部门 id。
 * 组织树不含这批人，需后端约定：这里暂用 orgId=UNGROUPED 走同一人员接口。
 */
export const ROSTER_UNGROUPED_ORG_ID = 'UNGROUPED';
