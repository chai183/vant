<template>
  <!-- /*----附件材料start----*/ -->
  <div class="view-attachment">
    <van-skeleton
      v-if="loading"
      title
      :row="4"
      class="view-attachment-skeleton"
    />

    <van-pro-form
      v-else-if="columns.length"
      ref="proFormRef"
      v-model="form"
      class="view-attachment-form"
      :columns="columns"
      :readonly="readOnly"
      :show-submit="false"
    />

    <van-empty v-else description="暂无附件材料" image-size="100" />
  </div>
  <!-- /*----附件材料end----*/ -->
</template>

<script lang="ts" setup>
/**
 * 入职登记表查看 / 编辑 - 附件材料
 * 用 van-pro-form：材料名 section + uploader / uploaderFile（对齐学历证明）
 */
import { computed, h, reactive, ref, watch } from 'vue';
import { showToast, type ProFormColumn } from 'vant';
import { buildUploadTipLines } from '@/_components/SchemaProForm';
import { getOnboardingRegisterFormTemplateMaterialApi } from '@/services/api/employee/employment/onboarding/register-form';
import { REGISTER_FORM_TEMPLATE_YES_NO } from '../config';
import { buildRegisterFormEditAttachmentList } from '../utils/edit-form';
import {
  applyMaterialDetailToForm,
  buildMaterialSubmitPayload,
  createMaterialFormModel,
  normalizeMaterialItem,
} from '../utils/material-form';

defineOptions({ name: 'RegisterFormViewAttachment' });

const IMAGE_LIMIT = 3;
const FILE_LIMIT = 3;
const MAX_SIZE_MB = 8;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
/** 对齐基本信息「学历证明」FILE 配置 */
const FILE_ACCEPT = '.jpg,.jpeg,.png,.pdf,.doc,.docx';
const IMAGE_ACCEPT = '.bmp,.jpg,.jpeg,.png,.svg';

const props = withDefaults(
  defineProps<{
    templateId?: string;
    materials?: Array<Record<string, unknown>>;
    readOnly?: boolean;
  }>(),
  {
    templateId: '',
    materials: () => [],
    readOnly: true,
  },
);

const loading = ref(false);
const proFormRef = ref<{ validate?: () => Promise<void> } | null>(null);
/** 模板内可见材料配置 */
const materialItems = ref<Array<Record<string, unknown>>>([]);
/** 上传表单值：materialId → fileList */
const form = reactive<Record<string, unknown[]>>({});

function isFileType(item: Record<string, unknown>) {
  return String(item.type || '') === 'FILE';
}

/** 字段标签：上传文件 / 上传图片 */
function getUploadLabel(item: Record<string, unknown>) {
  return isFileType(item) ? '上传文件' : '上传图片';
}

function toMaterialItem(raw: Record<string, unknown> = {}) {
  return normalizeMaterialItem({
    ...raw,
    id: String(raw.id || raw.fileAttachmentId || ''),
    name: raw.name || '',
    memo: raw.memo || raw.description || '',
    type: raw.type || 'IMAGE',
    required:
      Number(raw.required) === REGISTER_FORM_TEMPLATE_YES_NO.YES ||
      Boolean(raw.required),
    showStaffFlag: true,
  });
}

function syncFormModel(list: Array<Record<string, unknown>> = []) {
  const next = createMaterialFormModel(list);
  Object.keys(form).forEach((key) => {
    if (!(key in next)) delete form[key];
  });
  Object.keys(next).forEach((key) => {
    if (!(key in form)) form[key] = next[key];
  });
  applyMaterialDetailToForm(
    form,
    props.materials as Array<Record<string, unknown>>,
  );
}

/** Mock / 本地上传：标记完成并生成预览地址 */
function onAfterRead(
  file: Record<string, unknown> | Array<Record<string, unknown>>,
) {
  const list = Array.isArray(file) ? file : [file];
  list.forEach((item) => {
    const raw = item.file as File | undefined;
    item.status = 'done';
    item.message = '';
    item.fileId = String(item.fileId || `local-${Date.now()}-${Math.random()}`);
    item.fileName = String(item.fileName || item.name || raw?.name || '附件');
    item.name = String(item.name || item.fileName || raw?.name || '附件');
    item.fileSize = Number(item.fileSize ?? item.size ?? raw?.size ?? 0) || 0;
    if (!item.url && raw) {
      item.url = URL.createObjectURL(raw);
    }
  });
}

function buildTipSlot(tipLines: string[]) {
  if (!tipLines.length) return undefined;
  return {
    'label-comment': () =>
      h(
        'div',
        { class: 'view-attachment-tips' },
        tipLines.map((tip) =>
          h('div', { class: 'view-attachment-tip' }, `*${tip}`),
        ),
      ),
  };
}

/**
 * ProForm columns：每个材料一块 section（标题=材料名）
 * 图片 → uploader；文件 → uploaderFile（对齐学历证明）
 */
