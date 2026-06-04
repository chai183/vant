# ProForm 高级表单 `new`

### 介绍

基于 `Form` + `Field` 的配置化表单，通过 `columns` 描述表单项，内置 Field、Switch、选择器、单选/多选、金额输入、动态子项、范围录入、附件上传等控件，并支持 `render` 与 `fieldSlots` 扩展。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { ProForm } from 'vant';

const app = createApp();
app.use(ProForm);
```

## 代码演示

### 基础组件

使用 `v-model` 绑定表单数据，`columns` 配置 Field、Switch、Stepper、Rate、Slider 等基础控件。

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
]);

const onSubmit = (values) => {
  console.log('submit', values);
};

const onFailed = ({ values, errors }) => {
  console.log('failed', values, errors);
};
```

### 选择类字段

`picker`、`datePicker`、`area`、`areaStepCascader`、`calendar` 等选择类控件，需在 `componentProps` 传入 `columns`、`areaList` 等数据。

```js
const columns = computed(() => [
  {
    name: 'picker',
    label: '选择器',
    component: 'picker',
    fieldProps: { placeholder: '请选择城市' },
    componentProps: { columns: cityColumns },
  },
  {
    name: 'datePicker',
    label: '时间选择',
    component: 'datePicker',
    fieldProps: { placeholder: '请选择时间' },
  },
  {
    name: 'area',
    label: '地区选择',
    component: 'area',
    fieldProps: { placeholder: '请选择省市区' },
    componentProps: { areaList },
  },
  {
    name: 'areaStepCascader',
    label: '步骤条省市区',
    component: 'areaStepCascader',
    fieldProps: { placeholder: '请选择省市区' },
  },
  {
    name: 'calendar',
    label: '日历',
    component: 'calendar',
    fieldProps: { placeholder: '请选择日期', labelTooltip: '111' },
  },
]);
```

### 单选框

支持 `radioGroup` 平铺展示，以及 `radioPicker` 弹窗选择；通过 `componentProps.isList` 切换为列表样式，`options` 可配置 `cellProps` 等 Cell 属性。

```js
const columns = computed(() => [
  {
    name: 'radio',
    label: '单选框',
    component: 'radioGroup',
    fieldProps: { labelAlign: 'top' },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: '单选框 1', value: '1' },
        { label: '单选框 2', value: '2' },
      ],
    },
  },
  {
    name: 'radioPicker',
    label: '单选弹窗',
    component: 'radioPicker',
    defaultValue: '1',
    fieldProps: { placeholder: '请选择' },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: '单选框 1', value: '1' },
        { label: '单选框 2', value: '2' },
      ],
    },
  },
  {
    name: 'radioListPicker',
    label: '单选列表弹窗',
    component: 'radioPicker',
    defaultValue: '1',
    fieldProps: { placeholder: '请选择' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
  {
    name: 'radioListPickerGroup',
    label: '单选列表弹窗',
    component: 'radioGroup',
    defaultValue: '1',
    fieldProps: { labelAlign: 'top', placeholder: '请选择' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
]);
```

### 复选框组

支持 `checkboxGroup` 平铺展示，以及 `checkboxPicker` 弹窗多选；可配合 `fieldProps.labelCollapsible` 折叠长标签。

```js
const columns = computed(() => [
  {
    name: 'checkboxGroup',
    label: '复选框组',
    component: 'checkboxGroup',
    fieldProps: {
      labelAlign: 'top',
      labelCollapsible: true,
    },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: '复选框 1', value: '1' },
        { label: '复选框 2', value: '2' },
        { label: '复选框 3', value: '3' },
      ],
    },
  },
  {
    name: 'checkboxPicker',
    label: '多选弹窗',
    component: 'checkboxPicker',
    defaultValue: ['1'],
    fieldProps: { placeholder: '请选择' },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: '复选框 1', value: '1' },
        { label: '复选框 2', value: '2' },
      ],
    },
  },
  {
    name: 'checkboxListPicker',
    label: '多选列表弹窗',
    component: 'checkboxPicker',
    defaultValue: ['1'],
    fieldProps: { placeholder: '请选择' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
  {
    name: 'checkboxListPickerGroup',
    label: '多选弹窗',
    component: 'checkboxGroup',
    defaultValue: ['1'],
    fieldProps: { labelAlign: 'top', placeholder: '请选择' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
]);
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
    errorMessageInfo: true,
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
const columns = computed(() => [
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
  },
  {
    name: 'rangeHorizontal',
    label: '范围录入-左右布局',
    component: 'rangeInput',
    defaultValue: ['', ''],
    fieldProps: {
      rules: [{ required: true, message: '请输入' }],
    },
    componentProps: {
      layout: 'horizontal',
      start: () => <Field inputBorder placeholder="请输入" />,
      end: () => <Field inputBorder placeholder="请输入" />,
    },
  },
]);
```

### 配送时段

