import type { RouteRecordRaw } from 'vue-router';

const rosterRoutes: RouteRecordRaw[] = [
  {
    path: '/roster',
    component: () => import('@/pages/roster/index.vue'),
    name: 'EmployeeRoster',
    meta: {
      title: '员工花名册',
    },
  },
  {
    path: '/roster/org/:orgId?',
    component: () => import('@/pages/roster/org.vue'),
    name: 'EmployeeRosterOrg',
    meta: {
      title: '员工花名册',
    },
  },
  {
    path: '/roster/search',
    component: () => import('@/pages/roster/search.vue'),
    name: 'EmployeeRosterSearch',
    meta: {
      title: '员工花名册',
    },
  },
];

export default rosterRoutes;
