# CascadeTreeSelect

### Intro

`CascadeTreeSelect` is a category selection component that supports single column, double-column cascade, single selection, multiple selection, and custom content on the right side. Its layout is similar to `TreeSelect`.

### Install

```js
import { createApp } from 'vue';
import { CascadeTreeSelect } from 'vant';

const app = createApp();
app.use(CascadeTreeSelect);
```

## Usage

### Basic Usage

Basic usage is single-column single selection. In this example, `Pending` has a themed dot and labels use normal length.

```html
<van-cascade-tree-select v-model="basicValue" :items="basicItems" />
```

```js
import { ref } from 'vue';

const basicValue = ref('pending');
const basicItems = [
  { text: 'All', value: 'all' },
  { text: 'Pending', value: 'pending', dot: true },
  { text: 'Finished', value: 'finished' },
];
```

### Single Column

Used for single-column single selection. This example keeps longer labels to verify display in long-label scenarios.

```html
<van-cascade-tree-select v-model="singleValue" :items="singleItems" />
```

```js
const singleValue = ref('pending');
const singleItems = [
  { text: 'AllItems', value: 'all' },
  { text: 'PendingX', value: 'pending', dot: true, badge: 3 },
  { text: 'Finished', value: 'finished' },
];
```

### Single Double Column

Use `expand-path` to control the outer expanded path. The example displays at most two columns.

`expand-path` only records expandable outer options, such as `['food']`. Clicking a leaf option in the second column only updates `v-model` and does not write the leaf value into `expand-path`.

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
];
```

### Parent Selectable

By default, `select-leaf-only` is `true`, so clicking a parent option only expands the next column and does not update `v-model`. Set it to `false` to make parent options selectable and write the parent value into `v-model`.

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

### Multiple Column

Set `multiple` to enable multiple selection. This example reuses the single-column data.

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

### Multiple Double Column

The themed dot and weak badge are shown only when the current page already has selected items. A themed dot is shown when `dot` is configured, or when a parent option has selected child options in multiple cascade mode. Weak badges are shown only in multiple mode, and their content only comes from the configured `badge` field and is not generated from selected counts automatically. The weak badge and themed dot are mutually exclusive, and the weak badge has higher priority when both are configured.

`select-leaf-only` is enabled by default, so clicking a first-level parent option only expands the second column and does not update `v-model`; only second-level leaf options are written into the multiple value. The highlight and left indicator on a first-level parent option represent the expanded state, namely `active`, not the selected state, namely `selected`.

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

### Custom Content

Use the `content` slot to display custom content on the right side. This example is aligned with the demo and displays the current expanded option and selected options.

Note that `expandOptions` comes from `expand-path` and indicates the current outer expanded path, while `selectedItems` comes from `v-model` and indicates the options matched by the current selected value. If only `expand-path` is bound without `v-model`, `selectedItems` will be an empty array.

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
        Current: {{ expandOptions[expandOptions.length - 1]?.text || 'None' }}
      </p>
      <p>Selected: {{ formatOptions(selectedItems) }}</p>
    </div>
  </template>
</van-cascade-tree-select>
```

```js
const customValue = ref('apple');
const customExpandPath = ref(['food']);

const formatOptions = (options) =>
  options.map((option) => option.text).join(', ') || 'None';
```

### Custom Option Text

Use the `nav-text` slot to customize the text area of left options. The slot prop is the current option `item`. This slot only replaces text content and does not affect themed dots, weak badges, disabled state, or click behavior.

```html
<van-cascade-tree-select v-model="navTextValue" :items="singleItems">
  <template #nav-text="item">
    <span class="demo-cascade-tree-select-nav-text">
      {{ item.text }}
      <span class="demo-cascade-tree-select-tag">Custom</span>
    </span>
  </template>
</van-cascade-tree-select>
```

```js
const navTextValue = ref('pending');
```

### Events

You can listen to `click-nav`, `click-item`, and `change` events. Clicking an outer column emits `click-nav`, clicking an inner column emits `click-item`, and changing the selected value emits `change`.

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

### Disabled

Options support `disabled`. In cascade mode, both parent and child options can be disabled.

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
];
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Current selected value, single mode uses `number \| string`, multiple mode uses array | _number \| string \| Array_ | - |
| v-model:expand-path | Current outer expanded cascade path. Clicking an inner leaf option will not write the leaf value into it | _(number \| string)[]_ | `[]` |
| items | Required datasets for the component | _CascadeTreeSelectOption[]_ | `[]` |
| height | Component height | _number \| string_ | `300` |
| multiple | Whether to enable multiple selection | _boolean_ | `false` |
| show-badge | Whether to show dot and weak badge | _boolean_ | `true` |
| select-leaf-only | Whether only leaf options can be selected | _boolean_ | `true` |
| active-color | Active color | _string_ | - |
| field-names | Custom fields of `items` | _CascadeTreeSelectFieldNames_ | See below |

> Column width is controlled by styles for each scenario: single-selection single-column is `136px`, single-selection double-column is `108px`, multiple-selection single-column with weak badge is `148px`, multiple-selection double-column outer column is `108px`, and inner column is `118px`. Showing or hiding the themed dot or weak badge will not change column width.

