import apiClient from '@/services/api';
import {
  ROSTER_DETAIL_FORM_COLUMNS_URL,
  ROSTER_DETAIL_BASIC_URL,
  ROSTER_DETAIL_LEADER_URL,
  ROSTER_DETAIL_CUSTOM_URL,
  ROSTER_DETAIL_MULTI_RECORD_PATH,
  ROSTER_DETAIL_SINGLE_FORM_PATH,
} from '@/services/api/employee/roster/config';
import type {
  ArchiveSubmission,
  ArchiveWorkflow,
  ArchiveSchema,
  ArchiveRecord,
} from '@/types/employeeArchive';
import {
  adaptArchivePermissions,
  adaptArchiveSchema,
  adaptArchiveWorkflow,
  adaptArchiveRecords,
  buildArchiveEditRequest,
} from './entity';
import { getRosterDetailTabKind } from '@/services/api/employee/roster/tab';

type Response<T> = { success?: boolean; body?: T; message?: string };

export async function getArchiveSchemaApi(setCode: string) {
  const response = await apiClient<Response<unknown>>({
    url: ROSTER_DETAIL_FORM_COLUMNS_URL,
    method: 'get',
    params: { setCode },
  });
  return {
    ...response,
    body: adaptArchiveSchema(response.success ? response.body : [], setCode),
  };
}

/** 只读取 PC 个人授权，person-save 是管理配置接口，员工修改不调用它。 */
export async function getArchivePermissionsApi() {
  const response = await apiClient<Response<unknown>>({
    url: '/dthr-base/v4/system-config/list',
    method: 'get',
    params: { type: 'appPersonalAuth' },
  });
  return {
    ...response,
    body: response.success ? adaptArchivePermissions(response.body) : [],
  };
}

/** 临时开发 Mock：正式本人档案状态接口待提供。 */
export async function getArchiveWorkflowApi(staffId: string, setCode: string) {
  const response = await apiClient<Response<ArchiveWorkflow>>({
    url: '/mock/employee-archive/state',
    method: 'get',
    params: { staffId, setCode },
  });
  return {
    ...response,
    body: adaptArchiveWorkflow(response.success ? response.body : undefined),
  };
}

/** 原详情路径不变；保留原记录及分组 ID，避免展示适配打平后丢失保存标识。 */
export async function getArchiveRecordsApi(
  staffId: string,
  schema: ArchiveSchema,
) {
  const kind = getRosterDetailTabKind(schema.setCode);
  const url =
    kind === 'basic'
      ? ROSTER_DETAIL_BASIC_URL
      : kind === 'leader'
        ? ROSTER_DETAIL_LEADER_URL
        : ROSTER_DETAIL_SINGLE_FORM_PATH[schema.setCode] ||
          ROSTER_DETAIL_MULTI_RECORD_PATH[schema.setCode] ||
          ROSTER_DETAIL_CUSTOM_URL;
  const response = await apiClient<Response<unknown>>({
    url,
    method: 'post',
    data:
      url === ROSTER_DETAIL_CUSTOM_URL
        ? { staffId, setCode: schema.setCode }
        : { staffId },
  });
  const rows =
    response.success && response.body && typeof response.body === 'object'
      ? Array.isArray(response.body)
        ? response.body
        : [response.body]
      : [];
  return {
    ...response,
    body: adaptArchiveRecords(schema, rows as Record<string, unknown>[]),
  };
}

/** 后端已确认：本人档案沿用 PC 各信息集的独立编辑接口和请求体。 */
export function submitArchiveApi(
  submission: ArchiveSubmission,
  schema: ArchiveSchema,
  records: ArchiveRecord[],
  builtin?: number,
) {
  const request = buildArchiveEditRequest(submission, schema, records, builtin);
  return apiClient<Response<boolean>>({
    url: request.url,
    method: 'post',
    data: request.data,
  });
}
