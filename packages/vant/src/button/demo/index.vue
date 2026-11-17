<script setup lang="ts">
import VanButton from '..';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    type: '按钮类型',
    size: '按钮尺寸',
    icon: '图标按钮',
    loading: '加载状态',
    primary: '强按钮',
    large: '大号按钮',
    normal: '普通按钮',
    small: '小型按钮',
    mini: '迷你按钮',
    plain: '弱按钮',
    textButton: '文本按钮',
    textPlainSecondary: '次要文本',
    addIcon: '加图标',
    addIconStyle: '加图标样式',
    iconRight: '图标在右',
    primaryDisabled: '强按钮禁用态',
    plainDisabled: '弱按钮禁用态',
    disabled: '禁用状态',
    countdown: '倒计时',
    countdown3s: '倒计时（3s）',
    countdownDone: '倒计时完成',
    countdownDoneLong: '倒计时完成极限极限极限极限极限（3s）',
    loadingText: '加载中...',
    router: '页面导航',
    urlRoute: 'URL 跳转',
    vueRoute: '路由跳转',
    customColor: '自定义颜色',
    customBorderColor: '自定义边框颜色',
    pure: '单色按钮',
    gradient: '渐变色按钮',
    blockElement: '块级元素',
    animatedButton: '动画按钮',
    extra: '补充说明按钮',
    extraContent: '辅助补充说明文字信息',
    doTask: '做任务',
    lottery: '抽大奖',
    customSize: '自定义尺寸',
    customSizeButton: '上传附件',
    borderless: '无边框',
    borderlessPrimary: '无边框强按钮',
    borderlessPlain: '无边框弱按钮',
  },
  'en-US': {
    type: 'Type',
    size: 'Size',
    icon: 'Icon',
    loading: 'Loading',
    primary: 'Primary',
    large: 'Large',
    normal: 'Normal',
    small: 'Small',
    mini: 'Mini',
    plain: 'Plain',
    textButton: 'Text Button',
    textPlainSecondary: 'Secondary Text',
    addIcon: 'With Icon',
    addIconStyle: 'Icon Style',
    iconRight: 'Icon Right',
    primaryDisabled: 'Primary Disabled',
    plainDisabled: 'Plain Disabled',
    disabled: 'Disabled',
    countdown: 'Countdown',
    countdown3s: 'Countdown (3s)',
    countdownDone: 'Countdown Done',
    countdownDoneLong: 'Countdown Done Limit Limit Limit Limit Limit (3s)',
    loadingText: 'Loading...',
    router: 'Router',
    urlRoute: 'URL',
    vueRoute: 'Vue Router',
    customColor: 'Custom Color',
    customBorderColor: 'Custom Border Color',
    pure: 'Pure',
    gradient: 'Gradient',
    blockElement: 'Block Element',
    animatedButton: 'Animated Button',
    extra: 'Supplementary Button',
    extraContent: 'Auxiliary supplementary description text',
    doTask: 'Do Task',
    lottery: 'Lottery',
    customSize: 'Custom Size',
    customSizeButton: 'Upload File',
    borderless: 'Borderless',
    borderlessPrimary: 'Borderless Primary',
    borderlessPlain: 'Borderless Plain',
  },
});
</script>

