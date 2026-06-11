# ProForm `new`

### Introduction

Schema-driven form built on `Form` and `Field`. Configure fields via `columns`, with built-in controls for Field, Switch, pickers, radio/checkbox, money input, dynamic list, range input, file upload, etc., and extensible custom fields via `render` and `fieldSlots`.

### Install

```js
import { createApp } from 'vue';
import { ProForm } from 'vant';

const app = createApp();
app.use(ProForm);
```

## Demo

### Basic components

Use `v-model` for form data and `columns` for Field, Switch, Stepper, Rate, Slider, etc.

```html
<van-pro-form
  v-model="model"
  ref="formRef"
  :columns="columns"
  submit-text="Submit"
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
    label: 'Username',
    component: 'field',
    fieldProps: {
      placeholder: 'Enter username',
      rules: [{ required: true, message: 'Enter username' }],
    },
  },
  {
    name: 'switch',
    label: 'Switch',
    component: 'switch',
    fieldProps: { inputAlign: 'right' },
  },
  {
    name: 'stepper',
    label: 'Stepper',
    component: 'stepper',
    fieldProps: { inputAlign: 'right' },
  },
  {
    name: 'rate',
    label: 'Rate',
    component: 'rate',
    defaultValue: 3,
    fieldProps: { inputAlign: 'right' },
  },
  {
    name: 'slider',
    label: 'Slider',
    component: 'slider',
    defaultValue: 50,
    fieldProps: { labelAlign: 'top' },
  },
]);

const onSubmit = (values) => console.log('submit', values);
const onFailed = ({ values, errors }) => console.log('failed', values, errors);
```

### Select fields

Picker-style controls: `picker`, `datePicker`, `area`, `areaStepCascader`, `calendar`. Pass `columns`, `areaList`, etc. via `componentProps`.

```js
const columns = computed(() => [
  {
    name: 'picker',
    label: 'Picker',
    component: 'picker',
    fieldProps: { placeholder: 'Select city' },
    componentProps: { columns: cityColumns },
  },
  {
    name: 'datePicker',
    label: 'Datetime Picker',
    component: 'datePicker',
    fieldProps: { placeholder: 'Select time' },
  },
  {
    name: 'area',
    label: 'Area Picker',
    component: 'area',
    fieldProps: { placeholder: 'Select area' },
    componentProps: { areaList },
  },
  {
    name: 'areaStepCascader',
    label: 'Step Area Picker',
    component: 'areaStepCascader',
    fieldProps: { placeholder: 'Select area' },
  },
  {
    name: 'calendar',
    label: 'Calendar',
    component: 'calendar',
    fieldProps: { placeholder: 'Select date', labelTooltip: '111' },
  },
]);
```

### Radio

`radioGroup` for inline layout, `radioPicker` for popup selection. Set `componentProps.isList` for list-style options with optional `cellProps`.

```js
const columns = computed(() => [
  {
    name: 'radio',
    label: 'Radio',
    component: 'radioGroup',
    fieldProps: { labelAlign: 'top' },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: 'Radio 1', value: '1' },
        { label: 'Radio 2', value: '2' },
      ],
    },
  },
  {
    name: 'radioPicker',
    label: 'Radio Popup',
    component: 'radioPicker',
    defaultValue: '1',
    fieldProps: { placeholder: 'Select option' },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: 'Radio 1', value: '1' },
        { label: 'Radio 2', value: '2' },
      ],
    },
  },
  {
    name: 'radioListPicker',
    label: 'Radio List Popup',
    component: 'radioPicker',
    defaultValue: '1',
    fieldProps: { placeholder: 'Select option' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
  {
    name: 'radioListPickerGroup',
    label: 'Radio List Popup',
    component: 'radioGroup',
    defaultValue: '1',
    fieldProps: { labelAlign: 'top', placeholder: 'Select option' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
]);
```

### Checkbox group

`checkboxGroup` for inline layout, `checkboxPicker` for popup multi-select. Use `fieldProps.labelCollapsible` for long labels.

