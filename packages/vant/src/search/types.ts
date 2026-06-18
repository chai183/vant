import type { ComponentPublicInstance } from 'vue';
import type { SearchProps } from './Search';

export type SearchShape = 'square' | 'round';

export type SearchScene =
  | 'default'
  | 'search-page'
  | 'filter-bar'
  | 'filter-inner';

export type SearchExpose = {
  focus: () => void;
  blur: () => void;
};

export type SearchInstance = ComponentPublicInstance<SearchProps, SearchExpose>;

export type SearchThemeVars = {
  searchPadding?: string;
  searchBackground?: string;
  searchContentBackground?: string;
  searchInputHeight?: string;
  searchHeight?: string;
  searchFontSize?: string;
  searchLeftIconSize?: string;
  searchActionFontSize?: string;
  searchLabelPadding?: string;
  searchLabelColor?: string;
  searchLabelFontSize?: string;
  searchLeftIconColor?: string;
  searchActionPadding?: string;
  searchActionMarginHorizontal?: string;
  searchActionTextColor?: string;
};
