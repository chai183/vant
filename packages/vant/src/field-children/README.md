# FieldChildren `new`

### Intro

Dynamic list of form fields with add and remove.

### Install

```js
import { createApp } from 'vue';
import { FieldChildren, Field, CellGroup } from 'vant';

const app = createApp();
app.use(FieldChildren);
app.use(Field);
app.use(CellGroup);
```

## Usage

### Basic (same pattern as RangeInput)

The parent only keeps one array; the slot contains **one** `Field` template **without** `v-model`.

```html
<van-cell-group inset>
  <van-field-children
    v-model="list"
    title="Options"
    add-text="Add"
  >
    <van-field label="Name" placeholder="Please enter" />
  </van-field-children>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const list = ref(['', '']);
    return { list };
  },
};
```

### Min / max rows

- `min-items`: hide delete when length ≤ this value.
- `max-items`: hide add when length ≥ this value.

```html
<van-cell-group inset>
  <van-field-children
    v-model="list"
    title="Options"
    add-text="Add"
    :min-items="1"
    :max-items="3"
  >
    <van-field label="Name" placeholder="Please enter" />
  </van-field-children>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const list = ref(['', '']);
    return { list };
  },
};
```

### Default value for new rows

`default-row-value` is appended when add is clicked (default empty string).

```html
<van-cell-group inset>
  <van-field-children
    v-model="list"
    title="Options"
    add-text="Add"
    default-row-value="New option"
  >
    <van-field label="New option" placeholder="Please enter" />
  </van-field-children>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const list = ref(['']);
    return { list };
  },
};
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | List value; one row per item | _string[] \| number[]_ | `['']` |
| title | Header title on the left | _number \| string_ | - |
| add-text | Add button text when `#add` is not used | _string_ | `添加` |
| show-add | Whether to show the add control | _boolean_ | `true` |
| deletable | Inject delete when template has no `right-icon` | _boolean_ | `true` |
| min-items | Hide delete when length ≤ this value | _number_ | `0` |
| max-items | Hide add when length ≥ this value | _number_ | - |
| default-row-value | Value appended on add | _string \| number_ | `''` |
| delete-icon | `Field` `right-icon` name for delete | _string_ | `minus` |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| update:modelValue | List changed (input, add, remove) | _value: string[] \| number[]_ |

### Slots

| Name | Description |
| --- | --- |
| default | **One** `van-field` template (`label`, `placeholder`, etc.); no `v-model` / `v-for` |
| title | Custom header left |
| add | Custom add control |

### Theme variables

| Name | Default | Description |
| --- | --- | --- |
| --van-field-children-add-color | _var(--van-primary-color)_ | Add text color |
| --van-field-children-add-font-size | _var(--van-font-size-md)_ | Add font size |
| --van-field-children-title-color | _var(--van-cell-text-color, var(--van-text-color))_ | Title color |
| --van-field-children-title-font-size | _var(--van-cell-font-size, var(--van-font-size-md))_ | Title font size |
| --van-field-children-title-line-height | _var(--van-cell-line-height, 24px)_ | Title line height |
| --van-field-children-header-padding | _var(--van-padding-md) var(--van-padding-md) var(--van-padding-xs)_ | Header padding |
| --van-field-children-item-gap | _0_ | Vertical padding of row body around the divider |
| --van-field-children-item-border-color | _var(--van-border-color)_ | Bottom border color of each row |
| --van-field-children-tree-gutter-width | _10px_ | Tree guide gutter width |
| --van-field-children-tree-color | _var(--van-border-color)_ | Tree guide line color |
| --van-field-children-tree-line-width | _1px_ | Tree guide line width |
| --van-field-children-tree-elbow-y | _50%_ | Vertical position of the elbow |
| --van-field-children-tree-rail-length | _10px_ | Vertical rail length |
| --van-field-children-tree-arm-length | _10px_ | Horizontal arm length |
| --van-field-children-delete-icon-color | _var(--van-white)_ | Delete icon color |
| --van-field-children-delete-icon-bg | _var(--van-primary-color)_ | Delete icon background |
| --van-field-children-delete-icon-size | _14px_ | Delete icon size |
