<script setup lang="ts">
import VanCell from '../../cell';
import VanIcon from '../../icon';
import { ref } from 'vue';
import {
  showNotify,
  showPersistentNotify,
  Notify as VanNotify,
  type NotifyType,
} from '..';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    scrollNotify: '滚动通知',
    scrollText:
      '这是一条滚动的消息通知，内容过长时会自动这是一条滚动的消息通知，内容过长时会自动换行，超出一行即向上滚动播放这是一条滚动的消息通知，内容过长时会自动换行，超出一行即向上滚动播放这是一条滚动的消息通知，内容过长时会自动换行，超出一行即向上滚动播放这是一条滚动的消息通知，内容过长时会自动换行，超出一行即向上滚动播放这是一条滚动的消息通知，内容过长时会自动换行，超出一行即向上滚动播放换行，超出一行即向上滚动播放',
    textButton: '带文字按钮',
    textButtonMsg: '这是一条带文字按钮的消息通知',
    textButtonMsgMulti:
      '这是一条带文字按钮的消息通知，描述文本最多可以控制在三行内，超出则…',
    copyNow: '立即复制',
    iconNotify: '带 icon 通知',
    iconNotifyMsg: '这是一条普通/需要用户关注的警示通知信息',
    strongButton: '带强按钮',
    strongButtonMsg: '这是一条带强按钮的消息通知',
    strongButtonMsgMulti:
      '这是一条带强按钮的消息通知，描述文案尽可能控制在二行内',
    buttonLimit: '四字限制',
    buttonOverflow: '超过四个字',
    buttonOverflowDemo: '按钮超四字截断',
    statusNotify: '状态通知',
    successMsg: '这是一条成功提示通知',
    dangerMsg: '这是一条错误提示通知',
    warningMsg: '这是一条普通/需要用户关注的警示通知信息',
    plainText: '纯文字提示',
    plainMsg: '这是一条纯文字的消息通知',
    closeable: '带关闭按钮',
    closeableMsg: '这是一条带关闭的消息通知 常驻可关闭',
    closeableMsgMulti:
      '这是一条带关闭的消息通知 常驻可关闭，描述文案尽可能控制在二行内',
    customConfig: '自定义配置',
    customMsg: '这是一条红色/深紫色/浅紫色/的消息通知',
    notifyType: '通知类型',
    primary: '主要通知',
    success: '成功通知',
    danger: '危险通知',
    warning: '警告通知',
    useComponent: '使用 Notify 组件',
    customDuration: '自定义时长',
    customPosition: '自定义位置',
    displayMode: '展示方式',
    autoDismiss: '自动消失（3 秒）',
    persistentNotify: '常驻展示',
    persistentHint: '需手动关闭或点击关闭按钮',
  },
  'en-US': {
    scrollNotify: 'Scroll',
    scrollText:
      'This is a scrolling notification. Long text wraps automatically and scrolls when it exceeds one line.',
    textButton: 'Text button',
    textButtonMsg: 'Notification with a text button',
    textButtonMsgMulti:
      'Notification with a text button, description can wrap up to three lines…',
    copyNow: 'Copy',
    iconNotify: 'With icon',
    iconNotifyMsg: 'This is a warning notification that needs attention',
    strongButton: 'Strong button',
    strongButtonMsg: 'Notification with a strong button',
    strongButtonMsgMulti:
      'Notification with a strong button, keep description within two lines',
    buttonLimit: 'Action',
    buttonOverflow: 'More than four',
    buttonOverflowDemo: 'Button 4-char limit',
    statusNotify: 'Status',
    successMsg: 'Success notification',
    dangerMsg: 'Error notification',
    warningMsg: 'Warning notification',
    plainText: 'Plain text',
    plainMsg: 'Plain text notification',
    closeable: 'Closeable',
    closeableMsg: 'Closeable notification',
    closeableMsgMulti: 'Closeable notification, description within two lines',
    customConfig: 'Custom',
    customMsg: 'Custom color notification',
    notifyType: 'Type',
    primary: 'Primary',
    success: 'Success',
    danger: 'Danger',
    warning: 'Warning',
    useComponent: 'Use Notify Component',
    customDuration: 'Custom Duration',
    customPosition: 'Custom Position',
    displayMode: 'Display mode',
    autoDismiss: 'Auto dismiss (3s)',
    persistentNotify: 'Persistent',
    persistentHint: 'Close manually or use closeable',
  },
});

const show = ref(false);

const showScrollNotify = () => {
  showPersistentNotify({
    type: 'warning',
    scrollable: true,
    actionText: t('copyNow'),
    message: t('scrollText'),
  });
};

const showTextButtonNotify = (wrapable = false) => {
  showNotify({
    type: 'warning',
    message: wrapable ? t('textButtonMsgMulti') : t('textButtonMsg'),
    actionText: t('copyNow'),
    wrapable,
    persistent: true,
  });
};

const showIconNotify = () => {
  showNotify({
    type: 'warning',
    message: t('iconNotifyMsg'),
    duration: 3000,
  });
};

