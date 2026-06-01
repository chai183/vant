# FieldSelectPopup 底部选择 `new`

### 介绍

表单项结合底部弹层进行选择。

### 引入

```js
import { createApp } from 'vue';
import { FieldSelectPopup, CellGroup } from 'vant';

const app = createApp();
app.use(FieldSelectPopup);
app.use(CellGroup);
```

## 代码演示

### 单选 + 关闭

点击选项会触发 `update:modelValue` 并关闭弹层。

### 多选 + 确定 / 取消

多选且为确认模式时，点击选项只更新 `draftValue`；需在打开弹层时（如监听 `click-input`）将 `draftValue` 同步为当前 `modelValue` 的拷贝；在 `confirm` 中将 `draftValue` 写回 `modelValue`，在 `cancel` 中还原并关闭。

### 宫格

设置 `layout="grid"`，并用 `columns` 控制列数。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 选中值：单选为 `string \| number`，多选为数组 | _string \| number \| Array_ | `''` |
| v-model:show | 是否显示弹层；**不传时由组件内部维护**，需要时仍可用 `v-model:show` 受控 | _boolean_ | 内部 `false` |
| options | 选项列表 | _FieldSelectPopupOption[]_ | `[]` |
| display-text | 单选有值时覆盖 `#input` 文案；**不传则按 `modelValue` 匹配 `options[].text`**（多选为 Tag，可不传） | _string_ | - |
| placeholder | 未选中时 `#input` 内展示，颜色与 Field 的 placeholder 一致 | _string_ | `请选择` |
| multiple | 是否多选 | _boolean_ | `false` |
| toolbar | 头部样式：`close` 标题+关闭；`confirm` 取消+标题+确定（多选未传时默认为 `confirm`） | _'close' \| 'confirm'_ | 单选 `close`，多选 `confirm` |
| draft-value | 确认模式下弹层内的临时选中项 | _(string \| number)[]_ | - |
| layout | 列表或宫格 | _'list' \| 'grid'_ | `'list'` |
| columns | 宫格列数 | _number_ | `3` |
| max-visible-tags | 多选 `#input` 单行从左保留的 Tag 个数，其余合并为 `+N` | _number_ | `1` |
| title | 弹层标题 | _string_ | - |
| cancel-text | 取消按钮文案 | _string_ | `取消` |
| confirm-text | 确定按钮文案 | _string_ | `确定` |
| teleport | 弹层挂载位置 | _string_ | `body` |
| round | 是否显示圆角 | _boolean_ | `true` |
| destroy-on-close | 关闭时销毁弹层内容 | _boolean_ | `true` |

其余属性透传至内部 [Field](/zh-CN/field)，如 `label`、`name`、`placeholder`、`label-align`、`disabled` 等。

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中值变化 | _value_ |
| update:show | 弹层显示状态变化 | _show: boolean_ |
| update:draftValue | 临时多选变化（确认模式） | _value: (string \| number)[]_ |
| confirm | 点击确定 | - |
| cancel | 点击取消 | - |
| click-input | 点击输入区域 | _event: MouseEvent_ |

### 类型定义

组件导出以下类型：

```ts
import type { FieldSelectPopupOption } from 'vant';
```

`FieldSelectPopupOption` 为 `{ text: string; value: string | number; disabled?: boolean }`。

### 主题变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-field-select-popup-display-color | _var(--van-field-input-text-color, var(--van-text-color))_ | 有值时展示文案颜色 |
| --van-field-select-popup-display-placeholder-color | _var(--van-field-placeholder-text-color)_ | 占位文案颜色（与 Field placeholder 一致） |
| --van-field-select-popup-display-font-size | _var(--van-field-font-size, var(--van-font-size-md))_ | 展示文案字号 |
| --van-field-select-popup-header-height | _48px_ | 头部高度 |
| --van-field-select-popup-title-font-size | _var(--van-font-size-lg)_ | 标题字号 |
| --van-field-select-popup-header-confirm-color | _var(--van-primary-color)_ | 确定按钮颜色 |
| --van-field-select-popup-body-max-height | _60vh_ | 内容区最大高度 |
| --van-field-select-popup-tile-active-color | _var(--van-primary-color)_ | 宫格选中文字颜色 |
| --van-field-select-popup-tile-active-border-color | _var(--van-primary-color)_ | 宫格选中边框颜色 |
