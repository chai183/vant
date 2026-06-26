<script setup lang="ts">
import VanAvatar from '..';
import VanBadge from '../../badge';
import VanSpace from '../../space';
import { cdnURL, useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础用法',
    avatarSize: '头像大小',
    customSize: '自定义尺寸',
    customAvatar: '自定义头像',
    textAvatar: '文字头像',
    withBadge: '带徽标展示',
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    avatarSize: 'Avatar Size',
    customSize: 'Custom Size',
    customAvatar: 'Custom Image',
    textAvatar: 'Text Avatar',
    withBadge: 'With Badge',
  },
});

const customSrc = cdnURL('logo.png');
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-space wrap :size="16">
      <!-- 默认头像 -->
      <van-avatar type="default" />
      <!-- 文字头像 -->
      <van-avatar type="text" text="张三丰" />
      <!-- 群组/多人头像 -->
      <van-avatar type="group" />
      <!-- 头像-男 -->
      <van-avatar type="male" />
      <!-- 头像-女 -->
      <van-avatar type="female" />
    </van-space>
  </demo-block>

  <demo-block :title="t('avatarSize')">
    <van-space wrap :size="16" align="center">
      <van-avatar type="default" size="large" />
      <van-avatar type="default" size="medium_l" />
      <van-avatar type="default" size="medium" />
      <van-avatar type="default" size="small" />
      <van-avatar type="default" size="mini" />
    </van-space>
  </demo-block>

  <demo-block :title="t('customSize')">
    <van-space wrap :size="16" align="center">
      <van-avatar type="default" :size="48" />
      <van-avatar type="default" size="36px" />
    </van-space>
  </demo-block>

  <demo-block :title="t('textAvatar')">
    <van-space wrap :size="16" align="center">
      <van-avatar type="text" text="张三丰" />
      <van-avatar type="text" text="欧阳娜娜" />
      <van-avatar type="text" text="V" :font-size="12" />
    </van-space>
  </demo-block>

  <demo-block :title="t('customAvatar')">
    <van-space wrap :size="16" align="center">
      <van-avatar :src="customSrc" size="large" alt="avatar" />
      <van-avatar :src="customSrc" size="medium_l" alt="avatar" />
      <van-avatar :src="customSrc" size="medium" alt="avatar" />
      <van-avatar :src="customSrc" size="small" alt="avatar" />
      <van-avatar :src="customSrc" size="mini" alt="avatar" />
    </van-space>
  </demo-block>

  <demo-block :title="t('withBadge')">
    <van-space wrap :size="16">
      <van-badge content="5" :offset="[-8, 8]">
        <van-avatar type="text" text="V" />
      </van-badge>
      <van-badge dot :offset="[-8, 8]">
        <van-avatar type="default" />
      </van-badge>
    </van-space>
  </demo-block>
</template>

<style lang="less">
.demo-avatar {
  background: var(--van-background-2);
}
</style>