const columns = computed<ProFormColumn[]>(() =>
  materialItems.value.map((item) => {
    const id = String(item.id || '');
    const isFile = isFileType(item);
    const label = getUploadLabel(item);
    const required = Boolean(item.required);
    const tipLines = buildUploadTipLines({
      mode: isFile ? 'file' : 'image',
      limit: isFile ? FILE_LIMIT : IMAGE_LIMIT,
      maxSize: MAX_SIZE_MB,
      sizeUnit: 'MB',
      accept: isFile ? FILE_ACCEPT : IMAGE_ACCEPT,
    });

    const field: ProFormColumn = {
      name: id,
      label,
      component: isFile ? 'uploaderFile' : 'uploader',
      fieldProps: {
        labelAlign: 'top',
        required,
        rules: required
          ? [{ required: true, message: `请${label}` }]
          : undefined,
      },
      componentProps: isFile
        ? {
            maxCount: FILE_LIMIT,
            maxSize: MAX_SIZE_BYTES,
            accept: FILE_ACCEPT,
            uploadText: '添加附件',
            deletable: !props.readOnly,
            showUpload: !props.readOnly,
            afterRead: onAfterRead,
          }
        : {
            maxCount: IMAGE_LIMIT,
            maxSize: MAX_SIZE_BYTES,
            accept: 'image/*',
            uploadText: '添加图片',
            deletable: !props.readOnly,
            showUpload: !props.readOnly || !(form[id] || []).length,
            afterRead: onAfterRead,
          },
      fieldSlots: buildTipSlot(tipLines),
    };

    // 子节点再包一层 content → section（材料名标题）
    return {
      title: String(item.name || id),
      content: [{ content: [field] }],
    };
  }),
);

async function validate() {
  if (props.readOnly) return true;
  try {
    await proFormRef.value?.validate?.();
    return true;
  } catch {
    for (const item of materialItems.value) {
      const id = String(item.id || '');
      if (!item.required || !id) continue;
      if (!(form[id] || []).length) {
        showToast(`请${getUploadLabel(item)}`);
        return false;
      }
    }
    showToast('请完善必填项');
    return false;
  }
}

function buildSubmitPayload() {
  return { materials: buildMaterialSubmitPayload(form) };
}

function buildEditAttachmentList(processFormId = '') {
  return buildRegisterFormEditAttachmentList(
    processFormId,
    materialItems.value,
    form,
  );
}

async function loadMaterials() {
  if (!props.templateId) {
    materialItems.value = [];
    syncFormModel([]);
    return;
  }

  loading.value = true;
  try {
    const res = await getOnboardingRegisterFormTemplateMaterialApi({
      id: props.templateId,
    });
    if ((res as { success?: boolean }).success === false) {
      showToast(
        (res as { message?: string; errorMsg?: string }).message ||
          (res as { errorMsg?: string }).errorMsg ||
          '获取附件材料配置失败',
      );
      materialItems.value = [];
      syncFormModel([]);
      return;
    }

    const items = ((res.body?.items || []) as Array<Record<string, unknown>>)
      .filter(
        (item) =>
          Number(item.visible) === REGISTER_FORM_TEMPLATE_YES_NO.YES ||
          Boolean(item.visible),
      )
      .map((item) => toMaterialItem(item));

    materialItems.value = items;
    syncFormModel(items);
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.templateId,
  () => {
    loadMaterials();
  },
  { immediate: true },
);

watch(
  () => props.materials,
  () => {
    if (!materialItems.value.length) return;
    syncFormModel(materialItems.value);
  },
  { deep: true },
);

defineExpose({
  validate,
  buildSubmitPayload,
  buildEditAttachmentList,
});
</script>

<style scoped lang="less">
.view-attachment {
  min-height: 160px;
  padding-bottom: 16px;
}

.view-attachment-skeleton {
  padding: 16px;
}

.view-attachment-form {
  /* 材料名标题：对齐设计稿（无橙条、底部分割线） */
  :deep(.van-pro-form__section) {
    margin-bottom: 0;
    margin-top: 16px;
    background: var(--van-background-2, #fff);
  }

  :deep(.van-pro-form__section-title) {
    padding: 0 12px;
    font-weight: 500;
    font-size: 14px;
    line-height: 44px;
    border-bottom: 1px solid var(--van-border-color);
    margin-bottom: 16px;

    &::before {
      display: none;
    }
  }

  :deep(.van-cell) {
    padding-top: 0;
  }

  /* label-top + required：* 与文案同行 */
  :deep(.van-field__label--top.van-field__label--required::after) {
    content: none;
  }

  :deep(.van-field__label--top.van-field__label--required label::after) {
    margin-left: 2px;
    color: var(--van-field-required-mark-color, var(--van-danger-color));
    content: '*';
  }
}

.view-attachment-tips {
  font-size: 12px;
  line-height: 18px;
  color: var(--van-gray-6, #969799);
}

.view-attachment-tip + .view-attachment-tip {
  margin-top: 2px;
}
</style>
