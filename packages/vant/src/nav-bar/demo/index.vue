<script setup lang="ts">
import { ref } from 'vue';
import VanNavBar from '..';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';
import type { NavBarButton, NavBarMenuItem } from '..';

const t = useTranslate({
  'zh-CN': {
    background: '自定义背景色',
    content: '左右内容',
    dropdownMenu: '右侧下拉菜单',
    leftButton: '左侧按钮',
    longTitle: '标题长度展示',
    rightButton: '右侧按钮',
    searchScenarios: '搜索框组合',
    searchPlaceholder: '搜索关键词',
    button: '四字按钮',
    userHome: '会员中心',
    subText: '副标题',
    subtitle: '辅助说明文字内容',
  },
  'en-US': {
    background: 'Custom Background',
    content: 'Left and Right Content',
    dropdownMenu: 'Dropdown Menu',
    leftButton: 'Left Button',
    longTitle: 'Long Title',
    rightButton: 'Right Button',
    searchScenarios: 'Search Scenarios',
    searchPlaceholder: 'Search',
    button: 'four button',
    userHome: 'userHome',
    subText: 'subText',
    subtitle: 'this is subtitle content message',
  },
});

/* ----搜索状态start---- */
const searchValue = ref('');
const searchValueWithText = ref('');
const searchValueWithButtons = ref('');
/* ----搜索状态end---- */

/* ----按钮数据配置start---- */
const leftButtons: NavBarButton[] = [{ icon: 'arrow-left' }, { icon: 'cross' }];
const leftButtons2: NavBarButton[] = [
  { icon: 'diamond-o', size: 16, text: t('userHome') },
];
const rightButtons: NavBarButton[] = [
  { icon: 'search', size: 22 },
  { icon: 'ellipsis', size: 22 },
];
const menuButtons: NavBarButton[] = [
  { icon: 'search' },
  {
    icon: 'ellipsis',
    menu: [
      { icon: 'icon-xiangce', color: '#333', text: '我的客服' },
      { icon: 'icon-xiangce', color: '#333', text: '我的关注' },
    ],
  },
];
const longTitle = 'This is a very long title for NavBar display';
/* ----按钮数据配置end---- */

/* ----交互事件处理start---- */
const onClickLeft = () => showToast(t('back'));
const onClickRight = () => showToast(t('button'));
const onClickLeftButton = (_button: NavBarButton, index: number) => {
  showToast(`${t('leftButton')} ${index + 1}`);
};
const onClickRightButton = (_button: NavBarButton, index: number) =>
  showToast(`${t('rightButton')} ${index + 1}`);
const onSelectRightMenu = (item: NavBarMenuItem) => showToast(item.text || '');
const onSearch = (value?: string) => showToast(value || t('searchPlaceholder'));
/* ----交互事件处理end---- */
</script>

<template>
  <!-- ----基础使用start---- -->
  <demo-block class="demo-nav-bar" :title="t('basicUsage')">
    <van-nav-bar :title="t('title')" />
  </demo-block>
  <!-- ----基础使用end---- -->

  <!-- ----副标题start---- -->
  <demo-block class="demo-nav-bar" :title="t('subText')">
    <van-nav-bar :title="t('title')" :subtitle="t('subtitle')" />
  </demo-block>
  <!-- ----副标题end---- -->

  <!-- ----自定义背景start---- -->
  <demo-block class="demo-nav-bar" :title="t('background')">
    <van-nav-bar
      :title="t('title')"
      background="linear-gradient(90deg, #e8f3ff, #ffffff)"
    />
  </demo-block>
  <!-- ----自定义背景end---- -->

  <!-- ----左右内容start---- -->
  <demo-block class="demo-nav-bar" :title="t('content')">
    <van-nav-bar
      :title="t('title')"
      :left-text="t('back')"
      :right-text="t('button')"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />

    <van-nav-bar
      :title="t('title')"
      :left-buttons="leftButtons"
      :right-text="t('button')"
      :right-buttons="rightButtons"
      @click-left-button="onClickLeftButton"
      @click-right-button="onClickRightButton"
      @click-right="onClickRight"
    />
  </demo-block>
  <!-- ----左右内容end---- -->

  <!-- ----右侧下拉菜单start---- -->
  <demo-block class="demo-nav-bar" :title="t('dropdownMenu')">
    <van-nav-bar
      :title="t('title')"
      :right-buttons="menuButtons"
      @click-left-button="onClickLeftButton"
      @click-right-button="onClickRightButton"
      @select-right-menu="onSelectRightMenu"
    />
  </demo-block>
  <!-- ----右侧下拉菜单end---- -->

  <!-- ----标题长度展示start---- -->
  <demo-block class="demo-nav-bar" :title="t('longTitle')">
    <van-nav-bar :title="longTitle" />
  </demo-block>
  <!-- ----标题长度展示end---- -->

  <!-- ----搜索框场景start---- -->
  <demo-block class="demo-nav-bar" :title="t('searchScenarios')">
    <van-nav-bar
      v-model:search-value="searchValue"
      search
      :search-placeholder="t('searchPlaceholder')"
      @search="onSearch"
    />

    <van-nav-bar
      v-model:search-value="searchValueWithText"
      search
      :left-buttons="leftButtons2"
      :right-text="t('button')"
      :search-placeholder="t('searchPlaceholder')"
      @click-left-button="onClickLeftButton"
      @click-right="onClickRight"
      @search="onSearch"
    />

    <van-nav-bar
      v-model:search-value="searchValueWithButtons"
      search
      :left-buttons="leftButtons"
      :right-buttons="rightButtons"
      :search-placeholder="t('searchPlaceholder')"
      @click-left-button="onClickLeftButton"
      @click-right-button="onClickRightButton"
      @search="onSearch"
    />
  </demo-block>
  <!-- ----搜索框场景end---- -->
</template>

<style lang="less">
/* ----demo间距样式start---- */
.demo-nav-bar {
  .van-nav-bar:not(:last-child) {
    margin-bottom: var(--van-padding-sm);
  }
}
/* ----demo间距样式end---- */
</style>
