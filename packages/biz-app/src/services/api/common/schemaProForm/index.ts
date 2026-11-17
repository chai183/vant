import apiClient from '@/services/api';
import { ORGANIZATION_API_PREFIX as ORG } from '@/services/api/organization/config';
import { API_PREFIX as EMPLOYEE } from '@/services/api/employee/config';

/** 公共表单固定请求集合，路径及默认参数与 PC dataSource.config 保持一致。 */
export async function getSchemaDataSourceApi(
  source: string,
  params: Record<string, unknown> = {},
) {
  const ids = (
    Array.isArray(params.ids)
      ? params.ids
      : params.ids == null || params.ids === ''
        ? []
        : [params.ids]
  )
    .map((id) => String(id).trim())
    .filter(Boolean);
  const requests: Record<
    string,
    { url: string; method?: 'get' | 'post'; data?: unknown; params?: unknown }
  > = {
    department: {
      url: `${ORG}/org-organization/tree`,
      data: { mode: 'simple', status: 1, ...params },
    },
    position: {
      url: `${ORG}/dthrCompanyPosition/${ids.length ? 'positionListOrgScope' : 'positionList'}`,
      data: ids.length ? { ids } : {},
    },
    job: { url: `${ORG}/dthrJobTitle/titleList` },
    jobCategory: { url: `${ORG}/dthrJobCategory/page` },
    grade: { url: `${ORG}/dthrGradeSystem/gradeSystemList` },
    'grade-cascade': {
      url: `${ORG}/dthrGradeSystem/gradeSystemTreeById`,
      method: 'get',
      params,
    },
    legalEntity: {
      url: `${ORG}/corporation/page-query`,
      data: { pageNum: 1, pageSize: 9999, ...params },
    },
    workLocation: {
      url: `${ORG}/work-location/queryPage`,
      data: { pageNum: 1, pageSize: 9999, ...params },
    },
    benefit: { url: `${EMPLOYEE}/staff-roster/benefit-list` },
    orgUser: { url: `${ORG}/org-organization/mixed-tree` },
    // 既有开发示例；并非 PC 正式固定数据源。
    skillTags: {
      url: '/dthr-employee/v4/schema-data-source/skill-tags/options',
      data: params,
    },
  };
  const request = requests[source];
  if (!request) throw new Error(`未注册的表单数据源：${source}`);
  const response = await apiClient<{
    success?: boolean;
    body?: unknown;
    message?: string;
  }>({
    method: 'post',
    data: {},
    ...request,
  });
  if (!response.success)
    throw new Error(response.message || '选项加载失败，请重试');
  return response.body ?? [];
}
