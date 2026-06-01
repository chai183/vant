# AreaStepCascader 步骤条省市区 `new`

### 介绍

基于 [Cascader 级联选择](#/zh-CN/cascader) 封装的省市区选择器，使用步骤条导航（`tab-layout="steps"`），并内置省/市/区层级文案与选项列表上方标题。

未传入 `options` 时，默认使用 [@vant/area-data](https://github.com/vant-ui/vant/tree/main/packages/vant-area-data) 的中国省市区数据。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { AreaStepCascader } from 'vant';

const app = createApp();
app.use(AreaStepCascader);
```

> 使用默认省市区数据前，请先安装 `@vant/area-data`：

```bash
pnpm add @vant/area-data
```

## 代码演示

### 步骤条省市区

配合 [Popup 弹出层](#/zh-CN/popup) 与 [Field 输入框](#/zh-CN/field) 使用，无需传入 `options` 即可选择中国省市区。

```html
<van-field
  v-model="result"
  is-link
  readonly
  label="地区"
  placeholder="请选择地区"
  @click="show = true"
/>
<van-popup
  v-model:show="show"
  round
  teleport="body"
  position="bottom"
>
  <van-area-step-cascader
    v-model="value"
    @close="show = false"
    @finish="onFinish"
  />
</van-popup>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const show = ref(false);
    const value = ref('');
    const result = ref('');

    const onFinish = ({ selectedOptions }) => {
      result.value = selectedOptions.map((item) => item.text).join('/');
      show.value = false;
    };

    return { show, value, result, onFinish };
  },
};
```

## API

### AreaStepCascader Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 选中项的值 | _number \| string_ | - |
| title | 顶部标题，不传时使用内置文案 | _string_ | `请选择地区` |
| options | 级联选项；不传时使用 `@vant/area-data` 省市区数据 | _CascaderOption[]_ | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| close | 点击关闭图标时触发 | - |
| finish | 全部选项选择完成后触发 | _{ value, selectedOptions }_ |
| update:model-value | 选中项变化时触发 | _value: number \| string_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| title-extra | 自定义标题下方的内容 |

### 类型定义

```ts
import type {
  AreaStepCascaderProps,
  CascaderOption,
} from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-area-step-cascader-level-font-size | _var(--van-font-size-md)_ | 选项列表上方层级标题字号 |
| --van-area-step-cascader-level-font-weight | _var(--van-font-bold)_ | 选项列表上方层级标题字重 |
| --van-area-step-cascader-level-padding | _16px 0 10px 12px_ | 选项列表上方层级标题内边距 |
