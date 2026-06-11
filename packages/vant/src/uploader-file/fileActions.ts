/**
 * 文件项的预览、下载、重命名等副作用操作。
 * 与 UI 解耦，供 UploaderFile 在默认行为或自定义回调未覆盖时调用。
 */
import { extend, type ComponentInstance } from '../utils';
import { showImagePreview } from '../image-preview';
import { isImageFile } from '../uploader/utils';
import { getFileName, getFileUrl, getPreviewImageSrc } from './utils';
import type { UploaderFileEntry } from './utils';
import type { UploaderFileListItem } from '../uploader/types';
import type { ImagePreviewOptions } from '../image-preview';

export type UploaderFilePreviewOptions = Partial<ImagePreviewOptions> & {
  /** 为 false 时不打开全屏图片预览 */
  previewFullImage?: boolean;
};

/** 使用 ImagePreview 预览列表中的图片，并定位到当前项 */
export function previewFileWithImagePreview(
  fileList: UploaderFileListItem[],
  item: UploaderFileListItem,
  options: UploaderFilePreviewOptions = {},
): ComponentInstance | undefined {
  const { previewFullImage = true, ...previewOptions } = options;

  if (!previewFullImage || !isImageFile(item)) {
    return;
  }

  const imageFiles = fileList.filter(isImageFile);
  const images = imageFiles
    .map((file) => getPreviewImageSrc(file))
    .filter(Boolean) as string[];

  if (!images.length) {
    return;
  }

  // 仅图片参与轮播，startPosition 对应当前项在 imageFiles 中的下标
  const startPosition = Math.max(imageFiles.indexOf(item), 0);

  return showImagePreview(
    extend(
      {
        images,
        startPosition,
      },
      previewOptions,
    ),
  );
}

/** 通过临时 <a download> 触发浏览器下载，不离开当前页 */
function triggerDownload(href: string, fileName: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBlob(source: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(source);
  triggerDownload(blobUrl, fileName);
  URL.revokeObjectURL(blobUrl);
}

/** 后台下载文件，不跳转页面；成功返回 true */
export async function downloadFile(
  item: UploaderFileListItem,
): Promise<boolean> {
  const fileName = getFileName(item);

  if (item.file) {
    downloadBlob(item.file, fileName);
    return true;
  }

  const url = getFileUrl(item);
  if (!url) {
    return false;
  }

  // 本地或内联 URL 可直接下载
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    triggerDownload(url, fileName);
    return true;
  }

  // 远程 URL 先 fetch 为 Blob，避免跨域或 Content-Disposition 导致页面跳转
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }
    const blob = await response.blob();
    downloadBlob(blob, fileName);
    return true;
  } catch {
    return false;
  }
}

/** 重命名只更新 displayName，不修改底层 File 或 url */
export function renameFileName(
  item: UploaderFileListItem,
  newName: string,
): Partial<UploaderFileEntry> {
  return {
    displayName: newName.trim(),
  };
}
