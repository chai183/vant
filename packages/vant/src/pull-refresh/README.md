# PullRefresh

### Intro

Used to provide interactive operations for pull-down refresh.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { PullRefresh } from 'vant';

const app = createApp();
app.use(PullRefresh);
```

## Usage

### Basic Usage

The `refresh` event will be Emitted when pull refresh, you should set `v-model` to `false` to reset loading status after process refresh event.

```html
<van-pull-refresh v-model="loading" @refresh="onRefresh">
  <p>Refresh Count: {{ count }}</p>
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
        showToast('Refresh Success');
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

### Success Tip

Use `success-text` to set the success prompt after the refresh is successful

```html
<van-pull-refresh
  v-model="isLoading"
  success-text="Refresh success"
  @refresh="onRefresh"
>
  <p>Refresh Count: {{ count }}</p>
</van-pull-refresh>
```

### Error Tip

If the refresh request fails due to network issues, call the `error` method from the `refresh` event parameter. The component will show a default Toast message and emit the `error` event so that business code can receive the failed callback.

```html
<van-pull-refresh v-model="isLoading" @refresh="onRefresh" @error="onError">
  <p>Refresh Count: {{ count }}</p>
</van-pull-refresh>
```

```js
const onRefresh = async ({ error }) => {
  try {
    // Send request
    await refreshData();
    count.value++;
    isLoading.value = false;
  } catch (err) {
    // Call the error method provided by PullRefresh
    error(err);
  }
};

const onError = (error) => {
  // Report error logs here
  console.log(error);
};
```

Use `error-text` to custom the default Toast message:

```html
<van-pull-refresh
  v-model="isLoading"
  error-text="Network unavailable"
  @refresh="onRefresh"
>
  <p>Refresh Count: {{ count }}</p>
</van-pull-refresh>
```

```js
const onRefresh = async ({ error }) => {
  try {
    await refreshData();
  } catch (err) {
    error(err);
  } finally {
    // If business code does not call the error method, end loading manually
    isLoading.value = false;
  }
};
```

### Custom Tips

Use slots to custom tips. The following example sets the maximum pull distance to `100px`. The image scales up with `distance` while pulling, stays at `100%` while loading, and scales from `100%` to `0%` after refresh succeeds.

```js
const maxPullDistance = 100;

const getPullingStyle = (distance) => ({
  // The scale is capped at 100%
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
  <template #pulling="props">
    <img
      class="doge"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
      :style="getPullingStyle(props.distance)"
    />
  </template>

  <template #loosing>
    <img
      class="doge"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
    />
  </template>

  <template #loading>
    <img
      class="doge"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge-fire.jpeg"
    />
  </template>

  <template #success>
    <img
      class="doge doge-success"
      src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
    />
  </template>
  <p>Refresh Count: {{ count }}</p>
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

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model | Loading status | _boolean_ | - |
| pulling-text | Text to show when pulling | _string_ | `下拉刷新` |
| loosing-text | Text to show when loosing | _string_ | `松开刷新` |
| loading-text | Text to show when loading | _string_ | `刷新中` |
| success-text | Text to show when loading success | _string_ | - |
| error-text | Default Toast message after refresh failed | _string_ | `网络不可用，请检查网络设置` |
| pulling-icon | Icon name or image URL to show when pulling | _string_ | `down` |
| loosing-icon | Icon name or image URL to show when loosing | _string_ | `down` |
| loading-icon | Icon name or image URL to show when loading | _string_ | `replay` |
| success-icon | Icon name or image URL to show when loading success | _string_ | `passed` |
| success-duration | Success text display duration(ms) | _number \| string_ | `500` |
| animation-duration | Animation duration | _number \| string_ | `300` |
| head-height | Height of head | _number \| string_ | `88` |
| pull-distance | The distance to trigger the pull refresh | _number \| string_ | same as `head-height` |
| disabled | Whether to disable pull refresh | _boolean_ | `false` |

### Events

| Event | Description | Parameters |
| --- | --- | --- |
| refresh | Emitted after pulling refresh | _{ error: (error?: unknown) => void }_ |
| error | Emitted when calling the `error` method from `refresh` parameter | _unknown_ |
| change | Emitted when draging or status changed | _{ status: string, distance: number }_ |

### Slots

| Name    | Description                           | SlotProps              |
| ------- | ------------------------------------- | ---------------------- |
| default | Default slot                          | -                      |
| normal  | Content of head when at normal status | -                      |
| pulling | Content of head when at pulling       | _{ distance: number }_ |
| loosing | Content of head when at loosing       | _{ distance: number }_ |
| loading | Content of head when at loading       | _{ distance: number }_ |
| success | Content of head when succeed          | _{ distance: number }_ |

### Types

The component exports the following type definitions:

```ts
import type { PullRefreshProps } from 'vant';
```

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name                                  | Default Value | Description |
| ------------------------------------- | ------------- | ----------- |
| --van-pull-refresh-head-height        | _88px_        | -           |
| --van-pull-refresh-head-font-size     | _16px_        | -           |
| --van-pull-refresh-head-font-weight   | _400_         | -           |
| --van-pull-refresh-head-text-color    | _#999_        | -           |
| --van-pull-refresh-icon-color         | _#d8d8d8_     | -           |
| --van-pull-refresh-loading-icon-size  | _16px_        | -           |
| --van-pull-refresh-success-background | _#e9f9f1_     | -           |
| --van-pull-refresh-success-text-color | _#2bcd79_     | -           |
| --van-pull-refresh-success-icon-color | _#0c0_        | -           |
