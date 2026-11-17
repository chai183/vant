export type TagSize = 'large' | 'medium';

export type TagType =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type TagPreset =
  | 'risk-high'
  | 'risk-medium-high'
  | 'risk-medium'
  | 'risk-low'
  | 'risk-medium-low'
  | 'risk-new'
  | 'risk-selected'
  | 'product-bill'
  | 'product-finance'
  | 'product-deposit'
  | 'product-payroll';

export type TagStampType = 'success' | 'fail' | 'wait' | 'void';

export type TagThemeVars = {
  tagPadding?: string;
  tagTextColor?: string;
  tagFontSize?: string;
  tagRadius?: string;
  tagHeight?: string;
  tagMarkHeight?: string;
  tagMarkPadding?: string;
  tagMarkRadius?: string;
  tagLineHeight?: number | string;
  tagMediumPadding?: string;
  tagLargePadding?: string;
  tagLargeRadius?: string;
  tagLargeFontSize?: string;
  tagRoundRadius?: string;
  tagDangerColor?: string;
  tagPrimaryColor?: string;
  tagSuccessColor?: string;
  tagWarningColor?: string;
  tagDefaultColor?: string;
  tagInfoColor?: string;
  tagPlainDefaultBackground?: string;
  tagPlainSuccessBackground?: string;
  tagPlainDangerBackground?: string;
  tagPlainInfoBackground?: string;
  tagCurrencyBackground?: string;
  tagCurrencyTextColor?: string;
  tagPlainBackground?: string;
  tagStampSize?: string;
};
