import type { App } from 'vue';
import { installI18n } from './i18n';
import { installPermissionDirective } from './permission-directive';

export function installPlugins(app: App) {
  installI18n(app);
  installPermissionDirective(app);
}
