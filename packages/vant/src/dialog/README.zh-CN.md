# Dialog 弹出框

### 介绍

弹出模态框，常用于消息提示、消息确认，或在当前页面内完成特定的交互操作。支持组件调用和函数调用两种方式。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Dialog } from 'vant';

const app = createApp();
app.use(Dialog);
```

### 函数调用

为了便于使用 `Dialog`，Vant 提供了一系列辅助函数，通过辅助函数可以快速唤起全局的弹窗组件。

比如使用 `showDialog` 函数，调用后会直接在页面中渲染对应的弹出框。

```js
import { showDialog } from 'vant';

showDialog({ message: '提示' });
```

## 代码演示

### 消息提示

用于提示一些消息，默认只包含一个确认按钮。

```js
import { showDialog } from 'vant';

showDialog({
  title: '标题',
  message: '告知当前状态、信息和解决方法，等内容。描述文案尽可能控制在2行内',
}).then(() => {
  // on close
});

showDialog({
  message: '告知当前状态、信息和解决方法，等内容。描述文案尽可能控制在2行内',
}).then(() => {
  // on close
});
```

### 消息确认

用于确认消息，默认包含确认和取消按钮。

```js
import { showConfirmDialog } from 'vant';

showConfirmDialog({
  title: '标题',
  message: '描述文案多行展示样式，文字字数不宜过长，描述文案尽可能控制在2行内',
})
  .then(() => {
    // on confirm
  })
  .catch(() => {
    // on cancel
  });
```

### 上下布局及多按钮

#### 上下布局

**涉及props**

`confirmButtonText` 确认文案

`confirmButtonVerticalThreshold` 按钮限制文本长度(超出开启上下布局)

`actionButtons` 多按钮列表

**开启条件**

1. `showCancelButton`(展示取消按钮) 为 `true` 或使用 `showConfirmDialog`
2. `confirmButtonText` 的文案长度大于 `confirmButtonVerticalThreshold`（默认值为 `6`）或传入 `actionButtons` 时，底部按钮会自动切换为上下布局

```js
import { showConfirmDialog } from 'vant';
showConfirmDialog({
  title: '标题',
  message: '描述文案多行展示样式，文字字数不宜过长，描述文案尽可能控制在2行内',
  confirmButtonText: '确认文本内容过长',
  confirmButtonVerticalThreshold: 6,
});
```

#### 多按钮

确认按钮-多个操作按钮+1个取消按钮

**按钮文本控制**

最多显示 `verticalButtonMaxTextLength` 指定的字符数（默认 `15`）

actionButtons[参考配置](#/zh-CN/dialog#lei-xing-ding-yi)多按钮配置

注意:

action为空时，会自动生成action名称

当外层通过confirmButtonText或者cancelButtonText或使用ShowConfirmDialog等方式开启了确认按钮和取消按钮，actionButtons传递action为confirm、cancel无效，以外层为准（外部优先级更高）

```js
import { showConfirmDialog } from 'vant';
showConfirmDialog({
  title: '标题',
  message: '描述文案多行展示样式，文字字数不宜过长，描述文案尽可能控制在2行内',
  confirmButtonText: '继续执行操作',
  actionButtons: [
    { action: 'detail', text: '查看详情', color: '#F00' },
    { action: 'retry', text: '重新尝试', disabled: true },
  ],
}).then((action) => {
  if (action == 'detail') {
  }
});
```

### 自定义颜色

用于自定义按钮颜色。

```js
import { showConfirmDialog } from 'vant';

showConfirmDialog({
  message: '描述文案多行展示样式，文字字数不宜过长，描述文案尽可能控制在2行内',
  title: '标题',
  confirmButtonText: '警示操作', //确认按钮文本
  confirmButtonColor: '#FF3333', //确认按钮颜色
  showCancelButton: true,
});
```

### 高亮支持

**开启条件**

1. 不使用 `allowHtml` 传输message
2. 开启涉及高亮配置

**涉及props**

`messageHighlightConfig` 高亮配置

**messageHighlightConfig**

1. 复用van-highlight组件，参考[highlight 组件文档](#/zh-CN/highlight#props)能力
2. 新增 `color` `style` 自定义颜色样式

**函数使用**

```ts
import { showDialog } from 'vant';

showDialog({
  title: '标题',
  message: '请先阅读《服务协议》，并确认“风险提示”内容。',
  messageHighlightConfig: {
    keywords: ['服务协议', '风险提示'],
    color: '#ee0a24',
    style: {
      fontWeight: 600,
      // fontStyle:'italic'
    },
  },
});
```

**组件使用**

```html
<van-dialog
  v-model:show="showHighlight"
  title="标题"
  message="highContent"
  :message-highlight-config="messageHighlightConfig"
  show-cancel-button
