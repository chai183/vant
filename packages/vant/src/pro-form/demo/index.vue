<script setup lang="tsx">
import { computed, ref } from 'vue';
import { areaList } from '@vant/area-data';
import { cdnURL, useTranslate } from '../../../docs/site';
import { basicColumns } from '../../picker/demo/data';
import { areaListEn } from '../../area/demo/area-en';
import VanProForm from '..';
import Field from '../../field';
import ProFormDeliverySlotField from './ProFormDeliverySlotField';
import type { DeliverySlotValue } from './ProFormDeliverySlotField';
import type { UploaderFileUpload } from '../../uploader-file';
import type { ProFormColumn, ProFormRenderContext } from '../types';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '配置化生成',
    rate: '评分',
    radio: '单选框',
    radioPicker: '单选弹窗',
    radioPickerPlaceholder: '点击选择',
    radioListPicker: '单选列表弹窗',
    checkboxPicker: '多选弹窗',
    checkboxPickerPlaceholder: '点击选择',
    checkboxListPicker: '多选列表弹窗',
    option1: '选项 1',
    option2: '选项 2',
    option3: '选项 3',
    optionDesc: '描述信息',
    submit: '提交',
    switch: '开关',
    slider: '滑块',
    stepper: '步进器',
    checkbox: '复选框复选框复选框复选框',
    uploader: '上传图片',
    checkboxGroup: '复选框组',
    requireCheckbox: '请勾选复选框',
    username: '用户名',
    placeholder: '请输入用户名',
    picker: '选择器',
    pickerPlaceholder: '点击选择城市',
    datePicker: '时间选择',
    datePickerPlaceholder: '点击选择时间',
    area: '地区选择',
    areaPlaceholder: '点击选择省市区',
    areaStepCascader: '步骤条省市区',
    areaStepCascaderPlaceholder: '点击选择省市区',
    calendar: '日历',
    calendarPlaceholder: '点击选择日期',
    fieldMoney: '金额输入',
    fieldMoneyPlaceholder: '请输入转账金额',
    fieldMoneyLabelTooltip: '转账金额提示',
    fieldChildren: '动态子项',
    fieldChildrenTitle: '可添加子选项列表',
    fieldChildrenAdd: '添加',
    fieldChildrenOption: '选项名称',
    fieldChildrenPlaceholder: '请输入',
    fieldChildrenDefaultRow: '新选项',
    rangeInput: '范围录入',
    rangeInputVertical: '范围录入-上下布局',
    rangeInputHorizontal: '范围录入-左右布局',
    rangeInputPlaceholder: '请输入',
    rangeInputLabelTooltip: '范围录入提示',
    rangeInputUnit: '单位',
    uploaderFile: '上传文件',
    uploaderFileDesc1: '所上传格式支持 DOC/PPT/XLS/VSD/POT 等',
    uploaderFileDesc2: '所上传文件大小控制在 20M 以内，支持批量上传',
    uploaderFileUpload: '添加附件',
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
    textColumns: basicColumns['zh-CN'],
    areaListData: areaList,
  },
  'en-US': {
    basicUsage: 'Schema Form',
    rate: 'Rate',
    radio: 'Radio',
    radioPicker: 'Radio Popup',
    radioPickerPlaceholder: 'Select option',
    radioListPicker: 'Radio List Popup',
    checkboxPicker: 'Checkbox Popup',
    checkboxPickerPlaceholder: 'Select options',
    checkboxListPicker: 'Checkbox List Popup',
    option1: 'Option 1',
    option2: 'Option 2',
    option3: 'Option 3',
    optionDesc: 'Description',
    submit: 'Submit',
    switch: 'Switch',
    slider: 'Slider',
    stepper: 'Stepper',
    checkbox: 'Checkbox',
    uploader: 'Uploader',
    checkboxGroup: 'Checkbox Group',
    requireCheckbox: 'Checkbox is required',
    username: 'Username',
    placeholder: 'Enter username',
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
    fieldMoney: 'Money Input',
    fieldMoneyPlaceholder: 'Enter transfer amount',
    fieldMoneyLabelTooltip: 'Transfer amount hint',
    fieldChildren: 'Dynamic List',
    fieldChildrenTitle: 'Addable option list',
    fieldChildrenAdd: 'Add',
    fieldChildrenOption: 'Option',
    fieldChildrenPlaceholder: 'Please enter',
    fieldChildrenDefaultRow: 'New option',
    rangeInput: 'Range Input',
    rangeInputVertical: 'Vertical layout',
    rangeInputHorizontal: 'Horizontal layout',
    rangeInputPlaceholder: 'Please enter',
    rangeInputLabelTooltip: 'Range input hint',
    rangeInputUnit: 'Unit',
    uploaderFile: 'File Upload',
    uploaderFileDesc1: 'Supported formats: DOC, PPT, XLS, VSD, POT, etc.',
    uploaderFileDesc2: 'Max file size 20MB. Batch upload supported.',
    uploaderFileUpload: 'Add Attachment',
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
    textColumns: basicColumns['en-US'],
    areaListData: areaListEn,
  },
});

