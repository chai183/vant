# Dialog

### Intro

A modal box pops up on the page, which is often used for message prompts, message confirmation, or to complete specific interactive operations in the current page. It supports two methods: component call and function call.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Dialog } from 'vant';

const app = createApp();
app.use(Dialog);
```

### Function Call

Vant provides some utility functions that can quickly evoke global `Dialog` components.

For example, calling the `showDialog` function will render a Dialog directly in the page.

```js
import { showDialog } from 'vant';

showDialog({ message: 'Alert' });
```

## Usage

### Alert dialog

Used to prompt for some messages, only including one confirm button by default.

```js
import { showDialog } from 'vant';

showDialog({
  title: 'Title',
  message: 'The code is written for people to see and can be run on a machine.',
}).then(() => {
  // on close
});

showDialog({
  message:
    'Life is far more than just spinning and being busy to the limit, and human experiences are much broader and richer than this.',
}).then(() => {
  // on close
});
```

### Confirm dialog

Used to confirm some messages, including a confirm button and a cancel button by default.

```js
import { showConfirmDialog } from 'vant';

showConfirmDialog({
  title: 'Title',
  message:
    'If the solution is ugly, then there must be a better solution, but it has not been discovered yet.',
})
  .then(() => {
    // on confirm
  })
  .catch(() => {
    // on cancel
  });
```

### Long confirm text and vertical footer

When `showCancelButton` is enabled and the confirm button text is longer than `confirmButtonVerticalThreshold` (default `5`), the footer automatically switches to a vertical layout.

```js
import { showConfirmDialog } from 'vant';

showConfirmDialog({
  title: 'Title',
  message:
    'If the solution is ugly, then there must be a better solution, but it has not been discovered yet.',
  confirmButtonText: 'Continue Action',
  confirmButtonVerticalThreshold: 5,
})
  .then(() => {
    // on confirm
  })
  .catch(() => {
    // on cancel
  });
```

### Three actions and vertical footer

When `showCancelButton` is enabled and the confirm button text is longer than `confirmButtonVerticalThreshold` (default `5`), or when `secondaryButtonText` is provided, the footer automatically switches to a vertical layout. In vertical layout, up to 3 buttons are supported: 2 action buttons and 1 cancel button, with the cancel button always rendered at the bottom. Each button text is displayed on a single line with at most `verticalButtonMaxTextLength` visible characters (default `15`).

```js
import { showConfirmDialog } from 'vant';

showConfirmDialog({
  title: 'Title',
  message:
    'If the solution is ugly, then there must be a better solution, but it has not been discovered yet.',
  confirmButtonText: 'Continue Action',
  secondaryButtonText: 'Review Details',
  confirmButtonVerticalThreshold: 5,
  verticalButtonMaxTextLength: 15,
})
  .then((action) => {
    if (action === 'secondary') {
      // on secondary action
      return;
    }

    // on confirm
  })
  .catch(() => {
    // on cancel
  });
```

### Round Button Style

Setting the `theme` option to `round-button` will display the Dialog with a rounded button style.

```js
import { showDialog } from 'vant';

showDialog({
  title: 'Title',
  message: 'The code is written for people to see and can be run on a machine.',
  theme: 'round-button',
}).then(() => {
  // on close
});

showDialog({
  message:
    'Life is far more than just spinning and being busy to the limit, and human experiences are much broader and richer than this.',
  theme: 'round-button',
}).then(() => {
  // on close
});
```

### Async Close

You can pass a callback function through the `beforeClose` option to perform specific operations before closing the Dialog.

```js
import { showConfirmDialog } from 'vant';

const beforeClose = (action) =>
  new Promise((resolve) => {
    setTimeout(() => {
      // action !== 'confirm'  Interception cancellation operation
      resolve(action === 'confirm');
    }, 1000);
  });

showConfirmDialog({
  title: 'Title',
  message:
    'If the solution is ugly, then there must be a better solution, but it has not been discovered yet.',
  beforeClose,
});
```

### Input Field

Use `inputConfig` to append a built-in input area below `message` while keeping both `title` and `message`. The input area is based on the `Field` component and supports short text, textarea, validation, and word count.

```js
import { showConfirmDialog } from 'vant';

