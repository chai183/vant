# AdDialog广告弹窗

### 介绍

用于展示广告内容的简洁弹窗，支持组件调用和函数调用。

- 默认从上到下依次展示广告内容、是否再次提醒的选择框，以及关闭按钮
- image 支持传入单张图片地址，也支持传入图片数组
- 传入图片数组时，会自动渲染为轮播广告

### 引入

```js
import { createApp } from 'vue';
import { AdDialog } from 'vant';

const app = createApp();
app.use(AdDialog);
```

### 函数调用

```js
import {
  showAdDialog,
  closeAdDialog,
  setAdDialogDefaultOptions,
  resetAdDialogDefaultOptions,
} from 'vant';

showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
});
```

## 代码演示

### 基础使用

传递`image`设置广告图片，为数组时开启轮播，string时单张图片展示

#### 基础广告弹窗

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: '今日不再提醒',
});
```

#### 轮播广告弹窗

```js
showAdDialog({
  image: [
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  ],
  width: 311,
  height: 326,
  checkboxText: '今日不再提醒',
});
```

#### 组件用法

```html
<van-dialog
  v-model:show="show"
  v-model:checked="checked"
  image="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg"
  checkbox-text="今日不再提醒"
/>
```

### 关闭按钮位置

通过设置`closeIconPosition`设置关闭按钮的位置

默认是底部中间`bottom-center`(底部中间)，支持`top-right` `top-left` `bottom-left` `bottom-right`

也支持传递对象形式，类似于position中设置属性的位置，`top` `bottom` `left` `right`

#### 顶部右侧

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: '今日不再提醒',
  closeIconPosition: 'top-right',
});
```

#### 底部左侧

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: '今日不再提醒',
  closeIconPosition: 'bottom-left',
});
```

#### 自定义位置

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checkboxText: '今日不再提醒',
  closeIconPosition: {
    top: 0,
    right: 10,
  },
});
```

<!-- ### 内外模式

通过设置`closeIconMode`开启内部外部模式

默认`outside`(外部模式),`inside`(内部模式)

#### 外部模式

```js
showAdDialog({
  image: "https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg",
  checkboxText: "今日不再提醒",
  closeIconMode: "outside",
  closeIconPosition: "top-right",
});
```

#### 内部模式

```js
showAdDialog({
  image: "https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg",
  checkboxText: "今日不再提醒",
  closeIconMode: "inside",
  closeIconPosition: "top-right",
});
``` -->

### 回调函数

#### 回调函数展示

```js
showAdDialog({
  image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  checked: true,
  checkboxText: '今日不再提醒',
  onClickImage: () => (
    showToast('点击了广告图片');
  ),
  onClickCloseIcon: (checked) => {
    showToast('点击关闭按钮时勾选状态：${checked}');
  },
});
```

### 插槽使用

#### 关闭按钮插槽

通过插槽`close-icon`传递自定义的关闭按钮

```html
<van-ad-dialog
  v-model:show="show"
  v-model:checked="checked"
  image="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg"
  checkbox-text="今日不再提醒"
  close-icon-mode="inside"
  close-icon-position="top-right"
>
  <template #close-icon>
    <img
      src="https://fastly.jsdelivr.net/npm/@vant/assets/custom-icon-light.png"
      class="custom-ad-dialog-close-icon"
    />
  </template>
</van-ad-dialog>
```

### 自定义内容

```html
<van-ad-dialog
  v-model:show="show"
  v-model:checked="checked"
  width="320"
  checkbox-text="今日不再提醒"
  close-icon-mode="inside"
  close-icon-position="top-right"
  @click-image="onClickCustomContent"
>
  <div class="custom-ad-dialog-content">
    <img
      src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg"
      class="custom-ad-dialog-content__image"
    />
    <div class="custom-ad-dialog-content__body">
      <span class="custom-ad-dialog-content__tag">活动中进行中</span>
      <div class="custom-ad-dialog-content__title">限时福利专区</div>
      <div class="custom-ad-dialog-content__desc">
        点击广告内容可进入活动详情页
      </div>
    </div>
  </div>
</van-ad-dialog>
```

## API

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| showAdDialog | 展示广告弹窗 | `options: AdDialogOptions` | `ad-dialog 实例` |
| closeAdDialog | 关闭当前展示的广告弹窗 | `-` | `void` |
| setAdDialogDefaultOptions | 修改默认配置，影响所有的 'showAdDialog' 调用 | `options: AdDialogOptions` | `void` |
| resetAdDialogDefaultOptions | 重置默认配置，影响所有的 'showAdDialog' 调用 | `-` | `void` |

### AdDialogOptions

