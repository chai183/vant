# ProForm 高级表单 `new`

### 介绍

基于 `Form` + `Field` 的配置化表单，通过 `columns` 描述表单项，内置 Switch、Checkbox、Picker、金额输入、动态子项、范围录入、附件上传等控件，并支持 `render` 与 `components` 扩展自定义字段。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { ProForm } from 'vant';

const app = createApp();
app.use(ProForm);
```

## 代码演示

### 配置化生成

使用 `v-model` 绑定表单数据，`columns` 配置每一项的 `name`、`label`、`component` 及校验规则。完整示例见 [demo/index.vue](./demo/index.vue)。

```html
<van-pro-form
  v-model="model"
  ref="formRef"
  :columns="columns"
  submit-text="提交"
  @submit="onSubmit"
  @failed="onFailed"
/>
```

```js
import { ref, computed } from 'vue';

const model = ref({ username: '' });

const columns = computed(() => [
  {
    name: 'username',
    label: '用户名',
    component: 'field',
    fieldProps: {
      placeholder: '请输入用户名',
      rules: [{ required: true, message: '请输入用户名' }],
    },
  },
  {
    name: 'switch',
    label: '开关',
    component: 'switch',
    fieldProps: { inputAlign: 'right' },
  },
  {
    name: 'checkbox',
    label: '复选框',
    component: 'checkbox',
    defaultValue: true,
    fieldProps: {
      rules: [{ validator: (val) => !!val, message: '请勾选复选框' }],
    },
  },
  { name: 'checkboxGroup', label: '复选框组', component: 'checkboxGroup' },
  { name: 'radio', label: '单选框', component: 'radio', defaultValue: '1' },
  {
    name: 'stepper',
    label: '步进器',
    component: 'stepper',
    fieldProps: { inputAlign: 'right' },
  },
  {
    name: 'rate',
    label: '评分',
    component: 'rate',
    defaultValue: 3,
    fieldProps: { inputAlign: 'right' },
  },
  {
    name: 'slider',
    label: '滑块',
    component: 'slider',
    defaultValue: 50,
    fieldProps: { labelAlign: 'top' },
  },
  {
    name: 'picker',
    label: '选择器',
    component: 'picker',
    fieldProps: { placeholder: '点击选择城市' },
    componentProps: { columns: cityColumns },
  },
  {
    name: 'datePicker',
    label: '时间选择',
    component: 'datePicker',
    fieldProps: { placeholder: '点击选择时间' },
  },
  {
    name: 'area',
    label: '地区选择',
    component: 'area',
    fieldProps: { placeholder: '点击选择省市区' },
    componentProps: { areaList },
  },
  {
    name: 'areaStepCascader',
    label: '步骤条省市区',
    component: 'areaStepCascader',
    fieldProps: { placeholder: '点击选择省市区' },
  },
  {
    name: 'calendar',
    label: '日历',
    component: 'calendar',
    fieldProps: { placeholder: '点击选择日期' },
  },
  {
    name: 'uploader',
    label: '上传图片',
    component: 'uploader',
    defaultValue: [{ url: 'https://example.com/photo.jpg' }],
    componentProps: { maxCount: 2 },
    fieldProps: { labelAlign: 'top' },
  },
]);

const onSubmit = (values) => {
  console.log('submit', values);
};

const onFailed = ({ values, errors }) => {
  console.log('failed', values, errors);
};
```

### 金额输入

`fieldMoney` 通过 `componentProps` 配置币种等，`fieldProps` 配置标签、校验与 `labelTooltip`。

```js
{
  name: 'amount',
  label: '金额输入',
  component: 'fieldMoney',
  defaultValue: '1000',
  fieldProps: {
    placeholder: '请输入转账金额',
    labelTooltip: '转账金额提示',
    rules: [{ required: true, message: '请输入转账金额' }],
  },
  componentProps: { currency: '¥' },
}
```

### 动态子项

`fieldChildren` 用于可增删的行列表，`componentProps.row` 为每行渲染函数，`column.label` 作为列表标题。

```js
import { Field } from 'vant';

