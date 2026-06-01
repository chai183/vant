<script setup lang="ts">
import { useTranslate } from '../../../docs/site';
import VanResult from '..';

const t = useTranslate({
  'zh-CN': {
    waiting: '等待状态',
    fail: '失败状态',
    warning: '异常状态',
    success: '成功状态',
    waitingTitle: '等待XX',
    failTitle: 'XX失败',
    warningTitle: 'XX异常',
    successTitle: 'XX成功',
    amount: '15,000,000.00',
    amountCaption: '此处为金额大写及显示',
    note: '此处为异常标记、业务反馈或进度提示等备注信息，最多展示两行',
    mainAction: '主要操作',
    secondaryAction: '次要操作',
    secondaryAction1: '次要操作1',
    secondaryAction2: '次要操作2',
    cardTitle1: '卡片内模块1',
    cardTitle2: '卡片内模块2',
    cardContent: '此处为卡片内模块内容',
    toastMain: '点击了主要操作',
    toastSecondary: '点击了次要操作',
    toastSecondary2: '点击了次要操作2',
    buttonLayout: '按钮布局',
    buttonLayoutNote: '通过 button-layout 配置排列方式，不依赖 status 默认值',
    layoutHorizontal: 'horizontal 左右并排',
    layoutVertical: 'vertical 上下堆叠',
    layoutHybrid: 'hybrid 主按钮通栏 + 次按钮并排',
  },
  'en-US': {
    waiting: 'Waiting',
    fail: 'Failure',
    warning: 'Warning',
    success: 'Success',
    waitingTitle: 'Waiting',
    failTitle: 'Failed',
    warningTitle: 'Exception',
    successTitle: 'Succeeded',
    amount: '15,000,000.00',
    amountCaption: 'Amount in words',
    note: 'Remarks, feedback or progress tips (up to two lines)',
    mainAction: 'Main Action',
    secondaryAction: 'Secondary Action',
    secondaryAction1: 'Secondary 1',
    secondaryAction2: 'Secondary 2',
    cardTitle1: 'Card Module 1',
    cardTitle2: 'Card Module 2',
    cardContent: 'Card content goes here',
    toastMain: 'Main action clicked',
    toastSecondary: 'Secondary action clicked',
    toastSecondary2: 'Secondary action 2 clicked',
    buttonLayout: 'Button Layout',
    buttonLayoutNote: 'Use button-layout to control arrangement',
    layoutHorizontal: 'horizontal',
    layoutVertical: 'vertical',
    layoutHybrid: 'hybrid',
  },
});

const onMain = () => {
  // eslint-disable-next-line no-console
  console.log(t('toastMain'));
};

const onSecondary = () => {
  // eslint-disable-next-line no-console
  console.log(t('toastSecondary'));
};

const onSecondary2 = () => {
  // eslint-disable-next-line no-console
  console.log(t('toastSecondary2'));
};
</script>

