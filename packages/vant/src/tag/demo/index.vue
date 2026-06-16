<script setup lang="ts">
import VanCell from '../../cell';
import VanTag from '..';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础用法',
    plainTag: '浅色标签',
    tagStyle: '标签样式',
    mark: '角标标签',
    markPlain: '浅色角标',
    currency: '币种标签',
    currencyPreset: '币种预制',
    riskLevel: '理财风险等级',
    productType: '产品类型',
    statusTag: '状态标签',
    stamp: '印章标签',
    closeable: '可关闭标签',
    customSize: '标签大小',
    customColor: '自定义颜色',
    smallSize: '小号标签',
    mediumSize: '中号标签',
    largeSize: '大号标签',
    customBgColor: '背景颜色',
    customTextColor: '文字颜色',
    customPlainColor: '空心颜色',
    statusPending: '待审核',
    statusApproved: '已通过',
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    plainTag: 'Plain Tag',
    tagStyle: 'Tag Style',
    mark: 'Mark Tag',
    markPlain: 'Plain Mark',
    currency: 'Currency Tag',
    currencyPreset: 'Preset currency',
    riskLevel: 'Risk Level',
    productType: 'Product Type',
    statusTag: 'Status Tag',
    stamp: 'Stamp Tag',
    closeable: 'Closeable',
    customSize: 'Custom Size',
    customColor: 'Custom Color',
    smallSize: 'Small Size',
    mediumSize: 'Medium Size',
    largeSize: 'Large Size',
    customBgColor: 'Background Color',
    customTextColor: 'Text Color',
    customPlainColor: 'Plain Color',
    statusPending: 'Pending',
    statusApproved: 'Approved',
  },
});

const show = ref(true);
const close = () => {
  show.value = false;
};
</script>

<template>
  <demo-block card :title="t('basicUsage')">
    <van-cell :title="t('basicUsage')">
      <div class="demo-tag-row">
        <van-tag type="default">标签</van-tag>
        <van-tag type="success">标签</van-tag>
        <van-tag type="danger">标签</van-tag>
        <van-tag type="info">标签</van-tag>
        <van-tag icon="search">标签</van-tag>
      </div>
    </van-cell>
  </demo-block>

  <demo-block card :title="t('plainTag')">
    <van-cell :title="t('plainTag')">
      <div class="demo-tag-row">
        <van-tag plain type="default">标签</van-tag>
        <van-tag plain type="success">标签</van-tag>
        <van-tag plain type="danger">标签</van-tag>
        <van-tag plain type="info">标签</van-tag>
      </div>
    </van-cell>
  </demo-block>

  <demo-block card :title="t('tagStyle')">
    <van-cell :title="t('mark')">
      <template #value>
        <van-tag mark type="default">角标</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('markPlain')">
      <template #value>
        <van-tag mark plain type="success">角标</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('currency')">
      <template #value>
        <van-tag currency icon="photo-o">USD</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('currencyPreset')">
      <template #value>
        <div class="demo-tag-row">
          <van-tag currency currency-code="CNY" />
          <van-tag currency currency-code="USD" />
          <van-tag currency currency-code="EUR" />
          <van-tag currency currency-code="HKD" />
          <van-tag currency currency-code="JPY" />
        </div>
      </template>
    </van-cell>
    <van-cell :title="t('riskLevel')">
      <template #value>
        <div class="demo-tag-row">
          <van-tag preset="risk-high">中高风险</van-tag>
          <van-tag preset="risk-medium">中风险</van-tag>
          <van-tag preset="risk-low">低风险</van-tag>
          <van-tag preset="risk-new">新发</van-tag>
          <van-tag preset="risk-selected">精选</van-tag>
        </div>
      </template>
    </van-cell>
    <van-cell :title="t('productType')">
      <template #value>
        <div class="demo-tag-row">
          <van-tag preset="product-bill">票据</van-tag>
          <van-tag preset="product-finance">理财</van-tag>
          <van-tag preset="product-deposit">存款</van-tag>
          <van-tag preset="product-payroll">代发</van-tag>
        </div>
      </template>
    </van-cell>
    <van-cell :title="t('statusTag')">
      <template #value>
        <van-tag mark type="danger">{{ t('statusPending') }}</van-tag>
        <van-tag mark plain type="success">{{ t('statusApproved') }}</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('stamp')">
      <template #value>
        <div class="demo-tag-row">
          <van-tag stamp-type="success">预约已通过</van-tag>
          <van-tag stamp-type="success">预约审核已通过</van-tag>
          <van-tag stamp-type="fail">已拒绝</van-tag>
          <van-tag stamp-type="wait">待审核</van-tag>
          <van-tag stamp-type="void">作废</van-tag>
        </div>
      </template>
    </van-cell>
    <van-cell :title="t('closeable')">
      <template #value>
        <van-tag
          closeable
          :show="show"
          size="medium"
          type="default"
          @close="close"
        >
          标签
        </van-tag>
      </template>
    </van-cell>
  </demo-block>

  <demo-block card :title="t('customSize')">
    <van-cell :title="t('smallSize')">
      <template #value>
        <van-tag type="default">标签</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('mediumSize')">
      <template #value>
        <van-tag type="default" size="medium">标签</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('largeSize')">
      <template #value>
        <van-tag type="default" size="large">标签</van-tag>
      </template>
    </van-cell>
  </demo-block>

  <demo-block card :title="t('customColor')">
    <van-cell :title="t('customBgColor')">
      <template #value>
        <van-tag color="#7232dd">标签</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('customTextColor')">
      <template #value>
        <van-tag color="#ffe1e1" text-color="#ad0000">标签</van-tag>
      </template>
    </van-cell>
    <van-cell :title="t('customPlainColor')">
      <template #value>
        <van-tag color="#7232dd" plain>标签</van-tag>
      </template>
    </van-cell>
  </demo-block>
</template>

<style lang="less">
.demo-tag {
  .demo-tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--van-padding-xs);
    align-items: center;
  }

  .van-tag + .van-tag {
    margin-left: 0;
  }

  .van-cell__value .van-tag + .van-tag {
    margin-left: var(--van-padding-xs);
  }
}
</style>
