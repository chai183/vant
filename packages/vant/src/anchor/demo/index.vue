<script setup lang="ts">
import { ref } from 'vue';
import VanAnchor from '..';
import VanTabs from '../../tabs';
import VanTab from '../../tab';
import VanCell from '../../cell';
import VanCellGroup from '../../cell-group';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    backTopFixed: '回到顶部 · 常驻',
    backTopAuto: '回到顶部 · 非常驻',
    catalog: '目录',
    terms: '协议条款',
    section1: '协议一',
    section2: '协议二',
    section3: '协议三',
    termsContent: '协议正文区域',
  },
  'en-US': {
    backTopFixed: 'Back Top · Fixed',
    backTopAuto: 'Back Top · Auto',
    catalog: 'Catalog',
    terms: 'Terms',
    section1: 'Section 1',
    section2: 'Section 2',
    section3: 'Section 3',
    termsContent: 'Terms content',
  },
});

const activeTab = ref(0);
const list = [...Array(100).keys()];
const catalogItems = [
  { id: 'anchor-section-1', title: t('section1') },
  { id: 'anchor-section-2', title: t('section2') },
  { id: 'anchor-section-3', title: t('section3') },
];
</script>

<template>
  <van-tabs v-model:active="activeTab" :ellipsis="false">
    <van-tab :title="t('backTopFixed')">
      <van-cell v-for="item in list" :key="item" :title="item" />
      <van-anchor
        v-if="activeTab === 0"
        type="back-top"
        mode="fixed"
        text="顶部"
        :screen-offset="2"
      />
    </van-tab>

    <van-tab :title="t('backTopAuto')">
      <van-cell v-for="item in list" :key="item" :title="item" />
      <van-anchor
        v-if="activeTab === 1"
        type="back-top"
        mode="auto"
        text="顶部"
      />
    </van-tab>
    <!-- 目录 -->
    <van-tab :title="t('catalog')">
      <van-cell-group>
        <van-cell
          v-for="item in catalogItems"
          :id="item.id"
          :key="item.id"
          :title="item.title"
        >
          <div v-for="row in 80" :key="row">{{ item.title }} {{ row }}</div>
        </van-cell>
      </van-cell-group>
      <van-anchor
        v-if="activeTab === 2"
        type="catalog"
        mode="auto"
        :items="catalogItems"
      />
    </van-tab>
    <!-- 协议条款 -->
    <van-tab :title="t('terms')">
      <van-cell v-for="item in list.slice(0, 20)" :key="item" :title="item" />
      <div id="anchor-terms-target" class="anchor-terms-target">
        {{ t('termsContent') }}
      </div>
      <van-cell v-for="item in list.slice(20)" :key="item" :title="item" />
      <van-anchor
        v-if="activeTab === 3"
        text="查看附属条款1111"
        type="terms"
        terms-target="#anchor-terms-target"
      />
    </van-tab>
  </van-tabs>
</template>

<style lang="less">
.anchor-terms-target {
  margin: 16px;
  padding: 24px 16px;
  background: var(--van-background-2);
  border-radius: var(--van-radius-lg);
  text-align: center;
}
</style>