></van-dialog>
```

```ts
import { ref } from 'vue';
const showHighlight = ref(false);
const highContent = ref('请先阅读《服务协议》，并确认“风险提示”内容。');
const messageHighlightConfig = {
  keywords: ['服务协议', '风险提示'],
  color: '#ee0a24',
  style: {
    fontWeight: 600,
    fontStyle: 'italic',
  },
};
```

### 内置输入框

在保留 `title` `message` 的基础上，内容区追加一个内置输入框

**涉及props**

`inputValue` 输入框内容

`inputConfig` 输入框配置

**inputConfig**

1. 内置van-field的部分能力，参考[field 组件文档](#/zh-CN/field#props)能力
2. 新增默认校验触发时机 `validateTrigger`
3. `type`: `text` 文本 `textarea` 文本域

**函数调用**

```js
import { showConfirmDialog } from 'vant';

showConfirmDialog({
  title: '标题',
  message: '这是一段对话框信息',
  inputValue: '',
  inputConfig: {
    type: 'text',
    placeholder: '请输入内容',
    clearable: true,
    maxlength: 20,
    rules: [{ required: true, message: '这是必填项' }],
    validateTrigger: 'onBlur',
  },
});

showConfirmDialog({
  title: '标题',
  message: '这是一段对话框信息',
  inputValue: '',
  inputConfig: {
    type: 'textarea',
    placeholder: '请输入内容',
    maxlength: 100,
    showWordLimit: true,
    autoSize: true,
    rules: [{ required: true, message: '这是必填项' }],
    validateTrigger: ['onBlur'],
  },
});
```

**组件调用**

```html
<van-dialog
  v-model:show="showComponentInput"
  v-model:input-value="componentInputValue"
  title="标题"
  message="这是一段输入信息"
  :input-config="textInputConfig"
  show-cancel-button
/>
<van-dialog
  v-model:show="showComponentValidation"
  v-model:input-value="componentValidationValue"
  title="标题"
  message="这是一段验证的手机号"
  :input-config="validationInputConfig"
  show-cancel-button
/>
```

```js
import { ref } from 'vue';
// 组件短文本
const showComponentInput = ref(false);
const componentInputValue = ref('');
const textInputConfig = ref({
  type: 'text',
  placeholder: '请输入内容',
  clearable: true,
  maxlength: 20,
  rules: [{ required: true, message: '这是必填项' }],
  validateTrigger: 'onBlur',
});
// 组件验证
const showComponentValidation = ref(false);
const componentValidationValue = ref('');
const validationInputConfig = ref({
  placeholder: '请输入内容',
  clearable: true,
  maxlength: 11,
  validateTrigger: ['onBlur', 'onConfirm'],
  rules: [
    { required: true, message: '这是必填项' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的11位手机号',
      trigger: ['onBlur', 'onSubmit'],
    },
  ],
});
```

<!--
### 圆角按钮风格

将 `theme` 选项设置为 `round-button` 可以展示圆角按钮风格的弹窗。

```js
import { showDialog } from 'vant';

showDialog({
  title: '标题',
  message: '代码是写出来给人看的，附带能在机器上运行。',
  theme: 'round-button',
}).then(() => {
  // on close
});

showDialog({
  message: '生命远不止连轴转和忙到极限，人类的体验远比这辽阔、丰富得多。',
  theme: 'round-button',
}).then(() => {
  // on close
});
```

### 异步关闭

通过 `beforeClose` 属性可以传入一个回调函数，在弹窗关闭前进行特定操作。

```js
import { showConfirmDialog } from 'vant';

const beforeClose = (action) =>
  new Promise((resolve) => {
    setTimeout(() => {
      // action !== 'confirm' 拦截取消操作
      resolve(action === 'confirm');
    }, 1000);
  });

showConfirmDialog({
  title: '标题',
  message:
    '如果解决方法是丑陋的，那就肯定还有更好的解决方法，只是还没有发现而已。',
  beforeClose,
});
```

### 使用 Dialog 组件

如果你需要在 Dialog 内嵌入组件或其他自定义内容，可以直接使用 Dialog 组件，并使用默认插槽进行定制。使用前需要通过 `app.use` 等方式注册组件。

```html
<van-dialog v-model:show="show" title="标题" show-cancel-button>
  <img src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg" />
