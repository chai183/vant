import type { RouteRecordRaw } from 'vue-router';
import { createRouter } from 'vue-router';
import { routerConfig } from '@/router/config';
import { registerNavigationGuard } from '@/router/guard';
import constantModuleRoutes from '@/router/modules';
import { flatMultiLevelRoutes } from './helper';

export const constantRoutes: RouteRecordRaw[] = constantModuleRoutes;

export const dynamicRoutes: RouteRecordRaw[] = [];

export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache
    ? flatMultiLevelRoutes(constantRoutes)
    : constantRoutes,
});

export function resetRouter() {
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route;
      if (name && (meta.roles?.length || meta.permissions?.length)) {
        router.hasRoute(name) && router.removeRoute(name);
      }
    });
  } catch {
    location.reload();
  }
}

registerNavigationGuard(router);
