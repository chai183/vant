# Tab 标签页

### 介绍

选项卡组件，用于在不同的内容区域之间进行切换。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { Tab, Tabs, CascadeTabs } from 'vant';

const app = createApp();
app.use(Tab);
app.use(Tabs);
app.use(CascadeTabs);
```

## 代码演示

### 基础用法

通过 `v-model:active` 绑定当前激活标签对应的索引值，默认情况下启用第一个标签。

```html
<van-tabs v-model:active="active">
  <van-tab title="标签 1">内容 1</van-tab>
  <van-tab title="标签 2">内容 2</van-tab>
  <van-tab title="标签 3">内容 3</van-tab>
  <van-tab title="标签 4">内容 4</van-tab>
</van-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref(0);
    return { active };
  },
};
```

### 下划线风格

通过 `type="underline"` 启用下划线风格，未选中标签文字颜色为 `#333333`，选中标签文字为主题色，并在文字下方展示宽 20px、高 2px 的主题色下划线（每个标签独立展示，非底部滑动条）；整条标签栏高度为 48px。

```html
<van-tabs v-model:active="active" type="underline">
  <van-tab title="标签 1">内容 1</van-tab>
  <van-tab title="标签 2">内容 2</van-tab>
  <van-tab title="标签 3">内容 3</van-tab>
  <van-tab title="标签 4">内容 4</van-tab>
</van-tabs>
```

### 圆角背景风格

通过 `type="rounded"` 启用圆角背景风格，未选中标签为 `#f5f5f5` 背景（内边距上下 6px、左右 12px），标签间距 12px，选中后为背景主题色、文字为白色；整条白色标签栏内边距为上下 10px、左右 12px。标签数少于 `swipe-threshold`（默认 5）时按内容宽度左对齐排列；等于 5 个时均分占满宽度；大于 5 个时横向滚动。

```html
<van-tabs v-model:active="active" type="rounded">
  <van-tab title="标签 1">内容 1</van-tab>
  <van-tab title="标签 2">内容 2</van-tab>
  <van-tab title="标签 3">内容 3</van-tab>
  <van-tab title="标签 4">内容 4</van-tab>
</van-tabs>
```

### 分隔线风格

通过 `type="divider"` 启用分隔线风格，白色标签栏上下内边距为 16px，每个标签左右内边距为 12px（按内容宽度排列）；未选中文字颜色为 `#666666`，选中为主题色（不加粗）；每个标签右侧展示竖向分隔线（最后一项除外）。

```html
<van-tabs v-model:active="active" type="divider">
  <van-tab title="标签 1">内容 1</van-tab>
  <van-tab title="标签 2">内容 2</van-tab>
  <van-tab title="标签 3">内容 3</van-tab>
  <van-tab title="标签 4">内容 4</van-tab>
</van-tabs>
```

### 多级联动

通过 `CascadeTabs` 组件实现多级标签联动，支持 2 级或 3 级。各级标签栏样式固定为：

- 第 1 级：`underline` 下划线风格（与「下划线风格」demo 一致）
- 第 2 级：`rounded` 圆角背景风格（与「圆角背景风格」demo 一致）
- 第 3 级：`divider` 分隔线风格

通过 `v-model:active` 绑定各级选中索引组成的数组，通过 `options` 传入树形选项数据。切换上级标签时，下级选中索引会自动重置为 0。任一级标签内容超出容器宽度时，会自动横向滚动并在右侧展示菜单图标。

#### 三级联动

```html
<van-cascade-tabs v-model:active="active" :levels="3" :options="options">
  <template #default="{ active, titles }">
    当前选中：{{ titles.join(' / ') }}
  </template>
</van-cascade-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref([0, 0, 0]);
    const options = ref([
      {
        title: '标签 1',
        children: [
          {
            title: '标签 1-1',
            children: [{ title: '标签 1-1-1' }, { title: '标签 1-1-2' }],
          },
          {
            title: '标签 1-2',
            children: [{ title: '标签 1-2-1' }, { title: '标签 1-2-2' }],
          },
        ],
      },
      {
        title: '标签 2',
        children: [
          {
            title: '标签 2-1',
            children: [{ title: '标签 2-1-1' }, { title: '标签 2-1-2' }],
          },
        ],
      },
    ]);

    return { active, options };
  },
};
```

#### 二级联动

设置 `levels` 为 `2` 即可启用二级联动，仅展示下划线风格与圆角背景风格两级标签栏。

