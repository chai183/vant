import type { RouteRecordRaw } from 'vue-router';

const loginRoutes: RouteRecordRaw = {
  path: '/login',
  component: () => import('@/pages/login/index.vue'),
  name: 'Login',
  meta: {
    hidden: true,
    title: '登录',
  },
};

export default loginRoutes;
