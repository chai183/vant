import type { MockMethod } from 'vite-plugin-mock';
import type { ArchiveEditRequest } from '@/types/employeeArchive';
import { readArchiveMockState, submitArchiveEditMock } from './entity';
import { ARCHIVE_EDIT_APIS } from '@/services/api/employeeArchive/config';

export default [
  {
    url: '/api/mock/employee-archive/state',
    method: 'get',
    response: ({ query }: { query: { staffId: string; setCode: string } }) => ({
      body: readArchiveMockState(query.staffId, query.setCode),
      errorCode: '000000',
      errorMsg: '操作成功',
    }),
  },
  // 只在开发 Mock 开启时拦截；关闭后直接使用已确认的各信息集正式接口。
  ...Object.entries(ARCHIVE_EDIT_APIS).map(([setCode, api]) => ({
    url: `/api/dthr-employee/v4${api.path}`,
    method: 'post',
    response: ({ body }: { body: ArchiveEditRequest['data'] }) =>
      submitArchiveEditMock(setCode, body),
  })),
  {
    url: '/api/dthr-employee/v4/archive/info/edit',
    method: 'post',
    response: ({ body }: { body: ArchiveEditRequest['data'] }) =>
      submitArchiveEditMock(body.setCode || '', body),
  },
] as MockMethod[];
