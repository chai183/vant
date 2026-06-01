/** 判断关键字配置是否包含有效项（用于决定是否使用 Highlight 渲染对应文案） */
export function optionHasHighlightKeywords(keywords?: string | string[]) {
  if (keywords === undefined) {
    return false;
  }
  if (Array.isArray(keywords)) {
    return keywords.some((k) => k != null && String(k).length > 0);
  }
  return String(keywords).length > 0;
}

export type FieldSelectPopupOption = {
  text: string;
  value: string | number;
  /** 需在主文案 `text` 中高亮的关键字，传给 Highlight 的 `keywords` */
  highlightKeywords?: string | string[];
  /** 列表第二行展示文案 */
  subText?: string;
  /** 在 `subText` 中高亮的关键字 */
  subTextHighlightKeywords?: string | string[];
  /** 列表第三行展示文案 */
  content?: string;
  /** 在 `content` 中高亮的关键字 */
  contentHighlightKeywords?: string | string[];
  /** 列表辅助描述（较小字号、次要色，最多两行） */
  desc?: string;
  /** 在 `desc` 中高亮的关键字 */
  descHighlightKeywords?: string | string[];
  /** When true, the option cannot be selected (list + grid). */
  disabled?: boolean;
};

export type FieldSelectPopupThemeVars = {
  fieldSelectPopupDisplayColor?: string;
  fieldSelectPopupDisplayPlaceholderColor?: string;
  fieldSelectPopupDisplayFontSize?: string;
  fieldSelectPopupHeaderHeight?: string;
  fieldSelectPopupTitleFontSize?: string;
  fieldSelectPopupTitleFontWeight?: string;
  fieldSelectPopupHeaderBtnFontSize?: string;
  fieldSelectPopupHeaderBtnColor?: string;
  fieldSelectPopupHeaderConfirmColor?: string;
  fieldSelectPopupBodyMaxHeight?: string;
  fieldSelectPopupItemPadding?: string;
  fieldSelectPopupGridGap?: string;
  fieldSelectPopupTileRadius?: string;
  fieldSelectPopupTileBorderColor?: string;
  fieldSelectPopupTileActiveColor?: string;
  fieldSelectPopupTileActiveBorderColor?: string;
};
