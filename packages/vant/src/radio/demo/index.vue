<script setup lang="ts">
import VanRadioGroup from '../../radio-group';
import VanRadio from '..';
import VanCellGroup from '../../cell-group';
import VanCell from '../../cell';
import { computed, ref } from 'vue';
import { cdnURL, useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    radio: '单选框',
    text1: '未选中禁用',
    text2: '选中且禁用',
    withCell: '搭配单元格组件使用',
    horizontal: '水平排列',
    horizontalColumns: '水平排列列数',
    leftLabel: '左侧文本',
    customIcon: '自定义图标',
    customColor: '自定义颜色',
    customShape: '自定义形状',
    blockShape: '块状类型',
    customIconSize: '自定义大小',
    disableLabel: '禁用文本点击',
    renderOptions: '配置项渲染',
    option1: '选项 1',
    option2: '选项 2',
    option3: '选项 3',
  },
  'en-US': {
    radio: 'Radio',
    text1: 'Disabled',
    text2: 'Disabled and checked',
    withCell: 'Inside a Cell',
    horizontal: 'Horizontal',
    horizontalColumns: 'Horizontal Columns',
    leftLabel: 'Left Label',
    customIcon: 'Custom Icon',
    customColor: 'Custom Color',
    customShape: 'Custom Shape',
    blockShape: 'Block Shape',
    customIconSize: 'Custom Icon Size',
    disableLabel: 'Disable label click',
    renderOptions: 'Render Options',
    option1: 'Option 1',
    option2: 'Option 2',
    option3: 'Option 3',
  },
});

const radio1 = ref('1');
const radio2 = ref('2');
const radio3 = ref('1');
const radio4 = ref('1');
const radio5 = ref('1');
const radioLabel = ref('1');
const radioSquare = ref('1');
const radioDot = ref('1');
const radioBlock = ref('1');
const radioIconSize = ref('1');
const radioHorizontal = ref('1');
const radioLeftLabel = ref('1');
const radioOptions = ref('1');
const activeIcon = cdnURL('user-active.png');
const inactiveIcon = cdnURL('user-inactive.png');

const options = computed(() => [
  { label: t('option1'), value: '1' },
  { label: t('option2'), value: '2' },
  { label: t('option3'), value: '3', disabled: true },
]);
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-radio-group v-model="radio1" class="demo-radio-group">
      <van-radio name="1">{{ t('radio') }} 1</van-radio>
      <van-radio name="2">{{ t('radio') }} 2</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('horizontal')">
    <van-radio-group
      v-model="radioHorizontal"
      class="demo-radio-group"
      direction="horizontal"
    >
      <van-radio name="1">{{ t('radio') }} 1</van-radio>
      <van-radio name="2">{{ t('radio') }} 2</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('horizontalColumns')">
    <van-radio-group
      v-model="radioHorizontal"
      class="demo-radio-group"
      direction="horizontal"
      shape="block"
      columns="3"
    >
      <van-radio name="1">{{ t('radio') }} 1</van-radio>
      <van-radio name="2">{{ t('radio') }} 2</van-radio>
      <van-radio name="3">{{ t('radio') }} 3</van-radio>
      <van-radio name="4">{{ t('radio') }} 4</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('renderOptions')">
    <van-radio-group
      v-model="radioOptions"
      class="demo-radio-group"
      :options="options"
    />
  </demo-block>

  <demo-block :title="t('disabled')">
    <van-radio-group v-model="radio2" class="demo-radio-group" disabled>
      <van-radio name="1">{{ t('radio') }} 1</van-radio>
      <van-radio name="2">{{ t('radio') }} 2</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('customShape')">
    <van-radio-group
      v-model="radioSquare"
      class="demo-radio-group"
      shape="square"
    >
      <van-radio name="1">{{ t('radio') }} 1</van-radio>
      <van-radio name="2">{{ t('radio') }} 2</van-radio>
    </van-radio-group>
    <van-radio-group
      v-model="radioDot"
      class="demo-radio-group"
      shape="dot"
      style="margin-top: 20px"
    >
      <van-radio name="1">{{ t('radio') }} 1</van-radio>
      <van-radio name="2">{{ t('radio') }} 2</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('blockShape')">
    <van-radio-group
      v-model="radioBlock"
      class="demo-radio-block-group"
      shape="block"
      direction="horizontal"
    >
      <van-radio name="1">111</van-radio>
      <van-radio name="2">222</van-radio>
      <van-radio name="3">333</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('customColor')">
    <van-radio-group v-model="radio3" class="demo-radio-group">
      <van-radio name="1" checked-color="#ee0a24">
        {{ t('radio') }} 1
      </van-radio>
      <van-radio name="2" checked-color="#ee0a24">
        {{ t('radio') }} 2
      </van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('customIconSize')">
    <van-radio-group v-model="radioIconSize" class="demo-radio-group">
      <van-radio name="1" icon-size="24px"> {{ t('radio') }} 1 </van-radio>
      <van-radio name="2" icon-size="24px"> {{ t('radio') }} 2 </van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('customIcon')">
    <van-radio-group v-model="radio4" class="demo-radio-group">
      <van-radio name="1">
        {{ t('radio') }} 1
        <template #icon="{ checked }">
          <img :src="checked ? activeIcon : inactiveIcon" />
        </template>
      </van-radio>
      <van-radio name="2">
        {{ t('radio') }} 2
        <template #icon="{ checked }">
          <img :src="checked ? activeIcon : inactiveIcon" />
        </template>
      </van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('leftLabel')">
    <van-radio-group v-model="radioLeftLabel" class="demo-radio-group">
      <van-radio name="1" label-position="left">{{ t('radio') }} 1</van-radio>
      <van-radio name="2" label-position="left">{{ t('radio') }} 2</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('disableLabel')">
    <van-radio-group v-model="radioLabel" class="demo-radio-group">
      <van-radio name="1" label-disabled>{{ t('radio') }} 1</van-radio>
      <van-radio name="2" label-disabled>{{ t('radio') }} 2</van-radio>
    </van-radio-group>
  </demo-block>

  <demo-block :title="t('withCell')">
    <van-radio-group v-model="radio5">
      <van-cell-group inset>
        <van-cell clickable :title="t('radio') + 1" @click="radio5 = '1'">
          <template #right-icon>
            <van-radio name="1" />
          </template>
        </van-cell>
        <van-cell clickable :title="t('radio') + 2" @click="radio5 = '2'">
          <template #right-icon>
            <van-radio name="2" />
          </template>
        </van-cell>
      </van-cell-group>
    </van-radio-group>
  </demo-block>
</template>

<style lang="less">
.demo-radio {
  &-group {
    padding: 0 16px;

    .van-radio {
      margin-bottom: 8px;
    }
  }

  img {
    height: 20px;
  }

  &-block-group {
    padding: 0 16px;

    .van-radio {
      margin-bottom: 0;
    }
  }

  .van-doc-demo-block__title {
    margin-top: -8px;
  }
}
</style>
