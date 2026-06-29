# Field

### Intro

Field component let users enter and edit text.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Field, CellGroup } from 'vant';

const app = createApp();
app.use(Field);
app.use(CellGroup);
```

## Usage

### Basic Usage

The value of field is bound with v-model. The default placeholder is `Please enter`, and can be customized via the `placeholder` prop.

```html
<van-cell-group inset>
  <van-field v-model="value" label="Label" />
  <van-field
    v-model="longLabelValue"
    label="MultiLineTitleTextInputLimitStateDisplay"
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value = ref('');
    const longLabelValue = ref('');
    return { value, longLabelValue };
  },
};
```

### Input Border

Set `input-border` to add a bordered style around the input area, commonly used in nested scenarios such as [RangeInput](#/en-US/range-input). When enabled, the Cell inner border is hidden.

```html
<van-cell-group inset>
  <van-field v-model="value" input-border />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value = ref('');
    return { value };
  },
};
```

### Custom Type

Use `type` prop to custom different type fields. For `money` type, see [FieldMoney](#/en-US/field-money).

```html
<van-cell-group inset>
  <van-form>
    <van-field v-model="text" label="Text" autocomplete="off" />
    <van-field v-model="phone" type="tel" label="Phone" />
    <van-field v-model="digit" type="digit" label="Digit" />
    <van-field v-model="number" type="number" label="Number" />
    <van-field v-model="money" type="money" label="Money" />
    <van-field
      v-model="moneyNoCurrency"
      type="money"
      label="Money (No Currency)"
      :show-money-currency="false"
    />
    <van-field
      v-model="password"
      type="password"
      label="Password"
      autocomplete="off"
    />
    <van-field
      v-model="account"
      type="account"
      label="Account"
      autocomplete="off"
    />
    <van-field
      v-model="idcard"
      type="idcard"
      label="ID Card"
      autocomplete="off"
    />
    <van-field v-model="ukey" type="ukey" label="UKey" autocomplete="off" />
    <van-field
      v-model="text"
      label-align="top"
      autosize
      label="Text"
      autocomplete="off"
    />
  </van-form>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const text = ref('');
    const phone = ref('');
    const digit = ref('');
    const number = ref('');
    const money = ref('');
    const moneyNoCurrency = ref('');
    const password = ref('');
    const account = ref('');
    const idcard = ref('');
    const ukey = ref('');

    return {
      text,
      phone,
      digit,
      number,
      money,
      moneyNoCurrency,
      password,
      account,
      idcard,
      ukey,
    };
  },
};
```

### Disabled

```html
<van-cell-group inset>
  <van-field label="Text" model-value="Input Readonly" readonly />
  <van-field label="Text" model-value="Input Disabled" disabled />
</van-cell-group>
```

### Readonly Ellipsis

In readonly mode, content is displayed via [TextEllipsis](#/en-US/text-ellipsis) by default. When `model-value` is an array, each item is shown in a single row using [Tag](#/en-US/tag); items that exceed the width are collapsed into a `+N` tag. Short content is shown in full. Set `value-separator` to join array items with a custom delimiter and display via TextEllipsis. Set `:readonly-ellipsis="false"` to fall back to the native readonly input (array values still use Tag, except when `value-separator` is set).

Overflow:

```html
<van-cell-group inset>
  <van-field
    label="Address"
    model-value="Room 1201, 12F, Zhangjiang Building, 88 Keyuan Road, Pudong, Shanghai"
    readonly
  />
  <van-field
    label="Tags"
    :model-value="['Design', 'Interaction', 'Frontend', 'QA', 'Product', 'Operations']"
    readonly
  />
  <van-field
    label="Separator"
    :model-value="['Design', 'Interaction', 'Frontend']"
    value-separator=";"
    readonly
  />
</van-cell-group>
```

No overflow:

```html
<van-cell-group inset>
  <van-field label="Address" model-value="Pudong, Shanghai" readonly />
  <van-field
    label="Tags"
    :model-value="['Design', 'Interaction', 'Frontend']"
    readonly
  />
</van-cell-group>
```

### Show Icon

Use `left-icon` and `right-icon` for icons on both sides. Set `clearable` to show a clear icon while typing. Set `show-right-icon-divider` to show a vertical divider to the left of the right icon. Customize the right icon color via `--van-field-right-icon-color` (default is `#666`). Use the `right-icon` slot for custom content such as units, action buttons, or a [Popover](#/en-US/popover) menu.

