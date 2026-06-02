<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    fieldMoney: '金额输入',
    fieldMoneyPlaceholder: '请输入转账金额',
    fieldMoneyLabelTooltip: '转账金额提示',
  },
  'en-US': {
    fieldMoney: 'Money Input',
    fieldMoneyPlaceholder: 'Enter transfer amount',
    fieldMoneyLabelTooltip: 'Transfer amount hint',
  },
});

const model = ref({});

const columns = computed<ProFormColumn[]>(() => [
  {
    name: 'amount',
    label: t('fieldMoney'),
    component: 'fieldMoney',
    defaultValue: '1000',
    fieldProps: {
      placeholder: t('fieldMoneyPlaceholder'),
      labelTooltip: t('fieldMoneyLabelTooltip'),
      rules: [{ required: true, message: t('fieldMoneyPlaceholder') }],
      errorMessageInfo: true,
    },
    componentProps: { currency: '¥' },
  },
]);
</script>

<template>
  <demo-block :title="t('fieldMoney')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
