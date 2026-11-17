import type { ComponentPublicInstance, Ref } from 'vue';
import type { Numeric } from '../utils';
import type { IndexBarProps } from './IndexBar';

// IndexAnchor 通过 INDEX_BAR_KEY 注入
export type IndexBarProvide = {
  props: IndexBarProps;
  search: Ref<string>; // 与 v-model:search 同步
};

export type IndexBarExpose = {
  scrollTo: (index: Numeric) => void;
};

export type IndexBarInstance = ComponentPublicInstance<
  IndexBarProps,
  IndexBarExpose
>;

export type IndexBarThemeVars = {
  indexBarSidebarZIndex?: number | string;
  indexBarBubbleImage?: string;
  indexBarIndexFontSize?: string;
  indexBarIndexLineHeight?: number | string;
};
