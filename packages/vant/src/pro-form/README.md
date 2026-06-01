# ProForm `new`

### Introduction

Schema-driven form built on `Form` and `Field`. Configure fields via `columns`, with built-in controls (Switch, Picker, money input, dynamic list, range input, file upload, etc.) and extensible custom fields via `render` and `components`.

### Install

```js
import { createApp } from 'vue';
import { ProForm } from 'vant';

const app = createApp();
app.use(ProForm);
```

## Demo

### Schema

Use `v-model` for form data and `columns` for each field. See [demo/index.vue](./demo/index.vue) for the full example.

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
    name: 'picker',
    label: 'Picker',
    component: 'picker',
    fieldProps: { placeholder: 'Select city' },
    componentProps: { columns: cityColumns },
  },
  // switch, checkbox, radio, stepper, rate, slider,
  // datePicker, area, areaStepCascader, calendar, uploader, ...
]);

const onSubmit = (values) => console.log('submit', values);
const onFailed = ({ values, errors }) => console.log('failed', values, errors);
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
  },
  componentProps: { currency: '¥' },
}
```

### Dynamic list (`fieldChildren`)

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
    row: () => <Field label="Option" placeholder="Please enter" border={false} />,
  },
}
```

### Range input

```js
{
  name: 'range',
  label: 'Range Input',
  component: 'rangeInput',
  defaultValue: ['', ''],
  componentProps: {
    layout: 'vertical', // or 'horizontal'
    start: () => <Field inputBorder placeholder="Start" />,
    end: () => <Field inputBorder placeholder="End" />,
  },
}
```

### File upload (`uploaderFile`)

```js
{
  name: 'attachments',
  label: 'File Upload',
  component: 'uploaderFile',
  defaultValue: [],
  componentProps: {
    description: ['Supported formats: DOC, PPT, XLS, ...', 'Max 20MB, batch upload supported.'],
    upload: (item) =>
      new Promise((resolve) => {
        resolve({ url: `https://example.com/${item.file?.name}` });
      }),
    accept: '*',
    multiple: true,
    maxSize: 20 * 1024 * 1024,
  },
}
```

### Custom component

```js
const components = {
  cityPicker: ({ value, setValue }) =>
    h(CityPicker, { modelValue: value, 'onUpdate:modelValue': setValue }),
};
```

```html
<van-pro-form v-model="model" :columns="columns" :components="components" />
```

Column `render` (function or Vue component) overrides `component` / `components` for that row. Slots: `input-{name}`, `field-{name}`, `default`, `footer`, `submit`.

For complex custom fields, use `useCustomFieldValue` inside the component. See `demo/ProFormDeliverySlotField.tsx`.

## API

Inherits [Form](/#/en-US/form) props, events, and methods.

| Prop | Description | Type | Default |
| --- | --- | --- | --- |
| columns | Field schema | _ProFormColumn[]_ | `[]` |
| model-value | Form data (`v-model`) | _Record<string, unknown>_ | - |
| components | Custom component map | _ProFormComponentMap_ | `{}` |
| inset | Inset CellGroup style | _boolean_ | `true` |
| show-submit | Show submit button | _boolean_ | `true` |
| submit-text | Submit button text | _string_ | `Submit` |

### Built-in `component` values

`switch`, `checkbox`, `checkboxGroup`, `radio`, `stepper`, `rate`, `slider`, `uploader`, `picker`, `datePicker`, `area`, `areaStepCascader`, `calendar`, `fieldMoney`, `fieldChildren`, `rangeInput`, `uploaderFile`, `field`.

See [Chinese documentation](./README.zh-CN.md) for default values per component and `componentProps` / `fieldProps` details.

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| submit | Validation passed | _values_ |
| failed | Validation failed | _{ values, errors }_ |
