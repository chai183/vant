<script setup lang="ts">
import VanSteps from '..';
import VanStep from '../../step';
import VanButton from '../../button';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    nextStep: '下一步',
    step1: '买家下单',
    step2: '商家接单',
    step3: '买家提货',
    step4: '交易完成',
    step1Desc: '等待买家付款',
    step2Desc: '商家已接单',
    step3Desc: '等待买家提货',
    step4Desc: '交易已完成',
    title2: '描述信息',
    title3: '竖向步骤条',
    title4: '可折叠步骤条',
    title5: '倒序步骤条',
    title6: '异常状态',
    status1: '【城市】物流状态1',
    status2: '【城市】物流状态',
    status3: '快件已发货',
    status1Desc: '快件已到达',
    status2Desc: '快件运输中',
    status3Desc: '快件已发货',
    customStyle: '自定义样式',
    stepTitle1: '提交订单',
    stepTitle2: '支付订单',
    stepTitle3: '商家发货',
    stepTitle4: '交易完成',
    extra1: '2016-07-12 12:40',
    extra2: '2016-07-11 10:00',
    extra3: '2016-07-10 09:30',
  },
  'en-US': {
    nextStep: 'Next Step',
    step1: 'Step1',
    step2: 'Step2',
    step3: 'Step3',
    step4: 'Step4',
    step1Desc: 'Waiting for payment',
    step2Desc: 'Order accepted',
    step3Desc: 'Waiting for pickup',
    step4Desc: 'Completed',
    title2: 'Description',
    title3: 'Vertical Steps',
    title4: 'Collapsible Steps',
    title5: 'Reverse Steps',
    title6: 'Error Status',
    status1: '【City】Status1',
    status2: '【City】Status2',
    status3: '【City】Status3',
    status1Desc: 'Package arrived',
    status2Desc: 'In transit',
    status3Desc: 'Shipped',
    customStyle: 'Custom Style',
    stepTitle1: 'Submit Order',
    stepTitle2: 'Pay Order',
    stepTitle3: 'Ship Order',
    stepTitle4: 'Complete',
    extra1: '2016-07-12 12:40',
    extra2: '2016-07-11 10:00',
    extra3: '2016-07-10 09:30',
  },
});

const active = ref(1);
const activeVertical = ref(1);

const nextStep = () => {
  active.value = ++active.value % 4;
};
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-steps :active="active">
      <van-step>{{ t('step1') }}</van-step>
      <van-step>{{ t('step2') }}</van-step>
      <van-step>{{ t('step3') }}</van-step>
      <van-step>{{ t('step4') }}</van-step>
    </van-steps>

    <van-button @click="nextStep">{{ t('nextStep') }}</van-button>
  </demo-block>

  <demo-block :title="t('title2')">
    <van-steps :active="active">
      <van-step :description="t('step1Desc')">{{ t('step1') }}</van-step>
      <van-step :description="t('step2Desc')">{{ t('step2') }}</van-step>
      <van-step :description="t('step3Desc')">{{ t('step3') }}</van-step>
      <van-step :description="t('step4Desc')">{{ t('step4') }}</van-step>
    </van-steps>
  </demo-block>

  <demo-block :title="t('customStyle')">
    <van-steps
      :active="active"
      active-icon="success"
      inactive-icon="arrow"
      active-color="#07c160"
    >
      <van-step>{{ t('step1') }}</van-step>
      <van-step>{{ t('step2') }}</van-step>
      <van-step>{{ t('step3') }}</van-step>
      <van-step>{{ t('step4') }}</van-step>
    </van-steps>
  </demo-block>

  <demo-block :title="t('title6')">
    <van-steps :active="2">
      <van-step>{{ t('step1') }}</van-step>
      <van-step>{{ t('step2') }}</van-step>
      <van-step status="error">{{ t('step3') }}</van-step>
      <van-step>{{ t('step4') }}</van-step>
    </van-steps>
  </demo-block>

  <demo-block :title="t('title3')">
    <van-steps :active="activeVertical" direction="vertical">
      <van-step :description="t('status1Desc')">
        {{ t('status1') }}
        <template #extra>{{ t('extra1') }}</template>
      </van-step>
      <van-step :description="t('status2Desc')">
        {{ t('status2') }}
        <template #extra>{{ t('extra2') }}</template>
      </van-step>
      <van-step :description="t('status3Desc')">
        {{ t('status3') }}
        <template #extra>{{ t('extra3') }}</template>
      </van-step>
    </van-steps>
  </demo-block>

  <demo-block :title="t('title4')">
    <van-steps :active="activeVertical" direction="vertical" collapsible>
      <van-step :description="t('status1Desc')">
        {{ t('status1') }}
        <template #extra>{{ t('extra1') }}</template>
      </van-step>
      <van-step :description="t('status2Desc')">
        {{ t('status2') }}
        <template #extra>{{ t('extra2') }}</template>
      </van-step>
      <van-step :description="t('status3Desc')">
        {{ t('status3') }}
        <template #extra>{{ t('extra3') }}</template>
      </van-step>
    </van-steps>
  </demo-block>

  <demo-block :title="t('title5')">
    <van-steps :active="0" direction="vertical" reverse collapsible>
      <van-step :description="t('status1Desc')">
        {{ t('status1') }}
        <template #extra>{{ t('extra1') }}</template>
      </van-step>
      <van-step :description="t('status2Desc')">
        {{ t('status2') }}
        <template #extra>{{ t('extra2') }}</template>
      </van-step>
      <van-step :description="t('status3Desc')">
        {{ t('status3') }}
        <template #extra>{{ t('extra3') }}</template>
      </van-step>
    </van-steps>
  </demo-block>
</template>

<style lang="less">
.demo-steps {
  .van-button {
    margin: var(--van-padding-md) 0 0 var(--van-padding-md);
  }

  p,
  h3 {
    font-weight: normal;
    font-size: inherit;
  }
}
</style>
