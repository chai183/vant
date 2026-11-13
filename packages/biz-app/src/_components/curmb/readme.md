# Curmb 路径

按传入的数据展示层级路径。最后一级是当前页，只展示、不能点。路径超出宽度时不显示滚动条，自动滚到最后一级末尾；层级变化后重新计算要不要滚、滚多远。

没有数据时不渲染。

## 两种用法

### 1. 默认：页面自己跳

点上级抛 `select`，页面决定怎么跳。组件不关心路由。

```vue
<Curmb :items="path" @select="onSelect" />
```

```ts
function onSelect(id: string) {
  // 页面自己决定跳哪，不写死某条业务路径
  openOrg(id);
}
```

### 2. router：按历史回退

开启后点上级不再抛事件，只做 `router.go(-(当前层级数差))`。  
**不拼接、不写死任何路径**，只回退浏览器历史，后面的子路径会被丢掉。

前提：每一级都是页面 `push` 进来的，面包屑和历史一一对应。

```vue
<Curmb :items="path" router />
```

页面只负责下钻时 `push`，点面包屑交给组件：

```ts
function openOrg(id: string) {
  router.push(`/roster/org/${id}`); // 下钻用，不是面包屑跳转
}
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 路径节点，从上级到当前页 | `{ id: string; name: string }[]` | - |
| separator | 中间连接符。不传时是 14px 向右箭头，左右各 4px | _string_ | 向右箭头 |
| active-color | 当前页文字颜色 | _string_ | `#333333` |
| inactive-color | 上级文字和箭头颜色 | _string_ | `#999999` |
| router | 路由模式。按历史回退到点中的那一层，不写死路径 | _boolean_ | `false` |

## Events

| 事件名 | 说明                                | 回调参数    |
| ------ | ----------------------------------- | ----------- |
| select | 点击上级层级。`router` 开启时不触发 | 该项的 `id` |
