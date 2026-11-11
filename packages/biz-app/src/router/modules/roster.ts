import type { RouteRecordRaw } from 'vue-router';

const rosterRoutes: RouteRecordRaw[] = [
  {
    path: '/roster',
    component: () => import('@/pages/roster/home/index.vue'),
    name: 'EmployeeRoster',
    meta: {
      title: '员工花名册',
    },
  },
  {
    path: '/roster/org/:orgId?',
    component: () => import('@/pages/roster/org/index.vue'),
    name: 'EmployeeRosterOrg',
    meta: {
      title: '员工花名册',
    },
  },
  {
    path: '/roster/search',
    component: () => import('@/pages/roster/search/index.vue'),
    name: 'EmployeeRosterSearch',
    meta: {
      title: '员工花名册',
    },
  },
  {
    path: '/roster/staff/:staffId',
    component: () => import('@/pages/roster/detail/index.vue'),
    name: 'EmployeeRosterDetail',
    meta: {
      title: '员工详情',
    },
  },
];

export default rosterRoutes;
