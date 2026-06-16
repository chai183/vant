# Steps 步骤条

### 介绍

用于展示操作流程的各个环节，让用户了解当前的操作在整体流程中的位置。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Step, Steps } from 'vant';

const app = createApp();
app.use(Step);
app.use(Steps);
```

## 代码演示

### 基础用法

`active` 属性表示当前步骤的索引，从 0 起计。

```html
<van-steps :active="active">
  <van-step>买家下单</van-step>
  <van-step>商家接单</van-step>
  <van-step>买家提货</van-step>
  <van-step>交易完成</van-step>
</van-steps>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref(1);
    return { active };
  },
};
```

### 辅助文字

通过 `description` 属性或 `description` 插槽设置步骤下方的辅助文字。横向模式下，辅助文字最多展示两行并居中显示；步骤数量 3/4/5 时，步骤区域宽度会自动适配。

```html
<van-steps :active="active">
  <van-step description="等待买家付款">买家下单</van-step>
  <van-step description="商家已接单">商家接单</van-step>
  <van-step description="等待买家提货">买家提货</van-step>
  <van-step description="交易已完成">交易完成</van-step>
</van-steps>
```

### 自定义样式

可以通过 `active-icon` 和 `active-color` 属性设置激活状态下的图标和颜色。

```html
<van-steps :active="active" active-icon="success" active-color="#07c160">
  <van-step>买家下单</van-step>
  <van-step>商家接单</van-step>
  <van-step>买家提货</van-step>
  <van-step>交易完成</van-step>
</van-steps>
```

### 异常状态

通过 Step 的 `status="error"` 设置异常状态，步骤圆圈和标题文字将变为红色，辅助文字颜色不变。

```html
<van-steps :active="2">
  <van-step>买家下单</van-step>
  <van-step>商家接单</van-step>
  <van-step status="error">买家提货</van-step>
  <van-step>交易完成</van-step>
</van-steps>
```

### 竖向步骤条

可以通过设置 `direction` 属性来改变步骤条的显示方向。竖向模式下采用左右布局（3:2），左侧展示步骤文字和辅助文字，右侧通过 `extra` 插槽展示事件/辅助信息。

```html
<van-steps direction="vertical" :active="0">
  <van-step description="快件已到达">
    【城市】物流状态1
    <template #extra>2016-07-12 12:40</template>
  </van-step>
  <van-step description="快件运输中">
    【城市】物流状态2
    <template #extra>2016-07-11 10:00</template>
  </van-step>
  <van-step description="快件已发货">
    快件已发货
    <template #extra>2016-07-10 09:30</template>
  </van-step>
</van-steps>
```

### 可折叠步骤条

竖向模式下，设置 `collapsible` 属性后，底部会出现展开/收起按钮。收起时仅展示当前步骤。

```html
<van-steps direction="vertical" :active="0" collapsible>
  <van-step description="快件已到达">
    【城市】物流状态1
    <template #extra>2016-07-12 12:40</template>
  </van-step>
  <van-step description="快件运输中">
    【城市】物流状态2
    <template #extra>2016-07-11 10:00</template>
  </van-step>
</van-steps>
```

### 倒序步骤条

竖向模式下，设置 `reverse` 属性后，步骤将从下到上排列。

```html
<van-steps direction="vertical" :active="0" reverse>
  <van-step description="快件已到达">【城市】物流状态1</van-step>
  <van-step description="快件运输中">【城市】物流状态2</van-step>
