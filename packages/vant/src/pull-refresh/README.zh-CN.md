# PullRefresh 下拉刷新

### 介绍

用于提供下拉刷新的交互操作。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { PullRefresh } from 'vant';

const app = createApp();
app.use(PullRefresh);
```

## 代码演示

### 基础用法

下拉刷新时会触发 `refresh` 事件，在事件的回调函数中可以进行同步或异步操作

操作完成后将 `v-model` 设置为 `false`，表示加载完成。

```html
<van-pull-refresh v-model="loading" @refresh="onRefresh">
  <p>刷新次数: {{ count }}</p>
</van-pull-refresh>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const count = ref(0);
    const loading = ref(false);
    const onRefresh = () => {
      setTimeout(() => {
        showToast('刷新成功');
        loading.value = false;
        count.value++;
      }, 1000);
    };

    return {
      count,
      loading,
      onRefresh,
    };
  },
};
```

### 成功提示

**涉及props**

`success-text` 刷新成功时的提示文案

`success-icon` 刷新成功时的图标

注意：想要开启胶囊形式的成功提示,必须传递 `success-text` 或插槽 `success`

```html
<van-pull-refresh
  v-model="isLoading"
  success-text="刷新成功"
  @refresh="onRefresh"
>
  <p>刷新次数: {{ count }}</p>
</van-pull-refresh>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const count = ref(0);
    const loading = ref(false);
    const onRefresh = () => {
      setTimeout(() => {
        loading.value = false;
        count.value++;
      }, 1000);
    };

    return {
      count,
      loading,
      onRefresh,
    };
  },
};
```

### 失败提示

**涉及props**

`error-text` 失败时,提示的文本

**涉及事件**

`refresh({error})` error参数,可用于传递报错

`error` 处理具体的报错逻辑

```html
<van-pull-refresh v-model="isLoading" @refresh="onRefresh" @error="onError">
  <p>刷新次数: {{ count }}</p>
</van-pull-refresh>
```

```js
const onRefresh = async ({ error }) => {
  try {
    // 发起接口请求
    await refreshData();
    count.value++;
    isLoading.value = false;
  } catch (err) {
    // 请求失败时调用组件提供的 error 方法
    error(err);
  }
};

const onError = (error) => {
  // 可以在这里上报错误日志等
  console.log(error);
};
```

如果需要自定义默认 Toast 文案，可以设置 `error-text`：

```html
<van-pull-refresh
  v-model="isLoading"
  error-text="当前网络不可用"
  @refresh="onRefresh"
>
  <p>刷新次数: {{ count }}</p>
</van-pull-refresh>
```

```js
const onRefresh = async ({ error }) => {
  try {
    await refreshData();
  } catch (err) {
    error(err);
  } finally {
    // 如果业务未调用 error 方法，也需要手动结束加载状态
    isLoading.value = false;
  }
};
```

### 自定义提示

通过插槽可以自定义下拉刷新过程中的提示内容。下面的示例将最大拖拽高度设置为 `100px`，图片会在下拉过程中跟随 `distance` 从中心逐步放大、进入加载态后保持 `100%` 大小，刷新成功后从 `100%` 缩放到 `0%`。

```js
const maxPullDistance = 100;

const getPullingStyle = (distance) => ({
  // distance / maxPullDistance 得到 0~1 的缩放比例，最大不超过 100%
  transform: `scale(${Math.min(distance / maxPullDistance, 1)})`,
});
```

```html
<van-pull-refresh
  v-model="isLoading"
  :head-height="maxPullDistance"
  :pull-distance="maxPullDistance"
  @refresh="onRefresh"
>
  <!-- 下拉阶段：图片跟随下拉距离从中心逐步放大 -->
  <template #pulling="props">
    <img
      class="doge"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
      :style="getPullingStyle(props.distance)"
    />
  </template>

  <!-- 释放阶段：达到最大拖拽距离后，图片保持 100% 大小 -->
  <template #loosing>
    <img
      class="doge"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
    />
  </template>

  <!-- 加载阶段：松手进入刷新状态，图片/GIF 保持 100% 大小不变 -->
  <template #loading>
    <img
      class="doge"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge-fire.jpeg"
    />
  </template>

  <!-- 成功阶段：通过动画实现从 100% 缩放到 0%，随后回到初始位置 -->
  <template #success>
    <img
      class="doge doge-success"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
    />
  </template>
  <p>刷新次数: {{ count }}</p>
