# BottomActionBar 底部操作栏

### 介绍

固定在底部的通用操作栏，样式接近订单提交栏：顶部可放协议/提示，中间可放筛选等内容，底部 **64px** 按钮区支持多种 `van-button` 组合（单主按钮、主次双按钮、三个按钮、「更多操作」+ 按钮等）。按钮宽度默认自适应均分，可通过 `*-button-width` 传入固定宽度。

### 引入

```js
import { createApp } from 'vue';
import { BottomActionBar } from 'vant';

const app = createApp();
app.use(BottomActionBar);
```

## 代码演示

### 单个主按钮

仅展示一个圆角主按钮，默认占满按钮区域宽度。

```html
<van-bottom-action-bar primary-button-text="确定" @click-primary="onConfirm" />
```

### 主次双按钮

常用于筛选面板：左侧 `plain` 重置，右侧实心确定。

```html
<van-bottom-action-bar
  secondary-button-text="重置"
  primary-button-text="确定"
  @click-secondary="onReset"
  @click-primary="onConfirm"
/>
```

### 三个按钮

```html
<van-bottom-action-bar
  secondary-button-text="次要操作"
  tertiary-button-text="次要操作2"
  show-tertiary-button
  primary-button-text="确定"
  @click-secondary="onSecondary"
  @click-tertiary="onTertiary"
  @click-primary="onConfirm"
/>
```

### 更多操作 + 按钮

左侧「更多操作」使用内置 `Popover` 气泡菜单（与 `Popover` 浅色主题文档示例一致：`placement="bottom-start"`、`actions` 垂直列表）。底部固定栏若易被遮挡，可将 `more-popover-placement` 设为 `top-start`。未展开时箭头向下，展开后箭头向上。使用 `more-actions` 配置菜单项，或使用 `#more-panel` 自定义气泡内容。

```html
<van-bottom-action-bar
  v-model:more-expanded="moreExpanded"
  show-more
  more-text="更多操作"
  :more-actions="[
    { text: '选项一', value: 'action1' },
    { text: '选项二', value: 'action2' },
    { text: '选项三', value: 'action3' },
  ]"
  secondary-button-text="次要操作"
  primary-button-text="确定"
  @select-more="onMoreAction"
```

```js
const onMoreAction = (action) => {
  console.log(action.text); // 展示文案
  console.log(action.value); // 业务值 action1 | action2 | action3
};
```

### 更多操作自定义插槽

通过 `#more` 插槽可完全自定义左侧区域，例如放置全选复选框；配合 `#top` 插槽展示已选数量。

```html
<van-bottom-action-bar
  secondary-button-text="次要操作"
  primary-button-text="确定"
>
  <template #top>
    <div class="demo-bottom-action-bar__selected-count">
      已选<strong>9,999</strong>笔<span
        class="demo-bottom-action-bar__selected-amount"
        >总金额<strong>10,000,000,000,000,000</strong>元</span
      >
    </div>
  </template>
  <template #more>
    <van-checkbox-group v-model="selectAllItems" shape="square">
      <van-checkbox name="a">全选</van-checkbox>
    </van-checkbox-group>
  </template>
</van-bottom-action-bar>
```

```css
.demo-bottom-action-bar__selected-count {
  padding: 12px;
  font-size: var(--van-font-size-md);
  color: var(--van-text-color-auxiliary);
  border-bottom: 1px solid var(--van-border-color);
}

.demo-bottom-action-bar__selected-count strong {
  margin: 0 4px;
  font-size: var(--van-font-size-lg);
  font-weight: 400;
  line-height: var(--van-font-size-lg);
  color: var(--van-black);
}

.demo-bottom-action-bar__selected-amount {
  margin-left: var(--van-padding-md);
}
```

```js
import { ref } from 'vue';

const selectAllItems = ref([]);
```

### 收藏与分享

通过 `#more` 插槽放置收藏、分享等图标操作。收藏后图标切换为实心 `star`，颜色使用主题主色 `--van-primary-color`。可通过 `start-gap` 调整左侧区域与按钮区间距。

```html
<van-bottom-action-bar
  :start-gap="32"
  secondary-button-text="次要操作"
  primary-button-text="确定"
>
  <template #more>
    <div class="demo-bottom-action-bar__icons">
      <button
        type="button"
        class="demo-bottom-action-bar__icon-item"
        :class="{ 'demo-bottom-action-bar__icon-item--active': collected }"
        @click="onToggleCollect"
      >
        <van-icon :name="collected ? 'star' : 'star-o'" />
        <span>收藏</span>
      </button>
      <button
        type="button"
        class="demo-bottom-action-bar__icon-item"
        @click="onShare"
      >
        <van-icon name="share-o" />
        <span>分享</span>
      </button>
    </div>
  </template>
</van-bottom-action-bar>
```

