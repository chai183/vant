<script setup lang="ts">
import VanCascadeTabs from '../../cascade-tabs';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import type { CascadeTabOption } from '../../cascade-tabs/types';

const t = useTranslate({
  'zh-CN': {
    tab: '标签 ',
    cascade3: '三级联动',
    cascade2: '二级联动',
    content: '内容',
    current: '当前选中',
  },
  'en-US': {
    tab: 'Tab ',
    cascade3: 'Three Levels',
    cascade2: 'Two Levels',
    content: 'content',
    current: 'Selected',
  },
});

const createThirdLevel = (prefix: string) =>
  Array.from({ length: 4 }, (_, index) => ({
    title: `${prefix} ${index + 1}`,
  }));

const createSecondLevel = (prefix: string) =>
  Array.from({ length: 5 }, (_, index) => ({
    title: `${prefix} ${index + 1}`,
    children: createThirdLevel(`${prefix} ${index + 1}`),
  }));

const options3 = ref<CascadeTabOption[]>(
  Array.from({ length: 4 }, (_, index) => ({
    title: `${t('tab')}${index + 1}`,
    children: createSecondLevel(`${t('tab')}${index + 1}`),
  })),
);

const options2 = ref<CascadeTabOption[]>(
  options3.value.map((item) => ({
    title: item.title,
    disabled: item.disabled,
    children: item.children?.map((child) => ({
      title: child.title,
      disabled: child.disabled,
    })),
  })),
);

const active3 = ref([0, 0, 0]);
const active2 = ref([0, 0]);
</script>

<template>
  <demo-block :title="t('cascade3')">
    <van-cascade-tabs v-model:active="active3" :levels="3" :options="options3">
      <template #default="{ titles }">
        <div class="demo-cascade-tabs__panel">
          {{ t('current') }}：{{ titles.join(' / ') }}
        </div>
      </template>
    </van-cascade-tabs>
  </demo-block>

  <demo-block :title="t('cascade2')">
    <van-cascade-tabs v-model:active="active2" :levels="2" :options="options2">
      <template #default="{ titles }">
        <div class="demo-cascade-tabs__panel">
          {{ t('current') }}：{{ titles.join(' / ') }}
        </div>
      </template>
    </van-cascade-tabs>
  </demo-block>
</template>

<style lang="less">
.demo-cascade-tabs {
  &__panel {
    padding: 24px 20px;
    color: var(--van-text-color-2);
    font-size: var(--van-font-size-md);
  }
}
</style>
