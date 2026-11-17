# IndexBar 索引栏

### 介绍

用于列表的索引分类显示和快速定位。在原生能力基础上新增 `searchable` 搜索过滤、匹配高亮与空状态；下列 Props / Events / Slots 名称后标注 `new` 的为新增项。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { IndexBar, IndexAnchor } from 'vant';

const app = createApp();
app.use(IndexBar);
app.use(IndexAnchor);
```

## 代码演示

### 基础用法

点击索引栏时，会自动跳转到对应的 `IndexAnchor` 锚点位置。

```html
<van-index-bar>
  <van-index-anchor index="A" />
  <van-cell title="文本" />
  <van-cell title="文本" />
  <van-cell title="文本" />

  <van-index-anchor index="B" />
  <van-cell title="文本" />
  <van-cell title="文本" />
  <van-cell title="文本" />

  ...
</van-index-bar>
```

### 自定义索引列表

可以通过 `index-list` 属性自定义展示的索引字符列表。

```html
<van-index-bar :index-list="indexList">
  <van-index-anchor index="1">标题1</van-index-anchor>
  <van-cell title="文本" />
  <van-cell title="文本" />
  <van-cell title="文本" />

  <van-index-anchor index="2">标题2</van-index-anchor>
  <van-cell title="文本" />
  <van-cell title="文本" />
  <van-cell title="文本" />

  ...
</van-index-bar>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const indexList = [1, 2, 3, 4, 5, 6, 8, 9, 10];
    return { indexList };
  },
};
```

### 搜索

设置 `searchable` 开启顶部搜索框，通过 `v-model:search` 绑定搜索关键词。

搜索有结果时，右侧索引栏仅展示仍有匹配项的分组且不可点击；无结果时展示空状态。

#### 传统写法

`IndexAnchor` 与 `van-cell` 为兄弟节点时，需为 `IndexAnchor` 传入本组 `search-texts` 供分组过滤；列表项由 `IndexBar` 按 `title` 过滤，高亮通过 Cell 的 `highlight` 完成。

```html
<van-index-bar
  v-model:search="searchKeyword"
  searchable
  search-placeholder="请输入搜索关键词，如「百度」「北京」"
  empty-description="暂无搜索结果"
>
  <div v-for="index in indexList" :key="index">
    <van-index-anchor :index="index" :search-texts="searchItems[index]" />
    <van-cell
      v-for="title in searchItems[index]"
      :key="title"
      :title="title"
      :highlight="[searchKeyword]"
    />
  </div>
</van-index-bar>
```

#### 自动渲染

为 `IndexAnchor` 设置 `search-texts` 后，可由组件自动渲染列表项，并通过内置 Cell 完成匹配关键词高亮。

```html
<van-index-bar
  v-model:search="searchKeyword"
  searchable
  search-placeholder="请输入搜索关键词，如「百度」「北京」"
  empty-description="暂无搜索结果"
>
  <van-index-anchor
    v-for="index in indexList"
    :key="index"
    :index="index"
    :search-texts="searchItems[index]"
  />
</van-index-bar>
```

#### 自定义列表项

使用 `#body` 插槽自行渲染 `van-cell`，`texts` 为当前分组经搜索过滤后的文案列表，图标、描述等由 Cell 插槽自定义，高亮通过 `highlight` 传入：

```html
<van-index-anchor index="B" :search-texts="['百度地图', '北京大学']">
  <template #body="{ texts }">
    <van-cell
      v-for="title in texts"
      :key="title"
      :title="title"
      :highlight="[searchKeyword]"
    >
      <template #icon>
        <van-image round width="40" height="40" :src="avatarMap[title]" />
      </template>
      <template #label>B</template>
    </van-cell>
  </template>
</van-index-anchor>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const searchKeyword = ref('');
    const indexList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const searchItems = {
      A: ['阿里巴巴', '安徽合肥', '爱心捐助'],
      B: ['百度地图', '北京大学', '百货商场'],
      // ...
    };

    return {
      searchKeyword,
      indexList,
      searchItems,
    };
  },
};
```

## API

