<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import ProFormDeliverySlotField from './ProFormDeliverySlotField';
import type { DeliverySlotValue } from './ProFormDeliverySlotField';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    deliverySlot: '配送时段',
    deliveryPlaceholder: '请选择配送日期与时段',
    deliveryRequired: '请完整选择配送信息',
    deliveryPopupTitle: '选择配送时段',
    deliveryDate: '配送日期',
    deliveryPeriod: '配送时段',
    periodMorning: '上午 9:00-12:00',
    periodAfternoon: '下午 14:00-18:00',
    periodEvening: '晚上 19:00-21:00',
    deliveryUrgent: '加急配送',
    deliveryUrgentTag: '加急',
    confirm: '确定',
    cancel: '取消',
  },
  'en-US': {
    deliverySlot: 'Delivery Slot',
    deliveryPlaceholder: 'Select date and time slot',
    deliveryRequired: 'Please complete delivery info',
    deliveryPopupTitle: 'Select delivery slot',
    deliveryDate: 'Date',
    deliveryPeriod: 'Time slot',
    periodMorning: 'Morning 9:00-12:00',
    periodAfternoon: 'Afternoon 14:00-18:00',
    periodEvening: 'Evening 19:00-21:00',
    deliveryUrgent: 'Express delivery',
    deliveryUrgentTag: 'Express',
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
});

const model = ref({});

const columns = computed<ProFormColumn[]>(() => [
  {
    name: 'deliverySlot',
    label: t('deliverySlot'),
    defaultValue: {
      date: '2026/5/28',
      period: 'morning',
      urgent: false,
    } satisfies DeliverySlotValue,
    fieldProps: {
      rules: [
        {
          validator: (val: DeliverySlotValue) => !!(val?.date && val?.period),
          message: t('deliveryRequired'),
        },
      ],
    },
    render: () => <ProFormDeliverySlotField />,
    componentProps: {
      placeholder: t('deliveryPlaceholder'),
      popupTitle: t('deliveryPopupTitle'),
      dateTitle: t('deliveryDate'),
      periodTitle: t('deliveryPeriod'),
      urgentLabel: t('deliveryUrgent'),
      urgentTag: t('deliveryUrgentTag'),
      confirmText: t('confirm'),
      cancelText: t('cancel'),
      periodOptions: [
        { label: t('periodMorning'), value: 'morning' },
        { label: t('periodAfternoon'), value: 'afternoon' },
        { label: t('periodEvening'), value: 'evening' },
      ],
    },
  },
]);
</script>

<template>
  <demo-block :title="t('deliverySlot')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
