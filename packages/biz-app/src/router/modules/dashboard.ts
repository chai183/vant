import type { RouteRecordRaw } from 'vue-router';
import { DASHBOARD_PATH } from '@/router/config';
import { Layouts } from './layout';

const dashboardRoutes: RouteRecordRaw = {
  path: '/',
  component: Layouts,
  redirect: DASHBOARD_PATH,
  children: [
    {
      path: 'dashboard',
      component: () => import('@/pages/dashboard/index.vue'),
      name: 'Dashboard',
      meta: {
        title: '首页',
        vanIcon: 'home-o',
        affix: true,
        tabbar: true,
      },
    },
  ],
};

export default dashboardRoutes;
