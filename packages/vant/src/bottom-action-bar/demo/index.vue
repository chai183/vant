<script setup lang="ts">
import VanBottomActionBar from '..';
import type { PopoverAction } from '../../popover';
import VanButton from '../../button';
import VanCheckbox from '../../checkbox';
import VanCheckboxGroup from '../../checkbox-group';
import VanHighlight from '../../highlight';
import VanIcon from '../../icon';
import VanProForm from '../../pro-form';
import type { ProFormColumn } from '../../pro-form/types';
import type { FormExpose } from '../../form/types';
import { ref, computed } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    singlePrimary: '单个主按钮',
    dualButtons: '主次双按钮',
    tripleButtons: '三个按钮',
    moreButtons: '更多操作 + 按钮',
    moreCustomSlot: '更多操作自定义插槽',
    selectAllA: '全选',
    selectedCountPrefix: '已选',
    selectedCountUnit: '笔',
    selectedAmountPrefix: '总金额',
    selectedAmountUnit: '元',
    favoriteShare: '收藏与分享',
    collect: '收藏',
    share: '分享',
    collected: '已收藏',
    uncollected: '已取消收藏',
    toastShare: '点击分享',
    agreement: '协议提示 + 操作',
    filterContent: '下拉筛选 + 主次按钮',
    reset: '重置',
    confirm: '确定',
    secondary: '次要操作',
    tertiary: '次要操作2',
    sendBack: '打回',
    veto: '否决',
    reject: '拒绝',
    approve: '通过',
    agree: '同意',
    operate: '操作',
    more: '更多操作',
    moreIconLeft: '图标在左',
    extraAction1: '选项一',
    extraAction2: '选项二',
    extraAction3: '选项三',
    moreSelectToast: '选中：',
    agreement1: '本人已仔细阅读并同意以上所有条款',
    agreement1Keywords: '以上所有条款',
    agreement2: '并同意《宁波银行APP隐私协议》',
    agreement2Keywords: '《宁波银行APP隐私协议》',
    tagOption1: '选项 1',
    tagLabel: '标签列表-常规',
    tagUnselected: '未选',
    dateLabel: '选择日期',
    startDate: '起始日期',
    endDate: '终止日期',
    toastReset: '重置',
    toastConfirm: '确定',
    toastOperate: '操作',
  },
  'en-US': {
    singlePrimary: 'Single primary',
    dualButtons: 'Secondary + primary',
    tripleButtons: 'Three buttons',
    moreButtons: 'More + buttons',
    moreCustomSlot: 'Custom more slot',
    selectAllA: 'Select all a',
    selectedCountPrefix: 'Selected ',
    selectedCountUnit: ' items, total amount ',
    selectedAmountPrefix: '',
    selectedAmountUnit: '',
    favoriteShare: 'Favorite & share',
    collect: 'Favorite',
    share: 'Share',
    collected: 'Favorited',
    uncollected: 'Unfavorited',
    toastShare: 'Share clicked',
    agreement: 'Agreement + action',
    filterContent: 'Dropdown filter + buttons',
    reset: 'Reset',
    confirm: 'Confirm',
    secondary: 'Secondary',
    tertiary: 'Secondary 2',
    sendBack: 'Send back',
    veto: 'Veto',
    reject: 'Reject',
    approve: 'Approve',
    agree: 'Agree',
    operate: 'Action',
    more: 'More',
    moreIconLeft: 'Icon on left',
    extraAction1: 'Option 1',
    extraAction2: 'Option 2',
    extraAction3: 'Option 3',
    moreSelectToast: 'Selected: ',
    agreement1: 'I have read and agree to the terms above.',
    agreement1Keywords: 'terms above',
    agreement2: 'I agree to the Privacy Policy.',
    agreement2Keywords: 'Privacy Policy',
    tagOption1: 'Option 1',
    tagLabel: 'Tag list',
    tagUnselected: 'None',
    dateLabel: 'Select date',
    startDate: 'Start date',
    endDate: 'End date',
    toastReset: 'Reset',
    toastConfirm: 'Confirm',
    toastOperate: 'Action',
  },
});

