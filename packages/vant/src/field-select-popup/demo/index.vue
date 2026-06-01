<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanCellGroup from '../../cell-group';
import VanFieldSelectPopup from '..';
import type { FieldSelectPopupOption } from '../types';

const t = useTranslate({
  'zh-CN': {
    options: [
      {
        text: '2345 1234 1234 1234 123',
        subText: '数据+标题+辅助信息',
        desc: '多选情况下辅助文字描述较多时，列举双行排版样式固定',
        value: 'a',
        disabled: true,
      },
      {
        text: '标题+重要内容+重要内容+辅助信息',
        subText: '标题内容文字占位',
        content: '内容占位',
        desc: '多选情况下辅助文字描述较多时，列举双行排版样式固定',
        value: 'b',
      },
      {
        text: '选项三内容文字过长用于演示省略号',
        value: 'c',
      },
    ] as FieldSelectPopupOption[],
    listSingle: '列表 · 单选 · 关闭',
    listSingleFull: '列表 · 单选 · 输入区完整展示',
    listMulti: '列表 · 多选 · 确定',
    gridSingle: '宫格 · 单选',
    gridMulti: '宫格 · 多选',
    placeholder: '请选择',
    popupTitle: '底部浮出层标题',
    highlightTitle: '关键词高亮',
    highlightList: '列表 · 主副文与描述',
    highlightGrid: '宫格 · 主文案',
    highlightListOptions: [
      {
        text: '北京市海淀区中关村大街 88 号',
        highlightKeywords: ['海淀', '中关村'],
        subText: '地铁4号线 · 公交枢纽旁',
        subTextHighlightKeywords: '地铁',
        content: '建筑面积 128㎡ · 三室两厅',
        contentHighlightKeywords: '128',
        desc: '近学校、医院，生活配套齐全',
        descHighlightKeywords: ['学校', '医院'],
        value: 'hl-1',
      },
      {
        text: '上海市浦东新区陆家嘴环路',
        highlightKeywords: '浦东',
        subText: '陆家嘴金融中心',
        subTextHighlightKeywords: '金融',
        content: '江景高层住宅',
        contentHighlightKeywords: '江景',
        desc: '步行可达东方明珠',
        descHighlightKeywords: '东方明珠',
        value: 'hl-2',
      },
    ] as FieldSelectPopupOption[],
    highlightGridOptions: [
      {
        text: '北京朝阳',
        highlightKeywords: '朝阳',
        value: 'hg-1',
      },
      {
        text: '上海浦东',
        highlightKeywords: '浦东',
        value: 'hg-2',
      },
      {
        text: '深圳南山',
        highlightKeywords: '南山',
        value: 'hg-3',
      },
    ] as FieldSelectPopupOption[],
  },
  'en-US': {
    options: [
      {
        text: '2345 1234 1234 1234 123',
        subText: 'Data + title + auxiliary info',
        desc: 'Auxiliary description with up to two lines in multi-select list',
        value: 'a',
        disabled: true,
      },
      {
        text: 'Title + important content + auxiliary info',
        subText: 'Title placeholder',
        content: 'Content placeholder',
        desc: 'Auxiliary description with up to two lines in multi-select list',
        value: 'b',
      },
      {
        text: 'Very long option label for ellipsis demo',
        value: 'c',
      },
    ] as FieldSelectPopupOption[],
    listSingle: 'List · single · close',
    listSingleFull: 'List · single · full label in input',
    listMulti: 'List · multi · confirm',
    gridSingle: 'Grid · single',
    gridMulti: 'Grid · multi',
    placeholder: 'Please select',
    popupTitle: 'Bottom sheet',
    highlightTitle: 'Keyword highlight',
    highlightList: 'List · title, lines & desc',
    highlightGrid: 'Grid · main text',
    highlightListOptions: [
      {
        text: '88 Zhongguancun Street, Haidian District, Beijing',
        highlightKeywords: ['Haidian', 'Zhongguancun'],
        subText: 'Metro Line 4 · Near bus hub',
        subTextHighlightKeywords: 'Metro',
        content: '128 sqm · 3 bedrooms',
        contentHighlightKeywords: '128',
        desc: 'Close to schools and hospitals',
        descHighlightKeywords: ['schools', 'hospitals'],
        value: 'hl-1',
      },
      {
        text: 'Lujiazui Ring Road, Pudong, Shanghai',
        highlightKeywords: 'Pudong',
        subText: 'Lujiazui financial center',
        subTextHighlightKeywords: 'financial',
        content: 'River-view high-rise',
        contentHighlightKeywords: 'River',
        desc: 'Walkable to the Oriental Pearl',
        descHighlightKeywords: 'Oriental Pearl',
        value: 'hl-2',
      },
    ] as FieldSelectPopupOption[],
    highlightGridOptions: [
      {
        text: 'Beijing Chaoyang',
        highlightKeywords: 'Chaoyang',
        value: 'hg-1',
      },
      {
        text: 'Shanghai Pudong',
        highlightKeywords: 'Pudong',
        value: 'hg-2',
      },
      {
        text: 'Shenzhen Nanshan',
        highlightKeywords: 'Nanshan',
        value: 'hg-3',
      },
    ] as FieldSelectPopupOption[],
  },
});

