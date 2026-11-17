import type { RosterSettingNode } from '@/types/employee/roster/settings';

/** 节点编码按信息集、分组路径定位，同编码字段不会跨分组串选。 */
export function settingKey(path: string[], node: RosterSettingNode) {
  return JSON.stringify([...path, node.code || node.id]);
}

export function cloneSettings(nodes: RosterSettingNode[]): RosterSettingNode[] {
  return nodes.map((node) => ({
    ...node,
    ...(node.children ? { children: cloneSettings(node.children) } : {}),
  }));
}

/** PC 选择按叶子计数；没有下级的整个信息集或分组也是可选项。 */
export function settingLeaves(
  nodes: RosterSettingNode[],
  path: string[] = [],
): { key: string; node: RosterSettingNode }[] {
  return nodes.flatMap((node) =>
    node.children?.length
      ? settingLeaves(node.children, [...path, node.code || node.id])
      : [{ key: settingKey(path, node), node }],
  );
}

/** 保持原已选顺序，新勾选项追加；也保留全量选项未包含的已选节点。 */
export function mergeSettings(
  base: RosterSettingNode[],
  incoming: RosterSettingNode[],
): RosterSettingNode[] {
  const result = cloneSettings(base);
  incoming.forEach((node) => {
    const existing = result.find(
      (item) => item.nodeType === node.nodeType && item.code === node.code,
    );
    if (!existing) result.push(...cloneSettings([node]));
    else if (node.children?.length)
      existing.children = mergeSettings(existing.children || [], node.children);
  });
  return result;
}

/** PC 勾选父节点会勾选其全部下级；仅为交互展开，原始快照仍保留。 */
export function expandSettingsSelection(
  options: RosterSettingNode[],
  selected: RosterSettingNode[],
): RosterSettingNode[] {
  return selected.map((node) => {
    const source = options.find(
      (item) => item.nodeType === node.nodeType && item.code === node.code,
    );
    const children = node.children?.length
      ? expandSettingsSelection(source?.children || [], node.children)
      : cloneSettings(source?.children || []);
    return { ...node, ...(children.length ? { children } : {}) };
  });
}

function filterSettings(
  nodes: RosterSettingNode[],
  keys: Set<string>,
  path: string[] = [],
): RosterSettingNode[] {
  return nodes.flatMap((node) => {
    if (!node.children?.length)
      return keys.has(settingKey(path, node)) ? cloneSettings([node]) : [];
    const children = filterSettings(node.children, keys, [
      ...path,
      node.code || node.id,
    ]);
    // 清空的父节点必须移除，不能提交为空壳而变成整集授权。
    return children.length ? [{ ...node, children }] : [];
  });
}

export function selectSettings(
  options: RosterSettingNode[],
  selected: RosterSettingNode[],
  keys: Set<string>,
) {
  return mergeSettings(
    filterSettings(expandSettingsSelection(options, selected), keys),
    filterSettings(options, keys),
  );
}