```html
<van-cascade-tabs v-model:active="active" :levels="2" :options="options">
  <template #default="{ titles }">
    当前选中：{{ titles.join(' / ') }}
  </template>
</van-cascade-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref([0, 0]);
    const options = ref([
      {
        title: '标签 1',
        children: [{ title: '标签 1-1' }, { title: '标签 1-2' }],
      },
      {
        title: '标签 2',
        children: [{ title: '标签 2-1' }, { title: '标签 2-2' }],
      },
    ]);

    return { active, options };
  },
};
```

### 通过名称匹配

在标签指定 `name` 属性的情况下，`v-model:active` 的值为当前标签的 `name`（此时无法通过索引值来匹配标签）。

```html
<van-tabs v-model:active="activeName">
  <van-tab title="标签 1" name="a">内容 1</van-tab>
  <van-tab title="标签 2" name="b">内容 2</van-tab>
  <van-tab title="标签 3" name="c">内容 3</van-tab>
</van-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const activeName = ref('b');
    return { activeName };
  },
};
```

### 标签栏滚动

标签数量超过当前宽度时可横向滚动，支持两种溢出展示方式，通过 `nav-overflow` 属性切换：

#### 菜单图标（默认）

此时右侧会展示菜单图标（默认 `#333333`，展开时为 `color` 属性设置的主题色），点击后通过 `RadioGroup` 的列表展示（`is-list`）快速切换标签。

```html
<van-tabs v-model:active="active" type="underline">
  <van-tab v-for="index in 8" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

可通过 `show-nav-menu` 属性关闭右侧菜单图标：

```html
<van-tabs v-model:active="active" :show-nav-menu="false">
  <van-tab v-for="index in 8" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

#### 滚动阴影

设置 `nav-overflow="shadow"` 后，最右侧会展示宽 12px 的小方块，并在方块左侧显示阴影，提示可继续向右滚动；滚动到最右侧后，小方块会移动到 tabs 左侧，并在方块右侧显示阴影。

```html
<van-tabs v-model:active="active" type="underline" nav-overflow="shadow">
  <van-tab v-for="index in 8" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

### 禁用标签

设置 `disabled` 属性即可禁用标签。

```html
<van-tabs v-model:active="active">
  <van-tab title="标签 1">内容 1</van-tab>
  <van-tab title="标签 2" disabled>内容 2</van-tab>
  <van-tab title="标签 3">内容 3</van-tab>
</van-tabs>
```

### 样式风格

`Tabs` 支持多种样式风格：`line`、`card`、`rounded`、`underline`、`divider`，默认为 `line` 样式，可以通过 `type` 属性切换样式风格。

```html
<van-tabs v-model:active="active" type="card">
  <van-tab title="标签 1">内容 1</van-tab>
  <van-tab title="标签 2">内容 2</van-tab>
  <van-tab title="标签 3">内容 3</van-tab>
</van-tabs>
```

### 点击事件

点击标签页时，会触发 `click-tab` 事件。

```html
<van-tabs v-model:active="active" @click-tab="onClickTab">
  <van-tab title="标签 1">内容 1</van-tab>
  <van-tab title="标签 2">内容 2</van-tab>
</van-tabs>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const active = ref(0);
    const onClickTab = ({ title }) => showToast(title);
    return {
      active,
      onClickTab,
    };
  },
};
```

### 粘性布局

通过 `sticky` 属性可以开启粘性布局，粘性布局下，标签页滚动到顶部时会自动吸顶。

```html
<van-tabs v-model:active="active" sticky>
  <van-tab v-for="index in 4" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

> Tips: 如果页面顶部有其他内容，可以通过 offset-top 属性设置吸顶时与顶部的距离。

### 收缩布局

通过 `shrink` 属性可以开启收缩布局，开启后，所有的标签会向左侧收缩对齐。

```html
<van-tabs v-model:active="active" shrink>
  <van-tab v-for="index in 4" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>

<van-tabs v-model:active="active" shrink type="card">
  <van-tab v-for="index in 4" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

### 自定义标签

通过 `title` 插槽可以自定义标签内容。

```html
<van-tabs v-model:active="active">
  <van-tab v-for="index in 2">
    <template #title>
      <van-icon name="more-o" />
      标签
    </template>
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

### 切换动画

通过 `animated` 属性可以开启切换标签内容时的转场动画。

