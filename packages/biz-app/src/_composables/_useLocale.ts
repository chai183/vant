import { Locale } from 'vant/es/locale';
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';
import { setActiveLocale } from '@/_utils/_local-storage';
import { i18n, type LocaleName } from '@/locales';

const vantLocaleMap = {
  zh: zhCN,
  en: enUS,
} as const;

function setLocale(name: LocaleName) {
  i18n.global.locale.value = name;
  setActiveLocale(name);
  Locale.use(name === 'en' ? 'en-US' : 'zh-CN', vantLocaleMap[name]);
}

function initLocale() {
  setLocale(i18n.global.locale.value as LocaleName);
}

export function useLocale() {
  return { setLocale, initLocale };
}
