import type { RouterHistory } from 'vue-router';
import { createWebHashHistory, createWebHistory } from 'vue-router';

interface RouterConfig {
  history: RouterHistory;
  dynamic: boolean;
  thirdLevelRouteCache: boolean;
}

const { VITE_ROUTER_HISTORY, VITE_PUBLIC_PATH } = import.meta.env;

export const DASHBOARD_PATH = '/dashboard';
export const REDIRECT_PATH = '/redirect';

export const routerConfig: RouterConfig = {
  history:
    VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(VITE_PUBLIC_PATH)
      : createWebHistory(VITE_PUBLIC_PATH),
  dynamic: true,
  thirdLevelRouteCache: false,
};
