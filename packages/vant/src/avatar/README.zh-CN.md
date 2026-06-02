# Avatar 头像

### 介绍

用于展示用户头像，支持预设占位图、文字头像与自定义图片，默认为圆形。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Avatar } from 'vant';

const app = createApp();
app.use(Avatar);
```

## 代码演示

### 基础用法

```html
<!-- 默认头像 -->
<van-avatar type="default" />
<!-- 文字头像 -->
<van-avatar type="text" text="张三丰" />
<!-- 群组/多人头像 -->
<van-avatar type="group" />
<!-- 头像-男 -->
<van-avatar type="male" />
<!-- 头像-女 -->
<van-avatar type="female" />
```

### 头像大小

提供 `large`、`medium`、`small`、`mini` 四种尺寸，对应约 **60px、44px、32px、20px**。

```html
<van-avatar type="default" size="large" />
<van-avatar type="default" size="medium" />
<van-avatar type="default" size="small" />
<van-avatar type="default" size="mini" />
```

### 自定义头像

通过 `src` 传入图片或 SVG 地址，可与 `size` 搭配使用。

```html
<van-avatar src="https://fastly.jsdelivr.net/npm/@vant/assets/logo.png" size="large" />
```

### 带徽标展示

结合 [Badge 徽标](#/zh-CN/badge) 使用。`van-badge` 包裹 `van-avatar` 时，徽标位置会相对默认略向圆内收一点。

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

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 头像类型，可选值为 `default` `text` `group` `male` `female` | _string_ | `default` |
| size | 尺寸，可选值为 `large` `medium` `small` `mini` | _string_ | `medium` |
| src | 自定义图片或 SVG 地址，设置后优先于 `type` 内置占位图 | _string_ | - |
| alt | 图片 `alt` 描述 | _string_ | - |
| text | 文字头像内容，最多展示 3 个字符 | _string_ | - |

### Slots

| 名称    | 说明           |
| ------- | -------------- |
| default | 完全自定义内容 |

### 类型定义

组件导出以下类型定义：

```ts
import type { AvatarProps } from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-avatar-large-size | _60px_ | - |
| --van-avatar-medium-size | _44px_ | - |
| --van-avatar-small-size | _32px_ | - |
| --van-avatar-mini-size | _20px_ | - |
| --van-avatar-background | _var(--van-gray-3)_ | 非文字头像时的背景 |
| --van-avatar-text-color | _var(--van-white)_ | 文字头像颜色 |
| --van-avatar-text-font-size | _18px_ | 文字头像字号 |
| --van-avatar-text-font-weight | _var(--van-font-bold)_ | 文字头像字重 |
| --van-avatar-text-background | _#ff8125_ | 文字头像底色 |
