# FieldMoney 金额输入 `new`

### 介绍

基于 [Field 输入框](#/zh-CN/field) 封装的金额录入组件，预设转账场景常用样式：标签置顶、货币符号前缀、大号金额输入与金额大写展示。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { FieldMoney } from 'vant';

const app = createApp();
app.use(FieldMoney);
```

## 代码演示

### 基础用法

```html
<van-cell-group inset>
  <van-field-money
    v-model="value"
    label="转账金额"
    label-tooltip="转账金额提示"
    placeholder="请输入转账金额"
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value = ref('');
    return { value };
  },
};
```

### 错误提示

通过 `error-message` 展示校验失败文案。

```html
<van-field-money
  v-model="value"
  label="转账金额"
  placeholder="请输入转账金额"
  error-message="金额超出可转余额"
/>
```

### 底部说明

通过 `input-comment` 属性或 `#input-comment` 插槽在输入区下方展示说明文案。

```html
<van-field-money
  v-model="value"
  label="转账金额"
  placeholder="请输入转账金额"
  input-comment="单笔转账不超过 50000 元"
/>
```

```html
<van-field-money v-model="value" label="转账金额" placeholder="请输入转账金额">
  <template #input-comment>
  <span>插槽：可放费率、到账时间等说明</span>
  </template>
</van-field-money>
```

## API

### FieldMoney Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 当前输入的金额 | _number \| string_ | - |
| label | 输入框左侧文本 | _string_ | - |
| placeholder | 占位提示文字 | _string_ | - |
| currency | 货币符号，透传至 Field 的 `money-currency` | _string_ | `¥` |
| label-tooltip | 标签旁的提示文案 | _string_ | - |
| label-align | 标签对齐方式，可选值为 `left` `center` `right` `top` | _string_ | `top` |
| error-message | 错误提示文案 | _string_ | - |
| input-comment | 输入区下方说明文案 | _string_ | - |
| show-money-uppercase | 是否在底部展示金额大写 | _boolean_ | `true` |
| show-money-unit | 是否在输入框上方展示金额单位（仟、万、亿等） | _boolean_ | `true` |
| money-uppercase-label | 金额大写区域前的标签文案，不传时使用内置文案 | _string_ | `金额大写` |

> 组件会将未在上述表格中声明的属性透传给内部的 [Field 组件](#/zh-CN/field#props)，例如 `rules`、`disabled`、`min`、`max` 等。

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:model-value | 输入内容变化时触发 | _value: number \| string_ |

> 其余 [Field 事件](#/zh-CN/field#events)（如 `focus`、`blur`）可通过在组件上监听同名事件使用。

### Slots

| 名称 | 说明 |
| --- | --- |
| input-left | 自定义输入框左侧内容，默认展示 `currency` 对应的货币符号（基于 Field 的 `money-currency`） |
| input-comment | 自定义输入区下方说明内容 |
| label | 自定义输入框标签 |
| button | 自定义输入框尾部按钮 |
| extra | 自定义输入框最右侧的额外内容 |

### 类型定义

```ts
import type { FieldMoneyProps } from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-field-money-currency-font-size | _16px_ | 货币符号字号 |
| --van-field-money-currency-font-weight | _var(--van-font-bold)_ | 货币符号字重 |
| --van-field-money-currency-filled-color | _#333333_ | 已输入时货币符号颜色 |
| --van-field-money-input-font-size | _24px_ | 金额输入字号 |
| --van-field-money-input-font-weight | _var(--van-font-bold)_ | 金额输入字重 |
| --van-field-money-body-margin-top | _12px_ | 输入区与标签的间距 |
