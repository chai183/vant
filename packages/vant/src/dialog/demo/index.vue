<script setup lang="ts">
import VanCell from '../../cell';
import { showDialog, showConfirmDialog, Dialog as VanDialog } from '..';
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import type { DialogInputConfig } from '../types';

const t = useTranslate({
  'zh-CN': {
    title: '标题',
    alert1: '提示弹窗',
    alert2: '提示弹窗（无标题）',
    confirm: '确认弹窗',
    longConfirm: '确认文案超过 5 个字符',
    multiAction: '多按钮确认弹窗',
    componentMultiAction: '组件多按钮示例',
    content1: '代码是写出来给人看的，附带能在机器上运行。',
    content2: '生命远不止连轴转和忙到极限，人类的体验远比这辽阔、丰富得多。',
    content3:
      '如果解决方法是丑陋的，那就肯定还有更好的解决方法，只是还没有发现而已。',
    primaryAction: '继续执行操作',
    detailAction: '查看详细信息',
    retryAction: '重新尝试',
    beforeClose: '异步关闭',
    roundButton: '圆角按钮样式',
    messageHighlight: '消息高亮',
    highlightDialog: '函数调用高亮',
    componentHighlight: '组件调用高亮',
    highlightContent: '请先阅读《服务协议》，并确认“风险提示”内容。',
    highlightKeyword1: '服务协议',
    highlightKeyword2: '风险提示',
    inputField: '内置输入框',
    inputDialog: '函数调用短文本',
    textareaDialog: '函数调用长文本',
    componentInput: '组件调用输入框',
    validationInput: '组件调用输入验证',
    inputMessage: '请输入联系人姓名',
    validationMessage: '请输入 11 位手机号',
    textareaMessage: '请输入备注内容',
    inputPlaceholder: '请输入姓名',
    textareaPlaceholder: '请输入备注',
    validationPlaceholder: '请输入手机号',
    inputRequired: '请输入姓名',
    textareaRequired: '请输入备注',
    validationRequired: '手机号不能为空',
    validationInvalid: '请输入正确的 11 位手机号',
    defaultName: '张三',
  },
  'en-US': {
    title: 'Title',
    alert1: 'Alert',
    alert2: 'Alert without title',
    confirm: 'Confirm dialog',
    longConfirm: 'Confirm Text Longer Than 5',
    multiAction: 'Multiple Actions Dialog',
    componentMultiAction: 'Component Multiple Actions',
    content1:
      'The frequency of people swearing during code reading is the only measure of code quality.',
    content2:
      'Life is far more than just spinning and busy to the limit, and human experiences are much broader and richer than this.',
    content3:
      'If the solution is ugly, then there must be a better solution, but it has not been discovered yet.',
    primaryAction: 'Continue Action',
    detailAction: 'Review Details',
    retryAction: 'Try Again',
    beforeClose: 'Before Close',
    roundButton: 'Round Button Style',
    messageHighlight: 'Message Highlight',
    highlightDialog: 'Function Highlight',
    componentHighlight: 'Component Highlight',
    highlightContent:
      'Please read the Terms of Service carefully and confirm the Risk Notice content.',
    highlightKeyword1: 'Terms of Service',
    highlightKeyword2: 'Risk Notice',
    inputField: 'Input Field',
    inputDialog: 'Function Text Input',
    textareaDialog: 'Function Textarea',
    componentInput: 'Component Input Field',
    validationInput: 'Component Validation',
    inputMessage: 'Please enter the contact name',
    validationMessage: 'Please enter an 11-digit phone number',
    textareaMessage: 'Please enter your remark',
    inputPlaceholder: 'Please enter your name',
    textareaPlaceholder: 'Please enter your remark',
    validationPlaceholder: 'Please enter phone number',
    inputRequired: 'Please enter your name',
    textareaRequired: 'Please enter your remark',
    validationRequired: 'Phone number is required',
    validationInvalid: 'Please enter a valid 11-digit phone number',
    defaultName: 'Taylor',
  },
});

const showComponentHighlight = ref(false);
const showComponentInput = ref(false);
const showComponentValidation = ref(false);
const componentInputValue = ref('');
const componentValidationValue = ref('');

// 函数调用和组件调用都复用同一份高亮配置，便于对比两种接入方式。
const messageHighlightConfig = computed(() => ({
  keywords: [t('highlightKeyword1'), t('highlightKeyword2')],
  color: '#ee0a24',
  style: {
    fontWeight: 600,
    fontStyle: 'italic',
  },
}));

const textInputConfig = computed<DialogInputConfig>(() => ({
  placeholder: t('inputPlaceholder'),
  clearable: true,
  maxlength: 20,
  rules: [{ required: true, message: t('inputRequired') }],
}));

const textareaInputConfig = computed<DialogInputConfig>(() => ({
  type: 'textarea',
  placeholder: t('textareaPlaceholder'),
  maxlength: 100,
  showWordLimit: true,
  autosize: true,
  rules: [{ required: true, message: t('textareaRequired') }],
}));

