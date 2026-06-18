# Anchor

### Intro

Anchor component supports three business types: **back to top**, **catalog**, and **terms**. The default layout shows a back-top icon on the left and text on the right, both using `--van-primary-color`.

### Install

```js
import { createApp } from 'vue';
import { Anchor } from 'vant';

const app = createApp();
app.use(Anchor);
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| type | Anchor type: `back-top`, `catalog`, `terms` | _string_ | `back-top` |
| mode | Interaction mode: `fixed` or `auto` | _string_ | `fixed` |
| text | Custom text | _string_ | - |
| items | Catalog items | _AnchorItem[]_ | - |
| terms-target | Terms content selector | _string_ | - |
| screen-offset | Viewport height multiplier threshold | _number \| string_ | `2` |
| offset | Pixel threshold, overrides `screen-offset` | _number \| string_ | - |
| expand-delay | Auto expand delay in ms | _number \| string_ | `0` |
| target | Scroll container | _string \| HTMLElement_ | nearest scroll parent |
| right | Distance from right | _number \| string_ | `0` |
| bottom | Distance from bottom | _number \| string_ | `40` |
| teleport | Teleport target | _string \| Element_ | `body` |
| immediate | Scroll without animation | _boolean_ | `false` |
| z-index | z-index | _number \| string_ | `100` |

### Types

```ts
import type {
  AnchorProps,
  AnchorThemeVars,
  AnchorType,
  AnchorMode,
  AnchorItem,
} from 'vant';
```