### IndexBar Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| index-list | 索引字符列表 | _(string \| number)[]_ | `A-Z` |
| z-index | z-index 层级 | _number \| string_ | `1` |
| sticky | 是否开启锚点自动吸顶 | _boolean_ | `true` |
| sticky-offset-top | 锚点自动吸顶时与顶部的距离 | _number_ | `0` |
| highlight-color | 索引字符高亮颜色 | _string_ | - |
| teleport | 指定索引栏挂载的节点 | _string \| Element_ | - |
| searchable `new` | 是否开启搜索 | _boolean_ | `false` |
| search `new` | 搜索关键词，支持 `v-model:search` 双向绑定 | _string_ | - |
| search-placeholder `new` | 搜索框占位提示文字 | _string_ | - |
| empty-image `new` | 无搜索结果时 [Empty](#/zh-CN/empty) 组件的图片类型 | _string_ | `search` |
| empty-description `new` | 无搜索结果时的描述文字 | _string_ | - |

### IndexAnchor Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| index | 索引字符 | _number \| string_ | - |
| search-texts `new` | 参与分组搜索的文本列表；设置后可在 `searchable` 下自动渲染为列表项 | _string[]_ | - |

### IndexBar Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| select | 点击索引栏的字符时触发 | _index: number \| string_ |
| change | 当前高亮的索引字符变化时触发 | _index: number \| string_ |
| update:search `new` | 搜索关键词变化时触发 | _value: string_ |

### IndexBar 方法

通过 ref 可以获取到 IndexBar 实例并调用实例方法，详见[组件实例方法](#/zh-CN/advanced-usage#zu-jian-shi-li-fang-fa)。

| 方法名   | 说明           | 参数                      | 返回值 |
| -------- | -------------- | ------------------------- | ------ |
| scrollTo | 滚动到指定锚点 | _index: number \| string_ | -      |

### 类型定义

组件导出以下类型定义：

```ts
import type { IndexBarProps, IndexAnchorProps, IndexBarInstance } from 'vant';
```

`IndexBarInstance` 是组件实例的类型，用法如下：

```ts
import { ref } from 'vue';
import type { IndexBarInstance } from 'vant';

const indexBarRef = ref<IndexBarInstance>();

indexBarRef.value?.scrollTo('B');
```

### IndexAnchor Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| default | 锚点位置显示内容，默认为索引字符 | - |
| item-icon `new` | 自定义搜索列表项左侧图标，标题高亮仍由组件内部处理 | _{ text, item, index, anchorIndex }_ |
| item-label `new` | 自定义搜索列表项描述内容 | _{ text, item, index, anchorIndex }_ |
| item-value `new` | 自定义搜索列表项右侧内容 | _{ text, item, index, anchorIndex }_ |
| item-extra `new` | 自定义搜索列表项额外内容 | _{ text, item, index, anchorIndex }_ |
| body `new` | 高级自定义锚点下的完整列表内容；使用该插槽时需自行处理列表项渲染 | _{ texts: string[] }_ |

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

#### IndexBar

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-index-bar-sidebar-z-index | _2_ | 右侧索引栏 z-index |
| --van-index-bar-index-font-size | _var(--van-font-size-xs)_ | 索引字符字号 |
| --van-index-bar-index-line-height | _var(--van-line-height-xs)_ | 索引字符行高 |
| --van-index-bar-index-active-size | _20px_ | 索引字符激活尺寸 |
| --van-index-bar-bubble-width | _48px_ | 索引提示气泡宽度 |
| --van-index-bar-bubble-height | _40px_ | 索引提示气泡高度 |
| --van-index-bar-bubble-gap | _8px_ | 索引提示气泡间距 |
| --van-index-bar-bubble-font-size | _20px_ | 索引提示气泡字号 |
| --van-index-bar-bubble-background | _var(--van-primary-color)_ | 索引圆点背景色 |
| --van-index-bar-bubble-image | _url('./assets/bubble.svg')_ | 索引提示气泡背景图 |
| --van-index-bar-bubble-color | _var(--van-white)_ | 索引提示气泡文字颜色 |

#### IndexAnchor

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-index-anchor-z-index | _1_ | z-index |
| --van-index-anchor-padding | _0 var(--van-padding-md)_ | 内边距 |
| --van-index-anchor-text-color | _#999999_ | 文字颜色 |
| --van-index-anchor-font-weight | _var(--van-font-bold)_ | 字重 |
| --van-index-anchor-font-size | _var(--van-font-size-md)_ | 字号 |
| --van-index-anchor-line-height | _30px_ | 行高 |
| --van-index-anchor-background | _#f5f5f5_ | 背景色 |
| --van-index-anchor-sticky-text-color | _var(--van-primary-color)_ | 吸顶时文字颜色 |
| --van-index-anchor-sticky-background | _var(--van-background-2)_ | 吸顶时背景色 |

搜索列表项匹配高亮使用 [Cell](#/zh-CN/cell) 内置能力，类名为 `.van-cell__highlight`，颜色见 `--van-cell-highlight-color`。

替换索引提示气泡图片时，可覆盖 `--van-index-bar-bubble-image`：

```css
--van-index-bar-bubble-image: url('your-bubble.png');
```
