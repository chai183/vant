# Radio

### Intro

Single selection among multiple options.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { RadioGroup, Radio } from 'vant';

const app = createApp();
app.use(Radio);
app.use(RadioGroup);
```

## Usage

### Basic Usage

Use `v-model` to bind the name of checked radio.

```html
<van-radio-group v-model="checked">
  <van-radio name="1">Radio 1</van-radio>
  <van-radio name="2">Radio 2</van-radio>
</van-radio-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const checked = ref('1');
    return { checked };
  },
};
```

### Horizontal

When `direction` is set to `horizontal`, you can use the `columns` prop to set the number of options per row. The default value is `3`.

```html
<van-radio-group v-model="checked" direction="horizontal">
  <van-radio name="1">Radio 1</van-radio>
  <van-radio name="2">Radio 2</van-radio>
</van-radio-group>

<van-radio-group v-model="checked" direction="horizontal" :columns="2">
  <van-radio name="1">Radio 1</van-radio>
  <van-radio name="2">Radio 2</van-radio>
  <van-radio name="3">Radio 3</van-radio>
  <van-radio name="4">Radio 4</van-radio>
</van-radio-group>
```

### Disabled

```html
<van-radio-group v-model="checked" disabled>
  <van-radio name="1">Radio 1</van-radio>
  <van-radio name="2">Radio 2</van-radio>
</van-radio-group>
```

### Custom Shape

```html
<van-radio-group v-model="checked" shape="square">
  <van-radio name="1">Radio 1</van-radio>
  <van-radio name="2">Radio 2</van-radio>
</van-radio-group>

<van-radio-group v-model="checked" shape="dot">
  <van-radio name="1">Radio 1</van-radio>
  <van-radio name="2">Radio 2</van-radio>
</van-radio-group>
```

### Custom Color

```html
<van-radio-group v-model="checked">
  <van-radio name="1" checked-color="#ee0a24">Radio 1</van-radio>
  <van-radio name="2" checked-color="#ee0a24">Radio 2</van-radio>
</van-radio-group>
```

### Custom Icon Size

```html
<van-radio-group v-model="checked">
  <van-radio name="1" icon-size="24px">Radio 1</van-radio>
  <van-radio name="2" icon-size="24px">Radio 2</van-radio>
</van-radio-group>
```

### Custom Icon

Use icon slot to custom icon

```html
<van-radio-group v-model="checked">
  <van-radio name="1">
    Radio 1
    <template #icon="props">
      <img class="img-icon" :src="props.checked ? activeIcon : inactiveIcon" />
    </template>
  </van-radio>
  <van-radio name="2">
    Radio 2
    <template #icon="props">
      <img class="img-icon" :src="props.checked ? activeIcon : inactiveIcon" />
    </template>
  </van-radio>
</van-radio-group>

<style>
  .img-icon {
    height: 20px;
  }
</style>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const checked = ref('1');
    return {
      checked,
      activeIcon:
        'https://fastly.jsdelivr.net/npm/@vant/assets/user-active.png',
      inactiveIcon:
        'https://fastly.jsdelivr.net/npm/@vant/assets/user-inactive.png',
    };
  },
};
```

### Left Label

Set `label-position` prop to `'left'` to adjust the label position to the left of the Radio.

```html
<van-radio-group v-model="checked">
  <van-radio name="1" label-position="left">Radio 1</van-radio>
  <van-radio name="2" label-position="left">Radio 2</van-radio>
</van-radio-group>
```

### Disable Label Click

```html
<van-radio-group v-model="checked">
  <van-radio name="1" label-disabled>Radio 1</van-radio>
  <van-radio name="2" label-disabled>Radio 2</van-radio>
</van-radio-group>
```

### Option Icon

Use the `icon` field in `options` to set an icon for each option. In list mode, the icon is shown on the left of the Cell; otherwise, it is shown before the option label.

```html
<van-radio-group v-model="checked" :options="options" />
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const checked = ref('1');
    const options = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2', icon: 'shop-o' },
      { label: 'Option 3', value: '3', disabled: true, icon: 'shop-o' },
    ];
    return { checked, options };
  },
};
```

### List Layout

Set `is-list` to render options as a Cell list. Use `icon` or `cellProps` in each option to customize Cell props.

```html
<van-radio-group v-model="checked" is-list :options="options" />
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const checked = ref('1');
    const options = [
      { label: 'Option 1', value: '1' },
      {
        label: 'Option 2',
        value: '2',
        cellProps: { label: 'Description' },
      },
      {
        label: 'Option 3',
        value: '3',
        disabled: true,
        icon: 'shop-o',
      },
    ];
    return { checked, options };
  },
};
```

### List Search

When `is-list` is enabled, set `show-search` to render a search field at the top. The keyword is passed to the [Cell component](#/en-US/cell)'s `highlight` prop to highlight matched text and filter unmatched options. When no results match, an [Empty component](#/en-US/empty) is shown with the default description "No search results". Use the `search-empty` slot to customize the empty state.

```html
<van-radio-group
  v-model="checked"
  is-list
  show-search
  search-placeholder="Search options"
  :options="options"
