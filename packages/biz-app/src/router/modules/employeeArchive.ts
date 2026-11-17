import type { RouteRecordRaw } from 'vue-router';

/** 宿主 App 进入本人档案，兼容 query.id 与路径 id。 */
const employeeArchiveRoutes: RouteRecordRaw[] = [
  {
    path: '/employee-archive/:id?',
    name: 'EmployeeArchive',
    component: () => import('@/pages/employeeArchive/index.vue'),
    meta: { title: '档案详情' },
  },
];

export default employeeArchiveRoutes;
