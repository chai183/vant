# BottomActionBar

### Intro

A fixed bottom action bar for agreements, filters, and button combinations. Pass multiple `van-button` components through the `#actions` slot. **The first button in the slot is displayed on the rightmost side**, with subsequent buttons arranged to the left. When `max-visible-actions` is set and the count is exceeded, overflow buttons collapse into a Popover menu on the left.

### Install

```js
import { createApp } from 'vue';
import { BottomActionBar } from 'vant';

const app = createApp();
app.use(BottomActionBar);
```

## Usage

### Single primary button

```html
<van-bottom-action-bar>
  <template #actions>
    <van-button block type="primary" @click="onConfirm">Confirm</van-button>
  </template>
</van-bottom-action-bar>
```

### Secondary + primary

Place the primary action first in `#actions`; it will appear on the right. The secondary `plain` button goes second and appears on the left.

```html
<van-bottom-action-bar>
  <template #actions>
    <van-button type="primary" @click="onConfirm">Confirm</van-button>
    <van-button plain type="primary" @click="onReset">Reset</van-button>
  </template>
</van-bottom-action-bar>
```

### Two / three secondary buttons

Multiple `plain` secondary buttons. Put the primary action first in `#actions`; it appears on the rightmost side.

```html
<!-- Two secondary buttons -->
<van-bottom-action-bar>
  <template #actions>
    <van-button plain type="primary" @click="onConfirm">Confirm</van-button>
    <van-button plain type="primary" @click="onTertiary">Secondary 2</van-button>
  </template>
</van-bottom-action-bar>

<!-- Three secondary buttons -->
<van-bottom-action-bar>
  <template #actions>
    <van-button plain type="primary" @click="onConfirm">Confirm</van-button>
    <van-button plain type="primary" @click="onExtra1">Option 1</van-button>
    <van-button plain type="primary" @click="onExtra2">Option 2</van-button>
  </template>
</van-bottom-action-bar>
```

### More + buttons