const options = computed(() => t('options') as FieldSelectPopupOption[]);
const highlightListOptions = computed(
  () => t('highlightListOptions') as FieldSelectPopupOption[],
);
const highlightGridOptions = computed(
  () => t('highlightGridOptions') as FieldSelectPopupOption[],
);

// 1) 列表单选：show / display-text 由组件内部根据 v-model、options 维护
const v1 = ref<string | number>('');
// 1b) 列表单选 + 输入区展示与选项相同的完整多行文案
const v1b = ref<string | number>('b');

// 2) 列表多选 + draft
const v2 = ref<(string | number)[]>(['a', 'b', 'c']);
const draft2 = ref<(string | number)[]>([]);
const onOpenMultiList = () => {
  draft2.value = [...v2.value];
};
const onConfirm2 = () => {
  v2.value = [...draft2.value];
};
const onCancel2 = () => {
  draft2.value = [...v2.value];
};

// 3) 宫格单选
const v3 = ref<string | number>('a');

// 4) 宫格多选
const v4 = ref<(string | number)[]>(['a', 'c']);
const draft4 = ref<(string | number)[]>([]);
const onOpenMultiGrid = () => {
  draft4.value = [...v4.value];
};
const onConfirm4 = () => {
  v4.value = [...draft4.value];
};
const onCancel4 = () => {
  draft4.value = [...v4.value];
};

// 关键词高亮：列表四行 + 宫格主文案
const vHighlightList = ref<string | number>('hl-1');
const vHighlightGrid = ref<string | number>('hg-1');
</script>

<template>
  <demo-block title="FieldSelectPopup">
    <van-cell-group inset>
      <van-field-select-popup v-model="v1" :options="options" :title="t('popupTitle')" layout="list" name="fs1"
        :label="t('listSingle')" :placeholder="t('placeholder')" />

      <van-field-select-popup v-model="v1b" :options="options" :title="t('popupTitle')" layout="list" name="fs1b"
        show-full-option-label :label="t('listSingleFull')" :placeholder="t('placeholder')" />

      <van-field-select-popup :model-value="v2" :options="options" :title="t('popupTitle')" layout="list" multiple
        :draft-value="draft2" name="fs2" :label="t('listMulti')" :placeholder="t('placeholder')"
        @click-input="onOpenMultiList" @update:model-value="v2 = $event" @update:draft-value="draft2 = $event"
        @confirm="onConfirm2" @cancel="onCancel2" />

      <van-field-select-popup v-model="v3" :options="options" :title="t('popupTitle')" layout="grid" :columns="3"
        name="fs3" :label="t('gridSingle')" :placeholder="t('placeholder')" />

      <van-field-select-popup :model-value="v4" :options="options" :title="t('popupTitle')" layout="grid" :columns="2"
        multiple :draft-value="draft4" name="fs4" :label="t('gridMulti')" :placeholder="t('placeholder')"
        @click-input="onOpenMultiGrid" @update:model-value="v4 = $event" @update:draft-value="draft4 = $event"
        @confirm="onConfirm4" @cancel="onCancel4" />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('highlightTitle')">
    <van-cell-group inset>
      <van-field-select-popup
        v-model="vHighlightList"
        :options="highlightListOptions"
        :title="t('popupTitle')"
        layout="list"
        name="fs-highlight-list"
        :label="t('highlightList')"
        :placeholder="t('placeholder')"
      />
      <van-field-select-popup
        v-model="vHighlightGrid"
        :options="highlightGridOptions"
        :title="t('popupTitle')"
        layout="grid"
        :columns="3"
        name="fs-highlight-grid"
        :label="t('highlightGrid')"
        :placeholder="t('placeholder')"
      />
    </van-cell-group>
  </demo-block>
</template>

<style lang="less">
.van-doc-demo-block__title {
  padding-top: var(--van-padding-md);
}
</style>
