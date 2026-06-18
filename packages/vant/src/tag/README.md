# Tag

### Intro

Used to mark keywords and summarize the main content.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Tag } from 'vant';

const app = createApp();
app.use(Tag);
```

## Usage

### Basic Usage

```html
<van-tag type="default">Tag</van-tag>
<van-tag type="success">Tag</van-tag>
<van-tag type="danger">Tag</van-tag>
<van-tag type="info">Tag</van-tag>
<van-tag icon="search">Tag</van-tag>
```

### Plain style

```html
<van-tag plain type="default">Tag</van-tag>
<van-tag plain type="success">Tag</van-tag>
```

### Mark style

```html
<van-tag mark type="default">Tag</van-tag>
<van-tag mark plain type="success">Tag</van-tag>
```

### Currency tag

```html
<van-tag currency icon="photo-o">USD</van-tag>
```

#### Preset currency (JSON list)

Full ISO 4217-style codes and Chinese labels live in **`currency-presets.json`** (with `defaultIcon` for the Vant Icon placeholder).

For flag SVGs, place files under `tag/assets/currency-flags/` and map code -> file URL in `tag/currency-flag-icons.ts`. Then use `currency` + `currency-code`; if the default slot is omitted, the preset label and icon are shown.

```html
<van-tag currency currency-code="USD" />
<van-tag currency currency-code="CNH" />
```

### Preset tags

```html
<van-tag preset="risk-high">High Risk</van-tag>
<van-tag preset="product-bill">Bill</van-tag>
```

### Stamp tag

64×64 stamp. Slot text: **up to 5 characters on one line**; **more than 5** wraps to two lines with **4 characters on the first line** and the rest on the second (no ellipsis). Common 6–7 character cases use smaller font sizes to fit the circle.

```html
<van-tag stamp-type="success">预约已通过</van-tag>
<van-tag stamp-type="success">预约审核已通过</van-tag>
<van-tag stamp-type="fail">已拒绝</van-tag>
<van-tag stamp-type="wait">待审核</van-tag>
<van-tag stamp-type="void">作废</van-tag>
```

`预约审核已通过` is a **7-character** example: it wraps as `预约审核` / `已通过`.

Without `stamp` slot: mask SVG is picked by layout — **single line** (`stamp-frame1.svg`, ≤5 chars) vs **two-line** (`stamp-frame2.svg`, >5 chars). Replace either file as needed.

### Closeable

```html
<van-tag :show="show" closeable type="default" @close="close"> Tag </van-tag>
```

### Round style

```html
<van-tag round type="default">Tag</van-tag>
```

### Custom Color

```html
<van-tag color="#7232dd">Tag</van-tag>
<van-tag color="#ffe1e1" text-color="#ad0000">Tag</van-tag>
<van-tag color="#7232dd" plain>Tag</van-tag>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| type | Can be `default` `primary` `success` `danger` `warning` `info`. Default tag only; ignored if `stamp-type` / `preset` / `currency` is set (`stamp-type` wins when both `type` and `stamp-type` are passed) | _string_ | `default` |
| size | Size, can be set to `large` `medium` | _string_ | - |
| color | Tag color; inline override in all modes | _string_ | - |
| show | Whether to show tag | _boolean_ | `true` |
| plain | Plain style with `type`; no `type` plain class when `stamp-type` is set; use with `color` / `text-color` for inline plain | _boolean_ | `false` |
| round | Whether to be round | _boolean_ | `false` |
| mark | Mark style; ignored when `stamp-type` is set | _boolean_ | `false` |
| icon | Left icon name; hidden when `stamp-type` is set | _string_ | - |
| currency | Currency style; ignores `type`; ignored when `stamp-type` is set | _boolean_ | `false` |
| currency-code | Preset code (see `currency-presets.json`), requires `currency`; preset label if default slot empty; ignored when `stamp-type` is set | _string_ | - |
| preset | Preset style name; ignores `type`; ignored when `stamp-type` is set | _string_ | - |
| stamp-type | `success` `fail` `wait` `void`; overrides `type` / `preset` / `currency`; default slot is stamp text (or `stamp` slot) | _string_ | - |
| text-color | Text color | _string_ | - |
| closeable | Whether to be closeable | _boolean_ | `false` |

### Slots

| Name | Description |
| --- | --- |
| default | Tag label; stamp text in stamp mode; preset label when `currency` + `currency-code` and slot empty |
| icon | Custom left icon |
| stamp | Custom stamp image |

### Events

| Event | Description                        | Arguments           |
| ----- | ---------------------------------- | ------------------- |
| close | Emitted when close icon is clicked | _event: MouseEvent_ |

### Types

```ts
import type {
  TagSize,
  TagType,
  TagPreset,
  TagStampType,
  TagProps,
  TagCurrencyCode,
} from 'vant';
```

## Theming

### CSS Variables

| Name                    | Default                    | Description |
| ----------------------- | -------------------------- | ----------- |
| --van-tag-height        | _20px_                     | -           |
| --van-tag-padding       | _4px_                      | -           |
| --van-tag-text-color    | _#ffffff_                  | -           |
| --van-tag-font-size     | _12px_                     | -           |
| --van-tag-radius        | _2px_                      | -           |
| --van-tag-mark-height   | _24px_                     | -           |
| --van-tag-mark-padding  | _4px 8px_                  | -           |
| --van-tag-mark-radius   | _0 8px 0 8px_              | -           |
| --van-tag-default-color | _var(--van-primary-color)_ | -           |
| --van-tag-success-color | _#2bcd79_                  | -           |
| --van-tag-danger-color  | _#ff3333_                  | -           |
| --van-tag-info-color    | _#999999_                  | -           |
