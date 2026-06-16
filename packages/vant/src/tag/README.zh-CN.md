# Tag 标签

### 介绍

用于标记关键词和概括主要内容。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Tag } from 'vant';

const app = createApp();
app.use(Tag);
```

## 代码演示

### 基础用法

标签高度 20px，字号 12px，内边距 4px，圆角 2px。`type` 可选 `default`、`success`、`danger`、`info`，可通过 `icon` 属性或 `icon` 插槽在左侧展示图标。

```html
<van-tag type="default">标签</van-tag>
<van-tag type="success">标签</van-tag>
<van-tag type="danger">标签</van-tag>
<van-tag type="info">标签</van-tag>
<van-tag icon="search">标签</van-tag>
```

### 浅色标签

设置 `plain` 属性为浅色样式，文字与边框颜色与对应类型的实心背景色一致。

```html
<van-tag plain type="default">标签</van-tag>
<van-tag plain type="success">标签</van-tag>
<van-tag plain type="danger">标签</van-tag>
<van-tag plain type="info">标签</van-tag>
```

### 角标标签

设置 `mark` 为角标样式，高度 24px，圆角为 `0 8px 0 8px`。可与 `plain` 组合为浅色角标。

```html
<van-tag mark type="default">角标</van-tag>
<van-tag mark plain type="success">角标</van-tag>
```

### 币种标签

设置 `currency` 展示币种样式，底色 `#f5f5f5`，文字 `#333333`，配合左侧图标或币种预制使用。

```html
<van-tag currency icon="photo-o">USD</van-tag>
```

#### 币种预制（JSON 枚举）

全量 ISO 4217（及部分常用代码如 `CNH`）中文名与占位图标名维护在 **`tag/currency-presets.json`**：`currencies` 为 `{ code, labelZh }[]`，顶层 `defaultIcon` 为默认 Vant Icon（当前 `gold-coin-o`）。

后续补国旗 SVG 时：将文件放到 `tag/assets/currency-flags/`，并在 `tag/currency-flag-icons.ts` 建立 `code -> svg` 映射。业务通过 `currency` + `currency-code` 引用，**未写默认插槽**时自动展示中文全称与图标。

```html
<van-tag currency currency-code="USD" />
<van-tag currency currency-code="CNH" />
```

默认插槽存在时仍以插槽文案为准；`icon` 属性优先于预制里的图标。

```ts
import { getTagCurrencyPreset, TAG_CURRENCY_PRESET_LIST } from 'vant';
```

### 预制标签

通过 `preset` 使用理财风险、产品类型等预制样式，标签文案通过默认插槽传入。

```html
<van-tag preset="risk-high">中高风险</van-tag>
<van-tag preset="risk-medium">中风险</van-tag>
<van-tag preset="product-bill">票据</van-tag>
<van-tag preset="product-deposit">存款</van-tag>
```

`preset` 可选值：

| 分类 | 值 |
| --- | --- |
| 理财风险 | `risk-high` `risk-medium-high` `risk-medium` `risk-low` `risk-medium-low` `risk-new` `risk-selected` |
| 产品类型 | `product-bill` `product-finance` `product-deposit` `product-payroll` |

### 印章标签

通过 `stamp-type` 展示印章标签，尺寸 64×64px。默认插槽为印章内文案：**单行最多 5 字**；**超过 5 字**则分为两行，**第一行固定 4 字**、第二行接剩余文字（不省略）。业务常见 6～7 字场景通过字号梯度缩小以落在圆圈内。字体使用全局 `--van-chuangcuhei-font-family`（见基础样式）。

```html
<van-tag stamp-type="success">预约已通过</van-tag>
<van-tag stamp-type="success">预约审核已通过</van-tag>
<van-tag stamp-type="fail">已拒绝</van-tag>
<van-tag stamp-type="wait">待审核</van-tag>
<van-tag stamp-type="void">作废</van-tag>
```

其中 `预约审核已通过` 为 **7 字**示例，将自动换为两行：`预约审核` / `已通过`。

外框可通过 `stamp` 插槽自定义。

未使用 `stamp` 插槽时，外框按**是否换行**自动二选一蒙版资源（`currentColor`，与 `stamp-type` 颜色一致）：

- **单行**（字数 ≤ 5）：`tag/assets/stamp-frame1.svg`
- **两行**（字数 > 5）：`tag/assets/stamp-frame2.svg`

二者默认可为相同图形，按需替换为不同的外圈形态即可。

### 可关闭标签

