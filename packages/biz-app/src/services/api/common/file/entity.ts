import type {
  AttachmentUploadBody,
  AttachmentUrlBody,
} from '@/types/common/file';

/** 上传成功取真实 ID 与原文件名，失败不生成替代文件。 */
export function adaptAttachmentUpload(body?: AttachmentUploadBody) {
  return {
    fileId: String(body?.id ?? body?.fileId ?? ''),
    fileName: String(body?.originalName ?? body?.fileName ?? ''),
  };
}

export function adaptAttachmentUrl(body?: AttachmentUrlBody) {
  return {
    url: String(body?.url ?? ''),
    objectId: String(body?.objectId ?? ''),
  };
}