const agreedItems = ref<string[]>([]);
const selectAllItems = ref<string[]>([]);
const collected = ref(false);
const moreExpanded = ref(false);

const selectedCount = computed(() => 9999);

const selectedAmount = 10000000000;

const formatWithComma = (value: number) => value.toLocaleString('en-US');

const formattedSelectedCount = computed(() =>
  formatWithComma(selectedCount.value),
);

const formattedSelectedAmount = computed(() => formatWithComma(selectedAmount));

const moreActions = computed<PopoverAction[]>(() => [
  { text: t('extraAction1'), value: 'action1' },
  { text: t('extraAction2'), value: 'action2' },
  { text: t('extraAction3'), value: 'action3' },
]);

const tagOptions = computed(() => [
  { label: t('tagOption1'), value: '0' },
  { label: t('tagUnselected'), value: '1' },
  { label: t('tagUnselected'), value: '2' },
  { label: t('tagUnselected'), value: '3' },
  { label: t('tagUnselected'), value: '4' },
  { label: t('tagUnselected'), value: '5' },
]);

const tagModel = ref({ tag: '0' });
const tagFormRef = ref<FormExpose>();

const tagColumns = computed<ProFormColumn[]>(() => [
  {
    name: 'tag',
    label: t('tagLabel'),
    component: 'radioGroup',
    defaultValue: '0',
    fieldProps: {
      labelAlign: 'top',
    },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: tagOptions.value,
    },
  },
]);

const dateModel = ref({});
const dateFormRef = ref<FormExpose>();

const dateColumns = computed<ProFormColumn[]>(() => [
  {
    name: 'dateRange',
    label: t('dateLabel'),
    component: 'rangeInput',
    defaultValue: ['', ''],
    componentProps: {
      layout: 'horizontal',
      showDateShortcuts: true,
      start: {
        component: 'datePicker',
        fieldProps: {
          inputBorder: true,
          placeholder: t('startDate'),
        },
      },
      end: {
        component: 'datePicker',
        fieldProps: {
          inputBorder: true,
          placeholder: t('endDate'),
        },
      },
    },
  },
]);

const onMoreSelect = (action: PopoverAction) => {
  showToast(`${t('moreSelectToast')}${action.value}`);
};

const onToggleCollect = () => {
  collected.value = !collected.value;
  showToast(collected.value ? t('collected') : t('uncollected'));
};

const onShare = () => {
  showToast(t('toastShare'));
};

const onTagReset = () => {
  tagModel.value = { tag: '0' };
  tagFormRef.value?.resetValidation();
  showToast(t('toastReset'));
};

const onTagSubmit = () => {
  showToast(t('toastConfirm'));
};

const onDateSubmit = (values: Record<string, unknown>) => {
  const range = values.dateRange as string[];
  if (range?.[0] && range?.[1]) {
    showToast(`${range[0]} ~ ${range[1]}`);
    return;
  }
  showToast(t('toastConfirm'));
};
</script>

