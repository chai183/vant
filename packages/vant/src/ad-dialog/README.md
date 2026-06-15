# AdDialog

### Intro

A simple ad dialog for displaying ad content. It supports both component usage and function calls.

- By default, it renders ad content, an optional reminder checkbox, and a close button from top to bottom
- `image` accepts either a single image URL or an array of image URLs
- When an image array is passed, it will be rendered as a carousel automatically

### Import

```js
import { createApp } from 'vue';
import { AdDialog } from 'vant';

const app = createApp();
app.use(AdDialog);
```

### Function Call

```js
import {
  showAdDialog,
  closeAdDialog,
  setAdDialogDefaultOptions,
  resetAdDialogDefaultOptions,
} from 'vant';

showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
});
```

## Examples

### Basic Usage

#### Basic Ad Dialog

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: 'Do not remind me today',
});
```

#### Carousel Ad Dialog

```js
showAdDialog({
  image: [
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  ],
  width: 320,
  checkboxText: 'Do not remind me today',
});
```

### Close Icon Position

#### Top Right

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: 'Do not remind me today',
  closeIconPosition: 'top-right',
});
```

#### Bottom Left

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: 'Do not remind me today',
  closeIconPosition: 'bottom-left',
});
```

#### Custom Position

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: 'Do not remind me today',
  closeIconPosition: {
    top: 8,
    right: 8,
  },
});
```

### Inside / Outside Mode

#### Outside Mode

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: 'Do not remind me today',
  closeIconMode: 'outside',
  closeIconPosition: 'top-right',
});
```

#### Inside Mode

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: 'Do not remind me today',
  closeIconMode: 'inside',
  closeIconPosition: 'top-right',
});
```

### Callbacks

#### Click Callback Demo

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checked: true,
  checkboxText: 'Do not remind me today',
  onClickImage: () => {
    showToast('Ad image clicked');
  },
  onClickCloseIcon: (checked) => {
    showToast(`Close icon clicked, checked: ${checked}`);
  },
});
```

### Slots

#### Close Icon Slot

```html
<van-ad-dialog
  v-model:show="show"
  v-model:checked="checked"
  image="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg"
  checkbox-text="Do not remind me today"
  close-icon-mode="inside"
  close-icon-position="top-right"
>
  <template #close-icon>
    <img
      src="https://fastly.jsdelivr.net/npm/@vant/assets/custom-icon-light.png"
      class="custom-ad-dialog-close-icon"
    />
  </template>
</van-ad-dialog>
```

### Component Usage

#### Basic Component Usage

```html
<van-ad-dialog
  v-model:show="show"
  v-model:checked="checked"
  :image="[
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  ]"
  checkbox-text="Do not remind me today"
/>
```

### Custom Content

#### Custom Ad Content

```html
<van-ad-dialog
  v-model:show="show"
  v-model:checked="checked"
  :width="320"
  checkbox-text="Do not remind me today"
  close-icon-mode="inside"
  close-icon-position="top-right"
  @click-image="onClickCustomContent"
>
  <div class="custom-ad-dialog-content">
    <img
      src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg"
      class="custom-ad-dialog-content__image"
    />
    <div class="custom-ad-dialog-content__body">
      <span class="custom-ad-dialog-content__tag">Event Live</span>
      <div class="custom-ad-dialog-content__title">Limited Offer Zone</div>
      <div class="custom-ad-dialog-content__desc">
        Click the ad content to view the activity details
      </div>
    </div>
  </div>
