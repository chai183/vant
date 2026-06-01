<script setup lang="ts">
import VanCell from '../../cell';
import VanPopup from '..';
import VanGrid from '../../grid';
import VanGridItem from '../../grid-item';
import { showToast } from '../../toast';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    position: '弹出位置',
    buttonBasic: '展示弹出层',
    buttonTop: '顶部弹出',
    buttonBottom: '底部弹出',
    buttonLeft: '左侧弹出',
    buttonRight: '右侧弹出',
    teleport: '指定挂载节点',
    title: '标题',
    titleBasic: '基础标题',
    titleSlot: '自定义标题',
    titleBottom: '底部弹出（带标题）',
    titleDrawerRight: '右侧抽屉（带标题）',
    titleDrawerLeft: '左侧抽屉（带标题）',
    titleWithActions: '取消与确定',
    titleActionsDrawer: '抽屉（取消与确定）',
    titleActionsPriority: '确定优先于关闭',
    popupTitle: '标题',
    customTitle: '自定义标题',
    closeIcon: '关闭图标',
    customCloseIcon: '自定义图标',
    customIconPosition: '图标位置',
    roundCorner: '圆角弹窗',
    roundCornerBottom: '圆角弹窗（底部）',
    roundCornerCenter: '圆角弹窗（居中）',
    listenEvents: '事件监听',
    clickEvents: '监听点击事件',
    displayEvents: '监听显示事件',
  },
  'en-US': {
    position: 'Position',
    buttonBasic: 'Show Popup',
    buttonTop: 'From Top',
    buttonBottom: 'From Bottom',
    buttonLeft: 'From Left',
    buttonRight: 'From Right',
    teleport: 'Get Container',
    title: 'Title',
    titleBasic: 'Basic Title',
    titleSlot: 'Custom Title',
    titleBottom: 'From Bottom (with title)',
    titleDrawerRight: 'Right Drawer (with title)',
    titleDrawerLeft: 'Left Drawer (with title)',
    titleWithActions: 'Cancel and Confirm',
    titleActionsDrawer: 'Drawer (cancel and confirm)',
    titleActionsPriority: 'Confirm over Close Icon',
    popupTitle: 'Title',
    customTitle: 'Custom Title',
    closeIcon: 'Close Icon',
    customCloseIcon: 'Custom Icon',
    customIconPosition: 'Icon Position',
    roundCorner: 'Round Corner',
    roundCornerBottom: 'Round Corner (bottom)',
    roundCornerCenter: 'Round Corner (center)',
    listenEvents: 'Listen To Events',
    clickEvents: 'Listen To Click Events',
    displayEvents: 'Listen To Display Events',
  },
});

const drawerPopupStyle = { width: '80%', height: '100%' };
const bottomTitlePopupStyle = { height: '40%' };

const showBasic = ref(false);
const showTop = ref(false);
const showBottom = ref(false);
const showLeft = ref(false);
const showRight = ref(false);
const showTitleBasic = ref(false);
const showTitleSlot = ref(false);
const showTitleBottom = ref(false);
const showTitleDrawerRight = ref(false);
const showTitleDrawerLeft = ref(false);
const showTitleWithActions = ref(false);
const showTitleActionsDrawer = ref(false);
const showTitleActionsPriority = ref(false);
const showCloseIcon = ref(false);
const showRoundCornerBottom = ref(false);
const showRoundCornerCenter = ref(false);
const showGetContainer = ref(false);
const showCustomCloseIcon = ref(false);
const showCustomIconPosition = ref(false);
const showClickEvents = ref(false);
const showDisplayEvents = ref(false);
</script>

