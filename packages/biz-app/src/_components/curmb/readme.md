# Curmb 路径

按传入的数据展示层级路径。最后一级是当前页，只展示、不能点。点前面的层级会抛出 `select`，由页面自己跳转。路径超出宽度时不显示滚动条，自动滚到最后一级末尾；层级变化后重新计算要不要滚、滚多远。

## 用法

```vue
<Curmb
  :items="path"
  active-color="#333333"
  inactive-color="#999999"
  @select="openOrg"
/>
```

```ts
import Curmb from '@/_components/curmb/index.vue';

const path = [
  { id: 'finance', name: '财务部' },
  { id: 'finance-1', name: '财务一部' },
];

function openOrg(id: string) {
  router.push(`/roster/org/${id}`);
}
```

没有数据时不渲染。

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 路径节点，从上级到当前页 | `{ id: string; name: string }[]` | - |
| separator | 中间连接符。不传时是 14px 向右箭头，左右各 4px | _string_ | 向右箭头 |
| active-color | 当前页文字颜色 | _string_ | `#333333` |
| inactive-color | 上级文字和箭头颜色 | _string_ | `#999999` |

## Events

| 事件名 | 说明                         | 回调参数    |
| ------ | ---------------------------- | ----------- |
| select | 点击上级层级，当前页不会触发 | 该项的 `id` |
