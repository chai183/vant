import type { ConfigProviderThemeVars } from 'vant/es/config-provider/types';
import {
  getActiveThemeName,
  setActiveThemeName,
} from '@/_utils/_local-storage';

export type ThemeName = 'light' | 'dark';

const DEFAULT_THEME: ThemeName = 'light';

const activeThemeName = ref<ThemeName>(getActiveThemeName() || DEFAULT_THEME);

const themeVars = reactive<ConfigProviderThemeVars>({
  primaryColor: '#1989fa',
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
