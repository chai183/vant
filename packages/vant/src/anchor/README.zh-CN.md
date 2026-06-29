# Anchor 锚点

### 介绍

锚点组件根据业务分为三大类：**回到顶部**、**目录**、**协议条款**。`back-top` / `catalog` 展开态为与 BackTop 类似的圆形悬浮球；`terms` 为左侧箭头 + 右侧文案的贴边条，均使用主题色。

### 引入

```js
import { createApp } from 'vue';
import { Anchor } from 'vant';

const app = createApp();
app.use(Anchor);
```

## 代码演示

### 回到顶部 · 常驻

滑动超出 2 屏后出现展开态，常驻展示，点击回到顶部。

```html
<van-cell v-for="item in list" :key="item" :title="item" />
<van-anchor type="back-top" mode="fixed" text="顶部" />
```

### 回到顶部 · 非常驻

滑动超出 2 屏后出现收起态（右侧 20×48 贴边条 + 左箭头）。停留 2 秒 / 点击箭头后展开为圆球；圆球展开后继续向下滑动超过 1 屏视口高度时，会再次收回复胶囊，停止滑动后重新计时展开。出现后上滑不会消失，仅当滚回页面顶部（`scrollTop <= resetOffset`，默认 `0`）时隐藏。

```html
<van-cell v-for="item in list" :key="item" :title="item" />
<van-anchor type="back-top" mode="auto" />
```

### 目录

向下滑动即出现，交互与回到顶部一致；圆球展开后继续下滑超过 1 屏会收回复胶囊，上滑可立即再次展开。点击圆球（收起态点击同样生效）从底部弹出目录列表，选中后定位到对应章节。

```html
<van-cell id="section-1" title="章节一" />
<van-cell id="section-2" title="章节二" />

<van-anchor
  type="catalog"
  mode="auto"
  :items="[
    { id: 'section-1', title: '章节一' },
    { id: 'section-2', title: '章节二' },
  ]"
/>
```

### 协议条款

默认始终展开。内容在页面下方时箭头朝下，在上方时箭头朝上。

```html
<div id="terms-block">协议正文</div>
<van-anchor type="terms" terms-target="#terms-block" />
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 锚点类型：`back-top` 回到顶部、`catalog` 目录、`terms` 协议条款 | _string_ | `back-top` |
| mode | 交互模式：`fixed` 常驻展开、`auto` 先收起后展开；`terms` 类型忽略 | _string_ | `fixed` |
| text | 右侧文案，不传则按类型使用默认文案 | _string_ | - |
| items | 目录项，仅 `catalog` 有效 | _AnchorItem[]_ | - |
| terms-target | 协议正文元素选择器，仅 `terms` 有效，用于箭头方向与点击定位 | _string_ | - |
| screen-offset | 出现阈值：滚动超过 N 屏（视口高度倍数） | _number \| string_ | `2` |
| offset | 出现阈值（px），设置后优先于 `screen-offset` | _number \| string_ | - |
| reset-offset | 消失阈值：滚回 `scrollTop <=` 该值时隐藏（恢复原位） | _number \| string_ | `0` |
| expand-delay | 收起态自动展开延迟（ms），`0` 表示按类型默认（回到顶部 2000 / 目录 3000） | _number \| string_ | `0` |
| target | 滚动容器，支持选择器或 DOM 元素 | _string \| HTMLElement_ | 最近滚动父级 |
| right | 距右侧距离 | _number \| string_ | `0` |
| bottom | 距底部距离 | _number \| string_ | `40` |
| teleport | 挂载节点 | _string \| Element_ | `body` |
| immediate | 是否瞬间滚动 | _boolean_ | `false` |
| z-index | 层级 | _number \| string_ | `100` |

### AnchorItem 数据结构

| 键名  | 说明                          | 类型     |
| ----- | ----------------------------- | -------- |
| id    | 页面锚点元素 `id`（可带 `#`） | _string_ |
| title | 目录展示标题                  | _string_ |

### Events

| 事件名 | 说明                   | 回调参数                          |
| ------ | ---------------------- | --------------------------------- |
| click  | 点击展开态锚点时触发   | _event: MouseEvent_               |
| select | 目录弹出层选中项时触发 | _item: AnchorItem, index: number_ |
| open   | 目录弹出层打开时触发   | -                                 |
| close  | 目录弹出层关闭时触发   | -                                 |

### Slots

| 名称      | 说明                                     |
| --------- | ---------------------------------------- |
| default   | 自定义 `terms` 贴边条右侧文案            |
| ball-text | 自定义 `back-top` / `catalog` 圆球内文案 |

### 类型定义

```ts
import type {
  AnchorProps,
  AnchorThemeVars,
  AnchorType,
  AnchorMode,
  AnchorItem,
} from 'vant';
```

## 主题定制

### 样式变量

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-anchor-right | _0_ | - |
| --van-anchor-bottom | _40px_ | - |
| --van-anchor-z-index | _100_ | - |
| --van-anchor-ball-size | _48px_ | 回到顶部/目录展开圆球尺寸 |
| --van-anchor-ball-right | _30px_ | 悬浮球距右侧距离 |
| --van-anchor-surface-background | _var(--van-background-2)_ | 收起条 / 展开圆球共用背景 |
| --van-anchor-surface-border | _var(--van-border-color)_ | 收起条 / 展开圆球共用边框 |
| --van-anchor-surface-icon-color | _var(--van-primary-color)_ | 收起箭头 / 圆球图标与文案颜色 |
| --van-anchor-surface-shadow | _0 4px 12px rgba(0, 0, 0, 0.08)_ | 收起条 / 展开圆球共用阴影 |
| --van-anchor-ball-background | _var(--van-anchor-surface-background)_ | 展开圆球背景色（别名） |
| --van-anchor-ball-icon-color | _var(--van-anchor-surface-icon-color)_ | 展开圆球图标与文案颜色（别名） |
| --van-anchor-panel-border | _var(--van-anchor-surface-border)_ | 面板边框色（别名） |
| --van-anchor-ball-icon-size | _20px_ | 展开圆球图标字号 |
| --van-anchor-ball-text-size | _10px_ | 展开圆球文案字号 |
| --van-anchor-ball-text-line-height | _1.2_ | 展开圆球文案行高 |
| --van-anchor-color | _var(--van-primary-color)_ | 协议条款图标与文字颜色 |
| --van-anchor-background | _var(--van-background-2)_ | 背景色 |
| --van-anchor-collapsed-width | _20px_ | 收起态宽度 |
| --van-anchor-collapsed-height | _48px_ | 收起态高度 |
| --van-anchor-expanded-height | _40px_ | 展开态高度 |
| --van-anchor-font-size | _14px_ | 文案字号 |
| --van-anchor-icon-size | _16px_ | 图标字号 |
