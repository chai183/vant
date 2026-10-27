<script setup lang="ts">
import { showDialog, showConfirmDialog, Dialog as VanDialog } from '..';
import VanCell from '../../cell';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
// import type { DialogAction } from '../types';

const t = useTranslate({
  'zh-CN': {
    title: '标题',
    alert1: '提示弹窗',
    alert2: '提示弹窗（无标题）',
    confirm: '确认弹窗',
    confirmNoTitle: '确认弹窗（无标题）',
    content1: '告知当前状态、信息和解决方法等内容。描述文案尽可能控制在2行内',
    content2: '告知当前状态、信息和解决方法等内容。描述文案尽可能控制在2行内',
    content3:
      '描述文案多行展示样式。文字字数不宜过长，描述文案尽可能控制在2行内',
    beforeClose: '异步关闭',
    roundButton: '圆角按钮样式',
    useComponent: '使用 Dialog 组件',
    customColor: '自定义颜色',
    customConfirmText: '警示操作',
    longConfirm: '确认文本内容过长',
    multiAction: '多按钮',
    primaryAction: '继续执行操作',
    secondaryAction: '查看详细信息',
    messageHighlight: '消息高亮',
    highlightDialog: '函数调用高亮',
    componentHighlight: '组件调用高亮',
    highContent: '请先阅读《服务协议》，并确认“风险提示”内容。',
    highKeywords1: '服务协议',
    highKeywords2: '风险提示',
    inputAction: '内置输入框',
    inputTitle: '对话框标题',
    shortText: '短文本',
    longText: '长文本',
    inputMessage: '这是一段对话框信息',
    inputPlaceholder: '请输入内容',
    inputRulesMessage: '这是必填项',
    shortTextComponent: '组件调用短文本',
    validateComponent: '组件验证示例',
    validateMessage: '这是一段验证的手机号',
    validationInvalid: '请输入正确的11位手机号',
    confirmText: '我知道了',
    confirmText2: '主要操作',
    detailAction: '查看详情',
    retryAction: '重新尝试',
  },
  'en-US': {
    title: 'Title',
    alert1: 'Alert',
    alert2: 'Alert without title',
    confirm: 'Confirm dialog',
    confirmNoTitle: 'Confirm dialog(no title)',
    content1:
      'The frequency of people swearing during code reading is the only measure of code quality.',
    content2:
      'Life is far more than just spinning and busy to the limit, and human experiences are much broader and richer than this.',
    content3:
      'If the solution is ugly, then there must be a better solution, but it has not been discovered yet.',
    beforeClose: 'Before Close',
    roundButton: 'Round Button Style',
    useComponent: 'Use Dialog Component',
    customColor: 'custom color',
    customConfirmText: 'warning handler',
    longConfirm: 'confirm Text more long',
    multiAction: 'more buttons',
    primaryAction: 'continue Action',
    secondaryAction: 'Review Details',
    messageHighlight: 'message Highlight',
    highlightDialog: 'Function Highlight',
    componentHighlight: 'component Highlight',
    highContent:
      'please read the Terms of Service carefully and confirm the Risk Notice content.',
    highKeywords1: 'Terms of Service',
    highKeywords2: 'Risk Notice',
    inputAction: 'dialog input',
    inputTitle: 'input title',
    shortText: 'short text',
    longText: 'long text',
    inputMessage: 'this is input message',
    inputPlaceholder: 'please input content',
    inputRulesMessage: 'this is be required',
    shortTextComponent: 'component use short text',
    validateComponent: 'component validate',
    validateMessage: 'this is validate phone number',
    validationInvalid: 'please enter a valid 11-digit phone number',
    confirmText: 'I know',
    confirmText2: 'handler',
    detailAction: 'show detail',
    retryAction: 'Try Again',
  },
});

const onClickAlert = () => {
  showDialog({
    title: t('title'),
    message: t('content1'),
    confirmButtonText: t('confirmText'),
  });
};

