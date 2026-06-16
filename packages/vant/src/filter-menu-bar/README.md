# FilterMenuBar

### Intro

A ProForm-based filter menu template. It implements the filter bar, dropdown panels, sort item, funnel aggregation, and validation internally, while form panels are rendered from `ProForm` columns. Footer actions can be customized by slots.

### Install

```js
import { createApp } from 'vue';
import { FilterMenuBar } from 'vant';

const app = createApp();
app.use(FilterMenuBar);
```

## Usage

### Basic Usage

```html
<van-filter-menu-bar v-model="model" :columns="items" />
```

```js
import { ref } from 'vue';

const model = ref({
  status: { status: 'all' },
});

const items = [
  {
    key: 'status',
    title: 'Status',
    columns: [
      {
        name: 'status',
        label: 'Status',
        component: 'radioGroup',
        defaultValue: 'all',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [
            { label: 'All', value: 'all' },
            { label: 'On sale', value: 'sale' },
          ],
        },
      },
    ],
  },
];
```

### With Funnel

When the item count is greater than `overflow-threshold`, extra items will be grouped into the right filter entry. The bar keeps `overflow-threshold - 1` items at most.

```html
<van-filter-menu-bar
  v-model="model"
  :columns="items"
  :overflow-threshold="4"
  funnel-title="Filter"
/>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Filter model | _FilterMenuBarModel_ | `{}` |
| config | Filter config | _FilterMenuBarConfig_ | - |
| columns | Filter item config array | _FilterMenuBarItem[]_ | - |
| active-color | Active color of title and icon | _string_ | `var(--van-primary-color)` |
| overflow-threshold | Threshold for grouping items into funnel | _number \| string_ | `4` |
| funnel-title | Funnel entry title | _string_ | `Filter` |

`searchable` is reserved in item config and will be connected when ProForm supports searching.

### FilterMenuBarItem

| Key | Description | Type |
| --- | --- | --- |
| key | Unique item key | _string_ |
| title | Bar title | _string_ |
| disabled | Whether to disable the item | _boolean_ |
| sort | Whether it is a sort item, toggles `default / asc / desc` without rendering a panel | _boolean_ |
| showFieldLabel | Whether to show the `Field` label in a normal single-column panel | _boolean_ |
| columns | ProForm columns | _ProFormColumn[]_ |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| change | Emitted when filter model changes | _model, payload_ |
| closed-change | Emitted after filter model changes and all popups are closed | _model_ |
| sort | Emitted when sort item is clicked | _payload_ |

### Methods

Use ref to get the FilterMenuBar instance and call instance methods.

| Name | Description | Parameters | Return value |
| --- | --- | --- | --- |
| validate | Validate the whole funnel panel manually; failed sections are expanded | - | _Promise<void>_ |

### Slots

| Name | Description | SlotProps |
| --- | --- | --- |
| panel-{key} | Replace a specified filter panel | _{ item, model, updateModel, close }_ |
| item-{key} | Append content to the specified ProForm panel | _{ item, model, updateModel }_ |
| panel-footer | Custom normal panel footer | _{ item, model, updateModel, close }_ |
| panel-footer-{key} | Custom specified normal panel footer | _{ item, model, updateModel, close }_ |
| funnel-footer | Custom funnel footer | _{ items, model, close }_ |
