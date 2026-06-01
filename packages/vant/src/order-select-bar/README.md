# OrderSelectBar

### Intro

A bottom bar for cart or batch actions: optional tip on top; the bar shows **built-in select-all (or a scoped `#left` slot)**, **Favorite / Share icon actions** (icon on top, label below), then the right action area. By default there are **up to three** `small` buttons (plain secondary, optional plain tertiary, solid primary). Use the **`#right` slot** to replace the entire right area when you need totals, text links, or other non-button content.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { OrderSelectBar } from 'vant';

const app = createApp();
app.use(OrderSelectBar);
```

## Usage

### Basic Usage

Bind select-all with `v-model`. By default the bar shows the built-in checkbox + label, Favorite and Share icons, and the right-hand buttons. Use the scoped **`#left`** slot to fully customize the left block (see Slots). For a third action button, set `show-tertiary-button` and `tertiary-button-text`, or use `#tertiary-button`.

```html
<van-order-select-bar
  v-model="checked"
  :collect-active="favorited"
  select-all-text="Select all"
  secondary-button-text="Save for later"
  primary-button-text="Checkout"
  @click-collect="favorited = !favorited"
  @click-share="onShare"
  @click-secondary="onSecondary"
  @click-primary="onPrimary"
/>
```

### Left slot (select all)

```html
<van-order-select-bar
  v-model="checked"
  secondary-button-text="Save for later"
  primary-button-text="Checkout"
  @click-secondary="onSecondary"
  @click-primary="onPrimary"
>
  <template #left="{ checked, disabled, indeterminate, updateChecked }">
    <van-checkbox
      :model-value="checked"
      :disabled="disabled"
      :indeterminate="indeterminate"
      @update:model-value="updateChecked"
    >
      Select all
    </van-checkbox>
  </template>
</van-order-select-bar>
```

### Top tip

Use the `top` slot for a message above the bar.

```html
<van-order-select-bar v-model="checked" primary-button-text="Checkout">
  <template #top>
    <span>Add ¥12 more for free shipping</span>
  </template>
</van-order-select-bar>
```

### Custom buttons

Use `secondary-button`, `tertiary-button`, and `primary-button` slots for full control (at most three buttons on the right).

```html
<van-order-select-bar v-model="checked">
  <template #secondary-button>
    <van-button size="small" plain type="primary">Secondary</van-button>
  </template>
  <template #tertiary-button>
    <van-button size="small" plain type="warning">Middle</van-button>
  </template>
  <template #primary-button>
    <van-button size="small" type="danger">Checkout</van-button>
  </template>
</van-order-select-bar>
```

### Right slot

The `#right` slot **fully replaces** the default secondary / tertiary / primary buttons. Use it for cart totals, checkout layouts, text links, or any custom right-side UI.

```html
<!-- Total + checkout button -->
<van-order-select-bar
  v-model="checked"
  select-all-text="Select all"
  :show-collect="false"
  :show-share="false"
>
  <template #top>
    <span>Add ¥12 more for free shipping</span>
  </template>
  <template #right>
    <div class="checkout-right">
      <div class="checkout-right__info">
        <span class="checkout-right__sub">3 items</span>
        <span class="checkout-right__total">Total ¥128.00</span>
      </div>
      <van-button size="small" type="primary" @click="onCheckout">
        Checkout
      </van-button>
    </div>
  </template>
</van-order-select-bar>

<!-- Text link (non-button) -->
<van-order-select-bar
  v-model="checked"
  :show-collect="false"
  :show-share="false"
>
  <template #right>
    <button type="button" class="add-more-link" @click="onAddMore">
      Add more
    </button>
  </template>
</van-order-select-bar>
```

