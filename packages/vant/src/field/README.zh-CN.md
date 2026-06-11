# Field 输入框

### 介绍

用户可以在文本框内输入或编辑文字。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Field, CellGroup } from 'vant';

const app = createApp();
app.use(Field);
app.use(CellGroup);
```

## 代码演示

### 基础用法

可以通过 `v-model` 双向绑定输入框的值，通过 `placeholder` 设置占位提示文字。

```html
<!-- 可以使用 CellGroup 作为容器 -->
<van-cell-group inset>
  <van-field v-model="value" label="文本" placeholder="请输入文本" />
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

### 自定义类型

根据 `type` 属性定义不同类型的输入框，默认值为 `text`。`money` 类型及转账场景用法见 [FieldMoney 金额输入](#/zh-CN/field-money)。

```html
<van-cell-group inset>
  <van-form>
    <!-- 输入任意文本 -->
    <van-field
      v-model="text"
      label="文本"
      placeholder="请输入文本"
      autocomplete="off"
    />
    <!-- 输入手机号，调起手机号键盘 -->
    <van-field
      v-model="phone"
      type="tel"
      label="手机号"
      placeholder="请输入手机号"
    />
    <!-- 允许输入正整数，调起纯数字键盘 -->
    <van-field
      v-model="digit"
      type="digit"
      label="整数"
      placeholder="请输入整数"
    />
    <!-- 允许输入数字，调起带符号的纯数字键盘 -->
    <van-field
      v-model="number"
      type="number"
      label="数字"
      placeholder="请输入数字（支持小数）"
    />
    <!-- 输入密码 -->
    <van-field
      v-model="password"
      type="password"
      label="密码"
      placeholder="请输入密码"
      autocomplete="off"
    />
    <!-- 账号 -->
    <van-field
      v-model="account"
      type="account"
      label="账号"
      placeholder="请输入账号"
      autocomplete="off"
    />
    <!-- 身份证 -->
    <van-field
      v-model="idcard"
      type="idcard"
      label="身份证"
      placeholder="请输入身份证"
      autocomplete="off"
    />
    <!-- UKey -->
    <van-field
      v-model="ukey"
      type="ukey"
      label="UKey"
      placeholder="请输入UKey"
      autocomplete="off"
    />
    <van-field
      v-model="text"
      label-align="top"
      autosize
      label="文本"
      placeholder="请输入文本"
      autocomplete="off"
    />
  </van-form>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const text = ref('');
    const phone = ref('');
    const digit = ref('');
    const number = ref('');
    const password = ref('');
    const account = ref('');
    const idcard = ref('');
    const ukey = ref('');

    return {
      text,
      phone,
      digit,
      number,
      password,
      account,
      idcard,
      ukey,
    };
  },
};
```

### 禁用输入框

通过 `readonly` 将输入框设置为只读状态，通过 `disabled` 将输入框设置为禁用状态。

```html
<van-cell-group inset>
  <van-field label="文本" model-value="输入框只读" readonly />
  <van-field label="文本" model-value="输入框已禁用" disabled />
</van-cell-group>
```

### 只读省略

只读状态下默认通过 [TextEllipsis](#/zh-CN/text-ellipsis) 展示内容。`model-value` 为数组时，会以 [Tag](#/zh-CN/tag) 单行展示各项，超出宽度的部分合并为 `+N` 标签；内容未超出时可完整展示。设置 `value-separator` 可将数组项用指定符号拼接后以 TextEllipsis 展示。设置 `:readonly-ellipsis="false"` 可恢复为原生只读输入框（数组值仍会使用 Tag 展示，设置 `value-separator` 时除外）。

超出省略：

```html
<van-cell-group inset>
  <van-field
    label="收货地址"
    model-value="上海市浦东新区张江高科技园区科苑路88号张江大厦12层1201室"
    readonly
    placeholder="请选择收货地址"
  />
  <van-field
    label="已选标签"
    :model-value="['设计设计设计设计设计设设计设计设计设计设计设', '交互', '前端']"
    readonly
    placeholder="请选择标签"
  />
  <van-field
    label="分隔符展示"
    :model-value="['设计', '交互', '前端']"
    value-separator=";"
    readonly
    placeholder="请选择标签"
  />
</van-cell-group>
```

未超出：

```html
<van-cell-group inset>
  <van-field
    label="收货地址"
    model-value="上海市浦东新区"
    readonly
    placeholder="请选择收货地址"
  />
  <van-field
    label="已选标签"
    :model-value="['设计', '交互', '前端']"
    readonly
    placeholder="请选择标签"
  />
</van-cell-group>
```

### 显示图标

通过 `left-icon` 和 `right-icon` 配置输入框两侧的图标，通过设置 `clearable` 在输入过程中展示清除图标。设置 `show-right-icon-divider` 可在右侧图标左侧展示竖向分隔线，可通过 `--van-field-right-icon-color` 自定义右侧图标颜色。使用 `right-icon` 插槽可自定义右侧内容，例如操作按钮或 [Popover](#/zh-CN/popover) 气泡菜单。

```html
<van-cell-group inset>
  <van-field
    v-model="value1"
    show-right-icon-divider
    label="文本"
    left-icon="smile-o"
    right-icon="warning-o"
    placeholder="显示图标"
    :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
  />
  <van-field
    v-model="value1"
    show-right-icon-divider
    label="文本"
    left-icon="smile-o"
    placeholder="显示图标"
    :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
  >
    <template #right-icon>
      <a>操作按钮</a>
    </template>
  </van-field>
  <van-field
    v-model="value2"
    show-right-icon-divider
    clearable
    label="文本"
    left-icon="music-o"
    placeholder="显示清除图标"
    :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
  >
    <template #right-icon>
      <div style="display: flex; align-items: center; gap: 8px">
        <a>按钮</a>
        <van-icon name="scan" />
      </div>
    </template>
  </van-field>
  <van-field
    v-model="value3"
    show-right-icon-divider
    label="文本"
    left-icon="smile-o"
    placeholder="气泡菜单"
  >
    <template #right-icon>
      <van-popover
        v-model:show="showPopover"
        :actions="actions"
        reference-text
        placement="bottom-end"
        @select="onSelect"
        @click.stop
      />
    </template>
  </van-field>
</van-cell-group>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('123');
    const value3 = ref('');
    const showPopover = ref(false);
    const actions = [
      { text: '选项一' },
      { text: '选项二' },
      { text: '选项三' },
    ];
    const onSelect = (action) => showToast(action.text);

    return {
      value1,
      value2,
      value3,
      showPopover,
      actions,
      onSelect,
    };
  },
};
```

### 必填星号

设置 `required` 属性来展示必填星号。

```html
<van-cell-group inset>
  <van-field
    v-model="username"
    required
    label="用户名"
    placeholder="请输入用户名"
  />
  <van-field
    v-model="phone"
    required
    label="手机号"
    placeholder="请输入手机号"
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const username = ref('');
    const phone = ref('123');
    return { username, phone };
  },
};
```

请注意 `required` 属性只用于控制样式展示，在进行表单校验时，需要使用 `rule.required` 选项来控制校验逻辑。

### 自动展示星号

你可以在 Form 组件上设置 `required="auto"`，此时 Form 里的所有 Field 会自动根据 `rule.required` 来判断是否需要展示星号。

```html
<van-cell-group inset>
  <van-form required="auto">
    <van-field
      v-model="username"
      :rules="[{ required: true }]"
      label="用户名"
      placeholder="请输入用户名"
    />
    <van-field
      v-model="phone"
      :rules="[{ required: false }]"
      label="手机号"
      placeholder="请输入手机号"
    />
  </van-form>
</van-cell-group>
```

### 错误提示

设置 `required` 属性表示这是一个必填项，可以配合 `error` 或 `error-message` 属性显示对应的错误提示。设置 `error-message-info` 时，`error-message` 会以信息样式（浅色背景块）展示。

```html
<van-cell-group inset>
  <van-field
    v-model="username"
    error
    label="用户名"
    placeholder="请输入用户名"
  />
  <van-field
    v-model="phone"
    label="手机号"
    placeholder="请输入手机号"
    error-message="手机号格式错误"
  />
  <van-field
    v-model="phone"
    label="手机号"
    placeholder="请输入手机号"
    error-message="手机号格式错误"
    error-message-info
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const username = ref('');
    const phone = ref('123');
    return { username, phone };
  },
};
```

### 插入按钮

通过 button 插槽可以在输入框尾部插入按钮。

```html
<van-cell-group inset>
  <van-field
    v-model="sms"
    center
    clearable
    label="短信验证码"
    placeholder="请输入短信验证码"
  >
    <template #button>
      <van-button size="small" type="primary">发送验证码</van-button>
    </template>
  </van-field>
</van-cell-group>
```

### 格式化输入内容

通过 `formatter` 属性可以对输入的内容进行格式化，通过 `format-trigger` 属性可以指定执行格式化的时机，默认在输入时进行格式化。

```html
<van-cell-group inset>
  <van-field
    v-model="value1"
    label="文本"
    :formatter="formatter"
    placeholder="在输入时执行格式化"
  />
  <van-field
    v-model="value2"
    label="文本"
    :formatter="formatter"
    format-trigger="onBlur"
    placeholder="在失焦时执行格式化"
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');
    // 过滤输入的数字
    const formatter = (value) => value.replace(/\d/g, '');

    return {
      value1,
      value2,
      formatter,
    };
  },
};
```

### 高度自适应

对于 textarea，可以通过 `autosize` 属性设置高度自适应。

```html
<van-cell-group inset>
  <van-field
    v-model="message"
    autosize
    rows="1"
    label="留言"
    type="textarea"
    placeholder="请输入留言"
  />
</van-cell-group>
```

### 显示字数统计

设置 `maxlength` 和 `show-word-limit` 属性后会在底部显示字数统计。输入超过 `maxlength` 时会默认弹出 Toast 提示「达到字数上限」，可通过 `show-maxlength-toast` 关闭。

```html
<van-cell-group inset>
  <van-field
    v-model="message"
    autosize
    show-word-limit
    rows="2"
    type="textarea"
    maxlength="5"
    label="留言"
    placeholder="请输入留言"
  />
  <van-field
    v-model="messageWithoutToast"
    autosize
    show-word-limit
    rows="2"
    type="textarea"
    maxlength="5"
    :show-maxlength-toast="false"
    label="关闭上限提示"
    placeholder="请输入留言"
  />
</van-cell-group>
```

### 输入框内容对齐

通过 `input-align` 属性可以设置输入框内容的对齐方式，可选值为 `center`、`right`。

```html
<van-cell-group inset>
  <van-field
    v-model="value"
    label="文本"
    placeholder="输入框内容右对齐"
    input-align="right"
  />
</van-cell-group>
```

### 输入框文本位置

通过 `label-align` 属性可以设置输入框文本的位置，可选值为 `center`、`right`、`top`。

```html
<van-cell-group inset>
  <van-field
    v-model="value"
    label="文本"
    placeholder="顶部对齐"
    label-align="top"
  />
  <van-field
    v-model="value"
    label="文本"
    placeholder="左对齐"
    label-align="left"
  />
  <van-field
    v-model="value"
    label="文本"
    placeholder="居中对齐"
    label-align="center"
  />
  <van-field
    v-model="value"
    label="文本"
    placeholder="右对齐"
    label-align="right"
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

### 标签备注

通过 `label-comment` 属性或 `label-comment` 插槽可在标签下方展示备注（插槽优先级高于属性）。

```html
<van-field label="文本" label-comment="标签下方的备注说明" />
<van-field label="文本" placeholder="请输入文本">
  <template #label-comment>
    <span>插槽：标签备注可自定义样式</span>
  </template>
</van-field>
```

### 说明与底部

通过 `input-comment` 属性或 `input-comment` 插槽可在输入区域下方展示辅助说明。使用 `bottom` 插槽可在整行底部展示内容，适合协议勾选、风险提示等。

```html
<van-cell-group inset>
  <van-field
    v-model="value4"
    label="文本"
    placeholder="请输入文本"
    label-comment="标签下方的备注说明"
  />
  <van-field v-model="value5" label="文本" placeholder="请输入文本">
    <template #label-comment>
      <span>插槽：标签备注可自定义样式</span>
    </template>
  </van-field>
  <van-field
    v-model="value1"
    label="文本"
    placeholder="请输入文本"
    input-comment="这是一段辅助说明"
  />
  <van-field v-model="value2" label="文本" placeholder="请输入文本">
    <template #input-comment>
      <span>插槽：可放链接或强调样式</span>
    </template>
  </van-field>
  <van-field v-model="value3" label="文本" placeholder="请输入文本">
    <template #bottom>
      <span style="color: var(--van-text-color-2)">
        bottom 插槽：整行展示在标签与输入框下方，适合协议勾选、风险提示等
      </span>
    </template>
  </van-field>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');
    const value3 = ref('');
    return { value1, value2, value3 };
  },
};
```

### Label 收起展开

设置 `label-collapsible` 且 `label-align="top"` 时，标签旁会展示收起/展开控件，可通过 `v-model:label-expanded` 双向绑定展开状态。可与 `label-action-text` 或 `label-action` 插槽组合，在标签行右侧展示操作按钮。

```html
<van-cell-group inset>
  <van-field
    v-model="value1"
    v-model:label-expanded="expanded"
    label="标题"
    placeholder="请输入内容"
    label-align="top"
    label-collapsible
  />
  <van-field
    v-model="value2"
    label="与 label-action 组合"
    placeholder="请输入内容"
    label-comment="收起后仍保留标签备注"
    label-action-text="添加"
    label-align="top"
    label-collapsible
  />
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('示例内容');
    const value2 = ref('');
    const expanded = ref(true);
    return { value1, value2, expanded };
  },
};
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 当前输入的值 | _number \| string_ | - |
| label | 输入框左侧文本 | _string_ | - |
| name | 名称，作为提交表单时的标识符 | _string_ | - |
| id | 输入框 id，同时会设置 label 的 for 属性 | _string_ | `van-field-n-input` |
| type | 输入框类型, 支持原生 input 标签的所有 [type 属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input#%3Cinput%3E_types)，额外支持了 `digit`、`money`、`account`、`idcard`、`ukey` 类型 | _FieldType_ | `text` |
| size | 大小，可选值为 `large` `normal` | _string_ | - |
| maxlength | 输入的最大字符数 | _number \| string_ | - |
| min `v4.9.5` | 输入框类型为 `number`、`money` 或 `digit` 类型时设置可允许的最小值 | _number_ | - |
| max `v4.9.5` | 输入框类型为 `number`、`money` 或 `digit` 类型时设置可允许的最大值 | _number_ | - |
| placeholder | 输入框占位提示文字 | _string_ | - |
| border | 是否显示内边框 | _boolean_ | `true` |
| disabled | 是否禁用输入框 | _boolean_ | `false` |
| readonly | 是否为只读状态，只读状态下无法输入内容 | _boolean_ | `false` |
| readonly-ellipsis `new` | 只读时是否用 TextEllipsis 展示 | _boolean_ | `true` |
| readonly-ellipsis-rows `new` | 只读省略展示的最大行数 | _number \| string_ | `1` |
| value-separator `new` | `model-value` 为数组时，各项之间的拼接符号；设置后以 TextEllipsis 展示拼接结果，不再使用 Tag | _string_ | - |
| colon | 是否在 label 后面添加冒号 | _boolean_ | `false` |
| required | 是否显示表单必填星号 | _boolean \| 'auto'_ | `null` |
| center | 是否使内容垂直居中 | _boolean_ | `false` |
| clearable | 是否启用清除图标，点击清除图标后会清空输入框 | _boolean_ | `false` |
| clear-icon | 清除图标名称或图片链接，等同于 Icon 组件的 [name 属性](#/zh-CN/icon#props) | _string_ | `clear` |
| clear-trigger | 显示清除图标的时机，`always` 表示输入框不为空时展示，<br>`focus` 表示输入框聚焦且不为空时展示 | _FieldClearTrigger_ | `focus` |
| clickable | 是否开启点击反馈 | _boolean_ | `false` |
| is-link | 是否展示右侧箭头并开启点击反馈 | _boolean_ | `false` |
| autofocus | 是否自动聚焦，iOS 系统不支持该属性 | _boolean_ | `false` |
| show-word-limit | 是否显示字数统计，需要设置 `maxlength` 属性 | _boolean_ | `false` |
| show-maxlength-toast `new` | 输入超过 `maxlength` 时是否以 Toast 提示「达到字数上限」 | _boolean_ | `true` |
| show-money-uppercase `new` | `type` 为 `money` 时是否在底部展示金额大写；转账等场景推荐使用 [FieldMoney](#/zh-CN/field-money) | _boolean_ | `false` |
| show-money-unit `new` | `type` 为 `money` 时是否在输入框上方展示金额单位（仟、万、亿等） | _boolean_ | `false` |
| show-money-currency `new` | `type` 为 `money` 时是否在输入框左侧展示货币符号 | _boolean_ | `true` |
| money-currency `new` | 输入框左侧展示的货币符号，需开启 `show-money-currency` | _string_ | `¥` |
| money-uppercase-label `new` | 金额大写区域前的标签文案 | _string_ | - |
| error | 是否将输入内容标红 | _boolean_ | `false` |
| error-message | 底部错误提示文案，为空时不展示 | _string_ | - |
| error-message-align | 错误提示文案对齐方式，可选值为 `center` `right` | _FieldTextAlign_ | `left` |
| error-message-info `new` | 是否将 `error-message` 以信息样式展示 | _boolean_ | `false` |
| formatter | 输入内容格式化函数 | _(val: string) => string_ | - |
| format-trigger | 格式化函数触发的时机，可选值为 `onBlur` | _FieldFormatTrigger_ | `onChange` |
| arrow-direction | 箭头方向，可选值为 `left` `up` `down` | _string_ | `right` |
| label-class | 左侧文本额外类名 | _string \| Array \| object_ | - |
| input-class `new` | 输入框额外类名（含 `input` / `textarea`；使用 `input` 插槽时作用于包裹层） | _string \| Array \| object_ | - |
| input-style `new` | 输入框额外样式 | _string \| object_ | - |
| body-class `new` | 输入主体区域额外类名 | _string \| Array \| object_ | - |
| body-style `new` | 输入主体区域额外样式 | _string \| object_ | - |
| label-width | 左侧文本宽度，默认单位为 `px` | _number \| string_ | `6.2em` |
| label-align | 左侧文本对齐方式，可选值为 `center` `right` `top` | _FieldTextAlign_ | `left` |
| label-tooltip `new` | 标签旁说明文案，点击后以 Popover 展示；需设置 `label` | _string_ | - |
| label-tooltip-popover-props `new` | 透传给标签 Popover 的属性，详见 [Popover](#/zh-CN/popover) | _Partial\<PopoverProps\>_ | - |
| label-comment `new` | 标签下方的备注文案 | _string_ | - |
| label-collapsible `new` | 是否允许收起标签，需配合 `label-align="top"` 使用 | _boolean_ | `false` |
| label-expanded `new` | 标签是否展开，支持 `v-model:label-expanded` 双向绑定 | _boolean_ | `true` |
| label-action-text `new` | 标签行右侧操作按钮文案，需 `label-align="top"` | _string_ | - |
| show-label-action `new` | 是否展示标签行右侧操作区域 | _boolean_ | - |
| input-comment `new` | 输入区域下方的辅助说明文案 | _string_ | - |
| input-align | 输入框对齐方式，可选值为 `center` `right` | _FieldTextAlign_ | `left` |
| autosize | 是否自适应内容高度，只对 textarea 有效，<br>可传入对象,如 { maxHeight: 100, minHeight: 50 }，<br>单位为`px` | _boolean \| FieldAutosizeConfig_ | `false` |
| left-icon | 左侧图标名称或图片链接，等同于 Icon 组件的 [name 属性](#/zh-CN/icon#props) | _string_ | - |
| right-icon | 右侧图标名称或图片链接，等同于 Icon 组件的 [name 属性](#/zh-CN/icon#props) | _string_ | - |
| show-right-icon-divider `new` | 是否在右侧图标左侧展示竖向分隔线 | _boolean_ | `false` |
| icon-prefix | 图标类名前缀，等同于 Icon 组件的 [class-prefix 属性](#/zh-CN/icon#props) | _string_ | `van-icon` |
| rules | 表单校验规则，详见 [Form 组件](#/zh-CN/form#rule-shu-ju-jie-gou) | _FieldRule[]_ | - |
| autocomplete | HTML 原生属性，用于控制自动完成功能，详见 [MDN - autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) | _string_ | - |
| autocapitalize `v4.6.2` | HTML 原生属性，用于控制文本输入时是否自动大写，此 API 仅在部分浏览器支持，详见 [MDN - autocapitalize](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize) | _string_ | - |
| enterkeyhint | HTML 原生属性，用于控制回车键样式，此 API 仅在部分浏览器支持，详见 [MDN - enterkeyhint](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint)<br> | _FieldEnterKeyHint_ | - |
| spellcheck `v4.6.2` | HTML 原生属性，用于检查元素的拼写错误，此 API 仅在部分浏览器支持，详见 [MDN - spellcheck](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck)<br> | _boolean_ | - |
| autocorrect `v4.6.2` | HTML 原生属性，仅 Safari 适用，用于自动更正输入的文本，详见 [MDN - autocorrect](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#autocorrect)<br> | _string_ | - |
| inputmode `v4.9.9` | HTML 原生属性，用于指定输入框的输入模式，详见 [MDN - inputmode](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode) | _string_ | 根据 `type` 属性自动设置 |
| rows | HTML 原生属性，用于指定输入框的可见文本行数，只对 textarea 有效 | _number \| string_ | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:model-value | 输入框内容变化时触发 | _value: string (当前输入的值)_ |
| focus | 输入框获得焦点时触发 | _event: Event_ |
| blur | 输入框失去焦点时触发 | _event: Event_ |
| clear | 点击清除按钮时触发 | _event: MouseEvent_ |
| click | 点击组件时触发 | _event: MouseEvent_ |
| click-input | 点击输入区域时触发 | _event: MouseEvent_ |
| click-left-icon | 点击左侧图标时触发 | _event: MouseEvent_ |
| click-right-icon | 点击右侧图标时触发 | _event: MouseEvent_ |
| update:label-expanded | 标签展开状态变化时触发 | _value: boolean_ |
| click-label-action | 点击标签行右侧操作按钮时触发 | _event: MouseEvent_ |
| start-validate | 开始表单校验时触发 | - |
| end-validate | 结束表单校验时触发 | _{ status: string, message: string }_ |

### 方法

通过 ref 可以获取到 Field 实例并调用实例方法，详见[组件实例方法](#/zh-CN/advanced-usage#zu-jian-shi-li-fang-fa)。

| 方法名 | 说明           | 参数 | 返回值 |
| ------ | -------------- | ---- | ------ |
| focus  | 获取输入框焦点 | -    | -      |
| blur   | 取消输入框焦点 | -    | -      |

### 类型定义

组件导出以下类型定义：

```ts
import type {
  FieldType,
  FieldRule,
  FieldProps,
  FieldInstance,
  FieldTextAlign,
  FieldRuleMessage,
  FieldClearTrigger,
  FieldFormatTrigger,
  FieldRuleValidator,
  FieldRuleFormatter,
  FieldValidateError,
  FieldAutosizeConfig,
  FieldValidateTrigger,
  FieldValidationStatus,
} from 'vant';
```

`FieldInstance` 是组件实例的类型，用法如下：

```ts
import { ref } from 'vue';
import type { FieldInstance } from 'vant';

const fieldRef = ref<FieldInstance>();

fieldRef.value?.focus();
```

### Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| label | 自定义输入框左侧文本 | - |
| label-tooltip `new` | 自定义标签旁 Popover 说明内容，优先级高于 `label-tooltip` 属性 | - |
| label-comment `new` | 自定义标签下方备注，优先级高于 `label-comment` 属性 | - |
| label-action `new` | 自定义标签行右侧操作内容，优先级高于 `label-action-text` 属性 | - |
| input | 自定义输入框，使用此插槽后，与输入框相关的属性和事件将失效 | - |
| input-left | 输入框左侧内容（如货币符号） | - |
| left-icon | 自定义输入框头部图标 | - |
| right-icon | 自定义输入框尾部图标 | - |
| button | 自定义输入框尾部按钮 | - |
| input-comment `new` | 自定义输入区域下方辅助说明 | - |
| input-bottom `new` | 自定义输入区域下方、字数统计与错误提示上方的内容 | - |
| error-message | 自定义底部错误提示文案 | _{ message: string }_ |
| bottom `new` | 整行底部内容（位于标签与输入区域之下） | - |
| extra | 自定义输入框最右侧的额外内容 | - |

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称                                  | 默认值                    | 描述 |
| ------------------------------------- | ------------------------- | ---- |
| --van-field-label-width               | _6.2em_                   | -    |
| --van-field-label-color               | _var(--van-text-color)_   | -    |
| --van-field-label-margin-right        | _var(--van-padding-sm)_   | -    |
| --van-field-input-text-color          | _var(--van-text-color)_   | -    |
| --van-field-input-error-text-color    | _var(--van-danger-color)_ | -    |
| --van-field-input-disabled-text-color | _var(--van-text-color-3)_ | -    |
| --van-field-placeholder-text-color    | _var(--van-text-color-3)_ | -    |
| --van-field-icon-size                 | _18px_                    | -    |
| --van-field-clear-icon-size           | _18px_                    | -    |
| --van-field-clear-icon-color          | _var(--van-gray-5)_       | -    |
| --van-field-right-icon-color          | _var(--van-gray-6)_       | -    |
| --van-field-right-icon-divider-height | _14px_                    | -    |
| --van-field-right-icon-divider-color  | _var(--van-border-color)_ | -    |
| --van-field-error-message-color       | _var(--van-danger-color)_ | -    |
| --van-field-error-message-font-size   | _12px_                    | -    |
| --van-field-extra-margin-top          | _2px_                     | 输入区下方辅助内容的上边距 |
| --van-field-error-message-info-background | _#fff2f0_             | -    |
| --van-field-error-message-info-padding    | _6px 20px_            | -    |
| --van-field-error-message-info-margin-top | _var(--van-field-extra-margin-top)_ | -    |
| --van-field-error-message-info-radius     | _var(--van-radius-md)_ | -    |
| --van-field-text-area-min-height      | _60px_                    | -    |
| --van-field-word-limit-color          | _var(--van-gray-7)_       | -    |
| --van-field-word-limit-font-size      | _var(--van-font-size-sm)_ | -    |
| --van-field-word-limit-line-height    | _16px_                    | -    |
| --van-field-disabled-text-color       | _var(--van-text-color-3)_ | -    |
| --van-field-required-mark-color       | _var(--van-red)_          | -    |
| --van-field-label-action-color        | _var(--van-primary-color)_ | -    |
| --van-field-label-action-font-size    | _var(--van-font-size-md)_ | -    |
| --van-field-label-collapse-color      | _var(--van-text-color-2)_ | -    |
| --van-field-label-collapse-font-size  | _var(--van-font-size-sm)_ | -    |
| --van-field-money-currency-font-size | _inherit_ | 货币符号字号 |
| --van-field-money-currency-font-weight | _var(--van-font-bold)_ | 货币符号字重 |
| --van-field-money-currency-color | _var(--van-field-placeholder-text-color)_ | 未输入时货币符号颜色 |
| --van-field-money-currency-filled-color | _var(--van-field-input-text-color)_ | 已输入时货币符号颜色 |

## 常见问题

### 设置 type 为 number 后，为什么 input 标签的类型仍为 text?

HTML 原生的 `type="number"` 属性在 iOS 和 Android 系统上都存在一定问题，比如 maxlength 属性不生效、无法获取到完整的输入内容等。因此设置 type 为 `number` 或 `money` 时，Field 不会使用原生的 `type="number"` 属性，而是用现代浏览器支持的 [inputmode 属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/inputmode)来控制输入键盘的类型。

### 为什么 v-model 绑定的值被更新为 string 类型？

Field 组件内部会将传入的 v-model 格式化为 string 类型，便于组件内部进行处理。

如果你希望在 v-model 上绑定 number 类型，可以使用 Vue 提供的 [.number 修饰符](https://vuejs.org/guide/essentials/forms.html#lazy)。

```html
<van-field v-model.number="value" type="tel" />
```

### 在桌面端点击清除按钮无效？

清除按钮监听是的移动端 Touch 事件，参见[桌面端适配](#/zh-CN/advanced-usage#zhuo-mian-duan-gua-pei)。