通过 `render` 自定义表单项，`componentProps` 透传给自定义组件。完整实现见 `demo/ProFormDeliverySlotField.tsx`。

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
  render: () => <ProFormDeliverySlotField />,
  componentProps: {
    placeholder: '请选择配送日期与时段',
    popupTitle: '选择配送时段',
    dateTitle: '配送日期',
    periodTitle: '配送时段',
    urgentLabel: '加急配送',
    urgentTag: '加急',
    confirmText: '确定',
    cancelText: '取消',
    periodOptions: [
      { label: '上午 9:00-12:00', value: 'morning' },
      { label: '下午 14:00-18:00', value: 'afternoon' },
      { label: '晚上 19:00-21:00', value: 'evening' },
    ],
  },
}
```

### Field 插槽透传

通过 `fieldSlots` 向 Field 透传 `label-comment`、`input-comment` 等插槽，适用于上传说明、备注提示等场景。

```js
const columns = computed(() => [
  {
    name: 'uploader',
    label: '上传图片',
    component: 'uploader',
    defaultValue: [],
    fieldProps: { labelAlign: 'top' },
    componentProps: { maxCount: 2 },
    fieldSlots: {
      'label-comment': () => (
        <div>支持 jpg、png 格式，单张不超过 2MB</div>
      ),
    },
  },
  {
    name: 'attachments',
    label: '上传文件',
    component: 'uploaderFile',
    defaultValue: [],
    fieldProps: {
      rules: [{ required: true, message: '请输入' }],
    },
    componentProps: {
      uploadText: '添加附件',
      upload: (item) =>
        new Promise((resolve) => {
          resolve({ url: `https://example.com/${item.file?.name}` });
        }),
      accept: '*',
      multiple: true,
      maxSize: 20 * 1024 * 1024,
    },
    fieldSlots: {
      'label-comment': () => (
        <div>
          所上传格式支持 DOC/PPT/XLS/VSD/POT 等
          所上传文件大小控制在 20M 以内，支持批量上传
        </div>
      ),
    },
  },
  {
    name: 'remark',
    label: '备注',
    component: 'field',
    fieldProps: { placeholder: '请输入用户名' },
    fieldSlots: {
      'input-comment': '请输入与业务相关的补充说明',
    },
  },
]);
```

### 完全自定义表单项

通过 `#field-{name}` 可以完全自定义表单项；当配置 `column.slot` 时，插槽名使用 `slot`，字段值仍写入 `name` 对应的表单项。

```html
<van-pro-form v-model="model" :columns="columns" :show-submit="false">
  <template #field-contact="{ column, value, setValue }">
    <van-field
      :name="column.name"
      :label="column.label"
      :model-value="value"
      placeholder="请输入联系人"
      @update:model-value="setValue"
    >
      <template #button>
        <van-button size="small" type="primary" @click="setValue('张三')">
          填入
        </van-button>
      </template>
    </van-field>
  </template>
</van-pro-form>
```

```js
const model = ref({ contactName: '' });

const columns = computed(() => [
  {
    name: 'contactName',
    label: '联系人',
    slot: 'contact',
  },
]);
```

## API

### ProForm Props

支持 [Form 组件](/#/zh-CN/form#props) 的全部 Props，并额外提供：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 表单项配置 | _ProFormColumn[]_ | `[]` |
| model-value | 表单数据（支持 `v-model`） | _Record<string, unknown>_ | - |
| components | 自定义控件注册表，`key` 为 `column.component` | _ProFormComponentMap_ | `{}` |
| inset | 是否使用圆角卡片风格 CellGroup | _boolean_ | `false` |
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
| fieldSlots | 透传 Field 插槽，如 `label-comment` 等 | _object_ |
| componentProps | 透传控件 | _object_ |
| hidden | 是否隐藏 | _boolean \| (model) => boolean_ |
| slot | 自定义插槽名，等价于 `#field-{slot}` / `#input-{slot}` 中的 `slot` 名 | _string_ |
| render | 行内自定义渲染，优先级高于 component | _(ctx) => VNode_ \| _Component_ |

#### 内置 component 与默认初始值

| component | 说明 | 未设置 defaultValue 时的默认值 |
| --- | --- | --- |
| `field` | 原生 Field 输入 | `''` |
| `switch` | 开关 | `false` |
| `checkbox` | 复选框 | `false` |
| `checkboxGroup` | 复选框组 | `[]` |
| `radio` | 单选框（同 `radioGroup`） | `''` |
| `radioGroup` | 单选框组 | `''` |
| `radioPicker` | 单选弹窗 | `''` |
| `checkboxPicker` | 多选弹窗 | `[]` |
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

`radioGroup` / `radioPicker` / `checkboxGroup` / `checkboxPicker` 的 `shape`、`columns`、`direction`、`isList`、`options` 等通过 `componentProps` 配置；列表模式下 `options` 项可含 `cellProps` 透传 Cell 属性。

`fieldMoney` 的 `currency`、`showMoneyUppercase` 等通过 `componentProps` 配置，`label`、`rules`、`labelTooltip` 等通过 `fieldProps` 配置。

`fieldChildren` 的 `addText`、`minItems`、`maxItems`、`defaultRowValue` 等通过 `componentProps` 配置；行模板通过 `componentProps.row` 渲染函数传入。`column.label` 作为列表标题。

`rangeInput` 的 `layout`（`vertical` \| `horizontal`）通过 `componentProps` 配置；起止输入通过 `componentProps.start` / `end` 渲染函数传入。

`uploaderFile` 的 `upload`、`accept`、`maxSize`、`maxCount`、`uploadText` 等通过 `componentProps` 配置；`upload` 需返回 Promise。说明文案可通过 `fieldSlots['label-comment']` 透传。与 `uploader`（图片上传）不同，适用于文档等附件场景。

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