const renderRangeStart = () => (
  <Field inputBorder placeholder={t('rangeInputPlaceholder')} />
);

const renderRangeEnd = () => (
  <Field inputBorder placeholder={t('rangeInputPlaceholder')} />
);

const renderFieldChildrenRow = () => (
  <Field
    label={t('fieldChildrenOption')}
    placeholder={t('fieldChildrenPlaceholder')}
    border={false}
  />
);

const demoUploaderFileUpload: UploaderFileUpload = (item) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ url: `https://example.com/${item.file?.name || 'file'}` });
    }, 300);
  });

const listOptions = computed(() => [
  { label: t('option1'), value: '1' },
  {
    label: t('option2'),
    value: '2',
    cellProps: { label: t('optionDesc') },
  },
  {
    label: t('option3'),
    value: '3',
    disabled: true,
    cellProps: { icon: 'shop-o' },
  },
  {
    label: [t('option3'), t('optionDesc')],
    value: '3',
    disabled: true,
    cellProps: { icon: 'shop-o' },
  },
]);

const model = ref({
  username: '111'
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
      inputAlign: 'right'
    }
  },
  {
    name: 'checkbox',
    label: t('checkbox'),
    component: 'checkbox',
    defaultValue: true,
    fieldProps: {
      rules: [{ validator: (val) => !!val, message: t('requireCheckbox') }],
    },
  },
  { name: 'checkboxGroup', label: t('checkboxGroup'), component: 'checkboxGroup' },
  { name: 'radio', label: t('radio'), component: 'radio', defaultValue: '1' },
  {
    name: 'radioPicker',
    label: t('radioPicker'),
    component: 'radioPicker',
    defaultValue: '1',
    fieldProps: { placeholder: t('radioPickerPlaceholder') },
    componentProps:{
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
    name: 'stepper', label: t('stepper'), component: 'stepper', fieldProps: {
      inputAlign: 'right'
    }
  },
  {
    name: 'rate', label: t('rate'), component: 'rate', defaultValue: 3, fieldProps: {
      inputAlign: 'right'
    }
  },
  {
    name: 'slider',
    label: t('slider'),
    component: 'slider',
    defaultValue: 50,
    fieldProps: {
      labelAlign: 'top',
    }
  },
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
    fieldProps: { placeholder: t('calendarPlaceholder'), labelTooltip: "111" },
  },
  {
    name: 'amount',
    label: t('fieldMoney'),
    component: 'fieldMoney',
    defaultValue: '1000',
    fieldProps: {
      placeholder: t('fieldMoneyPlaceholder'),
      labelTooltip: t('fieldMoneyLabelTooltip'),
      rules: [{ required: true, message: t('fieldMoneyPlaceholder') }],
    },
    componentProps: { currency: '¥' },
  },
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
  {
    name: 'uploader',
    label: t('uploader'),
    component: 'uploader',
    defaultValue: [{ url: cdnURL('leaf.jpeg') }],
    componentProps: { maxCount: 2 },
    fieldProps: {
      labelAlign: 'top',
    }
  },
  {
    name: 'attachments',
    label: t('uploaderFile'),
    component: 'uploaderFile',
    defaultValue: [],
    fieldProps: {
      rules: [{
        required: true,
        message: t('rangeInputPlaceholder'),
      }],
    },
    componentProps: {
      description: [t('uploaderFileDesc1'), t('uploaderFileDesc2')],
      uploadText: t('uploaderFileUpload'),
      upload: demoUploaderFileUpload,
      accept: '*',
      multiple: true,
      maxSize: 20 * 1024 * 1024,
    },
  },
  {
    name: 'rangeVertical',
    label: t('rangeInputVertical'),
    component: 'rangeInput',
    defaultValue: ['', ''],
    fieldProps: {
      rules: [{
        required: true,
        message: t('rangeInputPlaceholder'),
        validator: (value: string[]) => {
          return value[0] !== '' && value[1] !== '';
        }
      }],
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

<style lang="less">
.demo-pro-form__range-unit {
  margin-left: var(--van-padding-xs);
  color: var(--van-text-color-2);
  font-size: var(--van-font-size-sm);
  white-space: nowrap;
}
</style>
