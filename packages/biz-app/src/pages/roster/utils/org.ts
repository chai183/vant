import type { RosterOrgNode, RosterStaff } from '@/types/employee/roster';

export function formatCount(value: number) {
  return Number(value || 0).toLocaleString('en-US');
}

export function sumTotalCount(nodes: RosterOrgNode[]) {
  return nodes.reduce((sum, node) => sum + Number(node.totalCount || 0), 0);
}

export function findOrg(
  nodes: RosterOrgNode[],
  id: string,
): RosterOrgNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findOrg(node.children, id);
    if (child) return child;
  }
  return null;
}

export function buildOrgPath(nodes: RosterOrgNode[], id: string) {
  const path: RosterOrgNode[] = [];
  function walk(list: RosterOrgNode[]): boolean {
    for (const node of list) {
      if (node.id === id) {
        path.push(node);
        return true;
      }
      if (walk(node.children)) {
        path.unshift(node);
        return true;
      }
    }
    return false;
  }
  walk(nodes);
  return path;
}

/**
 * 面包屑。
 * 部门负责人从自己的部门起算，例如入口只显示「财务一部」，下钻是「财务一部 > 会计核算室」。
 * 其他人仍不带组织架构第一屏那一层。
 */
export function buildOrgCrumb(
  nodes: RosterOrgNode[],
  id: string,
  rootId?: string,
) {
  const path = buildOrgPath(nodes, id);
  if (rootId) {
    const start = path.findIndex((item) => item.id === rootId);
    if (start >= 0) return path.slice(start);
  }
  if (path.length > 1 && !path[0].parentId) return path.slice(1);
  return path;
}

export function flattenOrgs(nodes: RosterOrgNode[]) {
  const list: RosterOrgNode[] = [];
  function walk(items: RosterOrgNode[]) {
    items.forEach((node) => {
      list.push(node);
      walk(node.children);
    });
  }
  walk(nodes);
  return list;
}

export function matchKeyword(text: string, keyword: string) {
  const word = keyword.trim().toLowerCase();
  if (!word) return false;
  return String(text || '')
    .toLowerCase()
    .includes(word);
}

/** 按关键字把原文拆成普通片段和高亮片段，大小写不敏感 */
export function splitKeyword(text?: string, keyword?: string) {
  const source = String(text || '');
  const word = String(keyword || '').trim();
  if (!source) return [];
  if (!word) return [{ text: source, hit: false }];
  const lower = source.toLowerCase();
  const key = word.toLowerCase();
  const parts: { text: string; hit: boolean }[] = [];
  let start = 0;
  let index = lower.indexOf(key);
  while (index !== -1) {
    if (index > start) {
      parts.push({ text: source.slice(start, index), hit: false });
    }
    parts.push({ text: source.slice(index, index + key.length), hit: true });
    start = index + key.length;
    index = lower.indexOf(key, start);
  }
  if (start < source.length) {
    parts.push({ text: source.slice(start), hit: false });
  }
  return parts;
}

export function staffMeta(staff: RosterStaff) {
  const parts = [staff.staffNo, staff.phone].filter(Boolean);
  return parts.join(' | ');
}

export function orgTone(index: number) {
  return index % 3;
}
