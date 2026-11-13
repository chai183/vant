import type {
  RosterContext,
  RosterDetailAttachTab,
  RosterDetailCostData,
  RosterDetailFormData,
  RosterDetailGrowthChange,
  RosterDetailGrowthPosition,
  RosterDetailRecord,
  RosterDetailSet,
  RosterDetailTabItem,
  RosterStaffPage,
  RosterTeamAuthConfig,
  RosterTeamAuthNode,
} from '@/types/employee/roster';
import apiClient from '@/services/api';
import {
  ROSTER_CONTEXT_URL,
  ROSTER_DETAIL_ATTACHMENT_TAB,
  ROSTER_DETAIL_ATTACHMENT_URL,
  ROSTER_DETAIL_BASIC_URL,
  ROSTER_DETAIL_COST_URL,
  ROSTER_DETAIL_CUSTOM_URL,
  ROSTER_DETAIL_FORM_COLUMNS_URL,
  ROSTER_DETAIL_GROWTH_CHANGE_URL,
  ROSTER_DETAIL_GROWTH_POSITION_URL,
  ROSTER_DETAIL_LEADER_URL,
  ROSTER_DETAIL_MULTI_RECORD_PATH,
  ROSTER_DETAIL_SINGLE_FORM_PATH,
  ROSTER_DETAIL_TABS_URL,
  ROSTER_STAFF_URL,
  ROSTER_TEAM_AUTH_BASIC_URL,
  ROSTER_TEAM_AUTH_LIST_URL,
  ROSTER_TEAM_AUTH_TYPE,
} from './config';
import {
  adaptRosterContext,
  adaptRosterDetailFormColumns,
  adaptRosterDetailAttachments,
  adaptRosterDetailBasic,
  adaptRosterDetailCost,
  adaptRosterDetailGroupedForm,
  adaptRosterDetailGrowthChanges,
  adaptRosterDetailGrowthPositions,
  adaptRosterDetailLeader,
  adaptRosterDetailRecords,
  adaptRosterDetailTabs,
  adaptRosterStaffPage,
  EMPTY_ROSTER_CONTEXT,
  EMPTY_ROSTER_COST,
  EMPTY_ROSTER_STAFF_PAGE,
  EMPTY_ROSTER_TEAM_AUTH,
  adaptRosterTeamAuthBasic,
  adaptRosterTeamAuthTree,
} from './entity';
import { isRosterDetailCustomTab } from './tab';

export { EMPTY_ROSTER_TEAM_AUTH };

interface ApiResponse<T> {
  success?: boolean;
  body?: T;
  message?: string;
  errorMsg?: string;
}

/** 我的部门、是否组织负责人、常用联系人 */
export async function getRosterContextApi() {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_CONTEXT_URL,
    method: 'post',
  });
  return {
    ...response,
    body: response.success
      ? adaptRosterContext(response.body)
      : { ...EMPTY_ROSTER_CONTEXT, contacts: [] },
  } as ApiResponse<RosterContext>;
}

/** 花名册展示只读取团队已选字段，不依赖全量字段或个人设置。 */
export async function getRosterTeamAuthSelectedApi() {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_TEAM_AUTH_LIST_URL,
    method: 'get',
    params: { type: ROSTER_TEAM_AUTH_TYPE.selected },
  });
  return {
    ...response,
    body: response.success ? adaptRosterTeamAuthTree(response.body) : [],
  } as ApiResponse<RosterTeamAuthNode[]>;
}

/** 后续花名册设置页使用：基础开关、全量选项和团队已选一次拉齐。 */
export async function getRosterTeamAuthApi() {
  const [basicRes, allRes, selectedRes] = await Promise.all([
    apiClient<ApiResponse<unknown>>({
      url: ROSTER_TEAM_AUTH_BASIC_URL,
      method: 'get',
    }),
    apiClient<ApiResponse<unknown>>({
      url: ROSTER_TEAM_AUTH_LIST_URL,
      method: 'get',
      params: { type: ROSTER_TEAM_AUTH_TYPE.all },
    }),
    getRosterTeamAuthSelectedApi(),
  ]);
  const success = Boolean(
    basicRes.success || allRes.success || selectedRes.success,
  );
  const selectedOk = Boolean(selectedRes.success);
  const body: RosterTeamAuthConfig = {
    isAllowDepartmentManagerView: basicRes.success
      ? adaptRosterTeamAuthBasic(basicRes.body).isAllowDepartmentManagerView
      : EMPTY_ROSTER_TEAM_AUTH.isAllowDepartmentManagerView,
    allList: allRes.success ? adaptRosterTeamAuthTree(allRes.body) : [],
    selectedList: selectedRes.body || [],
  };
  return {
    ...selectedRes,
    success,
    selectedOk,
    body,
  } as ApiResponse<RosterTeamAuthConfig> & { selectedOk: boolean };
}

/** 搜索用的人员全量。正式搜索接口接上后替换。 */
export async function getRosterStaffApi() {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_STAFF_URL,
    method: 'post',
  });
  return {
    ...response,
    body: response.success
      ? adaptRosterStaffPage(response.body)
      : { ...EMPTY_ROSTER_STAFF_PAGE },
  } as ApiResponse<RosterStaffPage>;
}

