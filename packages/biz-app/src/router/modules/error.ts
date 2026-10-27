import type { RouteRecordRaw } from 'vue-router';

const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    component: () => import('@/pages/error/403.vue'),
    meta: {
      hidden: true,
    },
  },
  {
    path: '/404',
    component: () => import('@/pages/error/404.vue'),
    meta: {
      hidden: true,
    },
    alias: '/:pathMatch(.*)*',
  },
];

export default errorRoutes;
