import stampFrame1 from './assets/stamp-frame1.svg';
import stampFrame2 from './assets/stamp-frame2.svg';

/** 单行印章外框（字数 ≤ 5），见 `assets/stamp-frame1.svg` */
export const STAMP_FRAME_URL_SINGLE_LINE = stampFrame1;

/** 换行印章外框（字数 > 5，两行），见 `assets/stamp-frame2.svg` */
export const STAMP_FRAME_URL_WRAP = stampFrame2;

/** @deprecated 请使用 `resolveStampFrameUrl`，默认等同单行外框 */
export const STAMP_FRAME_URL = stampFrame1;

/** 按印章文案行数选用外框资源（与 `Tag` 内 `formatStampLines` 一致：`lines.length >= 2` 为换行） */
export function resolveStampFrameUrl(lineCount: number): string {
  return lineCount >= 2 ? stampFrame2 : stampFrame1;
}
