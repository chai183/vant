/** 原型明确支持新增记录的信息集，按本次交互设计确定。 */
export const ARCHIVE_ADDABLE_SETS = [
  'tab_staff_education',
  'tab_staff_job_history',
];

/** 离开或切换信息集时统一提示，放弃后清除当前草稿。 */
export const ARCHIVE_DISCARD_MESSAGE =
  '离开当前页面未保存的数据将会丢失，确定离开吗？';

/** 与 PC 花名册详情 tabApi.ts 一一对应，不按接口名称推导路径。 */
export const ARCHIVE_EDIT_APIS: Record<
  string,
  { path: string; key: string; mode: 'list' | 'object' | 'basic' | 'leader' }
> = {
  tab_staff_info: {
    path: '/staff-basic/edit',
    key: 'staffBasicInfo',
    mode: 'basic',
  },
  tab_staff_education: {
    path: '/staff-education/edit',
    key: 'educationList',
    mode: 'list',
  },
  tab_staff_job_history: {
    path: '/staff-work-experience/edit',
    key: 'workExperienceList',
    mode: 'list',
  },
  tab_staff_family_member: {
    path: '/staff-family/edit',
    key: 'familyList',
    mode: 'list',
  },
  tab_staff_certificate: {
    path: '/staff-certificate/edit',
    key: 'certificateList',
    mode: 'list',
  },
  tab_staff_performance: {
    path: '/staff-performance/edit',
    key: 'performanceList',
    mode: 'list',
  },
  tab_staff_internal_concurrent: {
    path: '/staff-concurrent-position/edit',
    key: 'concurrentPositionList',
    mode: 'list',
  },
  tab_staff_benefit: {
    path: '/staff-benefit-info/edit',
    key: 'staffBenefitInfo',
    mode: 'object',
  },
  tab_staff_salary: {
    path: '/staff-salary-tax-info/edit',
    key: 'staffSalaryTaxInfo',
    mode: 'object',
  },
  tab_staff_subset_ptd: {
    path: '/staff-tax-info/edit',
    key: 'staffTaxInfo',
    mode: 'object',
  },
  dthr_staff_reporting_line: {
    path: '/staff-report/edit',
    key: 'reportingLine',
    mode: 'leader',
  },
};
