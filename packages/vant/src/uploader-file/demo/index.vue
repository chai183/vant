<script setup lang="ts">
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanUploaderFile from '..';
import VanButton from '../../button';
import { showToast } from '../../toast';
import type { UploaderFileUpload, UploaderFileListItem } from '..';

const t = useTranslate({
  'zh-CN': {
    basic: '基础用法',
    status: '上传状态',
    waiting: '等待上传',
    uploading: '上传中',
    failed: '上传失败',
    desc1: '所上传格式支持 DOC/PPT/XLS/VSD/POT 等',
    desc2: '所上传文件大小控制在 20M 以内，支持批量上传',
    customUpload: '自定义上传区域',
    disabled: '禁用文件上传',
    multiple: '是否开启多选',
    accept: '允许上传的文件类型',
    maxSize: '文件大小限制',
    maxCount: '文件数量限制',
    acceptDesc: '仅支持 PDF、DOC、DOCX 格式',
    maxSizeDesc: '单个文件大小不能超过 500kb',
    maxCountDesc: '最多上传 2 个文件',
    overSizeTip: '文件大小不能超过 500kb',
    upload: '添加附件',
    waitingFile: '项目方案.docx',
    uploadingFile: '财务报表.xlsx',
    doneFile: '会议纪要2023年文件关于指示.doc',
    failedFile: '合同扫描件.pdf',
  },
  'en-US': {
    basic: 'Basic Usage',
    status: 'Upload Status',
    waiting: 'Waiting',
    uploading: 'Uploading',
    failed: 'Failed',
    desc1: 'Supported formats: DOC, PPT, XLS, VSD, POT, etc.',
    desc2: 'Max file size 20MB. Batch upload supported.',
    customUpload: 'Custom Upload Area',
    disabled: 'Disable Uploader',
    multiple: 'Multiple Selection',
    accept: 'Accept File Types',
    maxSize: 'Max Size',
    maxCount: 'Max Count',
    acceptDesc: 'Only PDF, DOC, DOCX are supported',
    maxSizeDesc: 'Max file size 500kb per file',
    maxCountDesc: 'Max 2 files',
    overSizeTip: 'File size cannot exceed 500kb',
    upload: 'Add Attachment',
    waitingFile: 'Project Plan.docx',
    uploadingFile: 'Financial Report.xlsx',
    doneFile: 'Meeting Minutes 2023.doc',
    failedFile: 'Contract Scan.pdf',
  },
});

const fileList = ref<UploaderFileListItem[]>([]);

const statusFileList = ref<UploaderFileListItem[]>([
  {
    file: { name: t('waitingFile') } as File,
    status: '',
    message: t('waiting'),
  },
  {
    file: { name: t('uploadingFile') } as File,
    status: 'uploading',
    message: t('uploading'),
  },
  {
    file: new File([new Uint8Array(1536 * 1024)], t('doneFile')),
    status: 'done',
    url: 'https://example.com/meeting.doc',
  },
  {
    file: { name: t('failedFile') } as File,
    status: 'failed',
    message: t('failed'),
  },
]);

const customFileList = ref<UploaderFileListItem[]>([]);
const disabledFileList = ref<UploaderFileListItem[]>([
  {
    file: new File([new Uint8Array(1024)], t('doneFile')),
    status: 'done',
    url: 'https://example.com/meeting.doc',
  },
]);
const singleFileList = ref<UploaderFileListItem[]>([]);
const acceptFileList = ref<UploaderFileListItem[]>([]);
const maxSizeFileList = ref<UploaderFileListItem[]>([]);
const maxCountFileList = ref<UploaderFileListItem[]>([]);

const MAX_SIZE = 500 * 1024;
const MAX_COUNT = 2;

const onOversize = () => {
  showToast(t('overSizeTip'));
};

const upload: UploaderFileUpload = (item) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const name = item.file?.name || '';
      if (name.includes('fail')) {
        reject(new Error('上传失败'));
        return;
      }
      resolve({ url: `https://example.com/${name}` });
    }, 1000);
  });
</script>

<template>
  <demo-block :title="t('basic')">
    <van-uploader-file
      v-model="fileList"
      :description="[t('desc1'), t('desc2')]"
      :upload="upload"
      accept="*"
      :max-size="20 * 1024 * 1024"
      multiple
    />
  </demo-block>

  <demo-block :title="t('status')">
    <van-uploader-file v-model="statusFileList" readonly />
  </demo-block>

  <demo-block :title="t('customUpload')">
    <van-uploader-file
      v-model="customFileList"
      :upload="upload"
      accept="*"
      multiple
    >
      <van-button icon="plus" type="primary" plain block>
        {{ t('upload') }}
      </van-button>
    </van-uploader-file>
  </demo-block>

  <demo-block :title="t('disabled')">
    <van-uploader-file v-model="disabledFileList" :upload="upload" disabled />
  </demo-block>

  <demo-block :title="t('multiple')">
    <van-uploader-file
      v-model="singleFileList"
      :upload="upload"
      accept="*"
      :multiple="false"
    />
  </demo-block>

  <demo-block :title="t('accept')">
    <van-uploader-file
      v-model="acceptFileList"
      :description="t('acceptDesc')"
      :upload="upload"
      accept=".pdf,.doc,.docx"
      multiple
    />
  </demo-block>

  <demo-block :title="t('maxSize')">
    <van-uploader-file
      v-model="maxSizeFileList"
      :description="t('maxSizeDesc')"
      :upload="upload"
      accept="*"
      multiple
      :max-size="MAX_SIZE"
      @oversize="onOversize"
    />
  </demo-block>

  <demo-block :title="t('maxCount')">
    <van-uploader-file
      v-model="maxCountFileList"
      :description="t('maxCountDesc')"
      :upload="upload"
      accept="*"
      multiple
      :max-count="MAX_COUNT"
    />
  </demo-block>
</template>

<style lang="less">
.demo-uploader-file {
  background: var(--van-background-2);

  .van-doc-demo-block {
    padding: 0 var(--van-padding-md);
  }

  .van-doc-demo-block__title {
    padding-left: 0;
  }
}
</style>
