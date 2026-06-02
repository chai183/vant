import type {
  PopoverAction,
  PopoverPlacement,
  PopoverTheme,
} from '../popover/types';

export type BottomActionBarThemeVars = {
  bottomActionBarZIndex?: number | string;
  bottomActionBarBackground?: string;
  bottomActionBarTopPadding?: string;
  bottomActionBarTopBackground?: string;
  bottomActionBarTopFontSize?: string;
  bottomActionBarTopLineHeight?: number | string;
  bottomActionBarTopColor?: string;
  bottomActionBarBarHeight?: string;
  bottomActionBarBarPadding?: string;
  bottomActionBarActionGap?: string;
  bottomActionBarMoreColor?: string;
  bottomActionBarMoreIconSize?: number | string;
};

export type BottomActionBarMoreIconPosition = 'left' | 'right';

/** 「更多操作」相关配置，传入后与同名扁平 props 合并（对象字段优先） */
export type BottomActionBarMoreOptions = {
  text?: string;
  icon?: string;
  expandedIcon?: string;
  iconPosition?: BottomActionBarMoreIconPosition;
  actions?: PopoverAction[];
  placement?: PopoverPlacement;
  expandable?: boolean;
  theme?: PopoverTheme;
};
