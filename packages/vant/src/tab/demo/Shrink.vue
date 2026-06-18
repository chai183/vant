<script setup lang="ts">
import { ref } from 'vue';
import VanTabs from '../../tabs';
import VanTab from '..';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    tab: '标签 ',
    shrink: '收缩布局',
    shrinkOverflow: '收缩布局溢出',
    shrinkOverflowShadow: '收缩布局溢出-阴影',
    content: '内容',
  },
  'en-US': {
    tab: 'Tab ',
    shrink: 'Shrink',
    shrinkOverflow: 'Shrink overflow',
    shrinkOverflowShadow: 'Shrink overflow shadow',
    content: 'content of tab',
  },
});

const tabs = [1, 2, 3, 4];
const active1 = ref(0);
const activeOverflow = ref(0);
const activeOverflowShadow = ref(0);
</script>

<template>
  <demo-block :title="t('shrink')">
    <van-tabs v-model:active="active1" shrink>
      <van-tab :title="t('tab') + index" v-for="index in tabs" :key="index">
        {{ t('content') }} {{ index }}
      </van-tab>
    </van-tabs>
  </demo-block>

  <demo-block :title="t('shrinkOverflow')">
    <van-tabs v-model:active="activeOverflow" shrink>
      <van-tab v-for="index in 8" :title="t('tab') + index" :key="index">
        {{ t('content') }} {{ index }}
      </van-tab>
    </van-tabs>
  </demo-block>

  <demo-block :title="t('shrinkOverflowShadow')">
    <van-tabs
      v-model:active="activeOverflowShadow"
      shrink
      nav-overflow="shadow"
    >
      <van-tab v-for="index in 8" :title="t('tab') + index" :key="index">
        {{ t('content') }} {{ index }}
      </van-tab>
    </van-tabs>
  </demo-block>
</template>
