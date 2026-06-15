# NavBar 导航栏

### 介绍

为页面提供导航功能，常用于页面顶部。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { NavBar } from 'vant';

const app = createApp();
app.use(NavBar);
```

## 代码演示

### 基础用法

通过 `title` 属性设置导航栏标题。

```html
<van-nav-bar title="标题" />
```

### 自定义背景色

通过 `background` 属性设置导航栏背景色。

```html
<van-nav-bar
  title="标题"
  background="linear-gradient(90deg, #e8f3ff, #ffffff)"
/>
```

### 左右内容

左侧和右侧分别最多展示两个位置，位置可以是文本或按钮。右侧文本最多展示四个字。

```html
<van-nav-bar
  title="标题"
  left-text="返回"
  right-text="按钮"
  left-arrow
  @click-left="onClickLeft"
  @click-right="onClickRight"
/>

<van-nav-bar
  title="标题"
  :left-buttons="leftButtons"
  right-text="按钮"
  :right-buttons="rightButtons"
  @click-left-button="onClickLeftButton"
  @click-right-button="onClickRightButton"
  @click-right="onClickRight"
/>
```

```js
const leftButtons = [{ icon: 'arrow-left', text: '返回' }];
const rightButtons = [{ icon: 'search' }, { icon: 'ellipsis' }];
```

### 右侧下拉菜单

右侧按钮可以通过 `menu` 配置下拉菜单。菜单宽度为 `112px`，菜单项为纵向布局，高度为 `48px`，支持图标和文本。

```html
<van-nav-bar
  title="标题"
  :left-buttons="leftButtons"
  :right-buttons="menuButtons"
  @select-right-menu="onSelectRightMenu"
/>
```

```js
const leftButtons = [{}, {}];
const menuButtons = [
  {
    icon: 'ellipsis',
    menu: [
      { icon: 'search', text: '搜索' },
      { icon: 'cross', text: '关闭' },
    ],
  },
];
```

### 标题长度展示

标题过长时会先缩小字号展示，最小字号为 `14px`；仍然超出时会截断展示。

```html
<van-nav-bar
  title="这是一段很长很长的导航栏标题，用于展示标题缩小和截断"
  :right-buttons="rightButtons"
/>
```

### 搜索框

当没有设置标题时，可以通过 `search` 属性将标题区域渲染为搜索框。搜索框内部复用 `Search` 组件，点击左侧搜索图标时会触发 `search` 事件。

```html
<van-nav-bar search search-placeholder="搜索" @search="onSearch" />

<van-nav-bar
  search
  :left-buttons="leftButtons"
  :right-buttons="rightButtons"
  search-placeholder="搜索"
  @search="onSearch"
/>

<van-nav-bar
  search
  :left-buttons="allLeftButtons"
  :right-buttons="rightButtons"
  search-placeholder="搜索"
  @search="onSearch"