</van-steps>
```

## API

### Steps Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| active | 当前步骤对应的索引值 | _number \| string_ | `0` |
| direction | 步骤条方向，可选值为 `vertical` | _string_ | `horizontal` |
| active-icon | 当前步骤对应的底部图标，可选值见 [Icon 组件](#/zh-CN/icon) | _string_ | - |
| inactive-icon | 非当前步骤对应的底部图标，可选值见 [Icon 组件](#/zh-CN/icon) | _string_ | - |
| finish-icon | 已完成步骤对应的底部图标，优先级高于 `inactive-icon`，可选值见 [Icon 组件](#/zh-CN/icon) | _string_ | - |
| active-color | 当前步骤和已完成步骤的颜色 | _string_ | - |
| inactive-color | 未激活步骤的颜色 | _string_ | - |
| icon-prefix | 图标类名前缀，等同于 Icon 组件的 [class-prefix 属性](#/zh-CN/icon#props) | _string_ | `van-icon` |
| collapsible | 竖向模式下是否可折叠，收起时仅展示当前步骤 | _boolean_ | `false` |
| reverse | 竖向模式下是否倒序展示（从下到上） | _boolean_ | `false` |

### Step Props

| 参数        | 说明                       | 类型     | 默认值 |
| ----------- | -------------------------- | -------- | ------ |
| description | 辅助文字                   | _string_ | -      |
| status      | 步骤状态，可选值为 `error` | _string_ | -      |

### Step Slots

| 名称          | 说明                                                       |
| ------------- | ---------------------------------------------------------- |
| default       | 步骤内容                                                   |
| description   | 自定义辅助文字                                             |
| extra         | 竖向模式下右侧事件/辅助信息                                |
| active-icon   | 自定义激活状态图标                                         |
| inactive-icon | 自定义未激活状态图标                                       |
| finish-icon   | 自定义已完成步骤对应的底部图标，优先级高于 `inactive-icon` |

### Steps Events

| 事件名     | 说明                       | 回调参数        |
| ---------- | -------------------------- | --------------- |
| click-step | 点击步骤的标题或图标时触发 | _index: number_ |

### 类型定义

组件导出以下类型定义：

```ts
import type { StepsProps, StepsDirection } from 'vant';
import type { StepStatus } from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-step-text-color | _var(--van-text-color)_ | 步骤文字颜色 |
| --van-step-description-color | _var(--van-gray-7)_ | 辅助文字颜色 |
| --van-step-active-color | _var(--van-primary-color)_ | 激活/完成颜色 |
| --van-step-process-text-color | _var(--van-primary-color)_ | 当前步骤文字颜色 |
| --van-step-font-size | _var(--van-font-size-sm)_ | 步骤字号 |
| --van-step-line-color | _var(--van-border-color)_ | 连接线颜色 |
| --van-step-finish-line-color | _var(--van-primary-color)_ | 已完成连接线颜色 |
| --van-step-finish-text-color | _var(--van-text-color)_ | 已完成文字颜色 |
| --van-step-icon-size | _12px_ | 图标大小 |
| --van-step-circle-number-size | _16px_ | 数字圆圈大小 |
| --van-step-waiting-circle-bg | _#dddddd_ | 等待状态圆圈背景 |
| --van-step-waiting-circle-color | _#999999_ | 等待状态数字颜色 |
| --van-step-error-color | _#ff3333_ | 异常状态颜色 |
| --van-step-horizontal-title-font-size | _var(--van-font-size-sm)_ | 横向步骤字号 |
| --van-step-vertical-title-font-size | _var(--van-font-size-md)_ | 竖向步骤字号 |
| --van-steps-background | _var(--van-background-2)_ | 步骤条背景 |
| --van-steps-collapse-height | _40px_ | 折叠栏高度 |
| --van-steps-collapse-font-size | _var(--van-font-size-md)_ | 折叠栏字号 |

### 步骤状态说明

| 状态 | 圆圈样式           | 步骤文字 | 辅助文字 |
| ---- | ------------------ | -------- | -------- |
| 等待 | 灰色圆圈显示序号   | 默认色   | 默认色   |
| 当前 | 主题色圆圈显示序号 | 主题色   | 默认色   |
| 完成 | 主题色圆圈显示勾   | 默认色   | 默认色   |
| 异常 | 红色圆圈显示序号   | 红色     | 默认色   |

### 横向步骤区域宽度

| 步骤数 | 区域最大宽度 | 步骤文字 | 辅助文字 |
| ------ | ------------ | -------- | -------- |
| 3      | 109px        | 单行     | 最多两行 |
| 4      | 78px         | 单行     | 最多两行 |
| 5      | 60px         | 单行     | 最多两行 |