{
  name: 'options',
  label: '可添加子选项列表',
  component: 'fieldChildren',
  defaultValue: ['', ''],
  componentProps: {
    addText: '添加',
    minItems: 1,
    maxItems: 5,
    defaultRowValue: '新选项',
    row: () => (
      <Field label="选项名称" placeholder="请输入" border={false} />
    ),
  },
}
```

### 范围录入

`rangeInput` 通过 `componentProps.start` / `end` 自定义起止输入，`layout` 支持 `vertical`（上下）与 `horizontal`（左右），默认值为 `['', '']`。

```js
{
  name: 'rangeVertical',
  label: '范围录入-上下布局',
  component: 'rangeInput',
  defaultValue: ['', ''],
  fieldProps: {
    rules: [{
      required: true,
      message: '请输入',
      validator: (value) => value[0] !== '' && value[1] !== '',
    }],
  },
  componentProps: {
    layout: 'vertical',
    start: () => <Field inputBorder placeholder="请输入" />,
    end: () => <Field inputBorder placeholder="请输入" />,
  },
}
```

### 附件上传

`uploaderFile` 适用于文档等附件场景，需在 `componentProps` 传入 `upload` 函数，默认值为 `[]`。

```js
{
  name: 'attachments',
  label: '上传文件',
  component: 'uploaderFile',
  defaultValue: [],
  fieldProps: {
    rules: [{ required: true, message: '请上传附件' }],
  },
  componentProps: {
    description: [
      '所上传格式支持 DOC/PPT/XLS/VSD/POT 等',
      '所上传文件大小控制在 20M 以内，支持批量上传',
    ],
    uploadText: '添加附件',
    upload: (item) =>
      new Promise((resolve) => {
        // 调用业务上传接口
        resolve({ url: `https://example.com/${item.file?.name}` });
      }),
    accept: '*',
    multiple: true,
    maxSize: 20 * 1024 * 1024,
  },
}
```

### 扩展自定义控件

通过 `components` 注册表，`column.component` 与注册表 `key` 对应：

```js
const columns = [{ name: 'city', label: '城市', component: 'cityPicker' }];

const components = {
  cityPicker: ({ value, setValue }) => h(CityPicker, {
    modelValue: value,
    'onUpdate:modelValue': setValue,
  }),
};
```

```html
<van-pro-form v-model="model" :columns="columns" :components="components" />
```

也可使用插槽 `#input-{name}`、`#field-{name}` 覆盖单个表单项。

### 行内 render

在 `columns` 项上直接传入 `render`，优先级高于 `component` 与 `components` 注册表。

**推荐：直接传组件**，`modelValue` 自动绑定，`componentProps` 透传：

```js
{
  name: 'deliverySlot',
  label: '配送时段',
  defaultValue: { date: '2026/5/28', period: 'morning', urgent: false },
  fieldProps: {
    rules: [{
      validator: (val) => !!(val?.date && val?.period),
      message: '请完整选择配送信息',
    }],
  },
  render: DeliverySlotField,
  componentProps: {
    placeholder: '请选择配送日期与时段',
    popupTitle: '选择配送时段',
  },
}
```

**JSX 简写**（自动绑定 `modelValue`，`componentProps` 仍会合并）：

```tsx
render: () => <DeliverySlotField />
```

**需要渲染函数时**，使用 `bindProps` 传入额外 props：

```js
render: ({ bindProps }) => h(MyField, bindProps({ placeholder: '请选择' }))
```

### useCustomFieldValue 复杂自定义组件

自定义组件需放在 `Field` 的 `#input` 插槽内（ProForm 的 `render` 会自动包裹），并在组件内调用 `useCustomFieldValue` 将值同步给 Form：

```js
import { useCustomFieldValue } from '@vant/use';

// 组件内
useCustomFieldValue(() => props.modelValue);
```

完整示例见 `demo/ProFormDeliverySlotField.tsx`（对象类型值、弹层、日历、单选、开关组合）。

## API

### ProForm Props

