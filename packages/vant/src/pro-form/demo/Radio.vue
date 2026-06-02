<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import { createListOptions } from './listOptions';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    radio: '单选框',
    radioPicker: '单选弹窗',
    radioPickerPlaceholder: '请选择',
    radioListPicker: '单选列表弹窗',
    option1: '选项 1',
    option2: '选项 2',
    option3: '选项 3',
    optionDesc: '描述信息',
  },
  'en-US': {
    radio: 'Radio',
    radioPicker: 'Radio Popup',
    radioPickerPlaceholder: 'Select option',
    radioListPicker: 'Radio List Popup',
    option1: 'Option 1',
    option2: 'Option 2',
    option3: 'Option 3',
    optionDesc: 'Description',
  },
});

const listOptions = computed(() => createListOptions(t));

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
      options: listOptions.value,
    },
  },
  {
    name: 'radioListPickerGroup',
    label: t('radioListPicker'),
    component: 'radioGroup',
    defaultValue: '1',
    fieldProps: { labelAlign: 'top', placeholder: t('radioPickerPlaceholder') },
    componentProps: {
      isList: true,
      options: listOptions.value,
    },
  },
]);
</script>

<template>
  <demo-block :title="t('radio')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
