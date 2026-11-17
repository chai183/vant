# ProcessTimeline 流程时间轴

左侧圆点用竖线串起来，右侧是标题、日期和说明。适合异动记录、审批进度这类按时间排列的节点。白底铺满父级剩余空间，内部上下左右 12px。圆点 24px，连线 1px `--van-gray-13`。说明按换行拆成多条，一条一行。

父级用 flex 列布局时，组件会把剩余高度撑满。页面内容区自己管外边距。

## 用法

```vue
import ProcessTimeline from '@/_components/ProcessTimeline';
```

```vue
<ProcessTimeline :items="items" empty-text="暂无异动记录" />
```

```ts
const items = [
  {
    id: '1',
    title: '调动',
    extra: '2024-10-14',
    desc: '北野武为叶文洁办理了入职\n部门由体验设计部变更为科技部',
    icon: 'exchange',
  },
];
```

## Props

| 参数       | 说明               | 类型                    | 默认值       |
| ---------- | ------------------ | ----------------------- | ------------ |
| items      | 节点列表           | `ProcessTimelineItem[]` | `[]`         |
| loading    | 加载中             | `boolean`               | `false`      |
| empty-text | 无节点时的空态文案 | `string`                | `'暂无数据'` |

### ProcessTimelineItem

| 字段  | 说明                           |
| ----- | ------------------------------ |
| id    | 节点标识，不传时用下标         |
| title | 左侧标题                       |
| extra | 右侧附加信息，如日期           |
| desc  | 标题下方说明，支持换行         |
| icon  | `van-icon` 名称，默认 `user-o` |
