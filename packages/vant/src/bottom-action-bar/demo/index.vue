<script setup lang="ts">
import VanBottomActionBar from '..';
import type { PopoverAction } from '../../popover';
import VanButton from '../../button';
import VanTag from '../../tag';
import VanCheckbox from '../../checkbox';
import VanCheckboxGroup from '../../checkbox-group';
import VanField from '../../field';
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
    tagSectionTitle: '标签列表-常规',
    tagOption1: '选项 1',
    tagUnselected: '未选',
    dateSectionTitle: '选择日期',
    dateWeek: '近一周',
    dateMonth: '近一月',
    dateQuarter: '近三月',
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
    tagSectionTitle: 'Tag list',
    tagOption1: 'Option 1',
    tagUnselected: 'None',
    dateSectionTitle: 'Select date',
    dateWeek: 'Last week',
    dateMonth: 'Last month',
    dateQuarter: 'Last 3 months',
    startDate: 'Start date',
    endDate: 'End date',
    toastReset: 'Reset',
    toastConfirm: 'Confirm',
    toastOperate: 'Action',
  },
});

const activeTag = ref(0);
const agreedItems = ref<string[]>([]);
const moreExpanded = ref(false);

const moreActions = computed<PopoverAction[]>(() => [
  { text: t('extraAction1'), value: 'action1' },
  { text: t('extraAction2'), value: 'action2' },
  { text: t('extraAction3'), value: 'action3' },
]);

const tagLabels = computed(() => [
  t('tagOption1'),
  t('tagUnselected'),
  t('tagUnselected'),
  t('tagUnselected'),
  t('tagUnselected'),
  t('tagUnselected'),
]);

const activeDatePreset = ref(-1);
const startDateVal = ref('');
const endDateVal = ref('');

const onMoreSelect = (action: PopoverAction) => {
  showToast(`${t('moreSelectToast')}${action.value}`);
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
        <p class="demo-bottom-action-bar__filter-title">
          {{ t('tagSectionTitle') }}
        </p>
        <van-bottom-action-bar
          :secondary-button-text="t('reset')"
          :primary-button-text="t('confirm')"
          @click-secondary="showToast(t('toastReset'))"
          @click-primary="showToast(t('toastConfirm'))"
        >
          <template #default>
            <div class="demo-bottom-action-bar__tag-grid">
              <van-tag
                v-for="(label, index) in tagLabels"
                :key="index"
                size="medium"
                :type="activeTag === index ? 'primary' : 'default'"
                :plain="activeTag === index"
                class="demo-bottom-action-bar__tag-cell"
                @click="activeTag = index"
              >
                {{ label }}
              </van-tag>
            </div>
          </template>
        </van-bottom-action-bar>
      </section>

      <section class="demo-bottom-action-bar__filter-block">
        <p class="demo-bottom-action-bar__filter-title">
          {{ t('dateSectionTitle') }}
        </p>
        <van-bottom-action-bar
          :show-secondary-button="false"
          :primary-button-text="t('confirm')"
          @click-primary="showToast(t('toastConfirm'))"
        >
          <template #default>
            <div class="demo-bottom-action-bar__date-body">
              <div class="demo-bottom-action-bar__date-presets">
                <van-tag
                  v-for="(preset, index) in [
                    t('dateWeek'),
                    t('dateMonth'),
                    t('dateQuarter'),
                  ]"
                  :key="preset"
                  class="demo-bottom-action-bar__date-preset"
                  :type="activeDatePreset === index ? 'primary' : 'default'"
                  :plain="activeDatePreset === index"
                  @click="activeDatePreset = index"
                >
                  {{ preset }}
                </van-tag>
              </div>
              <div class="demo-bottom-action-bar__date-fields">
                <van-field
                  v-model="startDateVal"
                  readonly
                  :placeholder="t('startDate')"
                  class="demo-bottom-action-bar__date-field"
                />
                <van-field
                  v-model="endDateVal"
                  readonly
                  :placeholder="t('endDate')"
                  class="demo-bottom-action-bar__date-field"
                />
              </div>
            </div>
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

  &__filter-title {
    margin: 0 0 var(--van-padding-sm);
    padding: 0 var(--van-padding-xs);
    font-size: var(--van-font-size-sm);
    line-height: 1.4;
    color: var(--van-text-color-2);
  }

  &__tag-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--van-padding-sm);
    padding: var(--van-padding-md);
    background: var(--van-white);
  }

  &__tag-cell {
    box-sizing: border-box;
    justify-content: center;
    margin: 0;
    padding: var(--van-padding-sm) var(--van-padding-xs);
    font-size: var(--van-font-size-sm);
    border-radius: var(--van-radius-md);

    &.van-tag--plain.van-tag--primary {
      color: var(--van-primary-color);
      background: var(--van-white);
      border-color: var(--van-primary-color);
    }

    &.van-tag--default:not(.van-tag--plain) {
      color: var(--van-text-color);
      background: var(--van-background-2);
      border-color: transparent;
    }
  }

  &__date-body {
    padding: var(--van-padding-md);
    background: var(--van-white);
  }

  &__date-presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--van-padding-sm);
    margin-bottom: var(--van-padding-md);
  }

  &__date-preset {
    margin: 0;
    padding: var(--van-padding-xs) var(--van-padding-sm);
    font-size: var(--van-font-size-sm);
    border-radius: var(--van-radius-md);

    &.van-tag--default:not(.van-tag--plain) {
      color: var(--van-text-color);
      background: var(--van-background-2);
      border-color: transparent;
    }

    &.van-tag--plain.van-tag--primary {
      background: var(--van-white);
      border-color: var(--van-primary-color);
    }
  }

  &__date-fields {
    display: flex;
    gap: var(--van-padding-sm);
  }

  &__date-field {
    flex: 1;
    overflow: hidden;
    background: var(--van-background-2);
    border-radius: var(--van-radius-md);

    .van-field__control {
      font-size: var(--van-font-size-sm);
    }
  }

  &__agreement-group {
    display: flex;
    flex-direction: column;
    gap: var(--van-padding-sm);
  }

  &__agreement {
    font-size: var(--van-font-size-sm);
    line-height: 1.5;
    color: var(--van-text-color-2);
  }
}
</style>