支持 [Form 组件](/#/zh-CN/form#props) 的全部 Props，并额外提供：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 表单项配置 | _ProFormColumn[]_ | `[]` |
| model-value | 表单数据（支持 `v-model`） | _Record<string, unknown>_ | - |
| components | 自定义控件注册表，`key` 为 `column.component` | _ProFormComponentMap_ | `{}` |
| inset | 是否使用圆角卡片风格 CellGroup | _boolean_ | `true` |
| show-submit | 是否展示提交按钮 | _boolean_ | `true` |
| submit-text | 提交按钮文案 | _string_ | `提交` |

### ProFormColumn 数据结构

| 键名 | 说明 | 类型 |
| --- | --- | --- |
| name | 字段名 | _string_ |
| label | 标签 | _string_ |
| component | 内置或自定义控件类型 | _string_ |
| defaultValue | 初始值；未传时按 `component` 使用内置默认值 | _unknown_ |
| fieldProps | 透传 Field | _Partial\<FieldProps\>_ |
| componentProps | 透传控件 | _object_ |
| options | radio / checkboxGroup 选项 | _ProFormOption[]_ |
| hidden | 是否隐藏 | _boolean \| (model) => boolean_ |
| render | 行内自定义渲染，优先级高于 component | _(ctx) => VNode_ \| _Component_ |

#### 内置 component 与默认初始值

| component | 说明 | 未设置 defaultValue 时的默认值 |
| --- | --- | --- |
| `field` | 原生 Field 输入 | `''` |
| `switch` | 开关 | `false` |
| `checkbox` | 复选框 | `false` |
| `checkboxGroup` | 复选框组 | `[]` |
| `radio` | 单选框 | `''` |
| `stepper` | 步进器 | `1` |
| `rate` | 评分 | `0` |
| `slider` | 滑块 | `0` |
| `uploader` | 图片上传 | `[]` |
| `picker` | 选择器 | `''` |
| `datePicker` | 时间选择 | `''` |
| `area` | 地区选择 | `''` |
| `areaStepCascader` | 步骤条省市区 | `''` |
| `calendar` | 日历 | `''` |
| `fieldMoney` | 金额输入 | `''` |
| `fieldChildren` | 动态子项列表 | `['']` |
| `rangeInput` | 范围录入 | `['', '']` |
| `uploaderFile` | 附件上传 | `[]` |

#### 各控件配置说明

`fieldMoney` 的 `currency`、`showMoneyUppercase` 等通过 `componentProps` 配置，`label`、`rules`、`labelTooltip` 等通过 `fieldProps` 配置。

`fieldChildren` 的 `addText`、`minItems`、`maxItems`、`defaultRowValue` 等通过 `componentProps` 配置；行模板通过 `componentProps.row` 渲染函数传入。`column.label` 作为列表标题。

`rangeInput` 的 `layout`（`vertical` \| `horizontal`）、`showDateShortcuts`、`shortcuts` 等通过 `componentProps` 配置；起止输入通过 `componentProps.start` / `end` 渲染函数传入。

`uploaderFile` 的 `description`、`upload`、`accept`、`maxSize`、`maxCount`、`uploadText` 等通过 `componentProps` 配置；`upload` 需返回 Promise。与 `uploader`（图片上传）不同，适用于文档等附件场景。

`picker` / `area` 需在 `componentProps` 传入 `columns`、`areaList`；`areaStepCascader` 的 `title`、`options` 等通过 `componentProps` 透传，未传 `options` 时使用内置省市区数据；`datePicker` / `calendar` 的弹层参数通过 `componentProps` 透传。

### Events

与 [Form](/#/zh-CN/form) 一致：

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| submit | 校验通过并提交 | _values: Record\<string, unknown\>_ |
| failed | 校验失败 | _{ values, errors }_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 追加在 `columns` 之后的表单项 |
| footer | 提交按钮上方区域 |
| submit | 自定义提交按钮 |
| input-{name} | 覆盖对应项的 `#input` |
| field-{name} | 完全自定义表单项 |

### 方法

通过 ref 可调用与 [Form](/#/zh-CN/form) 相同的方法：`submit`、`validate`、`getValues` 等。
