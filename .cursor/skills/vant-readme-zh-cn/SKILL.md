---
name: vant-readme-zh-cn
description: >-
  Maintains Vant component Chinese docs (packages/vant/src/*/README.zh-CN.md):
  API tables, demos, theme variables. Use when editing 中文文档, README.zh-CN.md,
  代码演示, Props/Events, or syncing docs after component changes. Never edits README.md
  unless the user explicitly asks.
---

# Vant 中文组件文档（README.zh-CN.md）

## 范围

| 做 | 不做 |
| --- | --- |
| 编辑 `packages/vant/src/<component>/README.zh-CN.md` | 编辑同目录的 `README.md`（英文，默认不动） |
| 必要时改 `demo/` 以支撑文档示例 | 改 `docs/markdown/` 站点静态页，除非用户指定 |
| 从源码核对 Props / Events / CSS 变量 | 臆造未实现的 API |

文档路径：`packages/vant/src/<kebab-case>/README.zh-CN.md`（如 `action-bar`、`field`）。

## 工作流程

1. **读源码**：`<Component>.tsx`、`index.ts`、`types.ts`（若有）、`index.less` 中的 `--van-*`。
2. **读现有文档**：打开 `README.zh-CN.md`，保持章节顺序与文风一致。
3. **对照 demo**：`demo/index.vue` 及各示例 `.vue`；新增演示时优先在 demo 实现，再在文档引用相同用法。
4. **只改中文档**：英文 `README.md` 由维护者或单独任务同步，本 skill 不主动修改。
5. **预览**：在仓库根目录 `pnpm dev`，站点中文路由为 `#/zh-CN/<component>`。

## 文档结构（按顺序）

```markdown
# {PascalCase} {中文名}

### 介绍
（一两句话说明用途）

### 引入
（全局注册示例 + 链接到组件注册）

## 代码演示
### {场景标题}
（说明 + ```html``` + 可选 ```js```）

## API
### {ComponentName} Props
### Events          # 若有
### Methods         # 若有
### Slots
### 类型定义        # 导出 TS 类型时

## 主题定制
### 样式变量
（CSS 变量表）
```

多子组件（如 ActionBar / ActionBarIcon / ActionBarButton）时，API 下用 `### {子组件名} Props` 分段，与 `action-bar/README.zh-CN.md` 一致。

## 写法约定

### 标题与用语

- 一级标题：`# Button 按钮`（英文名 + 空格 + 中文名）。
- 二级：`## 代码演示`、`## API`、`## 主题定制`。
- 三级：`### 介绍`、`### 引入`、`### 基础用法`、API 子节。
- 示例文案用中文（如「主要按钮」「请输入文本」），勿直接复制英文 README 的 Icon1/Button 等占位文案。

### 引入块

```js
import { createApp } from 'vue';
import { Button } from 'vant';

const app = createApp();
app.use(Button);
```

多组件时逐行 `app.use(...)`。注册说明链接固定形态：

`[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)`

### 代码演示

- 每个小节：**一句说明** + `html` 代码块（可含 `js` setup 示例）。
- 标签使用文档站前缀：`van-button`，不是源码里的裸组件名。
- 需要交互时补充 `js`，使用 `showToast` 等 Vant 已有 API，与现有文档风格一致。
- 链到其它组件： `[Badge 组件的 props](#/zh-CN/badge#props)`（路径 `#/zh-CN/<route>#锚点`）。

### API 表格

Props / Events / Methods 表头：

| 参数 | 说明 | 类型 | 默认值 |

Events：

| 事件名 | 说明 | 回调参数 |

Slots：

| 名称 | 说明 |

类型与默认值写法：

- 类型：`_string_`、`_boolean_`、`_number \| string_`
- 默认值：`` `false` ``、`` `primary` ``、无默认写 `-`
- 可选值写在说明里：可选值为 `primary` `success` `warning`
- 属性名与源码 **kebab-case** 一致（`safe-area-inset-bottom`）

### 类型定义

与导出类型一致，示例：

```ts
import type { ButtonProps, ButtonType } from 'vant';
```

类型名从组件 `index.ts` / 类型文件核对，勿漏导出名。

### 主题定制

- 引导语引用：`[ConfigProvider 组件](#/zh-CN/config-provider)`
- 变量来自 `index.less` 的 `:root, :host { --van-... }`
- 表格三列：名称 | 默认值 | 描述（描述可填 `-`）
- 默认值用下划线包裹：`_var(--van-primary-color)_`

## 新增或变更 API 时的检查清单

- [ ] Props 表与 `props` 定义一致（含默认值）
- [ ] 新增 prop 有对应「代码演示」或在已有小节中体现
- [ ] Events / Slots / Methods 与源码 `emits`、插槽、expose 一致
- [ ] 类型定义块的 `import type` 与包导出一致
- [ ] 新 CSS 变量已写入「样式变量」表
- [ ] 未改动 `README.md`

## 参考样例

| 场景 | 文件 |
| --- | --- |
| 单子组件 + Events | `src/button/README.zh-CN.md` |
| 多子组件 API | `src/action-bar/README.zh-CN.md` |
| 复杂演示与多 type | `src/field/README.zh-CN.md` |

## 常见错误

- 修改了 `README.md` 却未改 `README.zh-CN.md`（本 skill 要求相反）。
- 站内链接用 `#/en-US/` 或相对路径；中文档应使用 `#/zh-CN/`。
- API 参数名用 camelCase；文档站与模板均为 kebab-case。
- 代码演示只有英文或占位符，与中文用户文档不符。
