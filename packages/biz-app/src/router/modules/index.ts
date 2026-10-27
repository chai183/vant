import type { RouteRecordRaw } from 'vue-router';
import dashboardRoutes from './dashboard';
import errorRoutes from './error';
import loginRoutes from './login';
import redirectRoutes from './redirect';

/**
 * 按 pages 目录结构组织的常驻路由模块
 * @description 目录与 src/pages 一一对应
 */
const constantModuleRoutes: RouteRecordRaw[] = [
  redirectRoutes,
  ...errorRoutes,
  loginRoutes,
  dashboardRoutes,
];

export default constantModuleRoutes;
