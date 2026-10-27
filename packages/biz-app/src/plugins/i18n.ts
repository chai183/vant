import type { App } from 'vue';
import { i18n } from '@/locales';

export default i18n;

export function installI18n(app: App) {
  app.use(i18n);
}
