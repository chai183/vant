import { ORGANIZATION_API_PREFIX } from '@/services/api/organization/config';

/** PC 组织树。花名册用完整树 mode=null，才能拿到人数 */
export const ORG_TREE_URL = `${ORGANIZATION_API_PREFIX}/org-organization/tree`;

/**
 * 按部门 id 查询该部门的人。
 * POST /dthr-organization/v4/org-organization/page-query-staff，只传 orgId。
 */
export const ORG_DEPT_STAFF_URL = `${ORGANIZATION_API_PREFIX}/org-organization/page-query-staff`;

/**
 * 未分组员工没有部门 id。
 * 组织树不含这批人，需后端约定：这里暂用 orgId=UNGROUPED 走同一人员接口。
 */
export const ROSTER_UNGROUPED_ORG_ID = 'UNGROUPED';
