# OrderSelectBar 订单选择栏

### 介绍

用于购物车、批量操作等场景：顶部可展示一句提示或说明；底栏从左到右依次为 **内置全选（或用 `#left` 插槽完全自定义最左侧）**、**收藏 / 分享纵向图标**（图标在上、文案在下）、以及右侧操作区。右侧默认提供**最多三个** `small` 按钮（次要 `plain`、可选中间 `plain`、主要实心）；若需展示金额、文字链接等非按钮内容，请使用 **`#right` 插槽**整体替换右侧区域。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { OrderSelectBar } from 'vant';

const app = createApp();
app.use(OrderSelectBar);
```

## 代码演示

### 基础用法

使用 `v-model` 绑定全选状态；默认展示内置 Checkbox +「全选」文案，以及收藏、分享图标。需要完全自定义最左侧（如自行排版全选）时使用 **`#left` 作用域插槽**（参数见下表「Slots」）。右侧按钮配置同前。

```html
<van-order-select-bar
  v-model="checked"
  :collect-active="favorited"
  select-all-text="全选"
  secondary-button-text="移入收藏"
  primary-button-text="结算"
  @click-collect="favorited = !favorited"
  @click-share="onShare"
  @click-secondary="onSecondary"
  @click-primary="onPrimary"
/>
```

### 左侧插槽（全选）

使用 `#left` 接收 `checked`、`updateChecked` 等，自行组合 Checkbox 或其它内容；此时不再渲染内置全选 UI。

```html
<van-order-select-bar
  v-model="checked"
  secondary-button-text="移入收藏"
  primary-button-text="结算"
  @click-secondary="onSecondary"
  @click-primary="onPrimary"
>
  <template #left="{ checked, disabled, indeterminate, updateChecked }">
    <van-checkbox
      :model-value="checked"
      :disabled="disabled"
      :indeterminate="indeterminate"
      @update:model-value="updateChecked"
    >
      全选
    </van-checkbox>
  </template>
</van-order-select-bar>
```

### 顶部提示

将提示或活动说明放在最上方，使用 `top` 插槽。

```html
<van-order-select-bar v-model="checked" primary-button-text="结算">
  <template #top>
    <span>满 99 元包邮，还差 12 元</span>
  </template>
</van-order-select-bar>
```

### 自定义按钮

需要完全自定义按钮样式或行为时，可使用 `secondary-button`、`tertiary-button`、`primary-button` 插槽（右侧合计不超过三个按钮）。

```html
<van-order-select-bar v-model="checked">
  <template #secondary-button>
    <van-button size="small" plain type="primary">次要</van-button>
  </template>
  <template #tertiary-button>
    <van-button size="small" plain type="warning">中间</van-button>
  </template>
  <template #primary-button>
    <van-button size="small" type="danger">结算</van-button>
  </template>
</van-order-select-bar>
```

### 右侧插槽

使用 `#right` 可**完全自定义右侧整块区域**。传入该插槽后，组件**不再渲染**默认的次要 / 中间 / 主要按钮，适合购物车「已选件数 + 合计金额 + 结算」、或仅展示文字链接等场景。

```html
<!-- 金额 + 结算按钮 -->
<van-order-select-bar
  v-model="checked"
  select-all-text="全选"
  :show-collect="false"
  :show-share="false"
>
  <template #top>
    <span>满 99 元包邮，还差 12 元</span>
  </template>
  <template #right>
    <div class="checkout-right">
      <div class="checkout-right__info">
        <span class="checkout-right__sub">已选 3 件</span>
        <span class="checkout-right__total">合计 ¥128.00</span>
      </div>
      <van-button size="small" type="primary" @click="onCheckout">
        结算
      </van-button>
    </div>
  </template>
</van-order-select-bar>

<!-- 非按钮：文字链接 -->
<van-order-select-bar
  v-model="checked"
  :show-collect="false"
  :show-share="false"
>
  <template #right>
    <button type="button" class="add-more-link" @click="onAddMore">
      去凑单
    </button>
  </template>
</van-order-select-bar>
```

