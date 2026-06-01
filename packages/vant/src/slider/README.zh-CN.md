# Slider 滑块

### 介绍

滑动输入条，用于在给定的范围内选择一个值。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Slider } from 'vant';

const app = createApp();
app.use(Slider);
```

## 代码演示

### 单项滑动

使用 `type="single"` 开启单项滑动，仅有一个滑块。

```html
<van-slider v-model="value" type="single" @change="onChange" />
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const value = ref(50);
    const onChange = (value) => showToast('当前值：' + value);
    return {
      value,
      onChange,
    };
  },
};
```

### 区间滑动

使用 `type="range"` 开启区间滑动，两头均可拖动，`v-model` 需为数组。

```html
<van-slider v-model="value" type="range" @change="onChange" />
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const value = ref([20, 80]);
    const onChange = (value) => showToast('当前值：' + value);
    return {
      value,
      onChange,
    };
  },
};
```

### 节点区间选择

使用 `type="node-range"` 开启节点区间选择，配合 `min`、`max`、`step`（或 `marks`）将滑块吸附到节点，并展示刻度标签。

```html
<van-slider
  v-model="value"
  type="node-range"
  :min="200"
  :max="1000"
  :step="200"
/>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value = ref([400, 800]);
    return { value };
  },
};
```

### 选择金额区间

使用 `type="range"` 搭配 `show-inputs`，在滑块下方展示最低/最高金额输入框，并与滑块双向联动。默认按金额格式展示，可通过 `formatter` / `parser` 自定义。

```html
<van-slider
  v-model="amountRange"
  type="range"
  show-inputs
  :min="0"
  :max="100000000000"
  min-placeholder="¥ 最低金额"
  max-placeholder="¥ 最高金额"
/>
```

### 选择金额

使用 `type="single"` 搭配 `show-value`，未选择时展示「未选择」，选择后在滑块下方展示格式化的金额。

```html
<van-slider
  v-model="amount"
  type="single"
  show-value
  :min="0"
  :max="100000000000"
  unselected-text="未选择"
/>
```

### 指定选择范围

```html
<van-slider v-model="value" :min="-50" :max="50" />
```

### 禁用

```html
<van-slider v-model="value" disabled />
```

### 指定步长

```html
<van-slider v-model="value" :step="10" />
```

### 自定义样式

```html
<van-slider v-model="value" bar-height="4px" active-color="#ee0a24" />
```

### 自定义按钮

```html
<van-slider v-model="value">
  <template #button>
    <div class="custom-button">{{ value }}</div>
  </template>
</van-slider>

<style>
  .custom-button {
    width: 26px;
    color: #fff;
    font-size: 10px;
    line-height: 18px;
    text-align: center;
    background-color: var(--van-primary-color);
    border-radius: 100px;
  }
</style>
```

### 垂直方向

设置 `vertical` 属性后，滑块会垂直展示，且高度为 100% 父元素高度。

```html
<div :style="{ height: '150px' }">
  <van-slider v-model="value" vertical @change="onChange" />
  <van-slider
    v-model="value2"
    range
    vertical
    style="margin-left: 100px;"
    @change="onChange"
  />
</div>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const value = ref(50);
    const value2 = ref([10, 50]);
    const onChange = (value) => showToast('当前值：' + value);
    return {
      value,
      value2,
      onChange,
    };
  },
};
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 当前进度百分比，在双滑块模式下为数组格式 | _number \| [number, number]_ | `0` |
| max | 最大值 | _number \| string_ | `100` |
| min | 最小值 | _number \| string_ | `0` |
| step | 步长 | _number \| string_ | `1` |
| type | 滑块类型，可选值为 `single` `range` `node-range` | _string_ | `single` |
| marks | 节点值列表，用于 `node-range`，未传时根据 `min` `max` `step` 自动生成 | _number[]_ | - |
| bar-height | 轨道高度，默认单位为 `px` | _number \| string_ | `4px` |
| button-size | 滑块按钮大小，默认单位为 `px` | _number \| string_ | `30x16` |
| active-color | 进度条激活态颜色 | _string_ | `#ff6b00` |
| inactive-color | 进度条非激活态颜色 | _string_ | `#f5f5f5` |
| show-value | 是否在滑块下方展示数值（单项模式） | _boolean_ | `false` |
| show-inputs | 是否在滑块下方展示区间输入框（区间模式） | _boolean_ | `false` |
| unselected-text | 未选择时的展示文案，需配合 `show-value` | _string_ | `未选择` |
| min-placeholder | 最低金额输入框占位符，需配合 `show-inputs` | _string_ | `¥ 最低金额` |
| max-placeholder | 最高金额输入框占位符，需配合 `show-inputs` | _string_ | `¥ 最高金额` |
| formatter | 自定义数值格式化函数 | _(value: number) => string_ | - |
| parser | 自定义输入解析函数 | _(text: string) => number \| null_ | - |
| range | 是否开启双滑块模式，推荐使用 `type="range"` | _boolean_ | `false` |
| reverse | 是否将进度条反转 | _boolean_ | `false` |
| disabled | 是否禁用滑块 | _boolean_ | `false` |
| readonly | 是否为只读状态，只读状态下无法修改滑块的值 | _boolean_ | `false` |
| vertical | 是否垂直展示 | _boolean_ | `false` |

