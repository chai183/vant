# Button 按钮

### 介绍

按钮用于触发一个操作，如提交表单。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Button } from 'vant';

const app = createApp();
app.use(Button);
```

## 代码演示

### 按钮类型

按钮类型为 `primary`，默认为 `primary`，样式默认为圆角且不可修改。

```html
<van-button>强按钮</van-button> <van-button plain>弱按钮</van-button>
```

### 文本按钮

通过 `text-button` 属性设置为文本按钮，仅展示 `van-button__content` 中的内容，无背景与边框。

```html
<van-button text-button>文本按钮</van-button>
<van-button text-button size="normal">文本按钮</van-button>
<van-button text-button size="small">文本按钮</van-button>
<van-button text-button size="mini">文本按钮</van-button>
```

配合 `plain` 使用弱文本按钮；配合 `text-secondary` 可将文字颜色设置为 `#666`。

```html
<van-button plain text-button>文本按钮</van-button>
<van-button plain text-button text-secondary>次要文本</van-button>
```

支持图标与图标位置：

```html
<van-button icon="add-o" text-button>文本按钮</van-button>
<van-button icon="add-o" icon-position="right" text-button>文本按钮</van-button>
```

### 按钮尺寸

支持 `large`、`normal`、`small`、`mini` 四种尺寸，默认为 `large`。

```html
<van-button>强按钮</van-button>
<van-button size="normal">强按钮</van-button>
<van-button size="small">强按钮</van-button>
<van-button size="mini">强按钮</van-button>
```

### 图标按钮

通过 `icon` 属性设置按钮图标，支持 Icon 组件里的所有图标，也可以传入图标 URL。

```html
<van-button icon="add-o">加图标样式</van-button>
<van-button icon="add-o" size="normal">加图标</van-button>
<van-button icon="add-o" size="small">加图标</van-button>
<van-button icon="add-o" size="mini">加图标</van-button>
```

### 禁用状态

通过 `disabled` 属性来禁用按钮，禁用状态下按钮不可点击。

```html
<van-button disabled>强按钮禁用态</van-button>
<van-button icon="add-o" disabled>加图标样式</van-button>
<van-button plain disabled>弱按钮禁用态</van-button>
<van-button text-button disabled>弱按钮禁用态</van-button>
<van-button plain text-button disabled>弱按钮禁用态</van-button>
```

### 倒计时

```html
<van-button size="normal" disabled>倒计时（3s）</van-button>
<van-button size="normal">倒计时完成</van-button>
<van-button size="normal">倒计时完成极限极限极限极限极限（3s）</van-button>
```

### 自定义颜色

通过 `color` 属性可以自定义按钮的颜色。

```html
<van-button color="#FF8125">单色按钮</van-button>
<van-button plain color="#FF3333">单色按钮</van-button>
<van-button plain text-button color="#FF3333">单色按钮</van-button>
```

### 无边框

通过 `borderless` 属性可以隐藏按钮边框，保留背景色。

```html
<van-button borderless>无边框强按钮</van-button>
<van-button borderless plain>无边框弱按钮</van-button>
```

### 自定义尺寸

通过 `height`、`radius`、`font-size`、`text-color`、`padding-left`、`padding-right` 属性可以自定义按钮的高度、圆角、字号、内容文字颜色和左右内边距。

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
  上传附件
</van-button>
```

### 补充说明按钮

当 `size` 为 `large` 时，可通过 `extra` 插槽在 `van-button__content` 下方添加附加内容，与 `van-button__content` 同级。按钮总高度不超过对应尺寸的最大高度，超出部分将被裁剪。

```html
<van-button>
  强按钮
  <template #extra>
    <div style="font-size: 12px; margin-top: 4px;">辅助补充说明文字信息</div>
  </template>
</van-button>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 类型，可选值为 `primary` | _string_ | `primary` |
| size | 尺寸，可选值为 `normal` `small` `mini` | _string_ | `large` |
| text | 按钮文字 | _string_ | - |
| color | 按钮颜色，支持传入 `linear-gradient` 渐变色 | _string_ | - |
| icon | 图标名称或图片链接，等同于 Icon 组件的 [name 属性](#/zh-CN/icon#props) | _string_ | - |
| icon-prefix | 图标类名前缀，等同于 Icon 组件的 [class-prefix 属性](#/zh-CN/icon#props) | _string_ | `van-icon` |
| icon-position | 图标展示位置，可选值为 `left` `right` | _string_ | `left` |
| tag | 按钮根节点的 HTML 标签 | _string_ | `button` |
| native-type | 原生 button 标签的 type 属性 | _string_ | `button` |
| block | 是否为块级元素 | _boolean_ | `false` |
| plain | 是否为朴素按钮 | _boolean_ | `false` |
| borderless `new` | 是否隐藏按钮边框 | _boolean_ | `false` |
| text-button `new` | 是否为文本按钮，仅展示内容区域 | _boolean_ | `false` |
| text-secondary `new` | 是否为次要文本色，需配合 `plain` 和 `text-button` 使用，文字颜色为 `#666` | _boolean_ | `false` |
| disabled | 是否禁用按钮 | _boolean_ | `false` |
| loading | 是否显示为加载状态 | _boolean_ | `false` |
| loading-text | 加载状态提示文字 | _string_ | - |
| loading-type | [加载图标类型](#/zh-CN/loading)，可选值为 `spinner` | _string_ | `circular` |
| loading-size | 加载图标大小，默认单位为 `px` | _number \| string_ | `20px` |
| width `new` | 按钮宽度，默认单位为 `px` | _number \| string_ | - |
| height `new` | 按钮高度，默认单位为 `px` | _number \| string_ | - |
| radius `new` | 按钮圆角，默认单位为 `px` | _number \| string_ | - |
| font-size `new` | 按钮字号，默认单位为 `px` | _number \| string_ | - |
| text-color `new` | 按钮内容文字颜色 | _string_ | - |
| padding-left `new` | 按钮左内边距，默认单位为 `px` | _number \| string_ | - |
| padding-right `new` | 按钮右内边距，默认单位为 `px` | _number \| string_ | - |
| url | 点击后跳转的链接地址 | _string_ | - |
| to | 点击后跳转的目标路由对象，等同于 Vue Router 的 [to 属性](https://router.vuejs.org/zh/api/interfaces/RouterLinkProps.html#Properties-to) | _string \| object_ | - |
| replace | 是否在跳转时替换当前页面历史 | _boolean_ | `false` |

### Events

| 事件名     | 说明                                     | 回调参数            |
| ---------- | ---------------------------------------- | ------------------- |
| click      | 点击按钮，且按钮状态不为加载或禁用时触发 | _event: MouseEvent_ |
| touchstart | 开始触摸按钮时触发                       | _event: TouchEvent_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 按钮内容 |
| icon | 自定义图标 |
| loading | 自定义加载图标 |
| extra `new` | 附加内容，仅 `size` 为 `large` 时生效，渲染在 `van-button__content` 下方，总高度不超过按钮最大高度 |

### 类型定义

组件导出以下类型定义：

```ts
import type {
  ButtonType,
  ButtonSize,
  ButtonProps,
  ButtonNativeType,
  ButtonIconPosition,
} from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
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