const onClickAlert2 = () => {
  showDialog({
    message: t('content2'),
    confirmButtonText: t('confirmText'),
  });
};

// const onClickRound = () => {
//   showDialog({
//     theme: 'round-button',
//     title: t('title'),
//     message: t('content1'),
//   });
// };

// const onClickRound2 = () => {
//   showDialog({
//     theme: 'round-button',
//     message: t('content2'),
//   });
// };

/* -------- 确认弹窗start----- */
const onClickConfirm = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('content3'),
    confirmButtonText: t('confirmText2'),
  });
};
const onClickConfirm2 = () => {
  showConfirmDialog({
    message: t('content3'),
    confirmButtonText: t('confirmText2'),
  });
};
/* --------确认弹窗end------ */

/* --------上下布局start------- */

// 确认按钮文本过长示例
const onClickConfirm5 = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('content3'),
    confirmButtonText: t('longConfirm'),
    confirmButtonVerticalThreshold: 5,
  });
};
// 多按钮示例
const onClickMultiAction = () => {
  showConfirmDialog({
    title: t('title'),
    message: t('content3'),
    confirmButtonText: t('primaryAction'),
    actionButtons: [
      { action: 'detail', text: t('detailAction'), color: '#F00' },
      {
        action: 'retry',
        text: t('retryAction'),
        disabled: true,
      },
    ],
    callback(action) {
      console.log(action);
    },
  });
};
/* --------上下布局end-------- */

/*-------- 自定义颜色弹窗start-------- */
const onClickConfirm3 = () => {
  showConfirmDialog({
    message: t('content3'),
    title: t('title'),
    confirmButtonText: t('customConfirmText'),
    confirmButtonColor: '#FF3333',
    showCancelButton: true,
  });
};
const onClickConfirm4 = () => {
  showConfirmDialog({
    message: t('content3'),
    confirmButtonText: t('customConfirmText'),
    confirmButtonColor: '#FF3333',
    showCancelButton: true,
  });
};

/*-------- 自定义颜色弹窗end--------- */

/*-------- 高亮start---------*/
const showHighlight = ref(false);

const messageHighlightConfig = ref({
  keywords: [t('highKeywords1'), t('highKeywords2')],
  color: '#ee0a24',
  style: {
    fontWeight: 600,
    // fontStyle: 'italic',
  },
});
const onClickHighlight = () => {
  showDialog({
    title: t('title'),
    message: t('highContent'),
    messageHighlightConfig: messageHighlightConfig.value,
    confirmButtonText: t('confirmText'),
  });
};

/*--------高亮end---------*/

/*-------- 输入框start---------*/

const textInputConfig = ref({
  type: 'text',
  placeholder: t('inputPlaceholder'),
  clearable: true,
  maxlength: 20,
  rules: [{ required: true, message: t('inputRulesMessage') }],
  validateTrigger: 'onBlur',
});

const textareaInputConfig = ref({
  type: 'textarea',
  placeholder: t('inputPlaceholder'),
  maxlength: 100,
  showWordLimit: true,
  autosize: true,
  validateTrigger: ['onBlur'],
  rules: [{ required: true, message: t('inputRulesMessage') }],
});

const onClickInputDialog = () => {
  showConfirmDialog({
    title: t('inputTitle'),
    message: t('inputMessage'),
    inputConfig: {
      ...textInputConfig.value,
    },
  });
};

const onClickTextareaDialog = () => {
  showConfirmDialog({
    title: t('inputTitle'),
    message: t('inputMessage'),
    inputConfig: {
      ...textareaInputConfig.value,
    },
  });
};

const showComponentInput = ref(false);
const showComponentValidation = ref(false);
const componentInputValue = ref('');
const componentValidationValue = ref('');
const validationInputConfig = ref({
  placeholder: t('inputPlaceholder'),
  clearable: true,
  maxlength: 11,
  validateTrigger: ['onBlur', 'onConfirm'],
  rules: [
    { required: true, message: t('inputRulesMessage') },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: t('validateMessage'),
      trigger: ['onBlur', 'onSubmit'],
    },
  ],
});

