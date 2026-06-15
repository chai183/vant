import type { Numeric } from '../utils';

// 级联树形选项类型配置
export type CascadeTreeSelectOption = {
  text?: string;
  value?: Numeric;
  disabled?: boolean;
  dot?: boolean;
  badge?: Numeric;
  color?: string;
  className?: unknown;
  children?: CascadeTreeSelectOption[];
  [key: PropertyKey]: any;
};

// 自定义字段映射配置
export type CascadeTreeSelectFieldNames = {
  text?: string;
  value?: string;
  children?: string;
  disabled?: string;
  dot?: string;
  badge?: string;
  className?: string;
};

// 组件事件参数--配置
export type CascadeTreeSelectEventParams = {
  selectedValue: Numeric | Numeric[] | undefined;
  currentItem: CascadeTreeSelectOption;
  columnIndex: number;
  fullPathItems: CascadeTreeSelectOption[];
  selectedItems: CascadeTreeSelectOption[];
  expandPath: Numeric[];
  isLeaf: boolean;
};

export type CascadeTreeSelectThemeVars = {
  cascadeTreeSelectFontSize?: string;
  cascadeTreeSelectTextColor?: string;
  cascadeTreeSelectActiveColor?: string;
  cascadeTreeSelectDisabledColor?: string;
  cascadeTreeSelectActiveBackground?: string;
  cascadeTreeSelectItemBackground?: string;
  cascadeTreeSelectSelectedBackground?: string;
  cascadeTreeSelectOuterActiveBackground?: string;
  cascadeTreeSelectNavBackground?: string;
  cascadeTreeSelectColumnBackground?: string;
  cascadeTreeSelectContentBackground?: string;
  cascadeTreeSelectColumnWidth?: string;
  cascadeTreeSelectItemHeight?: string;
  cascadeTreeSelectItemPadding?: string;
  cascadeTreeSelectItemPaddingLeft?: string;
  cascadeTreeSelectItemPaddingRight?: string;
  cascadeTreeSelectSelectedBorderWidth?: string;
  cascadeTreeSelectSelectedBorderHeight?: string;
  cascadeTreeSelectSelectedBorderColor?: string;
  cascadeTreeSelectDotSize?: string;
  cascadeTreeSelectDotColor?: string;
  cascadeTreeSelectBadgeGap?: string;
  cascadeTreeSelectBadgeColor?: string;
  cascadeTreeSelectBadgeBackground?: string;
  cascadeTreeSelectBadgeFontSize?: string;
  cascadeTreeSelectBadgeHeight?: string;
  cascadeTreeSelectBadgePadding?: string;
};
