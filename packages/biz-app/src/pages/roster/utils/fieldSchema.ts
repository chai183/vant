/** 花名册业务字段转换；接口请求和响应适配仍由 services 负责。 */
import type {
  RosterDetailGroup,
  RosterDetailTabItem,
  RosterListFieldCode,
  RosterTeamAuthNode,
} from '@/types/employee/roster';
import {
  buildRosterTeamAuthIndex,
  filterRosterGroups,
  filterRosterTabs,
  isRosterListFieldAllowed,
} from './teamAuth';

/** 银行卡只读详情的既有补充字段，不属于手机设置字段映射。 */
const BANK_CARD_DEFAULT_FLAG = 'defaultFlag';

/** 先完成授权裁剪，再整理银行卡展示字段；不修改原始元数据。 */
function appendBankCardDefaultField(groups: RosterDetailGroup[]) {
  return groups.map((group) => {
    if (!String(group.groupCode || '').includes('.bank_card')) return group;
    const fields = (group.fields || []).filter(
      (field) => field.fieldCode !== BANK_CARD_DEFAULT_FLAG,
    );
    return {
      ...group,
      fields: [
        ...fields,
        {
          fieldCode: BANK_CARD_DEFAULT_FLAG,
          fieldName: '是否默认',
          fieldType: 'BOOLEAN',
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
      ],
    };
  });
}

/**
 * 团队已选设置 → 页面字段转换入口，不请求接口，也不引入个人设置。
 * selectedList 来自 appTeamAuthSelected；字段只按 columnName 匹配。
 * 页签、分组沿用元数据顺序，字段的 fieldMapping、类型和选项原样保留。
 */
export function createRosterFieldSchema(
  selectedList: RosterTeamAuthNode[] = [],
  ready = false,
) {
  /** 已选设置变化时创建一次索引，后续页签切换共用它。 */
  const index = buildRosterTeamAuthIndex(selectedList, ready);

  return {
    filterTabs(tabs: RosterDetailTabItem[] = []) {
      return filterRosterTabs(index, tabs);
    },
    resolveGroups(setCode: string, groups: RosterDetailGroup[] = []) {
      return appendBankCardDefaultField(
        filterRosterGroups(index, setCode, groups),
      );
    },
    isListFieldAllowed(fieldCode: RosterListFieldCode) {
      return isRosterListFieldAllowed(index, fieldCode);
    },
  };
}
