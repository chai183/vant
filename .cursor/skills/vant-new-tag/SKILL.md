---
name: vant-new-tag
description: >-
  Vant component docs workflow: `new` badges, demo examples, and README sync.
  Use when creating a new component, adding props/events/slots/methods, or
  updating demo/ and README.md / README.zh-CN.md under packages/vant/src.
---

# Vant 文档 `new` 标签与 Demo 同步

文档站通过 `packages/vant-cli/cjs/md-loader.cjs` 将 Markdown 中的 `` `new` `` 渲染为红色 `new` 徽标。新增组件或 API 时须：**打 `new` 标签 → 写 demo → 同步 README**。

## 何时做什么

| 场景 | demo | README | `new` 标签 |
| --- | --- | --- | --- |
| **新增组件** | 新建 `demo/` 全套示例 | 新建并写全文档 | 标题 `#` |
| **新增参数** | 新建或扩展 demo 小节 | 同步「代码演示」+ API 表 | API 表名称列 |

适用 API 表：Props、Events、Methods、Slots（及子组件对应小节）。

## 新增参数：完整流程

1. **实现源码**：在组件 `props` / `emits` / 插槽 / `expose` 中落地 API。
2. **新建 demo**：在 `packages/vant/src/<component>/demo/` 增加可运行示例，展示该参数的典型用法。
3. **同步 README**：`README.zh-CN.md` 与 `README.md` 各增一节「代码演示」，内容与 demo 一致；API 表补充新行并加 `` `new` ``。
4. **预览**：仓库根目录 `pnpm dev`，中英文路由分别验证。

**禁止**：只改 API 表、不写 demo；只写 demo、不同步 README；中英文 demo 文案或 README 代码块不一致。

## 写法

### 新增组件：标题加 `new`

```markdown
# ProForm 高级表单 `new`
```

```markdown
# ProForm `new`
```

- 中文标题：`# {PascalCase} {中文名} `new``
- 英文标题：`# {PascalCase} `new``
- `` `new` `` 紧跟标题文案，前留一个空格

### 新增参数：表格名称列加 `new`

Props：

```markdown
| columns `new` | 水平排列时每行展示的选项数量 | _number \| string_ | `3` |
```

Slots：

```markdown
| label-tooltip `new` | 自定义标签旁 Popover 说明内容 | - |
```

- 标签写在 **kebab-case 名称之后**，与名称之间一个空格
- 中英文 README 的同一 API 行都要加 `` `new` ``
- 仅对**本次新增**的项加标签，勿给已有 API 补标

## Demo 写法

路径：`packages/vant/src/<component>/demo/`。

### 组织方式（二选一，与组件现有风格一致）

| 方式 | 适用 | 做法 |
| --- | --- | --- |
| **单文件** | 示例较少 | 在 `demo/index.vue` 追加 `<demo-block>` |
| **多文件** | 示例较多 | 新建 `demo/Xxx.vue`，在 `index.vue` 中 `import` 并渲染 |

### 单文件示例（`checkbox`）

```vue
<demo-block :title="t('renderOptions')">
  <van-checkbox-group v-model="state.checkboxOptions" :options="options" />
</demo-block>
```

### 多文件示例（`field`）

- 新建 `demo/Comment.vue`，内部用 `<demo-block :title="t('title')">` 包裹
- 在 `demo/index.vue` 中 `import Comment from './Comment.vue'` 并注册

### Demo 约定

- 文案用 `useTranslate` 提供 `zh-CN` / `en-US`，勿硬编码单语言
- 每个新参数至少一个 `<demo-block>`，标题简短说明场景（如「配置项渲染」「列表展示」）
- 组件引用用相对路径导入（如 `import VanField from '..'`），与同目录 demo 一致
- README「代码演示」的 `html` / `js` 块应从 demo **提炼简化版**，用法与 demo 一致（标签用 `van-*`）

### README 代码演示同步

每个新 demo 对应 README 中一个 `### {场景标题}` 小节：

```markdown
### 配置项渲染

通过 `options` 属性传入配置项渲染复选框组。

\`\`\`html
<van-checkbox-group v-model="checked" :options="options" />
\`\`\`

\`\`\`js
import { ref } from 'vue';

export default {
  setup() {
    const checked = ref([]);
    const options = [
      { label: '选项 1', value: '1' },
      { label: '选项 2', value: '2' },
    ];
    return { checked, options };
  },
};
\`\`\`
```

- `README.zh-CN.md`：场景标题与示例文案用中文
- `README.md`：英文标题与文案
- 两文档的 API 表、演示结构一一对应

## 检查清单

新增或修改组件文档时：

- [ ] 新参数：已在 `demo/` 新增可运行示例（含中英文文案）
- [ ] 新参数：`README.zh-CN.md`、`README.md` 均有对应「代码演示」小节
- [ ] 新参数：两个 README 的 API 表新行均含 `` `new` ``
- [ ] 新组件：`README.md`、`README.zh-CN.md` 的 `#` 标题均含 `` `new` ``
- [ ] 标签写法为 Markdown 行内代码 `` `new` ``，不是 HTML 或纯文本 `new`
- [ ] demo 与 README 代码块用法一致，未臆造 API
- [ ] 未误标本次未改动的已有 API

## 参考样例

| 场景 | 文件 |
| --- | --- |
| 新组件标题 | `src/pro-form/README.zh-CN.md`、`src/range-input/README.md` |
| 新 Props + demo + README | `src/checkbox/demo/index.vue`（`renderOptions`、`listOptions`） |
| 新 Props 独立 demo 文件 | `src/field/demo/Comment.vue`、`src/field/demo/ReadonlyEllipsis.vue` |
| 新 Slots | `src/field/README.zh-CN.md`（`label-tooltip`、`bottom`） |

## 与其它 skill 的关系

- 中文文档结构与表格格式见 [vant-readme-zh-cn](../vant-readme-zh-cn/SKILL.md)
- 本 skill 负责 `` `new` `` 标签、demo 与 README 同步；写中文档时两个 skill 一并遵循
