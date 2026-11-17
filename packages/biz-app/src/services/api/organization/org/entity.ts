import type { RosterOrgNode } from '@/types/employee/roster';
import { adaptRosterStaffPage } from '@/services/api/employee/roster/entity';

/** PC OrgStaffDetailVO → 页面人员字段；只在部门接口使用，不猜搜索接口别名。 */
export function adaptDeptStaffPage(body: unknown, viewOrgId: string) {
  const page =
    body && typeof body === 'object'
      ? (body as { records?: unknown; total?: unknown })
      : {};
  const records = Array.isArray(page.records) ? page.records : [];
  return adaptRosterStaffPage({
    total: page.total,
    records: records.map((row) => {
      const source = (row || {}) as Record<string, unknown>;
      const orgId = String(source.departmentId ?? '');
      const assignDeptIds = Array.isArray(source.assignDeptIds)
        ? source.assignDeptIds.map(String)
        : [];
      return {
        id: source.id,
        name: source.staffName,
        staffNo: source.workNumber,
        avatar: source.staffImageId,
        phone: source.mobileNo,
        orgId,
        orgName: source.departmentName,
        // 当前部门在兼职列表，或本部门人员另有兼职部门时展示兼任。
        concurrent:
          assignDeptIds.includes(viewOrgId) ||
          (Boolean(viewOrgId) &&
            orgId === viewOrgId &&
            assignDeptIds.length > 0),
      };
    }),
  });
}

function readCount(value: unknown) {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

function isEnabled(status: unknown) {
  return String(status ?? '1') !== '0';
}

/** 完整组织树转花名册部门节点。停用部门不进入花名册。 */
export function adaptOrgTree(body: unknown, parentId = ''): RosterOrgNode[] {
  if (!Array.isArray(body)) return [];
  return body.filter(isEnabledRow).map((row) => adaptOrgNode(row, parentId));
}

function isEnabledRow(row: unknown) {
  if (!row || typeof row !== 'object') return false;
  return isEnabled((row as { status?: unknown }).status);
}

function adaptOrgNode(row: object, parentId: string): RosterOrgNode {
  const source = row as {
    id?: unknown;
    orgName?: unknown;
    name?: unknown;
    parentOrgId?: unknown;
    onDutyCount?: unknown;
    onDutyTotalCount?: unknown;
    childrenOrgs?: unknown;
  };
  const id = String(source.id ?? '');
  const children = Array.isArray(source.childrenOrgs)
    ? source.childrenOrgs
    : [];
  return {
    id,
    name: String(source.orgName ?? source.name ?? ''),
    parentId:
      source.parentOrgId == null || source.parentOrgId === ''
        ? parentId
        : String(source.parentOrgId),
    directCount: readCount(source.onDutyCount),
    totalCount: readCount(
      source.onDutyTotalCount == null
        ? source.onDutyCount
        : source.onDutyTotalCount,
    ),
    children: adaptOrgTree(children, id),
  };
}
