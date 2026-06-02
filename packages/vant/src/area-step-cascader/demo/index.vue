<script setup lang="ts">
import { reactive } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanField from '../../field';
import VanPopup from '../../popup';
import VanAreaStepCascader from '..';
import RegionTab from './RegionTab.vue';
import type { Numeric } from '../../utils';
import type { CascaderOption } from '../../cascader';

const t = useTranslate({
  'zh-CN': {
    area: '地区',
    selectArea: '请选择地区',
    stepLayout: '步骤条省市区',
  },
  'en-US': {
    area: 'Area',
    selectArea: 'Select Area',
    stepLayout: 'Step Area Picker',
  },
});

const state = reactive({
  show: false,
  value: '' as Numeric | undefined,
  result: '',
});

const onFinish = ({
  selectedOptions,
}: {
  value: Numeric;
  selectedOptions: CascaderOption[];
}) => {
  const texts = selectedOptions.map((item) => item.text).join('/');
  state.result = texts;
  state.show = false;
};
</script>

<template>
  <demo-block card :title="t('stepLayout')">
    <van-field
      v-model="state.result"
      is-link
      readonly
      :label="t('area')"
      :placeholder="t('selectArea')"
      @click="state.show = true"
    />
    <van-popup
      v-model:show="state.show"
      round
      teleport="body"
      position="bottom"
    >
      <van-area-step-cascader
        v-model="state.value"
        @close="state.show = false"
        @finish="onFinish"
      />
    </van-popup>
  </demo-block>

  <region-tab />
</template>
