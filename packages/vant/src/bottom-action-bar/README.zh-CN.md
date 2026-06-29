# BottomActionBar 底部操作栏

### 介绍

固定在底部的通用操作栏，样式接近订单提交栏：顶部可放协议/提示，中间可放筛选等内容，底部 **64px** 按钮区通过 `#actions` 插槽传入多个 `van-button`。**插槽中第一个按钮展示在最右侧**，其余依次向左排列。传入 `max-visible-actions` 后，超出数量的按钮会以 Popover 菜单收起。

### 引入

```js
import { createApp } from 'vue';
import { BottomActionBar } from 'vant';

const app = createApp();
app.use(BottomActionBar);
```

## 代码演示

### 单个主按钮

```html
<van-bottom-action-bar>
  <template #actions>
    <van-button block type="primary" @click="onConfirm">确定</van-button>
  </template>
</van-bottom-action-bar>
```

### 主次双按钮

常用于筛选面板：右侧实心确定，左侧 `plain` 重置。请将主要操作写在 `#actions` 插槽最前面，它会展示在最右侧。

```html
<van-bottom-action-bar>
  <template #actions>
    <van-button type="primary" @click="onConfirm">确定</van-button>
    <van-button plain type="primary" @click="onReset">重置</van-button>
  </template>
</van-bottom-action-bar>
```

### 两个次按钮 / 三个次按钮

多个 `plain` 次按钮组合。主要操作写在 `#actions` 插槽最前面，展示在最右侧。

```html
<!-- 两个次按钮 -->
<van-bottom-action-bar>
  <template #actions>
    <van-button plain type="primary" @click="onConfirm">确定</van-button>
    <van-button plain type="primary" @click="onTertiary">次要操作2</van-button>
  </template>
</van-bottom-action-bar>

<!-- 三个次按钮 -->
<van-bottom-action-bar>
  <template #actions>
    <van-button plain type="primary" @click="onConfirm">确定</van-button>
    <van-button plain type="primary" @click="onExtra1">选项一</van-button>
    <van-button plain type="primary" @click="onExtra2">选项二</van-button>
  </template>
</van-bottom-action-bar>
```

### 更多操作 + 按钮

