<script setup lang="ts">
import { computed, ref } from 'vue';
import { areaList } from '@vant/area-data';
import { useTranslate } from '../../../docs/site';
import { basicColumns } from '../../picker/demo/data';
import { areaListEn } from '../../area/demo/area-en';
import VanProForm from '..';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    selectFields: '选择类字段',
    picker: '选择器',
    pickerPlaceholder: '请选择城市',
    datePicker: '时间选择',
    datePickerPlaceholder: '请选择时间',
    area: '地区选择',
    areaPlaceholder: '请选择省市区',
    areaStepCascader: '步骤条省市区',
    areaStepCascaderPlaceholder: '请选择省市区',
    calendar: '日历',
    calendarPlaceholder: '请选择日期',
    textColumns: basicColumns['zh-CN'],
    areaListData: areaList,
  },
  'en-US': {
    selectFields: 'Select Fields',
    picker: 'Picker',
    pickerPlaceholder: 'Select city',
    datePicker: 'Datetime Picker',
    datePickerPlaceholder: 'Select time',
    area: 'Area Picker',
    areaPlaceholder: 'Select area',
    areaStepCascader: 'Step Area Picker',
    areaStepCascaderPlaceholder: 'Select area',
    calendar: 'Calendar',
    calendarPlaceholder: 'Select date',
    textColumns: basicColumns['en-US'],
    areaListData: areaListEn,
  },
});

const model = ref({});

const columns = computed<ProFormColumn[]>(() => [
  {
    name: 'picker',
    label: t('picker'),
    component: 'picker',
    fieldProps: { placeholder: t('pickerPlaceholder') },
    componentProps: { columns: t('textColumns') },
  },
  {
    name: 'datePicker',
    label: t('datePicker'),
    component: 'datePicker',
    fieldProps: { placeholder: t('datePickerPlaceholder') },
  },
  {
    name: 'area',
    label: t('area'),
    component: 'area',
    fieldProps: { placeholder: t('areaPlaceholder') },
    componentProps: { areaList: t('areaListData') },
  },
  {
    name: 'areaStepCascader',
    label: t('areaStepCascader'),
    component: 'areaStepCascader',
    fieldProps: { placeholder: t('areaStepCascaderPlaceholder') },
  },
  {
    name: 'calendar',
    label: t('calendar'),
    component: 'calendar',
    fieldProps: { placeholder: t('calendarPlaceholder'), labelTooltip: '111' },
  },
]);
</script>

<template>
  <demo-block :title="t('selectFields')">
    <van-pro-form v-model="model" :columns="columns" :show-submit="false" />
  </demo-block>
</template>
