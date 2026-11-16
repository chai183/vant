import type {
  RosterSettingNode,
  RosterSettingsSaveBody,
} from '@/types/roster/settings';

function readNode(
  raw: unknown,
  nodeType: RosterSettingNode['nodeType'],
  selected: boolean,
): RosterSettingNode | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const prefix = nodeType === 'module' ? 'set' : nodeType;
  const code = String(row[`${prefix}Code`] || row.id || '');
  if (!code) return null;
  const config = (row.systemConfig || {}) as Record<string, unknown>;
  const node: RosterSettingNode = {
    id: String(row.id || code),
    code,
    name: String(row[`${prefix}Name`] || code),
    nodeType,
  };
  if (typeof row.sort === 'number') node.sort = row.sort;
  // 仅已选接口最深层字段的严格布尔标记可锁定，父节点和全量选项不锁定。
  if (selected && nodeType === 'field' && config.builtin === true)
    node.builtin = true;
  if (nodeType !== 'field') {
    const groups =
      nodeType === 'module' && Array.isArray(row.groupList)
        ? row.groupList
        : [];
    const fields = Array.isArray(row.fieldList) ? row.fieldList : [];
    const children = [
      ...readNodes(groups, 'group', selected),
      ...readNodes(fields, 'field', selected),
    ];
    if (children.length) node.children = children;
  }
  return node;
}

function readNodes(
  list: unknown[],
  type: RosterSettingNode['nodeType'],
  selected: boolean,
) {
  return list
    .map((item) => readNode(item, type, selected))
    .filter((item): item is RosterSettingNode => item !== null)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

/** 与展示转换分离，完整保留 PC 设置提交所用的 setCode / groupCode / fieldCode。 */
export function adaptRosterSettingsTree(
  body: unknown,
  selected = false,
): RosterSettingNode[] {
  const row = (body || {}) as Record<string, unknown>;
  const list = Array.isArray(body)
    ? body
    : Array.isArray(row.data)
      ? row.data
      : Array.isArray(row.setList)
        ? row.setList
        : [];
  return readNodes(list, 'module', selected);
}

/** 对齐 PC toTeamAuthSaveSource：不回传展示映射或权限配置。 */
export function toRosterSettingsSaveBody(
  selectedList: RosterSettingNode[],
  isAllowDepartmentManagerView: boolean,
): RosterSettingsSaveBody {
  const field = (node: RosterSettingNode, index: number) => ({
    id: node.id || undefined,
    fieldCode: node.code || node.id,
    fieldName: node.name || undefined,
    sort: node.sort ?? index + 1,
  });
  return {
    isAllowDepartmentManagerView,
    setList: selectedList.map((node, index) => {
      const children = node.children || [];
      const groupList = children
        .filter((item) => item.nodeType === 'group')
        .map((group, groupIndex) => {
          const fieldList = (group.children || []).map(field);
          return {
            id: group.id || undefined,
            groupCode: group.code || group.id,
            groupName: group.name || undefined,
            sort: group.sort ?? groupIndex + 1,
            ...(fieldList.length ? { fieldList } : {}),
          };
        });
      const fieldList = children
        .filter((item) => item.nodeType === 'field')
        .map(field);
      return {
        id: node.id || undefined,
        setCode: node.code || node.id,
        setName: node.name || undefined,
        sort: index + 1,
        ...(groupList.length ? { groupList } : {}),
        ...(fieldList.length ? { fieldList } : {}),
      };
    }),
  };
}
