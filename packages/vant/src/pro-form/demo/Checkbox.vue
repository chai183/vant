<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import { createListOptions } from './listOptions';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    checkbox: '复选框复选框复选框复选框',
    checkboxGroup: '复选框组',
    checkboxPicker: '多选弹窗',
    checkboxPickerPlaceholder: '请选择',
    checkboxListPicker: '多选列表弹窗',
    option1: '选项 1',
    option2: '选项 2',
    option3: '选项 3',
    optionDesc: '描述信息',
  },
  'en-US': {
    checkbox: 'Checkbox',
    checkboxGroup: 'Checkbox Group',
    checkboxPicker: 'Checkbox Popup',
    checkboxPickerPlaceholder: 'Select options',
    checkboxListPicker: 'Checkbox List Popup',
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
    name: 'checkboxGroup',
    label: t('checkboxGroup'),
    component: 'checkboxGroup',
    fieldProps: {
      labelAlign: 'top',
      labelCollapsible: true,
    },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: `${t('checkbox')} 1`, value: '1' },
        { label: `${t('checkbox')} 2`, value: '2' },
        { label: `${t('checkbox')} 3`, value: '3' },
      ],
    },
  },
  {
    name: 'checkboxPicker',
    label: t('checkboxPicker'),
    component: 'checkboxPicker',
    defaultValue: ['1'],
    fieldProps: { placeholder: t('checkboxPickerPlaceholder') },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: `${t('checkbox')} 1`, value: '1' },
        { label: `${t('checkbox')} 2`, value: '2' },
      ],
    },
  },
  {
    name: 'checkboxListPicker',
    label: t('checkboxListPicker'),
    component: 'checkboxPicker',
    defaultValue: ['1'],
    fieldProps: { placeholder: t('checkboxPickerPlaceholder') },
    componentProps: {
      isList: true,
      options: listOptions.value,
    },
  },
  {
    name: 'checkboxListPickerGroup',
    label: t('checkboxPicker'),
    component: 'checkboxGroup',
    defaultValue: ['1'],
    fieldProps: { labelAlign: 'top', placeholder: t('checkboxPickerPlaceholder') },
    componentProps: {
      isList: true,
      options: listOptions.value,
    },
  },
]);
</script>

<template>
  <demo-block :title="t('checkboxGroup')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
