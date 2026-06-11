import { createNamespace } from '../utils';
import { isImageFile } from '../uploader/utils';
import type { UploaderFileListItem } from '../uploader/types';
import { FILE_TYPE_ICONS, type FileTypeIcon } from './presets';

const [, bem] = createNamespace('uploader-file');

export { bem };

export type UploaderFileEntry = UploaderFileListItem & {
  /** 重命名后的展示文件名 */
  displayName?: string;
  /** 无 File 对象时的文件大小，单位 byte */
  fileSize?: number;
};

/** 展示用文件名：displayName > file.name > 从 url 解析的最后一段 */
export function getFileName(item: UploaderFileListItem): string {
  const listItem = item as UploaderFileEntry;
  if (listItem.displayName) {
    return listItem.displayName;
  }
  if (item.file?.name) {
    return item.file.name;
  }
  if (item.url) {
    const parts = item.url.split(/[/?#]/);
    return parts[parts.length - 1] || item.url;
  }
  return '';
}

export function getFileExtension(name: string): string {
  const index = name.lastIndexOf('.');
  if (index < 0) {
    return '';
  }
  return name.slice(index + 1).toLowerCase();
}

/** 中间省略时插入的占位符（四个点，视觉上接近省略号） */
export const UPLOADER_FILE_NAME_ELLIPSIS_DOTS = '....';

/** 读取元素计算后的 font 简写，供 canvas measureText 使用 */
export function getElementFont(el: HTMLElement): string {
  const style = window.getComputedStyle(el);
  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

/** 基于 canvas measureText 的宽度测量函数，需传入与 DOM 一致的 font */
export function createTextWidthMeasurer(font: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  return (text: string) => {
    context.font = font;
    return context.measureText(text).width;
  };
}

/**
 * 按像素宽度做「中间省略」：保留首尾字符，中间用 dots 连接。
 * 通过二分在左右两段上收缩，使 measureWidth(结果) <= maxWidth。
 */
export function calcMiddleEllipsis(
  content: string,
  maxWidth: number,
  dots: string,
  measureWidth: (text: string) => number,
): string {
  if (!content || maxWidth <= 0 || measureWidth(content) <= maxWidth) {
    return content;
  }

  const end = content.length;
  const middle = end >> 1;

  // 左右区间各自二分，直到无法再缩短
  const middleTail = (
    leftPart: [number, number],
    rightPart: [number, number],
  ): string => {
    if (
      leftPart[1] - leftPart[0] <= 1 &&
      rightPart[1] - rightPart[0] <= 1
    ) {
      return (
        content.slice(0, leftPart[0]) +
        dots +
        content.slice(rightPart[1], end)
      );
    }

    const leftMiddle = Math.floor((leftPart[0] + leftPart[1]) / 2);
    const rightMiddle = Math.ceil((rightPart[0] + rightPart[1]) / 2);
    const result =
      content.slice(0, leftMiddle) + dots + content.slice(rightMiddle, end);

    if (measureWidth(result) > maxWidth) {
      return middleTail(
        [leftPart[0], leftMiddle],
        [rightMiddle, rightPart[1]],
      );
    }

    return middleTail(
      [leftMiddle, leftPart[1]],
      [rightPart[0], rightMiddle],
    );
  };

  return middleTail([0, middle], [middle, end]);
}

export function isFileNameEllipsised(
  fullName: string,
  displayName: string,
): boolean {
  return !!fullName && displayName !== fullName;
}

const EXTENSION_ICON_MAP: Record<string, FileTypeIcon> = {
  doc: 'word',
  docx: 'word',
  docm: 'word',
  wps: 'word',
  xls: 'excel',
  xlsx: 'excel',
  xlsm: 'excel',
  csv: 'excel',
  mp4: 'mp4',
  avi: 'mp4',
  mov: 'mp4',
  mkv: 'mp4',
  webm: 'mp4',
  wmv: 'mp4',
  flv: 'mp4',
  m4v: 'mp4',
  '3gp': 'mp4',
  jpg: 'picture',
  jpeg: 'picture',
  png: 'picture',
  gif: 'picture',
  bmp: 'picture',
  webp: 'picture',
  svg: 'picture',
  jfif: 'picture',
  avif: 'picture',
  dpg: 'picture',
  heic: 'picture',
  txt: 'txt',
  md: 'txt',
  log: 'txt',
  rtf: 'txt',
  zip: 'zip',
  rar: 'zip',
  '7z': 'zip',
  tar: 'zip',
  gz: 'zip',
  bz2: 'zip',
  xz: 'zip',
};

function isPictureFile(item: UploaderFileListItem): boolean {
  const ext = getFileExtension(getFileName(item));
  return isImageFile(item) || EXTENSION_ICON_MAP[ext] === 'picture';
}

/** 根据扩展名返回列表项左侧 SVG 图标地址，未匹配到已知类型时使用 unknown */
export function getFileTypeIcon(item: UploaderFileListItem): string {
  if (item.status === 'failed' && isPictureFile(item)) {
    return FILE_TYPE_ICONS['picture-wrong'];
  }

  const ext = getFileExtension(getFileName(item));
  const iconKey = EXTENSION_ICON_MAP[ext] || 'unknown';
  return FILE_TYPE_ICONS[iconKey];
}

export const UPLOADER_FILE_STATUS_TEXTS = {
  waiting: '等待上传',
  uploading: '上传中',
  failed: '上传失败',
  reupload: '重新上传',
} as const;

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function formatFileSize(size: number): string {
  if (!size) {
    return `0${FILE_SIZE_UNITS[0]}`;
  }

  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted =
    unitIndex === 0
      ? value
      : Number(value.toFixed(1).replace(/\.0$/, ''));

  return `${formatted}${FILE_SIZE_UNITS[unitIndex]}`;
}

export function getFileSize(item: UploaderFileListItem): number | undefined {
  const listItem = item as UploaderFileEntry;

  if (listItem.file?.size != null) {
    return listItem.file.size;
  }

  if (listItem.fileSize != null) {
    return listItem.fileSize;
  }

  return undefined;
}

export const UPLOADER_FILE_ACTION_TEXTS = {
  maxCountExceeded: (count: number) => `最多上传${count}个文件`,
  preview: '预览',
  previewUnsupported: '当前文件不支持预览',
  rename: '重命名',
  download: '下载',
  downloadFailed: '下载失败',
  delete: '删除',
  cancel: '取消',
  deleteTitle: '确认删除',
  deleteMessage: '是否删除文件？',
  renameTitle: '文件重命名',
  renamePlaceholder: '请输入文件名',
} as const;

export type UploaderFileActionName =
  (typeof UPLOADER_FILE_ACTION_TEXTS)[keyof typeof UPLOADER_FILE_ACTION_TEXTS];

/** 可用于预览/下载的地址：服务端 url 或本地 objectUrl */
export function getFileUrl(item: UploaderFileListItem): string | undefined {
  return item.url || item.objectUrl;
}

export type UploaderFileStatusTexts = typeof UPLOADER_FILE_STATUS_TEXTS;

/** 副标题文案：优先 item.message，否则按 status 映射（done 时展示文件大小） */
export function getStatusMessage(item: UploaderFileListItem): string {
  if (item.message) {
    return item.message;
  }

  switch (item.status) {
    case 'uploading':
      return UPLOADER_FILE_STATUS_TEXTS.uploading;
    case 'done': {
      const size = getFileSize(item);
      return size != null ? formatFileSize(size) : '';
    }
    case 'failed':
      return UPLOADER_FILE_STATUS_TEXTS.failed;
    default:
      return UPLOADER_FILE_STATUS_TEXTS.waiting;
  }
}
