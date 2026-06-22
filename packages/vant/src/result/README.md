# Result `new`

### Intro

Used to display result states for business processing, transaction submission, and similar scenarios. Built-in styles cover waiting, failure, warning, and success states. Result icons use built-in graphics from [Icon](#/en-US/icon) (with rounded corners and styling). Use `size` to configure icon size and `status` to apply the corresponding color. Supports primary/secondary action buttons and content slots.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Result } from 'vant';

const app = createApp();
app.use(Result);
```

## Usage

### Waiting

The waiting state uses a horizontal button layout by default (secondary button on the left, primary button on the right). You can add amount, detail list, and other content via the default slot and `#footer` slot.

```html
<van-result
  status="waiting"
  title="Waiting"
  description="Remarks"
  main-button-text="Main Action"
  secondary-button-text="Secondary Action"
  @click-main-button="onMain"
  @click-secondary-button="onSecondary"
>
  <div class="result-demo__amount">
    <div class="result-demo__amount-value">15,000,000.00</div>
    <div class="result-demo__amount-caption">Amount in words</div>
  </div>
  <template #footer>
    <van-cell-group inset class="result-demo__cell-group">
      <van-cell title="Card Module 1" value="Card content goes here" />
      <van-cell title="Card Module 2" value="Card content goes here" />
    </van-cell-group>
  </template>
</van-result>
```

```css
.result-demo__cell-group {
  --van-cell-group-inset-padding: 0;
}

.result-demo__cell-group .van-cell__title {
  color: #666;
  width: 100px;
  flex: none;
}

.result-demo__cell-group .van-cell__value {
  text-align: left;
  color: #333;
}
```

### Failure

The failure state uses a vertical button layout by default (primary button on top).

```html
<van-result
  status="fail"
  title="Failed"
  description="Remarks"
  main-button-text="Main Action"
  secondary-button-text="Secondary Action"
/>
```

### Warning

The warning state uses a hybrid button layout by default: a full-width primary button on top and two secondary buttons side by side below.

```html
<van-result
  status="warning"
  title="Exception"
  description="Remarks"
  main-button-text="Main Action"
  secondary-button-text="Secondary 1"
  secondary-button-text2="Secondary 2"
/>
```

### Button Layout

Use `button-layout` to control button arrangement, which overrides the default layout for each `status`.

- `horizontal`: side by side, secondary on the left and primary on the right; multiple secondary buttons are placed to the left of the primary button in order.
- `vertical`: stacked, primary on top and secondary below.
- `hybrid`: full-width primary on top, all secondary buttons in a row below.

```html
<van-result
  status="success"
  title="Custom Layout"
  button-layout="hybrid"
  main-button-text="Main Action"
  secondary-button-text="Secondary 1"
  secondary-button-text2="Secondary 2"
/>
```

### Single Button Center

When `single-button-center` is enabled and only one button is provided, the button width is set to 50% and centered.

```html
<van-result
  status="fail"
  title="Failed"
  description="Remarks"
  single-button-center
  main-button-text="Main Action"
  @click-main-button="onMain"
/>
```

### Success

The success state usually hides buttons. You can add amount, detail list, and other content via the default slot and `#footer` slot. [Cell](#/en-US/cell) is recommended for footer details, using `title` and `value` for a left-right layout.

```html
<van-result status="success" title="Succeeded" description="Remarks">
  <div class="result-demo__amount">
    <div class="result-demo__amount-value">15,000,000.00</div>
    <div class="result-demo__amount-caption">Amount in words</div>
  </div>
  <template #footer>
    <van-cell-group inset class="result-demo__cell-group">
      <van-cell title="Card Module 1" value="Card content goes here" />
      <van-cell title="Card Module 2" value="Card content goes here" />
    </van-cell-group>
  </template>
</van-result>
```

```css
.result-demo__cell-group {
  --van-cell-group-inset-padding: 0;
}

.result-demo__cell-group .van-cell__title {
  color: #666;
  width: 100px;
  flex: none;
}

.result-demo__cell-group .van-cell__value {
  text-align: left;
  color: #333;
}
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| status | Result status | _'waiting' \| 'fail' \| 'warning' \| 'success'_ | `success` |
| title | Result title | _string_ | - |
| description | Remark description | _string_ | - |
| icon | Custom icon name; uses built-in icon by `status` when omitted | _string_ | - |
| size | Icon size, passed to [Icon](#/en-US/icon) `size` | _number \| string_ | `64` |
| button-layout | Button layout; uses default layout by `status` when omitted | _'horizontal' \| 'vertical' \| 'hybrid'_ | - |
| main-button-text | Primary button text | _string_ | - |
| secondary-button-text | First secondary button text | _string_ | - |
| secondary-button-text2 | Second secondary button text | _string_ | - |
| main-button-disabled | Whether to disable the primary button | _boolean_ | `false` |
| secondary-button-disabled | Whether to disable the first secondary button | _boolean_ | `false` |
| secondary-button-disabled2 | Whether to disable the second secondary button | _boolean_ | `false` |
| main-button-loading | Whether to show loading state on the primary button | _boolean_ | `false` |
| secondary-button-loading | Whether to show loading state on the first secondary button | _boolean_ | `false` |
| secondary-button-loading2 | Whether to show loading state on the second secondary button | _boolean_ | `false` |
| single-button-center `new` | When only one button is provided, whether to set its width to 50% and center it | _boolean_ | `false` |
| safe-area-inset-bottom | Whether to enable bottom safe area inset | _boolean_ | `true` |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| click-main-button | Emitted when the primary button is clicked | - |
| click-secondary-button | Emitted when the first secondary button is clicked | - |
| click-secondary-button2 | Emitted when the second secondary button is clicked | - |

### Slots

| Name | Description |
| --- | --- |
| default | Custom content below the icon and title |
| icon | Custom result icon |
| title | Custom title |
| description | Custom remark |
| main-button | Custom primary button |
| secondary-button | Custom first secondary button |
| secondary-button-2 | Custom second secondary button |
| footer | Bottom extension area, such as a detail list |

### Default Button Layout

| status | Default button-layout |
| --- | --- |
| waiting | horizontal |
| fail | vertical |
| warning | hybrid |
| success | vertical |

### Types

The component exports the following type definitions:

```ts
import type {
  ResultProps,
  ResultStatus,
  ResultButtonLayout,
  ResultThemeVars,
} from 'vant';
```

## Theming

### CSS Variables

The component provides the following CSS variables for custom styling. Please refer to [ConfigProvider component](#/en-US/config-provider).

The warning state color depends on the global variable `--van-warning-orange` (`#ffa710`), defined in base styles.

| Name | Default Value | Description |
| --- | --- | --- |
| --van-result-padding-top | _40px_ | Top padding |
| --van-result-padding-horizontal | _var(--van-padding-sm)_ | Horizontal padding (12px) |
| --van-result-title-font-size | _18px_ | Title font size |
| --van-result-title-line-height | _24px_ | Title line height |
| --van-result-title-margin-top | _var(--van-padding-md)_ | Title top margin |
| --van-result-content-margin-top | _var(--van-padding-lg)_ | Content top margin |
| --van-result-description-color | _var(--van-gray-10)_ | Description text color |
| --van-result-description-font-size | _var(--van-font-size-sm)_ | Description font size |
| --van-result-description-line-height | _var(--van-line-height-sm)_ | Description line height |
| --van-result-description-margin-top | _var(--van-padding-lg)_ | Description top margin |
| --van-result-actions-margin-top | _var(--van-padding-lg)_ | Actions top margin |
| --van-result-actions-gap | _var(--van-padding-xs)_ | Button gap |
| --van-result-single-button-width | _50%_ | Button width when a single button is centered |
| --van-result-footer-margin-top | _var(--van-padding-lg)_ | Footer top margin |
| --van-result-waiting-color | _var(--van-orange-dark)_ | Waiting icon and title color |
| --van-result-fail-color | _var(--van-danger-color)_ | Failure icon and title color |
| --van-result-warning-color | _var(--van-warning-orange)_ | Warning icon and title color |
| --van-result-success-color | _var(--van-success-color)_ | Success icon and title color |
| --van-result-main-button-color | _var(--van-orange-dark)_ | Primary button color |
| --van-result-secondary-button-color | _var(--van-text-color)_ | Secondary button text color |
| --van-result-secondary-button-border-color | _var(--van-gray-4)_ | Secondary button border color |
