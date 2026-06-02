<script setup lang="ts">
import VanOrderSelectBar from '..';
import VanButton from '../../button';
import VanCheckbox from '../../checkbox';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础用法',
    leftSlot: '左侧插槽（全选）',
    threeButtons: '三个按钮',
    tipSlot: '顶部提示插槽',
    customButton: '自定义按钮',
    rightSlot: '右侧插槽',
    rightSlotAmount: '金额 + 按钮',
    rightSlotLink: '文字链接触发',
    rightCustom: '合计 ¥128.00',
    rightSubtotal: '已选 3 件',
    goAdd: '去凑单',
    rightLinkToast: '去凑单',
    tip: '满 99 元包邮，还差 12 元',
    secondary: '移入收藏',
    tertiary: '删除',
    primary: '结算',
    selectAll: '全选',
    toastSecondary: '移入收藏',
    toastTertiary: '删除',
    toastPrimary: '去结算',
    toastCollect: '收藏',
    toastShare: '分享',
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    leftSlot: 'Left slot (select all)',
    threeButtons: 'Three buttons',
    tipSlot: 'Top tip slot',
    customButton: 'Custom buttons',
    rightSlot: 'Right slot',
    rightSlotAmount: 'Amount + button',
    rightSlotLink: 'Text link action',
    rightCustom: 'Total ¥128.00',
    rightSubtotal: '3 items',
    goAdd: 'Add more',
    rightLinkToast: 'Add more',
    tip: 'Add ¥12 more for free shipping',
    secondary: 'Secondary',
    tertiary: 'Delete',
    primary: 'Checkout',
    selectAll: 'Select all',
    toastSecondary: 'Secondary',
    toastTertiary: 'Delete',
    toastPrimary: 'Checkout',
    toastCollect: 'Favorite',
    toastShare: 'Share',
  },
});

const checked = ref(true);
const collected = ref(false);
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :collect-active="collected"
        :select-all-text="t('selectAll')"
        :secondary-button-text="t('secondary')"
        :primary-button-text="t('primary')"
        @click-collect="collected = !collected"
        @click-share="showToast(t('toastShare'))"
        @click-secondary="showToast(t('toastSecondary'))"
        @click-primary="showToast(t('toastPrimary'))"
      />
    </div>
  </demo-block>

  <demo-block :title="t('leftSlot')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :collect-active="collected"
        :secondary-button-text="t('secondary')"
        :primary-button-text="t('primary')"
        @click-collect="collected = !collected"
        @click-share="showToast(t('toastShare'))"
        @click-secondary="showToast(t('toastSecondary'))"
        @click-primary="showToast(t('toastPrimary'))"
      >
        <template
          #left="{
            checked: allChecked,
            disabled,
            indeterminate,
            updateChecked,
          }"
        >
          <van-checkbox
            :model-value="allChecked"
            :disabled="disabled"
            :indeterminate="indeterminate"
            @update:model-value="updateChecked"
          >
            {{ t('selectAll') }}
          </van-checkbox>
        </template>
      </van-order-select-bar>
    </div>
  </demo-block>

  <demo-block :title="t('threeButtons')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :select-all-text="t('selectAll')"
        :secondary-button-text="t('secondary')"
        :tertiary-button-text="t('tertiary')"
        show-tertiary-button
        :primary-button-text="t('primary')"
        :show-collect="false"
        :show-share="false"
        @click-secondary="showToast(t('toastSecondary'))"
        @click-tertiary="showToast(t('toastTertiary'))"
        @click-primary="showToast(t('toastPrimary'))"
      />
    </div>
  </demo-block>

  <demo-block :title="t('tipSlot')">
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :select-all-text="t('selectAll')"
        :secondary-button-text="t('secondary')"
        :primary-button-text="t('primary')"
        :show-collect="false"
        :show-share="false"
        @click-secondary="showToast(t('toastSecondary'))"
        @click-primary="showToast(t('toastPrimary'))"
      >
        <template #top>
          <span>{{ t('tip') }}</span>
        </template>
      </van-order-select-bar>
    </div>
  </demo-block>

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
          <van-button size="small" plain type="primary">
            {{ t('secondary') }}
          </van-button>
        </template>
        <template #tertiary-button>
          <van-button size="small" plain type="warning">
            {{ t('tertiary') }}
          </van-button>
        </template>
        <template #primary-button>
          <van-button size="small" type="danger">{{ t('primary') }}</van-button>
        </template>
      </van-order-select-bar>
    </div>
  </demo-block>

  <demo-block :title="t('rightSlot')">
    <p class="demo-order-select-bar__desc">{{ t('rightSlotAmount') }}</p>
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
        <template #right>
          <div class="demo-order-select-bar__right-custom">
            <div class="demo-order-select-bar__right-info">
              <span class="demo-order-select-bar__right-sub">{{
                t('rightSubtotal')
              }}</span>
              <span class="demo-order-select-bar__right-label">{{
                t('rightCustom')
              }}</span>
            </div>
            <van-button
              size="small"
              type="primary"
              @click="showToast(t('toastPrimary'))"
            >
              {{ t('primary') }}
            </van-button>
          </div>
        </template>
      </van-order-select-bar>
    </div>

    <p class="demo-order-select-bar__desc">{{ t('rightSlotLink') }}</p>
    <div class="demo-order-select-bar">
      <van-order-select-bar
        v-model="checked"
        :select-all-text="t('selectAll')"
        :show-collect="false"
        :show-share="false"
      >
        <template #right>
          <button
            type="button"
            class="demo-order-select-bar__right-link"
            @click="showToast(t('rightLinkToast'))"
          >
            {{ t('goAdd') }}
          </button>
        </template>
      </van-order-select-bar>
    </div>
  </demo-block>
</template>

<style lang="less">
.demo-order-select-bar {
  .van-order-select-bar {
    position: relative;
    right: auto;
    bottom: auto;
    left: auto;
    width: 100%;
  }

  &__desc {
    margin: 0 0 var(--van-padding-sm);
    padding: 0 var(--van-padding-md);
    color: var(--van-text-color-2);
    font-size: var(--van-font-size-sm);
    line-height: var(--van-line-height-sm);
  }

  &__right-custom {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--van-padding-sm);
  }

  &__right-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;
  }

  &__right-sub {
    color: var(--van-text-color-2);
    font-size: var(--van-font-size-xs);
  }

  &__right-label {
    font-size: var(--van-font-size-md);
    font-weight: var(--van-font-bold);
    color: var(--van-danger-color);
    white-space: nowrap;
  }

  &__right-link {
    padding: 0;
    color: var(--van-primary-color);
    font-size: var(--van-font-size-md);
    line-height: var(--van-line-height-md);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: none;
    outline: none;
    appearance: none;

    &:active {
      opacity: var(--van-active-opacity);
    }
  }
}
</style>
