---
name: vant-docs
description: >-
  Vant component docs workflow: sync demo/ and README.zh-CN.md + README.md after
  every code change under packages/vant/src. Covers `new` badges, API tables,
  theme variables, and demo conventions. Use when modifying components, props,
  events, slots, styles, or writing 中文文档 / 代码演示.
---

# Vant 组件文档

**硬性规则**：改动 `packages/vant/src/<component>/` 下组件源码后，**同一任务内**必须同步 `demo/`、`README.zh-CN.md`、`README.md`，不得只改代码留文档滞后。

用户明确要求「只改中文档」时，仅编辑 `README.zh-CN.md`，不动 `README.md`。

## 触发范围

以下任一变更均须走本流程：

- `*.tsx` / `types.ts`：props、emits、slots、expose、默认行为
- `index.less`：新增/变更 `--van-*` CSS 变量
- 删除或重命名 API
- 修复 bug 导致用法或视觉效果变化
- 新增组件或新增 API

**例外**（可不同步文档）：纯内部重构、测试快照、构建脚本，且对外 API 与视觉行为完全不变。

## 同步顺序

```
读源码 → demo/ → README.zh-CN.md → README.md → 检查清单
```

1. **读源码**：`<Component>.tsx`、`index.ts`、`types.ts`（若有）、`index.less` 中的 `--van-*`。
2. **改 demo**：在 `demo/` 体现变更；新场景新建示例，旧场景更新用法。
3. **改中文档**：`README.zh-CN.md` 对齐 demo（代码演示 + API 表 + 样式变量）。
4. **改英文档**：`README.md` 与中文档结构一一对应，仅语言不同。
5. **收尾**：跑检查清单；新增 API 打 `` `new` `` 标签。

**禁止**：只改 API 表、不写 demo；只写 demo、不同步 README；中英文 demo 文案或 README 代码块不一致；臆造未实现的 API。

## 按变更类型做什么

| 变更类型 | demo | README 代码演示 | API 表 | 样式变量表 | `new` 标签 |
| --- | --- | --- | --- | --- | --- |
| **新增组件** | 新建 `demo/` 全套 | 写全文档 | 写全 API | 写样式变量 | 标题 `#` |
| 新增 prop / event / slot | 新建或扩展 `<demo-block>` | 新增 `###` 小节 | 新增行 | — | 名称列 |
| 修改默认值 / 类型 / 说明 | 更新相关示例 | 更新对应小节 | 更新该行 | — | — |
| 修改行为（视觉/交互） | 更新示例 | 更新说明与代码块 | 更新说明列 | — | — |
| 删除 API | 移除或改写示例 | 删除对应小节 | 删除该行 | — | — |
| 新增 CSS 变量 | 可选：主题 demo | — | — | 新增行 | — |

适用 API 表：Props、Events、Methods、Slots（及子组件对应小节）。

## `new` 标签

文档站通过 `packages/vant-cli/cjs/md-loader.cjs` 将 Markdown 中的 `` `new` `` 渲染为红色 `new` 徽标。

### 新增组件：标题加 `new`

```markdown
# ProForm 高级表单 `new`
# ProForm `new`
```

- 中文：`# {PascalCase} {中文名} `new``
- 英文：`# {PascalCase} `new``
- `` `new` `` 紧跟标题文案，前留一个空格

### 新增参数：表格名称列加 `new`

```markdown
| columns `new` | 水平排列时每行展示的选项数量 | _number \| string_ | `3` |
| label-tooltip `new` | 自定义标签旁 Popover 说明内容 | - |
```

- 标签写在 **kebab-case 名称之后**，与名称之间一个空格
- 中英文 README 的同一 API 行都要加 `` `new` ``
- 仅对**本次新增**的项加标签，勿给已有 API 补标
- 写法为 Markdown 行内代码 `` `new` ``，不是 HTML 或纯文本 `new`

## Demo 约定

路径：`packages/vant/src/<component>/demo/`。

### 组织方式（与组件现有风格一致）

| 方式 | 适用 | 做法 |
| --- | --- | --- |
| **单文件** | 示例较少 | 在 `demo/index.vue` 追加 `<demo-block>` |
| **多文件** | 示例较多 | 新建 `demo/Xxx.vue`，在 `index.vue` 中 `import` 并渲染 |

单文件示例（`checkbox`）：

```vue
<demo-block :title="t('renderOptions')">
  <van-checkbox-group v-model="state.checkboxOptions" :options="options" />
</demo-block>
```

多文件示例（`field`）：新建 `demo/Comment.vue`，在 `index.vue` 中 `import Comment from './Comment.vue'` 并注册。

### 通用约定

- 文案用 `useTranslate` 提供 `zh-CN` / `en-US`，勿硬编码单语言
- 每个新能力至少一个 `<demo-block>`，标题简短说明场景
- 组件引用用相对路径（如 `import VanField from '..'`）
- README「代码演示」的 `html` / `js` 块从 demo **提炼简化版**，用法一致，标签用 `van-*`

