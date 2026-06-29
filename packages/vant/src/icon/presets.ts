const shareIcon = new URL('./img/share.svg', import.meta.url).href;

/** 内置 SVG 图标，见 `img/` 目录 */
export const ICON_IMAGES: Record<string, string> = {
  share: shareIcon,
};
