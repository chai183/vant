# CascadeTreeSelect 级联分类选择

### 介绍

`CascadeTreeSelect` 是一个支持单列、双列级联、单选、多选和右侧自定义内容的分类选择组件，布局参考 `TreeSelect`。

### 引入

```js
import { createApp } from 'vue';
import { CascadeTreeSelect } from 'vant';

const app = createApp();
app.use(CascadeTreeSelect);
```

## 代码演示

### 基础使用

```html
<van-cascade-tree-select v-model="basicValue" :items="basicItems" />
```

```js
import { ref } from 'vue';

const basicValue = ref('pending');
const basicItems = [
  { text: '全部', value: 'all' },
  { text: '待处理', value: 'pending', dot: true },
  { text: '已完成', value: 'finished' },
];
```

### 单列单选

```html
<van-cascade-tree-select v-model="singleValue" :items="singleItems" />
```

```js
const singleValue = ref('pending');
const singleItems = [
  { text: '全部订单选择项目', value: 'all' },
  { text: '待处理订单选择项', value: 'pending' },
  { text: '已完成订单选择项', value: 'finished' },
];
```

### 单选双列

通过 `expand-path` 控制双列外层展开路径

```html
<van-cascade-tree-select
  v-model="signleValue"
  v-model:expand-path="singleExpandPath"
  :items="singleItems2"
/>
```

```js
const signleValue = ref('apple');
const singleExpandPath = ref(['food']);
const singleItems2 = [
  {
    text: '食品分类项目',
    value: 'food',
    children: [
      { text: '苹果选择项目', value: 'apple' },
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
];
```

### 多选单列

设置 `multiple` 后开启多选，示例复用单选单列数据。

```html
<van-cascade-tree-select
  v-model="multipleValue"
  :items="singleItems"
  multiple
/>
```

```js
const multipleValue = ref(['pending', 'finished']);
const singleItems = [
  { text: '全部订单选择项目', value: 'all' },
  { text: '待处理订单选择项', value: 'pending' },
  { text: '已完成订单选择项', value: 'finished' },
];
```

### 多选双列

```html
<van-cascade-tree-select
  v-model="multipleCascadeValue"
  v-model:expand-path="multipleCascadeExpandPath"
  :items="cascadeItems"
  multiple
/>
```

```js
const multipleCascadeValue = ref(['apple', 'banana', 'phone']);
const multipleCascadeExpandPath = ref(['food']);
const cascadeItems = [
  {
    text: '食品分类项目',
    value: 'food',
    children: [
      { text: '苹果', value: 'apple', badge: 2 },
      { text: '香蕉选择项目', value: 'banana', badge: 100 },
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
];
```

<!-- ### 父级可选

通过配置`select-leaf-only`是否只能点击叶子节点,可实现父级可选

此值默认为`true`,父级节点只做展开,需要父级点击时,设置为`false`

```html
<van-cascade-tree-select
  v-model="parentSelectableValue"
  v-model:expand-path="parentSelectExpandPath"
  :items="cascadeItems"
  :select-leaf-only="false"
/>
```

```js
const parentSelectableValue = ref("food");
const parentSelectExpandPath = ref(["food"]);
const cascadeItems = [
  {
    text: "食品分类项目",
    value: "food",
    children: [
      { text: "苹果选择项目", value: "apple" },
      { text: "香蕉选择项目", value: "banana" },
      { text: "咖啡选择项目", value: "coffee" },
      { text: "茶饮选择项目", value: "tea", disabled: true },
    ],
  },
  {
    text: "数码分类项目",
    value: "digital",
    children: [
      { text: "手机选择项目", value: "phone" },
      { text: "电脑选择项目", value: "computer" },
    ],
  },
];
``` -->

### 事件监听

