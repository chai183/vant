# Card 卡片

### 介绍

业务信息卡片，由**标题区**、**内容区**、**底部区**组成，支持文案列表、折叠、底部按钮、可选态与多种图文布局。

> 本组件已替换原版 Vant **商品卡片** API。除 `title`、`#title`、`#tags` 外，下方 Props / Events / Slots 均为新版能力，名称后标注 `new`。

<!-- ### 已移除的原版 API

| 类型 | 名称 |
| --- | --- |
| Props | `thumb`、`desc`、`tag`、`num`、`price`、`origin-price`、`centered`、`currency`、`thumb-link`、`lazy-load` |
| Events | `click`、`click-thumb` |
| Slots | `desc`、`num`、`price`、`origin-price`、`price-top`、`bottom`、`thumb`、`tag`、`footer` | -->

### 引入

```js
import { createApp } from 'vue';
import { Card } from 'vant';

const app = createApp();
app.use(Card);
```

## 代码演示

以下示例与组件 Demo 页实现一致。Demo 中自定义内容区的样式类（如 `demo-card-thirds`）仅为展示布局，可按业务自行替换。

### 基础用法

展示主标题、辅助标题、可跳转箭头、右上角角标与标题下标签。

```html
<van-card
  type="default"
  title="主标题文本"
  subtitle="辅助说明文字"
  is-link
  :status-tag-props="{ type: 'primary', text: '角标' }"
  :tags="[
    { text: '标签一', type: 'primary', plain: true },
    { text: '标签二', type: 'success', plain: true },
  ]"
  @click-title="onClickTitle"
/>

<van-card
  type="default"
  title="主标题文本"
  subtitle="辅助说明文字"
  is-link
  :status-tag-props="{ type: 'primary' }"
  :tags="[
    { text: '标签一', type: 'primary', plain: true },
    { text: '标签二', type: 'success', plain: true },
  ]"
  @click-title="onClickTitle"
>
  <template #status-tag>角标9999</template>
</van-card>
```

```js
const onClickTitle = () => {
  console.log('click-title');
};
```

### 标题头像

`avatar-size` 支持 `small`（20px）与 `large`（44px）。

```html
<van-card
  type="default"
  :avatar="imageURL"
  avatar-size="small"
  title="主标题文本"
  subtitle="辅助说明文字"
  :tags="[{ text: '标签', type: 'primary', plain: true }]"
/>

<van-card
  type="default"
  :avatar="imageURL"
  avatar-size="large"
  title="主标题文本"
  subtitle="辅助说明文字"
  :tags="[{ text: '标签', type: 'primary', plain: true }]"
  style="margin-top: var(--van-padding-sm)"
/>
```

### 标题右侧操作

- 第一张：`badge` + `is-link`，点击标题区触发 `click-title`
- 第二张：`#title-action` 插槽自定义右侧操作

```html
<van-card
  type="default"
  title="主标题文本"
  :badge="3"
  is-link
  @click-title="onClickTitle"
/>

<van-card
  type="default"
  title="主标题文本"
  subtitle="辅助说明文字"
  style="margin-top: var(--van-padding-sm)"
>
  <template #title-action>
    <div class="demo-card-title-action">自定义按钮</div>
  </template>
</van-card>
```

### 无标题可跳转

`show-title="false"` 且 `is-link` 时，箭头出现在内容区右侧；点击内容区空白触发 `click-title`。列表行内 `buttonText` 触发 `click-content-action`。

```html
<van-card
  type="default"
  :show-title="false"
  is-link
  content-type="text-list"
  :content-items="[
    { label: '字段名', value: '字段内容较长时可换行展示' },
    { label: '字段名', value: '6222 **** **** 1234', buttonText: '操作' },
  ]"
  @click-title="onClickTitle"
  @click-content-action="onContentAction"
/>
```

```js
const onContentAction = (payload) => {
  console.log('click-content-action', payload.index, payload.item.label);
};
```

### 文案列表

`content-type="text-list"` 渲染键值列表。支持：

