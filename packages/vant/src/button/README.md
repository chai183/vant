# Button

### Intro

Buttons are used to trigger an action, such as submitting a form.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Button } from 'vant';

const app = createApp();
app.use(Button);
```

## Usage

### Type

The Button type is `primary`, and the default type is `primary`. Buttons are round by default and this cannot be changed.

```html
<van-button>Primary</van-button> <van-button plain>Plain</van-button>
```

### Text Button

Use the `text-button` prop to render a text button that only displays the content inside `van-button__content`, without background or border.

```html
<van-button text-button>Text Button</van-button>
<van-button text-button size="normal">Text Button</van-button>
<van-button text-button size="small">Text Button</van-button>
<van-button text-button size="mini">Text Button</van-button>
```

Use with `plain` for plain text buttons; use with `text-secondary` to set text color to `#666`.

```html
<van-button plain text-button>Text Button</van-button>
<van-button plain text-button text-secondary>Secondary Text</van-button>
```

Icon and icon position are supported:

```html
<van-button icon="add-o" text-button>Text Button</van-button>
<van-button icon="add-o" icon-position="right" text-button
  >Text Button</van-button
>
```

### Size

Four sizes are supported: `large`, `normal`, `small`, and `mini`. The default size is `large`.

```html
<van-button>Primary</van-button>
<van-button size="normal">Primary</van-button>
<van-button size="small">Primary</van-button>
<van-button size="mini">Primary</van-button>
```

### Icon

Use the `icon` prop to set the button icon. It supports all icons from the Icon component or you can pass a custom icon URL.

```html
<van-button icon="add-o">Icon Style</van-button>
<van-button icon="add-o" size="normal">With Icon</van-button>
<van-button icon="add-o" size="small">With Icon</van-button>
<van-button icon="add-o" size="mini">With Icon</van-button>
```

### Disabled

Use the `disabled` prop to disable the button. In the disabled state, the button cannot be clicked.

```html
<van-button disabled>Primary Disabled</van-button>
<van-button icon="add-o" disabled>Icon Style</van-button>
<van-button plain disabled>Plain Disabled</van-button>
<van-button text-button disabled>Plain Disabled</van-button>
<van-button plain text-button disabled>Plain Disabled</van-button>
```

### Countdown

```html
<van-button size="normal" disabled>Countdown (3s)</van-button>
<van-button size="normal">Countdown Done</van-button>
<van-button size="normal"
  >Countdown Done Limit Limit Limit Limit Limit (3s)</van-button
>
```

### Custom Color

Customize the button color using the `color` prop.

```html
<van-button color="#FF8125">Pure</van-button>
<van-button plain color="#FF3333">Pure</van-button>
<van-button plain text-button color="#FF3333">Pure</van-button>
```

### Borderless

Use the `borderless` prop to hide the button border while keeping the background color.

```html
<van-button borderless>Borderless Primary</van-button>
<van-button borderless plain>Borderless Plain</van-button>
```

### Custom Size

Use the `height`, `radius`, `font-size`, `text-color`, `padding-left`, and `padding-right` props to customize the button height, border radius, font size, content text color, and horizontal padding.

```html
<van-button
  plain
  type="default"
  size="normal"
  :height="36"
  :radius="8"
  :font-size="12"
  text-color="var(--van-text-color-secondary)"
  :padding-left="12"
  :padding-right="12"
>
  Upload File
</van-button>
```

### Supplementary Button

When `size` is `large`, use the `extra` slot to add content below `van-button__content` as a sibling element. The total button height will not exceed the maximum height of the corresponding size; overflow content will be clipped.

