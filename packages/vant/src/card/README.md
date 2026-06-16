# Card

### Introduction

Business information card with title, body, and footer sections. Supports text lists, collapsible content, footer actions, and image layouts.

> The legacy product card API (`thumb`, `price`, `num`, etc.) has been removed. Use the props below.

### Install

```js
import { createApp } from 'vue';
import { Card } from 'vant';

const app = createApp();
app.use(Card);
```

## Demo

```html
<van-card
  type="default"
  title="Title"
  subtitle="Subtitle"
  is-link
  :badge="8"
  @click-title="onClickTitle"
/>
```

See `README.zh-CN.md` for full API documentation.
