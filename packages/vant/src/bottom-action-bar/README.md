# BottomActionBar

### Intro

A fixed bottom action bar for agreements, filters, and button combinations. Top area for tips/agreements (white background, 12px padding), optional content slot, and a **64px** button row built with `van-button`. Button widths flex by default; pass `*-button-width` for fixed sizes.

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
<van-bottom-action-bar
  primary-button-text="Confirm"
  @click-primary="onConfirm"
/>
```

### Secondary + primary

```html
<van-bottom-action-bar
  secondary-button-text="Reset"
  primary-button-text="Confirm"
  @click-secondary="onReset"
  @click-primary="onConfirm"
/>
```

### Three buttons

```html
<van-bottom-action-bar
  secondary-button-text="Secondary"
  tertiary-button-text="Secondary 2"
  show-tertiary-button
  primary-button-text="Confirm"
/>
```

### More + buttons

Built-in **Popover** matching the first docs sample (`placement="bottom-start"`, vertical actions). Arrow points **down** when closed and **up** when open. Configure actions via `more-actions`, or `#more-panel` for custom content. For fixed bars near the bottom edge you may prefer `more-popover-placement="top-start"` so the menu stays fully visible.

```html
<van-bottom-action-bar
  v-model:more-expanded="moreExpanded"
  show-more
  more-text="More"
  :more-actions="[
    { text: 'Option 1', value: 'action1' },
    { text: 'Option 2', value: 'action2' },
    { text: 'Option 3', value: 'action3' },
  ]"
  secondary-button-text="Secondary"
  primary-button-text="Confirm"
  @select-more="onMoreAction"
/>
```

```js
const onMoreAction = (action) => {
  console.log(action.text);
  console.log(action.value);
};
```

### Custom more slot

Use the `#more` slot to fully customize the left area, e.g. a select-all checkbox. Combine with the `#top` slot to show the selected count.

```html
<van-bottom-action-bar
  secondary-button-text="Secondary"
  primary-button-text="Confirm"
>
  <template #top>
    <div class="demo-bottom-action-bar__selected-count">
      Selected <strong>9,999</strong> items<span
        class="demo-bottom-action-bar__selected-amount"
        >total amount <strong>10,000,000,000,000,000</strong></span
      >
    </div>
  </template>
  <template #more>
    <van-checkbox-group v-model="selectAllItems" shape="square">
      <van-checkbox name="a">Select all</van-checkbox>
    </van-checkbox-group>
  </template>
</van-bottom-action-bar>
```

```css
.demo-bottom-action-bar__selected-count {
  padding: 12px;
  font-size: var(--van-font-size-md);
  color: var(--van-text-color-auxiliary);
  border-bottom: 1px solid var(--van-border-color);
}

.demo-bottom-action-bar__selected-count strong {
  margin: 0 4px;
  font-size: var(--van-font-size-lg);
  font-weight: 400;
  line-height: var(--van-font-size-lg);
  color: var(--van-black);
}

.demo-bottom-action-bar__selected-amount {
  margin-left: var(--van-padding-md);
}
```

```js
import { ref } from 'vue';

const selectAllItems = ref([]);
```

### Favorite & share

Use the `#more` slot for icon actions such as favorite and share. When favorited, the icon switches to filled `star` and uses `--van-primary-color`. Use `start-gap` to adjust spacing between the left area and buttons.

```html
<van-bottom-action-bar
  :start-gap="32"
  secondary-button-text="Secondary"
  primary-button-text="Confirm"
>
  <template #more>
    <div class="demo-bottom-action-bar__icons">
      <button
        type="button"
        class="demo-bottom-action-bar__icon-item"
        :class="{ 'demo-bottom-action-bar__icon-item--active': collected }"
        @click="onToggleCollect"
      >
        <van-icon :name="collected ? 'star' : 'star-o'" />
        <span>Favorite</span>
      </button>
      <button
        type="button"
        class="demo-bottom-action-bar__icon-item"
        @click="onShare"
      >
        <van-icon name="share-o" />
        <span>Share</span>
      </button>
    </div>
  </template>
</van-bottom-action-bar>
```