```html
<van-tabs v-model:active="active" animated>
  <van-tab v-for="index in 4" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

### 滑动切换

通过 `swipeable` 属性可以开启滑动切换标签页。

```html
<van-tabs v-model:active="active" swipeable>
  <van-tab v-for="index in 4" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

### 滚动导航

通过 `scrollspy` 属性可以开启滚动导航模式，该模式下，内容将会平铺展示。

```html
<van-tabs v-model:active="active" scrollspy sticky>
  <van-tab v-for="index in 8" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

### 异步切换

通过 `before-change` 属性可以在切换标签前执行特定的逻辑。

```html
<van-tabs v-model:active="active" :before-change="beforeChange">
  <van-tab v-for="index in 4" :title="'标签 ' + index">
    内容 {{ index }}
  </van-tab>
</van-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref(0);
    const beforeChange = (index) => {
      // 返回 false 表示阻止此次切换
      if (index === 1) {
        return false;
      }

      // 返回 Promise 来执行异步逻辑
      return new Promise((resolve) => {
        // 在 resolve 函数中返回 true 或 false
        setTimeout(() => resolve(index !== 3), 1000);
      });
    };

    return {
      beforeChange,
    };
  },
};
```

> Tips: 通过手势滑动不会触发 before-change 属性。

### 隐藏标题栏

通过将 `showHeader` 属性设置为 `false`，可以不渲染 Tabs 的标题栏。在这种情况下，你可以通过一些自定义组件来控制 Tabs 的 `active` 属性。

```html
<van-tabs v-model:active="active" :show-header="false">
  <van-tab v-for="index in 4">内容 {{ index }}</van-tab>
</van-tabs>
```

## API

### Tabs Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:active | 绑定当前选中标签的标识符 | _number \| string_ | `0` |
| type | 样式风格类型，可选值为 `line` `card` `rounded` `underline` `divider` | _string_ | `line` |
| color | 标签主题色 | _string_ | `#1989fa` |
| background | 标签栏背景色 | _string_ | `white` |
| duration | 动画时间，单位秒，设置为 0 可以禁用动画 | _number \| string_ | `0.3` |
| line-width | 底部条宽度，默认单位 `px` | _number \| string_ | `40px` |
| line-height | 底部条高度，默认单位 `px` | _number \| string_ | `3px` |
| animated | 是否开启切换标签内容时的转场动画（开启该属性后，内容区如果有粘性布局将会不达预期） | _boolean_ | `false` |
| border | 是否显示标签栏外边框，仅在 `type="line"` 时有效 | _boolean_ | `false` |
| ellipsis | 是否省略过长的标题文字（仅在 `shrink` 为 `false` 且 `tab` 数量小于等于 `swipe-threshold` 时生效） | _boolean_ | `true` |
| sticky | 是否使用粘性布局 | _boolean_ | `false` |
| shrink | 是否开启左侧收缩布局 | _boolean_ | `false` |
| swipeable | 是否开启手势左右滑动切换（开启该属性后，内容区如果有粘性布局将会不达预期） | _boolean_ | `false` |
| lazy-render | 是否开启延迟渲染（首次切换到标签时才触发内容渲染） | _boolean_ | `true` |
| scrollspy | 是否开启滚动导航 | _boolean_ | `false` |
| show-header `v4.7.3` | 是否显示标题栏 | _boolean_ | `true` |
| show-nav-menu | 标签栏滚动时，是否在右侧展示菜单图标，`nav-overflow` 为 `menu` 时生效 | _boolean_ | `true` |
| nav-overflow | 标签栏溢出时的展示方式，可选值为 `menu` `shadow` | _string_ | `menu` |
| offset-top | 粘性布局下吸顶时与顶部的距离，支持 `px` `vw` `vh` `rem` 单位，默认 `px` | _number \| string_ | `0` |
| swipe-threshold | 滚动阈值，标签数量超过阈值且总宽度超过标签栏宽度时开始横向滚动（仅在 `shrink` 为 `false` 且 `ellipsis` 为 `true` 时生效） | _number \| string_ | `5` |
| title-active-color | 标题选中态颜色 | _string_ | - |
| title-inactive-color | 标题默认态颜色 | _string_ | - |
| before-change | 切换标签前的回调函数，返回 `false` 可阻止切换，支持返回 Promise | _(name: number \| string) => boolean \| Promise\<boolean\>_ | - |

