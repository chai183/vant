<script setup lang="ts">
import VanRangeInput from '..';
import VanField from '../../field';
import VanCellGroup from '../../cell-group';
import { h, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import FieldTypeDatePicker from './FieldTypeDatePicker.vue';

const t = useTranslate({
  'zh-CN': {
    vertical: '上下布局',
    horizontal: '左右布局',
    startEndSlots: 'start / end 插槽',
    startEndProps: 'start / end 属性',
    placeholder: '请输入',
    startPlaceholder: '请输入起始',
    endPlaceholder: '请输入结束',
    longUnit: '文字较长单位',
    unit: '单位',
    dateShortcuts: '日期快捷选择',
    partialDateShortcuts: '部分日期快捷选择',
  },
  'en-US': {
    vertical: 'Vertical layout',
    horizontal: 'Horizontal layout',
    startEndSlots: 'start / end slots',
    startEndProps: 'start / end props',
    placeholder: 'Please enter',
    startPlaceholder: 'Start',
    endPlaceholder: 'End',
    longUnit: 'Longer unit text',
    unit: 'Unit',
    dateShortcuts: 'Date shortcuts',
    partialDateShortcuts: 'Partial date shortcuts',
  },
});

const rangeV = ref<string[]>(['', '']);
const rangeH = ref<string[]>(['', '']);
const rangeSlots = ref<string[]>(['', '']);
const rangeProps = ref<string[]>(['', '']);
const rangeDateShortcuts = ref<string[]>(['', '']);
const rangePartialDateShortcuts = ref<string[]>(['', '']);

const renderStart = () =>
  h(VanField, {
    inputBorder: true,
    placeholder: t('startPlaceholder'),
  });

const renderEnd = () =>
  h(VanField, {
    inputBorder: true,
    placeholder: t('endPlaceholder'),
  });
</script>

<template>
  <div class="demo-range-input">
    <demo-block :title="t('vertical')">
      <van-cell-group inset>
        <van-range-input v-model="rangeV" layout="vertical">
          <van-field input-border :placeholder="t('placeholder')">
            <template #button>
              <span class="demo-range-input__unit">{{ t('longUnit') }}</span>
            </template>
          </van-field>
          <van-field input-border :placeholder="t('placeholder')">
            <template #button>
              <span class="demo-range-input__unit">{{ t('longUnit') }}</span>
            </template>
          </van-field>
        </van-range-input>
      </van-cell-group>
    </demo-block>

    <demo-block :title="t('horizontal')">
      <van-cell-group inset>
        <van-range-input v-model="rangeH" layout="horizontal">
          <van-field input-border :placeholder="t('placeholder')">
            <template #button>
              <span class="demo-range-input__unit">{{ t('unit') }}</span>
            </template>
          </van-field>
          <van-field input-border :placeholder="t('placeholder')">
            <template #button>
              <span class="demo-range-input__unit">{{ t('unit') }}</span>
            </template>
          </van-field>
        </van-range-input>
      </van-cell-group>
    </demo-block>

    <demo-block :title="t('startEndSlots')">
      <van-cell-group inset>
        <van-range-input v-model="rangeSlots" layout="vertical">
          <template #start>
            <van-field input-border :placeholder="t('startPlaceholder')" />
          </template>
          <template #end>
            <van-field input-border :placeholder="t('endPlaceholder')" />
          </template>
        </van-range-input>
      </van-cell-group>
    </demo-block>

    <demo-block :title="t('startEndProps')">
      <van-cell-group inset>
        <van-range-input
          v-model="rangeProps"
          layout="horizontal"
          :start="renderStart"
          :end="renderEnd"
        />
      </van-cell-group>
    </demo-block>

    <demo-block :title="t('dateShortcuts')">
      <van-cell-group inset>
        <van-range-input
          v-model="rangeDateShortcuts"
          layout="vertical"
          show-date-shortcuts
        >
          <template #start>
            <FieldTypeDatePicker />
          </template>
          <template #end>
            <FieldTypeDatePicker />
          </template>
        </van-range-input>
      </van-cell-group>
    </demo-block>

    <demo-block :title="t('partialDateShortcuts')">
      <van-cell-group inset>
        <van-range-input
          v-model="rangePartialDateShortcuts"
          layout="vertical"
          :show-date-shortcuts="['lastWeek', 'lastMonth']"
        >
          <template #start>
            <FieldTypeDatePicker />
          </template>
          <template #end>
            <FieldTypeDatePicker />
          </template>
        </van-range-input>
      </van-cell-group>
    </demo-block>
  </div>
</template>

<style lang="less">
.demo-range-input {
  background: var(--van-background-2);

  .van-doc-demo-block__title {
    padding-top: var(--van-padding-md);
  }

  &__unit {
    margin-left: var(--van-padding-xs);
    color: var(--van-text-color-2);
    font-size: var(--van-font-size-sm);
    white-space: nowrap;
  }
}
</style>
