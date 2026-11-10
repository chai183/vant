import type { RosterContext, RosterStaffPage } from '@/types/employee/roster';
import apiClient from '@/services/api';
import { ROSTER_CONTEXT_URL, ROSTER_STAFF_URL } from './config';
import {
  adaptRosterContext,
  adaptRosterStaffPage,
  EMPTY_ROSTER_CONTEXT,
  EMPTY_ROSTER_STAFF_PAGE,
} from './entity';

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
