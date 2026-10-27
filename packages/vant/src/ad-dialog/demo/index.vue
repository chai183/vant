<script setup lang="ts">
import { ref } from 'vue';
import VanCell from '../../cell';
import { showToast } from '../../toast';
import { cdnURL, useTranslate } from '../../../docs/site';
import { showAdDialog, AdDialog as VanAdDialog } from '..';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础使用',
    closePosition: '关闭按钮位置',
    closeMode: '内外模式',
    callbackUsage: '回调函数',
    slotUsage: '插槽使用',
    componentUsage: '组件使用',
    customContentUsage: '自定义内容',
    basicDialog: '基础广告弹窗',
    carouselDialog: '轮播广告弹窗',
    topRightPosition: '顶部右侧',
    bottomLeftPosition: '底部左侧',
    customPosition: '自定义坐标',
    outsideMode: '外部模式',
    insideMode: '内部模式',
    callbackDemo: '回调函数演示',
    closeIconSlot: '关闭图标插槽',
    basicComponent: '基础组件用法',
    customContent: '自定义广告内容',
    checkboxText: '今日不再提醒',
    imageClicked: '点击了广告图片',
    slotClicked: '点击了自定义广告内容',
    closeClicked: '点击关闭按钮时勾选状态：',
    customTitle: '限时福利专区',
    customDesc: '点击广告内容可进入活动详情页',
    customTag: '活动进行中',
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    closePosition: 'Close Icon Position',
    closeMode: 'Inside / Outside Mode',
    callbackUsage: 'Callbacks',
    slotUsage: 'Slots',
    componentUsage: 'Component Usage',
    customContentUsage: 'Custom Content',
    basicDialog: 'Basic Ad Dialog',
    carouselDialog: 'Carousel Ad Dialog',
    topRightPosition: 'Top Right',
    bottomLeftPosition: 'Bottom Left',
    customPosition: 'Custom Position',
    outsideMode: 'Outside Mode',
    insideMode: 'Inside Mode',
    callbackDemo: 'Click Callback Demo',
    closeIconSlot: 'Close Icon Slot',
    basicComponent: 'Basic Component Usage',
    customContent: 'Custom Ad Content',
    checkboxText: 'Do not remind me today',
    imageClicked: 'Ad image clicked',
    slotClicked: 'Custom ad content clicked',
    closeClicked: 'Close icon clicked, checked: ',
    customTitle: 'Limited Offer Zone',
    customDesc: 'Click the ad content to view the activity details',
    customTag: 'Event Live',
  },
});

const image = cdnURL('apple-3.jpeg');
const secondaryImage = cdnURL('apple-1.jpeg');
const carouselImages = [
  cdnURL('apple-1.jpeg'),
  cdnURL('apple-2.jpeg'),
  cdnURL('apple-3.jpeg'),
];
const closeIconImage = cdnURL('custom-icon-light.png');

const showBasicComponent = ref(false);
const showCloseIconSlot = ref(false);
const showCustomContent = ref(false);

const basicComponentChecked = ref(false);
const closeIconSlotChecked = ref(false);
const customContentChecked = ref(true);

const openBasicAdDialog = () => {
  showAdDialog({
    image,
    checkboxText: t('checkboxText'),
  });
};

const openCarouselDialog = () => {
  showAdDialog({
    image: carouselImages,
    width: 320,
    checkboxText: t('checkboxText'),
  });
};

const openTopRightPositionDialog = () => {
  showAdDialog({
    image,
    checkboxText: t('checkboxText'),
    closeIconPosition: 'top-right',
  });
};

const openBottomLeftPositionDialog = () => {
  showAdDialog({
    image,
    checkboxText: t('checkboxText'),
    closeIconPosition: 'bottom-left',
  });
};

const openCustomPositionDialog = () => {
  showAdDialog({
    image,
    checkboxText: t('checkboxText'),
    closeIconPosition: {
      top: 8,
      right: 8,
    },
  });
};

const openOutsideModeDialog = () => {
  showAdDialog({
    image,
    checkboxText: t('checkboxText'),
    closeIconMode: 'outside',
    closeIconPosition: 'top-right',
  });
};

const openInsideModeDialog = () => {
  showAdDialog({
    image,
    checkboxText: t('checkboxText'),
    closeIconMode: 'inside',
    closeIconPosition: 'top-right',
  });
};

