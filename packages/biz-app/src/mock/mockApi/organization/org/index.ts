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
    response: ({ body }) => {
      const orgId = String(body?.orgId || '');
      const records = rosterStaffByOrg[orgId] || [];
      return unifiedSuccess({ records, total: records.length });
    },
  },
];

export default orgMocks;
