import type { Numeric } from '../utils';

export type NavBarMenuItem = {
  name?: Numeric;
  icon?: string;
  iconPrefix?: string;
  text?: string;
  color?: string;
  disabled?: boolean;
  className?: string;
  [key: PropertyKey]: any;
};

export type NavBarButton = {
  name?: Numeric;
  icon?: string;
  iconPrefix?: string;
  size?: Numeric;
  text?: string;
  color?: string;
  disabled?: boolean;
  className?: string;
  menu?: NavBarMenuItem[];
  [key: PropertyKey]: any;
};

export type NavBarThemeVars = {
  navBarHeight?: string;
  navBarBackground?: string;
  navBarArrowSize?: string;
  navBarIconColor?: string;
  navBarTextColor?: string;
  navBarTitleFontSize?: string;
  navBarTitleMinFontSize?: string;
  navBarTitleGap?: string;
  navBarTitleTextColor?: string;
  navBarSubtitleFontSize?: string;
  navBarSubtitleTextColor?: string;
  navBarZIndex?: number | string;
  navBarDisabledOpacity?: string;
  navBarButtonGap?: string;
  navBarHorizontalPadding?: string;
  navBarButtonWidth?: string;
  navBarButtonHeight?: string;
  navBarButtonIconSize?: string;
  navBarMenuZIndex?: number | string;
  navBarMenuWidth?: string;
  navBarMenuEdgeGap?: string;
  navBarMenuArrowGap?: string;
  navBarMenuArrowWidth?: string;
  navBarMenuArrowHeight?: string;
  navBarMenuArrowColor?: string;
  navBarMenuItemHeight?: string;
  navBarMenuBackground?: string;
  navBarMenuRadius?: string;
  navBarSearchHeight?: string;
  navBarSearchBackground?: string;
  navBarSearchRadius?: string;
  titleMaxWidth?: string;
};