添加 `closeable` 属性表示标签可关闭，关闭时触发 `close` 事件。

```html
<van-tag :show="show" closeable type="default" @close="close"> 标签 </van-tag>
```

### 圆角样式

通过 `round` 设置为圆角样式。

```html
<van-tag round type="default">标签</van-tag>
```

### 标签大小

通过 `size` 属性调整标签大小。

```html
<van-tag type="default">标签</van-tag>
<van-tag type="default" size="medium">标签</van-tag>
<van-tag type="default" size="large">标签</van-tag>
```

### 自定义颜色

通过 `color` 和 `text-color` 属性设置标签颜色。

```html
<van-tag color="#7232dd">标签</van-tag>
<van-tag color="#ffe1e1" text-color="#ad0000">标签</van-tag>
<van-tag color="#7232dd" plain>标签</van-tag>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 类型，可选值为 `default` `primary` `success` `danger` `warning` `info`。仅常规标签生效；有 `stamp-type` / `preset` / `currency` 时忽略（与 `stamp-type` 同传仍以印章为准） | _string_ | `default` |
| size | 大小，可选值为 `large` `medium` | _string_ | - |
| color | 标签颜色；各模式均可内联覆盖默认色 | _string_ | - |
| show | 是否展示标签 | _boolean_ | `true` |
| plain | 浅色样式，配合 `type` 使用。有 `stamp-type` 时不挂 `type` 浅色 class，可与 `color` / `text-color` 内联配合 | _boolean_ | `false` |
| round | 是否为圆角样式 | _boolean_ | `false` |
| mark | 角标样式；有 `stamp-type` 时无效 | _boolean_ | `false` |
| icon | 左侧图标，等同 Icon [name](#/zh-CN/icon#props)；有 `stamp-type` 时不展示 | _string_ | - |
| currency | 币种标签；为 true 时忽略 `type`；有 `stamp-type` 时无效 | _boolean_ | `false` |
| currency-code | 币种预制（见 `currency-presets.json`），需 `currency`；无默认插槽时用中文名；有 `stamp-type` 时无效 | _string_ | - |
| preset | 预制样式，见上文表格；忽略 `type`；有 `stamp-type` 时无效 | _string_ | - |
| stamp-type | 印章类型：`success` `fail` `wait` `void`。优先于 `type` / `preset` / `currency`；默认插槽为章内文案（可用 `stamp` 插槽自定义） | _string_ | - |
| text-color | 文本颜色，优先级高于 `color` | _string_ | - |
| closeable | 是否为可关闭标签 | _boolean_ | `false` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 标签正文；印章时为章内文案；`currency` + `currency-code` 且无内容时用预制中文名 |
| icon | 自定义左侧图标 |
| stamp | 自定义印章图片内容 |

### Events

| 事件名 | 说明           | 回调参数            |
| ------ | -------------- | ------------------- |
| close  | 关闭标签时触发 | _event: MouseEvent_ |

### 类型定义

组件导出以下类型定义：

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

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-tag-height | _20px_ | 标签高度 |
| --van-tag-padding | _4px_ | 内边距 |
| --van-tag-text-color | _#ffffff_ | 文字颜色 |
| --van-tag-font-size | _12px_ | 字号 |
| --van-tag-radius | _2px_ | 圆角 |
| --van-tag-mark-height | _24px_ | 角标高度 |
| --van-tag-mark-padding | _4px 8px_ | 角标内边距 |
| --van-tag-mark-radius | _0 8px 0 8px_ | 角标圆角 |
| --van-tag-default-color | _var(--van-primary-color)_ | default 背景色 |
| --van-tag-success-color | _#2bcd79_ | success 背景色 |
| --van-tag-danger-color | _#ff3333_ | danger 背景色 |
| --van-tag-info-color | _#999999_ | info 背景色 |
| --van-tag-plain-default-background | _#fff2e9_ | default 浅色背景 |
| --van-tag-plain-success-background | _#e9f9f1_ | success 浅色背景 |
| --van-tag-plain-danger-background | _#ffeaea_ | danger 浅色背景 |
| --van-tag-plain-info-background | _#f5f5f5_ | info 浅色背景 |
| --van-tag-currency-background | _#f5f5f5_ | 币种标签背景 |
| --van-tag-currency-text-color | _#333333_ | 币种标签文字 |
| --van-tag-stamp-size | _64px_ | 印章尺寸 |
| --van-tag-stamp-rotate | _-30deg_ | 印章外框与文案整体旋转角度（相对中心） |
