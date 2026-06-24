<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    inputBorder: '筛选关键词',
    label: '文本',
    placeholder: '请输入筛选关键词',
    unit: '单位',
  },
  'en-US': {
    inputBorder: 'Input Border',
    label: 'Label',
    placeholder: 'Please enter',
    unit: 'Unit',
  },
});

const value = ref('');
</script>

<template>
  <demo-block :title="t('inputBorder')">
    <van-cell-group inset :style="{ '--van-cell-group-inset-radius': '0' }">
      <van-field v-model="value" :placeholder="t('placeholder')" input-border />
    </van-cell-group>
  </demo-block>
</template>
