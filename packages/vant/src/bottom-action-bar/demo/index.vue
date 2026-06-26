<script setup lang="ts">
import VanBottomActionBar from '..';
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
    multiSecondaryButtons: '两个次按钮 / 三个次按钮',
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
    textButton: '文本按钮',
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
    moreReferenceSlot: '自定义溢出 Popover 触发器',
    customMore: '更多',
    customMoreExpanded: '收起',
    extraAction1: '选项一',
    extraAction2: '选项二',
    extraAction3: '选项三',
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
    multiSecondaryButtons: 'Two / three secondary buttons',
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
    textButton: 'Text button',
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
    moreReferenceSlot: 'Custom overflow Popover trigger',
    customMore: 'More',
    customMoreExpanded: 'Collapse',
    extraAction1: 'Option 1',
    extraAction2: 'Option 2',
    extraAction3: 'Option 3',
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

const selectedCount = computed(() => 9999);

const selectedAmount = 10000000000;

const formatWithComma = (value: number) => value.toLocaleString('en-US');

const formattedSelectedCount = computed(() =>
  formatWithComma(selectedCount.value),
);

const formattedSelectedAmount = computed(() => formatWithComma(selectedAmount));

type TextButtonDemoItem = {
  plain?: boolean;
};

type TextButtonDemo = {
  maxVisibleActions?: number;
  buttons: TextButtonDemoItem[];
};

const onTextButtonConfirm = () => showToast(t('toastConfirm'));

const getTextButtonProps = (plain?: boolean) => ({
  size: 'small' as const,
  textButton: true,
  plain,
  type: 'primary' as const,
  onClick: onTextButtonConfirm,
});

