# FieldChildren 动态表单项 `new`

### 介绍

可增删的动态表单项列表。

### 引入

```js
import { createApp } from 'vue';
import { FieldChildren, Field, CellGroup } from 'vant';

const app = createApp();
app.use(FieldChildren);
app.use(Field);
app.use(CellGroup);
```

## 代码演示

### 基础用法（与 RangeInput 相同模式）

父组件只维护一个数组；插槽里**只放一个** `Field` 作为模板，**不要**在子 `Field` 上写 `v-model`。

```html
<van-cell-group inset>
  <van-field-children
    v-model="list"
    title="可添加子选项列表标题"
    add-text="添加"
  >
    <van-field label="选项名称" placeholder="请输入" />
  </van-field-children>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const list = ref(['', '']);
    return { list };
  },
};
```

### 至少 / 最多条数

- `min-items`：数组长度不大于此值时不再展示删除。
- `max-items`：数组长度达到上限后不再展示「添加」。

```html
<van-cell-group inset>
  <van-field-children
    v-model="list"
    title="可添加子选项列表标题"
    add-text="添加"
    :min-items="1"
    :max-items="3"
  >
    <van-field label="选项名称" placeholder="请输入" />
  </van-field-children>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const list = ref(['', '']);
    return { list };
  },
};
```

### 新增行的默认值

`default-row-value` 控制点击「添加」时追加的初始值，默认为空字符串。

```html
<van-cell-group inset>
  <van-field-children
    v-model="list"
    title="可添加子选项列表标题"
    add-text="添加"
    default-row-value="新选项"
  >
    <van-field label="新选项" placeholder="请输入" />
  </van-field-children>
</van-cell-group>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const list = ref(['']);
    return { list };
  },
};
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 列表值，每项对应一行 Field | _string[] \| number[]_ | `['']` |
| title | 头部左侧标题 | _number \| string_ | - |
| add-text | 头部右侧添加按钮文案（未使用 `#add` 时） | _string_ | `添加` |
| show-add | 是否展示添加按钮 | _boolean_ | `true` |
| deletable | 是否为未自定义 `right-icon` 的模板 Field 注入删除 | _boolean_ | `true` |
| min-items | 数组长度不大于此值时不展示删除 | _number_ | `0` |
| max-items | 数组长度达到该值后不再展示添加 | _number_ | - |
| default-row-value | 点击添加时追加的默认值 | _string \| number_ | `''` |
| delete-icon | 删除所用 `Field` 的 `right-icon` 名称 | _string_ | `minus` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 列表变化（输入、添加、删除） | _value: string[] \| number[]_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | **一个** `van-field` 模板（可含 `label`、`placeholder` 等）；勿写 `v-model` / `v-for` |
| title | 自定义头部左侧 |
| add | 自定义添加按钮内容 |

### 主题变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-field-children-add-color | _var(--van-primary-color)_ | 添加按钮颜色 |
| --van-field-children-add-font-size | _var(--van-font-size-md)_ | 添加按钮字号 |
| --van-field-children-title-color | _var(--van-cell-text-color, var(--van-text-color))_ | 标题颜色 |
| --van-field-children-title-font-size | _var(--van-cell-font-size, var(--van-font-size-md))_ | 标题字号 |
| --van-field-children-title-line-height | _var(--van-cell-line-height, 24px)_ | 标题行高 |
| --van-field-children-header-padding | _var(--van-padding-md) var(--van-padding-md) var(--van-padding-xs)_ | 头部内边距 |
| --van-field-children-item-gap | _0_ | 分割线与子项内容之间的上下间距（为 `item-body` 的上下 padding） |
| --van-field-children-item-border-color | _var(--van-border-color)_ | 子项底部分隔线颜色 |
| --van-field-children-tree-gutter-width | _20px_ | 树形引导线左侧占位宽度 |
| --van-field-children-tree-color | _var(--van-border-color)_ | 树形引导线颜色 |
| --van-field-children-tree-line-width | _1px_ | 树形引导线粗细 |
| --van-field-children-tree-elbow-y | _50%_ | 拐角纵向位置（竖线与横线交汇） |
| --van-field-children-tree-rail-length | _10px_ | 竖线长度 |
| --van-field-children-tree-arm-length | _10px_ | 横线长度 |
| --van-field-children-delete-icon-color | _var(--van-white)_ | 删除图标前景色 |
| --van-field-children-delete-icon-bg | _var(--van-primary-color)_ | 删除图标背景色 |
| --van-field-children-delete-icon-size | _14px_ | 删除图标字号 |