</van-pull-refresh>

<style>
  .doge {
    width: 140px;
    height: 72px;
    margin-top: 8px;
    border-radius: 4px;
    transform-origin: center;
  }

  .doge-success {
    animation: doge-scale-out 500ms ease both;
  }

  @keyframes doge-scale-out {
    from {
      transform: scale(1);
    }

    to {
      transform: scale(0);
    }
  }
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 是否处于加载中状态 | _boolean_ | - |
| pulling-text | 下拉过程提示文案 | _string_ | `下拉刷新` |
| loosing-text | 释放过程提示文案 | _string_ | `松开刷新` |
| loading-text | 加载过程提示文案 | _string_ | `刷新中` |
| success-text | 刷新成功提示文案 | _string_ | - |
| error-text `new` | 刷新失败默认 Toast 提示文案 | _string_ | `请求错误` |
| pulling-icon `new` | 下拉过程提示图标，支持图标名称或图片链接 | _string_ | `down` |
| loosing-icon `new` | 释放过程提示图标，支持图标名称或图片链接 | _string_ | `down` |
| loading-icon `new` | 加载过程提示图标，支持图标名称或图片链接 | _string_ | `replay` |
| success-icon `new` | 刷新成功提示图标，支持图标名称或图片链接 | _string_ | `passed` |
| success-duration | 刷新成功提示展示时长(ms) | _number \| string_ | `500` |
| animation-duration | 动画时长 | _number \| string_ | `300` |
| head-height | 顶部内容高度 | _number \| string_ | `88` |
| pull-distance | 触发下拉刷新的距离 | _number \| string_ | 与 `head-height` 一致 |
| disabled | 是否禁用下拉刷新 | _boolean_ | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| refresh | 下拉刷新时触发 | _{ error: (error?: unknown) => void }_ |
| error `new` | 调用 `refresh` 参数中的 `error` 方法时触发 | _unknown_ |
| change | 拖动时或状态改变时触发 | _{ status: string, distance: number }_ |

### Slots

| 名称    | 说明                 | 参数                   |
| ------- | -------------------- | ---------------------- |
| default | 自定义内容           | -                      |
| normal  | 非下拉状态时顶部内容 | -                      |
| pulling | 下拉过程中顶部内容   | _{ distance: number }_ |
| loosing | 释放过程中顶部内容   | _{ distance: number }_ |
| loading | 加载过程中顶部内容   | _{ distance: number }_ |
| success | 刷新成功提示内容     | _{ distance: number }_ |

### 类型定义

组件导出以下类型定义：

```ts
import type { PullRefreshProps } from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称                                  | 默认值    | 描述 |
| ------------------------------------- | --------- | ---- |
| --van-pull-refresh-head-height        | _88px_    | -    |
| --van-pull-refresh-head-font-size     | _16px_    | -    |
| --van-pull-refresh-head-font-weight   | _400_     | -    |
| --van-pull-refresh-head-text-color    | _#999_    | -    |
| --van-pull-refresh-icon-color         | _#d8d8d8_ | -    |
| --van-pull-refresh-loading-icon-size  | _16px_    | -    |
| --van-pull-refresh-success-background | _#e9f9f1_ | -    |
| --van-pull-refresh-success-text-color | _#2bcd79_ | -    |
| --van-pull-refresh-success-icon-color | _#0c0_    | -    |

## 常见问题

### PullRefresh 的内容未填满屏幕时，只有一部分区域可以下拉？

默认情况下，下拉区域的高度是和内容高度保持一致的，如果需要让下拉区域始终为全屏，可以给 PullRefresh 设置一个与屏幕大小相等的最小高度：

```html
<van-pull-refresh style="min-height: 100vh;" />
```

### PullRefresh 的触发条件是？

PullRefresh 的触发条件是「父级滚动元素的滚动条在顶部位置」。

- 如果最近一个可滚动的父级元素是 `window`，则要求 `window.pageYOffset === 0`。
- 如果最近一个可滚动的父级元素是 `Element`，则要求 `Element.scrollTop === 0`。

### 在桌面端无法操作组件？

参见[桌面端适配](#/zh-CN/advanced-usage#zhuo-mian-duan-gua-pei)。
