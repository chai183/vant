/** 与 PC 公共附件服务一致；不混用 Excel 导入接口。 */
export const FILE_API_PREFIX = '/dthr-file/v4/api/file';
export const FILE_ATTACHMENT_UPLOAD_URL = `${FILE_API_PREFIX}/upload`;
export const FILE_ATTACHMENT_URL_PATH = (id: string) =>
  `${FILE_API_PREFIX}/${encodeURIComponent(id)}/url`;