### Events

| 事件名             | 说明                     | 回调参数            |
| ------------------ | ------------------------ | ------------------- |
| update:model-value | 进度变化时实时触发       | _value: number_     |
| change             | 进度变化且结束拖动后触发 | _value: number_     |
| drag-start         | 开始拖动时触发           | _event: TouchEvent_ |
| drag-end           | 结束拖动时触发           | _event: TouchEvent_ |

### Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| button | 自定义滑块按钮 | _{ value: number, dragging: boolean }_ |
| left-button | 自定义左侧滑块按钮（双滑块模式下） | _{ value: number, dragging: boolean, dragIndex?: number }_ |
| right-button | 自定义右侧滑块按钮（双滑块模式下） | _{ value: number, dragging: boolean, dragIndex?: number }_ |
| value | 自定义滑块下方展示内容，需配合 `show-value` | _{ value: number, selected: boolean }_ |
| range-input | 自定义区间输入框，需配合 `show-inputs` | _{ modelValue: [number, number], min: string, max: string }_ |

### 类型定义

组件导出以下类型定义：

```ts
import type { SliderProps, SliderType } from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称                             | 默认值                         | 描述 |
| -------------------------------- | ------------------------------ | ---- |
| --van-slider-active-background   | _#ff6b00_                      | 已滑动轨道颜色 |
| --van-slider-inactive-background | _#f5f5f5_                      | 未滑动轨道颜色 |
| --van-slider-disabled-opacity    | _var(--van-disabled-opacity)_  | -    |
| --van-slider-bar-height          | _4px_                          | 轨道高度 |
| --van-slider-active-bar-height   | _4px_                          | 激活进度条高度 |
| --van-slider-button-width        | _30px_                         | 滑块宽度 |
| --van-slider-button-height       | _16px_                         | 滑块高度 |
| --van-slider-button-radius       | _高度的一半_                   | 椭圆形滑块圆角 |
| --van-slider-button-background   | _var(--van-white)_             | 滑块背景色 |
| --van-slider-button-border-color | _#dddddd_                      | 滑块边框色 |
| --van-slider-button-grip-color   | _#999999_                      | 握把线条颜色 |
| --van-slider-button-grip-gap     | _4px_                          | 握把线条间距 |
| --van-slider-mark-label-color      | _var(--van-gray-6)_            | 节点标签颜色 |
| --van-slider-mark-label-active-color | _#ff6b00_                    | 节点标签激活颜色 |
| --van-slider-mark-dot-color        | _#dddddd_                      | 节点圆点颜色 |
| --van-slider-mark-dot-active-color | _#ff6b00_                      | 节点圆点激活颜色 |
| --van-slider-mark-dot-active-border-color | _var(--van-white)_        | 节点圆点激活边框颜色 |
| --van-slider-value-margin-top      | _22px_                         | 数值展示距滑块距离 |
| --van-slider-value-color           | _#cccccc_                      | 未选择数值颜色 |
| --van-slider-value-font-size       | _12px_                         | 数值字号 |
| --van-slider-value-line-height     | _17px_                         | 数值行高 |
| --van-slider-value-active-color    | _#ff6b00_                      | 已选择数值颜色 |
