import type { RouteRecordRaw } from 'vue-router';
import { REDIRECT_PATH } from '@/router/config';
import { Layouts } from './layout';

const redirectRoutes: RouteRecordRaw = {
  path: REDIRECT_PATH,
  component: Layouts,
  meta: {
    hidden: true,
  },
  children: [
    {
      path: ':path(.*)',
      component: () => import('@/pages/redirect/index.vue'),
    },
  ],
};

export default redirectRoutes;
