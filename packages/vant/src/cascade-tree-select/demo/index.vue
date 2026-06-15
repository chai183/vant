<script setup lang="ts">
import VanCascadeTreeSelect, {
  type CascadeTreeSelectOption,
  type CascadeTreeSelectEventParams,
} from '..';
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础使用',
    singleColumn: '单列单选',
    singleCascade: '单选双列',
    selectLeafOnly: '父级可选',
    multipleColumn: '多选单列',
    multipleCascade: '多选双列',
    customContent: '右侧自定义内容',
    navTextSlot: '自定义选项文本',
    eventUsage: '事件监听',
    disabled: '禁用状态',
    current: '当前展开：',
    selected: '已选：',
    customTag: '自定义',
    latestEvent: '最近触发：',
    empty: '暂无',
    basicItems: [
      { text: '全部', value: 'all' },
      { text: '待处理', value: 'pending', dot: true },
      { text: '已完成', value: 'finished' },
    ],
    singleItems: [
      { text: '全部订单选择项目', value: 'all' },
      { text: '待处理订单选择项', value: 'pending', dot: true, badge: 100 },
      { text: '已完成订单选择项', value: 'finished' },
    ],
    cascadeItems: [
      {
        text: '食品分类项目',
        value: 'food',
        children: [
          { text: '苹果选择项目', value: 'apple', dot: true, badge: 100 },
          { text: '香蕉选择项目', value: 'banana' },
          { text: '咖啡选择项目', value: 'coffee' },
          { text: '茶饮选择项目', value: 'tea', disabled: true },
        ],
      },
      {
        text: '数码分类项目',
        value: 'digital',
        children: [
          { text: '手机选择项目', value: 'phone' },
          { text: '电脑选择项目', value: 'computer' },
        ],
      },
    ],
    disabledItems: [
      {
        text: '外层禁用项目',
        value: 'disabled-parent',
        disabled: true,
        children: [{ text: '子级选择项目', value: 'child' }],
      },
      {
        text: '内层禁用项目',
        value: 'inner',
        children: [
          { text: '可用选择项目', value: 'enabled-child' },
          { text: '禁用选择项目', value: 'disabled-child', disabled: true },
        ],
      },
    ],
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    singleColumn: 'Single Column',
    singleCascade: 'Single Cascade',
    selectLeafOnly: 'Parent Selectable',
    multipleColumn: 'Multiple Column',
    multipleCascade: 'Multiple Cascade',
    customContent: 'Custom Content',
    navTextSlot: 'Custom Option Text',
    eventUsage: 'Events',
    disabled: 'Disabled',
    current: 'Current: ',
    selected: 'Selected: ',
    customTag: 'Custom',
    latestEvent: 'Latest event: ',
    empty: 'None',
    basicItems: [
      { text: 'All', value: 'all' },
      { text: 'Pending', value: 'pending', dot: true },
      { text: 'Finished', value: 'finished' },
    ],
    singleItems: [
      { text: 'AllItems', value: 'all' },
      { text: 'PendingX', value: 'pending', dot: true, badge: 100 },
      { text: 'Finished', value: 'finished' },
    ],
    cascadeItems: [
      {
        text: 'FoodAA',
        value: 'food',
        children: [
          { text: 'AppleA', value: 'apple', dot: true, badge: 4 },
          { text: 'Banana', value: 'banana' },
          { text: 'Coffee', value: 'coffee' },
          { text: 'TeaDis', value: 'tea', disabled: true },
        ],
      },
      {
        text: 'DigitA',
        value: 'digital',
        children: [
          { text: 'PhoneA', value: 'phone' },
          { text: 'CompPC', value: 'computer' },
        ],
      },
    ],
    disabledItems: [
      {
        text: 'DisPar',
        value: 'disabled-parent',
        disabled: true,
        children: [{ text: 'ChildA', value: 'child' }],
      },
      {
        text: 'InnerA',
        value: 'inner',
        children: [
          { text: 'Enable', value: 'enabled-child' },
          { text: 'DisSub', value: 'disabled-child', disabled: true },
        ],
      },
    ],
  },
});

const basicValue = ref('pending');
const singleValue = ref('pending');
const cascadeValue = ref('apple');
const parentSelectableValue = ref('food');

// expand-path 只控制外层展开项；点击第二列子项时不会被改成子项 value。
const cascadeExpandPath = ref(['food']);
const parentSelectableExpandPath = ref(['food']);
const multipleValue = ref(['pending', 'finished']);
const multipleCascadeValue = ref(['apple', 'banana']);
// 双列多选同样只需要记录第一列当前展开项。
const multipleCascadeExpandPath = ref(['food']);
// content 插槽里的 selectedItems 来自 v-model，expandOptions 来自 expand-path。
const customValue = ref('apple');
const customExpandPath = ref(['food']);
const navTextValue = ref('pending');
const eventValue = ref('apple');
const eventExpandPath = ref(['food']);
const latestEvent = ref('');
const disabledExpandPath = ref(['inner']);
const disabledValue = ref('enabled-child');

const basicItems = computed(() => t('basicItems') as CascadeTreeSelectOption[]);
const singleItems = computed(
  () => t('singleItems') as CascadeTreeSelectOption[],
);
const cascadeItems = computed(
  () => t('cascadeItems') as CascadeTreeSelectOption[],
);
const disabledItems = computed(
  () => t('disabledItems') as CascadeTreeSelectOption[],
);

