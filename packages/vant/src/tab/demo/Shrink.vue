<script setup lang="ts">
import { ref } from 'vue';
import VanTabs from '../../tabs';
import VanTab from '..';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    tab: '标签 ',
    shrink: '收缩布局',
    content: '内容',
  },
  'en-US': {
    tab: 'Tab ',
    shrink: 'Shrink',
    content: 'content of tab',
  },
});

const tabs = [1, 2, 3, 4];
const active1 = ref(0);
</script>

<template>
  <demo-block :title="t('shrink')">
    <van-tabs v-model:active="active1" type="underline" shrink>
      <van-tab :title="t('tab') + index" v-for="index in tabs" :key="index">
        {{ t('content') }} {{ index }}
      </van-tab>
    </van-tabs>
  </demo-block>
</template>
