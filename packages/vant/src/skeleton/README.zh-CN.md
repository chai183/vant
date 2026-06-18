# Skeleton 骨架屏

### 介绍

用于在内容加载过程中展示一组占位图形。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import {
  Skeleton,
  SkeletonTitle,
  SkeletonImage,
  SkeletonAvatar,
  SkeletonParagraph,
} from 'vant';

const app = createApp();
app.use(Skeleton);
app.use(SkeletonTitle);
app.use(SkeletonImage);
app.use(SkeletonAvatar);
app.use(SkeletonParagraph);
```

## 代码演示

### 文本骨架屏

两行文本占位，撑满宽度并开启圆角风格。

```html
<van-skeleton round :row="2" :row-width="['100%', '100%']" />
```

### 宫格骨架屏

通过 `template-type="grid"` 快速配置宫格布局，一行最多展示四个等比例单元，每个单元包含 48px 圆形头像占位和 32px 宽的短条占位。可通过 `grid-count` 调整列数。

```html
<van-skeleton template-type="grid" />
```

也支持通过 `template` 插槽自定义宫格布局：

```html
<van-skeleton>
  <template #template>
    <div class="skeleton-grid">
      <div v-for="index in 4" :key="index" class="skeleton-grid__item">
        <van-skeleton-avatar :avatar-size="48" />
        <van-skeleton-paragraph round row-width="32px" />
      </div>
    </div>
  </template>
</van-skeleton>
```

### 段落骨架屏

四行段落占位，前三行撑满宽度，第四行占一半宽度。

```html
<van-skeleton round :row="4" :row-width="['100%', '100%', '100%', '50%']" />
```

### 单元格骨架屏

通过 `template-type="cell"` 快速配置单元格布局，包含顶部两行段落，以及圆形、圆角方形头像搭配文本的两组行布局。

```html
<van-skeleton template-type="cell" />
```

也支持通过 `template` 插槽组合段落与头像占位：

```html
<van-skeleton>
  <template #template>
    <div class="skeleton-cell">
      <van-skeleton-paragraph round row-width="33.33%" />
      <van-skeleton-paragraph round />
      <div class="skeleton-cell__row">
        <van-skeleton-avatar :avatar-size="48" />
        <div class="skeleton-cell__content">
          <van-skeleton-paragraph round />
          <van-skeleton-paragraph round row-width="50%" />
        </div>
      </div>
      <div class="skeleton-cell__row">
        <van-skeleton-avatar avatar-shape="square" :avatar-size="48" />
        <div class="skeleton-cell__content">
          <van-skeleton-paragraph round />
          <van-skeleton-paragraph round row-width="50%" />
        </div>
      </div>
    </div>
  </template>
</van-skeleton>
```

### 图文组合骨架屏

通过 `template-type="media"` 快速配置图文组合布局，左右两列排列，每列上方为撑满列宽的圆角方块占位（宽高比 172:164），以及下方两行文本占位。可通过 `media-count` 调整列数。

```html
<van-skeleton template-type="media" />
```

也支持通过 `template` 插槽自定义：

```html
<van-skeleton>
  <template #template>
    <div class="skeleton-media">
      <div v-for="index in 2" :key="index" class="skeleton-media__item">
        <van-skeleton-image image-shape="square" :show-icon="false" />
        <van-skeleton-paragraph round />
        <div class="skeleton-media__row">
          <van-skeleton-paragraph round row-width="80px" />
          <van-skeleton-paragraph round row-width="32px" />
        </div>
      </div>
    </div>
  </template>
</van-skeleton>
```

### 基础用法

通过 `title` 属性显示标题占位图，通过 `row` 属性配置占位段落行数。

```html
<van-skeleton title :row="3" />
```

### 显示头像

通过 `avatar` 属性显示头像占位图。

```html
<van-skeleton title avatar :row="3" />
```

### 展示子组件

将 `loading` 属性设置成 `false` 表示内容加载完成，此时会隐藏占位图，并显示 `Skeleton` 的子组件。

```html
<van-skeleton title avatar :row="3" :loading="loading">
  <div>实际内容</div>
</van-skeleton>
```

```js
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const loading = ref(true);

    onMounted(() => {
      loading.value = false;
    });

    return {
      loading,
    };
  },
};
```

### 自定义展示内容

通过 `template` 插槽完成自定义内容的展示。

```html
<van-skeleton>
  <template #template>
    <div :style="{ display: 'flex', width: '100%' }">
      <van-skeleton-image />
      <div :style="{ flex: 1, marginLeft: '16px' }">
        <van-skeleton-paragraph row-width="60%" />
        <van-skeleton-paragraph />
        <van-skeleton-paragraph />
        <van-skeleton-paragraph />
      </div>
    </div>
  </template>
