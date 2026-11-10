/**
 * 入职登记表附件材料：model / 回显 / 提交结构
 * 对齐 PC onboarding/utils/material-form
 */

export function normalizeMaterialItem(item: Record<string, unknown> = {}) {
  return {
    ...item,
    id: String(item.id || item.fileAttachmentId || ''),
    name: String(item.name ?? ''),
    memo: String(item.memo ?? item.description ?? ''),
    type: String(item.type ?? 'IMAGE'),
    required: Boolean(item.required),
    showStaffFlag: Boolean(item.showStaffFlag ?? true),
  };
}

/** 表单字段标签 */
export function getMaterialFieldLabel(material: Record<string, unknown> = {}) {
  const normalized = normalizeMaterialItem(material);
  if (normalized.type === 'FILE') return '上传文件';
  const name = String(normalized.name || '').trim();
  if (!name) return '上传图片';
  if (name.endsWith('证书')) return `${name}照片`;
  return name;
}

/** 按材料 id 初始化空文件列表 */
export function createMaterialFormModel(
  materials: Array<Record<string, unknown>> = [],
) {
  const model: Record<string, unknown[]> = {};
  materials.forEach((item) => {
    const id = String(item?.id || '');
    if (id) model[id] = [];
  });
  return model;
}

/** 上传项 → 提交文件对象 */
export function normalizeUploadFile(file: Record<string, unknown> = {}) {
  const response =
    file.response && typeof file.response === 'object'
      ? (file.response as { body?: Record<string, unknown> }).body ||
        (file.response as Record<string, unknown>)
      : {};
  const fileId = String(
    file.fileId ||
      response.fileId ||
      (file.uid != null ? String(file.uid) : '') ||
      '',
  );
  const fileName = String(file.fileName || file.name || '');
  const url = String(
    file.url || file.fileUrl || response.url || response.fileUrl || '',
  );
  const fileSize =
    Number(file.fileSize ?? file.size ?? response.fileSize ?? 0) || 0;
  return { fileId, fileName, fileSize, url };
}

/** form model → materials 提交结构 */
export function buildMaterialSubmitPayload(form: Record<string, unknown> = {}) {
  return Object.keys(form || {}).map((materialId) => ({
    materialId,
    fileList: (Array.isArray(form[materialId]) ? form[materialId] : [])
      .map((file) =>
        normalizeUploadFile(
          (file && typeof file === 'object' ? file : {}) as Record<
            string,
            unknown
          >,
        ),
      )
      .filter((item) => item.fileId || item.fileName),
  }));
}

/** 详情 materials → uploader file-list */
export function applyMaterialDetailToForm(
  form: Record<string, unknown[]>,
  materials: Array<Record<string, unknown>> = [],
) {
  materials.forEach((item) => {
    const materialId = String(
      item?.materialId || item?.attachmentItemId || item?.id || '',
    );
    if (!materialId || !(materialId in form)) return;
    const files = Array.isArray(item.fileList) ? item.fileList : [];
    form[materialId] = files.map((file, index) => {
      const fileSource = (
        file && typeof file === 'object' ? file : {}
      ) as Record<string, unknown>;
      return {
        uid: String(
          fileSource.fileId || `material-file-${materialId}-${index}`,
        ),
        name: String(fileSource.fileName || fileSource.name || ''),
        url: String(fileSource.url || fileSource.fileUrl || ''),
        status: 'done',
        isImage: true,
        fileId: String(fileSource.fileId || ''),
        fileName: String(fileSource.fileName || fileSource.name || ''),
        fileSize: Number(fileSource.fileSize) || 0,
        size: Number(fileSource.fileSize) || 0,
      };
    });
  });
}
