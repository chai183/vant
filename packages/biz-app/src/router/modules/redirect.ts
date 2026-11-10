import type { RouteRecordRaw } from 'vue-router';
import { REDIRECT_PATH } from '@/router/config';

const redirectRoutes: RouteRecordRaw = {
  path: `${REDIRECT_PATH}/:path(.*)`,
  component: () => import('@/pages/redirect/index.vue'),
  meta: {
    hidden: true,
  },
};

export default redirectRoutes;