`click-nav`外侧选项点击,[参数](#/zh-CN/cascade-tree-select#cascadetreeselecteventparams-shu-ju-jie-gou)

`click-item` 内测选项点击

`change` 选择值切换

```html
<van-cascade-tree-select
  v-model="eventValue"
  v-model:expand-path="eventExpandPath"
  :items="cascadeItems"
  @change="onEvent('change',$event)"
  @click-nav="onEvent('click-nav',$event)"
  @click-item="onEvent('click-item',$event)"
/>
```

```js
import {showToast} from '../../toast'
const eventValue = ref('apple')
const eventExpandPath = ref(['food'])
const cascadeItems = [
  {
    text: "食品分类项目",
    value: "food",
    children: [
      { text: "苹果选择项目", value: "apple", dot: true, badge: 2 },
      { text: "香蕉选择项目", value: "banana" },
      { text: "咖啡选择项目", value: "coffee" },
      { text: "茶饮选择项目", value: "tea", disabled: true },
    ],
  },
  {
    text: "数码分类项目",
    value: "digital",
    children: [
      { text: "手机选择项目", value: "phone" },
      { text: "电脑选择项目", value: "computer" },
    ],
  },
];
const logEvent = (eventName: string, params: CascadeTreeSelectEventParams) => {
  console.log(`[CascadeTreeSelect ${eventName}]`, params);
};
const onEvent = (eventName:string,params:CascadeTreeSelectEventParams) => {
  const currentText = params.currentItem.text || String(params.currentItem.value)
  const message = `${eventName}: ${currentText}`
  showToast(message)
  logEvent(eventName,params)
}
```

### 右侧自定义内容

通过 `content` 插槽可以展示右侧自定义内容，示例与 demo 一致，会展示当前展开项和已选项。

需要注意：`expandOptions` 来自 `expand-path`，表示当前外层展开路径；`selectedItems` 来自 `v-model`，表示当前选中值命中的选项。如果只绑定 `expand-path`，没有绑定 `v-model`，则 `selectedItems` 会是空数组。

```html
<van-cascade-tree-select
  v-model="customValue"
  v-model:expand-path="customExpandPath"
  :items="cascadeItems"
  height="55vw"
>
  <template #content="{ expandOptions, selectedItems }">
    <div class="demo-cascade-tree-select-content">
      <p>
        当前展开：{{ expandOptions[expandOptions.length - 1]?.text || '暂无' }}
      </p>
      <p>已选：{{ formatOptions(selectedItems) }}</p>
    </div>
  </template>
</van-cascade-tree-select>
```

```js
const customValue = ref('apple');
const customExpandPath = ref(['food']);
const cascadeItems = [
  {
    text: '食品分类项目',
    value: 'food',
    children: [
      { text: '苹果选择项目', value: 'apple', badge: 2 },
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
];
const formatOptions = (options) =>
  options.map((option) => option.text).join(', ') || '暂无';
```

### 禁用状态

选项支持 `disabled`，双列场景下外层和内层选项都可以禁用。

```html
<van-cascade-tree-select
  v-model="disabledValue"
  v-model:expand-path="disabledExpandPath"
  :items="disabledItems"
/>
```

```js
const disabledValue = ref('enabled-child');
const disabledExpandPath = ref(['inner']);
const disabledItems = [
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
];
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 当前选中值，单选为 `number \| string`，多选为数组 | _number \| string \| Array_ | - |
| v-model:expand-path | 当前级联外层展开路径，点击内层叶子项不会写入叶子项 | _(number \| string)[]_ | `[]` |
| items | 分类显示所需的数据 | _CascadeTreeSelectOption[]_ | `[]` |
| height | 组件高度 | _number \| string_ | `300` |
| multiple | 是否开启多选 | _boolean_ | `false` |
| show-badge | 是否展示圆点和弱徽标 | _boolean_ | `true` |
| active-color | 选中状态颜色 | _string_ | - |
| field-names | 自定义 `items` 结构中的字段 | _CascadeTreeSelectFieldNames_ | 见下方表格 |

<!-- | select-leaf-only    | 是否仅叶子节点可选中                               | _boolean_                     | `true`     | -->

### CascadeTreeSelectOption 选项结构

| 键名 | 说明 | 类型 |
| --- | --- | --- |
| text | 选项文字 | _string_ |
| value | 选项唯一标识 | _number \| string_ |
| children | 子选项列表 | _CascadeTreeSelectOption[]_ |
| disabled | 是否禁用选项 | _boolean_ |
| dot | 是否配置主题色圆点，当前页面存在已选项时展示 | _boolean_ |
| badge | 配置弱徽标内容，多选且当前页面存在已选项时展示，超过 `99` 显示 `99+` | _number \| string_ |
| color | 自定义文字颜色 | _string_ |
| className | 自定义选项类名 | _unknown_ |

### FieldNames 自定义结构

```js
{
  text: 'text',
  value: 'value',
  children: 'children',
  disabled: 'disabled',
  dot: 'dot',
  badge: 'badge',
  className: 'className',
}
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 选中值变化时触发 | _CascadeTreeSelectEventParams_ |
| click-item | 点击最内层列的可用选项时触发 | _CascadeTreeSelectEventParams_ |
| click-nav | 点击外层列的可用选项时触发，单列模式点击选项时也会触发 | _CascadeTreeSelectEventParams_ |

### CascadeTreeSelectEventParams 数据结构

| 键名          | 说明                     | 类型                        |
| ------------- | ------------------------ | --------------------------- |
| selectedValue | 当前选中值               | _number \| string \| Array_ |
| currentItem   | 当前点击的选项           | _CascadeTreeSelectOption_   |
| columnIndex   | 当前点击项所在列索引     | _number_                    |
| fullPathItems | 当前点击项所在完整路径   | _CascadeTreeSelectOption[]_ |
| selectedItems | 当前已选项               | _CascadeTreeSelectOption[]_ |
| expandPath    | 当前外层展开路径         | _(number \| string)[]_      |
| isLeaf        | 当前点击项是否为叶子节点 | _boolean_                   |

### Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| nav-text | 自定义左侧选项文本，兼容 `TreeSelect` 命名 | _option_ |
| content | 自定义右侧内容 | _{ columns, expandPath, expandOptions, selectedValues, selectedItems }_ |

> `content` 插槽中，`expandOptions` 是根据 `expand-path` 反查出的完整外层展开路径；`selectedItems` 是根据 `v-model` 反查出的已选项，不等同于当前展开路径。

### 类型定义

组件导出以下类型定义：

```ts
import type {
  CascadeTreeSelectProps,
  CascadeTreeSelectOption,
  CascadeTreeSelectFieldNames,
  CascadeTreeSelectEventParams,
} from 'vant';
```

### 主题定制

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-cascade-tree-select-font-size | _14px_ | - |
| --van-cascade-tree-select-text-color | _#333_ | - |
| --van-cascade-tree-select-active-color | _var(--van-primary-orange)_ | - |
| --van-cascade-tree-select-disabled-color | _#ddd_ | - |
| --van-cascade-tree-select-active-background | _#fff_ | - |
| --van-cascade-tree-select-item-background | _#f5f5f5_ | 未选中项背景色 |
| --van-cascade-tree-select-selected-background | _#fff_ | 选中项背景色 |
| --van-cascade-tree-select-outer-active-background | _#fafafa_ | 双列外层当前展开项背景色 |
| --van-cascade-tree-select-nav-background | _#f5f5f5_ | - |
| --van-cascade-tree-select-column-background | _#f5f5f5_ | - |
| --van-cascade-tree-select-content-background | _#fff_ | - |
| --van-cascade-tree-select-single-column-width | _136px_ | 单选单列宽度 |
| --van-cascade-tree-select-double-column-width | _108px_ | 单选双列宽度 |
| --van-cascade-tree-select-multiple-single-column-width | _148px_ | 多选单列且配置弱徽标时的宽度 |
| --van-cascade-tree-select-multiple-double-outer-column-width | _108px_ | 多选双列一级宽度 |
| --van-cascade-tree-select-multiple-double-inner-column-width | _118px_ | 多选双列二级宽度 |
| --van-cascade-tree-select-item-height | _48px_ | - |
| --van-cascade-tree-select-item-padding-left | _8px_ | - |
| --van-cascade-tree-select-item-padding-right | _8px_ | - |
| --van-cascade-tree-select-item-padding | _0 var(--van-cascade-tree-select-item-padding-right) 0 var(--van-cascade-tree-select-item-padding-left)_ | - |
| --van-cascade-tree-select-selected-border-width | _2px_ | - |
| --van-cascade-tree-select-selected-border-height | _16px_ | - |
| --van-cascade-tree-select-selected-border-color | _var(--van-cascade-tree-select-active-color)_ | - |
| --van-cascade-tree-select-dot-size | _6px_ | - |
| --van-cascade-tree-select-dot-color | _var(--van-primary-orange)_ | - |
| --van-cascade-tree-select-badge-gap | _4px_ | 数字徽标与文本的间距 |
| --van-cascade-tree-select-badge-color | _#666_ | - |
| --van-cascade-tree-select-badge-background | _#ddd_ | - |
| --van-cascade-tree-select-badge-font-size | _10px_ | - |
| --van-cascade-tree-select-badge-height | _14px_ | - |
| --van-cascade-tree-select-badge-padding | _0 4px_ | - |