传入 `max-visible-actions` 且 `#actions` 中的按钮数量超过该值时，左侧会自动出现「更多操作」触发器，**按插槽顺序保留前 N 个按钮**在底部展示（第一个子节点始终在最右侧），其余按钮以 [Popover](#/zh-CN/popover) 垂直菜单收起；选中菜单项后会触发对应 `van-button` 的点击事件并关闭气泡。

```html
<van-bottom-action-bar
  :max-visible-actions="2"
  more-popover-placement="top-start"
  more-text="更多操作"
>
  <template #actions>
    <van-button type="primary" @click="onConfirm">确定</van-button>
    <van-button plain type="primary" @click="onSecondary">次要操作</van-button>
    <van-button plain type="primary" @click="onExtra1">选项一</van-button>
    <van-button plain type="primary" @click="onExtra2">选项二</van-button>
  </template>
</van-bottom-action-bar>
```

上例中底部展示「次要操作」「确定」（确定在最右侧），「选项一」「选项二」收进 Popover 菜单。

通过 `more-icon-position="left"` 可将箭头图标置于文案左侧：

```html
<van-bottom-action-bar
  :max-visible-actions="2"
  more-icon-position="left"
  more-text="图标在左"
>
  <template #actions>
    <van-button type="primary" @click="onApprove">通过</van-button>
    <van-button plain type="primary" @click="onReject">拒绝</van-button>
    <van-button plain type="primary" @click="onSendBack">打回</van-button>
    <van-button plain type="primary" @click="onVeto">否决</van-button>
  </template>
</van-bottom-action-bar>
```

### 自定义溢出 Popover 触发器

通过 `#more-reference` 插槽自定义溢出 Popover 的触发器，插槽参数为 `{ expanded: boolean }` 表示气泡是否展开；未传入时使用内置「更多操作」样式。

```html
<van-bottom-action-bar
  :max-visible-actions="3"
  :start-gap="16"
  more-popover-placement="top-start"
>
  <template #more-reference>
    <span>更多</span>
  </template>
  <template #actions>
    <van-button plain @click="onApprove">通过</van-button>
    <van-button plain @click="onReject">拒绝</van-button>
    <van-button plain @click="onExtra2">选项二</van-button>
    <van-button @click="onExtra1">选项一</van-button>
  </template>
</van-bottom-action-bar>
```

### 更多操作自定义插槽

通过 `#more` 插槽可完全自定义左侧区域，例如放置全选复选框；配合 `#top` 插槽展示已选数量。可通过 `start-gap` 调整左侧区域与按钮区间距。

```html
<van-bottom-action-bar :start-gap="67">
  <template #top>
    <div class="selected-count">
      已选<strong>9,999</strong>笔
      <span class="selected-amount">总金额<strong>10,000,000,000</strong>元</span>
    </div>
  </template>
  <template #more>
    <van-checkbox-group v-model="selectAllItems" shape="square">
      <van-checkbox name="a">全选</van-checkbox>
    </van-checkbox-group>
  </template>
  <template #actions>
    <van-button type="primary" @click="onApprove">通过</van-button>
    <van-button plain type="primary" @click="onReject">拒绝</van-button>
  </template>
</van-bottom-action-bar>
```

### 收藏与分享

通过 `#more` 插槽放置收藏、分享等图标操作。

```html
<van-bottom-action-bar :start-gap="34">
  <template #more>
    <div class="icons">
      <button type="button" @click="onToggleCollect">
        <van-icon :name="collected ? 'like' : 'like-o'" />
        <span>收藏</span>
      </button>
      <button type="button" @click="onShare">
        <van-icon name="share-o" />
        <span>分享</span>
      </button>
    </div>
  </template>
  <template #actions>
    <van-button type="primary" @click="onConfirm">确定</van-button>
    <van-button plain type="primary" @click="onSecondary">次要操作</van-button>
  </template>
</van-bottom-action-bar>
```

### 协议提示 + 操作

顶部 `#top` 插槽可放协议勾选、说明文案等，配合 [Highlight](#/zh-CN/highlight) 高亮协议链接文案。

```html
<van-bottom-action-bar>
  <template #top>
    <van-checkbox-group v-model="agreedItems" shape="square">
      <van-checkbox name="clause1">
        <van-highlight
          tag="span"
          source-string="本人已仔细阅读并同意以上所有条款"
          keywords="以上所有条款"
        />
      </van-checkbox>
      <van-checkbox name="clause2">
        <van-highlight
          tag="span"
          source-string="并同意《宁波银行APP隐私协议》"
          keywords="《宁波银行APP隐私协议》"
        />
      </van-checkbox>
    </van-checkbox-group>
  </template>
  <template #actions>
    <van-button block type="primary" @click="onAction">操作</van-button>
  </template>
</van-bottom-action-bar>
```

### 下拉筛选 + 主次按钮

顶部 `#top` 插槽可放筛选表单等内容，搭配 [ProForm](#/zh-CN/pro-form) 通过 `columns` 配置字段；底部按钮区触发 `formRef.submit()` 提交。可通过 `bar-padding` 调整按钮区内边距。

```html
<van-bottom-action-bar bar-padding="12px 12px">
  <template #top>
    <van-pro-form
      v-model="model"
      ref="formRef"
      :columns="columns"
      :show-submit="false"
      @submit="onSubmit"
    />
  </template>
  <template #actions>
    <van-button type="primary" @click="formRef?.submit()">确定</van-button>
    <van-button plain type="primary" @click="onReset">重置</van-button>
  </template>
</van-bottom-action-bar>
```

单个主按钮提交时，可将确定按钮设为 `block`：

```html
<van-bottom-action-bar bar-padding="12px 12px">
  <template #top>
    <van-pro-form
      v-model="model"
      ref="formRef"
      :columns="columns"
      :show-submit="false"
      @submit="onSubmit"
    />
  </template>
  <template #actions>
    <van-button block type="primary" @click="formRef?.submit()">确定</van-button>
  </template>
</van-bottom-action-bar>
```

### 文本按钮

`#actions` 中搭配 [Button](#/zh-CN/button) 的 `text-button` 属性使用文本按钮。由于文本按钮会隐藏 `::after`，按钮间分隔线需通过外层元素添加 `van-hairline--left` 实现；除最后一个按钮外，其余按钮均可添加左侧分隔线。

配合 `max-visible-actions` 超出收起时，可通过 `#more-reference` 自定义触发器，例如省略号图标：

```html
<van-bottom-action-bar
  bar-padding="13px 0"
  :start-gap="0"
  :max-visible-actions="4"
>
  <template #more-reference>
    <van-icon name="ellipsis" />
  </template>
  <template #actions>
    <div class="text-action van-hairline--left">
      <van-button size="small" text-button type="primary" @click="onConfirm">
        确定
      </van-button>
    </div>
    <div class="text-action van-hairline--left">
      <van-button size="small" text-button plain type="primary" @click="onSecondary">
        确定
      </van-button>
    </div>
    <van-button size="small" text-button plain type="primary" @click="onExtra">
      确定
    </van-button>
  </template>
</van-bottom-action-bar>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| start-gap | 左侧区域与按钮区间距 | _number \| string_ | - |
| bar-padding `new` | 底部按钮区内边距，对应 `--van-bottom-action-bar-bar-padding` | _number \| string_ | - |
| max-visible-actions | 底部直接展示的按钮数量（按 `#actions` 顺序取前 N 个，第一个子节点在最右侧），超出部分收起到 Popover；不传则展示全部按钮 | _number \| string_ | - |
| more-text | 溢出时「更多操作」触发器文案 | _string_ | `更多操作` |
| more-icon | 气泡关闭时箭头图标 | _string_ | `arrow-double-left` |
| more-expanded-icon | 气泡打开时箭头图标 | _string_ | `arrow-double-right` |
| more-icon-position | 箭头图标相对文案的位置，可选值为 `left` `right` | _string_ | `right` |
| more-expanded | 溢出 Popover 是否展示，支持 `v-model` | _boolean_ | `false` |
| more-popover-placement | 溢出 Popover 位置，同 `Popover` 的 `placement` | _string_ | `bottom-start` |
| more-theme | 溢出 Popover 主题，可选值为 `light` `dark` | _string_ | `light` |
| safe-area-inset-bottom | 是否开启底部安全区适配 | _boolean_ | `true` |
| placeholder | 是否生成等高占位 | _boolean_ | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| click-more | 溢出 Popover 首次展开时触发 | - |
| update:more-expanded | 溢出 Popover 显隐变化 | _expanded: boolean_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| top | 顶部内容区（协议、筛选表单等） |
| default | 中间内容区（位于顶部区与按钮区之间） |
| before | 按钮区左侧扩展（与 `more` 二选一，优先级低于 `more`） |
| more | 自定义左侧区域（如全选、收藏分享）；可与溢出 Popover 并存 |
| more-reference `new` | 自定义溢出 Popover 触发器；参数为 `{ expanded: boolean }`，未传入时使用内置「更多操作」 |
| actions | 底部按钮区，传入多个 `van-button` |

### 类型定义

```ts
import type { BottomActionBarProps } from 'vant';
```

## 主题定制

### 样式变量

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-bottom-action-bar-z-index | _100_ | - |
| --van-bottom-action-bar-background | _var(--van-white)_ | 整体背景 |
| --van-bottom-action-bar-top-padding | _12px_ | 顶部区内边距 |
| --van-bottom-action-bar-top-background | _var(--van-white)_ | 顶部区背景 |
| --van-bottom-action-bar-top-font-size | _var(--van-font-size-sm)_ | 顶部区字号 |
| --van-bottom-action-bar-top-line-height | _1.5_ | 顶部区行高 |
| --van-bottom-action-bar-top-color | _var(--van-text-color-2)_ | 顶部区文字色 |
| --van-bottom-action-bar-bar-height | _64px_ | 底部按钮区高度 |
| --van-bottom-action-bar-bar-padding | _8px 12px_ | 底部按钮区内边距 |
| --van-bottom-action-bar-start-gap | _35px_ | 左侧区域与按钮区间距 |
| --van-bottom-action-bar-action-gap | _var(--van-padding-xs)_ | 按钮间距 |
| --van-bottom-action-bar-more-color | _var(--van-text-color)_ | 「更多操作」文字色 |
| --van-bottom-action-bar-more-font-size | _var(--van-font-size-lg)_ | 「更多操作」字号 |
| --van-bottom-action-bar-more-gap | _var(--van-padding-base)_ | 「更多操作」文字与图标间距 |
| --van-bottom-action-bar-more-icon-size | _14px_ | 「更多操作」图标大小 |
