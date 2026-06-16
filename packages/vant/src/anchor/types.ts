export type AnchorThemeVars = {
  anchorRight?: string;
  anchorBottom?: string;
  anchorZIndex?: number | string;
  anchorColor?: string;
  anchorSurfaceBackground?: string;
  anchorSurfaceBorder?: string;
  anchorSurfaceIconColor?: string;
  anchorSurfaceShadow?: string;
  anchorBackground?: string;
  anchorCollapsedWidth?: string;
  anchorCollapsedHeight?: string;
  anchorBallSize?: string;
  anchorBallRight?: string;
  anchorBallBackground?: string;
  anchorBallIconColor?: string;
  anchorCollapsedIconColor?: string;
  anchorBallIconSize?: string;
  anchorBallTextSize?: string;
  anchorBallTextLineHeight?: string;
  anchorExpandedHeight?: string;
  anchorFontSize?: string;
  anchorIconSize?: string;
  anchorRadius?: string;
};

// 三种业务形态：回到顶部 / 目录 / 复数条款
export type AnchorType = 'back-top' | 'catalog' | 'terms';

// fixed：随滚动直接展开；auto：先胶囊再延时变圆球
export type AnchorMode = 'fixed' | 'auto';

// catalog 弹层项，id 对应页面内锚点元素
export type AnchorItem = {
  id: string;
  title: string;
};
