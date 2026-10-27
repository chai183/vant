import type { App, Directive } from 'vue';
import { isArray } from '@/_utils/_validate';
import { useUserStore } from '@/pinia/stores/user';

const permission: Directive = {
  mounted(el, binding) {
    const { value: rolesOrPermissions } = binding;
    const { roles, permissions } = useUserStore();
    if (isArray(rolesOrPermissions) && rolesOrPermissions.length > 0) {
      const hasPermission =
        roles.some((role) => rolesOrPermissions.includes(role)) ||
        permissions.some((permission) =>
          rolesOrPermissions.includes(permission),
        );
      hasPermission || el.parentNode?.removeChild(el);
    } else {
      throw new Error(
        `参数必须是一个数组且长度大于 0，参考：v-permission="['admin', 'permission:button-level']"`,
      );
    }
  },
};

export function installPermissionDirective(app: App) {
  app.directive('permission', permission);
}
