import { createI18n } from 'vue-i18n';
import { getActiveLocale } from '@/_utils/_local-storage';
import en from './en';
import zh from './zh';

export const localeList = [
  { title: '简体中文', name: 'zh' },
  { title: 'English', name: 'en' },
] as const;

export type LocaleName = (typeof localeList)[number]['name'];

const DEFAULT_LOCALE: LocaleName = 'zh';

function resolveLocale(): LocaleName {
  const saved = getActiveLocale() as string | null;
  if (!saved || saved === 'zh-cn') return DEFAULT_LOCALE;
  if (saved === 'zh' || saved === 'en') return saved;
  return DEFAULT_LOCALE;
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    zh,
    en,
  },
});
