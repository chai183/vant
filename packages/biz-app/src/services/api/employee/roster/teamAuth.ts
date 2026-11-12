import type {
  RosterDetailField,
  RosterDetailGroup,
  RosterDetailTabItem,
  RosterTeamAuthNode,
} from '@/types/employee/roster';
import { ROSTER_DETAIL_BASIC_TAB } from './config';

/** 团队授权编码 → 花名册 setCode，兼容设置页旧编码 */
const SET_CODE_ALIAS: Record<string, string> = {
  basic: ROSTER_DETAIL_BASIC_TAB,
  'employee-info': ROSTER_DETAIL_BASIC_TAB,
  'contract-info': ROSTER_DETAIL_BASIC_TAB,
  education: 'tab_staff_education',
  'work-experience': 'tab_staff_job_history',
  'family-member': 'tab_staff_family_member',
  'employee-certificate': 'tab_staff_certificate',
  'performance-archive': 'tab_staff_performance',
};

/** 设置页字段编码 ↔ 花名册 fieldCode */
const FIELD_CODE_ALIAS: Record<string, string[]> = {
  name: ['name'],
  avatar: ['avatar', 'idPhotoFront'],
  department: ['department', 'orgId', 'orgName', 'deptName'],
  orgId: ['department', 'orgId', 'orgName', 'deptName'],
  orgName: ['department', 'orgId', 'orgName', 'deptName'],
  position: ['position', 'positionId', 'positionName'],
  positionId: ['position', 'positionId', 'positionName'],
  jobTitle: ['jobTitle', 'positionTitleId', 'positionTitleName'],
  positionTitleId: ['jobTitle', 'positionTitleId', 'positionTitleName'],
  employeeNo: ['employeeNo', 'staffNo', 'workNo'],
  staffNo: ['employeeNo', 'staffNo', 'workNo'],
  phone: ['phone'],
};

type SetRule = {
  all: boolean;
  groups: Record<string, boolean>;
  fields: Record<string, boolean>;
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

function normalizeSetCode(code = '') {
  const raw = String(code || '').trim();
  if (!raw) return '';
  return SET_CODE_ALIAS[raw] || raw;
}

function expandFieldCodes(code = '') {
  const raw = String(code || '').trim();
  if (!raw) return [];
  const mapped = FIELD_CODE_ALIAS[raw];
  if (mapped?.length) return mapped;
  return [raw];
}

function markFields(rule: SetRule, code = '') {
  expandFieldCodes(code).forEach((item) => {
    rule.fields[item] = true;
  });
}

function ensureSetRule(
  sets: Record<string, SetRule>,
  setCode: string,
): SetRule {
  const code = normalizeSetCode(setCode);
  if (!sets[code]) {
    sets[code] = { all: false, groups: {}, fields: {} };
  }
  return sets[code];
}

function walkSetChildren(rule: SetRule, nodes: RosterTeamAuthNode[] = []) {
  nodes.forEach((node) => {
    if (node.nodeType === 'group') {
      const groupCode = nodeCode(node);
      if (!node.children?.length) {
        if (groupCode) rule.groups[groupCode] = true;
        return;
      }
      node.children.forEach((field) => {
        if (field.nodeType === 'field') markFields(rule, nodeCode(field));
      });
      return;
    }
    if (node.nodeType === 'field') {
      markFields(rule, nodeCode(node));
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
    const rule = ensureSetRule(sets, nodeCode(node));
    if (!node.children?.length) {
      rule.all = true;
      return;
    }
    walkSetChildren(rule, node.children);
  });
  return { ready, sets };
}

function findSetRule(index: RosterTeamAuthIndex, setCode = '') {
  const code = normalizeSetCode(setCode);
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
  if (groupCode && rule.groups[groupCode]) return true;
  return expandFieldCodes(fieldCode).some((item) => rule.fields[item]);
}

/** 列表身份：姓名始终展示；其余看基础信息是否授权。 */
export function isRosterListFieldAllowed(
  index: RosterTeamAuthIndex,
  key: 'name' | 'deptName' | 'workNo' | 'phone',
) {
  if (key === 'name') return true;
  if (!index.ready) return true;
  const rule = findSetRule(index, ROSTER_DETAIL_BASIC_TAB);
  if (!rule) return false;
  if (rule.all) return true;
  const fieldMap = {
    deptName: 'orgId',
    workNo: 'staffNo',
    phone: 'phone',
  } as const;
  return expandFieldCodes(fieldMap[key]).some((item) => rule.fields[item]);
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
      if (rule.groups[group.groupCode]) return group;
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
 * 用户个性化必须落在团队已选范围内。
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
      const children = clipRosterTeamAuthTree(
        node.children || [],
        limit.children,
      );
      return { ...node, children: children.length ? children : undefined };
    })
    .filter(Boolean) as RosterTeamAuthNode[];
}