const openCallbackDialog = () => {
  showAdDialog({
    image,
    checked: true,
    checkboxText: t('checkboxText'),
    onClickImage: () => {
      showToast(t('imageClicked'));
    },
    onClickCloseIcon: (checked) => {
      showToast(`${t('closeClicked')}${checked}`);
    },
  });
};

const onClickCustomContent = () => {
  showToast(t('slotClicked'));
};
</script>

<template>
  <demo-block card :title="t('basicUsage')">
    <van-cell is-link :title="t('basicDialog')" @click="openBasicAdDialog" />
    <van-cell
      is-link
      :title="t('carouselDialog')"
      @click="openCarouselDialog"
    />
    <van-cell
      is-link
      :title="t('basicComponent')"
      @click="showBasicComponent = true"
    />

    <van-ad-dialog
      v-model:show="showBasicComponent"
      v-model:checked="basicComponentChecked"
      :image="carouselImages"
      :checkbox-text="t('checkboxText')"
    />
  </demo-block>

  <demo-block card :title="t('closePosition')">
    <van-cell
      is-link
      :title="t('topRightPosition')"
      @click="openTopRightPositionDialog"
    />
    <van-cell
      is-link
      :title="t('bottomLeftPosition')"
      @click="openBottomLeftPositionDialog"
    />
    <van-cell
      is-link
      :title="t('customPosition')"
      @click="openCustomPositionDialog"
    />
  </demo-block>

  <demo-block card :title="t('closeMode')">
    <van-cell
      is-link
      :title="t('outsideMode')"
      @click="openOutsideModeDialog"
    />
    <van-cell is-link :title="t('insideMode')" @click="openInsideModeDialog" />
  </demo-block>

  <demo-block card :title="t('callbackUsage')">
    <van-cell is-link :title="t('callbackDemo')" @click="openCallbackDialog" />
  </demo-block>

  <demo-block card :title="t('slotUsage')">
    <van-cell
      is-link
      :title="t('closeIconSlot')"
      @click="showCloseIconSlot = true"
    />

    <van-ad-dialog
      v-model:show="showCloseIconSlot"
      v-model:checked="closeIconSlotChecked"
      :image="secondaryImage"
      :checkbox-text="t('checkboxText')"
      close-icon-mode="inside"
      close-icon-position="top-right"
    >
      <template #close-icon>
        <img :src="closeIconImage" class="custom-ad-dialog-close-icon" />
      </template>
    </van-ad-dialog>
  </demo-block>

  <demo-block card :title="t('customContentUsage')">
    <van-cell
      is-link
      :title="t('customContent')"
      @click="showCustomContent = true"
    />

    <van-ad-dialog
      v-model:show="showCustomContent"
      v-model:checked="customContentChecked"
      :width="320"
      :checkbox-text="t('checkboxText')"
      close-icon-mode="inside"
      close-icon-position="top-right"
      @click-image="onClickCustomContent"
    >
      <div class="custom-ad-dialog-content">
        <img :src="secondaryImage" class="custom-ad-dialog-content__image" />
        <div class="custom-ad-dialog-content__body">
          <span class="custom-ad-dialog-content__tag">{{
            t('customTag')
          }}</span>
          <div class="custom-ad-dialog-content__title">
            {{ t('customTitle') }}
          </div>
          <div class="custom-ad-dialog-content__desc">
            {{ t('customDesc') }}
          </div>
        </div>
      </div>
    </van-ad-dialog>
  </demo-block>
</template>

<style scoped>
.custom-ad-dialog-content {
  width: 100%;
  overflow: hidden;
  background: #ffffff;
  border-radius: 16px;
}

.custom-ad-dialog-content__image {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.custom-ad-dialog-content__body {
  padding: 16px;
}

.custom-ad-dialog-content__tag {
  display: inline-flex;
  padding: 2px 8px;
  color: #ee0a24;
  font-size: 12px;
  background: rgba(238, 10, 36, 0.08);
  border-radius: 999px;
}

.custom-ad-dialog-content__title {
  margin-top: 10px;
  color: #323233;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.custom-ad-dialog-content__desc {
  margin-top: 8px;
  color: #646566;
  font-size: 14px;
  line-height: 20px;
}

.custom-ad-dialog-close-icon {
  display: block;
  width: 20px;
  height: 20px;
}
</style>
