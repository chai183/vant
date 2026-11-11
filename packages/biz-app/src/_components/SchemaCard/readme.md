# SchemaCard

把信息集 JSON（或已拆好的分组）和数据，渲染成只读分组卡片。每组一张 `van-card`，内容是文案列表：左侧 label、右侧值。默认带展开/收起，分组间距 12px。

适合详情页（如花名册员工详情），不要拿来做编辑表单；编辑仍用 `SchemaProForm`。

## 用法

```vue
import SchemaCard from '@/_components/SchemaCard';
```

### 已拆好的分组 + 单条数据

```vue
<SchemaCard :groups="groups" :model-value="formData" />
```

```ts
const groups = [
  {
    title: '默认分组',
    fields: [
      { name: 'staffName', label: '员工姓名' },
      { name: 'deptName', label: '部门' },
      { name: 'idPhoto', label: '证件照正面', fieldType: 'IMAGE' },
      { name: 'remark', label: '备注' },
    ],
  },
];

const formData = {
  staffName: '张三',
  deptName: '财务一部',
  idPhoto: [{ url: 'https://example.com/photo.jpg' }],
  remark: '备注内容',
};
```

### 信息集 schema

`schema` 按 `setList → groupList → fieldList` 拆成卡片。同时传了 `groups` 时，以 `groups` 为准。

```vue
<SchemaCard :schema="schema" :model-value="formData" />
```

数据可以是扁平对象，也可以按 `groupCode` 嵌套：

```ts
const formData = {
  staffName: '张三',
  empInfo: {
    nickName: '小花',
  },
};
```

### 多行记录（一人一张卡）

传 `records` 时不再按分组出卡，而是每条记录一张卡。标题优先用第一条字段的展示值，没有则用 `recordTitle` + 序号。

```vue
<SchemaCard :groups="groups" :records="records" record-title="银行卡信息" />
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| schema | 信息集 schema（`setCode → groupList → fieldList`） | `SchemaCardSchema[]` | `null` |
| groups | 已拆好的分组；有值时优先于 `schema` | `SchemaCardGroup[]` | `[]` |
| model-value | 单条数据。可按 `groupCode` 嵌套对象或数组 | `object` | `{}` |
| records | 多行数据，有值时一人一张卡 | `object[]` | `[]` |
| record-title | 多行卡片标题前缀（第一条字段无值时使用） | `string` | `''` |
| label-align | 标签垂直对齐，字段未单独设置时用这个 | `'top' \| 'center'` | `'top'` |
| label-width | 标签列宽。数字按 px，也可传 `'7em'` | `number \| string` | `96` |
| collapsible | 是否显示展开/收起。关闭后内容始终展开 | `boolean` | `true` |
| loading | 加载中 | `boolean` | `false` |
| empty-text | 无卡片时的空态文案 | `string` | `'暂无数据'` |

```vue
<SchemaCard
  :groups="groups"
  :model-value="formData"
  :collapsible="false"
  :label-width="96"
  label-align="top"
/>
```

## 分组与字段

### SchemaCardGroup

| 字段               | 说明                                          |
| ------------------ | --------------------------------------------- |
| title / groupName  | 卡片标题，缺省为「默认分组」                  |
| name / groupCode   | 卡片标识；也用来从 `model-value` 里取嵌套数据 |
| fields / fieldList | 该组字段                                      |

### SchemaCardField

取值 key 按 `name` → `fieldCode` → `columnName`。展示名按 `label` → `fieldName`。回显优先读 `mapping` / `fieldMapping` / `typeConfigJson.fieldMapping`。

| 字段 | 说明 |
| --- | --- |
| name / fieldCode / columnName | 数据字段名 |
| label / fieldName | 左侧标题 |
| fieldType | `IMAGE` / `IMG` / `FILE` / `BOOLEAN` 等 |
| mapping / fieldMapping | 回显字段名，有值且非空时优先于 name |
| options | `{ label, value }[]`，用来把码值转成文案 |
| fieldLabel | 有值时直接当展示文案，不再读数据 |
| tip | 为 `true` 时 label 后显示提示图标 |
| labelAlign | 该行标签对齐，`'top'` / `'center'`，覆盖组件 `label-align` |
| typeConfigJson | 透传，用于推导 mapping |

## 展示规则

- **文本**：超出换行，不显示省略号。长文本（如备注）label 默认顶对齐。
- **图片**（`IMAGE` / `IMG`）：48×48 缩略图，点击预览。
- **文件**（`FILE`）：展示文件名，多个用顿号拼接。
- **布尔**：`1` / `true` 显示「是」，`0` / `false` 显示「否」。
- **选项**：按 `options` 匹配 label；数组用顿号拼接。
- **提示图标**：字段 `tip: true`，或字段名为 `historicalYears`，或 label 含「司龄」。图标 16×16，紧跟文案、无间距。
- **label 对齐**：默认顶部。短字段可设 `labelAlign: 'center'` 或组件 `label-align="center"`。

## 示例

花名册详情：

```vue
<SchemaCard
  :loading="loading"
  :groups="groups"
  :model-value="formData"
  :records="mode === 'multi' ? records : []"
  :record-title="tabName"
/>
```
