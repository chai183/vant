import type { ComponentPublicInstance } from 'vue';
import type { FieldChildrenProps } from './FieldChildren';

export type FieldChildrenExpose = {
  /** 在列表末尾追加一行 */
  add: () => void;
  /** 当前是否还可追加（未达 maxItems） */
  canAdd: () => boolean;
};

export type FieldChildrenInstance = ComponentPublicInstance<
  FieldChildrenProps,
  FieldChildrenExpose
>;

export type FieldChildrenThemeVars = {
  fieldChildrenItemGap?: string;
  fieldChildrenItemBorderColor?: string;
  fieldChildrenTreeGutterWidth?: string;
  fieldChildrenTreeColor?: string;
  fieldChildrenTreeLineWidth?: string;
  fieldChildrenTreeElbowY?: string;
  fieldChildrenTreeRailLength?: string;
  fieldChildrenTreeArmLength?: string;
  fieldChildrenDeleteIconColor?: string;
  fieldChildrenDeleteIconBg?: string;
  fieldChildrenDeleteIconSize?: string;
};