const textButtonDemos: TextButtonDemo[] = [
  { buttons: [{}] },
  {
    buttons: [{}, { plain: true }],
  },
  {
    buttons: [{}, { plain: true }, { plain: true }],
  },
  {
    buttons: [{}, { plain: true }, { plain: true }, { plain: true }],
  },
  {
    maxVisibleActions: 4,
    buttons: [
      {},
      { plain: true },
      { plain: true },
      { plain: true },
      { plain: true },
    ],
  },
];

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
      <van-bottom-action-bar>
        <template #actions>
          <van-button block type="primary" @click="showToast(t('toastConfirm'))">
            {{ t('confirm') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('dualButtons')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar>
        <template #actions>
          <van-button type="primary" @click="showToast(t('toastConfirm'))">
            {{ t('confirm') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('toastReset'))">
            {{ t('reset') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('multiSecondaryButtons')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar>
        <template #actions>
          <van-button plain type="primary" @click="showToast(t('toastConfirm'))">
            {{ t('confirm') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('tertiary'))">
            {{ t('tertiary') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar>
        <template #actions>
          <van-button plain type="primary" @click="showToast(t('toastConfirm'))">
            {{ t('confirm') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('extraAction1'))">
            {{ t('extraAction1') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('extraAction2'))">
            {{ t('extraAction2') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('moreButtons')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :max-visible-actions="2" more-popover-placement="top-start" :more-text="t('more')">
        <template #actions>
          <van-button type="primary" @click="showToast(t('toastConfirm'))">
            {{ t('confirm') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('secondary'))">
            {{ t('secondary') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('extraAction1'))">
            {{ t('extraAction1') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('extraAction2'))">
            {{ t('extraAction2') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :max-visible-actions="2" more-icon-position="left" :more-text="t('moreIconLeft')">
        <template #actions>
          <van-button type="primary" @click="showToast(t('approve'))">
            {{ t('approve') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('reject'))">
            {{ t('reject') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('sendBack'))">
            {{ t('sendBack') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('veto'))">
            {{ t('veto') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('moreReferenceSlot')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :max-visible-actions="3" :start-gap="16" more-popover-placement="top-start">
        <template #more-reference>
          <span>{{ t('customMore') }}</span>
        </template>
        <template #actions>
          <van-button plain @click="showToast(t('approve'))">
            {{ t('approve') }}
          </van-button>
          <van-button plain @click="showToast(t('reject'))">
            {{ t('reject') }}
          </van-button>
          <van-button plain @click="showToast(t('extraAction2'))">
            {{ t('extraAction2') }}
          </van-button>
          <van-button @click="showToast(t('extraAction1'))">
            {{ t('extraAction1') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('moreCustomSlot')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :start-gap="67">
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
        <template #actions>
          <van-button type="primary" disabled>
            {{ t('approve') }}
          </van-button>
          <van-button plain type="primary" disabled>
            {{ t('reject') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :start-gap="67">
        <template #top>
          <div class="demo-bottom-action-bar__selected-count van-hairline--bottom">
            {{ t('selectedCountPrefix')
            }}<span class="demo-bottom-action-bar__selected-count-strong">{{
              formattedSelectedCount
              }}</span>{{ t('selectedCountUnit')
              }}<span class="demo-bottom-action-bar__selected-amount">{{ t('selectedAmountPrefix')
            }}<span class="demo-bottom-action-bar__selected-count-strong">{{
                formattedSelectedAmount
                }}</span>{{ t('selectedAmountUnit') }}</span>
          </div>
        </template>
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
        <template #actions>
          <van-button type="primary" @click="showToast(t('approve'))">
            {{ t('approve') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('reject'))">
            {{ t('reject') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :start-gap="67">
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
        <template #actions>
          <van-button type="primary" @click="showToast(t('agree'))">
            {{ t('agree') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('veto'))">
            {{ t('veto') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('sendBack'))">
            {{ t('sendBack') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :start-gap="67">
        <template #more>
          <van-checkbox-group v-model="selectAllItems" shape="square">
            <van-checkbox name="a">{{ t('selectAllA') }}</van-checkbox>
          </van-checkbox-group>
        </template>
        <template #actions>
          <van-button type="primary" disabled>
            {{ t('agree') }}
          </van-button>
          <van-button plain type="primary" disabled>
            {{ t('veto') }}
          </van-button>
          <van-button plain type="primary" disabled>
            {{ t('sendBack') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('favoriteShare')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar :start-gap="34">
        <template #more>
          <div class="demo-bottom-action-bar__icons">
            <button type="button" class="demo-bottom-action-bar__icon-item" :class="{
              'demo-bottom-action-bar__icon-item--active': collected,
            }" @click="onToggleCollect">
              <van-icon :name="collected ? 'like' : 'like-o'" />
              <span>{{ t('collect') }}</span>
            </button>
            <button type="button" class="demo-bottom-action-bar__icon-item" @click="onShare">
              <van-icon name="share-o" />
              <span>{{ t('share') }}</span>
            </button>
          </div>
        </template>
        <template #actions>
          <van-button type="primary" @click="showToast(t('toastConfirm'))">
            {{ t('confirm') }}
          </van-button>
          <van-button plain type="primary" @click="showToast(t('secondary'))">
            {{ t('secondary') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('agreement')">
    <div class="demo-bottom-action-bar">
      <van-bottom-action-bar>
        <template #top>
          <van-checkbox-group v-model="agreedItems" shape="square"
            class="demo-bottom-action-bar__agreement-group van-hairline--bottom">
            <van-checkbox name="clause1">
              <van-highlight tag="span" :source-string="t('agreement1')" :keywords="t('agreement1Keywords')" />
            </van-checkbox>
            <van-checkbox name="clause2">
              <van-highlight tag="span" :source-string="t('agreement2')" :keywords="t('agreement2Keywords')" />
            </van-checkbox>
          </van-checkbox-group>
        </template>
        <template #actions>
          <van-button block type="primary" @click="showToast(t('toastOperate'))">
            {{ t('operate') }}
          </van-button>
        </template>
      </van-bottom-action-bar>
    </div>
  </demo-block>

  <demo-block :title="t('filterContent')">
    <div class="demo-bottom-action-bar demo-bottom-action-bar--panel">
      <section class="demo-bottom-action-bar__filter-block">
        <van-bottom-action-bar bar-padding="12px 12px">
          <template #top>
            <van-pro-form v-model="tagModel" ref="tagFormRef" class="demo-bottom-action-bar__filter-form"
              :columns="tagColumns" :show-submit="false" :style="{
                '--van-field-label-top-margin-bottom': '17px',
                '--van-field-cell-vertical-padding': '16px',
                '--van-field-cell-horizontal-padding': '12px',
              }" @submit="onTagSubmit" />
          </template>
          <template #actions>
            <van-button type="primary" @click="tagFormRef?.submit()">
              {{ t('confirm') }}
            </van-button>
            <van-button plain type="primary" @click="onTagReset">
              {{ t('reset') }}
            </van-button>
          </template>
        </van-bottom-action-bar>
      </section>

      <section class="demo-bottom-action-bar__filter-block">
        <van-bottom-action-bar bar-padding="12px 12px">
          <template #top>
            <van-pro-form v-model="dateModel" ref="dateFormRef" class="demo-bottom-action-bar__filter-form"
              :columns="dateColumns" :show-submit="false" :style="{
                '--van-field-label-top-margin-bottom': '17px',
                '--van-field-cell-vertical-padding': '16px',
                '--van-field-cell-horizontal-padding': '12px',
              }" @submit="onDateSubmit" />
          </template>
          <template #actions>
            <van-button block type="primary" @click="dateFormRef?.submit()">
              {{ t('confirm') }}
            </van-button>
          </template>
        </van-bottom-action-bar>
      </section>
    </div>
  </demo-block>

  <demo-block :title="t('textButton')">
    <div
      v-for="(demo, demoIndex) in textButtonDemos"
      :key="demoIndex"
      class="demo-bottom-action-bar"
    >
      <van-bottom-action-bar 
        :bar-padding="'13px 0'"
        :max-visible-actions="demo.maxVisibleActions" 
        :start-gap="0"
      >
        <template #more-reference>
          <van-icon name="ellipsis" style="margin: 0px 16px;"/>
        </template>
        <template #actions>
          <template
            v-for="(button, buttonIndex) in demo.buttons"
            :key="buttonIndex"
          >
            <div
              v-if="buttonIndex !== demo.buttons.length - 1"
              class="demo-bottom-action-bar__text-action van-hairline--left"
            >
              <van-button v-bind="getTextButtonProps(button.plain)">
                {{ t('confirm') }}
              </van-button>
            </div>
            <van-button
              v-else
              v-bind="getTextButtonProps(button.plain)"
            >
              {{ t('confirm') }}
            </van-button>
          </template>
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

  &__text-action {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }

  &__more-reference {
    display: inline-flex;
    align-items: center;
    gap: var(--van-padding-base);
    padding: 0;
    color: var(--van-primary-color);
    font-size: var(--van-font-size-lg);
    line-height: var(--van-line-height-sm);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: none;
    outline: none;
    appearance: none;

    .van-icon {
      font-size: var(--van-font-size-sm);
      transition: transform var(--van-duration-base);
    }

    &--expanded {
      .van-icon {
        transform: rotate(180deg);
      }
    }

    &:active {
      opacity: var(--van-active-opacity);
    }
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