/>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const checked = ref('1');
    const options = [
      { label: 'Option 1 Apple', value: '1' },
      { label: 'Option 2 Banana', value: '2' },
      {
        label: 'Option 3 Cherry',
        value: '3',
        cellProps: { label: 'Description' },
      },
    ];
    return { checked, options };
  },
};
```

### Inside a Cell

```html
<van-radio-group v-model="checked">
  <van-cell-group inset>
    <van-cell title="Radio 1" clickable @click="checked = '1'">
      <template #right-icon>
        <van-radio name="1" />
      </template>
    </van-cell>
    <van-cell title="Radio 2" clickable @click="checked = '2'">
      <template #right-icon>
        <van-radio name="2" />
      </template>
    </van-cell>
  </van-cell-group>
</van-radio-group>
```

### Types

The component exports the following type definitions:

```ts
import type {
  RadioProps,
  RadioShape,
  RadioGroupProps,
  RadioLabelPosition,
  RadioGroupDirection,
} from 'vant';
```

## API

### Radio Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| name | Radio name, usually a unique string or number | _any_ | - |
| shape | Can be set to `square` `dot` `block` | _string_ | `round` |
| disabled | Whether to disable radio | _boolean_ | `false` |
| label-disabled | Whether to disable label click | _boolean_ | `false` |
| label-position | Can be set to `left` | _string_ | `right` |
| icon-size | Icon size | _number \| string_ | `20px` |
| checked-color | Checked color | _string_ | `#1989fa` |

### RadioGroup Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Name of checked radio | _any_ | - |
| disabled | Disable all radios | _boolean_ | `false` |
| direction | Direction, can be set to `horizontal` | _string_ | `vertical` |
| columns `new` | Number of options per row in horizontal layout | _number \| string_ | `3` |
| is-list `new` | Whether to render options as a Cell list | _boolean_ | `false` |
| show-search `new` | Whether to show a search field at the top of the list, requires `is-list` | _boolean_ | `false` |
| search-placeholder `new` | Search field placeholder text | _string_ | `Enter filter keyword` |
| options `new` | Render options from config, each item is `{ label, value, disabled?, icon?, cellProps? }`, `icon` is the icon name, `cellProps` are [Cell](#/en-US/cell) props | _RadioGroupOption[]_ | `[]` |
| icon-size | Icon size of all radios | _number \| string_ | `20px` |
| checked-color | Checked color of all radios | _string_ | `#1989fa` |
| shape `v4.6.3` | Can be set to `square` `dot` `block` | _string_ | `round` |

### Radio Events

| Event | Description                   | Parameters          |
| ----- | ----------------------------- | ------------------- |
| click | Emitted when radio is clicked | _event: MouseEvent_ |

### RadioGroup Events

| Event  | Description                | Parameters     |
| ------ | -------------------------- | -------------- |
| change | Emitted when value changed | _name: string_ |

### Radio Slots

| Name    | Description  | SlotProps                                 |
| ------- | ------------ | ----------------------------------------- |
| default | Custom label | _{ checked: boolean, disabled: boolean }_ |
| icon    | Custom icon  | _{ checked: boolean, disabled: boolean }_ |

### RadioGroup Slots

| Name | Description |
| --- | --- |
| default | Custom options |
| search-empty `new` | Custom content when list search has no results; requires `is-list` and `show-search` |

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-radio-size | _20px_ | - |
| --van-radio-dot-size | _8px_ | The distance between the dot and the border |
| --van-radio-border-color | _var(--van-gray-5)_ | - |
| --van-radio-duration | _var(--van-duration-fast)_ | - |
| --van-radio-label-margin | _var(--van-padding-xs)_ | - |
| --van-radio-label-color | _var(--van-text-color)_ | - |
| --van-radio-checked-icon-color | _var(--van-primary-color)_ | - |
| --van-radio-disabled-icon-color | _var(--van-gray-5)_ | - |
| --van-radio-disabled-label-color | _var(--van-text-color-3)_ | - |
| --van-radio-disabled-background | _var(--van-border-color)_ | - |
