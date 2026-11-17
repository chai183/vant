import apiClient from '@/services/api';
import type { AxiosRequestTransformer } from 'axios';
import type {
  AttachmentUploadBody,
  AttachmentUrlBody,
} from '@/types/common/file';
import { FILE_ATTACHMENT_UPLOAD_URL, FILE_ATTACHMENT_URL_PATH } from './config';
import { adaptAttachmentUpload, adaptAttachmentUrl } from './entity';

type Response<T> = { success?: boolean; body?: T; message?: string };

/** FormData 的 boundary 由浏览器生成，不能继承 apiClient 的 JSON Content-Type。 */
const clearJsonContentType: AxiosRequestTransformer = (data, headers) => {
  headers.delete('Content-Type');
  return data;
};

/** PC 普通附件上传：multipart file，可选 sceneCode，不发送 base64。 */
export async function uploadAttachmentApi(
  file: File,
  onProgress?: (percent: number) => void,
  sceneCode?: string,
) {
  const data = new FormData();
  data.append('file', file);
  if (sceneCode) data.append('sceneCode', sceneCode);
  const response = await apiClient<Response<AttachmentUploadBody>>({
    url: FILE_ATTACHMENT_UPLOAD_URL,
    method: 'post',
    data,
    headers: { isNoCrypto: true },
    transformRequest: [clearJsonContentType],
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(
          Math.min(99, Math.round((event.loaded / event.total) * 100)),
        );
    },
  });
  return {
    ...response,
    body: adaptAttachmentUpload(response.success ? response.body : undefined),
  };
}

/** PC 图片回显与附件下载共用链接查询，不把文件 ID 当作 URL。 */
export async function getAttachmentUrlApi(id: string) {
  const response = await apiClient<Response<AttachmentUrlBody>>({
    url: FILE_ATTACHMENT_URL_PATH(id),
    method: 'get',
  });
  return {
    ...response,
    body: adaptAttachmentUrl(response.success ? response.body : undefined),
  };
}
