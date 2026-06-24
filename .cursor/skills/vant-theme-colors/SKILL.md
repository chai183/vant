---
name: vant-theme-colors
description: >-
  Vant 颜色修改规范：使用 packages/vant/src/style/css-variables.less 中的 --van-* 主题变量，禁止硬编码语义色值。Use when modifying colors in .less, .vue, .tsx, adding CSS variables, styling components, or replacing hex/rgb color literals.
---

# Vant 主题色变量

**硬性规则**：在 `packages/vant/src` 下修改颜色时，**禁止**直接写 `#666`、`#999` 等语义色十六进制值，改用 `css-variables.less` 中已定义的全局 CSS 变量。

变量定义源文件：`packages/vant/src/style/css-variables.less`

## 文字色映射（优先使用）

| 语义     | CSS 变量                     | 默认值 | 常见误用          |
| -------- | ---------------------------- | ------ | ----------------- |
| 主要文字 | `--van-text-color`           | `#333` | `#333`、`#333333` |
| 次要文字 | `--van-text-color-secondary` | `#666` | `#666`、`#666666` |
| 反显     | `--van-text-color-inverse`   | `#777` | `#777`、`#777777` |
| 辅助     | `--van-text-color-auxiliary` | `#999` | `#999`、`#999999` |
| 禁用     | `--van-text-color-disabled`  | `#ccc` | `#ccc`、`#cccccc` |

兼容旧写法（已有代码可保留，新代码优先用语义变量）：

| 变量                 | 说明                            |
| -------------------- | ------------------------------- |
| `--van-text-color-2` | 次要文字（旧）                  |
| `--van-text-color-3` | 更浅文字（旧，常用于 disabled） |

## 其它常用全局变量

| 用途 | 变量 |
| --- | --- |
| 品牌主色 | `--van-primary-color` |
| 成功 / 危险 / 警告 | `--van-success-color` / `--van-danger-color` / `--van-warning-color` |
| 背景 | `--van-background` / `--van-background-2` / `--van-background-3` |
| 边框 | `--van-border-color` |
| 点击态 | `--van-active-color` |
| 灰阶 | `--van-gray-1` … `--van-gray-14` |
| 功能色 | `--van-red` / `--van-blue` / `--van-green` / `--van-orange` 等 |

完整列表见 `css-variables.less`。

## 写法约定

### 组件 `index.less`

在 `:root, :host` 块声明组件变量，**引用**全局变量，不要写死 hex：

```less
:root,
:host {
  --van-foo-label-color: var(--van-text-color-secondary);
  --van-foo-hint-color: var(--van-text-color-auxiliary);
  --van-foo-disabled-color: var(--van-text-color-disabled);
}
```

样式中通过 `var(--van-foo-label-color)` 使用。

参考：`packages/vant/src/cascader/index.less`（`--van-cascader-option-index-color: var(--van-text-color-auxiliary)`）。

### Vue demo / 内联样式

```less
// ✅
color: var(--van-text-color-secondary);

// ❌
color: #666;
```

### TSX 内联 color

```tsx
// ✅ 优先 CSS 变量 + class；不得已时用 var()
style={{ color: 'var(--van-text-color-auxiliary)' }}

// ❌
style={{ color: '#999' }}
```

## 新增全局变量时

若 `css-variables.less` 新增了基础变量，同步更新：

1. `packages/vant/src/config-provider/types.ts` — 在 `BaseThemeVars` 增加 camelCase 字段及 JSDoc
2. 组件 README「样式变量」表（走 [vant-docs](../vant-docs/SKILL.md) 流程）

ConfigProvider 会将 `textColorSecondary` 等 camelCase 自动映射为 `--van-text-color-secondary`。

## 决策流程

```
需要改颜色
  → 是否语义文字色（主/次/反显/辅助/禁用）？
      是 → 用 --van-text-color-* 变量
  → 是否品牌/状态色？
      是 → 用 --van-primary-color 等
  → 是否组件专属色？
      是 → 在 index.less 定义 --van-<component>-*，值引用全局变量
  → 是否全新语义色且无对应变量？
      是 → 先在 css-variables.less 新增，再引用（并同步 types.ts）
```

## 检查清单

- [ ] 未新增 `#666` / `#777` / `#999` / `#ccc` 等硬编码语义色
- [ ] 组件变量通过 `var(--van-*)` 引用全局变量
- [ ] 新增全局变量已同步 `config-provider/types.ts`
- [ ] 涉及组件对外样式时，README 样式变量表已更新