```js
import { ref } from 'vue';

const collected = ref(false);

const onToggleCollect = () => {
  collected.value = !collected.value;
};

const onShare = () => {
  // share logic
};
```

```css
.demo-bottom-action-bar__icon-item--active {
  color: var(--van-primary-color);
}

.demo-bottom-action-bar__icon-item--active .van-icon {
  color: var(--van-primary-color);
}
```

### Agreement top slot

Use [Highlight](#/en-US/highlight) inside checkboxes to emphasize agreement links.

```html
<van-bottom-action-bar primary-button-text="Action" @click-primary="onAction">
  <template #top>
    <van-checkbox-group v-model="agreed" shape="square">
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
</van-bottom-action-bar>
```

### Custom actions slot

```html
<van-bottom-action-bar>
  <template #actions>
    <van-button round plain type="primary">Reset</van-button>
    <van-button round type="primary">Confirm</van-button>
  </template>
</van-bottom-action-bar>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| secondary-button-text | Secondary button text | _string_ | - |
| tertiary-button-text | Second secondary button text | _string_ | - |
| primary-button-text | Primary button text | _string_ | `确定` |
| secondary-button-type | Secondary button type | _string_ | `primary` |
| tertiary-button-type | Second secondary button type | _string_ | `primary` |
| primary-button-type | Primary button type | _string_ | `primary` |
| show-secondary-button | Show secondary button; auto when `secondary-button-text` is set if omitted | _boolean_ | - |
| show-tertiary-button | Show second secondary button | _boolean_ | `false` |
| show-primary-button | Show primary button | _boolean_ | `true` |
| secondary-button-width | Secondary button width | _number \| string_ | - |
| tertiary-button-width | Second secondary button width | _number \| string_ | - |
| primary-button-width | Primary button width | _number \| string_ | - |
| primary-block | Primary button fills the action area | _boolean_ | `false` |
| start-gap `new` | Gap between the left area and buttons | _number \| string_ | - |
| round | Round buttons | _boolean_ | `true` |
| more-text | More action label | _string_ | `更多操作` |
| more-icon | Icon when popover closed | _string_ | `arrow-down` |
| more-expanded-icon | Icon when popover open | _string_ | `arrow-up` |
| more-icon-position | Icon position relative to label, can be set to `left` `right` | _string_ | `right` |
| show-more | Show more action | _boolean_ | `false` |
| more-expandable | Use popover menu (`false`: plain link, only `click-more`) | _boolean_ | `true` |
| more-expanded | Popover visibility, supports `v-model` | _boolean_ | `false` |
| more-actions | Menu actions (same as `Popover` `actions`, supports `text` and `value`) | _PopoverAction[]_ | `[]` |
| more-popover-placement | Popover placement | _string_ | `bottom-start` |
| secondary-disabled | Disable secondary button | _boolean_ | `false` |
| tertiary-disabled | Disable second secondary button | _boolean_ | `false` |
| primary-disabled | Disable primary button | _boolean_ | `false` |
| secondary-loading | Secondary button loading | _boolean_ | `false` |
| tertiary-loading | Second secondary button loading | _boolean_ | `false` |
| primary-loading | Primary button loading | _boolean_ | `false` |
| safe-area-inset-bottom | Enable bottom safe area | _boolean_ | `true` |
| placeholder | Render placeholder of same height | _boolean_ | `false` |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| click-secondary | Emitted when secondary button is clicked | - |
| click-tertiary | Emitted when second secondary button is clicked | - |
| click-primary | Emitted when primary button is clicked | - |
| click-more | Emitted when the popover opens | - |
| update:more-expanded | Popover visibility changed | _expanded: boolean_ |
| select-more | Emitted when a popover action is chosen | _action: PopoverAction, index: number_ (`action` includes `text`, `value`) |

### Slots

| Name             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| top              | Top tip / agreement area                                |
| default          | Middle content (filters, etc.)                          |
| before           | Left extension before buttons                           |
| more             | Custom more action                                      |
| more-panel       | Custom popover body (overrides `more-actions` when set) |
| actions          | Fully custom button row                                 |
| secondary-button | Custom secondary button                                 |
| tertiary-button  | Custom second secondary button                          |
| primary-button   | Custom primary button                                   |

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
