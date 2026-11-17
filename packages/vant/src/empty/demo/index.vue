<script setup lang="ts">
import VanEmpty from '..';
import VanTabs from '../../tabs';
import VanTab from '../../tab';
import VanButton from '../../button';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import customImage from '../assets/default.svg';
const t = useTranslate({
  'zh-CN': {
    error: '通用错误',
    search: '搜索提示',
    network: '网络错误',
    illustrationText: '插图 + 文字型',
    textOnly: '文字型(无插图)',
    illustrationTextButton: '插图 + 文字型 + 按钮型',
    illustrationTextTipsButton: '插图 + 文字型 + 辅助说明 + 按钮型',
    descLabel: '描述',
    noteLabel: '注意点',
    illustrationTextDesc: '由插图和文字构成，插图通常代表文字的含义',
    illustrationTextNote: '用在全局无数据内容的场景',
    imageType: '图片类型',
    customSize: '自定义大小',
    description: '描述文字',
    secondaryDescription: '辅助说明文字',
    customImage: '自定义图片',
    bottomContent: '底部内容',
  },
  'en-US': {
    error: 'Error',
    search: 'Search',
    network: 'Network',
    illustrationText: 'illustration + text',
    textOnly: 'Text only (no illustration)',
    illustrationTextButton: 'Illustration + text + button',
    illustrationTextTipsButton: '插图 + 文字型 + 辅助说明 + 按钮型',
    imageType: 'Image Type',
    customSize: 'Custom Size',
    description: 'Description',
    secondaryDescription: 'Secondary Description',
    customImage: 'Custom Image',
    bottomContent: 'Bottom Content',
  },
});

const active = ref('error');
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <!-- 插图 + 文字型-->
    <van-empty :description="t('description')" :show-image="true" />

    <!-- 文字型 (无插图) -->
    <van-empty :description="t('description')" :show-image="false" />

    <!-- 插图 + 文字型 + 按钮型 -->
    <van-empty :description="t('description')">
      <van-button :width="96" round type="primary" class="bottom-button">
        去添加
      </van-button>
    </van-empty>

    <!-- 插图 + 文字型 + 辅助说明 + 按钮型 -->
    <van-empty
      :description="t('description')"
      :secondary-description="t('secondaryDescription')"
    >
      <van-button :width="96" round type="primary" class="bottom-button">
        去添加
      </van-button>
    </van-empty>
  </demo-block>

  <demo-block :title="t('imageType')">
    <van-tabs v-model:active="active">
      <van-tab name="error" :title="t('error')">
        <van-empty image="error" :description="t('description')" />
      </van-tab>
      <van-tab name="network" :title="t('network')">
        <van-empty image="network" :description="t('description')" />
      </van-tab>
      <van-tab name="search" :title="t('search')">
        <van-empty image="search" :description="t('description')" />
      </van-tab>
    </van-tabs>
  </demo-block>

  <demo-block :title="t('customSize')">
    <van-empty image-size="100" :description="t('description')" />
  </demo-block>

  <demo-block :title="t('customImage')">
    <van-empty
      :image="customImage"
      :image-size="80"
      :description="t('description')"
    />
  </demo-block>

  <demo-block :title="t('bottomContent')">
    <van-empty :description="t('description')">
      <van-button :width="96" round type="primary" class="bottom-button">
        去添加
      </van-button>
    </van-empty>
  </demo-block>
</template>

<style lang="less">
.demo-empty {
  background: var(--van-background-2);

  .van-doc-demo-block__title {
    font-size: 18px;
    line-height: 24px;
  }

  .bottom-button {
    width: 160px;
    height: 40px;
  }
}
</style>
