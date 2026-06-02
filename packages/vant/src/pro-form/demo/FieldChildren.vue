<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import Field from '../../field';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    fieldChildren: '动态子项',
    fieldChildrenTitle: '可添加子选项列表',
    fieldChildrenAdd: '添加',
    fieldChildrenOption: '选项名称',
    fieldChildrenPlaceholder: '请输入',
    fieldChildrenDefaultRow: '新选项',
  },
  'en-US': {
    fieldChildren: 'Dynamic List',
    fieldChildrenTitle: 'Addable option list',
    fieldChildrenAdd: 'Add',
    fieldChildrenOption: 'Option',
    fieldChildrenPlaceholder: 'Please enter',
    fieldChildrenDefaultRow: 'New option',
  },
});

const renderFieldChildrenRow = () => (
  <Field
    label={t('fieldChildrenOption')}
    placeholder={t('fieldChildrenPlaceholder')}
    border={false}
  />
);

const model = ref({});

const columns = computed<ProFormColumn[]>(() => [
  {
    name: 'options',
    label: t('fieldChildrenTitle'),
    component: 'fieldChildren',
    defaultValue: ['', ''],
    componentProps: {
      addText: t('fieldChildrenAdd'),
      minItems: 1,
      maxItems: 5,
      defaultRowValue: t('fieldChildrenDefaultRow'),
      row: renderFieldChildrenRow,
    },
  },
]);
</script>

<template>
  <demo-block :title="t('fieldChildren')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