```js
const columns = computed(() => [
  {
    name: 'checkboxGroup',
    label: 'Checkbox Group',
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
        { label: 'Checkbox 1', value: '1' },
        { label: 'Checkbox 2', value: '2' },
        { label: 'Checkbox 3', value: '3' },
      ],
    },
  },
  {
    name: 'checkboxPicker',
    label: 'Checkbox Popup',
    component: 'checkboxPicker',
    defaultValue: ['1'],
    fieldProps: { placeholder: 'Select options' },
    componentProps: {
      shape: 'block',
      columns: 3,
      direction: 'horizontal',
      options: [
        { label: 'Checkbox 1', value: '1' },
        { label: 'Checkbox 2', value: '2' },
      ],
    },
  },
  {
    name: 'checkboxListPicker',
    label: 'Checkbox List Popup',
    component: 'checkboxPicker',
    defaultValue: ['1'],
    fieldProps: { placeholder: 'Select options' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
  {
    name: 'checkboxListPickerGroup',
    label: 'Checkbox Popup',
    component: 'checkboxGroup',
    defaultValue: ['1'],
    fieldProps: { labelAlign: 'top', placeholder: 'Select options' },
    componentProps: {
      isList: true,
      options: listOptions,
    },
  },
]);
```

### Money input

```js
{
  name: 'amount',
  label: 'Money Input',
  component: 'fieldMoney',
  defaultValue: '1000',
  fieldProps: {
    placeholder: 'Enter amount',
    labelTooltip: 'Transfer amount hint',
    rules: [{ required: true, message: 'Enter amount' }],
    errorMessageInfo: true,
  },
  componentProps: { currency: '¥' },
}
```

### Dynamic list (`fieldChildren`)

`row` accepts a column config or a render function.

```js
{
  name: 'options',
  label: 'Addable option list',
  component: 'fieldChildren',
  defaultValue: ['', ''],
  componentProps: {
    addText: 'Add',
    minItems: 1,
    maxItems: 5,
    defaultRowValue: 'New option',
    row: {
      component: 'field',
      fieldProps: {
        label: 'Option',
        placeholder: 'Please enter',
        border: false,
      },
    },
  },
}
```

Render function form is also supported:

```js
import { Field } from 'vant';

componentProps: {
  row: () => <Field label="Option" placeholder="Please enter" border={false} />,
}
```

### Range input

`start` / `end` accept a column config or a render function.

```js
const columns = computed(() => [
  {
    name: 'rangeVertical',
    label: 'Vertical layout',
    component: 'rangeInput',
    defaultValue: ['', ''],
    fieldProps: {
      rules: [{
        required: true,
        message: 'Please enter',
        validator: (value) => value[0] !== '' && value[1] !== '',
      }],
    },
    componentProps: {
      layout: 'vertical',
      start: {
        component: 'field',
        fieldProps: { inputBorder: true, placeholder: 'Please enter' },
      },
      end: {
        component: 'field',
        fieldProps: { inputBorder: true, placeholder: 'Please enter' },
      },
    },
  },
  {
    name: 'rangeHorizontal',
    label: 'Horizontal layout',
    component: 'rangeInput',
    defaultValue: ['', ''],
    fieldProps: {
      rules: [{ required: true, message: 'Please enter' }],
    },
    componentProps: {
      layout: 'horizontal',
      start: {
        component: 'field',
        fieldProps: { inputBorder: true, placeholder: 'Please enter' },
      },
      end: {
        component: 'field',
        fieldProps: { inputBorder: true, placeholder: 'Please enter' },
      },
    },
  },
  {
    name: 'rangeDatePicker',
    label: 'Datetime Picker',
    component: 'rangeInput',
    defaultValue: ['', ''],
    componentProps: {
      layout: 'vertical',
      showDateShortcuts: true,
      start: {
        component: 'datePicker',
        fieldProps: { inputBorder: true, placeholder: 'Select time' },
      },
      end: {
        component: 'datePicker',
        fieldProps: { inputBorder: true, placeholder: 'Select time' },
      },
    },
  },
]);
```

Render functions are also supported:

```js
componentProps: {
  start: () => <Field inputBorder placeholder="Please enter" />,
  end: () => <Field inputBorder placeholder="Please enter" />,
}
```

### Delivery slot

Use `render` for custom fields. See `demo/ProFormDeliverySlotField.tsx` for the full implementation.

```js
{
  name: 'deliverySlot',
  label: 'Delivery Slot',
  defaultValue: { date: '2026/5/28', period: 'morning', urgent: false },
  fieldProps: {
    rules: [{
      validator: (val) => !!(val?.date && val?.period),
      message: 'Please complete delivery info',
    }],
  },
  render: () => <ProFormDeliverySlotField />,
  componentProps: {
    placeholder: 'Select date and time slot',
    popupTitle: 'Select delivery slot',
    dateTitle: 'Date',
    periodTitle: 'Time slot',
    urgentLabel: 'Express delivery',
    urgentTag: 'Express',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    periodOptions: [
      { label: 'Morning 9:00-12:00', value: 'morning' },
      { label: 'Afternoon 14:00-18:00', value: 'afternoon' },
      { label: 'Evening 19:00-21:00', value: 'evening' },
    ],
  },
}
```

### Field slots

Pass Field slots such as `label-comment` and `input-comment` via `fieldSlots`:

```js
const columns = computed(() => [
  {
    name: 'uploader',
    label: 'Uploader',
    component: 'uploader',
    defaultValue: [],
    fieldProps: { labelAlign: 'top' },
    componentProps: { maxCount: 2 },
    fieldSlots: {
      'label-comment': () => <div>JPG/PNG, max 2MB per image</div>,
    },
  },
  {
    name: 'attachments',
    label: 'File Upload',
    component: 'uploaderFile',
    defaultValue: [],
    fieldProps: {
      rules: [{ required: true, message: 'Please enter' }],
    },
    componentProps: {
      uploadText: 'Add Attachment',
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
          Supported formats: DOC, PPT, XLS, VSD, POT, etc.
          Max file size 20MB. Batch upload supported.
        </div>
      ),
    },
  },
  {
    name: 'remark',
    label: 'Remark',
    component: 'field',
    fieldProps: { placeholder: 'Enter username' },
    fieldSlots: {
      'input-comment': 'Enter supplementary notes for your business',
    },
  },
]);
```

### Custom field slot

Use `#field-{name}` to fully customize a form item. If `column.slot` is configured, the slot name uses `slot`, while the value is still written to the form item matching `name`.

```html
<van-pro-form v-model="model" :columns="columns" :show-submit="false">
  <template #field-contact="{ column, value, setValue }">
    <van-field
      :name="column.name"
      :label="column.label"
      :model-value="value"
      placeholder="Enter contact"
      @update:model-value="setValue"
    >
      <template #button>
        <van-button size="small" type="primary" @click="setValue('Alex')">
          Fill
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
    label: 'Contact',
    slot: 'contact',
  },
]);
```

## API

Inherits [Form](/#/en-US/form) props, events, and methods.

| Prop | Description | Type | Default |
| --- | --- | --- | --- |
| columns | Field schema | _ProFormColumn[]_ | `[]` |
| model-value | Form data (`v-model`) | _Record<string, unknown>_ | - |
| components | Custom component map | _ProFormComponentMap_ | `{}` |
| inset | Inset CellGroup style | _boolean_ | `false` |
| show-submit | Show submit button | _boolean_ | `true` |
| submit-text | Submit button text | _string_ | `Submit` |

### Built-in `component` values

`switch`, `checkbox`, `checkboxGroup`, `radio`, `radioGroup`, `radioPicker`, `checkboxPicker`, `stepper`, `rate`, `slider`, `uploader`, `picker`, `datePicker`, `area`, `areaStepCascader`, `calendar`, `fieldMoney`, `fieldChildren`, `rangeInput`, `uploaderFile`, `field`.

See [Chinese documentation](./README.zh-CN.md) for default values per component and `componentProps` / `fieldProps` details.

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| submit | Validation passed | _values_ |
| failed | Validation failed | _{ values, errors }_ |
