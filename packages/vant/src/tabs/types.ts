import type { ComponentPublicInstance, ComputedRef } from 'vue';
import type { Numeric } from '../utils';
import type { TabsProps } from './Tabs';

export type NavOverflow = 'menu' | 'shadow';

export type TabsType = 'line' | 'card' | 'rounded' | 'underline' | 'divider';

export type TabsClickTabEventParams = {
  name: Numeric;
  title: string;
  event: MouseEvent;
  disabled: boolean;
};

export type TabsProvide = {
  id: string;
  props: TabsProps;
  setLine: () => void;
  scrollable: ComputedRef<boolean>;
  onRendered: (name: Numeric, title?: string) => void;
  currentName: ComputedRef<Numeric | undefined>;
  setTitleRefs: (index: number) => (el: unknown) => void;
  scrollIntoView: (immediate?: boolean) => void;
};

export type TabsExpose = {
  resize: () => void;
  scrollTo: (name: Numeric) => void;
};

export type TabsInstance = ComponentPublicInstance<TabsProps, TabsExpose>;

export type TabsThemeVars = {
  tabTextColor?: string;
  tabActiveTextColor?: string;
  tabDisabledTextColor?: string;
  tabFontSize?: string;
  tabLineHeight?: number | string;
  tabsDefaultColor?: string;
  tabsLineHeight?: number | string;
  tabsCardHeight?: string;
  tabsRoundedInactiveBackground?: string;
  tabsRoundedPaddingVertical?: string;
  tabsRoundedPaddingHorizontal?: string;
  tabsRoundedGap?: string;
  tabsRoundedNavBackground?: string;
  tabsRoundedNavPaddingVertical?: string;
  tabsRoundedNavPaddingHorizontal?: string;
  tabsRoundedNavRadius?: string;
  tabsNavBackground?: string;
  tabsBottomBarWidth?: string;
  tabsBottomBarHeight?: string;
  tabsBottomBarColor?: string;
  tabsUnderlineHeight?: string;
  tabsUnderlineBarWidth?: string;
  tabsUnderlineBarHeight?: string;
  tabsUnderlineInactiveTextColor?: string;
  tabsDividerNavPaddingVertical?: string;
  tabsDividerTabPaddingHorizontal?: string;
  tabsDividerNavBackground?: string;
  tabsDividerInactiveTextColor?: string;
  tabsDividerLineWidth?: string;
  tabsDividerLineHeight?: string;
  tabsDividerLineColor?: string;
  tabsNavMenuIconColor?: string;
  tabsNavMenuIconActiveColor?: string;
  tabsNavMenuBackground?: string;
  tabsNavMenuPanelPaddingHorizontal?: string;
  tabsNavMenuPadding?: string;
  tabsScrollShadowWidth?: string;
  tabsScrollShadowColor?: string;
};
