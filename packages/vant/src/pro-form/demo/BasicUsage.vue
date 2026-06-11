<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础组件',
    rate: '评分',
    submit: '提交',
    switch: '开关',
    slider: '滑块',
    stepper: '步进器',
    username: '用户名',
    placeholder: '请输入用户名',
    switchComment:'开关备注',
  },
  'en-US': {
    basicUsage: 'Basic Components',
    rate: 'Rate',
    submit: 'Submit',
    switch: 'Switch',
    slider: 'Slider',
    stepper: 'Stepper',
    username: 'Username',
    placeholder: 'Enter username',
    switchComment: 'Switch Comment',
  },
});

const model = ref({
  username: '111',
});

const columns = computed<ProFormColumn[]>(() => [
  {
    name: 'username',
    label: t('username'),
    component: 'field',
    fieldProps: {
      placeholder: t('placeholder'),
      rules: [{ required: true, message: t('placeholder') }],
    },
  },
  {
    name: 'switch',
    label: t('switch'),
    component: 'switch',
    fieldProps: {
      inputAlign: 'right',
      labelComment: t('switchComment'),
    },
  },
  {
    name: 'stepper',
    label: t('stepper'),
    component: 'stepper',
    fieldProps: {
      inputAlign: 'right',
    },
  },
  {
    name: 'rate',
    label: t('rate'),
    component: 'rate',
    defaultValue: 3,
    fieldProps: {
      inputAlign: 'right',
    },
  },
  {
    name: 'slider',
    label: t('slider'),
    component: 'slider',
    defaultValue: 50,
    fieldProps: {
      labelAlign: 'top',
    },
  },
]);

const onSubmit = (values: Record<string, unknown>) => {
  console.log('pro-form submit', values);
};

const onFailed = (errorInfo: {
  values: Record<string, unknown>;
  errors: unknown[];
}) => {
  console.log('pro-form failed', errorInfo.values, errorInfo.errors);
};
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-pro-form v-model="model" ref="formRef" :columns="columns" :submit-text="t('submit')" @submit="onSubmit"
      @failed="onFailed" />
  </demo-block>
</template>
