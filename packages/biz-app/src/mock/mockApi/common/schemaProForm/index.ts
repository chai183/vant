import type { MockMethod } from 'vite-plugin-mock';
import { schemaDataSourceMock as data } from './data';

/** 开发路由只返回对应样本，不在 Mock 内模拟筛选、分页。部门树复用组织模块。 */
const sources = [
  ['dthrCompanyPosition/positionList', data.position],
  ['dthrCompanyPosition/positionListOrgScope', data.position],
  ['dthrJobTitle/titleList', data.job],
  ['dthrJobCategory/page', data.jobCategory],
  ['dthrGradeSystem/gradeSystemList', data.grade],
  ['corporation/page-query', data.legalEntity],
  ['work-location/queryPage', data.workLocation],
  ['org-organization/mixed-tree', data.orgUser],
] as const;

export default [
  ...sources.map(([path, body]) => ({
    url: `/api/dthr-organization/v4/${path}`,
    method: 'post',
    response: () => ({ body, errorCode: '000000', errorMsg: '操作成功' }),
  })),
  {
    url: '/api/dthr-organization/v4/dthrGradeSystem/gradeSystemTreeById',
    method: 'get',
    response: () => ({
      body: data['grade-cascade'],
      errorCode: '000000',
      errorMsg: '操作成功',
    }),
  },
  {
    url: '/api/dthr-employee/v4/staff-roster/benefit-list',
    method: 'post',
    response: () => ({
      body: data.benefit,
      errorCode: '000000',
      errorMsg: '操作成功',
    }),
  },
] as MockMethod[];
