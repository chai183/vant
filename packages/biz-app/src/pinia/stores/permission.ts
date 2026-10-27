import type { RouteRecordRaw } from 'vue-router';
import { pinia } from '@/pinia';
import { constantRoutes, dynamicRoutes } from '@/router';
import { routerConfig } from '@/router/config';
import { flatMultiLevelRoutes } from '@/router/helper';

interface UserPermissionInfo {
  roles: string[];
  permissions: string[];
}

function hasPermission(
  userPermissionInfo: UserPermissionInfo,
  route: RouteRecordRaw,
) {
  const routeRoles = route.meta?.roles;
  const routePermissions = route.meta?.permissions;
  const hasRoles = routeRoles !== undefined;
  const hasPermissions = routePermissions !== undefined;
  if (!hasRoles && !hasPermissions) return true;
  const matchedRole =
    routeRoles?.some((role) => userPermissionInfo.roles.includes(role)) ??
    false;
  const matchedPermission =
    routePermissions?.some((permission) =>
      userPermissionInfo.permissions.includes(permission),
    ) ?? false;
  return matchedRole || matchedPermission;
}

function filterDynamicRoutes(
  routes: RouteRecordRaw[],
  userPermissionInfo: UserPermissionInfo,
) {
  const res: RouteRecordRaw[] = [];
  routes.forEach((route) => {
    const tempRoute = { ...route };
    if (hasPermission(userPermissionInfo, tempRoute)) {
      if (tempRoute.children) {
        tempRoute.children = filterDynamicRoutes(
          tempRoute.children,
          userPermissionInfo,
        );
      }
      res.push(tempRoute);
    }
  });
  return res;
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const addRoutes = ref<RouteRecordRaw[]>([]);

  const setRoutes = (userPermissionInfo: UserPermissionInfo) => {
    const accessedRoutes = filterDynamicRoutes(
      dynamicRoutes,
      userPermissionInfo,
    );
    set(accessedRoutes);
  };

  const setAllRoutes = () => {
    set(dynamicRoutes);
  };

  const set = (accessedRoutes: RouteRecordRaw[]) => {
    routes.value = constantRoutes.concat(accessedRoutes);
    addRoutes.value = routerConfig.thirdLevelRouteCache
      ? flatMultiLevelRoutes(accessedRoutes)
      : accessedRoutes;
  };

  return { routes, addRoutes, setRoutes, setAllRoutes };
});

export function usePermissionStoreOutside() {
  return usePermissionStore(pinia);
}
