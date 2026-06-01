<script setup lang="ts">
import VanField from '../../field';
import VanPopup from '../../popup';
import VanDatePicker from '../../date-picker';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import type { PickerConfirmEventParams } from '../../picker';

const t = useTranslate({
  'zh-CN': {
    label: '时间选择',
    placeholder: '点击选择时间',
  },
  'en-US': {
    label: 'Datetime Picker',
    placeholder: 'Select time',
  },
});

const modelValue = defineModel<string>({ default: '' });
const pickerValue = ref<string[]>([]);
const showPicker = ref(false);

const onConfirm = ({ selectedValues }: PickerConfirmEventParams) => {
  modelValue.value = selectedValues.join('-');
  pickerValue.value = selectedValues as string[];
  showPicker.value = false;
};

const onCancel = () => {
  showPicker.value = false;
};

const onFieldClick = () => {
  if (modelValue.value) {
    pickerValue.value = modelValue.value.split(/[-/]/);
  }
  showPicker.value = true;
};
</script>

<template>
  <van-field
    v-model="modelValue"
    input-border
    is-link
    readonly
    name="datePicker"
    :placeholder="t('placeholder')"
    @click="onFieldClick"
  />
  <van-popup
    v-model:show="showPicker"
    destroy-on-close
    round
    position="bottom"
    teleport="body"
  >
    <van-date-picker
      :model-value="pickerValue"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </van-popup>
</template>