> Note: `#right` is **mutually exclusive** with `secondary-button` / `primary-button` slots.

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Select-all checked | _boolean_ | `false` |
| select-all-text | Label next to the checkbox | _string_ | `全选` |
| secondary-button-text | Left secondary button text | _string_ | `次要操作` |
| tertiary-button-text | Middle button text (use with `show-tertiary-button`) | _string_ | - |
| primary-button-text | Right primary button text | _string_ | `结算` |
| secondary-button-type | Secondary button type, options as [Button](#/en-US/button#props) | _string_ | `default` |
| tertiary-button-type | Tertiary button type | _string_ | `default` |
| primary-button-type | Primary button type | _string_ | `primary` |
| show-secondary-button | Whether to show the secondary button | _boolean_ | `true` |
| show-tertiary-button | Whether to show the middle button (renders when `true` and `tertiary-button-text` is set) | _boolean_ | `false` |
| checkbox-disabled | Whether to disable the checkbox | _boolean_ | `false` |
| indeterminate | Indeterminate state, see [Checkbox](#/en-US/checkbox#props) | _boolean_ | `false` |
| secondary-disabled | Whether to disable the secondary button | _boolean_ | `false` |
| tertiary-disabled | Whether to disable the tertiary button | _boolean_ | `false` |
| primary-disabled | Whether to disable the primary button | _boolean_ | `false` |
| secondary-loading | Whether the secondary button is loading | _boolean_ | `false` |
| tertiary-loading | Whether the tertiary button is loading | _boolean_ | `false` |
| primary-loading | Whether the primary button is loading | _boolean_ | `false` |
| collect-text | Favorite label under the icon | _string_ | `收藏` |
| share-text | Share label under the icon | _string_ | `分享` |
| collect-icon | Icon when not collected, same as [Icon](#/en-US/icon#props) `name` | _string_ | `star-o` |
| collect-icon-active | Icon when collected | _string_ | `star` |
| collect-active | Highlight collected state | _boolean_ | `false` |
| share-icon | Share icon name | _string_ | `share-o` |
| show-collect | Whether to show the favorite icon action | _boolean_ | `true` |
| show-share | Whether to show the share icon action | _boolean_ | `true` |
| safe-area-inset-bottom | Whether to enable bottom [safe area](#/en-US/advanced-usage#di-bu-an-quan-qu-gua-pei) | _boolean_ | `true` |
| placeholder | Whether to generate a placeholder of the same height | _boolean_ | `false` |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| change | Emitted when select-all changes | _checked: boolean_ |
| click-collect | Emitted when the favorite icon area is clicked | - |
| click-share | Emitted when the share icon area is clicked | - |
| click-secondary | Emitted when the secondary button is clicked | - |
| click-tertiary | Emitted when the tertiary button is clicked | - |
| click-primary | Emitted when the primary button is clicked | - |

### Slots

| Name | Description |
| --- | --- |
| top | Fixed content at the very top (tip / notice) |
| left | Scoped slot for the whole left block: props `checked`, `disabled`, `indeterminate`, `updateChecked` |
| select-all | When `left` is not used, replaces the built-in checkbox + label (legacy) |
| collect | Custom favorite block |
| share | Custom share block |
| secondary-button | Custom secondary button (leftmost) |
| tertiary-button | Custom middle button |
| primary-button | Custom primary button (rightmost) |
| right | Custom entire right area (replaces default button group; non-button content allowed) |

### Types

The component exports the following type definitions:

```ts
import type { OrderSelectBarProps } from 'vant';
```

## Theme

### CSS Variables

| Name | Default | Description |
| --- | --- | --- |
| --van-order-select-bar-z-index | _100_ | - |
| --van-order-select-bar-background | _var(--van-background-2)_ | - |
| --van-order-select-bar-tip-padding | _var(--van-padding-xs) var(--van-padding-sm)_ | - |
| --van-order-select-bar-tip-font-size | _var(--van-font-size-sm)_ | - |
| --van-order-select-bar-tip-line-height | _1.5_ | - |
| --van-order-select-bar-tip-color | _var(--van-orange-dark)_ | - |
| --van-order-select-bar-tip-background | _var(--van-orange-light)_ | - |
| --van-order-select-bar-bar-padding | _14px 12px_ | Bar padding |
| --van-order-select-bar-bar-min-height | _50px_ | - |
| --van-order-select-bar-action-gap | _var(--van-padding-xs)_ | Gap between buttons (up to three) |
| --van-order-select-bar-icon-size | _22px_ | Favorite / share icon size |
| --van-order-select-bar-icon-text-font-size | _var(--van-font-size-xs)_ | Labels under icons |
| --van-order-select-bar-icon-text-color | _var(--van-text-color-2)_ | Default icon label color |
| --van-order-select-bar-icon-text-color-active | _var(--van-danger-color)_ | Collected highlight |
