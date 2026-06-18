# FilterMenuBar 筛选菜单栏 `new`

### 介绍

基于 [ProForm](#/zh-CN/pro-form) 的筛选菜单栏组件，在内部实现筛选条、普通下拉面板、排序项、漏斗聚合面板、折叠分组和校验等交互；面板表单内容由 `columns` 配置，通过 ProForm / Field 等组件渲染。

`v-model` 为扁平结构，一级 key 与 `FilterMenuBarItem.key` 对应（通常也与 `columns[].name` 一致），例如 `{ menuList: 'a' }`。

需确认的面板（如多选、区间输入）可设置 `showFooter: true`，点击确定后提交并触发 `confirm` 事件；点击遮罩或外部关闭不会提交本轮改动。单选列表选中等即时面板选中即提交。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { FilterMenuBar } from 'vant';

const app = createApp();
app.use(FilterMenuBar);
```

## 代码演示

### 带漏斗的

当筛选项数量超过 `overflow-threshold` 时，其余筛选项会收拢进漏斗入口；筛选条上最多保留 `overflow-threshold - 1` 个筛选项。筛选项面板通过 `columns` 中的 ProForm 配置渲染；单选列表选中后，筛选条标题会回显选中项的 `label`。

默认 `overflow-threshold` 为 `4` 时，筛选条保留前 3 项，其余项收拢进漏斗面板。漏斗内分组标题取自 ProForm 字段 `label`，支持折叠展开。

```html
<van-filter-menu-bar
  ref="funnelRef"
  v-model="funnelModel"
  :columns="funnelItems"
  :overflow-threshold="4"
  funnel-title="筛选"
/>
<van-cell title="model" :label="JSON.stringify(funnelModel)" />
```

```js
import { ref } from 'vue';

const AMOUNT_MIN = 0;
const AMOUNT_MAX = 100000000000;

const funnelRef = ref();

const funnelModel = ref({
  filterItem1: 'all',
  filterItem2: ['brand-a'],
  filterItem3: ['keyword-a'],
  tagNormalTwo: 'digital',
  tagFoldThree: 'food',
  tagNormalFour: 'home',
  tagIconThree: 'digital',
  range: [400, 800],
  amountRange: [3000, 30000000000],
  date: ['2024-05-01', '2024-05-22'],
  radioTitle: 'all',
  checkboxTitle: ['delivery'],
  keyword: '手机',
  amount: AMOUNT_MIN,
});

// funnelItems 及选项数据见文末「完整配置数据 — funnelItems」
```

### 面板类型（标签单选 / 日期面板 / 侧栏）

`FilterMenuBar` 负责筛选条布局，筛选项面板通过 `columns` 配置渲染；也可以通过 `#panel-{key}` 插槽接入自定义组件。

```html
<van-filter-menu-bar
  v-model="panelTypesModel"
  :columns="panelTypesItems"
  :overflow-threshold="10"
>
  <template #panel-area="{ model, updateModel }">
    <van-cascade-tree-select
      :model-value="model.area"
      v-model:expand-path="panelTypesAreaExpandPath"
      :items="panelTypesAreaItems"
      active-color="#ff8125"
      height="260"
      multiple
      @update:model-value="updateModel({ area: $event })"
    />
  </template>
</van-filter-menu-bar>
```

```js
import { ref } from 'vue';

const panelTypesModel = ref({
  category: 'digital',
  date: ['2024-05-01', '2024-05-22'],
  area: ['tag-1-1', 'tag-1-2'],
});

const panelTypesAreaExpandPath = ref(['tag-1']);

const panelTypesAreaItems = [
  {
    text: '一级标签一',
    value: 'tag-1',
    children: [
      { text: '二级标签 1-1', value: 'tag-1-1', badge: 3 },
      { text: '二级标签 1-2', value: 'tag-1-2' },
      { text: '二级标签 1-3', value: 'tag-1-3', dot: true },
    ],
  },
  {
    text: '一级标签二',
    value: 'tag-2',
    children: [
      { text: '二级标签 2-1', value: 'tag-2-1' },
      { text: '二级标签 2-2', value: 'tag-2-2' },
    ],
  },
  {
    text: '一级标签三',
    value: 'tag-3',
    children: [
      { text: '二级标签 3-1', value: 'tag-3-1' },
      { text: '二级标签 3-2', value: 'tag-3-2' },
    ],
  },
];

const panelTypesAreaOptions = panelTypesAreaItems.flatMap(
  (option) => option.children ?? [],
);

// panelTypesItems 见文末「完整配置数据 — panelTypesItems」
```

### 禁用与排序

筛选项支持禁用状态，也支持不渲染面板、仅切换排序状态的排序项。

```html
<van-filter-menu-bar
  v-model="stateTypesModel"
  :columns="stateTypesItems"
  :overflow-threshold="10"
  @sort="stateTypesSortEvent = $event"
/>
```

```js
import { ref } from 'vue';

const stateTypesModel = ref({ order: 'default' });
const stateTypesSortEvent = ref();

const stateTypesItems = [
  { key: 'disabled', title: '禁用', disabled: true, columns: [] },
  { key: 'order', title: '排序', sort: true },
];
```

### 单个筛选项

用于展示单行 1 个筛选项在选中超长选项文案后的标题省略效果。可通过 `cellProps.titleTextClass: 'van-ellipsis'` 控制选项文案省略。

```html
<van-filter-menu-bar
  v-model="singleItemModel"
  :columns="singleItemItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const singleItemModel = ref({ single: '' });

// singleItemItems 见文末「完整配置数据 — singleItemItems」
```

### 两个筛选项

用于展示单行 2 个筛选项在选中超长选项文案后的标题省略效果。

```html
<van-filter-menu-bar
  v-model="doubleItemModel"
  :columns="doubleItemItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const doubleItemModel = ref({ first: 'a', second: 'a' });

// doubleItemItems 见文末「完整配置数据 — doubleItemItems」
```

### 空 options

当 `options` 为空数组时，可通过 `#panel-{key}` 插槽自定义空状态内容，推荐使用 [Empty](#/zh-CN/empty) 组件。

```html
<van-filter-menu-bar
  v-model="emptyOptionsModel"
  :columns="emptyOptionsItems"
  :overflow-threshold="10"
>
  <template #panel-empty>
    <van-empty image="default" description="暂无数据" />
  </template>
</van-filter-menu-bar>
```

```js
import { ref } from 'vue';

const emptyOptionsModel = ref({ empty: '' });

// emptyOptionsItems 见文末「完整配置数据 — emptyOptionsItems」
```

### 选择菜单（单选）

`radioGroup` 设置 `isList: true` 后即为选择菜单列表样式。选项可通过 `label` 配置字符串或字符串数组作为多级标题，通过 `cellProps.label` 配置辅助文字，通过 `cellProps.avatar` 配置头像。

```html
<van-filter-menu-bar
  v-model="menuListSingleModel"
  :columns="menuListSingleItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const menuListSingleModel = ref({ menuList: '' });

// menuListSingleItems 见文末「完整配置数据 — menuListSingleItems」
```

### 筛选内容面板：标签单选

通过 `radioGroup` 配合 `shape: 'block'` 渲染标签单选面板。

```html
<van-filter-menu-bar
  v-model="contentPanelTagModel"
  :columns="contentPanelTagItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const contentPanelTagModel = ref({ category: 'digital' });

// contentPanelTagItems 见文末「完整配置数据 — contentPanelTagItems」
```

### 筛选内容面板：标签多选

`checkboxGroup` 配合 `shape: 'block'` 渲染标签多选面板，此时 `v-model` 对应字段为数组。

```html
<van-filter-menu-bar
  v-model="contentPanelTagMultipleModel"
  :columns="contentPanelTagMultipleItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const contentPanelTagMultipleModel = ref({
  category: ['digital', 'home', 'all'],
});

// contentPanelTagMultipleItems 见文末「完整配置数据 — contentPanelTagMultipleItems」
```

### 筛选内容面板：单选头像

`radioGroup` 选项可通过 `cellProps.avatar` 在左侧展示 [Avatar](#/zh-CN/avatar) 头像。

```html
<van-filter-menu-bar
  v-model="contentPanelRadioModel"
  :columns="contentPanelRadioItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const contentPanelRadioModel = ref({ user: 'a' });

// contentPanelRadioItems 见文末「完整配置数据 — contentPanelRadioItems」
```

### 筛选内容面板：多选头像

```html
<van-filter-menu-bar
  v-model="contentPanelCheckboxModel"
  :columns="contentPanelCheckboxItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const contentPanelCheckboxModel = ref({ user: ['a', 'b'] });

// contentPanelCheckboxItems 见文末「完整配置数据 — contentPanelCheckboxItems」
```

### 筛选内容面板：选择菜单（多选）

`checkboxGroup` 设置 `isList: true` 后支持多选菜单列表，可通过 `searchable` 预留搜索能力，实际搜索由 `componentProps.showSearch` 或自定义面板实现。

```html
<van-filter-menu-bar
  v-model="contentPanelMenuListMultipleModel"
  :columns="contentPanelMenuListMultipleItems"
  :overflow-threshold="10"
/>
```

```js
import { ref } from 'vue';

const contentPanelMenuListMultipleModel = ref({ menuList: ['a', 'b'] });

// contentPanelMenuListMultipleItems 见文末「完整配置数据 — contentPanelMenuListMultipleItems」
```

## 完整配置数据

> 以下为本页各 Demo 使用的筛选项 `columns` 配置与相关选项数据，与 `demo/index.vue` 保持一致。

### funnelItems（带漏斗的）

```js
import { Search } from 'vant';
import stampFrameIcon from '../tag/assets/stamp-frame1.svg';

const AMOUNT_MIN = 0;
const AMOUNT_MAX = 100000000000;

const radioListOptions = [
  { label: '全部', value: 'all' },
  { label: '选项 A', value: 'a' },
  { label: '选项 B（禁用）', value: 'b', disabled: true },
  { label: '选项 C', value: 'c' },
];

const checkboxListOptions = [
  { label: '品牌 A', value: 'brand-a' },
  { label: '品牌 B', value: 'brand-b' },
  { label: '品牌 C', value: 'brand-c' },
  { label: '品牌 D', value: 'brand-d' },
];

const searchableCheckboxOptions = [
  {
    label: '关键词 A',
    value: 'keyword-a',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
  {
    label: '关键词 B',
    value: 'keyword-b',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
  {
    label: '关键词 C',
    value: 'keyword-c',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
  {
    label: '关键词 D',
    value: 'keyword-d',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
];

const tagOptions = [
  { label: '全部', value: 'all', icon: 'apps-o', disabled: true },
  { label: '数码', value: 'digital', icon: 'phone-o' },
  { label: '服饰', value: 'clothes', icon: 'bag-o' },
  { label: '食品', value: 'food', icon: 'gift-o' },
  { label: '家居', value: 'home', icon: 'home-o' },
  { label: '美妆', value: 'beauty', icon: 'smile-o' },
];

const tagNormalOptions = tagOptions.filter((option) => !option.disabled);
const tagIconOptions = tagOptions.filter(
  (option) => option.icon && !option.disabled,
);

const funnelItems = [
  {
    key: 'filterItem1',
    title: '筛选项1',
    columns: [
      {
        name: 'filterItem1',
        label: '筛选项1',
        component: 'radioGroup',
        defaultValue: 'all',
        fieldProps: { labelAlign: 'top' },
        componentProps: { isList: true, options: radioListOptions },
      },
    ],
  },
  {
    key: 'filterItem2',
    title: '筛选项2',
    showFooter: true,
    columns: [
      {
        name: 'filterItem2',
        label: '筛选项2',
        component: 'checkboxGroup',
        defaultValue: ['brand-a'],
        fieldProps: { labelAlign: 'top' },
        componentProps: { isList: true, options: checkboxListOptions },
      },
    ],
  },
  {
    key: 'filterItem3',
    title: '筛选项3',
    showFieldLabel: true,
    showFooter: true,
    searchable: true,
    searchPlaceholder: '搜索',
    columns: [
      {
        name: 'filterItem3',
        label: '查找关键字名称',
        component: 'checkboxGroup',
        defaultValue: ['keyword-a'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          showSearch: true,
          searchPlaceholder: '搜索',
          options: searchableCheckboxOptions,
        },
      },
    ],
  },
  {
    key: 'tagNormalTwo',
    title: '标签列表-常规',
    columns: [
      {
        name: 'tagNormalTwo',
        label: '标签列表-常规',
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 2,
          direction: 'horizontal',
          options: tagNormalOptions,
        },
      },
    ],
  },
  {
    key: 'tagFoldThree',
    title: '标签列表-可折叠',
    collapsible: true,
    defaultExpanded: false,
    columns: [
      {
        name: 'tagFoldThree',
        label: '标签列表-可折叠',
        component: 'radioGroup',
        defaultValue: 'food',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagNormalOptions,
        },
      },
    ],
  },
  {
    key: 'tagNormalFour',
    title: '标签列表-常规',
    columns: [
      {
        name: 'tagNormalFour',
        label: '标签列表-常规',
        component: 'radioGroup',
        defaultValue: 'home',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 4,
          direction: 'horizontal',
          options: tagNormalOptions,
        },
      },
    ],
  },
  {
    key: 'tagIconThree',
    title: '标签列表-常规',
    columns: [
      {
        name: 'tagIconThree',
        label: '标签列表-常规',
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagIconOptions,
        },
      },
    ],
  },
  {
    key: 'range',
    title: '选择区间',
    columns: [
      {
        name: 'range',
        label: '选择区间',
        component: 'slider',
        defaultValue: [400, 800],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          type: 'node-range',
          min: 200,
          max: 1000,
          step: 200,
        },
      },
    ],
  },
  {
    key: 'amountRange',
    title: '选择金额区间',
    columns: [
      {
        name: 'amountRange',
        label: '选择金额区间',
        component: 'slider',
        defaultValue: [3000, 30000000000],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          type: 'range',
          showInputs: true,
          min: AMOUNT_MIN,
          max: AMOUNT_MAX,
          minPlaceholder: '¥ 最低金额',
          maxPlaceholder: '¥ 最高金额',
        },
      },
    ],
  },
  {
    key: 'date',
    title: '日期',
    columns: [
      {
        name: 'date',
        label: '日期',
        component: 'rangeInput',
        defaultValue: ['', ''],
        componentProps: {
          layout: 'horizontal',
          showDateShortcuts: true,
          start: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
          end: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
        },
      },
    ],
  },
  {
    key: 'radioTitle',
    title: '单选标题',
    columns: [
      {
        name: 'radioTitle',
        label: '单选标题',
        component: 'radioGroup',
        defaultValue: 'all',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: [
            { label: '全部', value: 'all' },
            { label: '默认排序', value: 'default' },
            { label: '销量优先', value: 'sales' },
          ],
        },
      },
    ],
  },
  {
    key: 'checkboxTitle',
    title: '多选标题',
    columns: [
      {
        name: 'checkboxTitle',
        label: '多选标题',
        component: 'checkboxGroup',
        defaultValue: ['delivery'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: [
            { label: '包邮', value: 'delivery' },
            { label: '七天无理由', value: 'refund' },
            { label: '极速发货', value: 'fast' },
            { label: '官方自营', value: 'official' },
          ],
        },
      },
    ],
  },
  {
    key: 'keyword',
    title: '筛选关键词',
    columns: [
      {
        name: 'keyword',
        label: '筛选关键词',
        defaultValue: '手机',
        fieldProps: {
          labelAlign: 'top',
          rules: [{ required: true, message: '请输入关键词' }],
        },
        render: () => (
          <Search scene="filter-inner" placeholder="请输入关键词" />
        ),
      },
    ],
  },
  {
    key: 'amount',
    title: '选择金额',
    columns: [
      {
        name: 'amount',
        label: '选择金额',
        component: 'slider',
        defaultValue: AMOUNT_MIN,
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          type: 'single',
          showValue: true,
          min: AMOUNT_MIN,
          max: AMOUNT_MAX,
          unselectedText: '未选择',
        },
      },
    ],
  },
];
```

### panelTypesItems（面板类型）

```js
const tagOptions = [
  { label: '全部', value: 'all', icon: 'apps-o', disabled: true },
  { label: '数码', value: 'digital', icon: 'phone-o' },
  { label: '服饰', value: 'clothes', icon: 'bag-o' },
  { label: '食品', value: 'food', icon: 'gift-o' },
  { label: '家居', value: 'home', icon: 'home-o' },
  { label: '美妆', value: 'beauty', icon: 'smile-o' },
];

const panelTypesItems = [
  {
    key: 'category',
    title: '品类（标签单选）',
    columns: [
      {
        name: 'category',
        label: '品类',
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagOptions,
        },
      },
    ],
  },
  {
    key: 'date',
    title: '日期',
    showFooter: true,
    columns: [
      {
        name: 'date',
        label: '日期',
        component: 'rangeInput',
        defaultValue: ['', ''],
        componentProps: {
          layout: 'horizontal',
          showDateShortcuts: true,
          start: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
          end: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
        },
      },
    ],
  },
  {
    key: 'area',
    title: '地区',
    showFooter: true,
    columns: [
      {
        name: 'area',
        label: '地区',
        defaultValue: [],
        componentProps: { columns: panelTypesAreaOptions },
      },
    ],
  },
];
```

### singleItemItems（单个筛选项）

```js
const singleItemLongLabelA =
  '这是一个超级长超级长超级长的选项文案用于观察单个筛选项选中后标题返显是否可以稳定省略展示不会撑开菜单栏布局不会影响右侧图标也不会导致整体换行或者溢出到屏幕外面';
const singleItemLongLabelB =
  '这是另一个超级长超级长超级长的选项文案用于观察切换选中值之后菜单栏标题是否依然保持单行省略不会破坏筛选栏高度和左右间距';

const singleItemItems = [
  {
    key: 'single',
    title: '单个筛选项',
    columns: [
      {
        name: 'single',
        label: '单个筛选项',
        component: 'radioGroup',
        defaultValue: '',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [
            {
              label: singleItemLongLabelA,
              value: 'a',
              cellProps: {
                title: [singleItemLongLabelA],
                titleTextClass: 'van-ellipsis',
              },
            },
            {
              label: singleItemLongLabelB,
              value: 'b',
              cellProps: {
                title: [singleItemLongLabelB],
                titleTextClass: 'van-ellipsis',
              },
            },
          ],
        },
      },
    ],
  },
];
```

### doubleItemItems（两个筛选项）

```js
const doubleItemItems = [
  {
    key: 'first',
    title: '第一个筛选项',
    columns: [
      {
        name: 'first',
        label: '第一个筛选项',
        component: 'radioGroup',
        defaultValue: 'a',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [
            {
              label:
                '第一个筛选项里这是一个超级长超级长超级长的选项文案用于观察两个筛选项并排展示时选中返显是否能够正常省略不会把第二个筛选项挤出屏幕',
              value: 'a',
            },
            {
              label:
                '第一个筛选项里的第二个超级长选项文案用于验证不同选项切换时标题宽度省略表现是否一致并且不会影响排序图标和下拉图标对齐',
              value: 'b',
            },
          ],
        },
      },
    ],
  },
  {
    key: 'second',
    title: '第二个筛选项',
    columns: [
      {
        name: 'second',
        label: '第二个筛选项',
        component: 'radioGroup',
        defaultValue: 'a',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [
            {
              label:
                '第二个筛选项里这是一个超级长超级长超级长的选项文案用于观察右侧项目选中返显之后是否可以保持稳定宽度并且标题能够正常省略显示',
              value: 'a',
            },
            {
              label:
                '第二个筛选项里的第二个超级长选项文案用于验证两个筛选项同时存在超长返显文本时整体布局是否稳定不会换行不会溢出',
              value: 'b',
            },
          ],
        },
      },
    ],
  },
];
```

### emptyOptionsItems（空 options）

```js
const emptyOptionsItems = [
  {
    key: 'empty',
    title: '空 options',
    columns: [
      {
        name: 'empty',
        label: '空 options',
        component: 'radioGroup',
        defaultValue: '',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [],
        },
      },
    ],
  },
];
```

### menuListSingleItems（选择菜单单选）

```js
import stampFrameIcon from '../tag/assets/stamp-frame1.svg';

const menuListOptions = [
  {
    label: ['结算单据', '收款账户'],
    value: 'a',
    cellProps: { label: '2 个标题分 2 行 · 一行辅助信息' },
  },
  {
    label: ['订单信息', '客户资料', '发票抬头'],
    value: 'b',
    cellProps: { label: '3 个标题分 2 行 · 一行辅助信息' },
  },
  {
    label: '张小明',
    value: 'c',
    cellProps: {
      center: true,
      avatar: { src: stampFrameIcon, size: 'mini' },
    },
  },
  {
    label: '李小红',
    value: 'd',
    cellProps: {
      center: true,
      label: '产品经理 · 负责移动端体验优化',
      avatar: { src: stampFrameIcon, size: 'small' },
    },
  },
];

const menuListSingleItems = [
  {
    key: 'menuList',
    title: '选择菜单',
    columns: [
      {
        name: 'menuList',
        label: '选择菜单',
        component: 'radioGroup',
        defaultValue: '',
        fieldProps: { labelAlign: 'top' },
        componentProps: { isList: true, options: menuListOptions },
      },
    ],
  },
];
```

### contentPanelTagItems（标签单选）

```js
const tagOptions = [
  { label: '全部', value: 'all', icon: 'apps-o', disabled: true },
  { label: '数码', value: 'digital', icon: 'phone-o' },
  { label: '服饰', value: 'clothes', icon: 'bag-o' },
  { label: '食品', value: 'food', icon: 'gift-o' },
  { label: '家居', value: 'home', icon: 'home-o' },
  { label: '美妆', value: 'beauty', icon: 'smile-o' },
];

const contentPanelTagItems = [
  {
    key: 'category',
    title: '品类（标签单选）',
    columns: [
      {
        name: 'category',
        label: '品类',
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagOptions,
        },
      },
    ],
  },
];
```

### contentPanelTagMultipleItems（标签多选）

```js
const tagOptions = [
  { label: '全部', value: 'all', icon: 'apps-o', disabled: true },
  { label: '数码', value: 'digital', icon: 'phone-o' },
  { label: '服饰', value: 'clothes', icon: 'bag-o' },
  { label: '食品', value: 'food', icon: 'gift-o' },
  { label: '家居', value: 'home', icon: 'home-o' },
  { label: '美妆', value: 'beauty', icon: 'smile-o' },
];

const contentPanelTagMultipleItems = [
  {
    key: 'category',
    title: '品类（标签多选）',
    columns: [
      {
        name: 'category',
        label: '品类',
        component: 'checkboxGroup',
        defaultValue: ['digital', 'home', 'all'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          columns: 3,
          direction: 'horizontal',
          options: tagOptions,
        },
      },
    ],
  },
];
```

### contentPanelRadioItems（单选头像）

```js
import stampFrameIcon from '../tag/assets/stamp-frame1.svg';

const avatarOptions = [
  { label: '用户 A', value: 'a', icon: stampFrameIcon },
  {
    label: '用户 B',
    value: 'b',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
  {
    label: '用户 C',
    value: 'c',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
  {
    label: '用户 D',
    value: 'd',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
];

const contentPanelRadioItems = [
  {
    key: 'user',
    title: '筛选内容面板：单选头像',
    columns: [
      {
        name: 'user',
        label: '筛选内容面板：单选头像',
        component: 'radioGroup',
        defaultValue: 'a',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: avatarOptions,
        },
      },
    ],
  },
];
```

### contentPanelCheckboxItems（多选头像）

```js
import stampFrameIcon from '../tag/assets/stamp-frame1.svg';

const avatarOptions = [
  { label: '用户 A', value: 'a', icon: stampFrameIcon },
  {
    label: '用户 B',
    value: 'b',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
  {
    label: '用户 C',
    value: 'c',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
  {
    label: '用户 D',
    value: 'd',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
];

const contentPanelCheckboxItems = [
  {
    key: 'user',
    title: '筛选内容面板：多选头像',
    columns: [
      {
        name: 'user',
        label: '筛选内容面板：多选头像',
        component: 'checkboxGroup',
        defaultValue: ['a', 'b'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: avatarOptions,
        },
      },
    ],
  },
];
```

### contentPanelMenuListMultipleItems（选择菜单多选）

```js
import stampFrameIcon from '../tag/assets/stamp-frame1.svg';

const menuListOptions = [
  {
    label: ['结算单据', '收款账户'],
    value: 'a',
    cellProps: { label: '2 个标题分 2 行 · 一行辅助信息' },
  },
  {
    label: ['订单信息', '客户资料', '发票抬头'],
    value: 'b',
    cellProps: { label: '3 个标题分 2 行 · 一行辅助信息' },
  },
  {
    label: '张小明',
    value: 'c',
    cellProps: {
      center: true,
      avatar: { src: stampFrameIcon, size: 'mini' },
    },
  },
  {
    label: '李小红',
    value: 'd',
    cellProps: {
      center: true,
      label: '产品经理 · 负责移动端体验优化',
      avatar: { src: stampFrameIcon, size: 'small' },
    },
  },
];

const contentPanelMenuListMultipleItems = [
  {
    key: 'menuList',
    title: '选择菜单',
    searchable: true,
    searchPlaceholder: '搜索',
    columns: [
      {
        name: 'menuList',
        label: '选择菜单',
        component: 'checkboxGroup',
        defaultValue: ['a', 'b'],
        fieldProps: { labelAlign: 'top' },
        componentProps: { isList: true, options: menuListOptions },
      },
    ],
  },
];
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 筛选数据，一级 key 对应 `FilterMenuBarItem.key` | _FilterMenuBarModel_ | `{}` |
| config | 筛选栏配置 | _FilterMenuBarConfig_ | - |
| columns | 筛选项配置数组，等价于 `config.items` | _FilterMenuBarItem[]_ | - |
| active-color | 标题和图标选中态颜色 | _string_ | `var(--van-primary-color)` |
| overflow-threshold | 超过该数量后聚合到漏斗；启用漏斗后筛选条最多保留 `overflow-threshold - 1` 项 | _number \| string_ | `4` |
| funnel-title | 漏斗入口标题 | _string_ | `筛选` |
| funnel-section-collapsible | 漏斗面板内分组是否默认可折叠 | _boolean_ | `false` |
| funnel-section-default-expanded | 漏斗面板内分组是否默认展开 | _boolean_ | `true` |
| funnel-show-footer | 漏斗面板是否展示底部确认/重置区域 | _boolean_ | `true` |
| confirm-text | 面板底部确认按钮文案 | _string_ | `确定` |
| reset-text | 面板底部重置按钮文案 | _string_ | `重置` |
| overlay | 是否显示遮罩层 | _boolean_ | `true` |
| z-index | 菜单栏 z-index 层级 | _number \| string_ | - |
| duration | 动画时长，单位秒 | _number \| string_ | `0.2` |
| direction | 菜单展开方向，可选值为 `up` | _string_ | `down` |
| auto-locate | 是否按最近 containing block 自动修正定位 | _boolean_ | `false` |
| close-on-click-outside | 点击外部是否关闭菜单 | _boolean_ | `true` |
| close-on-click-overlay | 点击遮罩层是否关闭菜单 | _boolean_ | `true` |

### FilterMenuBarItem 数据结构

| 键名 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一标识，对应 `v-model` 的一级字段 | _string_ |
| title | 筛选条标题 | _string_ |
| disabled | 是否禁用 | _boolean_ |
| sort | 是否为排序项，排序项只切换 `default / asc / desc`，不渲染表单面板 | _boolean_ |
| barVisible | 是否展示在筛选条上 | _boolean_ |
| columns | 传给 [ProForm](#/zh-CN/pro-form) 的表单项配置 | _ProFormColumn[]_ |
| components | 传给 ProForm 的自定义组件映射 | _ProFormComponentMap_ |
| showFieldLabel | 普通单字段面板是否展示 Field 标题 | _boolean_ |
| showFooter | 是否展示面板底部确认/重置区域；单 section 普通面板默认 `false`，漏斗内多选等需确认场景可设为 `true` | _boolean_ |
| confirmText | 面板底部确认按钮文案，覆盖组件级 `confirm-text` | _string_ |
| resetText | 面板底部重置按钮文案，覆盖组件级 `reset-text` | _string_ |
| searchable | 搜索能力预留字段，具体搜索由内部表单组件或自定义面板实现 | _boolean_ |
| searchPlaceholder | 搜索占位文案预留字段 | _string_ |
| collapsible | 漏斗面板中当前分组是否可折叠 | _boolean_ |
| defaultExpanded | 漏斗面板中当前分组是否默认展开 | _boolean_ |

> 漏斗面板内分组标题取自 `columns[].label`，不再额外展示下拉标题。普通单字段面板可通过 `showFieldLabel` 控制是否展示 Field 标题。

### FilterMenuBarConfig 数据结构

| 键名              | 说明                   | 类型                  |
| ----------------- | ---------------------- | --------------------- |
| items             | 筛选项配置             | _FilterMenuBarItem[]_ |
| overflowThreshold | 超过该数量后聚合到漏斗 | _number \| string_    |

### FilterMenuBarModel 数据结构

`FilterMenuBarModel` 是筛选值对象，key 与 `FilterMenuBarItem.key` 对应，值为扁平结构。

```ts
type FilterMenuBarModel = Record<string, unknown>;
```

不同 ProForm 控件对应的值结构如下：

| 控件类型           | 值结构                 |
| ------------------ | ---------------------- |
| radioGroup 单选    | _string \| number_     |
| checkboxGroup 多选 | _(string \| number)[]_ |
| slider 单值        | _number_               |
| slider 区间        | _number[]_             |
| rangeInput 日期    | _string[]_             |

示例：

```js
const model = ref({
  status: 'all',
  brand: ['brand-a'],
  range: [400, 800],
  date: ['2024-05-01', '2024-05-22'],
});
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 筛选值变化时触发 | _model, payload_ |
| open | 打开菜单时触发 | _key_ |
| opened | 打开菜单且动画结束后触发 | _key_ |
| close | 关闭菜单时触发 | _key_ |
| closed | 关闭菜单且动画结束后触发 | _key_ |
| confirm | 面板确认提交后触发（即时单选选中、点击确定按钮、漏斗确认等） | _{ key, model }_ |
| sort | 点击排序项时触发 | _payload_ |
| section-toggle | 漏斗分组展开收起时触发 | _key, expanded_ |

### Methods

通过 ref 可以获取到 FilterMenuBar 实例并调用实例方法，详见[组件实例方法](#/zh-CN/advanced-usage#zu-jian-shi-li-fang-fa)。

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| validate | 主动触发漏斗面板整体校验，失败时会展开失败的 section | - | _Promise<void>_ |

### Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| panel-{key} | 完整替换指定筛选项面板内容 | _{ item, model, updateModel, close, confirm, reset, validate }_ |
| item-{key} | 追加指定筛选项的 ProForm 默认插槽内容 | _{ item, model, updateModel }_ |
| panel-footer | 自定义普通筛选项面板底部内容 | _{ item, model, updateModel, close, confirm, reset, validate, selectedCount, confirmLabel }_ |
| panel-footer-{key} | 自定义指定普通筛选项面板底部内容 | _{ item, model, updateModel, close, confirm, reset, validate, selectedCount, confirmLabel }_ |
| section-action-{key} | 自定义漏斗 section 标题右侧操作区 | _{ item, section, expanded, collapsible, toggle, model, updateModel, close }_ |
| funnel-footer | 自定义漏斗面板底部内容 | _{ items, model, close, confirm, reset, validate }_ |
| title-icon | 自定义筛选条标题图标 | _{ item, active, showPopup, sortOrder, isFunnel, isSort }_ |

### 类型定义

组件导出以下类型定义：

```ts
import type {
  FilterMenuBarProps,
  FilterMenuBarExpose,
  FilterMenuBarItem,
  FilterMenuBarConfig,
  FilterMenuBarModel,
} from 'vant';
```

### 主题定制

#### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-filter-menu-bar-z-index | _10_ | 筛选栏默认层级 |
| --van-filter-menu-bar-height | _48px_ | 筛选条高度 |
| --van-filter-menu-bar-background | _var(--van-background-2)_ | 筛选条背景色 |
| --van-filter-menu-bar-shadow | _0 2px 12px rgba(100, 101, 102, 0.12)_ | 筛选条阴影 |
| --van-filter-menu-bar-bar-padding-x | _var(--van-padding-sm)_ | 筛选条左右内边距 |
| --van-filter-menu-bar-bar-gap | _var(--van-padding-lg)_ | 筛选条项目间距 |
| --van-filter-menu-bar-bar-single-padding-right | _42px_ | 单个筛选项右侧预留间距 |
| --van-filter-menu-bar-color | _var(--van-text-color)_ | 筛选条文字颜色 |
| --van-filter-menu-bar-title-font-size | _var(--van-font-size-md)_ | 筛选条标题字号 |
| --van-filter-menu-bar-title-active-color | _var(--van-primary-color)_ | 筛选条标题激活色 |
| --van-filter-menu-bar-content-max-height | _70vh_ | 下拉面板最大高度 |
| --van-filter-menu-bar-content-gap | _var(--van-padding-md)_ | 普通面板内容与筛选条的间距 |
| --van-filter-menu-bar-content-padding-x | _var(--van-padding-sm)_ | 面板内容左右内边距 |
| --van-filter-menu-bar-bar-icon-color | _var(--van-text-color-3)_ | 筛选条图标默认色 |
| --van-filter-menu-bar-list-option-icon-gap | _var(--van-padding-lg)_ | 选择菜单列表中选项与右侧图标间距 |
| --van-filter-menu-bar-footer-padding | _12px_ | 底部按钮区域内边距 |
| --van-filter-menu-bar-footer-gap | _8px_ | 底部按钮间距 |
| --van-filter-menu-bar-funnel-section-title-height | _16px_ | 漏斗分组标题行高 |
| --van-filter-menu-bar-funnel-section-title-padding-y | _var(--van-padding-md)_ | 漏斗分组标题上下内边距 |
| --van-filter-menu-bar-funnel-section-title-font-size | _var(--van-font-size-md)_ | 漏斗分组标题字号 |
| --van-filter-menu-bar-funnel-section-title-font-weight | _500_ | 漏斗分组标题字重 |
| --van-filter-menu-bar-funnel-section-title-color | _#333333_ | 漏斗分组标题颜色 |
| --van-filter-menu-bar-slider-side-padding | _calc(var(--van-slider-button-width) / 2)_ | 漏斗内 Slider 左右安全间距 |
| --van-filter-menu-bar-slider-field-padding-y | _var(--van-padding-md)_ | 漏斗内 Slider 内容上下间距 |