```js
import { ref } from 'vue';

const collected = ref(false);

const onToggleCollect = () => {
  collected.value = !collected.value;
};

const onShare = () => {
  // share logic
};
```

```css
.demo-bottom-action-bar__icon-item--active {
  color: var(--van-primary-color);
}

.demo-bottom-action-bar__icon-item--active .van-icon {
  color: var(--van-primary-color);
}
```

### 顶部协议区 + 操作

顶部 `#top` 插槽默认白底、`12px` 内边距，可放协议勾选、说明文案等。多条协议可使用 `CheckboxGroup` 多选，配合 [Highlight](#/zh-CN/highlight) 高亮协议链接文案。

```html
<van-bottom-action-bar primary-button-text="操作" @click-primary="onAction">
  <template #top>
    <van-checkbox-group v-model="agreed" shape="square">
      <van-checkbox name="clause1">
        <van-highlight
          tag="span"
          source-string="本人已仔细阅读并同意以上所有条款"
          keywords="以上所有条款"
        />
      </van-checkbox>
      <van-checkbox name="clause2">
        <van-highlight
          tag="span"
          source-string="并同意《宁波银行APP隐私协议》"
          keywords="《宁波银行APP隐私协议》"
        />
      </van-checkbox>
    </van-checkbox-group>
  </template>
</van-bottom-action-bar>
```

### 内容区 + 底部按钮

顶部 `#top` 插槽可放筛选表单等内容，搭配 [ProForm](#/zh-CN/pro-form) 通过 `columns` 配置字段；底部按钮区触发 `formRef.submit()` 提交，隐藏 ProForm 自带提交按钮。

```html
<van-bottom-action-bar
  secondary-button-text="重置"
  primary-button-text="确定"
  @click-secondary="onReset"
  @click-primary="formRef?.submit()"
>
  <template #top>
    <van-pro-form
      v-model="model"
      ref="formRef"
      :columns="columns"
      :show-submit="false"
      @submit="onSubmit"
      @failed="onFailed"
    />
  </template>
</van-bottom-action-bar>
```

```js
import { ref } from 'vue';

const model = ref({});
const formRef = ref();

const columns = [
  {
    name: 'tag',
    label: '标签列表-常规',
    component: 'radioGroup',
    defaultValue: '0',
    fieldProps: { labelAlign: 'top' },
    componentProps: {
      shape: 'block',
      columns: 3,
      options: [
        { label: '选项 1', value: '0' },
        { label: '未选', value: '1' },
      ],
    },
  },
  {
    name: 'dateRange',
    label: '选择日期',
    component: 'rangeInput',
    defaultValue: ['', ''],
    componentProps: {
      layout: 'horizontal',
      showDateShortcuts: true,
      start: {
        component: 'datePicker',
        fieldProps: { inputBorder: true, placeholder: '起始日期' },
      },
      end: {
        component: 'datePicker',
        fieldProps: { inputBorder: true, placeholder: '终止日期' },
      },
    },
  },
];
```

### 完全自定义按钮区

使用 `#actions` 插槽覆盖预设按钮组合。

```html
<van-bottom-action-bar>
  <template #actions>
    <van-button round plain type="primary">重置</van-button>
    <van-button round type="primary">确定</van-button>
  </template>
</van-bottom-action-bar>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| secondary-button-text | 次要按钮文案 | _string_ | - |
| tertiary-button-text | 第二个次要按钮文案 | _string_ | - |
| primary-button-text | 主按钮文案 | _string_ | `确定` |
| secondary-button-type | 次要按钮类型 | _string_ | `primary` |
| tertiary-button-type | 第二个次要按钮类型 | _string_ | `primary` |
| primary-button-type | 主按钮类型 | _string_ | `primary` |
| show-secondary-button | 是否展示次要按钮；未传时根据 `secondary-button-text` 判断 | _boolean_ | - |
| show-tertiary-button | 是否展示第二个次要按钮 | _boolean_ | `false` |
| show-primary-button | 是否展示主按钮 | _boolean_ | `true` |
| secondary-button-width | 次要按钮宽度，传入后不再均分 | _number \| string_ | - |
| tertiary-button-width | 第二个次要按钮宽度 | _number \| string_ | - |
| primary-button-width | 主按钮宽度 | _number \| string_ | - |
| primary-block | 主按钮是否占满按钮区（单按钮场景可省略） | _boolean_ | `false` |
| start-gap `new` | 左侧区域与按钮区间距 | _number \| string_ | - |
| round | 按钮是否圆角 | _boolean_ | `true` |
| more-text | 「更多操作」文案 | _string_ | `更多操作` |
| more-icon | 气泡关闭时箭头图标 | _string_ | `arrow-down` |
| more-expanded-icon | 气泡打开时箭头图标 | _string_ | `arrow-up` |
| more-icon-position | 箭头图标相对文案的位置，可选值为 `left` `right` | _string_ | `right` |
| show-more | 是否展示「更多操作」 | _boolean_ | `false` |
| more-expandable | 是否使用气泡菜单（`false` 时为纯文字按钮，点击仅触发 `click-more`） | _boolean_ | `true` |
| more-expanded | 气泡是否展示，支持 `v-model` | _boolean_ | `false` |
| more-actions | 气泡菜单项，格式同 `Popover` 的 `actions`（支持 `text`、`value` 等） | _PopoverAction[]_ | `[]` |
| more-popover-placement | 气泡位置，同 `Popover` 的 `placement` | _string_ | `bottom-start` |
| secondary-disabled | 次要按钮是否禁用 | _boolean_ | `false` |
| tertiary-disabled | 第二个次要按钮是否禁用 | _boolean_ | `false` |
| primary-disabled | 主按钮是否禁用 | _boolean_ | `false` |
| secondary-loading | 次要按钮是否加载中 | _boolean_ | `false` |
| tertiary-loading | 第二个次要按钮是否加载中 | _boolean_ | `false` |
| primary-loading | 主按钮是否加载中 | _boolean_ | `false` |
| safe-area-inset-bottom | 是否开启底部安全区适配 | _boolean_ | `true` |
| placeholder | 是否生成等高占位 | _boolean_ | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| click-secondary | 点击次要按钮 | - |
| click-tertiary | 点击第二个次要按钮 | - |
| click-primary | 点击主按钮 | - |
| click-more | 展开气泡时触发（首次展开） | - |
| update:more-expanded | 气泡显隐变化 | _expanded: boolean_ |
| select-more | 选中气泡菜单项时触发 | _action: PopoverAction, index: number_（`action` 含 `text`、`value`） |

### Slots

| 名称             | 说明                                                     |
| ---------------- | -------------------------------------------------------- |
| top              | 顶部内容区（协议、筛选表单等，白底、12px 内边距）        |
| default          | 中间内容区（位于顶部区与按钮区之间）                     |
| before           | 按钮区左侧扩展（与 `more` 二选一，优先级低于 `more`）    |
| more             | 自定义「更多操作」区域                                   |
| more-panel       | 自定义气泡内容（与 `more-actions` 二选一，优先展示插槽） |
| actions          | 完全自定义底部按钮组合                                   |
| secondary-button | 自定义次要按钮                                           |
| tertiary-button  | 自定义第二个次要按钮                                     |
| primary-button   | 自定义主按钮                                             |

### 类型定义

```ts
import type { BottomActionBarProps } from 'vant';
```

## 主题定制

### 样式变量

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-bottom-action-bar-z-index | _100_ | - |
| --van-bottom-action-bar-background | _var(--van-white)_ | 整体背景 |
| --van-bottom-action-bar-top-padding | _12px_ | 顶部区内边距 |
| --van-bottom-action-bar-top-background | _var(--van-white)_ | 顶部区背景 |
| --van-bottom-action-bar-top-font-size | _var(--van-font-size-sm)_ | 顶部区字号 |
| --van-bottom-action-bar-top-line-height | _1.5_ | 顶部区行高 |
| --van-bottom-action-bar-top-color | _var(--van-text-color-2)_ | 顶部区文字色 |
| --van-bottom-action-bar-bar-height | _64px_ | 底部按钮区高度 |
| --van-bottom-action-bar-bar-padding | _8px 12px_ | 底部按钮区内边距 |
| --van-bottom-action-bar-start-gap | _35px_ | 左侧区域与按钮区间距 |
| --van-bottom-action-bar-action-gap | _var(--van-padding-xs)_ | 按钮间距 |
| --van-bottom-action-bar-more-color | _var(--van-text-color)_ | 「更多操作」文字色 |
| --van-bottom-action-bar-more-font-size | _var(--van-font-size-lg)_ | 「更多操作」字号 |
| --van-bottom-action-bar-more-gap | _var(--van-padding-base)_ | 「更多操作」文字与图标间距 |
| --van-bottom-action-bar-more-icon-size | _14px_ | 「更多操作」图标大小 |
