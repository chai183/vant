import type { ConfigProviderThemeVars } from 'vant';
import {
  getActiveThemeName,
  setActiveThemeName,
} from '@/_utils/_local-storage';

export type ThemeName = 'light' | 'dark';

const DEFAULT_THEME: ThemeName = 'light';

const activeThemeName = ref<ThemeName>(getActiveThemeName() || DEFAULT_THEME);

const themeVars = reactive<ConfigProviderThemeVars>({
  /** 对齐 vant 主题变量 --van-primary-orange */
  primaryColor: '#ff8125',
  /** 页面背景色 */
  background: '#f5f5f5',
});

const vantTheme = computed(() =>
  activeThemeName.value === 'dark' ? 'dark' : 'light',
);

function setTheme(name: ThemeName) {
  activeThemeName.value = name;
  setActiveThemeName(name);
  document.documentElement.classList.toggle('van-theme-dark', name === 'dark');
}

function initTheme() {
  setTheme(activeThemeName.value);
}

export function useTheme() {
  return {
    activeThemeName,
    themeVars,
    vantTheme,
    setTheme,
    initTheme,
  };
}
