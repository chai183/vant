import type {
  RosterSettingField,
  RosterSettingGroup,
  RosterSettingSet,
} from '@/types/roster/settings';
import {
  rosterTeamAuthAll,
  rosterTeamAuthBasic,
  rosterTeamAuthSelected,
} from '../../employee/roster/team-auth-data';

/** Mock 保留服务端元数据，使保存后的已选回读仍可驱动花名册展示。 */
type MockField = RosterSettingField & {
  columnName?: string;
  systemConfig?: Record<string, unknown>;
};
type MockGroup = Omit<RosterSettingGroup, 'fieldList'> & {
  fieldList?: MockField[];
  systemConfig?: Record<string, unknown>;
};
export type MockSettingSet = Omit<
  RosterSettingSet,
  'groupList' | 'fieldList'
> & {
  groupList?: MockGroup[];
  fieldList?: MockField[];
  systemConfig?: Record<string, unknown>;
};

/** 开发用内存状态，重启 Mock 后恢复初始样本。 */
export const rosterSettingsMockState = {
  options: JSON.parse(JSON.stringify(rosterTeamAuthAll)) as MockSettingSet[],
  selected: JSON.parse(
    JSON.stringify(rosterTeamAuthSelected),
  ) as MockSettingSet[],
  basic: { ...rosterTeamAuthBasic },
};
