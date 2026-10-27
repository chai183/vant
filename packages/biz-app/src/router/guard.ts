import type { Router } from 'vue-router';
import NProgress from 'nprogress';
import { showToast } from 'vant/es/toast';
import { setRouteChange } from '@/_composables/_useRouteListener';
import { useTitle } from '@/_composables/_useTitle';
import { usePermissionStore } from '@/pinia/stores/permission';
import { useUserStore } from '@/pinia/stores/user';
import { routerConfig } from '@/router/config';

NProgress.configure({ showSpinner: false });

const { setTitle } = useTitle();

export function registerNavigationGuard(router: Router) {
  router.beforeEach(async (to) => {
    NProgress.start();
    const userStore = useUserStore();
    const permissionStore = usePermissionStore();
    if (userStore.isGotUserInfo) return true;
    try {
      await userStore.getInfo();
      const { roles, permissions } = userStore;
      routerConfig.dynamic
        ? permissionStore.setRoutes({ roles, permissions })
        : permissionStore.setAllRoutes();
      permissionStore.addRoutes.forEach((route) => router.addRoute(route));
      return { ...to, replace: true };
    } catch (error) {
      showToast((error as Error).message || '路由守卫发生错误');
      return false;
    }
  });

  router.afterEach((to) => {
    setRouteChange(to);
    setTitle(to.meta.title);
    NProgress.done();
  });
}
