# FieldSelectPopup `new`

### Intro

Form field with bottom popup for selection.

### Install

```js
import { createApp } from 'vue';
import { FieldSelectPopup, CellGroup } from 'vant';

const app = createApp();
app.use(FieldSelectPopup);
app.use(CellGroup);
```

## Usage

### Single + close

Choosing an option emits `update:modelValue` and closes the popup.

### Multi + confirm / cancel

In confirm mode, option taps only update `draftValue`. Sync `draftValue` from `modelValue` when opening (e.g. on `click-input`); on `confirm`, copy `draftValue` to `modelValue`; on `cancel`, restore and close.

### Grid

Set `layout="grid"` and `columns` for column count.

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Selected value: scalar for single, array for multi | _string \| number \| Array_ | `''` |
| v-model:show | Popup visibility; **omit to let the component manage**; use `v-model:show` for full control | _boolean_ | internal `false` |
| options | Option list | _FieldSelectPopupOption[]_ | `[]` |
| display-text | Override single-select `#input` text; **omit to derive from `modelValue` + `options[].text`** (multi uses Tag) | _string_ | - |
| placeholder | Text in `#input` when empty; same color as Field placeholder | _string_ | `请选择` |
| multiple | Multi-select | _boolean_ | `false` |
| toolbar | Header: `close` (title + close) or `confirm` (cancel + title + confirm; default for multi) | _'close' \| 'confirm'_ | `close` for single, `confirm` for multi |
| draft-value | Working selection in confirm mode | _(string \| number)[]_ | - |
| layout | List or grid | _'list' \| 'grid'_ | `'list'` |
| columns | Grid columns | _number_ | `3` |
| max-visible-tags | Multi-select: how many tags to show on one line before a `+N` tag | _number_ | `1` |
| title | Popup title | _string_ | - |
| cancel-text | Cancel button text | _string_ | `取消` |
| confirm-text | Confirm button text | _string_ | `确定` |
| teleport | Teleport target | _string_ | `body` |
| round | Round corners | _boolean_ | `true` |
| destroy-on-close | Destroy content when closed | _boolean_ | `true` |

Other attributes are passed to the inner [Field](/field), e.g. `label`, `name`, `placeholder`, `label-align`, `disabled`.

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| update:modelValue | Value changed | _value_ |
| update:show | Popup visibility changed | _show: boolean_ |
| update:draftValue | Draft multi value changed (confirm mode) | _value: (string \| number)[]_ |
| confirm | Confirm clicked | - |
| cancel | Cancel clicked | - |
| click-input | Input area clicked | _event: MouseEvent_ |

### Types

```ts
import type { FieldSelectPopupOption } from 'vant';
```

`FieldSelectPopupOption` is `{ text: string; value: string | number; disabled?: boolean }`.

### Theme Variables

How to use: [ConfigProvider](/config-provider).

| Name | Default | Description |
| --- | --- | --- |
| --van-field-select-popup-display-color | _var(--van-field-input-text-color, var(--van-text-color))_ | Value text color |
| --van-field-select-popup-display-placeholder-color | _var(--van-field-placeholder-text-color)_ | Placeholder color (same as Field) |
| --van-field-select-popup-display-font-size | _var(--van-field-font-size, var(--van-font-size-md))_ | Font size |
| --van-field-select-popup-header-height | _48px_ | Header height |
| --van-field-select-popup-title-font-size | _var(--van-font-size-lg)_ | Title font size |
| --van-field-select-popup-header-confirm-color | _var(--van-primary-color)_ | Confirm color |
| --van-field-select-popup-body-max-height | _60vh_ | Body max height |
| --van-field-select-popup-tile-active-color | _var(--van-primary-color)_ | Grid selected text color |
| --van-field-select-popup-tile-active-border-color | _var(--van-primary-color)_ | Grid selected border color |
