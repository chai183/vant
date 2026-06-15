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

基础用法为单列单选，示例中 `待处理` 配置了橙点，标签长度保持常规。

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

用于展示单列单选场景，示例保留较长标签，用于验证标签极限长度下的展示效果。

```html
<van-cascade-tree-select v-model="singleValue" :items="singleItems" />
```

```js
const singleValue = ref('pending');
const singleItems = [
  { text: '全部订单选择项目', value: 'all' },
  { text: '待处理订单选择项', value: 'pending', dot: true, badge: 3 },
  { text: '已完成订单选择项', value: 'finished' },
];
```

### 单选双列

通过 `expand-path` 控制双列外层展开路径。示例最多展示两列。

`expand-path` 只记录可展开的外层项，例如 `['food']`；点击第二列叶子项时，只会更新 `v-model`，不会把叶子项 value 写入 `expand-path`。

```html
<van-cascade-tree-select
  v-model="cascadeValue"
  v-model:expand-path="cascadeExpandPath"
  :items="cascadeItems"
/>
```

```js
const cascadeValue = ref('apple');
const cascadeExpandPath = ref(['food']);
const cascadeItems = [
  {
    text: '食品分类项目',
    value: 'food',
    children: [
      { text: '苹果选择项目', value: 'apple', dot: true, badge: 4 },
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

### 父级可选

默认情况下 `select-leaf-only` 为 `true`，点击父级只会展开下一列，不会写入 `v-model`。设置为 `false` 后，点击父级会同时展开并把父级 value 写入 `v-model`。

```html
<van-cascade-tree-select
  v-model="parentSelectableValue"
  v-model:expand-path="parentSelectableExpandPath"
  :items="cascadeItems"
  :select-leaf-only="false"
/>
```

```js
const parentSelectableValue = ref('food');
const parentSelectableExpandPath = ref(['food']);
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
```

### 多选双列

橙点和弱徽标仅在当前页面已经存在选中项时展示。配置 `dot` 时会展示橙点，多选级联模式下父项存在已选子项时也会展示橙点。弱徽标仅在多选模式下展示，内容只读取配置项中的 `badge`，不会根据已选数量自动生成。弱徽标和橙点不会同时显示，同时配置时弱徽标优先。

默认开启 `select-leaf-only`，因此点击一级父项只会展开二级列表，不会写入 `v-model`；二级叶子项才会进入多选值。一级父项的高亮和左侧指示条表示当前展开态，即 `active`，不代表该父项已经选中，即 `selected`。

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

const formatOptions = (options) =>
  options.map((option) => option.text).join(', ') || '暂无';
```

### 自定义选项文本

通过 `nav-text` 插槽可以自定义左侧选项的文本区域，插槽参数为当前选项 `item`。该插槽只替换文字内容，不会影响橙点、弱徽标、禁用和点击逻辑。

```html
<van-cascade-tree-select v-model="navTextValue" :items="singleItems">
  <template #nav-text="item">
    <span class="demo-cascade-tree-select-nav-text">
      {{ item.text }}
      <span class="demo-cascade-tree-select-tag">自定义</span>
    </span>
  </template>
</van-cascade-tree-select>
```

```js
const navTextValue = ref('pending');
```

### 事件监听

组件支持监听 `click-nav`、`click-item` 和 `change` 事件。外层列点击触发 `click-nav`，内层列点击触发 `click-item`，选中值变化时触发 `change`。

```html
<van-cascade-tree-select
  v-model="eventValue"
  v-model:expand-path="eventExpandPath"
  :items="cascadeItems"
  @change="onEvent('change', $event)"
  @click-nav="onEvent('click-nav', $event)"
  @click-item="onEvent('click-item', $event)"
/>
```

```js
import { showToast } from 'vant';

const eventValue = ref('apple');
const eventExpandPath = ref(['food']);

const onEvent = (eventName, params) => {
  const currentText = params.currentItem.text || String(params.selectedValue);

  showToast(`${eventName}: ${currentText}`);
};
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
| select-leaf-only | 是否仅叶子节点可选中 | _boolean_ | `true` |
| active-color | 选中状态颜色 | _string_ | - |
| field-names | 自定义 `items` 结构中的字段 | _CascadeTreeSelectFieldNames_ | 见下方表格 |

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
