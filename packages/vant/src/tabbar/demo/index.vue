<script setup lang="ts">
import VanTabbar from '..';
import VanTabbarItem from '../../tabbar-item';
import { Icon } from '../../icon';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    badge: '徽标提示',
    customIcon: '自定义图标',
    customColor: '自定义颜色',
    matchByName: '通过名称匹配',
    switchEvent: '监听切换事件',
  },
  'en-US': {
    badge: 'Show Badge',
    customIcon: 'Custom Icon',
    customColor: 'Custom Color',
    matchByName: 'Match by name',
    switchEvent: 'Change Event',
  },
});

const active = ref(0);
const active2 = ref(0);
const active3 = ref(0);
const active4 = ref(0);
const active5 = ref(0);
const activeName = ref('home');

const onChange = (index: number) => {
  showToast(`${t('tab')} ${index + 1}`);
};
</script>

<template>
  <!-- 基础使用 -->
  <demo-block :title="t('basicUsage')">
    <van-tabbar v-model="active" show-shadow>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
    </van-tabbar>
    <van-tabbar v-model="active">
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
    </van-tabbar>
  </demo-block>
  <!-- 通过名称匹配 -->
  <demo-block :title="t('matchByName')">
    <van-tabbar v-model="activeName">
      <van-tabbar-item name="home" icon="icon-liulanqi">
        {{ t('tab') }}
      </van-tabbar-item>
      <van-tabbar-item name="search" icon="icon-liulanqi">
        {{ t('tab') }}
      </van-tabbar-item>
      <van-tabbar-item name="friends" icon="icon-liulanqi">
        {{ t('tab') }}
      </van-tabbar-item>
      <van-tabbar-item name="setting" icon="icon-liulanqi">
        {{ t('tab') }}
      </van-tabbar-item>
    </van-tabbar>
  </demo-block>
  <!-- 徽标 -->
  <demo-block :title="t('badge')">
    <van-tabbar v-model="active2">
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi" dot>{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi" badge="5">
        {{ t('tab') }}
      </van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi" badge="111">
        {{ t('tab') }}
      </van-tabbar-item>
    </van-tabbar>
  </demo-block>
  <!-- 自定义图标 -->
  <demo-block :title="t('customIcon')">
    <van-tabbar v-model="active3">
      <van-tabbar-item badge="3">
        <span>{{ t('custom') }}</span>
        <template #icon="props">
          <Icon
            name="icon-xiangce"
            :color="props.active ? '#ff8125' : '#999'"
          />
        </template>
      </van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">最多五个字</van-tabbar-item>
    </van-tabbar>
  </demo-block>
  <!-- 自定义颜色 -->
  <demo-block :title="t('customColor')">
    <van-tabbar v-model="active4" active-color="#ee0a24">
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{ t('tab') }}</van-tabbar-item>
    </van-tabbar>
  </demo-block>
  <!-- 切换监听 -->
  <demo-block :title="t('switchEvent')">
    <van-tabbar v-model="active5" @change="onChange">
      <van-tabbar-item icon="icon-liulanqi">{{
        `${t('tab')} 1`
      }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{
        `${t('tab')} 2`
      }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{
        `${t('tab')} 3`
      }}</van-tabbar-item>
      <van-tabbar-item icon="icon-liulanqi">{{
        `${t('tab')} 4`
      }}</van-tabbar-item>
    </van-tabbar>
  </demo-block>
</template>

<style lang="less">
.demo-tabbar {
  .van-tabbar {
    position: relative;
    padding-bottom: 0;
    &:not(:last-child) {
      margin-bottom: var(--van-padding-sm);
    }
  }
}
</style>
