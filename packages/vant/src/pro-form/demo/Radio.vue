<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import { Button } from '../../button';
import { createListOptions } from './listOptions';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    radio: '单选框',
    radioPicker: '单选弹窗',
    radioPickerPlaceholder: '请选择',
    radioListPicker: '单选列表弹窗',
    radioRemoteListPicker: '单选远程分页',
    option1: '选项 1',
    option2: '选项 2',
    option3: '选项 3',
    optionDesc: '描述信息',
    radioPopupBottomSelectAll: '主要操作',
    radioPopupBottomReset: '次要操作',
  },
  'en-US': {
    radio: 'Radio',
    radioPicker: 'Radio Popup',
    radioPickerPlaceholder: 'Select option',
    radioListPicker: 'Radio List Popup',
    radioRemoteListPicker: 'Remote Paginated List',
    option1: 'Option 1',
    option2: 'Option 2',
    option3: 'Option 3',
    optionDesc: 'Description',
    radioPopupBottomSelectAll: 'Primary Action',
    radioPopupBottomReset: 'Secondary Action',
  },
});

const listOptions = computed(() => createListOptions(t));

const remoteAllOptions = Array.from({ length: 45 }, (_, i) => ({
  label: `Remote ${i + 1}`,
  value: `r${i + 1}`,
}));

const loadRemoteOptions = async (query?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) => {
  const page = Math.max(1, query?.page || 1);
  const pageSize = Math.max(1, query?.pageSize || 20);
  const keyword = String(query?.keyword || '')
    .trim()
    .toLowerCase();
  await new Promise((resolve) => setTimeout(resolve, 400));
  const filtered = keyword
    ? remoteAllOptions.filter((item) =>
        item.label.toLowerCase().includes(keyword),
      )
    : remoteAllOptions;
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
};

const model = ref({});

const columns = computed<ProFormColumn[]>(() => [
  {
    name: 'radio',
    label: t('radio'),
    component: 'radioGroup',
    fieldProps: {
      labelAlign: 'top',
    },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: `${t('radio')} 1`, value: '1' },
        { label: `${t('radio')} 2`, value: '2' },
      ],
    },
  },
  {
    name: 'radioPicker',
    label: t('radioPicker'),
    component: 'radioPicker',
    defaultValue: '1',
    fieldProps: { placeholder: t('radioPickerPlaceholder') },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: `${t('radio')} 1`, value: '1' },
        { label: `${t('radio')} 2`, value: '2' },
      ],
    },
  },
  {
    name: 'radioListPicker',
    label: t('radioListPicker'),
    component: 'radioPicker',
    defaultValue: '1',
    fieldProps: { placeholder: t('radioPickerPlaceholder') },
    componentProps: {
      isList: true,
      showSearch: true,
      options: listOptions.value,
    },
    popupSlots: {
      'popup-bottom': () => (
        <div class="demo-pro-form__popup-bottom van-hairline--top">
          <Button block>{t('radioPopupBottomReset')}</Button>
          <Button block type="primary">
            {t('radioPopupBottomSelectAll')}
          </Button>
        </div>
      ),
    },
  },
  {
    name: 'radioRemoteListPicker',
    label: t('radioRemoteListPicker'),
    component: 'radioPicker',
    fieldProps: { placeholder: t('radioPickerPlaceholder') },
    componentProps: {
      isList: true,
      showSearch: true,
      pageSize: 20,
      loadOptions: loadRemoteOptions,
    },
  },
]);
</script>

<template>
  <demo-block :title="t('radio')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>

<style>
.demo-pro-form__popup-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px 12px;
}
</style>
