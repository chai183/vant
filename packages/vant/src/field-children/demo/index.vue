<script setup lang="ts">
import VanFieldChildren from '..';
import VanField from '../../field';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import type { FieldChildrenInstance } from '../types';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础用法',
    minMax: '至少 / 最多条数',
    defaultRowValue: '新增行的默认值',
    title: '可添加子选项列表标题',
    optionLabel: '选项名称',
    placeholder: '请输入',
    addText: '添加',
    defaultNewLabel: '新选项',
    defaultNewValue: '新选项',
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    minMax: 'Min / Max Rows',
    defaultRowValue: 'Default Row Value',
    title: 'List title',
    optionLabel: 'Option',
    placeholder: 'Please enter',
    addText: 'Add',
    defaultNewLabel: 'New option',
    defaultNewValue: 'New option',
  },
});

const list = ref(['', '']);
const minMaxList = ref(['', '']);
const defaultRowList = ref(['']);
const basicRef = ref<FieldChildrenInstance>();
const minMaxRef = ref<FieldChildrenInstance>();
const defaultRowRef = ref<FieldChildrenInstance>();
</script>

<template>
  <div class="demo-field-children">
    <demo-block :title="t('basicUsage')">
      <van-cell-group inset>
        <div class="demo-field-children__header">
          <span class="demo-field-children__title">{{ t('title') }}</span>
          <button
            type="button"
            class="demo-field-children__add"
            @click="basicRef?.add()"
          >
            {{ t('addText') }}
          </button>
        </div>
        <van-field-children ref="basicRef" v-model="list">
          <van-field
            :label="t('optionLabel')"
            :placeholder="t('placeholder')"
            :border="false"
          />
        </van-field-children>
      </van-cell-group>
    </demo-block>

    <demo-block :title="t('minMax')">
      <van-cell-group inset>
        <div class="demo-field-children__header">
          <span class="demo-field-children__title">{{ t('title') }}</span>
          <button
            type="button"
            class="demo-field-children__add"
            :disabled="!minMaxRef?.canAdd()"
            @click="minMaxRef?.add()"
          >
            {{ t('addText') }}
          </button>
        </div>
        <van-field-children
          ref="minMaxRef"
          v-model="minMaxList"
          :min-items="1"
          :max-items="3"
        >
          <van-field
            :label="t('optionLabel')"
            :placeholder="t('placeholder')"
            :border="false"
          />
        </van-field-children>
      </van-cell-group>
    </demo-block>

    <demo-block :title="t('defaultRowValue')">
      <van-cell-group inset>
        <div class="demo-field-children__header">
          <span class="demo-field-children__title">{{ t('title') }}</span>
          <button
            type="button"
            class="demo-field-children__add"
            @click="defaultRowRef?.add()"
          >
            {{ t('addText') }}
          </button>
        </div>
        <van-field-children
          ref="defaultRowRef"
          v-model="defaultRowList"
          :default-row-value="t('defaultNewValue')"
        >
          <van-field
            :label="t('defaultNewLabel')"
            :placeholder="t('placeholder')"
            :border="false"
          />
        </van-field-children>
      </van-cell-group>
    </demo-block>
  </div>
</template>

<style lang="less">
.demo-field-children {
  background: var(--van-background-2);

  .van-doc-demo-block__title {
    padding-top: var(--van-padding-md);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--van-padding-md) var(--van-padding-md) var(--van-padding-xs);
    gap: var(--van-padding-sm);
  }

  &__title {
    flex: 1;
    min-width: 0;
    color: var(--van-cell-text-color, var(--van-text-color));
    font-size: var(--van-cell-font-size, var(--van-font-size-md));
    line-height: var(--van-cell-line-height, 24px);
  }

  &__add {
    flex-shrink: 0;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    color: var(--van-primary-color);
    font-size: var(--van-font-size-md);
    line-height: var(--van-cell-line-height, 24px);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:disabled {
      opacity: var(--van-disabled-opacity);
      cursor: not-allowed;
    }
  }

  .van-field-children {
    padding-bottom: var(--van-padding-xs);
    background: var(--van-background-2);
  }

  .van-field-children__item .van-field {
    background: var(--van-white);
    border-radius: var(--van-radius-md);
  }
}
</style>
