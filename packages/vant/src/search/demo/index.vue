<script setup lang="ts">
import VanSearch from '..';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    label: '地址',
    disabled: '禁用搜索框',
    inputAlign: '搜索框内容对齐',
    background: '自定义背景色',
    placeholder: '请输入搜索关键词',
    customButton: '自定义按钮',
    listenToEvents: '事件监听',
    sceneSearchPage: '搜索页模态',
    sceneFilterBar: '筛选栏（搜索）',
    sceneFilterInner: '筛选内（极简）',
    cancel: '取消',
  },
  'en-US': {
    label: 'Address',
    disabled: 'Disabled',
    inputAlign: 'Input Align',
    background: 'Custom Background Color',
    placeholder: 'Placeholder',
    customButton: 'Custom Action Button',
    listenToEvents: 'Listen to Events',
    sceneSearchPage: 'Search page',
    sceneFilterBar: 'Filter bar (Search)',
    sceneFilterInner: 'Filter inner (Minimal)',
    cancel: 'Cancel',
  },
});

const value1 = ref('');
const value2 = ref('');
const value3 = ref('');
const value4 = ref('');
const value5 = ref('');
const value6 = ref('');
const value7 = ref('');
const value8 = ref('');
const value9 = ref('');

const onSearch = (val: string) => showToast(val);
const onCancel = () => showToast(t('cancel'));
const onClickButton = () => showToast(value6.value);
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-search v-model="value1" :placeholder="t('placeholder')" />
  </demo-block>

  <demo-block :title="t('sceneSearchPage')">
    <van-search
      v-model="value7"
      scene="search-page"
      :placeholder="t('placeholder')"
      @search="onSearch"
      @cancel="onCancel"
    />
  </demo-block>

  <demo-block :title="t('sceneFilterBar')">
    <!-- <form action="/"> -->
    <van-search
      v-model="value8"
      scene="filter-bar"
      :placeholder="t('placeholder')"
      @search="onSearch"
    />
    <!-- </form> -->
  </demo-block>

  <demo-block class="demo-search__filter-inner" :title="t('sceneFilterInner')">
    <van-search
      v-model="value9"
      scene="filter-inner"
      :placeholder="t('placeholder')"
      @search="onSearch"
    />
  </demo-block>

  <demo-block :title="t('listenToEvents')">
    <form action="/">
      <van-search
        v-model="value5"
        :placeholder="t('placeholder')"
        show-action
        @search="onSearch"
        @cancel="onCancel"
      />
    </form>
  </demo-block>

  <demo-block :title="t('inputAlign')">
    <van-search
      v-model="value4"
      :placeholder="t('placeholder')"
      input-align="center"
    />
  </demo-block>

  <demo-block :title="t('disabled')">
    <van-search v-model="value3" :placeholder="t('placeholder')" disabled />
  </demo-block>

  <demo-block :title="t('background')">
    <van-search
      v-model="value2"
      :placeholder="t('placeholder')"
      shape="round"
      background="#4fc08d"
    />
  </demo-block>

  <demo-block :title="t('customButton')">
    <van-search
      v-model="value6"
      show-action
      :label="t('label')"
      :placeholder="t('placeholder')"
      @search="onSearch"
    >
      <template #action>
        <div @click="onClickButton">{{ t('search') }}</div>
      </template>
    </van-search>
  </demo-block>
</template>

<style lang="less">
.demo-search__filter-inner {
  background: #f5f5f5;

  .van-search {
    background: #f5f5f5;
  }
}
</style>