- `valueRows`：右侧多行省略，设置为 `'auto'` 时换行全展示
- `buttonText`：行内预制文字按钮
- `actionSlot`：匹配 `#text-list-action-{actionSlot}` 自定义操作
- `collapsible` + `collapse-rows`：超出折叠

```html
<van-card
  type="default"
  title="主标题文本"
  subtitle="辅助说明文字"
  content-type="text-list"
  :content-items="textListItems"
  collapsible
  :collapse-rows="3"
  @click-content-action="onContentAction"
>
  <template #text-list-action-account="{ onActionClick }">
    <van-button size="mini" type="primary" plain @click="onActionClick">
      操作
    </van-button>
  </template>
  <template #text-list-action-copy="{ onActionClick }">
    <span class="demo-card-text-action" @click="onActionClick"> 复制 </span>
  </template>
</van-card>
```

```js
const textListItems = [
  {
    label: '开户行',
    value: '中国工商银行股份有限公司',
    valueRows: 2,
    actionSlot: 'copy',
  },
  { label: '账号', value: '6222 **** **** 1234', actionSlot: 'account' },
  { label: '户名', value: '张三', buttonText: '操作' },
  { label: '币种', value: '人民币' },
  { label: '备注', value: '工资卡' },
];
```

### 可选卡片

`selectable` 展示勾选框，支持 `v-model:selected`；点击卡片空白区域切换选中（点击底部按钮不会切换）。

- 第一张：勾选框在标题区
- 第二张：`show-title="false"`，勾选框在内容区

```html
<van-card
  type="default"
  selectable
  v-model:selected="titleSelected"
  is-link
  @click-title="onClickTitle"
  title="主标题文本"
  subtitle="辅助说明文字"
  content-type="text-list"
  :content-items="[
    { label: '字段名', value: '字段内容较长时可换行展示' },
    { label: '字段名', value: '字段内容较长时可换行展示' },
  ]"
  @select="onSelect"
/>

<van-card
  type="default"
  selectable
  v-model:selected="bodySelected"
  is-link
  @click-title="onClickTitle"
  :show-title="false"
  content-type="text-list"
  :content-items="[
    { label: '字段名', value: '字段内容较长时可换行展示' },
    { label: '字段名', value: '字段内容较长时可换行展示' },
  ]"
  style="margin-top: var(--van-padding-sm)"
/>
```

```js
import { ref } from 'vue';

const titleSelected = ref(false);
const bodySelected = ref(false);

const onSelect = (selected) => {
  console.log('select', selected);
};
```

### 底部按钮与注释

Demo 展示两种底部组合：

