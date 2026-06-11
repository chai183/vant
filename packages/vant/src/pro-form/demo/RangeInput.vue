<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    rangeInput: '范围录入',
    rangeInputVertical: '范围录入-上下布局',
    rangeInputHorizontal: '范围录入-左右布局',
    rangeDatePicker: '时间选择',
    rangeInputPlaceholder: '请输入',
    rangeDatePickerPlaceholder: '请选择时间',
  },
  'en-US': {
    rangeInput: 'Range Input',
    rangeInputVertical: 'Vertical layout',
    rangeInputHorizontal: 'Horizontal layout',
    rangeDatePicker: 'Datetime Picker',
    rangeInputPlaceholder: 'Please enter',
    rangeDatePickerPlaceholder: 'Select time',
  },
});

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
      start: {
        component: 'field',
        fieldProps: {
          inputBorder: true,
          placeholder: t('rangeInputPlaceholder'),
        },
      },
      end: {
        component: 'field',
        fieldProps: {
          inputBorder: true,
          placeholder: t('rangeInputPlaceholder'),
        },
      },
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
      start: {
        component: 'field',
        fieldProps: {
          inputBorder: true,
          placeholder: t('rangeInputPlaceholder'),
        },
      },
      end: {
        component: 'field',
        fieldProps: {
          inputBorder: true,
          placeholder: t('rangeInputPlaceholder'),
        },
      },
    },
  },
  {
    name: 'rangeDatePicker',
    label: t('rangeDatePicker'),
    component: 'rangeInput',
    defaultValue: ['', ''],
    componentProps: {
      layout: 'vertical',
      showDateShortcuts: true,
      start: {
        component: 'datePicker',
        fieldProps: {
          inputBorder: true,
          placeholder: t('rangeDatePickerPlaceholder'),
        },
      },
      end: {
        component: 'datePicker',
        fieldProps: {
          inputBorder: true,
          placeholder: t('rangeDatePickerPlaceholder'),
        },
      },
    },
  },
]);
</script>

<template>
  <demo-block :title="t('rangeInput')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