```html
<van-button>
  Primary
  <template #extra>
    <div style="font-size: 12px; margin-top: 4px;">
      Auxiliary supplementary description text
    </div>
  </template>
</van-button>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| type | Can be set to `primary` | _string_ | `primary` |
| size | Can be set to `normal` `small` `mini` | _string_ | `large` |
| text | Text | _string_ | - |
| color | Color, support linear-gradient | _string_ | - |
| icon | Left Icon | _string_ | - |
| icon-prefix | Icon className prefix | _string_ | `van-icon` |
| icon-position | Icon position, can be set to `left` `right` | _string_ | `left` |
| tag | HTML Tag | _string_ | `button` |
| native-type | Native Type Attribute | _string_ | `button` |
| plain | Whether to be plain button | _boolean_ | `false` |
| borderless `new` | Whether to hide button border | _boolean_ | `false` |
| text-button `new` | Whether to be text button, only show content area | _boolean_ | `false` |
| text-secondary `new` | Whether to use secondary text color, use with `plain` and `text-button`, text color is `#666` | _boolean_ | `false` |
| block | Whether to set display block | _boolean_ | `false` |
| disabled | Whether to disable button | _boolean_ | `false` |
| loading | Whether to show loading status | _boolean_ | `false` |
| loading-text | Loading text | _string_ | - |
| loading-type | Loading type, can be set to `spinner` | _string_ | `circular` |
| loading-size | Loading icon size | _number \| string_ | `20px` |
| width `new` | Button width, default unit is `px` | _number \| string_ | - |
| height `new` | Button height, default unit is `px` | _number \| string_ | - |
| radius `new` | Button border radius, default unit is `px` | _number \| string_ | - |
| font-size `new` | Button font size, default unit is `px` | _number \| string_ | - |
| text-color `new` | Button content text color | _string_ | - |
| padding-left `new` | Button left padding, default unit is `px` | _number \| string_ | - |
| padding-right `new` | Button right padding, default unit is `px` | _number \| string_ | - |
| url | Link URL | _string_ | - |
| to | The target route should navigate to when clicked on, same as the [to prop](https://router.vuejs.org/api/interfaces/RouterLinkProps.html#Properties-to) of Vue Router | _string \| object_ | - |
| replace | If true, the navigation will not leave a history record | _boolean_ | `false` |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| click | Emitted when button is clicked and not disabled or loading | _event: MouseEvent_ |
| touchstart | Emitted when button is touched | _event: TouchEvent_ |

### Slots

| Name | Description |
| --- | --- |
| default | Default slot |
| icon | Custom icon |
| loading | Custom loading icon |
| extra `new` | Extra content, only works when `size` is `large`, rendered below `van-button__content`, total height will not exceed the button max height |

### Types

The component exports the following type definitions:

```ts
import type {
  ButtonType,
  ButtonSize,
  ButtonProps,
  ButtonNativeType,
  ButtonIconPosition,
} from 'vant';
```

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-button-mini-height | _24px_ | - |
| --van-button-mini-padding | _0 8px_ | - |
| --van-button-mini-font-size | _12px_ | - |
| --van-button-small-height | _28px_ | - |
| --van-button-small-padding | _0 16px_ | - |
| --van-button-small-icon-padding | _0 12px_ | - |
| --van-button-small-font-size | _14px_ | - |
| --van-button-normal-font-size | _16px_ | - |
| --van-button-normal-height | _40px_ | - |
| --van-button-normal-padding | _0 16px_ | - |
| --van-button-large-height | _48px_ | - |
| --van-button-large-font-size | _18px_ | - |
| --van-button-default-height | _40px_ | - |
| --van-button-default-line-height | _1.2_ | - |
| --van-button-default-font-size | _16px_ | - |
| --van-button-primary-color | _var(--van-white)_ | - |
| --van-button-primary-background | _var(--van-primary-color)_ | - |
| --van-button-primary-border-color | _var(--van-primary-color)_ | - |
| --van-button-border-width | _var(--van-border-width)_ | - |
| --van-button-round-radius | _var(--van-radius-max)_ | - |
| --van-button-plain-background | _var(--van-white)_ | - |
| --van-button-text-color | _var(--van-primary-color)_ | - |
| --van-button-text-plain-color | _var(--van-text-color)_ | - |
| --van-button-text-plain-secondary-color | _var(--van-text-color-secondary)_ | - |
| --van-button-text-active-color | _#e67421_ | - |
| --van-button-plain-active-color | _#e67421_ | - |
| --van-button-text-large-icon-margin | _9px_ | - |
| --van-button-text-normal-icon-margin | _5px_ | - |
| --van-button-text-small-icon-margin | _5px_ | - |
| --van-button-text-mini-icon-margin | _4px_ | - |
| --van-button-text-large-icon-size | _14px_ | - |
| --van-button-text-normal-icon-size | _14px_ | - |
| --van-button-text-small-icon-size | _14px_ | - |
| --van-button-text-mini-icon-size | _12px_ | - |
| --van-button-disabled-opacity | _0.4_ | - |
| --van-button-disabled-background | _#ffcda8_ | - |
| --van-button-text-disabled-color | _var(--van-button-disabled-background)_ | - |
| --van-button-text-plain-disabled-color | _var(--van-text-color-disabled)_ | - |
| --van-button-large-icon-size | _16px_ | - |
| --van-button-normal-icon-size | _14px_ | - |
| --van-button-small-icon-size | _12px_ | - |
| --van-button-mini-icon-size | _12px_ | - |
| --van-button-icon-size | _var(--van-button-large-icon-size)_ | - |
| --van-button-loading-icon-size | _20px_ | - |
