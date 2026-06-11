# Slider

### Intro

Used to select a value within a given range.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Slider } from 'vant';

const app = createApp();
app.use(Slider);
```

## Usage

### Single Slider

Use `type="single"` for a single draggable thumb.

```html
<van-slider v-model="value" type="single" @change="onChange" />
```

### Range Slider

Use `type="range"` for a range slider with two draggable thumbs. `v-model` must be an array.

```html
<van-slider v-model="value" type="range" @change="onChange" />
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value = ref([20, 80]);
    return { value };
  },
};
```

### Node Range Slider

Use `type="node-range"` with `min`, `max`, and `step` (or `marks`) to snap both thumbs to nodes.

```html
<van-slider
  v-model="value"
  type="node-range"
  :min="200"
  :max="1000"
  :step="200"
/>
```

### Amount Range

Use `type="range"` with `show-inputs` to display min/max amount inputs below the slider with two-way sync. Customize display via `formatter` / `parser`.

```html
<van-slider
  v-model="amountRange"
  type="range"
  show-inputs
  :min="0"
  :max="100000000000"
  min-placeholder="¥ Min amount"
  max-placeholder="¥ Max amount"
/>
```

### Select Amount

Use `type="single"` with `show-value` to display unselected text or a formatted amount below the slider.

```html
<van-slider
  v-model="amount"
  type="single"
  show-value
  :min="0"
  :max="100000000000"
  unselected-text="Unselected"
/>
```

### Range

```html
<van-slider v-model="value" :min="-50" :max="50" />
```

### Disabled

```html
<van-slider v-model="value" disabled />
```

### Step size

```html
<van-slider v-model="value" :step="10" />
```

### Custom style

```html
<van-slider v-model="value" bar-height="4px" active-color="#ee0a24" />
```

### Custom button

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

### Vertical

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
    const onChange = (value) => showToast('Current value: ' + value);
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

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Current value | _number \| [number, number]_ | `0` |
| max | Max value | _number \| string_ | `100` |
| min | Min value | _number \| string_ | `0` |
| step | Step size | _number \| string_ | `1` |
| type | Slider type, can be set to `single` `range` `node-range` | _string_ | `single` |
| marks | Node values for `node-range` | _number[]_ | - |
| bar-height | Track height | _number \| string_ | `4px` |
| button-size | Button size | _number \| string_ | `30x16` |
| active-color | Active color of bar | _string_ | `#ff6b00` |
| inactive-color | Inactive color of bar | _string_ | `#f5f5f5` |
| show-value | Whether to display value text below slider (single mode) | _boolean_ | `false` |
| show-inputs | Whether to display range inputs below slider (range mode) | _boolean_ | `false` |
| unselected-text | Text when unselected, use with `show-value` | _string_ | `未选择` |
| min-placeholder | Min amount input placeholder, use with `show-inputs` | _string_ | `¥ 最低金额` |
| max-placeholder | Max amount input placeholder, use with `show-inputs` | _string_ | `¥ 最高金额` |
| formatter | Custom value formatter | _(value: number) => string_ | - |
| parser | Custom input parser | _(text: string) => number \| null_ | - |
| range | Whether to enable dual thumb mode, prefer `type="range"` | _boolean_ | `false` |
| reverse | Whether to reverse slider | _boolean_ | `false` |
| disabled | Whether to disable slider | _boolean_ | `false` |
| readonly | Whether to be readonly | _boolean_ | `false` |
| vertical | Whether to display slider vertically | _boolean_ | `false` |

### Events

| Event              | Description                    | Arguments           |
| ------------------ | ------------------------------ | ------------------- |
| update:model-value | Emitted when value is changing | _value: number_     |
| change             | Emitted after value changed    | _value: number_     |
| drag-start         | Emitted when start dragging    | _event: TouchEvent_ |
| drag-end           | Emitted when end dragging      | _event: TouchEvent_ |

### Slots

| Name | Description | SlotProps |
| --- | --- | --- |
| button | Custom button | _{ value: number, dragging: boolean }_ |
| left-button | Custom left button in range mode | _{ value: number, dragging: boolean, dragIndex?: number }_ |
| right-button | Custom right button in range mode | _{ value: number, dragging: boolean, dragIndex?: number }_ |
| value | Custom value display, use with `show-value` | _{ value: number, selected: boolean }_ |
| range-input | Custom range inputs, use with `show-inputs` | _{ modelValue: [number, number], min: string, max: string }_ |

### Types

The component exports the following type definitions:

```ts
import type { SliderProps, SliderType } from 'vant';
```

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-slider-active-background | _#ff6b00_ | - |
| --van-slider-inactive-background | _#f5f5f5_ | - |
| --van-slider-disabled-opacity | _var(--van-disabled-opacity)_ | - |
| --van-slider-bar-height | _4px_ | - |
| --van-slider-active-bar-height | _4px_ | - |
| --van-slider-button-width | _30px_ | - |
| --van-slider-button-height | _16px_ | - |
| --van-slider-button-radius | _half of button height_ | - |
| --van-slider-button-background | _var(--van-white)_ | - |
| --van-slider-button-border-color | _#dddddd_ | - |
| --van-slider-button-grip-color | _#999999_ | - |
| --van-slider-button-grip-gap | _4px_ | - |
| --van-slider-mark-label-color | _var(--van-gray-6)_ | - |
| --van-slider-mark-label-active-color | _#ff6b00_ | - |
| --van-slider-mark-dot-color | _#dddddd_ | - |
| --van-slider-mark-dot-active-color | _#ff6b00_ | - |
| --van-slider-mark-dot-active-border-color | _var(--van-white)_ | - |
| --van-slider-value-margin-top | _22px_ | - |
| --van-slider-value-color | _#cccccc_ | - |
| --van-slider-value-font-size | _12px_ | - |
| --van-slider-value-line-height | _17px_ | - |
| --van-slider-value-active-color | _#ff6b00_ | - |
