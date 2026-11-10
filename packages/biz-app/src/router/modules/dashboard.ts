import type { RouteRecordRaw } from 'vue-router';
import { DASHBOARD_PATH } from '@/router/config';

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: DASHBOARD_PATH,
  },
  {
    path: DASHBOARD_PATH,
    component: () => import('@/pages/dashboard/index.vue'),
    name: 'Dashboard',
    meta: {
      title: '首页',
      affix: true,
    },
  },
];

export default dashboardRoutes;