<template>
  <demo-block card :title="t('basicUsage')">
    <van-cell :title="t('buttonBasic')" is-link @click="showBasic = true" />
    <van-popup v-model:show="showBasic" :style="{ padding: '64px' }">
      {{ t('content') }}
    </van-popup>
  </demo-block>

  <demo-block card :title="t('position')">
    <van-grid clickable>
      <van-grid-item
        icon="arrow-up"
        :text="t('buttonTop')"
        @click="showTop = true"
      />
      <van-grid-item
        icon="arrow-down"
        :text="t('buttonBottom')"
        @click="showBottom = true"
      />
      <van-grid-item
        icon="arrow-left"
        :text="t('buttonLeft')"
        @click="showLeft = true"
      />
      <van-grid-item
        icon="arrow"
        :text="t('buttonRight')"
        @click="showRight = true"
      />
    </van-grid>

    <van-popup
      v-model:show="showTop"
      position="top"
      :style="{ height: '30%' }"
    />
    <van-popup
      v-model:show="showBottom"
      position="bottom"
      :style="{ height: '30%' }"
    />
    <van-popup
      v-model:show="showLeft"
      position="left"
      :style="{ width: '30%', height: '100%' }"
    />
    <van-popup
      v-model:show="showRight"
      position="right"
      :style="{ width: '30%', height: '100%' }"
    />
  </demo-block>

  <demo-block card :title="t('title')">
    <van-cell :title="t('titleBasic')" is-link @click="showTitleBasic = true" />
    <van-cell :title="t('titleSlot')" is-link @click="showTitleSlot = true" />
    <van-cell
      :title="t('titleBottom')"
      is-link
      @click="showTitleBottom = true"
    />
    <van-cell
      :title="t('titleDrawerRight')"
      is-link
      @click="showTitleDrawerRight = true"
    />
    <van-cell
      :title="t('titleDrawerLeft')"
      is-link
      @click="showTitleDrawerLeft = true"
    />
    <van-cell
      :title="t('titleWithActions')"
      is-link
      @click="showTitleWithActions = true"
    />
    <van-cell
      :title="t('titleActionsDrawer')"
      is-link
      @click="showTitleActionsDrawer = true"
    />
    <van-cell
      :title="t('titleActionsPriority')"
      is-link
      @click="showTitleActionsPriority = true"
    />

    <van-popup
      v-model:show="showTitleBasic"
      :title="t('popupTitle')"
      position="bottom"
      :style="bottomTitlePopupStyle"
    >
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>

    <van-popup
      v-model:show="showTitleSlot"
      closeable
      position="right"
      :style="drawerPopupStyle"
    >
      <template #title>
        <span class="demo-popup-custom-title">{{ t('customTitle') }}</span>
      </template>
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>

    <van-popup
      v-model:show="showTitleBottom"
      :title="t('popupTitle')"
      closeable
      position="bottom"
      :style="bottomTitlePopupStyle"
    >
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>

    <van-popup
      v-model:show="showTitleDrawerRight"
      :title="t('popupTitle')"
      closeable
      position="right"
      :style="drawerPopupStyle"
    >
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>

    <van-popup
      v-model:show="showTitleDrawerLeft"
      :title="t('popupTitle')"
      closeable
      position="left"
      :style="drawerPopupStyle"
    >
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>

    <van-popup
      v-model:show="showTitleWithActions"
      :title="t('popupTitle')"
      position="bottom"
      :cancel-button-text="t('cancel')"
      :confirm-button-text="t('confirm')"
      :style="bottomTitlePopupStyle"
      @cancel="showToast(t('cancel'))"
      @confirm="showToast(t('confirm'))"
    >
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>

    <van-popup
      v-model:show="showTitleActionsDrawer"
      :title="t('popupTitle')"
      position="right"
      :cancel-button-text="t('cancel')"
      :confirm-button-text="t('confirm')"
      :style="drawerPopupStyle"
      @cancel="showToast(t('cancel'))"
      @confirm="showToast(t('confirm'))"
    >
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>

    <van-popup
      v-model:show="showTitleActionsPriority"
      :title="t('popupTitle')"
      closeable
      position="right"
      :confirm-button-text="t('confirm')"
      :style="drawerPopupStyle"
      @confirm="showToast(t('confirm'))"
    >
      <div class="demo-popup-body">{{ t('content') }}</div>
    </van-popup>
  </demo-block>

  <demo-block card :title="t('closeIcon')">
    <van-cell :title="t('closeIcon')" is-link @click="showCloseIcon = true" />
    <van-cell
      :title="t('customCloseIcon')"
      is-link
      @click="showCustomCloseIcon = true"
    />
    <van-cell
      :title="t('customIconPosition')"
      is-link
      @click="showCustomIconPosition = true"
    />

    <van-popup
      v-model:show="showCloseIcon"
      closeable
      position="bottom"
      :style="{ height: '30%' }"
    />
    <van-popup
      v-model:show="showCustomCloseIcon"
      closeable
      close-icon="close"
      position="bottom"
      :style="{ height: '30%' }"
    />
    <van-popup
      v-model:show="showCustomIconPosition"
      closeable
      close-icon-position="top-left"
      position="bottom"
      :style="{ height: '30%' }"
    />
  </demo-block>

  <demo-block card :title="t('roundCorner')">
    <van-cell
      :title="t('roundCornerCenter')"
      is-link
      @click="showRoundCornerCenter = true"
    />
    <van-popup
      v-model:show="showRoundCornerCenter"
      round
      :style="{ padding: '64px' }"
    />

    <van-cell
      :title="t('roundCornerBottom')"
      is-link
      @click="showRoundCornerBottom = true"
    />
    <van-popup
      v-model:show="showRoundCornerBottom"
      round
      position="bottom"
      :style="{ height: '30%' }"
    />
  </demo-block>

  <demo-block card :title="t('listenEvents')">
    <van-cell
      :title="t('clickEvents')"
      is-link
      @click="showClickEvents = true"
    />
    <van-popup
      v-model:show="showClickEvents"
      position="bottom"
      :style="{ height: '30%' }"
      closeable
      @click-overlay="showToast('click-overlay')"
      @click-close-icon="showToast('click-close-icon')"
    />

    <van-cell
      :title="t('displayEvents')"
      is-link
      @click="showDisplayEvents = true"
    />
    <van-popup
      v-model:show="showDisplayEvents"
      position="bottom"
      :style="{ height: '30%' }"
      @open="showToast('open')"
      @opened="showToast('opened')"
      @close="showToast('close')"
      @closed="showToast('closed')"
    />
  </demo-block>

  <demo-block card :title="t('teleport')">
    <van-cell :title="t('teleport')" is-link @click="showGetContainer = true" />
    <van-popup
      v-model:show="showGetContainer"
      teleport="body"
      :style="{ padding: '64px' }"
    />
  </demo-block>
</template>

<style lang="less">
.demo-popup {
  .van-row {
    margin-bottom: var(--van-padding-md);
  }

  .van-button {
    margin-left: var(--van-padding-md);
  }

  &-body {
    padding: var(--van-padding-md);
    color: var(--van-text-color-2);
    font-size: var(--van-font-size-md);
    line-height: var(--van-line-height-md);
  }

  &-custom-title {
    color: var(--van-primary-color);
  }
}
</style>