const formatOptions = (options: CascadeTreeSelectOption[]) =>
  options.map((option) => option.text).join(', ') || t('empty');

const logEvent = (eventName: string, params: CascadeTreeSelectEventParams) => {
  console.log(`[CascadeTreeSelect ${eventName}]`, params);
};

const onEvent = (eventName: string, params: CascadeTreeSelectEventParams) => {
  const currentText = params.currentItem.text || String(params.selectedValue);
  const message = `${eventName}: ${currentText}`;

  latestEvent.value = message;
  showToast(message);
  logEvent(eventName, params);
};
</script>

<template>
  <!-- 基础使用：单列单选，有 dot，标签长度保持常规 -->
  <demo-block :title="t('basicUsage')">
    <van-cascade-tree-select v-model="basicValue" :items="basicItems" />
  </demo-block>
  <!-- 单列单选：保留极限标签长度展示 -->
  <demo-block :title="t('singleColumn')">
    <van-cascade-tree-select v-model="singleValue" :items="singleItems" />
  </demo-block>
  <!-- 双列单选 -->
  <demo-block :title="t('singleCascade')">
    <van-cascade-tree-select
      v-model="cascadeValue"
      v-model:expand-path="cascadeExpandPath"
      :items="cascadeItems"
    />
  </demo-block>
  <!-- 父级可选：关闭 select-leaf-only 后，点击父级会同时展开并写入 v-model -->
  <demo-block :title="t('selectLeafOnly')">
    <van-cascade-tree-select
      v-model="parentSelectableValue"
      v-model:expand-path="parentSelectableExpandPath"
      :items="cascadeItems"
      :select-leaf-only="false"
    />
  </demo-block>
  <!-- 多列单选 -->
  <demo-block :title="t('multipleColumn')">
    <van-cascade-tree-select
      v-model="multipleValue"
      :items="singleItems"
      multiple
    />
  </demo-block>
  <!-- 多选双列：默认开启 select-leaf-only，一级只负责展开，二级叶子才会写入 v-model -->
  <demo-block :title="t('multipleCascade')">
    <van-cascade-tree-select
      v-model="multipleCascadeValue"
      v-model:expand-path="multipleCascadeExpandPath"
      :items="cascadeItems"
      :select-leaf-only="false"
      multiple
    />
  </demo-block>
  <!-- 自定义内容 -->
  <demo-block :title="t('customContent')">
    <van-cascade-tree-select
      v-model="customValue"
      v-model:expand-path="customExpandPath"
      :items="cascadeItems"
      height="55vw"
    >
      <template #content="{ expandOptions, selectedItems }">
        <div class="demo-cascade-tree-select-content">
          <p>
            {{ t('current')
            }}{{ expandOptions[expandOptions.length - 1]?.text || t('empty') }}
          </p>
          <p>{{ t('selected') }}{{ formatOptions(selectedItems) }}</p>
        </div>
      </template>
    </van-cascade-tree-select>
  </demo-block>

  <!-- nav-text 插槽：只自定义左侧选项文本区域，不影响徽标、橙点和点击逻辑 -->
  <demo-block :title="t('navTextSlot')">
    <van-cascade-tree-select v-model="navTextValue" :items="basicItems">
      <template #nav-text="item">
        <span class="demo-cascade-tree-select-nav-text">
          {{ item.text }}
          <span class="demo-cascade-tree-select-tag">
            {{ t('customTag') }}123
          </span>
        </span>
      </template>
    </van-cascade-tree-select>
  </demo-block>

  <!-- 事件监听：外层列触发 click-nav，内层列触发 click-item，选中值变化触发 change -->
  <demo-block :title="t('eventUsage')">
    <van-cascade-tree-select
      v-model="eventValue"
      v-model:expand-path="eventExpandPath"
      :items="cascadeItems"
      @change="onEvent('change', $event)"
      @click-nav="onEvent('click-nav', $event)"
      @click-item="onEvent('click-item', $event)"
    />
    <div class="demo-cascade-tree-select-event">
      {{ t('latestEvent') }}{{ latestEvent || t('empty') }}
    </div>
  </demo-block>

  <demo-block :title="t('disabled')">
    <van-cascade-tree-select
      v-model="disabledValue"
      v-model:expand-path="disabledExpandPath"
      :items="disabledItems"
    />
  </demo-block>
</template>

<style lang="less">
.demo-cascade-tree-select-content {
  padding: var(--van-padding-md);
  color: var(--van-text-color);
  font-size: var(--van-font-size-md);
  line-height: var(--van-line-height-lg);

  p {
    margin: 0 0 var(--van-padding-sm);
  }
}

.demo-cascade-tree-select-nav-text {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.demo-cascade-tree-select-tag {
  flex: none;
  margin-left: 4px;
  color: var(--van-primary-color);
  font-size: 10px;
}

.demo-cascade-tree-select-event {
  padding: var(--van-padding-sm) var(--van-padding-md);
  color: var(--van-text-color-2);
  font-size: var(--van-font-size-sm);
  background: var(--van-background-2);
}
</style>
