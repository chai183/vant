/**
 * 入职登记表编辑：附件材料 → 接口 attachmentList
 */
import { REGISTER_FORM_TEMPLATE_YES_NO } from '../config';
import { buildMaterialSubmitPayload } from './material-form';

function normalizeEditFileItem(file: Record<string, unknown> = {}) {
  return {
    fileId: file.fileId,
    fileName: file.fileName,
    fileSize: Number(file.fileSize) || 0,
    fileUrl: file.fileUrl ?? file.url ?? '',
  };
}

/** 页面材料配置 + 表单值 → 编辑接口 attachmentList */
export function buildRegisterFormEditAttachmentList(
  processFormId = '',
  materialItems: Array<Record<string, unknown>> = [],
  form: Record<string, unknown> = {},
) {
  const materialsPayload = buildMaterialSubmitPayload(form);
  const fileMap = new Map(
    materialsPayload.map((item) => [
      String(item.materialId || ''),
      item.fileList || [],
    ]),
  );

  return materialItems
    .map((item) => {
      const attachmentItemId = String(item.id || item.fileAttachmentId || '');
      if (!attachmentItemId) return null;

      const fileList = (fileMap.get(attachmentItemId) || [])
        .map((file) => normalizeEditFileItem(file as Record<string, unknown>))
        .filter((file) => file.fileId || file.fileName);

      return {
        processFormId,
        attachmentItemId,
        name: item.name ?? '',
        memo: item.description ?? item.memo ?? '',
        required:
          Number(item.required) === REGISTER_FORM_TEMPLATE_YES_NO.YES ||
          Boolean(item.required),
        type: item.type ?? '',
        fileList,
      };
    })
    .filter(Boolean);
}
