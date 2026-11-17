export type StepStatus = 'waiting' | 'process' | 'finish' | 'error';

export type StepThemeVars = {
  stepTextColor?: string;
  stepDescriptionColor?: string;
  stepActiveColor?: string;
  stepProcessTextColor?: string;
  stepFontSize?: string;
  stepLineColor?: string;
  stepFinishLineColor?: string;
  stepFinishTextColor?: string;
  stepIconSize?: string;
  stepCircleSize?: string;
  stepCircleColor?: string;
  stepCircleNumberSize?: string;
  stepWaitingCircleBg?: string;
  stepWaitingCircleColor?: string;
  stepErrorColor?: string;
  stepHorizontalTitleFontSize?: string;
  stepVerticalTitleFontSize?: string;
  stepVerticalContentPadding?: string;
  stepVerticalPaddingRight?: string;
  stepVerticalPaddingBottom?: string;
};