<template>
  <demo-block :title="t('singlePrimary')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :primary-button-text="t('confirm')"
        @click-primary="showToast(t('toastConfirm'))"
      />
    </div>
  </demo-block>

  <demo-block :title="t('dualButtons')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :secondary-button-text="t('reset')"
        :primary-button-text="t('confirm')"
        @click-secondary="showToast(t('toastReset'))"
        @click-primary="showToast(t('toastConfirm'))"
      />
    </div>
  </demo-block>

  <demo-block :title="t('tripleButtons')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :secondary-button-text="t('secondary')"
        :tertiary-button-text="t('tertiary')"
        show-tertiary-button
        :primary-button-text="t('confirm')"
        @click-secondary="showToast(t('secondary'))"
        @click-tertiary="showToast(t('tertiary'))"
        @click-primary="showToast(t('toastConfirm'))"
      />
    </div>
  </demo-block>

  <demo-block :title="t('moreButtons')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        v-model:more-expanded="moreExpanded"
        show-more
        more-popover-placement="top-start"
        :more-text="t('more')"
        :more-actions="moreActions"
        :secondary-button-text="t('secondary')"
        :primary-button-text="t('confirm')"
        @select-more="onMoreSelect"
        @click-secondary="showToast(t('secondary'))"
        @click-primary="showToast(t('toastConfirm'))"
      />
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        show-more
        more-icon-position="left"
        :more-text="t('moreIconLeft')"
        :more-actions="moreActions"
        :primary-button-text="t('confirm')"
      />
    </div>
  </demo-block>

  <demo-block :title="t('moreCustomSlot')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :start-gap="67"
        :secondary-button-text="t('reject')"
        :primary-button-text="t('approve')"
        :secondary-disabled="true"
        :tertiary-disabled="true"
        :primary-disabled="true"
        @click-secondary="showToast(t('reject'))"
        @click-primary="showToast(t('approve'))"
      >
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :start-gap="67"
        :secondary-button-text="t('reject')"
        :primary-button-text="t('approve')"
        @click-secondary="showToast(t('reject'))"
        @click-primary="showToast(t('approve'))"
      >
        <template #top>
          <div
            class="demo-bottom-action-bar__selected-count van-hairline--bottom"
          >
            {{ t('selectedCountPrefix')
            }}<span class="demo-bottom-action-bar__selected-count-strong">{{
              formattedSelectedCount
            }}</span
            >{{ t('selectedCountUnit')
            }}<span class="demo-bottom-action-bar__selected-amount"
              >{{ t('selectedAmountPrefix')
              }}<span class="demo-bottom-action-bar__selected-count-strong">{{
                formattedSelectedAmount
              }}</span
              >{{ t('selectedAmountUnit') }}</span
            >
          </div>
        </template>
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :start-gap="67"
        :secondary-button-text="t('sendBack')"
        :tertiary-button-text="t('veto')"
        show-tertiary-button
        :primary-button-text="t('agree')"
        @click-secondary="showToast(t('sendBack'))"
        @click-tertiary="showToast(t('veto'))"
        @click-primary="showToast(t('agree'))"
      >
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :start-gap="67"
        :secondary-button-text="t('sendBack')"
        :tertiary-button-text="t('veto')"
        show-tertiary-button
        :primary-button-text="t('agree')"
        :secondary-disabled="true"
        :tertiary-disabled="true"
        :primary-disabled="true"
        @click-secondary="showToast(t('sendBack'))"
        @click-tertiary="showToast(t('veto'))"
        @click-primary="showToast(t('toastConfirm'))"
      >
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('favoriteShare')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :start-gap="34"
        :secondary-button-text="t('secondary')"
        :primary-button-text="t('confirm')"
        @click-secondary="showToast(t('secondary'))"
        @click-primary="showToast(t('toastConfirm'))"
      >
        <template #more>
          <div class="demo-bottom-action-bar__icons">
            <button
              type="button"
              class="demo-bottom-action-bar__icon-item"
              :class="{
                'demo-bottom-action-bar__icon-item--active': collected,
              }"
              @click="onToggleCollect"
            >
              <van-icon :name="collected ? 'like' : 'like-o'" />
              <span>{{ t('collect') }}</span>
            </button>
            <button
              type="button"
              class="demo-bottom-action-bar__icon-item"
              @click="onShare"
            >
              <van-icon name="share-o" />
              <span>{{ t('share') }}</span>
            </button>
          </div>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('agreement')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar
        :primary-button-text="t('operate')"
        @click-primary="showToast(t('toastOperate'))"
      >
        <template #top>
          <van-checkbox-group
            v-model="agreedItems"
            shape="square"
            class="demo-bottom-action-bar__agreement-group van-hairline--bottom"
          >
            <van-checkbox name="clause1">
              <van-highlight
                tag="span"
                :source-string="t('agreement1')"
                :keywords="t('agreement1Keywords')"
              />
            </van-checkbox>
            <van-checkbox name="clause2">
              <van-highlight
                tag="span"
                :source-string="t('agreement2')"
                :keywords="t('agreement2Keywords')"
              />
            </van-checkbox>
          </van-checkbox-group>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('filterContent')">
    <div class="demo-bottom-action-bar demo-bottom-action-bar--panel">
      <section class="demo-bottom-action-bar__filter-block">
        <van-bottom-action-bar
          :secondary-button-text="t('reset')"
          :primary-button-text="t('confirm')"
          @click-secondary="onTagReset"
          @click-primary="tagFormRef?.submit()"
          :style="{ '--van-bottom-action-bar-bar-padding': '12px 12px' }"
        >
          <template #top>
            <van-pro-form
              v-model="tagModel"
              ref="tagFormRef"
              class="demo-bottom-action-bar__filter-form"
              :columns="tagColumns"
              :show-submit="false"
              :style="{
                '--van-field-label-top-margin-bottom': '17px',
                '--van-field-cell-vertical-padding': '16px',
                '--van-field-cell-horizontal-padding': '12px',
              }"
              @submit="onTagSubmit"
            />
          </template>
        </van-bottom-action-bar>
      </section>

      <section class="demo-bottom-action-bar__filter-block">
        <van-bottom-action-bar
          :show-secondary-button="false"
          :primary-button-text="t('confirm')"
          :style="{ '--van-bottom-action-bar-bar-padding': '12px 12px' }"
          @click-primary="dateFormRef?.submit()"
        >
          <template #top>
            <van-pro-form
              v-model="dateModel"
              ref="dateFormRef"
              class="demo-bottom-action-bar__filter-form"
              :columns="dateColumns"
              :show-submit="false"
              :style="{
                '--van-field-label-top-margin-bottom': '17px',
                '--van-field-cell-vertical-padding': '16px',
                '--van-field-cell-horizontal-padding': '12px',
              }"
              @submit="onDateSubmit"
            />
          </template>
        </van-bottom-action-bar>
      </section>
    </div>
  </demo-block>

  <demo-block title="Custom actions slot">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar>
        <template #actions>
          <van-button round plain type="primary" @click="showToast(t('reset'))">
            {{ t('reset') }}
          </van-button>
          <van-button round type="primary" @click="showToast(t('confirm'))">
            {{ t('confirm') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>
</template>

<style lang="less">
.demo-bottom-action-bar {
  .van-bottom-action-bar {
    position: relative;
    right: auto;
    bottom: auto;
    left: auto;
    width: 100%;
    margin-bottom: 16px;
  }

  &--panel {
    padding: var(--van-padding-md);
    background: var(--van-background);
  }

  &__filter-block {
    margin-bottom: var(--van-padding-lg);

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__filter-form {
    .van-cell-group.van-hairline--top-bottom::after {
      display: none;
    }
  }

  &__agreement-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 9px 13px;
  }

  &__selected-count {
    padding: 11px 12px;
    line-height: var(--van-font-size-md);
    font-size: var(--van-font-size-md);
    color: var(--van-text-color-auxiliary);
  }

  &__selected-count-strong {
    margin: 0 4px;
    font-size: var(--van-font-size-lg);
    font-weight: 400;
    line-height: var(--van-font-size-lg);
    color: var(--van-black);
  }

  &__selected-amount {
    margin-left: var(--van-padding-md);
  }

  &__agreement {
    font-size: var(--van-font-size-sm);
    line-height: 1.5;
    color: var(--van-text-color-2);
  }

  &__icons {
    display: flex;
    gap: 32px;
  }

  &__icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 0;
    color: var(--van-text-color-secondary);
    font-size: var(--van-font-size-xs);
    line-height: 1;
    cursor: pointer;
    background: transparent;
    border: none;
    outline: none;
    appearance: none;

    .van-icon {
      font-size: 20px;
      color: var(--van-text-color-secondary);
    }

    &:active {
      opacity: var(--van-active-opacity);
    }

    &--active {
      color: var(--van-primary-color);

      .van-icon {
        color: currentColor;
      }
    }
  }
}
</style>
