import type { RouteRecordRaw } from 'vue-router';
import onboardingRoutes from './onboarding';
import rosterRoutes from './roster';
import employeeArchiveRoutes from './employeeArchive';

/**
 * 按 pages 目录组织的常驻路由
 */
const constantModuleRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/onboarding/register-form',
  },
  ...onboardingRoutes,
  ...rosterRoutes,
  ...employeeArchiveRoutes,
];

export default constantModuleRoutes;
