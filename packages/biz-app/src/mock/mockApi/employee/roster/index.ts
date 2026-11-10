import type { MockMethod } from 'vite-plugin-mock';
import {
  ROSTER_CONTEXT_URL,
  ROSTER_STAFF_URL,
} from '@/services/api/employee/roster/config';
import { rosterAllStaff, rosterContext } from '../../organization/org/data';

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
];

export default rosterMocks;