/** 详情页签集合。无入参。 */
export async function getRosterDetailTabsApi() {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_TABS_URL,
    method: 'get',
  });
  return {
    ...response,
    body: response.success ? adaptRosterDetailTabs(response.body) : [],
  } as ApiResponse<RosterDetailTabItem[]>;
}

/** 当前 Tab 的分组字段。GET，查询参数 setCode。 */
export async function getRosterDetailFormColumnsApi(params: {
  setCode: string;
}) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_FORM_COLUMNS_URL,
    method: 'get',
    params: { setCode: params.setCode },
  });
  return {
    ...response,
    body: response.success
      ? adaptRosterDetailFormColumns(response.body, params.setCode)
      : { setCode: params.setCode || '', setName: '', groups: [] },
  } as ApiResponse<RosterDetailSet>;
}

/** 基础信息详情。只传 staffId。 */
export async function getRosterDetailBasicApi(params: { staffId: string }) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_BASIC_URL,
    method: 'post',
    data: params,
  });
  return {
    ...response,
    body: response.success ? adaptRosterDetailBasic(response.body) : {},
  } as ApiResponse<RosterDetailFormData>;
}

/** 单条多分组详情。固定接口只传 staffId，通用接口另传 setCode。 */
export async function getRosterDetailSingleFormApi(params: {
  staffId: string;
  tabCode: string;
}) {
  const url =
    ROSTER_DETAIL_SINGLE_FORM_PATH[params.tabCode] || ROSTER_DETAIL_CUSTOM_URL;
  const response = await apiClient<ApiResponse<unknown>>({
    url,
    method: 'post',
    data:
      url === ROSTER_DETAIL_CUSTOM_URL
        ? { setCode: params.tabCode, staffId: params.staffId }
        : { staffId: params.staffId },
  });
  return {
    ...response,
    body: adaptRosterDetailGroupedForm(response.success ? response.body : null),
  } as ApiResponse<RosterDetailFormData>;
}

/** 多行信息集详情。固定信息集只传 staffId；自定义传 setCode + staffId。 */
export async function getRosterDetailMultiRecordApi(params: {
  staffId: string;
  tabCode: string;
  builtin?: number;
}) {
  const custom = isRosterDetailCustomTab(params.tabCode, params.builtin);
  const url = custom
    ? ROSTER_DETAIL_CUSTOM_URL
    : ROSTER_DETAIL_MULTI_RECORD_PATH[params.tabCode] ||
      ROSTER_DETAIL_CUSTOM_URL;
  // 是否传 setCode 取决于实际请求的接口，而不是 builtin 标记。
  const data =
    url === ROSTER_DETAIL_CUSTOM_URL
      ? { setCode: params.tabCode, staffId: params.staffId }
      : { staffId: params.staffId };
  const response = await apiClient<ApiResponse<unknown>>({
    url,
    method: 'post',
    data,
  });
  return {
    ...response,
    body: response.success ? adaptRosterDetailRecords(response.body) : [],
  } as ApiResponse<RosterDetailRecord[]>;
}

/** 直属领导详情。只传 staffId。 */
export async function getRosterDetailLeaderApi(params: { staffId: string }) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_LEADER_URL,
    method: 'post',
    data: params,
  });
  return {
    ...response,
    body: response.success ? adaptRosterDetailLeader(response.body) : {},
  } as ApiResponse<RosterDetailFormData>;
}

/** 成长记录-异动。正式接口未出，先走占位。 */
export async function getRosterDetailGrowthChangeApi(params: {
  staffId: string;
}) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_GROWTH_CHANGE_URL,
    method: 'post',
    data: params,
  });
  return {
    ...response,
    body: response.success ? adaptRosterDetailGrowthChanges(response.body) : [],
  } as ApiResponse<RosterDetailGrowthChange[]>;
}

/** 成长记录-企业内任职。正式接口未出，先走占位。 */
export async function getRosterDetailGrowthPositionApi(params: {
  staffId: string;
}) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_GROWTH_POSITION_URL,
    method: 'post',
    data: params,
  });
  return {
    ...response,
    body: response.success
      ? adaptRosterDetailGrowthPositions(response.body)
      : [],
  } as ApiResponse<RosterDetailGrowthPosition[]>;
}

/** 员工成本中心。正式接口未出，先走占位。 */
export async function getRosterDetailCostApi(params: { staffId: string }) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_COST_URL,
    method: 'post',
    data: params,
  });
  return {
    ...response,
    body: response.success
      ? adaptRosterDetailCost(response.body)
      : { ...EMPTY_ROSTER_COST },
  } as ApiResponse<RosterDetailCostData>;
}

/** 附件。正式接口未出，先走占位。 */
export async function getRosterDetailAttachmentApi(params: {
  staffId: string;
}) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_ATTACHMENT_URL,
    method: 'post',
    data: { staffId: params.staffId, code: ROSTER_DETAIL_ATTACHMENT_TAB },
  });
  return {
    ...response,
    body: response.success ? adaptRosterDetailAttachments(response.body) : [],
  } as ApiResponse<RosterDetailAttachTab[]>;
}