```html
<van-cell-group inset>
  <van-field
    v-model="value1"
    show-right-icon-divider
    label="Text"
    left-icon="smile-o"
    right-icon="warning-o"
    :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
  />
  <van-field v-model="value1" label="Text" left-icon="smile-o">
    <template #right-icon>
      <a>Unit</a>
    </template>
  </van-field>
  <van-field
    v-model="value1"
    show-right-icon-divider
    label="Text"
    left-icon="smile-o"
    :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
  >
    <template #right-icon>
      <a>Action Button</a>
    </template>
  </van-field>
  <van-field
    v-model="value2"
    show-right-icon-divider
    clearable
    label="Text"
    left-icon="music-o"
    :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
  >
    <template #right-icon>
      <div style="display: flex; align-items: center; gap: 8px">
        <a>Button</a>
        <van-icon name="scan" />
      </div>
    </template>
  </van-field>
  <van-field
    v-model="value3"
    show-right-icon-divider
    label="Text"
    left-icon="smile-o"
  >
    <template #right-icon>
      <van-popover
        v-model:show="showPopover"
        :actions="actions"
        reference-text
        placement="bottom-end"
        @select="onSelect"
        @click.stop
      />
    </template>
  </van-field>
</van-cell-group>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('123');
    const value3 = ref('');
    const showPopover = ref(false);
    const actions = [
      { text: 'Option 1' },
      { text: 'Option 2' },
      { text: 'Option 3' },
    ];
    const onSelect = (action) => showToast(action.text);

    return {
      value1,
      value2,
      value3,
      showPopover,
      actions,
      onSelect,
    };
  },
};
```

### Required

Use the `required` prop to display a required asterisk.

```html
<van-cell-group inset>
  <van-field v-model="username" required label="Username" />
  <van-field v-model="phone" required label="Phone" />
</van-cell-group>
```

Please note that the `required` prop is only used for controlling the style. For form validation, you need to use the `rule.required` option to control the validation logic.

### Auto Required

You can set `required="auto"` on the Form component, and all the fields inside the Form will automatically display the asterisk based on the `rule.required` option.

```html
<van-cell-group inset>
  <van-form required="auto">
    <van-field
      v-model="username"
      :rules="[{ required: true }]"
      label="Username"
    />
    <van-field v-model="phone" :rules="[{ required: false }]" label="Phone" />
  </van-form>
</van-cell-group>
```

### Error Info

Use `error` or `error-message` to show error info.

```html
<van-cell-group inset>
  <van-field v-model="username" error label="Username" />
  <van-field v-model="phone" label="Phone" error-message="Invalid phone" />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const username = ref('');
    const phone = ref('123');
    return { username, phone };
  },
};
```

### Insert Button

Use button slot to insert button.

```html
<van-cell-group inset>
  <van-field v-model="sms" center clearable label="SMS">
    <template #button>
      <van-button size="small" type="primary">Send SMS</van-button>
    </template>
  </van-field>
</van-cell-group>
```

### Format Value

Use `formatter` prop to format the input value.

```html
<van-cell-group inset>
  <van-field v-model="value1" label="Text" :formatter="formatter" />
  <van-field
    v-model="value2"
    label="Text"
    :formatter="formatter"
    format-trigger="onBlur"
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');
    const formatter = (value) => value.replace(/\d/g, '');

    return {
      value1,
      value2,
      formatter,
    };
  },
};
```

### Auto Resize

Textarea Field can be auto resize when has `autosize` prop.

```html
<van-cell-group inset>
  <van-field
    v-model="message"
    autosize
    rows="1"
    type="textarea"
    label="Message"
  />
</van-cell-group>
```

### Show Word Limit

After setting `maxlength` and `show-word-limit`, the word count is displayed at the bottom. When the input exceeds `maxlength`, a Toast with "Maximum length reached" is shown by default. Set `:show-maxlength-toast="false"` to disable the Toast.

```html
<van-cell-group inset>
  <van-field
    v-model="message"
    autosize
    show-word-limit
    rows="2"
    type="textarea"
    maxlength="5"
    label="Message"
  />
  <van-field
    v-model="messageWithoutToast"
    autosize
    show-word-limit
    rows="2"
    type="textarea"
    maxlength="5"
    :show-maxlength-toast="false"
    label="Disable Maxlength Toast"
  />
</van-cell-group>
```

