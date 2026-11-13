import type { MockMethod } from 'vite-plugin-mock';
import {
  ROSTER_CONTEXT_URL,
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
} from '@/services/api/employee/roster/config';
import { rosterAllStaff, rosterContext } from '../../organization/org/data';
import {
  rosterDetailAttachments,
  rosterDetailBasicFormData,
  rosterDetailCostData,
  rosterDetailFormColumns,
  rosterDetailGrowthChangeRecords,
  rosterDetailGrowthPositionRecords,
  rosterDetailLeaderDetail,
  rosterDetailMultiRecordByTab,
  rosterDetailSingleFormByTab,
  rosterDetailTabs,
} from './detail-data';
import {
  rosterTeamAuthAll,
  rosterTeamAuthBasic,
  rosterTeamAuthSelected,
} from './team-auth-data';

function unifiedSuccess<T>(body: T) {
  return {
    body,
    data: body,
    errorCode: '000000',
    errorMsg: '操作成功',
    success: true,
  };
}

const rosterMocks: MockMethod[] = [
  {
    url: `/api${ROSTER_CONTEXT_URL}`,
    method: 'post',
    response: () => unifiedSuccess(rosterContext),
  },
  {
    url: `/api${ROSTER_STAFF_URL}`,
    method: 'post',
    response: () =>
      unifiedSuccess({ records: rosterAllStaff, total: rosterAllStaff.length }),
  },
  {
    url: `/api${ROSTER_DETAIL_TABS_URL}`,
    method: 'get',
    response: () => unifiedSuccess(rosterDetailTabs),
  },
  {
    url: `/api${ROSTER_DETAIL_FORM_COLUMNS_URL}`,
    method: 'get',
    // 按当前 Tab 的 setCode 返回这一页字段
    response: ({ query }: { query?: { setCode?: string } }) => {
      const code = String(query?.setCode || '');
      if (!code) return unifiedSuccess(rosterDetailFormColumns);
      const matched = rosterDetailFormColumns.find(
        (item) => item.setCode === code,
      );
      return unifiedSuccess(matched ? [matched] : []);
    },
  },
  {
    url: `/api${ROSTER_DETAIL_BASIC_URL}`,
    method: 'post',
    response: () => unifiedSuccess(rosterDetailBasicFormData),
  },
  {
    url: `/api${ROSTER_DETAIL_LEADER_URL}`,
    method: 'post',
    response: () => unifiedSuccess(rosterDetailLeaderDetail),
  },
  {
    url: `/api${ROSTER_DETAIL_CUSTOM_URL}`,
    method: 'post',
    response: () => unifiedSuccess(rosterDetailMultiRecordByTab.LICENSE),
  },
  ...Object.entries(ROSTER_DETAIL_MULTI_RECORD_PATH).map(([tabCode, path]) => ({
    url: `/api${path}`,
    method: 'post' as const,
    response: () => unifiedSuccess(rosterDetailMultiRecordByTab[tabCode] || []),
  })),
  ...Object.entries(ROSTER_DETAIL_SINGLE_FORM_PATH).map(([tabCode, path]) => ({
    url: `/api${path}`,
    method: 'post' as const,
    response: () => unifiedSuccess(rosterDetailSingleFormByTab[tabCode] || {}),
  })),
  {
    url: `/api${ROSTER_DETAIL_GROWTH_CHANGE_URL}`,
    method: 'post',
    // 成长记录异动：Mock 不按 staffId 过滤
    response: () =>
      unifiedSuccess({
        records: rosterDetailGrowthChangeRecords,
        total: rosterDetailGrowthChangeRecords.length,
      }),
  },
  {
    url: `/api${ROSTER_DETAIL_GROWTH_POSITION_URL}`,
    method: 'post',
    // 成长记录任职：Mock 不按 staffId 过滤
    response: () =>
      unifiedSuccess({
        records: rosterDetailGrowthPositionRecords,
        total: rosterDetailGrowthPositionRecords.length,
      }),
  },
  {
    url: `/api${ROSTER_DETAIL_COST_URL}`,
    method: 'post',
    // 成本中心：Mock 不按 staffId 过滤
    response: () => unifiedSuccess(rosterDetailCostData),
  },
  {
    url: `/api${ROSTER_TEAM_AUTH_BASIC_URL}`,
    method: 'get',
    response: () => unifiedSuccess(rosterTeamAuthBasic),
  },
  {
    url: `/api${ROSTER_TEAM_AUTH_LIST_URL}`,
    method: 'get',
    response: ({ query }: { query?: { type?: string } }) => {
      const data =
        query?.type === ROSTER_TEAM_AUTH_TYPE.selected
          ? rosterTeamAuthSelected
          : rosterTeamAuthAll;
      return unifiedSuccess({
        code: '200',
        msg: '操作成功',
        data,
      });
    },
  },
  {
    url: `/api${ROSTER_DETAIL_ATTACHMENT_URL}`,
    method: 'post',
    // 附件：Mock 不按 staffId / code 过滤
    response: () =>
      unifiedSuccess({
        formData: {},
        attachments: rosterDetailAttachments,
      }),
  },
];

export default rosterMocks;
