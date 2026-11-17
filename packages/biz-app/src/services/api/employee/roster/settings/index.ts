import apiClient from '@/services/api';
import type { RosterSettingNode } from '@/types/employee/roster/settings';
import { ROSTER_TEAM_AUTH_BASIC_URL } from '@/services/api/employee/roster/config';
import { adaptRosterTeamAuthBasic } from '@/services/api/employee/roster/entity';
import { adaptRosterSettingsTree, toRosterSettingsSaveBody } from './entity';

type Response<T> = { success?: boolean; body?: T; message?: string };

/** 团队全量可选配置，后端通过 appTeamAuth 返回完整选项。 */
export async function getRosterSettingsOptionsApi() {
  const response = await apiClient<Response<unknown>>({
    url: '/dthr-base/v4/system-config/list',
    method: 'get',
    params: { type: 'appTeamAuth' },
  });
  return {
    ...response,
    body: response.success ? adaptRosterSettingsTree(response.body) : [],
  };
}

/** 保存需要携带原基础开关，移动端不编辑它。 */
export async function getRosterSettingsBasicApi() {
  const response = await apiClient<Response<unknown>>({
    url: ROSTER_TEAM_AUTH_BASIC_URL,
    method: 'get',
  });
  return {
    ...response,
    body: adaptRosterTeamAuthBasic(response.success ? response.body : null),
  };
}

export function saveRosterSettingsApi(
  selectedList: RosterSettingNode[],
  isAllowDepartmentManagerView: boolean,
) {
  return apiClient<Response<null | boolean>>({
    url: '/dthr-base/v4/system-config/team-save',
    method: 'post',
    data: toRosterSettingsSaveBody(selectedList, isAllowDepartmentManagerView),
  });
}
