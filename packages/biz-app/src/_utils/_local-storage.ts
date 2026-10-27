import type { ThemeName } from '@/_composables/_useTheme';
import type { SidebarClosed, SidebarOpened } from '@/_constants/_app-key';
import type { LayoutsConfig } from '@/layouts/config';
import type { LocaleName } from '@/locales';
import type { TagView } from '@/pinia/stores/tags-view';
import { CacheKey } from '@/_constants/_cache-key';

// #region Token
export function getToken() {
  return localStorage.getItem(CacheKey.TOKEN);
}

export function setToken(token: string) {
  localStorage.setItem(CacheKey.TOKEN, token);
}

export function removeToken() {
  localStorage.removeItem(CacheKey.TOKEN);
}
// #endregion

// #region 系统布局配置
export function getLayoutsConfig() {
  const json = localStorage.getItem(CacheKey.CONFIG_LAYOUT);
  return json ? (JSON.parse(json) as LayoutsConfig) : null;
}

export function setLayoutsConfig(settings: LayoutsConfig) {
  localStorage.setItem(CacheKey.CONFIG_LAYOUT, JSON.stringify(settings));
}

export function removeLayoutsConfig() {
  localStorage.removeItem(CacheKey.CONFIG_LAYOUT);
}
// #endregion

// #region 侧边栏状态
export function getSidebarStatus() {
  return localStorage.getItem(CacheKey.SIDEBAR_STATUS);
}

export function setSidebarStatus(sidebarStatus: SidebarOpened | SidebarClosed) {
  localStorage.setItem(CacheKey.SIDEBAR_STATUS, sidebarStatus);
}
// #endregion

// #region 主题
export function getActiveThemeName() {
  return localStorage.getItem(CacheKey.ACTIVE_THEME_NAME) as ThemeName | null;
}

export function setActiveThemeName(themeName: ThemeName) {
  localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, themeName);
}
// #endregion

// #region 语言
export function getActiveLocale() {
  return localStorage.getItem(CacheKey.ACTIVE_LOCALE) as LocaleName | null;
}

export function setActiveLocale(locale: LocaleName) {
  localStorage.setItem(CacheKey.ACTIVE_LOCALE, locale);
}
// #endregion

// #region 标签栏
export function getVisitedViews() {
  const json = localStorage.getItem(CacheKey.VISITED_VIEWS);
  return JSON.parse(json ?? '[]') as TagView[];
}

export function setVisitedViews(views: TagView[]) {
  views.forEach((view) => {
    delete view.matched;
    delete view.redirectedFrom;
  });
  localStorage.setItem(CacheKey.VISITED_VIEWS, JSON.stringify(views));
}

export function getCachedViews() {
  const json = localStorage.getItem(CacheKey.CACHED_VIEWS);
  return JSON.parse(json ?? '[]') as string[];
}

export function setCachedViews(views: string[]) {
  localStorage.setItem(CacheKey.CACHED_VIEWS, JSON.stringify(views));
}
// #endregion