/*--------输入框end---------*/

// const onClickBeforeClose = () => {
//   const beforeClose = (action: DialogAction) =>
//     new Promise<boolean>((resolve) => {
//       setTimeout(() => resolve(action === 'confirm'), 1000);
//     });

//   showConfirmDialog({
//     title: t('title'),
//     message: t('content3'),
//     beforeClose,
//   });
// };
</script>

<template>
  <!-- 提示弹窗 -->
  <demo-block card :title="t('basicUsage')">
    <van-cell is-link :title="t('alert1')" @click="onClickAlert" />
    <van-cell is-link :title="t('alert2')" @click="onClickAlert2" />
  </demo-block>
  <!-- 确认弹窗 -->
  <demo-block card :title="t('confirm')">
    <van-cell is-link :title="t('confirm')" @click="onClickConfirm" />
    <van-cell is-link :title="t('confirmNoTitle')" @click="onClickConfirm2" />
    <van-cell is-link :title="t('longConfirm')" @click="onClickConfirm5" />
    <van-cell is-link :title="t('multiAction')" @click="onClickMultiAction" />
  </demo-block>
  <!-- 自定义颜色 -->
  <demo-block card :title="t('customColor')">
    <van-cell is-link :title="t('confirm')" @click="onClickConfirm3" />
    <van-cell is-link :title="t('confirmNoTitle')" @click="onClickConfirm4" />
  </demo-block>
  <!-- 高亮 -->
  <demo-block card :title="t('messageHighlight')">
    <van-cell is-link :title="t('highlightDialog')" @click="onClickHighlight" />
    <van-cell
      is-link
      :title="t('componentHighlight')"
      @click="showHighlight = true"
    />
    <van-dialog
      v-model:show="showHighlight"
      :title="t('title')"
      :message="t('highContent')"
      :message-highlight-config="messageHighlightConfig"
      :confirm-button-text="t('confirmText2')"
      show-cancel-button
    />
  </demo-block>
  <!-- 输入对话框 -->
  <demo-block card :title="t('inputAction')">
    <van-cell is-link :title="t('shortText')" @click="onClickInputDialog" />
    <van-cell is-link :title="t('longText')" @click="onClickTextareaDialog" />
    <van-cell
      is-link
      :title="t('shortTextComponent')"
      @click="showComponentInput = true"
    />
    <van-cell
      is-link
      :title="t('validateComponent')"
      @click="showComponentValidation = true"
    />
    <van-dialog
      v-model:show="showComponentInput"
      v-model:input-value="componentInputValue"
      :title="t('title')"
      :message="t('inputMessage')"
      :input-config="textInputConfig"
      show-cancel-button
    />
    <van-dialog
      v-model:show="showComponentValidation"
      v-model:input-value="componentValidationValue"
      :title="t('title')"
      :message="t('validateMessage')"
      :input-config="validationInputConfig"
      show-cancel-button
    />
  </demo-block>

  <!-- <demo-block card :title="t('roundButton')">
    <van-cell is-link :title="t('alert1')" @click="onClickRound" />
    <van-cell is-link :title="t('alert2')" @click="onClickRound2" />
  </demo-block> -->

  <!-- <demo-block card :title="t('beforeClose')">
    <van-cell is-link :title="t('beforeClose')" @click="onClickBeforeClose" />
  </demo-block> -->
  <!--
  <demo-block card :title="t('useComponent')">
    <van-cell is-link :title="t('useComponent')" @click="show = true" />
    <van-dialog
      v-model:show="show"
      :title="t('title')"
      show-cancel-button
      :lazy-render="false"
    >
      <img :src="image" />
    </van-dialog>
  </demo-block> -->
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