When `max-visible-actions` is set and `#actions` contains more buttons than the limit, a **More** trigger appears on the left. The **first N buttons in slot order** stay on the bar (the first child is always rightmost); the rest collapse into a vertical [Popover](#/en-US/popover) menu. Selecting an item triggers the corresponding `van-button` click handler and closes the popover.

```html
<van-bottom-action-bar
  :max-visible-actions="2"
  more-popover-placement="top-start"
  more-text="More"
>
  <template #actions>
    <van-button type="primary" @click="onConfirm">Confirm</van-button>
    <van-button plain type="primary" @click="onSecondary">Secondary</van-button>
    <van-button plain type="primary" @click="onExtra1">Option 1</van-button>
    <van-button plain type="primary" @click="onExtra2">Option 2</van-button>
  </template>
</van-bottom-action-bar>
```

Use `more-icon-position="left"` to place the arrow icon to the left of the label:

```html
<van-bottom-action-bar
  :max-visible-actions="2"
  more-icon-position="left"
  more-text="Icon on left"
>
  <template #actions>
    <van-button type="primary" @click="onApprove">Approve</van-button>
    <van-button plain type="primary" @click="onReject">Reject</van-button>
    <van-button plain type="primary" @click="onSendBack">Send back</van-button>
    <van-button plain type="primary" @click="onVeto">Veto</van-button>
  </template>
</van-bottom-action-bar>
```

### Custom overflow Popover trigger

Use the `#more-reference` slot to customize the overflow Popover trigger. The slot receives `{ expanded: boolean }` indicating whether the popover is open. Falls back to the built-in **More** trigger when omitted.

```html
<van-bottom-action-bar
  :max-visible-actions="3"
  :start-gap="16"
  more-popover-placement="top-start"
>
  <template #more-reference>
    <span>More</span>
  </template>
  <template #actions>
    <van-button plain @click="onApprove">Approve</van-button>
    <van-button plain @click="onReject">Reject</van-button>
    <van-button plain @click="onExtra2">Option 2</van-button>
    <van-button @click="onExtra1">Option 1</van-button>
  </template>
</van-bottom-action-bar>
```

### Custom more slot

Use the `#more` slot to fully customize the left area, e.g. a select-all checkbox. Combine with the `#top` slot to show the selected count. Use `start-gap` to adjust spacing between the left area and buttons.

```html
<van-bottom-action-bar :start-gap="67">
  <template #top>
    <div class="selected-count">
      Selected <strong>9,999</strong> items
      <span class="selected-amount">Total <strong>10,000,000,000</strong></span>
    </div>
  </template>
  <template #more>
    <van-checkbox-group v-model="selectAllItems" shape="square">
      <van-checkbox name="a">Select all</van-checkbox>
    </van-checkbox-group>
  </template>
  <template #actions>
    <van-button type="primary" @click="onApprove">Approve</van-button>
    <van-button plain type="primary" @click="onReject">Reject</van-button>
  </template>
</van-bottom-action-bar>
```

### Favorite & share

Use the `#more` slot for icon actions such as favorite and share.

```html
<van-bottom-action-bar :start-gap="34">
  <template #more>
    <div class="icons">
      <button type="button" @click="onToggleCollect">
        <van-icon :name="collected ? 'like' : 'like-o'" />
        <span>Favorite</span>
      </button>
      <button type="button" @click="onShare">
        <van-icon name="share-o" />
        <span>Share</span>
      </button>
    </div>
  </template>
  <template #actions>
    <van-button type="primary" @click="onConfirm">Confirm</van-button>
    <van-button plain type="primary" @click="onSecondary">Secondary</van-button>
  </template>
</van-bottom-action-bar>
```

### Agreement + action

Use [Highlight](#/en-US/highlight) inside checkboxes to emphasize agreement links.

```html
<van-bottom-action-bar>
  <template #top>
    <van-checkbox-group v-model="agreedItems" shape="square">
      <van-checkbox name="clause1">
        <van-highlight
          tag="span"
          source-string="I have read and agree to the terms above."
          keywords="terms above"
        />
      </van-checkbox>
      <van-checkbox name="clause2">
        <van-highlight
          tag="span"
          source-string="I agree to the Privacy Policy."
          keywords="Privacy Policy"
        />
      </van-checkbox>
    </van-checkbox-group>
  </template>
  <template #actions>
    <van-button block type="primary" @click="onAction">Action</van-button>
  </template>
</van-bottom-action-bar>
```

### Dropdown filter + buttons

Use `#top` for filter forms with [ProForm](#/en-US/pro-form); trigger `formRef.submit()` from the action buttons. Use `bar-padding` to adjust the button row padding.

```html
<van-bottom-action-bar bar-padding="12px 12px">
  <template #top>
    <van-pro-form
      v-model="model"
      ref="formRef"
      :columns="columns"
      :show-submit="false"
      @submit="onSubmit"
    />
  </template>
  <template #actions>
    <van-button type="primary" @click="formRef?.submit()">Confirm</van-button>
    <van-button plain type="primary" @click="onReset">Reset</van-button>
  </template>
</van-bottom-action-bar>
```

For a single full-width submit button:

```html
<van-bottom-action-bar bar-padding="12px 12px">
  <template #top>
    <van-pro-form
      v-model="model"
      ref="formRef"
      :columns="columns"
      :show-submit="false"
      @submit="onSubmit"
    />
  </template>
  <template #actions>
    <van-button block type="primary" @click="formRef?.submit()">Confirm</van-button>
  </template>
</van-bottom-action-bar>
```

### Text button

Use [Button](#/en-US/button) `text-button` in `#actions` for text-style actions. Because text buttons hide `::after`, add `van-hairline--left` on a wrapper element for dividers between buttons (all except the last).

Combine with `max-visible-actions` and customize the overflow trigger via `#more-reference`, e.g. an ellipsis icon:

```html
<van-bottom-action-bar
  bar-padding="13px 0"
  :start-gap="0"
  :max-visible-actions="4"
>
  <template #more-reference>
    <van-icon name="ellipsis" />
  </template>
  <template #actions>
    <div class="text-action van-hairline--left">
      <van-button size="small" text-button type="primary" @click="onConfirm">
        Confirm
      </van-button>
    </div>
    <div class="text-action van-hairline--left">
      <van-button size="small" text-button plain type="primary" @click="onSecondary">
        Confirm
      </van-button>
    </div>
    <van-button size="small" text-button plain type="primary" @click="onExtra">
      Confirm
    </van-button>
  </template>
</van-bottom-action-bar>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| start-gap | Gap between the left area and buttons | _number \| string_ | - |
| bar-padding `new` | Button row padding, maps to `--van-bottom-action-bar-bar-padding` | _number \| string_ | - |
| max-visible-actions | Max buttons on the bar (first N in `#actions` order, first child rightmost); overflow goes to Popover. Omit to show all buttons | _number \| string_ | - |
| more-text | Overflow **More** trigger label | _string_ | `更多操作` |
| more-icon | Icon when popover closed | _string_ | `arrow-double-left` |
| more-expanded-icon | Icon when popover open | _string_ | `arrow-double-right` |
| more-icon-position | Icon position relative to label, can be set to `left` `right` | _string_ | `right` |
| more-expanded | Overflow popover visibility, supports `v-model` | _boolean_ | `false` |
| more-popover-placement | Overflow popover placement | _string_ | `bottom-start` |
| more-theme | Overflow popover theme, can be set to `light` `dark` | _string_ | `light` |
| safe-area-inset-bottom | Enable bottom safe area | _boolean_ | `true` |
| placeholder | Render placeholder of same height | _boolean_ | `false` |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| click-more | Emitted when the overflow popover opens | - |
| update:more-expanded | Overflow popover visibility changed | _expanded: boolean_ |

### Slots

| Name | Description |
| --- | --- |
| top | Top tip / agreement area |
| default | Middle content (filters, etc.) |
| before | Left extension before buttons |
| more | Custom left area (e.g. select-all, favorite/share); can coexist with overflow Popover |
| more-reference `new` | Custom overflow Popover trigger; scope `{ expanded: boolean }`; defaults to built-in **More** |
| actions | Bottom buttons; pass multiple `van-button` |

### Types

```ts
import type { BottomActionBarProps } from 'vant';
```

## Theme

### CSS Variables

| Name | Default | Description |
| --- | --- | --- |
| --van-bottom-action-bar-z-index | _100_ | - |
| --van-bottom-action-bar-background | _var(--van-white)_ | Background |
| --van-bottom-action-bar-top-padding | _12px_ | Top area padding |
| --van-bottom-action-bar-top-background | _var(--van-white)_ | Top area background |
| --van-bottom-action-bar-top-font-size | _var(--van-font-size-sm)_ | Top area font size |
| --van-bottom-action-bar-top-line-height | _1.5_ | Top area line height |
| --van-bottom-action-bar-top-color | _var(--van-text-color-2)_ | Top area text color |
| --van-bottom-action-bar-bar-height | _64px_ | Button row height |
| --van-bottom-action-bar-bar-padding | _8px 12px_ | Button row padding |
| --van-bottom-action-bar-start-gap | _35px_ | Gap between left area and buttons |
| --van-bottom-action-bar-action-gap | _var(--van-padding-xs)_ | Gap between buttons |
| --van-bottom-action-bar-more-color | _var(--van-text-color)_ | More label color |
| --van-bottom-action-bar-more-font-size | _var(--van-font-size-lg)_ | More label font size |
| --van-bottom-action-bar-more-gap | _var(--van-padding-base)_ | Gap between more label and icon |
| --van-bottom-action-bar-more-icon-size | _14px_ | More arrow icon size |
