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
  rangeInputShortcutMarginBottom?: string;
};
