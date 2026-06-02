# Avatar

### Intro

Displays a user avatar. Supports preset placeholders, text avatars, and custom images. The shape is circular by default.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Avatar } from 'vant';

const app = createApp();
app.use(Avatar);
```

## Usage

### Basic Usage

```html
<!-- Default -->
<van-avatar type="default" />
<!-- Text -->
<van-avatar type="text" text="A" />
<!-- Group -->
<van-avatar type="group" />
<!-- Male -->
<van-avatar type="male" />
<!-- Female -->
<van-avatar type="female" />
```

### Avatar Size

Four sizes: `large`, `medium`, `small`, `mini` — approximately **60px, 44px, 32px, 20px**.

```html
<van-avatar type="default" size="large" />
<van-avatar type="default" size="medium" />
<van-avatar type="default" size="small" />
<van-avatar type="default" size="mini" />
```

### Custom Image

Use the `src` prop for an image or SVG URL. It can be combined with `size`.

```html
<van-avatar src="https://fastly.jsdelivr.net/npm/@vant/assets/logo.png" size="large" />
```

### With Badge

Use with the [Badge](#/en-US/badge) component. When `van-badge` wraps `van-avatar`, the badge sits slightly closer to the center of the circle than the default.

```html
<van-badge content="5">
  <van-avatar type="text" text="V" />
</van-badge>
<van-badge dot>
  <van-avatar type="default" />
</van-badge>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| type | Avatar type, can be set to `default` `text` `group` `male` `female` | _string_ | `default` |
| size | Size, can be set to `large` `medium` `small` `mini` | _string_ | `medium` |
| src | Custom image or SVG URL; takes precedence over built-in `type` artwork | _string_ | - |
| alt | Image `alt` text | _string_ | - |
| text | Text avatar content, up to 3 characters | _string_ | - |

### Slots

| Name    | Description        |
| ------- | ------------------ |
| default | Fully custom inner |

### Types

The component exports the following type definitions:

```ts
import type { AvatarProps } from 'vant';
```

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-avatar-large-size | _60px_ | - |
| --van-avatar-medium-size | _44px_ | - |
| --van-avatar-small-size | _32px_ | - |
| --van-avatar-mini-size | _20px_ | - |
| --van-avatar-background | _var(--van-gray-3)_ | Background for non-text avatars |
| --van-avatar-text-color | _var(--van-white)_ | Text avatar color |
| --van-avatar-text-font-size | _18px_ | Text avatar font size |
| --van-avatar-text-font-weight | _var(--van-font-bold)_ | Text avatar font weight |
| --van-avatar-text-background | _#ff8125_ | Text avatar background |