<template>
  <demo-block :title="t('waiting')">
    <van-result
      status="waiting"
      :title="t('waitingTitle')"
      :description="t('note')"
      :main-button-text="t('mainAction')"
      :secondary-button-text="t('secondaryAction')"
      @click-main-button="onMain"
      @click-secondary-button="onSecondary"
    >
      <div class="result-demo__amount">
        <div class="result-demo__amount-value">{{ t('amount') }}</div>
        <div class="result-demo__amount-caption">
          {{ t('amountCaption') }}
        </div>
      </div>
      <template #footer>
        <div class="result-demo__card">
          <div class="result-demo__card-title">{{ t('cardTitle1') }}</div>
          <div class="result-demo__card-content">{{ t('cardContent') }}</div>
        </div>
        <div class="result-demo__card">
          <div class="result-demo__card-title">{{ t('cardTitle2') }}</div>
          <div class="result-demo__card-content">{{ t('cardContent') }}</div>
        </div>
      </template>
    </van-result>
  </demo-block>

  <demo-block :title="t('fail')">
    <van-result
      status="fail"
      :title="t('failTitle')"
      :description="t('note')"
      :main-button-text="t('mainAction')"
      :secondary-button-text="t('secondaryAction')"
      @click-main-button="onMain"
      @click-secondary-button="onSecondary"
    />
  </demo-block>

  <demo-block :title="t('warning')">
    <van-result
      status="warning"
      :title="t('warningTitle')"
      :description="t('note')"
      :main-button-text="t('mainAction')"
      :secondary-button-text="t('secondaryAction1')"
      :secondary-button-text2="t('secondaryAction2')"
      @click-main-button="onMain"
      @click-secondary-button="onSecondary"
      @click-secondary-button2="onSecondary2"
    />
  </demo-block>

  <demo-block :title="t('buttonLayout')">
    <p class="result-demo__layout-note">{{ t('buttonLayoutNote') }}</p>
    <van-result
      status="success"
      :title="t('layoutHorizontal')"
      :description="t('note')"
      button-layout="horizontal"
      :main-button-text="t('mainAction')"
      :secondary-button-text="t('secondaryAction')"
      @click-main-button="onMain"
      @click-secondary-button="onSecondary"
    />
    <van-result
      status="success"
      :title="t('layoutVertical')"
      :description="t('note')"
      button-layout="vertical"
      :main-button-text="t('mainAction')"
      :secondary-button-text="t('secondaryAction')"
      @click-main-button="onMain"
      @click-secondary-button="onSecondary"
    />
    <van-result
      status="success"
      :title="t('layoutHybrid')"
      :description="t('note')"
      button-layout="hybrid"
      :main-button-text="t('mainAction')"
      :secondary-button-text="t('secondaryAction1')"
      :secondary-button-text2="t('secondaryAction2')"
      @click-main-button="onMain"
      @click-secondary-button="onSecondary"
      @click-secondary-button2="onSecondary2"
    />
  </demo-block>

  <demo-block :title="t('success')">
    <van-result status="success" :title="t('successTitle')" :description="t('note')">
      <div class="result-demo__amount">
        <div class="result-demo__amount-value">{{ t('amount') }}</div>
        <div class="result-demo__amount-caption">
          {{ t('amountCaption') }}
        </div>
      </div>
      <template #footer>
        <div class="result-demo__card">
          <div class="result-demo__card-title">{{ t('cardTitle1') }}</div>
          <div class="result-demo__card-content">{{ t('cardContent') }}</div>
        </div>
        <div class="result-demo__card">
          <div class="result-demo__card-title">{{ t('cardTitle2') }}</div>
          <div class="result-demo__card-content">{{ t('cardContent') }}</div>
        </div>
      </template>
    </van-result>
  </demo-block>
</template>

<style>
.result-demo__layout-note {
  margin: 0 var(--van-padding-md) var(--van-padding-sm);
  font-size: var(--van-font-size-sm);
  line-height: var(--van-line-height-sm);
  color: var(--van-text-color-2);
}

.result-demo__amount-value {
  font-size: 28px;
  font-weight: var(--van-font-bold);
  line-height: 36px;
  color: var(--van-text-color);
}

.result-demo__amount-caption {
  margin-top: var(--van-padding-xs);
  font-size: var(--van-font-size-sm);
  line-height: var(--van-line-height-sm);
  color: var(--van-gray-10);
}

.result-demo__card {
  padding: var(--van-padding-md);
  border-radius: var(--van-radius-lg);
  background: var(--van-background);
}

.result-demo__card + .result-demo__card {
  margin-top: var(--van-padding-sm);
}

.result-demo__card-title {
  font-size: var(--van-font-size-md);
  line-height: var(--van-line-height-md);
  font-weight: var(--van-font-bold);
  color: var(--van-text-color);
}

.result-demo__card-content {
  margin-top: var(--van-padding-xs);
  font-size: var(--van-font-size-sm);
  line-height: var(--van-line-height-sm);
  color: var(--van-text-color-2);
}
</style>
