import type { RosterOrgNode } from '@/types/employee/roster';

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