<template>
  <demo-block :title="t('type')">
    <van-button>{{ t('primary') }}</van-button>
    <van-button plain :text="t('plain')" />
  </demo-block>

  <demo-block :title="t('textButton')">
    <div style="display: inline-flex; flex-wrap: wrap">
      <van-button text-button>{{ t('textButton') }}</van-button>
      <van-button text-button size="normal">{{ t('textButton') }}</van-button>
      <van-button text-button size="small">{{ t('textButton') }}</van-button>
      <van-button text-button size="mini">{{ t('textButton') }}</van-button>
    </div>
    <div style="display: inline-flex; flex-wrap: wrap">
      <van-button text-button disabled>{{ t('textButton') }}</van-button>
      <van-button text-button size="normal" disabled>{{
        t('textButton')
      }}</van-button>
      <van-button text-button size="small" disabled>{{
        t('textButton')
      }}</van-button>
      <van-button text-button size="mini" disabled>{{
        t('textButton')
      }}</van-button>
    </div>
    <div style="display: inline-flex; flex-wrap: wrap">
      <van-button plain text-button>{{ t('textButton') }}</van-button>
      <van-button plain text-button size="normal">{{
        t('textButton')
      }}</van-button>
      <van-button plain text-button size="small">{{
        t('textButton')
      }}</van-button>
      <van-button plain text-button size="mini">{{
        t('textButton')
      }}</van-button>
    </div>
    <div style="display: inline-flex; flex-wrap: wrap">
      <van-button plain text-button text-secondary>{{
        t('textPlainSecondary')
      }}</van-button>
      <van-button plain text-button text-secondary size="normal">{{
        t('textPlainSecondary')
      }}</van-button>
      <van-button plain text-button text-secondary size="small">{{
        t('textPlainSecondary')
      }}</van-button>
      <van-button plain text-button text-secondary size="mini">{{
        t('textPlainSecondary')
      }}</van-button>
    </div>
    <div style="display: inline-flex; flex-wrap: wrap">
      <van-button icon="add-o" text-button>{{ t('textButton') }}</van-button>
      <van-button icon="add-o" text-button size="normal">{{
        t('textButton')
      }}</van-button>
      <van-button icon="add-o" text-button size="small">{{
        t('textButton')
      }}</van-button>
      <van-button icon="add-o" text-button size="mini">{{
        t('textButton')
      }}</van-button>
    </div>
    <div style="display: inline-flex; flex-wrap: wrap">
      <van-button icon="add-o" icon-position="right" text-button>{{
        t('textButton')
      }}</van-button>
      <van-button
        icon="add-o"
        icon-position="right"
        text-button
        size="normal"
        >{{ t('textButton') }}</van-button
      >
      <van-button icon="add-o" icon-position="right" text-button size="small">{{
        t('textButton')
      }}</van-button>
      <van-button icon="add-o" icon-position="right" text-button size="mini">{{
        t('textButton')
      }}</van-button>
    </div>
  </demo-block>

  <demo-block :title="t('size')">
    <van-button>{{ t('primary') }}</van-button>
    <van-button size="normal">{{ t('primary') }}</van-button>
    <van-button size="small">{{ t('primary') }}</van-button>
    <van-button size="mini">{{ t('primary') }}</van-button>
  </demo-block>

  <demo-block :title="t('icon')">
    <van-button icon="add-o">{{ t('addIconStyle') }}</van-button>
    <van-button icon="add-o" size="normal">{{ t('addIcon') }}</van-button>
    <van-button icon="add-o" size="small">{{ t('addIcon') }}</van-button>
    <van-button icon="add-o" size="mini">{{ t('addIcon') }}</van-button>
  </demo-block>

  <demo-block :title="t('disabled')">
    <van-button disabled :text="t('primaryDisabled')" />
    <van-button icon="add-o" disabled :text="t('addIconStyle')" />
    <van-button plain disabled :text="t('plainDisabled')" />
    <van-button text-button disabled :text="t('plainDisabled')" />
    <van-button plain text-button disabled :text="t('plainDisabled')" />
  </demo-block>

  <demo-block :title="t('countdown')">
    <van-button size="normal" disabled :text="t('countdown3s')" />
    <van-button size="normal" :text="t('countdownDone')" />
    <van-button size="normal" :text="t('countdownDoneLong')" />
  </demo-block>

  <demo-block :title="t('customColor')">
    <van-button color="#FF8125" :text="t('pure')" />
    <van-button plain color="#FF3333" :text="t('pure')" />
    <van-button plain text-button color="#FF3333" :text="t('pure')" />
  </demo-block>

  <demo-block :title="t('extra')">
    <van-button>
      {{ t('primary') }}
      <template #extra>
        <div style="font-size: 12px; margin-top: 4px">
          {{ t('extraContent') }}
        </div>
      </template>
    </van-button>
  </demo-block>
</template>

<style lang="less">
.demo-button {
  .van-button {
    margin-bottom: 12px;

    &:not(:last-child) {
      margin-right: var(--van-padding-md);
    }

    &--normal:not(&--text) {
      .van-button__content {
        min-width: 140px;
      }
    }
  }

  .van-doc-demo-block {
    padding: 0 var(--van-padding-md);
  }

  .van-doc-demo-block__title {
    padding-left: 0;
  }

  &-row {
    margin-bottom: var(--van-padding-sm);
  }

  &-text-row {
    display: flex;
    gap: 20px;
    margin-bottom: var(--van-padding-md);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .notice-swipe {
    height: 40px;
    line-height: 40px;
  }

  &-extra {
    font-size: 12px;
    line-height: 1.2;
    color: var(--van-text-color-secondary);
  }
}
</style>
