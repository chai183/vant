# Result 结果页 `new`

### 介绍

用于展示业务办理、交易提交等场景的结果状态，内置等待、失败、异常、成功四种状态样式。结果图标使用 [Icon](#/zh-CN/icon) 内置图形（自带圆角与样式），可通过 `size` 配置大小，并按 `status` 展示对应颜色；同时支持主/次操作按钮与内容插槽。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Result } from 'vant';

const app = createApp();
app.use(Result);
```

## 代码演示

### 等待状态

等待状态默认采用左右并排按钮布局（次按钮在左、主按钮在右）。

```html
<van-result
  status="waiting"
  title="等待XX"
  description="备注信息"
  main-button-text="主要操作"
  secondary-button-text="次要操作"
  @click-main-button="onMain"
  @click-secondary-button="onSecondary"
>
  <div>自定义内容区域</div>
</van-result>
```

### 失败状态

失败状态默认采用上下堆叠按钮布局（主按钮在上）。

```html
<van-result
  status="fail"
  title="XX失败"
  description="备注信息"
  main-button-text="主要操作"
  secondary-button-text="次要操作"
/>
```

### 异常状态

异常状态默认采用混合按钮布局：主按钮通栏在上，两个次按钮并排在下。

```html
<van-result
  status="warning"
  title="XX异常"
  description="备注信息"
  main-button-text="主要操作"
  secondary-button-text="次要操作1"
  secondary-button-text2="次要操作2"
/>
```

### 按钮布局

通过 `button-layout` 配置按钮排列方式，会覆盖各 `status` 的默认布局。

- `horizontal`：左右并排，次按钮在左、主按钮在右；多个次按钮时按顺序排在主按钮左侧。
- `vertical`：上下堆叠，主按钮在上、次按钮在下。
- `hybrid`：主按钮通栏在上，所有次按钮在下一行并排展示。

```html
<van-result
  status="success"
  title="自定义布局"
  button-layout="hybrid"
  main-button-text="主要操作"
  secondary-button-text="次要操作1"
  secondary-button-text2="次要操作2"
/>
```

### 自定义图标

通过 `icon` 覆盖默认图标名称，通过 `size` 设置图标大小（默认 `64`）。

```html
<van-result status="success" title="XX成功" icon="checked" :size="48" />
```

各 `status` 对应的默认图标如下：

| status | 默认 icon |
| --- | --- |
| waiting | `underway` |
| fail | `clear` |
| warning | `warning` |
| success | `checked` |

### 成功状态

成功状态通常不展示按钮，可在默认插槽与 `#footer` 插槽中补充金额、明细卡片等内容。

```html
<van-result status="success" title="XX成功" description="备注信息">
  <div>金额等内容</div>
  <template #footer>
    <div>底部详情卡片</div>
  </template>
</van-result>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| status | 结果状态 | _'waiting' \| 'fail' \| 'warning' \| 'success'_ | `success` |
| title | 结果标题 | _string_ | - |
| description | 备注说明 | _string_ | - |
| icon | 自定义图标名称，不传时按 `status` 使用内置图标 | _string_ | - |
| size | 图标大小，透传给 [Icon](#/zh-CN/icon) 的 `size` | _number \| string_ | `64` |
| button-layout | 按钮布局，不传时按 `status` 使用默认布局 | _'horizontal' \| 'vertical' \| 'hybrid'_ | - |
| main-button-text | 主按钮文案 | _string_ | - |
| secondary-button-text | 第一个次按钮文案 | _string_ | - |
| secondary-button-text2 | 第二个次按钮文案 | _string_ | - |
| main-button-disabled | 是否禁用主按钮 | _boolean_ | `false` |
| secondary-button-disabled | 是否禁用第一个次按钮 | _boolean_ | `false` |
| secondary-button-disabled2 | 是否禁用第二个次按钮 | _boolean_ | `false` |
| main-button-loading | 主按钮是否展示加载状态 | _boolean_ | `false` |
| secondary-button-loading | 第一个次按钮是否展示加载状态 | _boolean_ | `false` |
| secondary-button-loading2 | 第二个次按钮是否展示加载状态 | _boolean_ | `false` |
| safe-area-inset-bottom | 是否开启底部安全区适配 | _boolean_ | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| click-main-button | 点击主按钮时触发 | - |
| click-secondary-button | 点击第一个次按钮时触发 | - |
| click-secondary-button2 | 点击第二个次按钮时触发 | - |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 图标与标题下方的自定义内容 |
| icon | 自定义结果图标 |
| title | 自定义标题 |
| description | 自定义备注 |
| main-button | 自定义主按钮 |
| secondary-button | 自定义第一个次按钮 |
| secondary-button-2 | 自定义第二个次按钮 |
| footer | 底部扩展区域，如详情卡片列表 |

### 默认按钮布局

| status | 默认 button-layout |
| --- | --- |
| waiting | horizontal |
| fail | vertical |
| warning | hybrid |
| success | vertical |

### 类型定义

组件导出以下类型定义：

```ts
import type {
  ResultProps,
  ResultStatus,
  ResultButtonLayout,
  ResultThemeVars,
} from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

异常状态颜色依赖全局变量 `--van-warning-orange`（`#ffa710`），定义于基础样式中。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-result-padding-top | _40px_ | 页面上内边距 |
| --van-result-padding-horizontal | _var(--van-padding-sm)_ | 页面左右内边距（12px） |
| --van-result-title-font-size | _18px_ | 标题字号 |
| --van-result-title-line-height | _24px_ | 标题行高 |
| --van-result-title-margin-top | _var(--van-padding-md)_ | 标题上边距 |
| --van-result-content-margin-top | _var(--van-padding-lg)_ | 内容区上边距 |
| --van-result-description-color | _var(--van-gray-10)_ | 备注文字颜色 |
| --van-result-description-font-size | _var(--van-font-size-sm)_ | 备注字号 |
| --van-result-description-line-height | _var(--van-line-height-sm)_ | 备注行高 |
| --van-result-description-margin-top | _var(--van-padding-lg)_ | 备注上边距 |
| --van-result-actions-margin-top | _var(--van-padding-lg)_ | 按钮区上边距 |
| --van-result-actions-gap | _var(--van-padding-xs)_ | 按钮间距 |
| --van-result-footer-margin-top | _var(--van-padding-lg)_ | 底部区域上边距 |
| --van-result-waiting-color | _var(--van-orange-dark)_ | 等待状态图标、标题颜色 |
| --van-result-fail-color | _var(--van-danger-color)_ | 失败状态图标、标题颜色 |
| --van-result-warning-color | _var(--van-warning-orange)_ | 异常状态图标、标题颜色 |
| --van-result-success-color | _var(--van-success-color)_ | 成功状态图标、标题颜色 |
| --van-result-main-button-color | _var(--van-orange-dark)_ | 主按钮颜色 |
| --van-result-secondary-button-color | _var(--van-text-color)_ | 次按钮文字颜色 |
| --van-result-secondary-button-border-color | _var(--van-gray-4)_ | 次按钮边框颜色 |