### Input Align

Use `input-align` prop to align the input value.

```html
<van-cell-group inset>
  <van-field v-model="value" label="Text" input-align="right" />
</van-cell-group>
```

### Label Align

Use `label-align` prop to align the input value, can be set to `center`, `right` or `top`.

```html
<van-cell-group inset>
  <van-field v-model="value" label="Label" label-align="top" />
  <van-field v-model="value" label="Label" label-align="left" />
  <van-field v-model="value" label="Label" label-align="center" />
  <van-field v-model="value" label="Label" label-align="right" />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value = ref('');
    return { value };
  },
};
```

### Label Tooltip

When a label is set, you can show an info icon on the right of the label. Tapping it opens a Popover for extra hints.

- Use the `label-tooltip` prop for plain text.
- Use the `label-tooltip` slot for custom content (the slot takes precedence over the prop).
- Use `label-tooltip-popover-props` to pass [Popover](#/en-US/popover) props such as `placement` or `theme`. Built-in defaults are `placement="top"`, `theme="dark"`, and `icon-prefix` follows the Field's `icon-prefix`.

```html
<van-field label="Amount" label-tooltip="Maximum ¥50,000 per transfer" />
<van-field label="Note" placeholder="Text">
  <template #label-tooltip>
    <div>Custom content</div>
  </template>
</van-field>
```

### Label Comment

Use the `label-comment` prop or `label-comment` slot to show a note below the label. The content is passed through to Cell's `label` (the slot takes precedence over the prop).

```html
<van-field v-model="value" label="Text" label-comment="Note below the label" />
<van-field v-model="value" label="Text">
  <template #label-comment>
    <span>Slot: custom label note</span>
  </template>
</van-field>
```

### Comment & Bottom

Use the `input-comment` prop or `input-comment` slot to show helper text below the input area. Use the `bottom` slot to render content at the bottom of the full row, suitable for agreements, risk notes, etc.

```html
<van-cell-group inset>
  <van-field
    v-model="value4"
    label="Label"
    label-comment="Note below the label"
  />
  <van-field v-model="value5" label="Label">
    <template #label-comment>
      <span>Slot: custom label note</span>
    </template>
  </van-field>
  <van-field v-model="value1" label="Label" input-comment="Helper text" />
  <van-field v-model="value2" label="Label">
    <template #input-comment>
      <van-highlight
        tag="span"
        :source-string="'Slot: links or emphasized text'"
        :keywords="['links', 'emphasized']"
      />
      <van-tag currency currency-code="USD" />
    </template>
  </van-field>
  <van-field v-model="value3" label="Label">
    <template #bottom>
      <div class="van-gray-block" style="margin-top: 4px;">
        <van-highlight
          tag="span"
          :source-string="'The bottom slot spans the full row below the label and input — useful for agreements, risk notes, etc.'"
          :keywords="['agreements', 'risk notes']"
        />
      </div>
    </template>
  </van-field>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');
    const value3 = ref('');
    const value4 = ref('');
    const value5 = ref('');
    return { value1, value2, value3, value4, value5 };
  },
};
```

### Label Collapse

When `label-collapsible` is set with `label-align="top"`, a collapse/expand control appears next to the label. Use `v-model:label-expanded` to bind the expanded state. Combine with `label-action-text` or the `label-action` slot to show an action button on the right of the label row.

```html
<van-cell-group inset>
  <van-field
    v-model="value1"
    v-model:label-expanded="expanded"
    label="Title"
    label-align="top"
    label-collapsible
  />
  <van-field
    v-model="value2"
    label="With label-action"
    label-comment="Label note remains when collapsed"
    label-action-text="Add"
    label-align="top"
    label-collapsible
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('Sample content');
    const value2 = ref('');
    const expanded = ref(true);
    return { value1, value2, expanded };
  },
};
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Input value | _number \| string_ | - |
| label | Left side label | _string_ | - |
| name | As the identifier when submitting the form | _string_ | - |
| id | Input id, the for attribute of the label also will be set | _string_ | `van-field-n-input` |
| type | Input type, support all [native types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types) and `digit`, `money` types | _FieldType_ | `text` |
| size | Size, can be set to `large` `normal` | _string_ | - |
| maxlength | Max length of value | _number \| string_ | - |
| min `v4.9.5` | When the input type is `number`, `money` or `digit`, set the minimum allowable value | _number_ | - |
| max `v4.9.5` | When the input type is `number`, `money` or `digit`, set the maximum allowable value | _number_ | - |
| placeholder | Input placeholder | _string_ | `Please enter` |
| border | Whether to show inner border | _boolean_ | `true` |
| input-border `new` | Whether to add a bordered style around the input area, commonly used in nested scenarios such as RangeInput; hides the Cell inner border when enabled | _boolean_ | `false` |
| disabled | Whether to disable field | _boolean_ | `false` |
| readonly | Whether to be readonly | _boolean_ | `false` |
| value-separator `new` | Delimiter to join array `model-value` items; uses TextEllipsis instead of Tag when set | _string_ | - |
| colon | Whether to display colon after label | _boolean_ | `false` |
| required | Whether to show required mark | _boolean \| 'auto'_ | `null` |
| center | Whether to center content vertically | _boolean_ | `true` |
| clearable | Whether to be clearable | _boolean_ | `false` |
| clear-icon | Clear icon name | _string_ | `clear` |
| clear-trigger | When to display the clear icon, `always` means to display the icon when value is not empty, `focus` means to display the icon when input is focused | _FieldClearTrigger_ | `focus` |
| clickable | Whether to show click feedback when clicked | _boolean_ | `false` |
| is-link | Whether to show link icon | _boolean_ | `false` |
| autofocus | Whether to auto focus, unsupported in iOS | _boolean_ | `false` |
| show-word-limit | Whether to show word limit, need to set the `maxlength` prop | _boolean_ | `false` |
| show-maxlength-toast `new` | Whether to show a Toast when input exceeds `maxlength` | _boolean_ | `true` |
| error | Whether to mark the input content in red | _boolean_ | `false` |
| error-message | Error message | _string_ | - |
| error-message-align | Error message align, can be set to `center` `right` | _FieldTextAlign_ | `left` |
| formatter | Input value formatter | _(val: string) => string_ | - |
| format-trigger | When to format value, can be set to `onBlur` | _FieldFormatTrigger_ | `onChange` |
| arrow-direction | Can be set to `left` `up` `down` | _string_ | `right` |
| label-class | Label className | _string \| Array \| object_ | - |
| input-class `new` | Extra className on the native `input` / `textarea` (when using the `input` slot, applied to the wrapper) | _string \| Array \| object_ | - |
| input-style `new` | Extra style on the native `input` / `textarea` (when using the `input` slot, applied to the wrapper) | _string \| object_ | - |
| label-width | Label width | _number \| string_ | `6.2em` |
| label-align | Label align, can be set to `center` `right` `top` | _FieldTextAlign_ | `left` |
| label-tooltip `new` | Tooltip text next to the label (shown in Popover when the info icon is tapped); requires a label | _string_ | - |
| label-tooltip-popover-props `new` | Props passed through to the label Popover, see [Popover](#/en-US/popover) | _Partial\<PopoverProps\>_ | - |
| label-comment `new` | Note below the label, passed through to Cell's `label` | _string_ | - |
| input-align | Input align, can be set to `center` `right` | _FieldTextAlign_ | `left` |
| autosize | Textarea auto resize, can accept an object,<br>e.g. { maxHeight: 100, minHeight: 50 } | _boolean \| FieldAutosizeConfig_ | `false` |
| left-icon | Left side icon name | _string_ | - |
| right-icon | Right side icon name | _string_ | - |
| show-right-icon-divider `new` | Whether to show a vertical divider to the left of the right icon | _boolean_ | `false` |
| icon-prefix | Icon className prefix | _string_ | `van-icon` |
| rules | Form validation rules | _FieldRule[]_ | - |
| autocomplete | HTML native attribute, see [MDN - autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) | _string_ | - |
| autocapitalize `v4.6.2` | HTML native attribute, see [MDN - autocapitalize](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize)<br> | _string_ | - |
| enterkeyhint | HTML native attribute, see [MDN - enterkeyhint](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint)<br> | _FieldEnterKeyHint_ | - |
| spellcheck `v4.6.2` | HTML native attribute, see [MDN - spellcheck](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck)<br> | _boolean_ | - |
| autocorrect `v4.6.2` | HTML native attribute, Safari only, see [MDN - autocorrect](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#autocorrect)<br> | _string_ | - |
| inputmode `v4.9.9` | HTML native attribute, see [MDN - inputmode](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode) | _string_ | Set automatically according to the `type` prop |
| rows | HTML native attribute, the number of visible text lines for the control, only valid for textarea | _number \| string_ | - |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| update:model-value | Emitted when input value changed | _value: string_ |
| focus | Emitted when input is focused | _event: Event_ |
| blur | Emitted when input is blurred | _event: Event_ |
| clear | Emitted when the clear icon is clicked | _event: MouseEvent_ |
| click | Emitted when component is clicked | _event: MouseEvent_ |
| click-input | Emitted when the input is clicked | _event: MouseEvent_ |
| click-left-icon | Emitted when the left icon is clicked | _event: MouseEvent_ |
| click-right-icon | Emitted when the right icon is clicked | _event: MouseEvent_ |
| start-validate | Emitted when start validation | - |
| end-validate | Emitted when end validation | _{ status: string, message: string }_ |

### Methods

Use [ref](https://vuejs.org/guide/essentials/template-refs.html) to get Field instance and call instance methods.

| Name  | Description         | Attribute | Return value |
| ----- | ------------------- | --------- | ------------ |
| focus | Trigger input focus | -         | -            |
| blur  | Trigger input blur  | -         | -            |

### Types

The component exports the following type definitions:

```ts
import type {
  FieldType,
  FieldRule,
  FieldProps,
  FieldInstance,
  FieldTextAlign,
  FieldRuleMessage,
  FieldClearTrigger,
  FieldFormatTrigger,
  FieldRuleValidator,
  FieldRuleFormatter,
  FieldValidateError,
  FieldAutosizeConfig,
  FieldValidateTrigger,
  FieldValidationStatus,
} from 'vant';
```

`FieldInstance` is the type of component instance:

```ts
import { ref } from 'vue';
import type { FieldInstance } from 'vant';

const fieldRef = ref<FieldInstance>();

fieldRef.value?.focus();
```

### Slots

| Name | Description | SlotProps |
| --- | --- | --- |
| label | Custom label | - |
| label-comment `new` | Custom note below the label, passed through to Cell's `label`; takes precedence over the `label-comment` prop | - |
| input | Custom input | - |
| left-icon | Custom left icon | - |
| right-icon | Custom right icon | - |
| button | Insert button | - |
| error-message | Custom error message | _{ message: string }_ |
| extra | Custom content on the right | - |

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-field-label-width | _6.2em_ | - |
| --van-field-label-color | _var(--van-text-color)_ | - |
| --van-field-label-margin-right | _32px_ | - |
| --van-field-label-top-margin-bottom | _var(--van-padding-xs)_ | Bottom margin of top-aligned label |
| --van-field-input-text-color | _var(--van-text-color)_ | - |
| --van-field-input-error-text-color | _var(--van-danger-color)_ | - |
| --van-field-input-disabled-text-color | _var(--van-text-color-inverse)_ | - |
| --van-field-placeholder-text-color | _var(--van-text-color-disabled)_ | - |
| --van-field-cursor-color | _var(--van-primary-color)_ | Input caret color |
| --van-field-icon-size | _18px_ | - |
| --van-field-clear-icon-size | _18px_ | - |
| --van-field-clear-icon-color | _var(--van-gray-5)_ | - |
| --van-field-right-icon-color | _#666_ | - |
| --van-field-right-icon-divider-height | _14px_ | - |
| --van-field-right-icon-divider-color | _var(--van-border-color)_ | - |
| --van-field-error-message-color | _var(--van-danger-color)_ | - |
| --van-field-error-message-font-size | _12px_ | - |
| --van-field-bottom-margin-top | _8px_ | Top margin of the full-width bottom content |
| --van-field-input-comment-color | _#999_ | Input area helper text color |
| --van-field-label-comment-color | _var(--van-text-color-auxiliary)_ | Label comment text color |
| --van-field-text-area-min-height | _60px_ | - |
| --van-field-word-limit-color | _var(--van-gray-7)_ | - |
| --van-field-word-limit-font-size | _var(--van-font-size-sm)_ | - |
| --van-field-word-limit-line-height | _16px_ | - |
| --van-field-disabled-text-color | _var(--van-text-color-inverse)_ | - |
| --van-field-required-mark-color | _var(--van-red)_ | - |