/>
```

```js
const leftButtons = [{ icon: 'arrow-left', text: '返回' }];
const allLeftButtons = [{}, {}];
const rightButtons = [{ icon: 'search' }, { icon: 'ellipsis' }];
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 标题 | _string_ | `''` |
| background | 导航栏背景色 | _string_ | - |
| left-text | 左侧文案 | _string_ | `''` |
| right-text | 右侧文案，最多展示四个字 | _string_ | `''` |
| left-buttons | 左侧按钮配置，左侧整体最多展示两个位置；未配置图标时，第一个默认返回，第二个默认关闭 | _NavBarButton[]_ | `[]` |
| right-buttons | 右侧按钮配置，右侧整体最多展示两个位置，可通过 `menu` 配置下拉菜单 | _NavBarButton[]_ | `[]` |
| left-disabled `v4.6.8` | 是否禁用左侧按钮，禁用时透明度降低，且无法点击 | _boolean_ | `false` |
| right-disabled `v4.6.8` | 是否禁用右侧按钮，禁用时透明度降低，且无法点击 | _boolean_ | `false` |
| left-arrow | 是否显示左侧箭头 | _boolean_ | `false` |
| border | 是否显示下边框 | _boolean_ | `true` |
| fixed | 是否固定在顶部 | _boolean_ | `false` |
| placeholder | 固定在顶部时，是否在标签位置生成一个等高的占位元素 | _boolean_ | `false` |
| z-index | 导航栏 z-index | _number \| string_ | `1` |
| safe-area-inset-top | 是否开启[顶部安全区适配](#/zh-CN/advanced-usage#di-bu-an-quan-qu-gua-pei) | _boolean_ | `false` |
| clickable | 是否开启两侧按钮的点击反馈 | _boolean_ | `true` |
| search | 无标题时，是否将标题区域渲染为搜索框 | _boolean_ | `false` |
| search-value | 搜索框内容 | _string_ | `''` |
| search-placeholder | 搜索框占位提示 | _string_ | `''` |
| search-props | 原生 Search 组件配置项 | _Partial\<SearchProps\>_ | - |

### Slots

| 名称               | 说明                     |
| ------------------ | ------------------------ |
| title              | 自定义标题               |
| left               | 自定义左侧区域内容       |
| right              | 自定义右侧区域内容       |
| left-action        | 自定义左侧第一个操作按钮 |
| left-extra-action  | 自定义左侧第二个操作按钮 |
| right-action       | 自定义右侧第一个操作按钮 |
| right-extra-action | 自定义右侧第二个操作按钮 |
| search             | 自定义搜索框内容         |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| click-left | 点击左侧按钮时触发 | _event: MouseEvent_ |
| click-right | 点击右侧按钮时触发 | _event: MouseEvent_ |
| click-left-button | 点击左侧多按钮时触发 | _button: NavBarButton, index: number, event: MouseEvent_ |
| click-right-button | 点击右侧多按钮时触发 | _button: NavBarButton, index: number, event: MouseEvent_ |
| select-right-menu | 选择右侧按钮下拉菜单时触发 | _item: NavBarMenuItem, itemIndex: number, button: NavBarButton, buttonIndex: number, event: MouseEvent_ |
| update:search-value | 搜索框内容变化时触发 | _value: string_ |
| search | 点击搜索框左侧搜索图标时触发 | _value: string, event: MouseEvent_ |

### 类型定义

组件导出以下类型定义：

```ts
import type {
  NavBarProps,
  NavBarButton,
  NavBarMenuItem,
  SearchProps,
} from 'vant';
```

### NavBarButton 数据结构

| 名称       | 说明                                    | 类型               |
| ---------- | --------------------------------------- | ------------------ |
| icon       | 图标名称                                | _string_           |
| iconPrefix | 图标类名前缀                            | _string_           |
| size       | 图标大小，同时作为按钮宽高；默认 `28px` | _number \| string_ |
| text       | 按钮文本                                | _string_           |
| color      | 按钮颜色                                | _string_           |
| disabled   | 是否禁用按钮                            | _boolean_          |
| className  | 自定义按钮类名                          | _string_           |
| menu       | 右侧按钮下拉菜单配置                    | _NavBarMenuItem[]_ |

### NavBarMenuItem 数据结构

| 名称       | 说明             | 类型      |
| ---------- | ---------------- | --------- |
| icon       | 图标名称         | _string_  |
| iconPrefix | 图标类名前缀     | _string_  |
| text       | 菜单项文本       | _string_  |
| color      | 菜单项颜色       | _string_  |
| disabled   | 是否禁用菜单项   | _boolean_ |
| className  | 自定义菜单项类名 | _string_  |

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称                              | 默认值                     | 描述 |
| --------------------------------- | -------------------------- | ---- |
| --van-nav-bar-height              | _44px_                     | -    |
| --van-nav-bar-background          | _var(--van-background-2)_  | -    |
| --van-nav-bar-arrow-size          | _16px_                     | -    |
| --van-nav-bar-icon-color          | _var(--van-primary-color)_ | -    |
| --van-nav-bar-text-color          | _var(--van-primary-color)_ | -    |
| --van-nav-bar-title-font-size     | _var(--van-font-size-lg)_  | -    |
| --van-nav-bar-title-min-font-size | _14px_                     | -    |
| --van-nav-bar-title-gap           | _6px_                      | -    |
| --van-nav-bar-title-text-color    | _var(--van-text-color)_    | -    |
| --van-nav-bar-z-index             | _1_                        | -    |
| --van-nav-bar-horizontal-padding  | _8px_                      | -    |
| --van-nav-bar-button-gap          | _12px_                     | -    |
| --van-nav-bar-button-width        | _28px_                     | -    |
| --van-nav-bar-button-height       | _28px_                     | -    |
| --van-nav-bar-button-icon-size    | _28px_                     | -    |
| --van-nav-bar-menu-z-index        | _2000_                     | -    |
| --van-nav-bar-menu-width          | _112px_                    | -    |
| --van-nav-bar-menu-edge-gap       | _8px_                      | -    |
| --van-nav-bar-menu-arrow-gap      | _2px_                      | -    |
| --van-nav-bar-menu-arrow-width    | _10px_                     | -    |
| --van-nav-bar-menu-arrow-height   | _4px_                      | -    |
| --van-nav-bar-menu-arrow-color    | _#fff_                     | -    |
| --van-nav-bar-menu-item-height    | _48px_                     | -    |
| --van-nav-bar-menu-background     | _var(--van-background-2)_  | -    |
| --van-nav-bar-search-height       | _32px_                     | -    |
| --van-nav-bar-search-background   | _var(--van-background)_    | -    |
| --van-nav-bar-search-radius       | _var(--van-radius-md)_     | -    |
