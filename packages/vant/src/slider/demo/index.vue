<script setup lang="ts">
import VanSlider from '..';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const AMOUNT_MIN = 0;
const AMOUNT_MAX = 100000000000;

const t = useTranslate({
  'zh-CN': {
    text: '当前值：',
    title1: '单项滑动',
    title2: '区间滑动',
    title3: '节点区间选择',
    title4: '选择金额区间',
    title5: '选择金额',
    title6: '指定选择范围',
    title7: '禁用',
    title8: '指定步长',
    unselected: '未选择',
    vertical: '垂直方向',
    customStyle: '自定义样式',
    customButton: '自定义按钮',
    minPlaceholder: '¥ 最低金额',
    maxPlaceholder: '¥ 最高金额',
  },
  'en-US': {
    text: 'Current value: ',
    title1: 'Single Slider',
    title2: 'Range Slider',
    title3: 'Node Range Slider',
    title4: 'Amount Range',
    title5: 'Select Amount',
    title6: 'Range',
    title7: 'Disabled',
    title8: 'Step size',
    unselected: 'Unselected',
    vertical: 'Vertical',
    customStyle: 'Custom Style',
    customButton: 'Custom Button',
    minPlaceholder: '¥ Min amount',
    maxPlaceholder: '¥ Max amount',
  },
});

const singleValue = ref(50);
const rangeValue = ref<[number, number]>([20, 80]);
const nodeRangeValue = ref<[number, number]>([400, 800]);
const amountRange = ref<[number, number]>([3000, 30000000000]);
const singleAmount = ref(AMOUNT_MIN);

const value3 = ref(0);
const value4 = ref(50);
const value5 = ref(50);
const value6 = ref(50);
const value7 = ref(50);
const value8 = ref(50);
const value9 = ref<[number, number]>([20, 60]);

const onChange = (value: string | number | [number, number]) =>
  showToast(t('text') + value);
</script>

<template>
  <demo-block :title="t('title1')">
    <van-slider v-model="singleValue" type="single" @change="onChange" />
  </demo-block>

  <demo-block :title="t('title2')">
    <van-slider
      v-model="rangeValue"
      type="range"
      :min="0"
      :max="100"
      @change="onChange"
    />
  </demo-block>

  <demo-block :title="t('title3')">
    <van-slider
      v-model="nodeRangeValue"
      type="node-range"
      :min="200"
      :max="600"
      :step="200"
      @change="onChange"
    />
  </demo-block>

  <demo-block :title="t('title4')">
    <van-slider
      v-model="amountRange"
      type="range"
      show-inputs
      :min="AMOUNT_MIN"
      :max="AMOUNT_MAX"
      :min-placeholder="t('minPlaceholder')"
      :max-placeholder="t('maxPlaceholder')"
    />
  </demo-block>

  <demo-block :title="t('title5')">
    <van-slider
      v-model="singleAmount"
      type="single"
      show-value
      :min="AMOUNT_MIN"
      :max="AMOUNT_MAX"
      :unselected-text="t('unselected')"
    />
  </demo-block>

  <demo-block :title="t('title6')">
    <van-slider v-model="value3" type="single" :min="-50" :max="50" />
  </demo-block>

  <demo-block :title="t('title7')">
    <van-slider v-model="value4" type="single" disabled />
  </demo-block>

  <demo-block :title="t('title8')">
    <van-slider v-model="value5" type="single" :step="10" @change="onChange" />
  </demo-block>

  <demo-block :title="t('customStyle')">
    <van-slider
      v-model="value6"
      type="single"
      active-color="#ff6b00"
      @change="onChange"
    />
  </demo-block>

  <demo-block :title="t('customButton')">
    <van-slider v-model="value7" type="single">
      <template #button>
        <div class="custom-button">{{ value7 }}</div>
      </template>
    </van-slider>
  </demo-block>

  <demo-block :title="t('vertical')">
    <div class="demo-slider-vertical">
      <van-slider v-model="value8" type="single" vertical @change="onChange" />
      <van-slider v-model="value9" type="range" vertical @change="onChange" />
      <van-slider
        v-model="nodeRangeValue"
        type="node-range"
        vertical
        :min="200"
        :max="1000"
        :step="200"
        @change="onChange"
      />
    </div>
  </demo-block>
</template>

<style lang="less">
.demo-slider {
  user-select: none;

  .van-doc-demo-block {
    padding: 0 var(--van-padding-md) 20px;
  }

  .van-doc-demo-block__title {
    padding-left: 0;
  }

  .custom-button {
    width: 26px;
    color: #fff;
    font-size: 10px;
    line-height: 18px;
    text-align: center;
    background-color: var(--van-primary-color);
    border-radius: 100px;
  }

  &-vertical {
    display: flex;
    gap: 40px;
    align-items: flex-start;
    height: 200px;
    padding-left: 16px;
  }
}
</style>
