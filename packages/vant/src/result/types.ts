export type ResultStatus = 'waiting' | 'fail' | 'warning' | 'success';

export type ResultButtonLayout = 'horizontal' | 'vertical' | 'hybrid';

export type ResultThemeVars = {
  resultPaddingTop?: string;
  resultPaddingHorizontal?: string;
  resultTitleFontSize?: string;
  resultTitleLineHeight?: string | number;
  resultTitleMarginTop?: string;
  resultContentMarginTop?: string;
  resultDescriptionColor?: string;
  resultDescriptionFontSize?: string;
  resultDescriptionLineHeight?: string | number;
  resultDescriptionMarginTop?: string;
  resultActionsMarginTop?: string;
  resultActionsGap?: string;
  resultFooterMarginTop?: string;
  resultWaitingColor?: string;
  resultFailColor?: string;
  resultWarningColor?: string;
  resultSuccessColor?: string;
  resultMainButtonColor?: string;
  resultSecondaryButtonColor?: string;
  resultSecondaryButtonBorderColor?: string;
};