</van-dialog>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const show = ref(false);
    return { show };
  },
};
```
-->

## API

### 方法

Vant 中导出了以下 Dialog 相关的辅助函数：

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| showDialog | 展示消息提示弹窗，默认包含确认按钮 | _options: DialogOptions_ | `Promise<DialogAction>` |
| showConfirmDialog | 展示消息确认弹窗，默认包含确认和取消按钮 | _options: DialogOptions_ | `Promise<DialogAction>` |
| closeDialog | 关闭当前展示的弹窗 | - | `void` |
| setDialogDefaultOptions | 修改默认配置，影响所有的 `showDialog` 调用 | _options: DialogOptions_ | `void` |
| resetDialogDefaultOptions | 重置默认配置，影响所有的 `showDialog` 调用 | - | `void` |

### DialogOptions

调用 `showDialog` 等方法时，支持传入以下选项：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 标题 | _string_ | - |
| width | 弹窗宽度，默认单位为 `px` | _number \| string_ | `320px` |
| message | 文本内容，支持通过 `\n` 换行 | _string \| () => JSX.Element_ | - |
| messageAlign | 内容对齐方式，可选值为 `left` `right` `justify` | _string_ | `center` |
| messageHighlightConfig `new` | 字符串高亮配置，开启 `allowHtml` 时不生效 | _DialogMessageHighlightConfig_ | - |
| inputValue `new` | 内置输入框的当前值 | _string_ | - |
| inputConfig `new` | 内置输入框配置 | _DialogInputConfig_ | - |
| theme | 样式风格，可选值为 `round-button` | _string_ | `default` |
| className | 自定义类名 | _string \| Array \| object_ | - |
| callback | 关闭时的回调函数，使用 `inputConfig` 时第二个参数为输入值 | _(action: string, inputValue?: string) => void_ | - |
| showConfirmButton | 是否展示确认按钮 | _boolean_ | `true` |
| showCancelButton | 是否展示取消按钮 | _boolean_ | `false` |
| confirmButtonText | 确认按钮文案 | _string_ | `我知道了`（提示弹窗） / `主要操作`（确认弹窗） |
| confirmButtonColor | 确认按钮颜色 | _string_ | `#ee0a24` |
| confirmButtonDisabled | 是否禁用确认按钮 | _boolean_ | `false` |
| confirmButtonVerticalThreshold `new` | 限制确认按钮文本的长度最大值，大于此值，开启按钮上下布局 | _number \| string_ | `6` |
| actionButtons `new` | 操作按钮集合（会开启上下布局） | _DialogButton[]_ | - |
| verticalButtonMaxTextLength `new` | 按钮上下布局中单个按钮最多显示的字符数 | _number \| string_ | `15` |
| cancelButtonText | 取消按钮文案 | _string_ | `取消` |
| cancelButtonColor | 取消按钮颜色 | _string_ | `black` |
| cancelButtonDisabled | 是否禁用取消按钮 | _boolean_ | `false` |
| destroyOnClose `v4.9.18` | 是否在关闭时销毁内容 | _boolean_ | `false` |
| overlay | 是否展示遮罩层 | _boolean_ | `true` |
| overlayClass | 自定义遮罩层类名 | _string \| Array \| object_ | - |
| overlayStyle | 自定义遮罩层样式 | _object_ | - |
| closeOnPopstate | 是否在页面回退时自动关闭 | _boolean_ | `true` |
| closeOnClickOverlay | 是否在点击遮罩层后关闭弹窗 | _boolean_ | `false` |
| lockScroll | 是否锁定背景滚动 | _boolean_ | `true` |
| allowHtml | 是否允许 message 内容中渲染 HTML | _boolean_ | `false` |
| beforeClose | 关闭前的回调函数，返回 `false` 可阻止关闭，支持返回 Promise，开启内置输入框，第二参数为输入值 | _(action: string, inputValue?: string) => boolean \| Promise\<boolean\>_ | - |
| transition | 动画类名，等价于 [transition](https://cn.vuejs.org/api/built-in-components.html#transition) 的 `name` 属性 | _string_ | - |
| teleport | 指定挂载的节点，等同于 Teleport 组件的 [to 属性](https://cn.vuejs.org/api/built-in-components.html#teleport) | _string \| Element_ | `body` |
| keyboardEnabled | 是否启用键盘能力，在展示确认和取消按钮的时候，默认情况下键盘的 `Enter` 和 `Esc` 会执行 `confirm` 和 `cancel` 函数 | _boolean_ | `true` |

### Props

通过组件调用 `Dialog` 时，支持以下 Props：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:show | 是否显示弹窗 | _boolean_ | - |
| title | 标题 | _string_ | - |
| width | 弹窗宽度，默认单位为 `px` | _number \| string_ | `320px` |
| message | 文本内容，支持通过 `\n` 换行 | _string \| () => JSX.Element_ | - |
| message-align | 内容水平对齐方式，可选值为 `left` `right` `justify` | _string_ | `center` |
| message-highlight-config `new` | 字符串高亮配置，开启 `allowHtml` 时不生效 | _[DialogMessageHighlightConfig](#类型定义)_ | - |
| v-model:input-value `new` | 内置输入框的当前值 | _string_ | - |
| input-config `new` | 内置输入框配置 | _[DialogInputConfig](#类型定义)_ | - |
| theme | 样式风格，可选值为 `round-button` | _string_ | `default` |
| show-confirm-button | 是否展示确认按钮 | _boolean_ | `true` |
| show-cancel-button | 是否展示取消按钮 | _boolean_ | `false` |
| confirm-button-text | 确认按钮文案 | _string_ | `我知道了`（提示弹窗） / `主要操作`（确认弹窗） |
| confirm-button-color | 确认按钮颜色 | _string_ | `#ee0a24` |
| confirm-button-disabled | 是否禁用确认按钮 | _boolean_ | `false` |
| confirm-button-vertical-threshold `new` | 限制确认按钮文本的长度最大值，大于此值，开启按钮上下布局 | _number \| string_ | `6` |
| vertical-button-max-text-length `new` | 按钮上下布局中单个按钮最多显示的字符数 | _number \| string_ | `15` |
| action-buttons `new` | 操作按钮集合（会开启上下布局） | _[DialogButton[]](#类型定义)_ | - |
| cancel-button-text | 取消按钮文案 | _string_ | `取消` |
| cancel-button-color | 取消按钮颜色 | _string_ | `black` |
| cancel-button-disabled | 是否禁用取消按钮 | _boolean_ | `false` |
| destroy-on-close `v4.9.18` | 是否在关闭时销毁内容 | _boolean_ | `false` |
| z-index | 将弹窗的 z-index 层级设置为一个固定值 | _number \| string_ | `2000+` |
| overlay | 是否展示遮罩层 | _boolean_ | `true` |
| overlay-class | 自定义遮罩层类名 | _string_ | - |
| overlay-style | 自定义遮罩层样式 | _object_ | - |
| close-on-popstate | 是否在页面回退时自动关闭 | _boolean_ | `true` |
| close-on-click-overlay | 是否在点击遮罩层后关闭弹窗 | _boolean_ | `false` |
| lazy-render | 是否在显示弹层时才渲染节点 | _boolean_ | `true` |
| lock-scroll | 是否锁定背景滚动 | _boolean_ | `true` |
| allow-html | 是否允许 message 内容中渲染 HTML | _boolean_ | `false` |
| before-close | 关闭前的回调函数，返回 `false` 可阻止关闭，支持返回 Promise，开启内置输入框，第二参数为输入值 | _(action: string, inputValue?: string) => boolean \| Promise\<boolean\>_ | - |
| transition | 动画类名，等价于 [transition](https://cn.vuejs.org/api/built-in-components.html#transition) 的 `name` 属性 | _string_ | - |
| teleport | 指定挂载的节点，等同于 Teleport 组件的 [to 属性](https://cn.vuejs.org/api/built-in-components.html#teleport) | _string \| Element_ | - |
| keyboard-enabled | 是否启用键盘能力，在展示确认和取消按钮的时候，默认情况下键盘的 `Enter` 和 `Esc` 会执行 `confirm` 和 `cancel` 函数 | _boolean_ | `true` |

### Events

通过组件调用 `Dialog` 时，支持以下事件：

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| confirm | 点击确认按钮时触发，含有内置输入框时具有返回值 | _inputValue?: string_ |
| cancel | 点击取消按钮时触发，含有内置输入框时具有返回值 | _inputValue?: string_ |
| click-button `new` | 点击 actionButtons 中的按钮时触发 | _action: string, button: DialogButton, inputValue?: string_ |
| open | 打开弹窗时触发 | - |
| close | 关闭弹窗时触发 | - |
| opened | 打开弹窗且动画结束后触发 | - |
| closed | 关闭弹窗且动画结束后触发 | - |

### Slots

通过组件调用 `Dialog` 时，支持以下插槽：

| 名称    | 说明               |
| ------- | ------------------ |
| default | 自定义内容         |
| title   | 自定义标题         |
| footer  | 自定义底部按钮区域 |

### 类型定义

组件导出以下类型定义：

```ts
import type {
  DialogProps,
  DialogAction,
  DialogTheme,
  DialogButton,
  DialogMessage,
  DialogOptions,
  DialogMessageAlign,
  DialogMessageHighlightConfig,
  DialogInputType,
  DialogInputConfig,
  DialogInputValidateTrigger,
} from 'vant';
```

**多按钮配置**

```ts
type DialogButton = {
  action: DialogAction;
  text: string;
  color?: string;
  disabled?: boolean;
  className?: string;
  [key: PropertyKey]: any;
};
```

**高亮配置类型**

```ts
import type { CSSProperties } from 'vue';
type DialogMessageHighlightConfig = {
  keywords: string | string[];
  color?: string;
  style?: CSSProperties;
  autoEscape?: boolean;
  caseSensitive?: boolean;
  highlightTag?: keyof HTMLElementTagNameMap;
  highlightClass?: string;
  unhighlightClass?: string;
  unhighlightTag?: keyof HTMLElementTagNameMap;
};
```

**内置输入框配置类型**

```ts
import {
  FieldRule,
  FieldType,
  FieldTextAlign,
  FieldClearTrigger,
  FieldFormatTrigger,
  FieldAutosizeConfig,
  FieldEnterKeyHint,
} from 'vant';

// 输入框类型
type DialogInputType = 'text' | 'textarea';
// 验证事件类型
type DialogInputValidateTrigger = 'onBlur' | 'onChange' | 'onConfirm';

// inputConfig配置
type DialogInputConfig = {
  type?: DialogInputType;
  defaultValue?: string;
  placeholder?: string;
  maxlength?: Numeric;
  rows?: Numeric;
  clearable?: boolean;
  clearIcon?: string;
  readonly?: boolean;
  disabled?: boolean;
  autofocus?: boolean;
  autosize?: boolean | FieldAutosizeConfig;
  rules?: FieldRule[];
  formatter?: (value: string) => string;
  inputAlign?: FieldTextAlign;
  enterkeyhint?: FieldEnterKeyHint;
  clearTrigger?: FieldClearTrigger;
  formatTrigger?: FieldFormatTrigger;
  showWordLimit?: boolean;
  error?: boolean;
  errorMessage?: string;
  validateTrigger?: DialogInputValidateTrigger | DialogInputValidateTrigger[];
};
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-dialog-width | _311px_ | - |
| --van-dialog-small-screen-width | _90%_ | - |
| --van-dialog-font-size | _var(--van-font-size-md)_ | - |
| --van-dialog-transition | _var(--van-duration-base)_ | - |
| --van-dialog-radius | _8px_ | - |
| --van-dialog-background | _var(--van-background-2)_ | - |
| --van-dialog-header-font-weight | _var(--van-font-Medium)_ | - |
| --van-dialog-header-line-height | _16px_ | - |
| --van-dialog-header-padding-top | _24px_ | - |
| --van-dialog-header-isolated-padding | _var(--van-padding-lg) 0_ | - |
| --van-dialog-message-padding | _var(--van-padding-lg)_ | - |
| --van-dialog-message-font-size | _var(--van-font-size-md)_ | - |
| --van-dialog-message-line-height | _var(--van-line-height-xl)_ | - |
| --van-dialog-message-max-height | _488px_ | - |
| --van-dialog-has-title-message-text-color | _var(--van-gray-11)_ | - |
| --van-dialog-has-title-message-padding-top | _var(--van-padding-md)_ | - |
| --van-dialog-button-height | _48px_ | - |
| --van-dialog-round-button-height | _36px_ | - |
| --van-dialog-confirm-button-text-color | _var(--van-primary-color)_ | - |

## 常见问题

### 引用 showDialog 时出现编译报错？

如果引用 `showDialog` 方法时出现以下报错，说明项目中使用了 `babel-plugin-import` 插件，导致代码被错误编译。

```bash
These dependencies were not found:

* vant/es/show-dialog in ./src/xxx.js
* vant/es/show-dialog/style in ./src/xxx.js
```

Vant 从 4.0 版本开始不再支持 `babel-plugin-import` 插件，请参考 [迁移指南](#/zh-CN/migrate-from-v3#yi-chu-babel-plugin-import) 移除该插件。

### 在 beforeRouteLeave 里调用 Dialog 无法展示？

将 `closeOnPopstate` 属性设置为 false 即可。

```js
import { showDialog } from 'vant';

showDialog({
  title: '标题',
  message: '弹窗内容',
  closeOnPopstate: false,
}).then(() => {
  // on close
});
```
