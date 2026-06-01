# RangeInput 范围录入 `new`

### 介绍

用于起止区间录入的双输入编排。

### 引入

```js
import { createApp } from 'vue';
import { RangeInput, CellGroup, Field } from 'vant';

const app = createApp();
app.use(RangeInput);
app.use(CellGroup);
app.use(Field);
```

## 代码演示

父组件只维护一个长度为 2 的数组；起止两个输入 **不要**各自绑定 `v-model`。可通过默认插槽、`start` / `end` 插槽，或 `start` / `end` 属性（渲染函数）传入。

### 上下布局

`layout="vertical"` 时，左侧为竖线 + 中间文案（默认「至」），右侧上下排列两个输入框。

```html
<van-cell-group inset>
  <van-range-input v-model="range" layout="vertical">
    <van-field :border="false" placeholder="请输入">
      <template #button>
        <span>文字较长单位</span>
      </template>
    </van-field>
    <van-field :border="false" placeholder="请输入">
      <template #button>
        <span>文字较长单位</span>
      </template>
    </van-field>
  </van-range-input>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const range = ref(['', '']);
    return { range };
  },
};
```

### 左右布局

`layout="horizontal"` 时，两个输入框横向排列，中间为短横线分隔。

```html
<van-cell-group inset>
  <van-range-input v-model="range" layout="horizontal">
    <van-field :border="false" placeholder="请输入">
      <template #button>
        <span>单位</span>
      </template>
    </van-field>
    <van-field :border="false" placeholder="请输入">
      <template #button>
        <span>单位</span>
      </template>
    </van-field>
  </van-range-input>
</van-cell-group>
```

### start / end 插槽

通过 `start`、`end` 插槽分别传入起止输入，适合在模板中区分两侧配置（优先级低于 `start` / `end` 属性）。

```html
<van-cell-group inset>
  <van-range-input v-model="range" layout="vertical">
    <template #start>
      <van-field :border="false" placeholder="请输入起始" />
    </template>
    <template #end>
      <van-field :border="false" placeholder="请输入结束" />
    </template>
  </van-range-input>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const range = ref(['', '']);
    return { range };
  },
};
```

### start / end 属性

通过 `start`、`end` 渲染函数传入子节点，适合 TSX 或在 `setup` 中组装子树；需成对传入，且优先于插槽。

```html
<van-range-input
  v-model="range"
  layout="horizontal"
  :start="renderStart"
  :end="renderEnd"
/>
```

```js
import { h, ref } from 'vue';
import { Field } from 'vant';

export default {
  setup() {
    const range = ref(['', '']);
    const renderStart = () =>
      h(Field, { border: false, placeholder: '请输入起始' });
    const renderEnd = () =>
      h(Field, { border: false, placeholder: '请输入结束' });

    return { range, renderStart, renderEnd };
  },
};
```

TSX 写法：

```jsx
<RangeInput
  v-model={range}
  layout="horizontal"
  start={() => <Field border={false} placeholder="请输入起始" />}
  end={() => <Field border={false} placeholder="请输入结束" />}
/>
```

### 日期快捷选择

开启 `show-date-shortcuts` 后，展示「近一周 / 近一月 / 近三月」按钮，点击后将对应日期区间写入 `v-model`。可与 `type="date"` 的 `Field` 搭配使用。

传入数组时可只展示部分内置选项，可选值：`lastWeek`、`lastMonth`、`lastThreeMonths`。

```html
<van-cell-group inset>
  <van-range-input
    v-model="range"
    layout="vertical"
    :show-date-shortcuts="['lastWeek', 'lastMonth']"
  >
    <template #start>
      <van-field :border="false" type="date" placeholder="请输入" />
    </template>
    <template #end>
      <van-field :border="false" type="date" placeholder="请输入" />
    </template>
  </van-range-input>
</van-cell-group>
```

展示全部内置选项：

```html
<van-cell-group inset>
  <van-range-input
    v-model="range"
    layout="vertical"
    show-date-shortcuts
  >
    <template #start>
      <van-field :border="false" type="date" placeholder="请输入" />
    </template>
    <template #end>
      <van-field :border="false" type="date" placeholder="请输入" />
    </template>
  </van-range-input>
</van-cell-group>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 长度为 2 的数组，合并到两个子组件 | _string[] \| number[]_ | `['', '']` |
| layout | 布局方向 | _'vertical' \| 'horizontal'_ | `vertical` |
| vertical-separator | 纵向布局中间文案（上下为竖线段），并作为 `aria-label` | _string_ | `至` |
| show-date-shortcuts | 是否展示内置日期区间快捷按钮；为 `true` 时展示全部，为数组时仅展示对应选项，可选 `lastWeek`、`lastMonth`、`lastThreeMonths` | _boolean \| RangeInputDateShortcutType[]_ | `false` |
| shortcuts | 自定义快捷按钮，项为 `{ label, value }`，`value` 为长度 2 的数组；可与 `show-date-shortcuts` 同时使用，自定义项排在内置日期快捷之后 | _RangeInputShortcut[]_ | `[]` |
| start | 起始输入的渲染函数，需与 `end` 同时传入；优先级高于插槽 | _() => VNode_ | - |
| end | 结束输入的渲染函数，需与 `start` 同时传入；优先级高于插槽 | _() => VNode_ | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 任一侧子组件值变化，或点击快捷按钮 | _value: string[] \| number[]_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | **恰好两个**子组件；由组件合并 `v-model`；数量不为 2 时不展示内容区；未使用 `start` / `end` 属性或插槽时生效 |
| start | 起始输入；需与 `end` 插槽同时提供 |
| end | 结束输入；需与 `start` 插槽同时提供 |
| separator | 自定义区间分隔 |

### 类型定义

组件导出以下类型：

```ts
import type { RangeInputShortcut } from 'vant';
```

`RangeInputShortcut` 结构：

```ts
type RangeInputShortcut = {
  label: string;
  value: string[] | number[];
};
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-range-input-gap | _var(--van-padding-sm)_ | 上下堆叠间距 |
| --van-range-input-separator-color | _var(--van-text-color-2)_ | 分隔符颜色 |
| --van-range-input-separator-font-size | _var(--van-font-size-md)_ | 分隔符字号 |
| --van-range-input-horizontal-line-width | _12px_ | 横向布局中间线段宽度 |
| --van-range-input-horizontal-line-color | _var(--van-border-color)_ | 横向布局中间线段颜色 |
| --van-range-input-vertical-line-width | _1px_ | 纵向布局竖线宽度 |
| --van-range-input-vertical-line-color | _var(--van-border-color)_ | 纵向布局竖线颜色 |
| --van-range-input-vertical-line-min-height | _24px_ | 纵向布局分隔列最小高度 |
| --van-range-input-shortcut-color | _var(--van-text-color)_ | 快捷按钮文字颜色 |
| --van-range-input-shortcut-background | _#f5f5f5_ | 快捷按钮背景色 |
| --van-range-input-shortcut-font-size | _var(--van-font-size-sm)_ | 快捷按钮字号 |
| --van-range-input-shortcut-gap | _8px_ | 快捷按钮间距 |
| --van-range-input-shortcut-padding-y | _8px_ | 快捷按钮纵向内边距 |
| --van-range-input-shortcut-padding-x | _4px_ | 快捷按钮横向内边距 |
| --van-range-input-shortcut-margin-bottom | _var(--van-padding-xs)_ | 快捷按钮与内容区间距 |
