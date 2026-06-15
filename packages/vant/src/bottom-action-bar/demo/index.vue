<script setup lang="ts">
import VanBottomActionBar from '..';
import type { PopoverAction } from '../../popover';
import VanButton from '../../button';
import VanCheckbox from '../../checkbox';
import VanCheckboxGroup from '../../checkbox-group';
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
    agreement: '协议提示 + 操作',
    filterContent: '下拉筛选 + 主次按钮',
    reset: '重置',
    confirm: '确定',
    secondary: '次要操作',
    tertiary: '次要操作2',
    operate: '操作',
    more: '更多操作',
    moreIconLeft: '图标在左',
    extraAction1: '选项一',
    extraAction2: '选项二',
    extraAction3: '选项三',
    moreSelectToast: '选中：',
    agreement1: '本人已仔细阅读并同意以上所有条款',
    agreement2: '并同意《宁波银行APP隐私协议》',
    tagOption1: '选项 1',
    tagUnselected: '未选',
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
    agreement: 'Agreement + action',
    filterContent: 'Dropdown filter + buttons',
    reset: 'Reset',
    confirm: 'Confirm',
    secondary: 'Secondary',
    tertiary: 'Secondary 2',
    operate: 'Action',
    more: 'More',
    moreIconLeft: 'Icon on left',
    extraAction1: 'Option 1',
    extraAction2: 'Option 2',
    extraAction3: 'Option 3',
    moreSelectToast: 'Selected: ',
    agreement1: 'I have read and agree to the terms above.',
    agreement2: 'I agree to the Privacy Policy.',
    tagOption1: 'Option 1',
    tagUnselected: 'None',
    startDate: 'Start date',
    endDate: 'End date',
    toastReset: 'Reset',
    toastConfirm: 'Confirm',
    toastOperate: 'Action',
  },
});

const agreedItems = ref<string[]>([]);
const moreExpanded = ref(false);

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
            class="demo-bottom-action-bar__agreement-group"
          >
            <van-checkbox name="clause1">
              <span class="demo-bottom-action-bar__agreement">
                {{ t('agreement1') }}
              </span>
            </van-checkbox>
            <van-checkbox name="clause2">
              <span class="demo-bottom-action-bar__agreement">
                {{ t('agreement2') }}
              </span>
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
        >
          <template #top>
            <van-pro-form
              v-model="tagModel"
              ref="tagFormRef"
              :columns="tagColumns"
              :show-submit="false"
              @submit="onTagSubmit"
            />
          </template>
        </van-bottom-action-bar>
      </section>

      <section class="demo-bottom-action-bar__filter-block">
        <van-bottom-action-bar
          :show-secondary-button="false"
          :primary-button-text="t('confirm')"
          @click-primary="dateFormRef?.submit()"
        >
          <template #top>
            <van-pro-form
              v-model="dateModel"
              ref="dateFormRef"
              :columns="dateColumns"
              :show-submit="false"
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

  &__agreement-group {
    display: flex;
    flex-direction: column;
    gap: var(--van-padding-sm);
    padding: 12px;
    border-bottom: 1px solid #eeeeee;
  }

  &__agreement {
    font-size: var(--van-font-size-sm);
    line-height: 1.5;
    color: var(--van-text-color-2);
  }
}
</style>
