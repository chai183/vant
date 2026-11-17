import type {
  RosterCascadeOption,
  RosterDetailTabItem,
} from '@/types/employee/roster';
import {
  ROSTER_DETAIL_ATTACH_ONBOARD,
  ROSTER_DETAIL_ATTACH_ROSTER,
  ROSTER_DETAIL_ATTACHMENT_TAB,
  ROSTER_DETAIL_BASIC_TAB,
  ROSTER_DETAIL_COST_TAB,
  ROSTER_DETAIL_GROWTH_SUB_CHANGE,
  ROSTER_DETAIL_GROWTH_SUB_POSITION,
  ROSTER_DETAIL_GROWTH_TAB,
  ROSTER_DETAIL_LEADER_TAB,
  ROSTER_DETAIL_MULTI_RECORD_PATH,
  ROSTER_DETAIL_SINGLE_FORM_PATH,
} from './config';

/** 暂无字段明细的页签 */
const EMPTY_TAB_CODES = ['PROBATION'];

/** 详情页签种类。分类只取决于页签编码。 */
export function getRosterDetailTabKind(tabCode = '') {
  const code = String(tabCode || '');
  if (code === ROSTER_DETAIL_BASIC_TAB) return 'basic';
  if (code === ROSTER_DETAIL_LEADER_TAB) return 'leader';
  if (code === ROSTER_DETAIL_GROWTH_TAB) return 'growth';
  if (code === ROSTER_DETAIL_COST_TAB) return 'cost';
  if (code === ROSTER_DETAIL_ATTACHMENT_TAB) return 'attachment';
  if (
    Object.prototype.hasOwnProperty.call(ROSTER_DETAIL_SINGLE_FORM_PATH, code)
  ) {
    return 'singleForm';
  }
  if (EMPTY_TAB_CODES.includes(code)) return 'empty';
  return 'multiRecord';
}

/** 是否自定义多行信息集 */
export function isRosterDetailCustomTab(tabCode = '', builtin?: number) {
  const code = String(tabCode || '');
  if (getRosterDetailTabKind(code) !== 'multiRecord') return false;
  if (
    Object.prototype.hasOwnProperty.call(ROSTER_DETAIL_MULTI_RECORD_PATH, code)
  ) {
    return false;
  }
  return builtin == null || Number(builtin) !== 1;
}

/** 一级 Tab；成长记录 / 附件带二级，没有 children 时二级不渲染 */
export function buildRosterCascadeOptions(tabs: RosterDetailTabItem[] = []) {
  return tabs.map((tab) => {
    const option: RosterCascadeOption = {
      title: tab.name,
      setCode: tab.code,
    };
    const kind = getRosterDetailTabKind(tab.code);
    if (kind === 'growth') {
      option.children = [
        { title: '异动记录', subCode: ROSTER_DETAIL_GROWTH_SUB_CHANGE },
        { title: '企业内任职记录', subCode: ROSTER_DETAIL_GROWTH_SUB_POSITION },
      ];
    }
    if (kind === 'attachment') {
      option.children = [
        { title: '花名册附件', subCode: ROSTER_DETAIL_ATTACH_ROSTER },
        { title: '入职附件', subCode: ROSTER_DETAIL_ATTACH_ONBOARD },
      ];
    }
    return option;
  });
}