## 文档结构（按顺序）

```markdown
# {PascalCase} {中文名}          # 英文：# {PascalCase}

### 介绍
### 引入

## 代码演示
### {场景标题}                   # 说明 + ```html``` + 可选 ```js```

## API
### {ComponentName} Props
### Events                         # 若有
### Methods                        # 若有
### Slots
### 类型定义                       # 导出 TS 类型时

## 主题定制
### 样式变量
```

多子组件（如 ActionBar / ActionBarIcon）时，API 下用 `### {子组件名} Props` 分段，参考 `action-bar/README.zh-CN.md`。

## 写法约定

### 标题与用语

- 中文一级标题：`# Button 按钮`（英文名 + 空格 + 中文名）
- 英文一级标题：`# Button`
- 二级：`## 代码演示`、`## API`、`## 主题定制`
- 中文示例文案用中文（如「主要按钮」），勿复制英文占位文案

### 引入块

```js
import { createApp } from 'vue';
import { Button } from 'vant';

const app = createApp();
app.use(Button);
```

注册说明链接：

- 中文：`[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)`
- 英文：`[Register Component](#/en-US/advanced-usage#component-register)`

### 代码演示

每个 demo 场景对应 README 中一个 `### {场景标题}`：

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

- 标签用文档站前缀 `van-button`，不是源码裸组件名
- 链到其它组件：`[Badge 组件的 props](#/zh-CN/badge#props)`（中文用 `#/zh-CN/`，英文用 `#/en-US/`）

### API 表格

Props / Events / Methods 表头：

| 参数 | 说明 | 类型 | 默认值 |

Events：

| 事件名 | 说明 | 回调参数 |

Slots：

| 名称 | 说明 |

类型与默认值：

- 类型：`_string_`、`_boolean_`、`_number \| string_`
- 默认值：`` `false` ``、`` `primary` ``、无默认写 `-`
- 可选值写在说明里：可选值为 `primary` `success` `warning`
- 属性名与源码 **kebab-case** 一致（`safe-area-inset-bottom`）

### 类型定义

```ts
import type { ButtonProps, ButtonType } from 'vant';
```

类型名从组件 `index.ts` / 类型文件核对，勿漏导出名。

### 主题定制

- 引导语引用 ConfigProvider（中文 `#/zh-CN/config-provider`，英文 `#/en-US/config-provider`）
- 变量来自 `index.less` 的 `:root, :host { --van-... }`
- 表格三列：名称 | 默认值 | 描述（描述可填 `-`）
- 默认值用下划线包裹：`_var(--van-primary-color)_`

## 检查清单

任务完成前逐项确认：

- [ ] demo 已反映本次源码变更（含中英文文案）
- [ ] `README.zh-CN.md` 代码演示与 demo 用法一致
- [ ] `README.md` 与中文版结构对应、用法一致
- [ ] Props / Events / Methods / Slots 表与源码一致（kebab-case、类型、默认值）
- [ ] 新增 API 行含 `` `new` ``（中英文均有）；新组件标题含 `` `new` ``
- [ ] 新增/变更 CSS 变量已写入「样式变量」表
- [ ] 类型定义块的 `import type` 与包导出一致
- [ ] 未臆造 demo 或 README 中不存在的 API
- [ ] 删除的 API 已从 demo 与两份 README 中移除
- [ ] 未误标本次未改动的已有 API

## 预览

仓库根目录 `pnpm dev`：

- 中文：`#/zh-CN/<component>`
- 英文：`#/en-US/<component>`

## 参考样例

| 场景 | 文件 |
| --- | --- |
| 多文件 demo | `src/field/demo/index.vue`、`src/field/demo/Comment.vue` |
| 单文件 demo | `src/checkbox/demo/index.vue` |
| 新 Props + demo + README | `src/checkbox/demo/index.vue`（`renderOptions`、`listOptions`） |
| 新 Slots | `src/field/README.zh-CN.md`（`label-tooltip`、`bottom`） |
| 新组件标题 | `src/pro-form/README.zh-CN.md`、`src/range-input/README.md` |
| 单子组件 + Events | `src/button/README.zh-CN.md` |
| 多子组件 API | `src/action-bar/README.zh-CN.md` |
| 复杂演示 | `src/field/README.zh-CN.md` |

## 常见错误

- 只改代码不同步 demo 和 README
- 只改 API 表、不写 demo；或只写 demo、不同步 README
- 中英文 demo 文案或 README 代码块不一致
- 中文档站内链接用 `#/en-US/` 或相对路径；应使用 `#/zh-CN/`
- API 参数名用 camelCase；文档站与模板均为 kebab-case
- 代码演示只有英文或占位符，与中文用户文档不符
- 给已有 API 误加 `` `new` `` 标签
