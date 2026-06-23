<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import { Button } from '../../button';
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
    checkboxPickerComment: '点击选择多个选项',
    checkboxPopupBottomSelectAll: '主要操作',
    checkboxPopupBottomReset: '次要操作',
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
    checkboxPickerComment: 'Tap to select multiple options',
    checkboxPopupBottomSelectAll: 'Primary Action',
    checkboxPopupBottomReset: 'Secondary Action',
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
    fieldSlots: {
      'input-comment': () => (
        <div
          class="demo-pro-form__field-slot-comment"
        >
          {t('checkboxPickerComment')}
        </div>
      ),
    },
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
      showSearch: true,
      options: listOptions.value,
    },
    popupSlots: {
      'popup-bottom': () => (
        <div class="demo-pro-form__popup-bottom van-hairline--top">
          <Button block>{t('checkboxPopupBottomReset')}</Button>
          <Button block type="primary">
            {t('checkboxPopupBottomSelectAll')}
          </Button>
        </div>
      ),
    },
  },
]);
</script>

<template>
  <demo-block :title="t('checkboxGroup')">
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