const validationInputConfig = computed<DialogInputConfig>(() => ({
  placeholder: t('validationPlaceholder'),
  clearable: true,
  maxlength: 11,
  validateTrigger: ['onBlur', 'onConfirm'],
  rules: [
    { required: true, message: t('validationRequired') },
    {
      pattern: /^1\d{10}$/,
      message: t('validationInvalid'),
      trigger: ['onBlur', 'onSubmit'],
    },
  ],
}));

const onClickAlert = () => {
  showDialog({
    title: t('title'),
    message: t('content1'),
  });
};

const onClickAlert2 = () => {
  showDialog({
    message: t('content2'),
  });
};

const onClickRound = () => {
  showDialog({
    theme: 'round-button',
    title: t('title'),
    message: t('content1'),
  });
};

const onClickRound2 = () => {
  showDialog({
    theme: 'round-button',
    message: t('content2'),
  });
};

// 演示函数调用方式下的消息关键词高亮。
const onClickHighlight = () => {
  showDialog({
    title: t('title'),
    message: t('highlightContent'),
    messageHighlightConfig: messageHighlightConfig.value,
  });
};

const onClickConfirm = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('content3'),
  });
};

const onClickInputDialog = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('inputMessage'),
    inputConfig: {
      ...textInputConfig.value,
      defaultValue: t('defaultName'),
    },
  });
};

const onClickTextareaDialog = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('textareaMessage'),
    inputConfig: textareaInputConfig.value,
  });
};

// 演示：当确认按钮文案超过默认阈值 5 个字符时，底部会自动切换为上下布局。
const onClickLongConfirm = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('content3'),
    confirmButtonText: t('primaryAction'),
    confirmButtonVerticalThreshold: 5,
  });
};

// 演示：函数调用方式下的多按钮布局。
const onClickMultiAction = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('content3'),
    confirmButtonText: t('primaryAction'),
    actionButtons: [
      { action: 'detail', text: t('detailAction'), color: '#f00' },
      {
        action: 'retry',
        text: t('retryAction'),
        disabled: true,
        color: '#ccc',
      },
    ],
    confirmButtonVerticalThreshold: 5,
    verticalButtonMaxTextLength: 15,
    callback(action) {
      console.log(action);
    },
  });
};

/* const onClickBeforeClose = () => {
  const beforeClose = (action: DialogAction) =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(action === 'confirm'), 1000);
    });

  showConfirmDialog({
    title: t('title'),
    message: t('content3'),
    beforeClose,
  });
}; */
</script>

<template>
  <demo-block card :title="t('basicUsage')">
    <van-cell is-link :title="t('alert1')" @click="onClickAlert" />
    <van-cell is-link :title="t('alert2')" @click="onClickAlert2" />
    <van-cell is-link :title="t('confirm')" @click="onClickConfirm" />
  </demo-block>

  <demo-block card :title="t('multiAction')">
    <van-cell is-link :title="t('longConfirm')" @click="onClickLongConfirm" />
    <van-cell is-link :title="t('multiAction')" @click="onClickMultiAction" />
  </demo-block>

  <demo-block card :title="t('roundButton')">
    <van-cell is-link :title="t('alert1')" @click="onClickRound" />
    <van-cell is-link :title="t('alert2')" @click="onClickRound2" />
  </demo-block>

  <demo-block card :title="t('messageHighlight')">
    <!-- 同时演示函数调用和组件调用两种消息高亮接入方式。 -->
    <van-cell is-link :title="t('highlightDialog')" @click="onClickHighlight" />
    <van-cell
      is-link
      :title="t('componentHighlight')"
      @click="showComponentHighlight = true"
    />
    <van-dialog
      v-model:show="showComponentHighlight"
      :title="t('title')"
      :message="t('highlightContent')"
      :message-highlight-config="messageHighlightConfig"
      show-cancel-button
      :lazy-render="false"
    />
  </demo-block>

  <demo-block card :title="t('inputField')">
    <van-cell is-link :title="t('inputDialog')" @click="onClickInputDialog" />
    <van-cell
      is-link
      :title="t('textareaDialog')"
      @click="onClickTextareaDialog"
    />
    <van-cell
      is-link
      :title="t('componentInput')"
      @click="showComponentInput = true"
    />
    <van-cell
      is-link
      :title="t('validationInput')"
      @click="showComponentValidation = true"
    />
    <van-dialog
      v-model:show="showComponentInput"
      v-model:input-value="componentInputValue"
      :title="t('title')"
      :message="t('inputMessage')"
      :input-config="textInputConfig"
      show-cancel-button
      :lazy-render="false"
    />
    <van-dialog
      v-model:show="showComponentValidation"
      v-model:input-value="componentValidationValue"
      :title="t('title')"
      :message="t('validationMessage')"
      :input-config="validationInputConfig"
      show-cancel-button
      :lazy-render="false"
    />
  </demo-block>
</template>

<style lang="less">
.demo-dialog {
  img {
    box-sizing: border-box;
    width: 100%;
    padding: 25px 20px 0;
  }
}
</style>