### Tab Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 标题 | _string_ | - |
| disabled | 是否禁用标签 | _boolean_ | `false` |
| dot | 是否在标题右上角显示小红点 | _boolean_ | `false` |
| badge | 图标右上角徽标的内容（`dot` 为 `fasle` 时生效） | _number \| string_ | - |
| name | 标签名称，作为匹配的标识符 | _number \| string_ | 标签的索引值 |
| url | 点击后跳转的链接地址 | _string_ | - |
| to | 点击后跳转的目标路由对象，等同于 Vue Router 的 [to 属性](https://router.vuejs.org/zh/api/interfaces/RouterLinkProps.html#Properties-to) | _string \| object_ | - |
| replace | 是否在跳转时替换当前页面历史 | _boolean_ | `false` |
| title-style | 自定义标题样式 | _string \| Array \| object_ | - |
| title-class | 自定义标题类名 | _string \| Array \| object_ | - |
| show-zero-badge | 当 badge 为数字 0 时，是否展示徽标 | _boolean_ | `true` |

### Tabs Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| click-tab | 点击标签时触发 | _{ name: string \| number, title: string, event: MouseEvent, disabled: boolean }_ |
| change | 当前激活的标签改变时触发 | _name: string \| number, title: string_ |
| rendered | 标签内容首次渲染时触发（仅在开启延迟渲染后触发） | _name: string \| number, title: string_ |
| scroll | 滚动时触发，仅在 sticky 模式下生效 | _{ scrollTop: number, isFixed: boolean }_ |

> 提示：click 和 disabled 事件已废弃，请使用 click-tab 事件代替。

### Tabs 方法

通过 ref 可以获取到 Tabs 实例并调用实例方法，详见[组件实例方法](#/zh-CN/advanced-usage#zu-jian-shi-li-fang-fa)。

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| resize | 外层元素大小或组件显示状态变化时，可以调用此方法来触发重绘 | - | - |
| scrollTo | 滚动到指定的标签页，在滚动导航模式下可用 | _name: string \| number_ | - |

### 类型定义

组件导出以下类型定义：

```ts
import type { TabProps, TabsType, TabsProps, TabsInstance } from 'vant';
```

`TabsInstance` 是组件实例的类型，用法如下：

```ts
import { ref } from 'vue';
import type { TabsInstance } from 'vant';

const tabsRef = ref<TabsInstance>();

tabsRef.value?.scrollTo(0);
```

### Tabs Slots

| 名称       | 说明           |
| ---------- | -------------- |
| nav-left   | 标签栏左侧内容 |
| nav-right  | 标签栏右侧内容 |
| nav-bottom | 标签栏下方内容 |

### Tab Slots

| 名称    | 说明       |
| ------- | ---------- |
| default | 标签页内容 |
| title   | 自定义标题 |

### CascadeTabs Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:active | 各级选中索引组成的数组 | _number[]_ | `[0, 0, 0]` |
| levels | 联动级数，可选值为 `2` `3` | _number \| string_ | `3` |
| options | 树形选项数据 | _CascadeTabOption[]_ | `[]` |
| color | 标签主题色，会传递给各级 `Tabs` | _string_ | - |
| swipe-threshold | 滚动阈值，会传递给各级 `Tabs` | _number \| string_ | `5` |
| show-nav-menu | 标签栏滚动时是否在右侧展示菜单图标 | _boolean_ | `true` |

### CascadeTabOption 数据结构

| 键名     | 说明     | 类型                 |
| -------- | -------- | -------------------- |
| title    | 标签标题 | _string_             |
| disabled | 是否禁用 | _boolean_            |
| children | 子级选项 | _CascadeTabOption[]_ |

### CascadeTabs Events

| 事件名 | 说明               | 回调参数                                 |
| ------ | ------------------ | ---------------------------------------- |
| change | 选中路径变化时触发 | _{ active: number[], titles: string[] }_ |

### CascadeTabs Slots

| 名称    | 说明         | 参数                                     |
| ------- | ------------ | ---------------------------------------- |
| default | 联动内容区域 | _{ active: number[], titles: string[] }_ |

### CascadeTabs 类型定义

组件导出以下类型定义：

```ts
import type {
  CascadeTabOption,
  CascadeTabsProps,
  CascadeTabsInstance,
  CascadeTabsActivePath,
  CascadeTabsChangeParams,
} from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-tab-text-color | _var(--van-gray-7)_ | - |
| --van-tab-active-text-color | _var(--van-text-color)_ | - |
| --van-tab-disabled-text-color | _var(--van-text-color-3)_ | - |
| --van-tab-font-size | _var(--van-font-size-md)_ | - |
| --van-tab-line-height | _var(--van-line-height-md)_ | - |
| --van-tabs-default-color | _var(--van-primary-color)_ | - |
| --van-tabs-line-height | _44px_ | - |
| --van-tabs-card-height | _30px_ | - |
| --van-tabs-rounded-inactive-background | _#f5f5f5_ | - |
| --van-tabs-rounded-padding-vertical | _6px_ | - |
| --van-tabs-rounded-padding-horizontal | _12px_ | - |
| --van-tabs-rounded-gap | _12px_ | - |
| --van-tabs-rounded-nav-background | _var(--van-white)_ | - |
| --van-tabs-rounded-nav-padding-vertical | _10px_ | - |
| --van-tabs-rounded-nav-padding-horizontal | _12px_ | - |
| --van-tabs-rounded-nav-radius | _var(--van-radius-lg)_ | - |
| --van-tabs-nav-background | _var(--van-background-2)_ | - |
| --van-tabs-divider-nav-padding-vertical | _16px_ | - |
| --van-tabs-divider-tab-padding-horizontal | _12px_ | - |
| --van-tabs-divider-nav-background | _var(--van-white)_ | - |
| --van-tabs-divider-inactive-text-color | _#666666_ | - |
| --van-tabs-divider-line-width | _0.5px_ | - |
| --van-tabs-divider-line-height | _12px_ | - |
| --van-tabs-divider-line-color | _#dddddd_ | - |
| --van-tabs-nav-menu-icon-color | _#333333_ | - |
| --van-tabs-nav-menu-icon-active-color | _var(--van-primary-color)_ | - |
| --van-tabs-nav-menu-background | _var(--van-white)_ | - |
| --van-tabs-nav-menu-panel-padding-horizontal | _12px_ | - |
| --van-tabs-scroll-shadow-width | _12px_ | - |
| --van-tabs-scroll-shadow-color | _rgba(0, 0, 0, 0.08)_ | - |
| --van-tabs-bottom-bar-width | _40px_ | - |
| --van-tabs-bottom-bar-height | _3px_ | - |
| --van-tabs-bottom-bar-color | _var(--van-primary-color)_ | - |
| --van-tabs-underline-height | _48px_ | - |
| --van-tabs-underline-bar-width | _20px_ | - |
| --van-tabs-underline-bar-height | _2px_ | - |
| --van-tabs-underline-inactive-text-color | _#333333_ | - |

## 常见问题

### 组件从隐藏状态切换到显示状态时，底部条位置错误？

Tabs 组件在挂载时，会获取自身的宽度，并计算出底部条的位置。如果组件一开始处于隐藏状态，则获取到的宽度永远为 0，因此无法展示底部条位置。

#### 解决方法

方法一，如果是使用 `v-show` 来控制组件展示的，则替换为 `v-if` 即可解决此问题：

```html
<!-- Before -->
<van-tabs v-show="show" />
<!-- After -->
<van-tabs v-if="show" />
```

方法二，调用组件的 resize 方法来主动触发重绘：

```html
<van-tabs v-show="show" ref="tabs" />
```

```js
this.$refs.tabs.resize();
```

### Tabs 开启 swipeable 或 animated 属性后，内容区元素的 sticky 功能将不达预期

`Tabs` 开启 `swipeable` 或 `animated` 属性后，内容区将被带有 `transform` 属性的元素包裹，此时如果内容区的元素开启了 `sticky` 功能，那么该功能生效了，但显示位置将不达预期。

比如下面的代码：

```html
<van-tabs v-model:active="active" swipeable>
  <van-tab>
    <van-sticky>
      <van-button>sticky button</van-button>
    </van-sticky>
  </van-tab>
</van-tabs>
```

这是因为 `transform` 元素内部的 `fixed` 定位会相对于该元素进行计算，而不是相对于整个文档，从而导致布局异常。

### 如何判断当前组件是否处于激活的 Tab 内？

可以在子组件中通过调用 `useTabStatus` 或 `useAllTabStatus` 来判断当前组件是否处于激活的 `Tab` 内部。

- `useTabStatus`：返回当前组件所在的 `Tab` 是否为激活状态，若组件不在 `Tab` 内部则返回 `null`。
- `useAllTabStatus`：在存在嵌套 `Tab` 的场景下，返回是否所有上层 `Tab` 为激活状态，若组件不在 `Tab` 内部则返回 `null`。

```js
const isActive = useTabStatus();
// 嵌套 Tab 场景
const isAllActive = useAllTabStatus();
```
