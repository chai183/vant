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
} from './config';
import {
  adaptRosterContext,
  adaptRosterDetailAllSets,
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
} from './entity';
import { isRosterDetailCustomTab } from './tab';

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

/** 全量信息集字段。不传 setCode。 */
export async function getRosterDetailAllSetsApi() {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ROSTER_DETAIL_FORM_COLUMNS_URL,
    method: 'get',
  });
  return {
    ...response,
    body: response.success ? adaptRosterDetailAllSets(response.body) : [],
  } as ApiResponse<RosterDetailSet[]>;
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

/** 单条多分组信息集详情。只传 staffId。 */
export async function getRosterDetailSingleFormApi(params: {
  staffId: string;
  tabCode: string;
}) {
  const url =
    ROSTER_DETAIL_SINGLE_FORM_PATH[params.tabCode] || ROSTER_DETAIL_CUSTOM_URL;
  const response = await apiClient<ApiResponse<unknown>>({
    url,
    method: 'post',
    data: { staffId: params.staffId },
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
  const data = custom
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
      : { ...EMPTY_ROSTER_COST, ratioRows: [], amountRows: [] },
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