1. **text 按钮 + center 注释**：基于 [BottomActionBar 文本按钮](/bottom-action-bar#wen-ben-an-niu) 实现；单行最多 4 个，等比例均分宽度、从右往左排列；文案最多展示 4 个字；不足 4 个时均分整行；超过 4 个时展示 4 个按钮均分剩余宽度，最左侧固定 48px 展示省略号触发器，点击通过 [Popover 气泡弹出框](#/zh-CN/popover) 展示多余按钮
2. **outline 按钮 + split 注释**：基于 [BottomActionBar 自定义溢出 Popover 触发器](/bottom-action-bar#zi-ding-yi-yi-chu-popover-chu-fa-qi) 实现；底部区域高度 42px，描边按钮高度 30px、贴顶对齐；单行默认最多 3 个，可通过 `footer-outline-max` 配置；宽度随内容撑开（左右 padding 12px）、从右往左排列，按钮间距 16px、边框 1px；超出时最左侧展示「更多」，展开后切换为「收起」；点击同样通过 Popover 展示多余按钮；无顶部分割线，底部留白 12px

可通过 `footer-action-bar-props` 透传 [BottomActionBar](/bottom-action-bar#props) 的其余参数（如 `more-popover-placement`、`bar-padding` 等）；`max-visible-actions`、`safe-area-inset-bottom` 等未传时由 Card 按按钮类型补全默认值。

```html
<!-- text 按钮 + 居中注释 -->
<van-card
  type="default"
  title="主标题文本"
  content-type="text-list"
  :content-items="[
    { label: '字段名', value: '字段内容较长时可换行展示' },
    { label: '字段名', value: '字段内容较长时可换行展示' },
    { label: '字段名', value: '字段内容较长时可换行展示' },
  ]"
  show-footer-buttons
  footer-button-type="text"
  :footer-buttons="[
    { text: '按钮一', name: 'a', color: 'var(--van-primary-color)' },
    { text: '按钮二', name: 'b' },
    { text: '按钮三', name: 'c' },
    { text: '按钮四', name: 'd' },
    { text: '按钮五', name: 'e' },
  ]"
  footer-note-layout="center"
  footer-note="辅助说明文字"
  @click-button="onClickButton"
/>

<!-- outline 按钮 + 左右注释 -->
<van-card
  type="default"
  title="主标题文本"
  content-type="text-list"
  :content-items="[
    { label: '字段名', value: '字段内容较长时可换行展示' },
    { label: '字段名', value: '字段内容较长时可换行展示' },
    { label: '字段名', value: '字段内容较长时可换行展示' },
  ]"
  show-footer-buttons
  footer-button-type="outline"
  :footer-buttons="[
    { text: '立即购买', name: 'a', color: 'var(--van-success-color)' },
    { text: '查看详情', name: 'b' },
    { text: '取消订单', name: 'c' },
    { text: '确认提交', name: 'd' },
    { text: '申请退款', name: 'e', color: 'var(--van-danger-color)' },
  ]"
  footer-note-layout="split"
  footer-note-left="0阅读"
  footer-note-right="2026-6-1"
  style="margin-top: var(--van-padding-sm)"
  @click-button="onClickButton"
/>
```

```js
const onClickButton = (payload) => {
  console.log('click-button', payload.name, payload.text);
};
```

### 综合示例

组合可选、头像、可跳转、角标、标签、可折叠文案列表、底部按钮与 split 注释，并演示全部主要事件与行内操作插槽。

```html
<van-card
  type="default"
  selectable
  v-model:selected="fullSelected"
  title="主标题文本"
  subtitle="辅助说明文字"
  :avatar="imageURL"
  avatar-size="small"
  is-link
  :status-tag-props="{ type: 'primary' }"
  :tags="[
    { text: '标签一', type: 'primary', plain: true },
    { text: '标签二', type: 'success', plain: true },
  ]"
  content-type="text-list"
  :content-items="textListItems"
  collapsible
  :collapse-rows="3"
  show-footer-buttons
  footer-button-type="text"
  :footer-buttons="[
    { text: '按钮一', name: 'a', color: 'var(--van-primary-color)' },
    { text: '按钮二', name: 'b' },
    { text: '操作', name: 'c' },
  ]"
  footer-note-layout="split"
  footer-note-left="0阅读"
  footer-note-right="2026-6-1"
  @click-title="onClickTitle"
  @click-content-action="onContentAction"
  @click-button="onClickButton"
  @select="onSelect"
>
  <template #status-tag>角标</template>
  <template #text-list-action-account="{ onActionClick }">
    <van-button size="mini" type="primary" plain @click="onActionClick">
      操作
    </van-button>
  </template>
  <template #text-list-action-copy="{ onActionClick }">
    <span class="demo-card-text-action" @click="onActionClick"> 复制 </span>
  </template>
</van-card>
```

```js
import { ref } from 'vue';

const fullSelected = ref(false);
// textListItems、onClickTitle、onContentAction、onClickButton、onSelect 同上
```

### 自定义内容区

使用默认插槽 `#default` 自定义内容区，可与 `footer-note-*`、`#title-action`、`#footer-note` 组合。Demo 包含三种布局：

1. **三等分 + 左右注释**：数值三列展示，底部 `split` 注释
2. **双等分 + 左对齐注释**：两列数值，`footer-note-layout="left"` 配合 `#footer-note`
3. **左右分栏**：左侧大数值、右侧说明，无底部注释

#### 三等分 + split 注释

```html
<van-card
  type="default"
  title="主标题文本"
  subtitle="辅助说明文字"
  :tags="[
    { text: '标签一', type: 'primary', plain: true },
    { text: '标签二', type: 'success', plain: true },
  ]"
  footer-note-layout="split"
  footer-note-left="注释信息左对齐"
  footer-note-right="注释信息右对齐"
>
  <template #title-action>
    <div class="demo-card-title-action">
      自定义按钮
      <van-icon name="arrow" />
    </div>
  </template>
  <div class="demo-card-thirds">
    <div class="demo-card-thirds__item">
      <div class="demo-card-thirds__value demo-card-thirds__value--primary">
        100,000.00
      </div>
      <div class="demo-card-thirds__label">票面金额（元）</div>
    </div>
    <div class="demo-card-thirds__item">
      <div class="demo-card-thirds__value">3.25%</div>
      <div class="demo-card-thirds__label">票面金额（元）</div>
    </div>
    <div class="demo-card-thirds__item">
      <div class="demo-card-thirds__value">结构性存款</div>
      <div class="demo-card-thirds__label">产品类型</div>
    </div>
  </div>
</van-card>
```

#### 双等分 + footer-note 插槽

```html
<van-card
  type="default"
  title="主标题文本"
  :tags="[
    { text: '标签一', type: 'primary', plain: true },
    { text: '标签二', type: 'success', plain: true },
  ]"
  footer-note-layout="left"
  style="margin-top: var(--van-padding-sm)"
>
  <div class="demo-card-halves">
    <div class="demo-card-halves__item">
      <div class="demo-card-halves__value demo-card-halves__value--primary">
        100,000.00
      </div>
      <div class="demo-card-halves__label">票面金额（元）</div>
    </div>
    <div class="demo-card-halves__item">
      <div class="demo-card-halves__value">3.25%</div>
      <div class="demo-card-halves__label">票面金额（元）</div>
    </div>
  </div>
  <template #footer-note>
    <span class="demo-card-footer-note">
      <van-icon name="info-o" class="demo-card-footer-note__icon" />
      注释信息一行带 icon占位占位占位占占位占位
    </span>
  </template>
</van-card>
```

#### 左右分栏

```html
<van-card
  type="default"
  title="宁银理财｜天欣天天鎏金现金管理类理财产品3号"
  style="margin-top: var(--van-padding-sm)"
>
  <div class="demo-card-split">
    <div class="demo-card-split__item demo-card-split__item--left">
      <div class="demo-card-split__value demo-card-split__value--danger">
        100%
      </div>
      <div class="demo-card-split__label">七日年化收益</div>
    </div>
    <div class="demo-card-split__item demo-card-split__item--right">
      <div class="demo-card-split__value">随时申赎 T+1</div>
      <div class="demo-card-split__label">10元起购｜中风险</div>
    </div>
  </div>
</van-card>
```

#### 自定义内容区样式（Demo 参考）

以下为 Demo 页布局样式，可按业务调整或替换：

```less
.demo-card-native-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--van-card-image-background);

  img {
    width: 72px;
    height: 72px;
    object-fit: contain;
  }
}

.demo-card-title-action {
  display: inline-flex;
  align-items: center;
  color: var(--van-danger-color);
  font-size: var(--van-font-size-xs);
  line-height: var(--van-line-height-sm);
  cursor: pointer;
}

.demo-card-text-action {
  color: var(--van-primary-color);
  font-size: var(--van-font-size-sm);
  line-height: var(--van-line-height-md);
  cursor: pointer;
}

.demo-card-image-double {
  display: flex;
  gap: var(--van-padding-xs);
  align-items: flex-start;
}

// 插槽内容区：数值 + 底部标题（三等分 / 双等分共用）
.demo-card-thirds,
.demo-card-halves {
  display: flex;
  align-items: flex-end;

  &__value {
    font-size: var(--van-font-size-sm);
    line-height: var(--van-line-height-md);
    color: var(--van-text-color);

    &--primary {
      font-size: var(--van-font-size-lg);
      line-height: var(--van-line-height-xl);
      color: var(--van-primary-color);
    }
  }

  &__label {
    margin-top: var(--van-padding-base);
    font-size: var(--van-font-size-xs);
    line-height: var(--van-line-height-sm);
    color: var(--van-text-color-2);
  }
}

.demo-card-thirds {
  &__item {
    flex: 1;
    min-width: 0;
    text-align: center;

    &:first-child {
      text-align: left;
    }

    &:last-child {
      text-align: right;
    }
  }
}

.demo-card-halves {
  &__item {
    flex: 1;
    min-width: 0;

    &:first-child {
      text-align: left;
    }

    &:last-child {
      text-align: right;
    }
  }
}

.demo-card-footer-note {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  font-size: var(--van-font-size-xs);
  line-height: var(--van-line-height-sm);
  color: var(--van-text-color-2);

  &__icon {
    flex: none;
    margin-right: var(--van-padding-base);
    font-size: var(--van-font-size-sm);
  }
}

// 插槽内容区：左大数值 + 右说明
.demo-card-split {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  &__item {
    min-width: 0;

    &--left {
      text-align: left;

      .demo-card-split__value {
        font-size: var(--van-font-size-lg);
        line-height: var(--van-line-height-xl);
      }
    }

    &--right {
      text-align: right;

      .demo-card-split__value {
        font-size: var(--van-font-size-md);
        line-height: var(--van-line-height-lg);
      }
    }
  }

  &__value {
    font-size: var(--van-font-size-sm);
    line-height: var(--van-line-height-md);
    color: var(--van-text-color);

    &--danger {
      color: var(--van-danger-color);
    }
  }

  &__label {
    margin-top: var(--van-padding-base);
    font-size: var(--van-font-size-xs);
    line-height: var(--van-line-height-sm);
    color: var(--van-text-color-2);
  }
}
```

### 大图文

`type="image-large"`，图片在上方，标题在下方；固定造型图片可通过 `#image` 插槽自定义展示,也可设置`image-fit`属性设置图文卡图片填充模式。

```html
<van-card
  type="image-large"
  :title="t('title')"
  :subtitle="t('subtitle')"
  :image="imageURL"
  image-fit="contain"
>
</van-card>
```

### 双列图文

`type="image-double"` 需放在 flex 容器内并排展示，每张卡片 `flex: 1` 均分宽度（Demo 使用 `.demo-card-image-double`）。

```html
<div class="demo-card-image-double">
  <van-card
    type="image-double"
    :image="imageURL"
    title="主标题文本"
    footer-note-layout="split"
    footer-note-left="0阅读"
    footer-note-right="2026-6-1"
  />
  <van-card
    type="image-double"
    :image="imageURL"
    title="主标题文本"
    footer-note-layout="split"
    footer-note-left="0阅读"
    footer-note-right="2026-6-1"
  />
</div>
```

```css
.demo-card-image-double {
  display: flex;
  gap: var(--van-padding-xs);
  align-items: flex-start;
}
```

### 左文右图

`type="image-right"`，图片在右、标题在左，可通过 `image-title-rows` 控制标题行数；设置为 `'auto'` 时换行全展示。

```html
<van-card
  type="image-right"
  :image="imageURL"
  title="主标题文本"
  :image-title-rows="2"
  footer-note-layout="split"
  footer-note-left="0阅读"
  footer-note-right="2026-6-1"
/>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type `new` | 卡片类型 `default` / `image-large` / `image-double` / `image-right` | _string_ | `default` |
| show-title `new` | 是否展示标题区 | _boolean_ | `true` |
| title | 主标题（原版保留） | _string_ | - |
| subtitle `new` | 辅助标题，替代原版 `desc` | _string_ | - |
| title-rows `new` | 主标题最大行数，设置为 `'auto'` 时换行全展示 | _number \| 'auto'_ | `2` |
| subtitle-rows `new` | 辅助标题最大行数，设置为 `'auto'` 时换行全展示 | _number \| 'auto'_ | `1` |
| avatar `new` | 标题区头像 URL | _string_ | - |
| avatar-size `new` | 头像尺寸 `small`(20px) / `large`(44px) | _string_ | `small` |
| status-tag-props `new` | 右上角角标，透传 Tag，文案用 `#status-tag` | _object_ | - |
| is-link `new` | 可点击并展示右箭头 | _boolean_ | `false` |
| badge `new` | 标题右侧数字徽标 | _number \| string_ | - |
| badge-max `new` | 徽标最大值 | _number \| string_ | - |
| badge-dot `new` | 徽标小红点 | _boolean_ | `false` |
| tags `new` | 标题下标签列表（原版仅 `#tags` 插槽） | _CardTagOption[]_ | - |
| selectable `new` | 是否展示勾选框，整卡点击可切换选中 | _boolean_ | `false` |
| selected `new` | selectable下，是否选中，支持 `v-model:selected` | _boolean_ | `false` |
| select-disabled `new` | selectable下： 是否禁用勾选 | _boolean_ | `false` |
| content-type `new` | 内容类型，如 `text-list` | _string_ | - |
| content-items `new` | content-type=’text-list‘下： 文案列表数据 | _CardTextListItem[]_ | - |
| collapsible `new` | content-type=’text-list‘下： 文案列表是否可折叠 | _boolean_ | `false` |
| collapse-rows `new` | content-type=’text-list‘下： 折叠后展示行数 | _number_ | `3` |
| expand-text `new` | content-type=’text-list‘下： 展开文案 | _string_ | `展开` |
| collapse-text `new` | content-type=’text-list‘下：收起文案 | _string_ | `收起` |
| show-footer-buttons `new` | 是否展示底部按钮区 | _boolean_ | `false` |
| footer-button-type `new` | 按钮风格 `text` / `outline` | _string_ | `text` |
| footer-buttons `new` | 底部按钮，见下方类型 | _CardFooterButton[]_ | - |
| footer-outline-max `new` | outline 按钮单行最多展示数量，超出后出现「更多」 | _number_ | `3` |
| footer-outline-more-text `new` | outline 溢出「更多」文案 | _string_ | `更多` |
| footer-outline-collapse-text `new` | outline 溢出 Popover 展开后的「收起」文案 | _string_ | `收起` |
| footer-action-bar-props `new` | 透传 [BottomActionBar](/bottom-action-bar#props) 参数（`max-visible-actions` 等未传时由 Card 按按钮类型补全） | _object_ | - |
| footer-note-layout `new` | 注释布局 `center` / `split` / `left` | _string_ | - |
| footer-note `new` | 居中注释（`center`） | _string_ | - |
| footer-note-left `new` | 左注释（`split`） | _string_ | - |
| footer-note-right `new` | 右注释（`split`） | _string_ | - |
| image `new` | 图文卡图片地址 | _string_ | - |
| image-fit `new` | 图文卡图片填充模式，等同于原生 [object-fit](https://developer.mozilla.org/zh-CN/docs/Web/CSS/object-fit) 属性 | _string_ | `cover` |
| image-ratio `new` | 大图高度比（相对宽度） | _number_ | `0.5` |
| image-title-rows `new` | 左文右图标题行数，设置为 `'auto'` 时换行全展示 | _number \| 'auto'_ | `2` |

#### CardFooterButton `new`

| 键名 | 说明 | 类型 |
| --- | --- | --- |
| text | 按钮文案 | _string_ |
| name | `click-button` 回调标识 | _string \| number_ |
| color | 自定义颜色；`text` 仅文字，`outline` 文字+边框 | _string_ |
| disabled `new` | 是否禁用 | _boolean_ |

#### CardTextListItem `new`

| 键名       | 说明                                       | 类型               |
| ---------- | ------------------------------------------ | ------------------ |
| label      | 左侧标题                                   | _string_           |
| value      | 右侧内容                                   | _string_           |
| valueRows  | 右侧省略行数，设置为 `'auto'` 时换行全展示 | _number \| 'auto'_ |
| buttonText | 行内预制文字按钮                           | _string_           |
| rowSlot    | 整行插槽 `#text-list-row-{rowSlot}`        | _string_           |
| labelSlot  | 左侧插槽 `#text-list-label-{labelSlot}`    | _string_           |
| valueSlot  | 右侧插槽 `#text-list-value-{valueSlot}`    | _string_           |
| actionSlot | 操作插槽 `#text-list-action-{actionSlot}`  | _string_           |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| click-title `new` | 点击可跳转区域；替代原版 `click` | _event: MouseEvent_ |
| click-button `new` | 点击底部按钮 | `{ name, text, event }` |
| click-content-action `new` | 点击列表行操作 | `{ index, item, event? }` |
| update:selected `new` | 勾选状态变化 | _selected: boolean_ |
| select `new` | 勾选状态变化 | _selected: boolean_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| default `new` | 自定义内容区 |
| title | 自定义标题（原版保留） |
| subtitle `new` | 自定义辅助标题 |
| tags | 自定义标签（原版保留，位置与用法有调整） |
| avatar `new` | 自定义头像 |
| title-action `new` | 标题右侧操作 |
| status-tag `new` | 右上角角标文案，替代原版图片 `tag` |
| text-list-row `new` | 自定义整行，命名 `#text-list-row-{index\|rowSlot}` |
| text-list-label `new` | 自定义左侧标题，命名 `#text-list-label-{index\|labelSlot}` |
| text-list-value `new` | 自定义右侧内容，命名 `#text-list-value-{index\|valueSlot}` |
| text-list-action `new` | 自定义行内操作，命名 `#text-list-action-{index\|actionSlot}` |
| content-action `new` | 同 `text-list-action`（兼容别名） |
| buttons `new` | 自定义底部按钮，优先于 `footer-buttons` |
| footer-note `new` | 自定义底部注释 |
| image `new` | 自定义图片，替代原版 `#thumb` |

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](#/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-card-radius | _var(--van-radius-lg)_ | 卡片圆角 |
| --van-card-background | _var(--van-background-2)_ | 卡片背景色 |
| --van-card-title-color | _var(--van-text-color)_ | 主标题及主要文字颜色 |
| --van-card-title-font-size | _var(--van-font-size-md)_ | 主标题字号 |
| --van-card-title-line-height | _var(--van-line-height-xl)_ | 主标题行高 |
| --van-card-subtitle-color | _var(--van-text-color-auxiliary)_ | 标题区辅助文案颜色 |
| --van-card-subtitle-font-size | _var(--van-font-size-xs)_ | 辅助标题字号 |
| --van-card-divider-color | _var(--van-border-color)_ | 分割线颜色 |
| --van-card-footer-height | _40px_ | 底部区域最小高度 |
| --van-card-footer-line-height | _var(--van-line-height-md)_ | 底部按钮行高 |
| --van-card-footer-button-font-size | _14px_ | 底部按钮字号 |
| --van-card-footer-button-disabled-color | _var(--van-gray-11)_ | 底部按钮禁用颜色 |
| --van-card-footer-note-font-size | _var(--van-font-size-xs)_ | 底部注释字号 |
| --van-card-footer-note-line-height | _1_ | 底部注释行高 |
| --van-card-footer-note-color | _var(--van-text-color-secondary)_ | 底部注释文字颜色 |
| --van-card-footer-padding-y | _calc((var(--van-card-footer-height) - var(--van-card-footer-line-height)) / 2)_ | 底部按钮上下内边距 |
| --van-card-footer-note-padding-y | _calc((var(--van-card-footer-height) - var(--van-card-footer-note-font-size)) / 2)_ | 底部注释上下内边距 |
| --van-card-text-list-label-color | _var(--van-text-color-secondary)_ | 文案列表左侧标题颜色 |
| --van-card-text-list-value-color | _var(--van-text-color)_ | 文案列表右侧内容颜色 |
| --van-card-text-list-font-size | _var(--van-font-size-sm)_ | 文案列表字号 |
| --van-card-text-list-line-height | _var(--van-line-height-md)_ | 文案列表行高 |
| --van-card-text-list-label-width | _7em_ | 文案列表左侧标题宽度 |
| --van-card-text-list-row-padding-y | _6px_ | 文案列表行上下内边距 |
| --van-card-image-background | _#D8D8D8_ | 图文卡图片区域占位背景色 |
| --van-card-image-right-thumb-width | _94px_ | 左文右图缩略图宽度 |
| --van-card-image-right-thumb-height | _52px_ | 左文右图缩略图高度 |
| --van-card-image-right-thumb-radius | _var(--van-radius-md)_ | 左文右图缩略图圆角 |
| --van-card-title-extra-width | _80px_ | 标题右侧扩展区宽度 |
| --van-card-title-badge-offset | _20px_ | 标题徽标右侧偏移 |
| --van-card-title-link-font-size | _var(--van-font-size-md)_ | 标题/内容箭头字号 |
| --van-card-title-link-width | _16px_ | 标题/内容箭头图标宽度 |
| --van-card-title-link-hit-width | _20px_ | 标题/内容箭头点击区域宽度 |
| --van-card-title-link-color | _var(--van-text-color-auxiliary)_ | 标题/内容箭头颜色 |
| --van-card-badge-color | _var(--van-white)_ | 标题徽标文字颜色 |
| --van-card-badge-background | _var(--van-danger-color)_ | 标题徽标背景色 |
| --van-card-badge-size | _14px_ | 标题徽标尺寸 |
| --van-card-badge-font-size | _10px_ | 标题徽标字号 |
| --van-card-badge-dot-size | _8px_ | 标题徽标小红点尺寸 |
| --van-card-select-gap | _8px_ | 勾选框与内容间距 |
| --van-card-select-title-offset | _calc((var(--van-card-title-line-height) - var(--van-checkbox-size)) / 2)_ | 标题区勾选框顶部偏移 |
| --van-card-avatar-small-size | _20px_ | 小头像尺寸 |
| --van-card-avatar-large-size | _44px_ | 大头像尺寸 |
| --van-card-avatar-radius | _var(--van-radius-max)_ | 头像圆角 |
| --van-card-avatar-small-offset | _calc((var(--van-card-title-line-height) - var(--van-card-avatar-small-size)) / 2)_ | 小头像顶部偏移 |
| --van-card-collapse-icon-font-size | _var(--van-font-size-xs)_ | 折叠箭头字号 |
| --van-card-button-divider-color | _var(--van-gray-9)_ | 底部文字按钮分割线颜色 |
| --van-card-footer-overflow-width | _48px_ | text 溢出触发区宽度 |
| --van-card-footer-overflow-dot-size | _3px_ | text 溢出大黑点尺寸 |
| --van-card-footer-overflow-dot-gap | _4px_ | text 溢出大黑点间距 |
| --van-card-footer-overflow-dot-color | _var(--van-text-color)_ | text 溢出大黑点颜色 |
| --van-card-outline-button-background | _var(--van-background-2)_ | 底部描边按钮背景色 |
| --van-card-outline-button-border-color | _var(--van-gray-9)_ | 底部描边按钮边框色 |
| --van-card-outline-button-radius | _var(--van-radius-max)_ | 底部描边按钮圆角 |
| --van-card-outline-button-height | _30px_ | 底部描边按钮高度 |
| --van-card-footer-outline-height | _42px_ | outline 底部按钮区高度 |
| --van-card-footer-more-font-size | _var(--van-card-footer-button-font-size)_ | outline 溢出「更多」字号 |
| --van-card-footer-more-color | _var(--van-card-title-color)_ | outline 溢出「更多」文字色 |
| --van-card-footer-more-width | _28px_ | outline「更多/收起」占位宽度 |
| --van-card-footer-outline-gap | _16px_ | outline 底部按钮间距 |
