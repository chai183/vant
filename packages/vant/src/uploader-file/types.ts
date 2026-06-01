import type { ComponentPublicInstance } from 'vue';
import type { UploaderFileProps } from './UploaderFile';
import type { UploaderExpose, UploaderFileListItem } from '../uploader/types';

/** `upload` 成功时可返回的字段，会合并进对应列表项 */
export type UploaderFileUploadResult = {
  url?: string;
  message?: string;
};

/** 单文件上传，返回 Promise；组件内部负责状态流转 */
export type UploaderFileUpload = (
  item: UploaderFileListItem,
) => Promise<UploaderFileUploadResult | void>;

export type UploaderFileThemeVars = {
  uploaderFileDescColor?: string;
  uploaderFileDescFontSize?: string;
  uploaderFileDescLineHeight?: string | number;
  uploaderFileUploadHeight?: string;
  uploaderFileUploadRadius?: string;
  uploaderFileUploadBorderColor?: string;
  uploaderFileUploadColor?: string;
  uploaderFileUploadFontSize?: string;
  uploaderFileUploadIconSize?: string;
  uploaderFileItemPadding?: string;
  uploaderFileItemBorderColor?: string;
  uploaderFileIconSize?: string;
  uploaderFileNameColor?: string;
  uploaderFileNameFontSize?: string;
  uploaderFileStatusColor?: string;
  uploaderFileStatusFontSize?: string;
  uploaderFileDeleteColor?: string;
  uploaderFileDeleteSize?: string;
  uploaderFileReuploadColor?: string;
  uploaderFileReuploadFontSize?: string;
  uploaderFileMenuColor?: string;
  uploaderFileMenuSize?: string;
};

export type UploaderFileInstance = ComponentPublicInstance<
  UploaderFileProps,
  UploaderExpose
>;