</van-ad-dialog>
```

## API

### Methods

| Name | Description | Parameters | Return Value |
| --- | --- | --- | --- |
| showAdDialog | Display the ad dialog | `options: AdDialogOptions` | ad-dialog instance |
| closeAdDialog | Close the currently displayed ad dialog | - | `void` |
| setAdDialogDefaultOptions | Modify the default configuration that affects all `showAdDialog` calls | `options: AdDialogOptions` | `void` |
| resetAdDialogDefaultOptions | Reset the default configuration that affects all `showAdDialog` calls | - | `void` |

### Function Call Options

> The table below is dedicated to `showAdDialog(options)`. Function-call options use **camelCase** naming.

| Option | Description | Type | Default |
| --- | --- | --- | --- |
| overlay | Whether to show the overlay | _boolean_ | `true` |
| width | Ad area width | _number \| string_ | `320px` |
| height | Ad image height | _number \| string_ | - |
| image | Image path. Pass an array to render a carousel ad automatically | _string \| string[]_ | - |
| imageStyle | Custom image style | _CSSProperties_ | - |
| imageClass | Custom image class name | _string \| Array \| object_ | - |
| swipeProps | Swipe config, only effective when `image` is a multi-image array | _AdDialogSwipeProps_ | - |
| checked | Initial checkbox state | _boolean_ | `false` |
| showCheckbox | Whether to show the checkbox | _boolean_ | `true` |
| checkboxText | Checkbox text | _string_ | `Do not remind me today` |
| checkboxDisabled | Whether to disable the checkbox | _boolean_ | `false` |
| closeIcon | Close icon name or image path | _string_ | `cross` |
| closeIconPosition | Close icon position, supports preset position or `{ top, right, bottom, left }` position object | _AdDialogCloseIconPosition_ | `bottom-center` |
| closeIconMode | Close icon placement mode, can be `outside` or `inside` | _AdDialogCloseIconMode_ | `outside` |
| closeOnClickOverlay | Whether to close on overlay click | _boolean_ | `false` |
| closeOnPopstate | Whether to close on browser back | _boolean_ | `true` |
| destroyOnClose | Whether to destroy the content on close | _boolean_ | `false` |
| className | Custom root class name | _string \| Array \| object_ | - |
| style | Custom root style | _CSSProperties_ | - |

### Function Call Callbacks

| Option | Description | Arguments |
| --- | --- | --- |
| onOpen | Triggered when the dialog is opened | - |
| onClose | Triggered when the dialog is closed | _checked: boolean_ |
| onClickImage | Triggered when the ad image or default ad area is clicked | _event: MouseEvent_ |
| onClickCloseIcon | Triggered when the close button is clicked | _checked: boolean, event: MouseEvent_ |
| onUpdate:checked | Triggered when the checkbox state changes | _value: boolean_ |

### Component Props

> The table below is dedicated to the `<van-ad-dialog />` component. Component attributes use **kebab-case** naming.

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model:show | Whether to show the dialog | _boolean_ | `false` |
| v-model:checked | Current checkbox state | _boolean_ | `false` |
| overlay | Whether to show the overlay | _boolean_ | `true` |
| width | Ad area width | _number \| string_ | `320px` |
| height | Ad image height | _number \| string_ | - |
| image | Image path. Pass an array to render a carousel ad automatically | _string \| string[]_ | - |
| image-style | Custom image style | _CSSProperties_ | - |
| image-class | Custom image class name | _string \| Array \| object_ | - |
| swipe-props | Swipe config, only effective when `image` is a multi-image array | _AdDialogSwipeProps_ | - |
| show-checkbox | Whether to show the checkbox | _boolean_ | `true` |
| checkbox-text | Checkbox text | _string_ | `Do not remind me today` |
| checkbox-disabled | Whether to disable the checkbox | _boolean_ | `false` |
| close-icon | Close icon name or image path | _string_ | `cross` |
| close-icon-position | Close icon position, supports preset position or `{ top, right, bottom, left }` position object | _AdDialogCloseIconPosition_ | `bottom-center` |
| close-icon-mode | Close icon placement mode, can be `outside` or `inside` | _AdDialogCloseIconMode_ | `outside` |
| close-on-click-overlay | Whether to close on overlay click | _boolean_ | `false` |
| close-on-popstate | Whether to close on browser back | _boolean_ | `true` |
| destroy-on-close | Whether to destroy the content on close | _boolean_ | `false` |
| class-name | Custom class name | _string \| Array \| object_ | - |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| open | Triggered when opened | - |
| close | Triggered when closed | _checked: boolean_ |
| update:show | Triggered when visibility changes | _value: boolean_ |
| update:checked | Triggered when checkbox state changes | _value: boolean_ |
| clickImage | Triggered when the image or custom ad area is clicked | _event: MouseEvent_ |
| clickCloseIcon | Triggered when the close button is clicked | _checked: boolean, event: MouseEvent_ |

### Slots

| Name       | Description                                         |
| ---------- | --------------------------------------------------- |
| default    | Replace the default image / carousel rendering area |
| close-icon | Replace the default close icon                      |

### Tips

- The function-call API exposes `showAdDialog`, `closeAdDialog`, `setAdDialogDefaultOptions`, and `resetAdDialogDefaultOptions`
- `image` supports both strings and string arrays, and image arrays are rendered as carousels automatically
- In component usage, you can still pass native `class` and `style` attributes
- In function calls, you can customize the popup root through `className` and `style`
- If `close-icon` is an image path or the `close-icon` slot is used, the close button keeps the custom visual directly instead of forcing the default white circular button style

### Types

```ts
import type {
  AdDialogProps,
  AdDialogOptions,
  AdDialogThemeVars,
  AdDialogSwipeProps,
  AdDialogCloseIconMode,
  AdDialogCloseIconPosition,
  AdDialogCloseIconPresetPosition,
  AdDialogCloseIconCustomPosition,
} from 'vant';
```