const showStrongButtonNotify = (wrapable = false) => {
  showNotify({
    type: 'warning',
    message: wrapable ? t('strongButtonMsgMulti') : t('strongButtonMsg'),
    buttonText: t('buttonLimit'),
    wrapable,
    persistent: true,
  });
};

const showButtonOverflowNotify = () => {
  showNotify({
    type: 'warning',
    message: t('strongButtonMsg'),
    buttonText: t('buttonOverflow'),
    persistent: true,
  });
};

const showStatusNotify = (type: NotifyType) => {
  const messageMap = {
    success: t('successMsg'),
    danger: t('dangerMsg'),
    warning: t('warningMsg'),
    primary: t('warningMsg'),
  };
  showNotify({ type, message: messageMap[type] });
};

const showPlainNotify = () => {
  showNotify({
    plain: true,
    message: t('plainMsg'),
  });
};

const showCloseableNotify = (wrapable = false) => {
  showNotify({
    type: 'warning',
    closeable: true,
    message: wrapable ? t('closeableMsgMulti') : t('closeableMsg'),
    wrapable,
    persistent: true,
  });
};

const showAutoDismissNotify = () => {
  showNotify({
    type: 'warning',
    message: t('autoDismiss'),
  });
};

const showPersistentModeNotify = () => {
  showPersistentNotify({
    type: 'warning',
    closeable: true,
    message: t('persistentHint'),
  });
};

const showCustomNotify = () => {
  showNotify({
    message: t('customMsg'),
    color: '#323233',
    background: '#f7f8fa',
    leftIcon: 'info-o',
  });
};

const showCustomDuration = () => {
  showNotify({
    message: t('customDuration'),
    duration: 1000,
  });
};

const showCustomPosition = () => {
  showNotify({
    message: t('customPosition'),
    position: 'bottom',
  });
};

const showComponentCall = () => {
  show.value = true;
  setTimeout(() => {
    show.value = false;
  }, 2000);
};
</script>

<template>
  <demo-block card :title="t('displayMode')">
    <van-cell
      is-link
      :title="t('autoDismiss')"
      @click="showAutoDismissNotify"
    />
    <van-cell
      is-link
      :title="t('persistentNotify')"
      @click="showPersistentModeNotify"
    />
  </demo-block>

  <demo-block card :title="t('scrollNotify')">
    <van-cell is-link :title="t('scrollNotify')" @click="showScrollNotify" />
  </demo-block>

  <demo-block card :title="t('textButton')">
    <van-cell
      is-link
      :title="t('textButton')"
      @click="showTextButtonNotify()"
    />
    <van-cell
      is-link
      :title="`${t('textButton')}（多行）`"
      @click="showTextButtonNotify(true)"
    />
  </demo-block>

  <demo-block card :title="t('iconNotify')">
    <van-cell is-link :title="t('iconNotify')" @click="showIconNotify" />
  </demo-block>

  <demo-block card :title="t('strongButton')">
    <van-cell
      is-link
      :title="t('strongButton')"
      @click="showStrongButtonNotify()"
    />
    <van-cell
      is-link
      :title="`${t('strongButton')}（多行）`"
      @click="showStrongButtonNotify(true)"
    />
    <van-cell
      is-link
      :title="t('buttonOverflowDemo')"
      @click="showButtonOverflowNotify"
    />
  </demo-block>

  <demo-block card :title="t('statusNotify')">
    <van-cell
      is-link
      :title="t('warning')"
      @click="showStatusNotify('warning')"
    />
    <van-cell
      is-link
      :title="t('success')"
      @click="showStatusNotify('success')"
    />
    <van-cell
      is-link
      :title="t('danger')"
      @click="showStatusNotify('danger')"
    />
    <van-cell
      is-link
      :title="t('primary')"
      @click="showStatusNotify('primary')"
    />
  </demo-block>

  <demo-block card :title="t('plainText')">
    <van-cell is-link :title="t('plainText')" @click="showPlainNotify" />
  </demo-block>

  <demo-block card :title="t('closeable')">
    <van-cell is-link :title="t('closeable')" @click="showCloseableNotify()" />
    <van-cell
      is-link
      :title="`${t('closeable')}（多行）`"
      @click="showCloseableNotify(true)"
    />
  </demo-block>

  <demo-block card :title="t('customConfig')">
    <van-cell is-link :title="t('customConfig')" @click="showCustomNotify" />
    <van-cell
      is-link
      :title="t('customPosition')"
      @click="showCustomPosition"
    />
    <van-cell
      is-link
      :title="t('customDuration')"
      @click="showCustomDuration"
    />
  </demo-block>

  <demo-block card :title="t('useComponent')">
    <van-cell is-link :title="t('useComponent')" @click="showComponentCall" />

    <van-notify v-model:show="show" type="success">
      <template #left-icon>
        <van-icon name="passed" />
      </template>
      {{ t('successMsg') }}
    </van-notify>
  </demo-block>
</template>
