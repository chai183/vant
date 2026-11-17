/** PC 公共附件上传与链接接口的原始返回值。 */
export type AttachmentUploadBody = {
  id?: string;
  fileId?: string;
  originalName?: string;
  fileName?: string;
};

export type AttachmentUrlBody = { url?: string; objectId?: string };

/** 表单上传项；额外保留附件原名、大小及真实文件 ID。 */
export type SchemaUploadFile = import('vant').UploaderFileListItem & {
  id?: string;
  fileId?: string;
  name?: string;
  fileName?: string;
  originalName?: string;
  displayName?: string;
  fileSize?: number;
};
