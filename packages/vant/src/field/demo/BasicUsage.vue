<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    label: '文本',
    longLabel: '多行标题文本录入极限状态展示',
    amountLabel: '有辅助信息',
    labelTooltip: '单笔转账上限 ¥50,000',
  },
  'en-US': {
    label: 'Label',
    longLabel: 'MultiLineTitleTextInputLimitStateDisplay',
    amountLabel: 'With helper info',
    labelTooltip: 'Maximum ¥50,000 per transfer',
  },
});

const value = ref('');
const longLabelValue = ref('');
const tooltipValue = ref('');
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-cell-group inset>
      <van-field v-model="value" :label="t('label')" />
      <van-field v-model="longLabelValue" :label="t('longLabel')" />
      <van-field
        v-model="tooltipValue"
        :label="t('amountLabel')"
        :label-tooltip="t('labelTooltip')"
      />
    </van-cell-group>
  </demo-block>
</template>