> 下面这一组参数，专对应 `showAdDialog(options)`。函数式参数统一使用 "camelCase" 命名。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| overlay | 是否显示遮罩层 | `boolean` | `true` |
| width | 广告区域宽度 | `number \| string` | `320px` |
| height | 广告区域高度 | `number \| string` | `-` |
| image | 图片路径，传数组时自动渲染为轮播广告 | `string \| string[]` | `-` |
| imageStyle | 图片自定义样式 | `CSSProperties` | `-` |
| imageClass | 图片自定义类名 | `string \| Array \| object` | `-` |
| swipeProps | 轮播配置，仅在 `image` 为多图时生效 | `AdDialogSwipeProps` | `-` |
| checked | 选择框初始勾选状态 | `boolean` | `false` |
| showCheckbox | 是否显示选择框 | `boolean` | `true` |
| checkboxText | 选择框文案 | `string` | `今日不再提醒` |
| checkboxDisabled | 是否禁用选择框 | `boolean` | `false` |
| closeIcon | 关闭图标名称或路径 | `string` | - |
| closeIconPosition | 关闭图标位置 | `AdDialogCloseIconPosition` | `bottom-center`(默认)`bottom-left` `bottom-right` `top-left` `top-right` ,支持对象`{top:'',left:'',bottom:'',right:''}` |
| closeOnClickOverlay | 是否点击遮罩层后关闭 | `boolean` | `false` |
| closeOnPoststate | 是否在页面回退时自动关闭 | `boolean` | `true` |
| destroyOnClose | 关闭时是否销毁内部节点 | `boolean` | `false` |
| className | 根节点自定义类名 | `string \| Array \| object` | `-` |
| style | 根节点自定义样式 | `CSSProperties` | `-` |

<!-- | closeIconMode       | 关闭图标放置模式，可选值为 `outside` `inside` | `AdDialogCloseIconMode`     | `outside`       | -->

### props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:show | 是否显示弹窗 | `boolean` | `'false'` |
| v-model:checked | 选择框当前勾选状态 | `boolean` | `'false'` |
| overlay | 是否显示遮罩层 | `boolean` | `'true'` |
| width | 广告区域宽度 | `number \| string` | `'320px'` |
| height | 广告图片高度 | `number \| string` | `-` |
| image | 图片路径，传数组时自动渲染为轮播广告 | `string \| string[]` | `-` |
| image-style | 图片自定义样式 | `CSSProperties` | `-` |
| image-class | 图片自定义类名 | `string \| Array \| object` | `-` |
| swipe-props | 轮播配置，仅在 `image` 为多图时生效 | `AdDialogSwipeProps` | `-` |
| show-checkbox | 是否显示选择框 | `boolean` | `'true'` |
| checkbox-text | 选择框文案 | `string` | `'今日不再提醒'` |
| checkbox-disabled | 是否禁用选择框 | `boolean` | `'false'` |
| close-icon | 关闭图标名称或图片路径 | `string` | - |
| close-icon-position | 关闭图标位置 | `AdDialogCloseIconPosition` | `'bottom-center'` |
| close-on-click-overlay | 是否点击遮罩层后关闭 | `boolean` | `'false'` |
| close-on-popstate | 是否在页面回退时自动关闭 | `boolean` | `'true'` |
| destroy-on-close | 关闭时是否销毁内部节点 | `boolean` | `'false'` |
| class-name | 自定义类名 | `string \| Array \| object` | `-` |

<!--                   | close-icon-mode                      | 关闭图标放置模式，可选值为 `outside` `inside` | `AdDialogCloseIconMode` | `'outside'` | -->

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| open | 打开时触发 | `-` |
| close | 弹窗关闭时触发 | `checked: boolean` |
| updateshow | 显示状态变化时触发 | `value: boolean` |
| update:checked | 选择框状态变化时触发 | `value: boolean` |
| clickimage | 点击图片或默认广告区域时触发 | `event: MouseEvent` |
| clickCloseIcon | 点击关闭按钮时触发 | `{checked: boolean, event: MouseEvent}` |

### Slots

| 名称       | 说明                        |
| ---------- | --------------------------- |
| default    | 替换默认图片 / 轮播渲染区域 |
| close-icon | 替换默认关闭图标            |

### 提示

- 函数式调用同时暴露 'showAdDialog'、'closeAdDialog'、'setAdDialogDefaultOptions'、'resetAdDialogDefaultOptions'
- image 支持字符串和字符串数组，数组时会自动渲染为轮播广告
- 组件调用时，可以直接传原生 class 和 'style'
- 函数调用时，可以通过 className 和 style 自定义弹窗根节点样式
- 当 close-icon 传图片地址，或使用 close-icon 插槽时，关闭按钮会按自定义内容原样展示，不再强制包裹默认白底圆形按钮

### 类型定义

```ts
import type {
  AdDialogProps,
  AdDialogOptions,
  AdDialogThemeVars,
  AdDialogSwipeProps,
  AdDialogCloseIconMode,
  AdDialogCloseIconPosition,
} from 'vant';
```
