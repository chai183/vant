# OrderSelectBar订单选择栏

### 介绍

这是一个订单选择栏

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { OrderSelectBar } from 'vant';

const app = createApp();
app.use(OrderSelectBar);
```

## 代码演示

### 基础用法

该组件提供了全选、收藏、分享、上边插槽、左边插槽、右边插槽等功能

```html
<van-order-select-bar
  v-model="checked"
  :show-collect="false"
  :show-share="false"
  :select-all-text="全选"
  :secondary-button-text="拒绝"
  :primary-button-text="通过"
  @click-secondary="拒绝"
  @click-primary="通过"
/>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    return {};
  },
};
```

### 顶部提示插槽

使用#top作为顶部插槽

```html
<van-order-select-bar
  v-model="checked"
  :select-all-text="全选"
  :secondary-button-text="拒绝"
  :primary-button-text="通过"
  :show-collect="false"
  :show-share="false"
  @click-secondary="拒绝"
  @click-primary="通过"
>
  <template #top>
    <span>满99包邮，还剩12元</span>
  </template>
</van-order-select-bar>
```

### 三个按钮

多个按钮可以使用右边插槽

```html
<van-order-select-bar
  v-model="checked"
  :select-all-text="全选"
  show-tertiary-button
  :show-collect="false"
  :show-share="false"
>
  <template #secondary-button>
    <van-button size="large" plain type="primary" width="82px" @click="打回">
      打回
    </van-button>
  </template>
  <template #tertiary-button>
    <van-button size="large" type="primary" plain width="82px" @click="否决">
      否决
    </van-button>
  </template>
  <template #primary-button>
    <van-button size="large" type="primary" plain width="82px" @click="同意">
      同意
    </van-button>
  </template>
</van-order-select-bar>
```

### 自定义按钮

提供了#secondary-button、\#tertiary-button、#primary-button

```html
<van-order-select-bar
  v-model="checked"
  :select-all-text="全选"
  :show-collect="false"
  :show-share="false"
>
  <template #top>
    <span>满99包邮，还剩12元</span>
  </template>
  <template #secondary-button>
    <van-button size="large" plain type="primary" width="82px" @click="打回">
      打回
    </van-button>
  </template>
  <template #tertiary-button>
    <van-button size="large" type="primary" plain width="82px" @click="否决">
      否决
    </van-button>
  </template>
  <template #primary-button>
    <van-button size="large" type="primary" plain width="82px" @click="同意">
      同意
    </van-button>
  </template>
</van-order-select-bar>
```

### 收藏+分享+按钮

使用#left

```html
<van-order-select-bar
  v-model="checked"
  :isAllCheck="false"
  :collect-active="collected"
  :secondary-button-text="t('reject')"
  :primary-button-text="t('pass')"
  @click-collect="collected = !collected"
  @click-share="showToast(t('toastShare'))"
  @click-secondary="showToast(t('reject'))"
  @click-primary="showToast(t('pass'))"
>
</van-order-select-bar>
```

### 左侧插槽

使用#left

```html
<van-order-select-bar
  v-model="checked"
  :isAllCheck="false"
  :show-collect="false"
  :show-share="false"
  :collect-active="collected"
  :secondary-button-text="t('reject')"
  :primary-button-text="t('pass')"
  @click-collect="collected = !collected"
  @click-share="showToast(t('toastShare'))"
  @click-secondary="showToast(t('reject'))"
  @click-primary="showToast(t('pass'))"
>
  <template #left> 左侧插槽 </template>
</van-order-select-bar>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 全选勾选状态 | boolean | `false` |
| select-all-text | 复选框旁边的文字标签 | string | `全选` |
| secondary-button-text | 左侧次要按钮文字 | string | `次要操作` |
| tertiary-button-text | 中间按钮文字 (需配合 `show-tertiary-button`) | string | - |
| primary-button-text | 右侧主要按钮文字 | string | `通过` |
| secondary-button-type | 次要按钮类型，选项参考 Button | string | `primary` |
| tertiary-button-type | 中间按钮类型 | string | `primary` |
| primary-button-type | 主要按钮类型 | string | `primary` |
| show-secondary-button | 是否显示左侧按钮 | boolean | `true` |
| show-tertiary-button | 是否显示中间按钮 (当为 true 且设置了 `tertiary-button-text` 时渲染) | boolean | `false` |
| checkbox-disabled | 是否禁用复选框 | boolean | `false` |
| indeterminate | 复选框不确定状态 (半选), 参考 Checkbox | boolean | `false` |
| secondary-disabled | 是否禁用左侧按钮 | boolean | `false` |
| tertiary-disabled | 是否禁用中间按钮 | boolean | `false` |
| primary-disabled | 是否禁用右侧按钮 | boolean | `false` |
| secondary-loading | 左侧按钮是否处于加载中状态 | boolean | `false` |
| tertiary-loading | 中间按钮是否处于加载中状态 | boolean | `false` |

### Events

| 事件名          | 说明                           | 回调参数      |
| --------------- | ------------------------------ | ------------- |
| click-collect   | 点击收藏触发                   | _key: string_ |
| click-share     | 点击分享触发                   | -             |
| click-secondary | 点击关闭按钮时触发             | -             |
| click-primary   | 点击关闭按钮或非键盘区域时触发 | -             |

### Slots

| 名称              | 说明         |
| ----------------- | ------------ |
| #top              | 顶部插槽     |
| #left             | 左边插槽     |
| #secondary-button | 右边按钮插槽 |
| #tertiary-button  | 右边按钮插槽 |
| #primary-button   | 右边按钮插槽 |

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称                                    | 默认值                     | 描述 |
| --------------------------------------- | -------------------------- | ---- |
| --van-number-keyboard-background        | _var(--van-gray-2)_        | -    |
| --van-number-keyboard-key-height        | _48px_                     | -    |
| --van-number-keyboard-key-font-size     | _28px_                     | -    |
| --van-number-keyboard-key-active-color  | _var(--van-gray-3)_        | -    |
| --van-number-keyboard-key-background    | _var(--van-white)_         | -    |
| --van-number-keyboard-delete-font-size  | _var(--van-font-size-lg)_  | -    |
| --van-number-keyboard-title-color       | _var(--van-gray-7)_        | -    |
| --van-number-keyboard-title-height      | _34px_                     | -    |
| --van-number-keyboard-title-font-size   | _var(--van-font-size-lg)_  | -    |
| --van-number-keyboard-close-padding     | _0 var(--van-padding-md)_  | -    |
| --van-number-keyboard-close-color       | _var(--van-primary-color)_ | -    |
| --van-number-keyboard-close-font-size   | _var(--van-font-size-md)_  | -    |
| --van-number-keyboard-button-text-color | _var(--van-white)_         | -    |
| --van-number-keyboard-button-background | _var(--van-primary-color)_ | -    |
| --van-number-keyboard-z-index           | _100_                      | -    |

## 常见问题

### 在桌面端无法操作组件？

参见[桌面端适配](#/zh-CN/advanced-usage#zhuo-mian-duan-gua-pei)。
