<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import type { UploaderFileUpload } from '../../uploader-file';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    fieldSlot: 'Field 插槽透传',
    uploader: '上传图片',
    uploaderComment: '支持 jpg、png 格式，单张不超过 2MB',
    uploaderFile: '上传文件',
    uploaderFileDesc1: '所上传格式支持 DOC/PPT/XLS/VSD/POT 等',
    uploaderFileDesc2: '所上传文件大小控制在 20M 以内，支持批量上传',
    uploaderFileUpload: '添加附件',
    remark: '备注',
    remarkInputComment: '请输入与业务相关的补充说明',
    placeholder: '请输入用户名',
    rangeInputPlaceholder: '请输入',
  },
  'en-US': {
    fieldSlot: 'Field Slots',
    uploader: 'Uploader',
    uploaderComment: 'JPG/PNG, max 2MB per image',
    uploaderFile: 'File Upload',
    uploaderFileDesc1: 'Supported formats: DOC, PPT, XLS, VSD, POT, etc.',
    uploaderFileDesc2: 'Max file size 20MB. Batch upload supported.',
    uploaderFileUpload: 'Add Attachment',
    remark: 'Remark',
    remarkInputComment: 'Enter supplementary notes for your business',
    placeholder: 'Enter username',
    rangeInputPlaceholder: 'Please enter',
  },
});

const demoUploaderFileUpload: UploaderFileUpload = (item) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ url: `https://example.com/${item.file?.name || 'file'}` });
    }, 300);
  });

const fieldSlotModel = ref({
  uploader: [] as { url: string }[],
  remark: '',
});

const fieldSlotColumns = computed<ProFormColumn[]>(() => [
  {
    name: 'uploader',
    label: t('uploader'),
    component: 'uploader',
    defaultValue: [],
    fieldProps: {
      labelAlign: 'top',
    },
    componentProps: { maxCount: 2 },
    fieldSlots: {
      'label-comment': () => (
        <div
          class="demo-pro-form__field-slot-comment"
          style="padding-bottom: 10px;"
        >
          {t('uploaderComment')}
        </div>
      ),
    },
  },
  {
    name: 'attachments',
    label: t('uploaderFile'),
    component: 'uploaderFile',
    defaultValue: [],
    fieldProps: {
      rules: [
        {
          required: true,
          message: t('rangeInputPlaceholder'),
        },
      ],
    },
    componentProps: {
      uploadText: t('uploaderFileUpload'),
      upload: demoUploaderFileUpload,
      accept: '*',
      multiple: true,
      maxSize: 20 * 1024 * 1024,
    },
    fieldSlots: {
      'label-comment': () => (
        <div
          class="demo-pro-form__field-slot-comment"
          style="padding-bottom: 10px;"
        >
          {t('uploaderFileDesc1')}
          {t('uploaderFileDesc2')}
        </div>
      ),
    },
  },
  {
    name: 'remark',
    label: t('remark'),
    component: 'field',
    fieldProps: {
      placeholder: t('placeholder'),
    },
    fieldSlots: {
      'input-comment': t('remarkInputComment'),
    },
  },
]);
</script>

<template>
  <demo-block :title="t('fieldSlot')">
    <van-pro-form
      v-model="fieldSlotModel"
      :columns="fieldSlotColumns"
      :show-submit="false"
    />
  </demo-block>
</template>

<style lang="less">
.demo-pro-form__field-slot-comment {
  color: var(--van-text-color-2);
  font-size: var(--van-font-size-sm);
}
</style>