### Data Structure of CascadeTreeSelectOption

| Key | Description | Type |
| --- | --- | --- |
| text | Option text | _string_ |
| value | Option value | _number \| string_ |
| children | Cascade children | _CascadeTreeSelectOption[]_ |
| disabled | Whether to disable the option | _boolean_ |
| dot | Whether to configure the themed dot, shown when the current page has selected items | _boolean_ |
| badge | Weak badge content, shown in multiple mode when the current page has selected items and displays `99+` when over `99` | _number \| string_ |
| color | Custom text color | _string_ |
| className | Custom option class name | _unknown_ |

### FieldNames Default Value

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

| Event | Description | Arguments |
| --- | --- | --- |
| change | Emitted when selected value changes | _CascadeTreeSelectEventParams_ |
| click-item | Emitted when an enabled option in the innermost column is clicked | _CascadeTreeSelectEventParams_ |
| click-nav | Emitted when an enabled option in the outer column is clicked. In single-column mode, option clicks also emit this event | _CascadeTreeSelectEventParams_ |

### CascadeTreeSelectEventParams

| Key | Description | Type |
| --- | --- | --- |
| selectedValue | Current selected value | _number \| string \| Array_ |
| currentItem | Current clicked option | _CascadeTreeSelectOption_ |
| columnIndex | Column index of current clicked option | _number_ |
| fullPathItems | Full path of current clicked option | _CascadeTreeSelectOption[]_ |
| selectedItems | Current selected options | _CascadeTreeSelectOption[]_ |
| expandPath | Current outer expanded path | _(number \| string)[]_ |
| isLeaf | Whether current clicked option is a leaf option | _boolean_ |

### Slots

| Name | Description | SlotProps |
| --- | --- | --- |
| nav-text | Custom option text, compatible with `TreeSelect` naming | _option_ |
| content | Custom right content | _{ columns, expandPath, expandOptions, selectedValues, selectedItems }_ |

> In the `content` slot, `expandOptions` is the full outer expanded path resolved from `expand-path`, and `selectedItems` is resolved from `v-model`. It is not the same as the current expanded path.

### Types

The component exports the following type definitions:

```ts
import type {
  CascadeTreeSelectProps,
  CascadeTreeSelectOption,
  CascadeTreeSelectFieldNames,
  CascadeTreeSelectEventParams,
} from 'vant';
```

### CSS Variables

| Name | Default Value | Description |
| --- | --- | --- |
| --van-cascade-tree-select-font-size | _14px_ | - |
| --van-cascade-tree-select-text-color | _#333_ | - |
| --van-cascade-tree-select-active-color | _var(--van-primary-orange)_ | - |
| --van-cascade-tree-select-disabled-color | _#ddd_ | - |
| --van-cascade-tree-select-active-background | _#fff_ | - |
| --van-cascade-tree-select-item-background | _#f5f5f5_ | Unselected item background |
| --van-cascade-tree-select-selected-background | _#fff_ | Selected item background |
| --van-cascade-tree-select-outer-active-background | _#fafafa_ | Current outer expanded item background in double-column mode |
| --van-cascade-tree-select-nav-background | _#f5f5f5_ | - |
| --van-cascade-tree-select-column-background | _#f5f5f5_ | - |
| --van-cascade-tree-select-content-background | _#fff_ | - |
| --van-cascade-tree-select-single-column-width | _136px_ | Single-selection single-column width |
| --van-cascade-tree-select-double-column-width | _108px_ | Single-selection double-column width |
| --van-cascade-tree-select-multiple-single-column-width | _148px_ | Multiple-selection single-column width with weak badge |
| --van-cascade-tree-select-multiple-double-outer-column-width | _108px_ | Multiple-selection double-column outer width |
| --van-cascade-tree-select-multiple-double-inner-column-width | _118px_ | Multiple-selection double-column inner width |
| --van-cascade-tree-select-item-height | _48px_ | - |
| --van-cascade-tree-select-item-padding-left | _8px_ | - |
| --van-cascade-tree-select-item-padding-right | _8px_ | - |
| --van-cascade-tree-select-item-padding | _0 var(--van-cascade-tree-select-item-padding-right) 0 var(--van-cascade-tree-select-item-padding-left)_ | - |
| --van-cascade-tree-select-selected-border-width | _2px_ | - |
| --van-cascade-tree-select-selected-border-height | _16px_ | - |
| --van-cascade-tree-select-selected-border-color | _var(--van-cascade-tree-select-active-color)_ | - |
| --van-cascade-tree-select-dot-size | _6px_ | - |
| --van-cascade-tree-select-dot-color | _var(--van-primary-orange)_ | - |
| --van-cascade-tree-select-badge-gap | _4px_ | Gap between badge and text |
| --van-cascade-tree-select-badge-color | _#666_ | - |
| --van-cascade-tree-select-badge-background | _#ddd_ | - |
| --van-cascade-tree-select-badge-font-size | _10px_ | - |
| --van-cascade-tree-select-badge-height | _14px_ | - |
| --van-cascade-tree-select-badge-padding | _0 4px_ | - |
