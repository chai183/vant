# RangeInput `new`

### Intro

Layout two inputs for start and end range entry.

### Install

```js
import { createApp } from 'vue';
import { RangeInput, CellGroup, Field } from 'vant';

const app = createApp();
app.use(RangeInput);
app.use(CellGroup);
app.use(Field);
```

## Usage

Keep a single two-element array on the parent; **do not** bind `v-model` on each input. Pass the two inputs via the default slot, `start` / `end` slots, or `start` / `end` render props.

### Vertical layout

With `layout="vertical"`, a vertical separator (default label `至`) sits on the left and the two inputs stack on the right.

```html
<van-cell-group inset>
  <van-range-input v-model="range" layout="vertical">
    <van-field input-border placeholder="Please enter">
      <template #button>
        <span>Longer unit text</span>
      </template>
    </van-field>
    <van-field input-border placeholder="Please enter">
      <template #button>
        <span>Longer unit text</span>
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

### Horizontal layout

With `layout="horizontal"`, the two inputs sit in a row with a short line between them.

```html
<van-cell-group inset>
  <van-range-input v-model="range" layout="horizontal">
    <van-field input-border placeholder="Please enter">
      <template #button>
        <span>Unit</span>
      </template>
    </van-field>
    <van-field input-border placeholder="Please enter">
      <template #button>
        <span>Unit</span>
      </template>
    </van-field>
  </van-range-input>
</van-cell-group>
```

### start / end slots

Use the `start` and `end` slots when you want separate template configuration for each side (lower priority than the `start` / `end` render props).

```html
<van-cell-group inset>
  <van-range-input v-model="range" layout="vertical">
    <template #start>
      <van-field input-border placeholder="Start" />
    </template>
    <template #end>
      <van-field input-border placeholder="End" />
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

### start / end props

Pass render functions via `start` and `end` for TSX or programmatic trees. Both are required; props take priority over slots.

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
      h(Field, { inputBorder: true, placeholder: 'Start' });
    const renderEnd = () =>
      h(Field, { inputBorder: true, placeholder: 'End' });

    return { range, renderStart, renderEnd };
  },
};
```

TSX:

```jsx
<RangeInput
  v-model={range}
  layout="horizontal"
  start={() => <Field inputBorder placeholder="Start" />}
  end={() => <Field inputBorder placeholder="End" />}
/>
```

### Date shortcuts

Set `show-date-shortcuts` to show built-in buttons (last week / last month / last 3 months). Clicking a button writes the date range into `v-model`. Works well with readonly [Field](#/en-US/field) and a [DatePicker](#/en-US/date-picker) popup.

```html
<van-cell-group inset>
  <van-range-input
    v-model="range"
    layout="vertical"
    show-date-shortcuts
  >
    <template #start>
      <van-field input-border is-link readonly placeholder="Select time" />
    </template>
    <template #end>
      <van-field input-border is-link readonly placeholder="Select time" />
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

### Partial date shortcuts

Pass an array to show only selected built-in options: `lastWeek`, `lastMonth`, `lastThreeMonths`.

```html
<van-cell-group inset>
  <van-range-input
    v-model="range"
    layout="vertical"
    :show-date-shortcuts="['lastWeek', 'lastMonth']"
  >
    <template #start>
      <van-field input-border is-link readonly placeholder="Select time" />
    </template>
    <template #end>
      <van-field input-border is-link readonly placeholder="Select time" />
    </template>
  </van-range-input>
</van-cell-group>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Two-element array merged into both slot children | _string[] \| number[]_ | `['', '']` |
| layout | Layout direction | _'vertical' \| 'horizontal'_ | `vertical` |
| vertical-separator | Center label between vertical line segments; also `aria-label` | _string_ | `至` |
| show-date-shortcuts | Show built-in date range shortcut buttons; `true` shows all, an array shows only the listed options: `lastWeek`, `lastMonth`, `lastThreeMonths` | _boolean \| RangeInputDateShortcutType[]_ | `false` |
| shortcuts | Custom shortcuts `{ label, value }`; `value` is a 2-item array. Can be combined with `show-date-shortcuts`; custom items are appended after the built-in date shortcuts | _RangeInputShortcut[]_ | `[]` |
| start | Render function for the start input; must be used with `end`; takes priority over slots | _() => VNode_ | - |
| end | Render function for the end input; must be used with `start`; takes priority over slots | _() => VNode_ | - |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| update:modelValue | Either child value changed, or a shortcut was clicked | _value: string[] \| number[]_ |

### Slots

| Name | Description |
| --- | --- |
| default | **Exactly two** children; `v-model` is merged into both; body hidden if count ≠ 2; used when `start` / `end` props or slots are not both provided |
| start | Start input; must be used together with the `end` slot |
| end | End input; must be used together with the `start` slot |
| separator | Custom separator |

### Types

The component exports the following type:

```ts
import type { RangeInputShortcut } from 'vant';
```

`RangeInputShortcut` shape:

```ts
type RangeInputShortcut = {
  label: string;
  value: string[] | number[];
};
```

## Theme

### CSS Variables

The component provides the following CSS variables. See the [ConfigProvider component](/config-provider) for usage.

| Name | Default Value | Description |
| --- | --- | --- |
| --van-range-input-gap | _24px_ | Vertical stack gap |
| --van-range-input-separator-color | _var(--van-text-color-2)_ | Separator color |
| --van-range-input-separator-font-size | _var(--van-font-size-md)_ | Separator font size |
| --van-range-input-horizontal-line-width | _12px_ | Horizontal divider width |
| --van-range-input-horizontal-line-color | _var(--van-border-color)_ | Horizontal divider color |
| --van-range-input-vertical-line-width | _1px_ | Vertical layout line width |
| --van-range-input-vertical-line-color | _var(--van-border-color)_ | Vertical layout line color |
| --van-range-input-vertical-line-min-height | _24px_ | Vertical layout separator column min height |
| --van-range-input-shortcut-color | _var(--van-text-color)_ | Shortcut button text color |
| --van-range-input-shortcut-background | _#f5f5f5_ | Shortcut button background |
| --van-range-input-shortcut-font-size | _var(--van-font-size-sm)_ | Shortcut button font size |
| --van-range-input-shortcut-gap | _8px_ | Gap between shortcut buttons |
| --van-range-input-shortcut-padding-y | _8px_ | Shortcut button vertical padding |
| --van-range-input-shortcut-padding-x | _4px_ | Shortcut button horizontal padding |
| --van-range-input-shortcut-margin-bottom | _var(--van-padding-xs)_ | Space below shortcut row |