showConfirmDialog({
  title: 'Title',
  message: 'Please enter your remark',
  inputConfig: {
    type: 'textarea',
    placeholder: 'Please enter your remark',
    maxlength: 100,
    showWordLimit: true,
    autosize: true,
    rules: [{ required: true, message: 'Please enter your remark' }],
  },
  callback(action, inputValue) {
    if (action === 'confirm') {
      console.log(inputValue);
    }
  },
});
```

```html
<van-dialog
  v-model:show="show"
  v-model:input-value="inputValue"
  title="Title"
  message="Please enter your name"
  :input-config="{
    placeholder: 'Please enter your name',
    rules: [{ required: true, message: 'Please enter your name' }],
  }"
  show-cancel-button
/>
```

### Use Dialog Component

If you need to embed components or other custom content within a Dialog, you can directly use the Dialog component and customize it using the default slot. Before using it, you need to register the component using `app.use` or other methods.

```html
<van-dialog v-model:show="show" title="Title" show-cancel-button>
  <img src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg" />
</van-dialog>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const show = ref(false);
    return { show };
  },
};
```

## API

### Methods

Vant exports following Dialog utility functions:

| Name | Description | Attribute | Return value |
| --- | --- | --- | --- | --- |
| showDialog | Display a message prompt dialog with a default confirm button | _options: DialogOptions_ | `Promise<DialogAction | undefined>` |
| showConfirmDialog | Display a message confirmation dialog with default confirm and cancel buttons | _options: DialogOptions_ | `Promise<DialogAction | undefined>` |
| closeDialog | Close the currently displayed dialog | - | `void` |
| setDialogDefaultOptions | Modify the default configuration that affects all `showDialog` calls | _options: DialogOptions_ | `void` |
| resetDialogDefaultOptions | Reset the default configuration that affects all `showDialog` calls | - | `void` |

### DialogOptions

When showCancelButton is enabled and the confirm button text is longer than confirmButtonVerticalThreshold (default 5), or when secondaryButtonText is provided, the footer automatically switches to a vertical layout. In vertical layout, up to 3 buttons are supported (2 action buttons + 1 cancel button), the cancel button is always rendered at the bottom, and each button text is displayed on a single line with at most verticalButtonMaxTextLength visible characters (default 15).

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| title | Title | _string_ | - |
| width | Dialog width | _number \| string_ | `320px` |
| message | Message | _string \| () => JSX.Element_ | - |
| messageAlign | Message text align, can be set to `left` `right` `justify` | _string_ | `center` |
| messageHighlightConfig | Highlight config for string message, invalid when `allowHtml` is enabled | _DialogMessageHighlightConfig_ | - |
| inputValue | Current value of the built-in input field, can be used with `onUpdate:inputValue` | _string_ | - |
| inputConfig | Built-in input config. It appends a `Field` input area while keeping `title` and `message` | _DialogInputConfig_ | - |
| theme | Theme style, can be set to `round-button` | _string_ | `default` |
| className | Custom className | _string \| Array \| object_ | - |
| callback | Callback when closing. When `inputConfig` is used, the second argument is the current input value | _(action?: string, inputValue?: string) => void_ | - |
| showConfirmButton | Whether to show confirm button | _boolean_ | `true` |
| showCancelButton | Whether to show cancel button | _boolean_ | `false` |
| cancelButtonText | Cancel button text | _string_ | `取消` |
| cancelButtonColor | Cancel button color | _string_ | `black` |
| cancelButtonDisabled | Whether to disable cancel button | _boolean_ | `false` |
| confirmButtonText | Confirm button text | _string_ | `我知道了` (alert) / `主要操作` (confirm) |
| confirmButtonColor | Confirm button color | _string_ | `#ee0a24` |
| confirmButtonDisabled | Whether to disable confirm button | _boolean_ | `false` |
| secondaryButtonText | Secondary action button text | _string_ | - |
| secondaryButtonColor | Secondary action button color | _string_ | `black` |
| secondaryButtonDisabled | Whether to disable secondary action button | _boolean_ | `false` |
| confirmButtonVerticalThreshold | Confirm text length threshold for switching to vertical footer when `showCancelButton` is enabled | _number \| string_ | `5` |
| verticalButtonMaxTextLength | Maximum visible characters for each button text in vertical footer | _number \| string_ | `15` |
| destroyOnClose `v4.9.18` | Whether to destroy content when closed | _boolean_ | `false` |
| overlay | Whether to show overlay | _boolean_ | `true` |
| overlayClass | Custom overlay class | _string \| Array \| object_ | - |
| overlayStyle | Custom overlay style | _object_ | - |
| closeOnPopstate | Whether to close when popstate | _boolean_ | `true` |
| closeOnClickOverlay | Whether to close when overlay is clicked | _boolean_ | `false` |
| lockScroll | Whether to lock body scroll | _boolean_ | `true` |
| allowHtml | Whether to allow HTML rendering in message | _boolean_ | `false` |
| beforeClose | Callback function before close. When `inputConfig` is used, the second argument is the current input value | _(action: string, inputValue?: string) => boolean \| Promise\<boolean\>_ | - |
| onUpdate:inputValue | Triggered when the built-in input value changes | _(value: string) => void_ | - |
| transition | Transition, equivalent to `name` prop of [transition](https://vuejs.org/api/built-in-components.html#transition) | _string_ | - |
| teleport | Specifies a target element where Dialog will be mounted | _string \| Element_ | `body` |
| keyboardEnabled | Whether to enable keyboard capabilities. When displaying the confirm and cancel buttons, the keyboard's `Enter` and `Esc` will call the `confirm` and `cancel` functions by default | _boolean_ | `true` |

When `message` is a string and `allowHtml` is `false`, you can configure highlighted keywords in the message through `messageHighlightConfig`. This config is adapted from the `Highlight` component and additionally supports `color` and `style`.

If you want to keep `message` and append an input area below it, use `inputConfig`. It directly reuses the input, validation, and word count capabilities from `Field`.

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model:show | Whether to show dialog | _boolean_ | - |
| title | Title | _string_ | - |
| width | Width | _number \| string_ | `320px` |
| message | Message | _string \| () => JSX.Element_ | - |
| message-align | Message align, can be set to `left` `right` `justify` | _string_ | `center` |
| message-highlight-config | Highlight config for string message, invalid when `allow-html` is enabled | _[DialogMessageHighlightConfig](#types)_ | - |
| v-model:input-value | Current value of the built-in input field | _string_ | - |
| input-config | Built-in input config that appends an input area while keeping `title` and `message` | _[DialogInputConfig](#types)_ | - |
| theme | Theme style, can be set to `round-button` | _string_ | `default` |
| show-confirm-button | Whether to show confirm button | _boolean_ | `true` |
| show-cancel-button | Whether to show cancel button | _boolean_ | `false` |
| cancel-button-text | Cancel button text | _string_ | `取消` |
| cancel-button-color | Cancel button color | _string_ | `black` |
| cancel-button-disabled | Whether to disable cancel button | _boolean_ | `false` |
| confirm-button-text | Confirm button text | _string_ | `我知道了` (alert) / `主要操作` (confirm) |
| confirm-button-color | Confirm button color | _string_ | `#ee0a24` |
| confirm-button-disabled | Whether to disable confirm button | _boolean_ | `false` |
| secondary-button-text | Secondary action button text | _string_ | - |
| secondary-button-color | Secondary action button color | _string_ | `black` |
| secondary-button-disabled | Whether to disable secondary action button | _boolean_ | `false` |
| confirm-button-vertical-threshold | Confirm text length threshold for switching to vertical footer when `showCancelButton` is enabled | _number \| string_ | `5` |
| vertical-button-max-text-length | Maximum visible characters for each button text in vertical footer | _number \| string_ | `15` |
| destroy-on-close `v4.9.18` | Whether to destroy content when closed | _boolean_ | `false` |
| z-index | Set the z-index to a fixed value | _number \| string_ | `2000+` |
| overlay | Whether to show overlay | _boolean_ | `true` |
| overlay-class | Custom overlay class | _string_ | - |
| overlay-style | Custom overlay style | _object_ | - |
| close-on-popstate | Whether to close when popstate | _boolean_ | `true` |
| close-on-click-overlay | Whether to close when overlay is clicked | _boolean_ | `false` |
| lazy-render | Whether to lazy render util appeared | _boolean_ | `true` |
| lock-scroll | Whether to lock background scroll | _boolean_ | `true` |
| allow-html | Whether to allow HTML rendering in message | _boolean_ | `false` |
| before-close | Callback function before close. When `inputConfig` is used, the second argument is the current input value | _(action: string, inputValue?: string) => boolean \| Promise\<boolean\>_ | - |
| transition | Transition, equivalent to `name` prop of [transition](https://vuejs.org/api/built-in-components.html#transition) | _string_ | - |
| teleport | Specifies a target element where Dialog will be mounted | _string \| Element_ | - |
| keyboard-enabled | Whether to enable keyboard capabilities. When displaying the confirm and cancel buttons, the keyboard's `Enter` and `Esc` will call the `confirm` and `cancel` functions by default | _boolean_ | `true` |

### Events

| Event | Description | Parameters |
| --- | --- | --- |
| confirm | Emitted when the confirm button is clicked | _inputValue?: string_ |
| secondary | Emitted when the secondary action button is clicked | _inputValue?: string_ |
| cancel | Emitted when the cancel button is clicked | _inputValue?: string_ |
| update:input-value | Emitted when the built-in input value changes | _value: string_ |
| open | Emitted when opening Dialog | - |
| close | Emitted when closing Dialog | - |
| opened | Emitted when Dialog is opened | - |
| closed | Emitted when Dialog is closed | - |

### Slots

| Name    | Description    |
| ------- | -------------- |
| default | Custom message |
| title   | Custom title   |
| footer  | Custom footer  |

### Types

The component exports the following type definitions:

```ts
import type {
  DialogProps,
  DialogAction,
  DialogTheme,
  DialogMessage,
  DialogOptions,
  DialogInputType,
  DialogInputConfig,
  DialogMessageAlign,
  DialogInputValidateTrigger,
  DialogMessageHighlightConfig,
} from 'vant';
```

```ts
import type { CSSProperties } from 'vue';
import type {
  FieldRule,
  FieldTextAlign,
  FieldClearTrigger,
  FieldFormatTrigger,
  FieldAutosizeConfig,
  FieldEnterKeyHint,
} from 'vant';

type DialogMessageHighlightConfig = {
  keywords: string | string[];
  color?: string;
  style?: CSSProperties;
  autoEscape?: boolean;
  caseSensitive?: boolean;
  highlightClass?: string;
  highlightTag?: keyof HTMLElementTagNameMap;
  unhighlightClass?: string;
  unhighlightTag?: keyof HTMLElementTagNameMap;
};

type DialogInputType = 'text' | 'textarea';
type DialogInputValidateTrigger = 'onBlur' | 'onChange' | 'onConfirm';

type DialogInputConfig = {
  type?: DialogInputType;
  defaultValue?: string;
  placeholder?: string;
  maxlength?: number | string;
  rows?: number | string;
  clearable?: boolean;
  clearIcon?: string;
  readonly?: boolean;
  disabled?: boolean;
  autofocus?: boolean;
  autosize?: boolean | FieldAutosizeConfig;
  rules?: FieldRule[];
  formatter?: (value: string) => string;
  inputAlign?: FieldTextAlign;
  enterkeyhint?: FieldEnterKeyHint;
  clearTrigger?: FieldClearTrigger;
  formatTrigger?: FieldFormatTrigger;
  showWordLimit?: boolean;
  error?: boolean;
  errorMessage?: string;
  validateTrigger?: DialogInputValidateTrigger | DialogInputValidateTrigger[];
};
```

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-dialog-width | _320px_ | - |
| --van-dialog-small-screen-width | _90%_ | - |
| --van-dialog-font-size | _var(--van-font-size-lg)_ | - |
| --van-dialog-transition | _var(--van-duration-base)_ | - |
| --van-dialog-radius | _16px_ | - |
| --van-dialog-background | _var(--van-background-2)_ | - |
| --van-dialog-header-font-weight | _var(--van-font-bold)_ | - |
| --van-dialog-header-line-height | _24px_ | - |
| --van-dialog-header-padding-top | _26px_ | - |
| --van-dialog-header-isolated-padding | _var(--van-padding-lg) 0_ | - |
| --van-dialog-message-padding | _var(--van-padding-lg)_ | - |
| --van-dialog-message-font-size | _var(--van-font-size-md)_ | - |
| --van-dialog-message-line-height | _var(--van-line-height-md)_ | - |
| --van-dialog-message-max-height | _60vh_ | - |
| --van-dialog-has-title-message-text-color | _var(--van-gray-7)_ | - |
| --van-dialog-has-title-message-padding-top | _var(--van-padding-xs)_ | - |
| --van-dialog-button-height | _48px_ | - |
| --van-dialog-round-button-height | _36px_ | - |
| --van-dialog-confirm-button-text-color | _var(--van-primary-color)_ | - |
