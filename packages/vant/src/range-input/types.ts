export type RangeInputShortcut = {
  label: string;
  value: string[] | number[];
};

export type RangeInputDateShortcutType =
  | 'lastWeek'
  | 'lastMonth'
  | 'lastThreeMonths';

export type RangeInputThemeVars = {
  rangeInputGap?: string;
  rangeInputSeparatorColor?: string;
  rangeInputSeparatorFontSize?: string;
  rangeInputHorizontalLineWidth?: string;
  rangeInputHorizontalLineColor?: string;
  rangeInputVerticalLineWidth?: string;
  rangeInputVerticalLineColor?: string;
  rangeInputVerticalLineMinHeight?: string;
  rangeInputShortcutColor?: string;
  rangeInputShortcutBackground?: string;
  rangeInputShortcutFontSize?: string;
  rangeInputShortcutGap?: string;
  rangeInputShortcutPaddingY?: string;
  rangeInputShortcutPaddingX?: string;
  rangeInputShortcutMarginBottom?: string;
};
