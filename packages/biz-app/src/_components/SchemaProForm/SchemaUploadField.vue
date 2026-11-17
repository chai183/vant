<template>
  <div class="schema-upload-field">
    <!-- 字段限制放在入口上方，多条独立换行，不复用上传按钮文案。 -->
    <div v-if="!locked && tips.length" class="schema-upload-tips">
      <div v-for="tip in tips" :key="tip">*{{ tip }}</div>
    </div>
    <!-- 图片使用缩略图与添加图片入口，附件使用按钮与文件列表。 -->
    <van-uploader
      v-if="mode === 'image'"
      v-model="files"
      :accept="accept || 'image/*'"
      :max-count="maxCount"
      :max-size="maxSize"
      :multiple="true"
      :readonly="locked"
      :show-upload="!locked"
      :deletable="!locked && deletable"
      :before-read="beforeRead"
      :after-read="afterRead"
      :preview-full-image="false"
      result-type="file"
      @click-preview="preview"
      @oversize="showFailToast('文件大小超过字段配置的限制')"
    >
      <div class="schema-upload-image-trigger">
        <van-icon name="upgrade" />
        <span>添加图片</span>
      </div>
    </van-uploader>
    <van-uploader-file
      v-else
      v-model="files"
      :accept="accept || '*'"
      :max-count="maxCount"
      :max-size="maxSize"
      :readonly="locked"
      :show-upload="!locked"
      :deletable="!locked && deletable"
      :before-read="beforeRead"
      :upload="upload"
      :preview="preview"
      :download="download"
      :actions="
        locked ? ['preview', 'download'] : ['preview', 'download', 'delete']
      "
      upload-text="添加附件"
      @oversize="showFailToast('文件大小超过字段配置的限制')"
    />
    <div v-if="previewError" class="schema-upload-error">
      {{ previewError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { showFailToast, showImagePreview } from 'vant';
import type { UploaderFileListItem } from 'vant';
import type { SchemaUploadFile } from '@/types/common/file';
import {
  getAttachmentUrlApi,
  uploadAttachmentApi,
} from '@/services/api/common/file';
import { normalizeSchemaUploadFiles } from './transform-schema-utils';

defineOptions({ name: 'SchemaUploadField', inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue?: unknown;
    mode?: 'image' | 'file';
    disabled?: boolean;
    readonly?: boolean;
    deletable?: boolean;
    accept?: string;
    maxCount?: number;
    maxSize?: number;
    tips?: string[];
    sceneCode?: string;
  }>(),
  {
    mode: 'file',
    disabled: false,
    readonly: false,
    deletable: true,
    accept: '',
    tips: () => [],
  },
);
const emit = defineEmits<{
  'update:modelValue': [files: SchemaUploadFile[]];
}>();

/** 展示链接只在组件内保存，回显补链接不污染草稿，也不会触发未保存提示。 */
const urls = ref<Record<string, string>>({});
const urlRequests = new Map<string, Promise<string>>();
/** 链接查询失败显式展示，仍保留原文件 ID。 */
const previewError = ref('');
/** 只读/禁用时保留预览下载，只关闭上传与删除。 */
const locked = computed(() => props.disabled || props.readonly);
/** 选中文件立即同步到本地列表，多文件同批完成时不会互相覆盖上传结果。 */
const selectedFiles = ref<SchemaUploadFile[]>([]);
watch(
  () => props.modelValue,
  (value) => {
    selectedFiles.value = normalizeSchemaUploadFiles(
      value,
    ) as SchemaUploadFile[];
  },
  { immediate: true, deep: true },
);
/** 兼容 PC 的原文件名和地址字段，适配移动附件列表的 displayName/fileSize。 */
const files = computed<SchemaUploadFile[]>({
  get: () =>
    selectedFiles.value.map(
      (file): SchemaUploadFile => ({
        ...file,
        displayName: String(
          file.name ||
            file.fileName ||
            file.originalName ||
            file.fileId ||
            file.id ||
            '',
        ),
        url: String(
          file.url ||
            file.objectUrl ||
            urls.value[String(file.fileId || file.id || '')] ||
            '',
        ),
        status: file.status || (file.fileId || file.id ? 'done' : ''),
        ...(props.mode === 'image' ? { isImage: true } : {}),
      }),
    ),
  set: (value) => {
    selectedFiles.value = value;
    emit('update:modelValue', value);
  },
});

/** 同 PC：已有地址直接使用，没有地址才调用公共附件链接接口。 */
async function resolveUrl(file: SchemaUploadFile) {
  const id = String(file.fileId || file.id || '');
  if (file.url || file.objectUrl) return String(file.url || file.objectUrl);
  if (urls.value[id]) return urls.value[id];
  if (!id) throw new Error('缺少文件 ID，无法获取文件链接');
  if (urlRequests.has(id)) return urlRequests.get(id)!;
  const request = (async () => {
    const response = await getAttachmentUrlApi(id);
    if (!response.success || !response.body.url)
      throw new Error(response.message || '获取文件链接失败');
    urls.value[id] = response.body.url;
    return response.body.url;
  })();
  urlRequests.set(id, request);
  try {
    return await request;
  } finally {
    urlRequests.delete(id);
  }
}

/** 图片详情仅带 ID 时补缩略图；附件在点击时再取链接。 */
watch(
  () =>
    props.mode === 'image'
      ? files.value
          .filter((file) => !file.url && (file.fileId || file.id))
          .map((file) => String(file.fileId || file.id))
          .join(',')
      : '',
  async () => {
    previewError.value = '';
    const images =
      props.mode === 'image'
        ? files.value.filter((file) => !file.url && (file.fileId || file.id))
        : [];
    await Promise.all(
      images.map((file) =>
        resolveUrl(file).then(undefined, (cause: Error) => {
          previewError.value = cause.message;
        }),
      ),
    );
  },
  { immediate: true },
);

/** accept 只负责文件选择器提示，这里沿用 PC 对扩展名再做实际校验。 */
function beforeRead(value: File | File[]) {
  if (locked.value) return false;
  const selected = Array.isArray(value) ? value : [value];
  const allowed = (props.accept || (props.mode === 'image' ? 'image/*' : '*'))
    .split(',')
    .map((item) => item.trim().toLowerCase());
  if (
    selected.some(
      (file) =>
        !allowed.some(
          (rule) =>
            rule === '*' ||
            (rule.startsWith('.')
              ? file.name.toLowerCase().endsWith(rule)
              : rule.endsWith('/*')
                ? file.type.startsWith(rule.slice(0, -1))
                : file.type === rule),
        ),
    )
  ) {
    showFailToast('文件格式不符合字段配置');
    return false;
  }
  return true;
}

/** 上传采用 PC 普通附件协议；只显示实际进度，缺 ID/请求失败均不标成功。 */
async function upload(
  item: UploaderFileListItem,
  onProgress?: (percent: number) => void,
) {
  if (!item.file) throw new Error('缺少上传文件');
  const response = await uploadAttachmentApi(
    item.file,
    onProgress,
    props.sceneCode,
  );
  if (!response.success || !response.body.fileId)
    throw new Error(response.message || '文件上传失败');
  const name = response.body.fileName || item.file.name;
  return {
    fileId: response.body.fileId,
    name,
    fileName: name,
    displayName: name,
    fileSize: item.file.size,
    url: props.mode === 'image' ? item.objectUrl || '' : '',
    status: 'done' as const,
  };
}

/** 图片控件 afterRead 与附件控件 upload 共用上面的真实请求。 */
async function afterRead(value: UploaderFileListItem | UploaderFileListItem[]) {
  await nextTick();
  const patch = (
    item: UploaderFileListItem,
    changes: Partial<SchemaUploadFile>,
  ) => {
    const current = selectedFiles.value;
    if (!current.some((file) => file.file === item.file)) return;
    files.value = current.map((file) =>
      file.file === item.file ? { ...file, ...changes } : file,
    );
  };
  await Promise.all(
    (Array.isArray(value) ? value : [value]).map(async (item) => {
      patch(item, { status: 'uploading', message: '上传中' });
      try {
        const result = await upload(item, (percent) =>
          patch(item, { message: `上传中 ${percent}%` }),
        );
        patch(item, { ...result, message: '' });
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : '文件上传失败';
        patch(item, { status: 'failed', message });
        showFailToast(message);
      }
    }),
  );
}

/** 图片打开移动端大图预览；普通附件沿用 PC 链接下载，不猜 Office 预览地址。 */
async function preview(item: UploaderFileListItem) {
  const file = item as SchemaUploadFile;
  const name = file.displayName || file.name || file.fileName || '';
  if (
    props.mode !== 'image' &&
    !file.file?.type.startsWith('image/') &&
    !/\.(png|jpe?g|gif|webp|bmp)$/i.test(name)
  )
    return download(item);
  await resolveUrl(file).then(
    (url) => showImagePreview({ images: [url] }),
    (cause: Error) => showFailToast(cause.message),
  );
}

async function download(item: UploaderFileListItem) {
  const file = item as SchemaUploadFile;
  await resolveUrl(file).then(
    (url) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name || file.fileName || file.displayName || '';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.append(link);
      link.click();
      link.remove();
    },
    (cause: Error) => showFailToast(cause.message),
  );
}
</script>

<style scoped lang="less">
.schema-upload-field {
  width: 100%;
}
.schema-upload-tips {
  margin-bottom: 8px;
  color: var(--van-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}
.schema-upload-tips div + div {
  margin-top: 2px;
}
.schema-upload-image-trigger {
  display: flex;
  width: 72px;
  height: 72px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--van-uploader-upload-background);
  color: var(--van-text-color-secondary);
  font-size: 12px;
}
.schema-upload-error {
  color: var(--van-danger-color);
  font-size: 12px;
  line-height: 18px;
}
</style>
