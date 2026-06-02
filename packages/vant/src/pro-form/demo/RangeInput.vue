<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import Field from '../../field';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    rangeInput: '范围录入',
    rangeInputVertical: '范围录入-上下布局',
    rangeInputHorizontal: '范围录入-左右布局',
    rangeInputPlaceholder: '请输入',
  },
  'en-US': {
    rangeInput: 'Range Input',
    rangeInputVertical: 'Vertical layout',
    rangeInputHorizontal: 'Horizontal layout',
    rangeInputPlaceholder: 'Please enter',
  },
});

const renderRangeStart = () => (
  <Field inputBorder placeholder={t('rangeInputPlaceholder')} />
);

const renderRangeEnd = () => (
  <Field inputBorder placeholder={t('rangeInputPlaceholder')} />
);

const model = ref({});

const columns = computed<ProFormColumn[]>(() => [
  {
    name: 'rangeVertical',
    label: t('rangeInputVertical'),
    component: 'rangeInput',
    defaultValue: ['', ''],
    fieldProps: {
      rules: [
        {
          required: true,
          message: t('rangeInputPlaceholder'),
          validator: (value: string[]) => {
            return value[0] !== '' && value[1] !== '';
          },
        },
      ],
    },
    componentProps: {
      layout: 'vertical',
      start: renderRangeStart,
      end: renderRangeEnd,
    },
  },
  {
    name: 'rangeHorizontal',
    label: t('rangeInputHorizontal'),
    component: 'rangeInput',
    defaultValue: ['', ''],
    fieldProps: {
      rules: [{ required: true, message: t('rangeInputPlaceholder') }],
    },
    componentProps: {
      layout: 'horizontal',
      start: renderRangeStart,
      end: renderRangeEnd,
    },
  },
]);
</script>

<template>
  <demo-block :title="t('rangeInput')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
