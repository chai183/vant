import type {
  RosterDetailField,
  RosterDetailGroup,
  RosterDetailTabItem,
  RosterListFieldCode,
  RosterTeamAuthNode,
} from '@/types/employee/roster';
import { ROSTER_DETAIL_BASIC_TAB } from '@/services/api/employee/roster/config';

type FieldRule = {
  all: boolean;
  fields: Record<string, boolean>;
};

type SetRule = FieldRule & {
  groups: Record<string, FieldRule>;
};

export type RosterTeamAuthIndex = {
  ready: boolean;
  sets: Record<string, SetRule>;
};

export const EMPTY_TEAM_AUTH_INDEX: RosterTeamAuthIndex = {
  ready: false,
  sets: {},
};

function nodeCode(node: RosterTeamAuthNode) {
  return String(node.code || node.id || '').trim();
}

/** 设置字段用 columnName 对应花名册字段，不从节点编码推测。 */
function markFields(rule: FieldRule, node: RosterTeamAuthNode) {
  const columnName = String(node.columnName || '').trim();
  if (columnName) rule.fields[columnName] = true;
}

function ensureSetRule(
  sets: Record<string, SetRule>,
  setCode: string,
): SetRule {
  const code = String(setCode || '').trim();
  if (!sets[code]) {
    sets[code] = { all: false, groups: {}, fields: {} };
  }
  return sets[code];
}

function walkSetChildren(rule: SetRule, nodes: RosterTeamAuthNode[] = []) {
  nodes.forEach((node) => {
    if (node.nodeType === 'group') {
      const groupCode = nodeCode(node);
      if (!groupCode) return;
      // 同名字段只在所属分组生效，不能让银行卡一的授权扩散到银行卡二。
      const group = (rule.groups[groupCode] ||= { all: false, fields: {} });
      if (!node.children?.length) {
        group.all = true;
        return;
      }
      node.children.forEach((field) => {
        if (field.nodeType === 'field') {
          markFields(group, field);
        }
      });
      return;
    }
    if (node.nodeType === 'field') {
      markFields(rule, node);
    }
  });
}

/** 已选树 → 查询索引。模块无子节点表示整集可看。 */
export function buildRosterTeamAuthIndex(
  selectedList: RosterTeamAuthNode[] = [],
  ready = false,
): RosterTeamAuthIndex {
  const sets: Record<string, SetRule> = {};
  selectedList.forEach((node) => {
    if (node.nodeType !== 'module') return;
    const setCode = nodeCode(node);
    const rule = ensureSetRule(sets, setCode);
    if (!node.children?.length) {
      rule.all = true;
      return;
    }
    walkSetChildren(rule, node.children);
  });
  return { ready, sets };
}

function findSetRule(index: RosterTeamAuthIndex, setCode = '') {
  const code = String(setCode || '').trim();
  if (!code) return undefined;
  return index.sets[code];
}

/** 查询未成功时不裁剪，避免接口失败把页面裁空。 */
export function isRosterSetAllowed(index: RosterTeamAuthIndex, setCode = '') {
  if (!index.ready) return true;
  return Boolean(findSetRule(index, setCode));
}

export function isRosterFieldAllowed(
  index: RosterTeamAuthIndex,
  setCode = '',
  fieldCode = '',
  groupCode = '',
) {
  if (!index.ready) return true;
  const rule = findSetRule(index, setCode);
  if (!rule) return false;
  if (rule.all) return true;
  const code = String(fieldCode || '').trim();
  if (rule.fields[code]) return true;
  if (groupCode) {
    const group = rule.groups[groupCode];
    return Boolean(group?.all || group?.fields[code]);
  }
  // 未指定分组的查询只用于判断字段是否在任一分组中已选。
  return Object.values(rule.groups).some((group) => group.fields[code]);
}

/** 列表身份：姓名始终展示；其余看基础信息是否授权。 */
export function isRosterListFieldAllowed(
  index: RosterTeamAuthIndex,
  fieldCode: RosterListFieldCode,
) {
  if (fieldCode === 'name') return true;
  // 权限只查询真实字段编码，fieldMapping 仅用于展示取值。
  return isRosterFieldAllowed(
    index,
    ROSTER_DETAIL_BASIC_TAB,
    fieldCode,
    `${ROSTER_DETAIL_BASIC_TAB}.default`,
  );
}

export function filterRosterTabs(
  index: RosterTeamAuthIndex,
  tabs: RosterDetailTabItem[] = [],
) {
  return tabs.filter((item) => isRosterSetAllowed(index, item.code));
}

function isBankCardGroup(groupCode = '') {
  return String(groupCode || '').includes('.bank_card');
}

export function filterRosterGroups(
  index: RosterTeamAuthIndex,
  setCode = '',
  groups: RosterDetailGroup[] = [],
) {
  if (!index.ready) return groups;
  const rule = findSetRule(index, setCode);
  if (!rule) return [];
  if (rule.all) return groups;
  return groups
    .map((group) => {
      if (rule.groups[group.groupCode]?.all) return group;
      const fields = (group.fields || []).filter((field: RosterDetailField) => {
        if (
          field.fieldCode === 'defaultFlag' &&
          isBankCardGroup(group.groupCode)
        ) {
          return (group.fields || []).some(
            (item) =>
              item.fieldCode !== 'defaultFlag' &&
              isRosterFieldAllowed(
                index,
                setCode,
                item.fieldCode,
                group.groupCode,
              ),
          );
        }
        return isRosterFieldAllowed(
          index,
          setCode,
          field.fieldCode,
          group.groupCode,
        );
      });
      return { ...group, fields };
    })
    .filter((group) => (group.fields || []).length);
}

function sameNode(left: RosterTeamAuthNode, right: RosterTeamAuthNode) {
  if (left.nodeType !== right.nodeType) return false;
  if (left.nodeType === 'field') {
    return Boolean(left.columnName && left.columnName === right.columnName);
  }
  const leftCode = nodeCode(left);
  const rightCode = nodeCode(right);
  return Boolean(
    (leftCode && rightCode && leftCode === rightCode) ||
    (left.id && right.id && left.id === right.id),
  );
}

function findCeiling(
  list: RosterTeamAuthNode[] = [],
  node: RosterTeamAuthNode,
) {
  return list.find((item) => sameNode(item, node));
}

/**
 * 后续员工档案的个人范围工具，当前花名册不调用。
 * 个人配置必须落在团队已选范围内。
 * 上限节点没有 children 时，表示这一支全部可配。
 */
export function clipRosterTeamAuthTree(
  source: RosterTeamAuthNode[] = [],
  ceiling: RosterTeamAuthNode[] = [],
): RosterTeamAuthNode[] {
  return source
    .map((node) => {
      const limit = findCeiling(ceiling, node);
      if (!limit) return null;
      if (!limit.children?.length) return node;
      // 个人选择整支时，交集就是团队允许的子节点，而不是空交集。
      if (!node.children?.length) return { ...node, children: limit.children };
      const children = clipRosterTeamAuthTree(
        node.children || [],
        limit.children,
      );
      // 没有匹配字段就移除这一支，不能把空交集解释成整组授权。
      return children.length ? { ...node, children } : null;
    })
    .filter(Boolean) as RosterTeamAuthNode[];
}
