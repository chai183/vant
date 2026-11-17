import type { MockMethod } from 'vite-plugin-mock';
import {
  ORG_DEPT_STAFF_URL,
  ORG_TREE_URL,
} from '@/services/api/organization/org/config';
import { rosterOrgTree, rosterStaffByOrg } from './data';

function unifiedSuccess<T>(body: T) {
  return {
    body,
    data: body,
    errorCode: '000000',
    errorMsg: '操作成功',
    success: true,
  };
}

const orgMocks: MockMethod[] = [
  {
    url: `/api${ORG_TREE_URL}`,
    method: 'post',
    response: () => unifiedSuccess(rosterOrgTree),
  },
  {
    url: `/api${ORG_DEPT_STAFF_URL}`,
    method: 'post',
    // Mock 只按 orgId 回对应样本，不做 queryType / 分页筛选。
    response: ({ body }: { body?: { orgId?: string } }) => {
      const orgId = String(body?.orgId || '');
      const records = rosterStaffByOrg[orgId] || [];
      return unifiedSuccess({
        current: 1,
        pages: 1,
        size: records.length,
        records,
        total: records.length,
      });
    },
  },
];

export default orgMocks;