> 提示：`#right` 与 `secondary-button` / `primary-button` 等插槽**互斥**，请只选一种方式配置右侧。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 是否全选 | _boolean_ | `false` |
| select-all-text | 「全选」右侧文案 | _string_ | `全选` |
| secondary-button-text | 最左侧次要按钮文字 | _string_ | `次要操作` |
| tertiary-button-text | 中间按钮文字（需配合 `show-tertiary-button`） | _string_ | - |
| primary-button-text | 最右侧主要按钮文字 | _string_ | `结算` |
| secondary-button-type | 次要按钮类型，可选值见 [Button](#/zh-CN/button#props) | _string_ | `default` |
| tertiary-button-type | 中间按钮类型 | _string_ | `default` |
| primary-button-type | 主要按钮类型 | _string_ | `primary` |
| show-secondary-button | 是否展示次要按钮 | _boolean_ | `true` |
| show-tertiary-button | 是否展示中间按钮（为 `true` 且配置了 `tertiary-button-text` 时渲染） | _boolean_ | `false` |
| checkbox-disabled | 是否禁用多选框 | _boolean_ | `false` |
| indeterminate | 是否为半选状态，见 [Checkbox](#/zh-CN/checkbox#props) | _boolean_ | `false` |
| secondary-disabled | 是否禁用次要按钮 | _boolean_ | `false` |
| tertiary-disabled | 是否禁用中间按钮 | _boolean_ | `false` |
| primary-disabled | 是否禁用主要按钮 | _boolean_ | `false` |
| secondary-loading | 次要按钮是否加载中 | _boolean_ | `false` |
| tertiary-loading | 中间按钮是否加载中 | _boolean_ | `false` |
| primary-loading | 主要按钮是否加载中 | _boolean_ | `false` |
| collect-text | 收藏图标下文案 | _string_ | `收藏` |
| share-text | 分享图标下文案 | _string_ | `分享` |
| collect-icon | 未收藏时图标名，同 [Icon](#/zh-CN/icon#props) `name` | _string_ | `star-o` |
| collect-icon-active | 已收藏时图标名 | _string_ | `star` |
| collect-active | 是否高亮收藏（已收藏） | _boolean_ | `false` |
| share-icon | 分享图标名 | _string_ | `share-o` |
| show-collect | 是否展示收藏图标入口 | _boolean_ | `true` |
| show-share | 是否展示分享图标入口 | _boolean_ | `true` |
| safe-area-inset-bottom | 是否开启[底部安全区适配](#/zh-CN/advanced-usage#di-bu-an-quan-qu-gua-pei) | _boolean_ | `true` |
| placeholder | 是否在标签位置生成一个等高的占位元素 | _boolean_ | `false` |

### Events

| 事件名          | 说明               | 回调参数           |
| --------------- | ------------------ | ------------------ |
| change          | 全选状态变化时触发 | _checked: boolean_ |
| click-collect   | 点击收藏区域时触发 | -                  |
| click-share     | 点击分享区域时触发 | -                  |
| click-secondary | 点击次要按钮时触发 | -                  |
| click-tertiary  | 点击中间按钮时触发 | -                  |
| click-primary   | 点击主要按钮时触发 | -                  |

### Slots

| 名称 | 说明 |
| --- | --- |
| top | 固定在组件最上方的提示或说明 |
| left | 自定义最左侧整块区域（如全选）；作用域参数：`checked`（当前是否全选）、`disabled`（是否禁用）、`indeterminate`（半选）、`updateChecked`（`(v: boolean) => void`，与 `v-model` 同步） |
| select-all | 未使用 `left` 时，替换内置 Checkbox + 文案区域（兼容旧用法） |
| collect | 自定义收藏区域 |
| share | 自定义分享区域 |
| secondary-button | 自定义次要按钮（最左） |
| tertiary-button | 自定义中间按钮 |
| primary-button | 自定义主要按钮（最右） |
| right | 自定义右侧整块区域（传入后替代默认按钮组，可放非按钮内容） |

### 类型定义

组件导出以下类型定义：

```ts
import type { OrderSelectBarProps } from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-order-select-bar-z-index | _100_ | - |
| --van-order-select-bar-background | _var(--van-background-2)_ | - |
| --van-order-select-bar-tip-padding | _var(--van-padding-xs) var(--van-padding-sm)_ | - |
| --van-order-select-bar-tip-font-size | _var(--van-font-size-sm)_ | - |
| --van-order-select-bar-tip-line-height | _1.5_ | - |
| --van-order-select-bar-tip-color | _var(--van-orange-dark)_ | - |
| --van-order-select-bar-tip-background | _var(--van-orange-light)_ | - |
| --van-order-select-bar-bar-padding | _14px 12px_ | 底部栏内边距 |
| --van-order-select-bar-bar-min-height | _50px_ | - |
| --van-order-select-bar-action-gap | _var(--van-padding-xs)_ | 按钮间距（最多三个） |
| --van-order-select-bar-icon-size | _22px_ | 收藏/分享图标字号 |
| --van-order-select-bar-icon-text-font-size | _var(--van-font-size-xs)_ | 收藏/分享说明文字 |
| --van-order-select-bar-icon-text-color | _var(--van-text-color-2)_ | 默认图标文案色 |
| --van-order-select-bar-icon-text-color-active | _var(--van-danger-color)_ | 已收藏高亮色 |
