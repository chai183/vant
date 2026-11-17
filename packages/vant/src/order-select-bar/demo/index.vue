<script setup lang="ts">
import VanOrderSelectBar from '..';
import VanButton from '../../button';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础用法',
    leftSlot: '左侧插槽(全选)',
    threeButtons: '三个按钮',
    tipSlot: '顶部提示插槽',
    customButton: '右侧插槽(自定义按钮)',
    tip: '满99包邮，还剩12元',
    reject: '拒绝',
    approve: '通过',
    selectAll: '全选',
    toastCollect: '收藏',
    toastShare: '分享',
    return: '打回',
    veto: '否决',
    pass: '同意',
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    leftSlot: 'Left Slot (Select All)',
    threeButtons: 'Three Buttons',
    tipSlot: 'Top Tip Slot',
    customButton: 'Custom Button',
    tip: 'Free shipping over 99, 12 more to go',
    reject: 'reject',
    approve: 'approve',
    selectAll: 'Select All',
    toastCollect: 'Favorited',
    toastShare: 'Shared',
    return: 'return',
    veto: 'veto',
    pass: 'pass',
  },
});

const checked = ref(true);
const collected = ref(false);
</script>

<template>
  <!-- 基础用法 -->
  <demo-block :title="t('basicUsage')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :show-collect="false"
        :show-share="false"
        :select-all-text="t('selectAll')"
        :secondary-button-text="t('reject')"
        :primary-button-text="t('approve')"
        @click-secondary="showToast(t('reject'))"
        @click-primary="showToast(t('approve'))"
      />
    </div>
  </demo-block>
  <!-- 顶部提示插槽 -->
  <demo-block :title="t('tipSlot')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :select-all-text="t('selectAll')"
        :secondary-button-text="t('reject')"
        :primary-button-text="t('approve')"
        :show-collect="false"
        :show-share="false"
        @click-secondary="showToast(t('reject'))"
        @click-primary="showToast(t('approve'))"
      >
        <template #top>
          <span>{{ t('tip') }}</span>
        </template>
      </van-order-select-bar>
    </div>
  </demo-block>
  <!-- 三个按钮 -->
  <demo-block :title="t('threeButtons')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :select-all-text="t('selectAll')"
        show-tertiary-button
        :show-collect="false"
        :show-share="false"
      >
        <template #secondary-button>
          <van-button
            size="large"
            plain
            type="primary"
            width="82px"
            @click="showToast(t('return'))"
          >
            {{ t('return') }}
          </van-button>
        </template>
        <template #tertiary-button>
          <van-button
            size="large"
            type="primary"
            plain
            width="82px"
            @click="showToast(t('veto'))"
          >
            {{ t('veto') }}
          </van-button>
        </template>
        <template #primary-button>
          <van-button
            size="large"
            type="primary"
            plain
            width="82px"
            @click="showToast(t('pass'))"
          >
            {{ t('pass') }}
          </van-button>
        </template>
      </van-order-select-bar>
    </div>
  </demo-block>
  <!-- 自定义按钮 -->
  <demo-block :title="t('customButton')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :select-all-text="t('selectAll')"
        :show-collect="false"
        :show-share="false"
      >
        <template #top>
          <span>{{ t('tip') }}</span>
        </template>
        <template #secondary-button>
          <van-button
            size="large"
            plain
            type="primary"
            width="82px"
            @click="showToast(t('return'))"
          >
            {{ t('return') }}
          </van-button>
        </template>
        <template #tertiary-button>
          <van-button
            size="large"
            type="primary"
            plain
            width="82px"
            @click="showToast(t('veto'))"
          >
            {{ t('veto') }}
          </van-button>
        </template>
        <template #primary-button>
          <van-button
            size="large"
            type="primary"
            plain
            width="82px"
            @click="showToast(t('return'))"
          >
            {{ t('return') }}
          </van-button>
        </template>
      </van-order-select-bar>
    </div>
  </demo-block>
  <!-- 收藏+分享+按钮 -->
  <demo-block :title="t('leftSlot')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :is-all-check="false"
        :collect-active="collected"
        :secondary-button-text="t('reject')"
        :primary-button-text="t('pass')"
        @click-collect="collected = !collected"
        @click-share="showToast(t('toastShare'))"
        @click-secondary="showToast(t('reject'))"
        @click-primary="showToast(t('pass'))"
      >
      </van-order-select-bar>
    </div>
  </demo-block>
  <!-- 左侧插槽 -->
  <demo-block :title="t('leftSlot')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :is-all-check="false"
        :show-collect="false"
        :show-share="false"
        :collect-active="collected"
        :secondary-button-text="t('reject')"
        :primary-button-text="t('pass')"
        @click-collect="collected = !collected"
        @click-share="showToast(t('toastShare'))"
        @click-secondary="showToast(t('reject'))"
        @click-primary="showToast(t('pass'))"
      >
        <template #left> 左侧插槽 </template>
      </van-order-select-bar>
    </div>
  </demo-block>
</template>

<style lang="less">
.demo-order-select-bar {
  .van-order-select-bar {
    position: relative !important;
    right: auto;
    bottom: auto;
    left: auto;
    width: 100%;
    margin-top: 20px;
  }
}
</style>