</van-skeleton>
```

## API

### Skeleton Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| row | 段落占位图行数 | _number \| string_ | `0` |
| row-width | 段落占位图宽度，可传数组来设置每一行的宽度 | _number \| string \|<br>(number \| string)[]_ | `100%` |
| title | 是否显示标题占位图 | _boolean_ | `false` |
| avatar | 是否显示头像占位图 | _boolean_ | `false` |
| loading | 是否显示骨架屏，传 `false` 时会展示子组件内容 | _boolean_ | `true` |
| animate | 是否开启动画，开启后占位块在 `#FAFAFA` 与 `#EEEEEE` 间流光，并同步整体闪烁 | _boolean_ | `true` |
| round | 是否将标题和段落显示为圆角风格 | _boolean_ | `false` |
| title-width | 标题占位图宽度 | _number \| string_ | `40%` |
| avatar-size | 头像占位图大小 | _number \| string_ | `32px` |
| avatar-shape | 头像占位图形状，可选值为 `square` | _string_ | `round` |
| template-type | 预设模板类型，可选值为 `grid` `cell` `media` | _string_ | - |
| grid-count | 宫格模板列数 | _number \| string_ | `4` |
| media-count | 图文组合模板列数 | _number \| string_ | `2` |

### SkeletonParagraph Props

| 参数      | 说明                     | 类型      | 默认值  |
| --------- | ------------------------ | --------- | ------- |
| round     | 是否将段落显示为圆角风格 | _boolean_ | `false` |
| row-width | 段落占位图宽度           | _string_  | `100%`  |

### SkeletonTitle Props

| 参数        | 说明                     | 类型               | 默认值  |
| ----------- | ------------------------ | ------------------ | ------- |
| round       | 是否将标题显示为圆角风格 | _boolean_          | `false` |
| title-width | 标题占位图宽度           | _number \| string_ | `40%`   |

### SkeletonAvatar Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatar-size | 头像占位图大小 | _number \| string_ | `32px` |
| avatar-shape | 头像占位图形状，可选值为 `square` | _string_ | `round` |

### SkeletonImage Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| image-size | 图片占位图大小，可传入 `[width, height]` 数组 | _number \| string \| array_ | `96px` |
| image-shape | 图片占位图形状，可选值为 `round` | _string_ | `square` |
| show-icon | 是否显示图片图标 | _boolean_ | `true` |

### Skeleton Slots

| 名称     | 说明       |
| -------- | ---------- |
| default  | 骨架屏内容 |
| template | 自定义内容 |

### 类型定义

组件导出以下类型定义：

```ts
import type {
  SkeletonProps,
  SkeletonTemplateType,
  SkeletonImageProps,
  SkeletonTitleProps,
  SkeletonImageShape,
  SkeletonAvatarShape,
  SkeletonParagraphProps,
} from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-skeleton-paragraph-height | _16px_ | - |
| --van-skeleton-paragraph-background | _var(--van-skeleton-background-from)_ | - |
| --van-skeleton-paragraph-margin-top | _var(--van-padding-md)_ | - |
| --van-skeleton-title-width | _40%_ | - |
| --van-skeleton-avatar-size | _32px_ | - |
| --van-skeleton-avatar-background | _var(--van-skeleton-background-from)_ | - |
| --van-skeleton-duration | _1.2s_ | - |
| --van-skeleton-background-from | _#fafafa_ | - |
| --van-skeleton-background-to | _#eeeeee_ | - |
| --van-skeleton-padding-horizontal | _var(--van-padding-sm)_ | - |
| --van-skeleton-grid-avatar-size | _48px_ | - |
| --van-skeleton-grid-text-width | _32px_ | - |
| --van-skeleton-grid-gap | _var(--van-padding-xs)_ | - |
| --van-skeleton-cell-avatar-size | _48px_ | - |
| --van-skeleton-media-gap | _var(--van-padding-xs)_ | - |
| --van-skeleton-media-aspect-ratio | _172 / 164_ | - |
| --van-skeleton-media-row-left-width | _80px_ | - |
| --van-skeleton-media-row-right-width | _32px_ | - |
| --van-skeleton-image-size | _96px_ |
| --van-skeleton-image-radius | _24px_ | - |
