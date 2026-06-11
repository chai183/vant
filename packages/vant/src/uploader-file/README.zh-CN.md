# UploaderFile 附件上传 `new`

### 介绍

在 [Uploader](/zh-CN/uploader) 基础上封装的业务上传组件，适用于文档、表格等附件场景。以列表形式展示已选文件，组件内部自动处理「等待上传 / 上传中 / 成功 / 失败」状态；业务侧只需绑定 `v-model` 并实现 `upload` 返回的 Promise 即可完成上传。

### 引入

通过以下方式来全局注册组件，更多注册方式请参考[组件注册](#/zh-CN/advanced-usage#zu-jian-zhu-ce)。

```js
import { createApp } from 'vue';
import { UploaderFile } from 'vant';

const app = createApp();
app.use(UploaderFile);
```

## 代码演示

### 基础用法

绑定 `v-model` 与 `upload` 即可。选择文件后组件会自动依次：等待上传 → 上传中 → 成功/失败。

```html
<van-field label="附件上传" label-align="top">
  <template #label-comment>
    <div>所上传格式支持 DOC/PPT/XLS/VSD/POT 等</div>
    <div>所上传文件大小控制在 20M 以内，支持批量上传</div>
  </template>
  <template #input>
    <van-uploader-file
      v-model="fileList"
      :upload="upload"
      accept="*"
      :max-size="20 * 1024 * 1024"
      multiple
    />
  </template>
</van-field>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const fileList = ref([]);

    const upload = (item) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', item.file);

        fetch('/upload', { method: 'POST', body: formData })
          .then((res) => res.json())
          .then((data) => resolve({ url: data.url }))
          .catch(reject);
      });

    return { fileList, upload };
  },
};
```

### 上传失败

`upload` 返回的 Promise 被 `reject` 时，列表项会展示失败状态；若 `reject` 的是 `Error`，会展示其 `message`，否则展示默认「上传失败」。

```js
const upload = (item) =>
  new Promise((resolve, reject) => {
    if (item.file.size > 10 * 1024 * 1024) {
      reject(new Error('文件不能超过 10MB'));
      return;
    }
    // ...
  });
```

### 上传状态

通过 `readonly` 可展示只读列表；列表项的 `status` 为空表示等待上传，`uploading` 表示上传中，`done` 表示上传成功，`failed` 表示上传失败。

```html
<van-field label="上传状态" label-align="top">
  <template #input>
    <van-uploader-file v-model="fileList" readonly />
  </template>
</van-field>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const fileList = ref([
      {
        file: { name: '项目方案.docx' },
        status: '',
        message: '等待上传',
      },
      {
        file: { name: '财务报表.xlsx' },
        status: 'uploading',
        message: '上传中',
      },
      {
        file: new File([new Uint8Array(1536 * 1024)], '会议纪要.doc'),
        status: 'done',
        url: 'https://example.com/meeting.doc',
      },
      {
        file: { name: '合同扫描件.pdf' },
        status: 'failed',
        message: '上传失败',
      },
    ]);

    return { fileList };
  },
};
```

### 自定义上传区域

通过默认插槽自定义「添加附件」按钮样式。

```html
<van-field label="自定义上传区域" label-align="top">
  <template #input>
    <van-uploader-file v-model="fileList" :upload="upload" accept="*">
      <van-button icon="plus" type="primary" plain block>添加附件</van-button>
    </van-uploader-file>
  </template>
</van-field>
```

### 禁用状态

设置 `disabled` 属性后，不可选择新文件，列表项也不可操作。

```html
<van-field label="禁用文件上传" label-align="top">
  <template #input>
    <van-uploader-file v-model="fileList" :upload="upload" disabled />
  </template>
</van-field>
```

### 是否开启多选

通过 `multiple` 属性控制是否支持多选，默认为 `true`。设置为 `false` 时每次只能选择一个文件。

```html
<van-field label="是否开启多选" label-align="top">
  <template #input>
    <van-uploader-file
      v-model="fileList"
      :upload="upload"
      accept="*"
      :multiple="false"
    />
  </template>
</van-field>
```

### 允许上传的文件类型

通过 `accept` 属性限制可选择的文件类型，用法与原生 `input[type=file]` 的 `accept` 一致。

```html
<van-field
  label="允许上传的文件类型"
  label-comment="仅支持 PDF、DOC、DOCX 格式"
  label-align="top"
>
  <template #input>
    <van-uploader-file
      v-model="fileList"
      :upload="upload"
      accept=".pdf,.doc,.docx"
      multiple
    />
  </template>
</van-field>
```

### 文件大小限制

通过 `max-size` 属性可以限制上传文件的大小（单位 `byte`），超过大小的文件会被自动过滤，可通过 `oversize` 事件获取这些文件信息。建议配合 [Field](/zh-CN/field) 的 `label-comment` 向用户展示具体限制。

```html
<van-field
  label="文件大小限制"
  label-comment="单个文件大小不能超过 500kb"
  label-align="top"
>
  <template #input>
    <van-uploader-file
      v-model="fileList"
      :upload="upload"
      accept="*"
      multiple
      :max-size="500 * 1024"
      @oversize="onOversize"
    />
  </template>
</van-field>
```

```js
import { ref } from 'vue';
import { showToast } from 'vant';

export default {
  setup() {
    const fileList = ref([]);

    const onOversize = () => {
      showToast('文件大小不能超过 500kb');
    };

    return { fileList, onOversize };
  },
};
```

### 文件数量限制

通过 `max-count` 属性可以限制上传文件的数量，超出限制时上传按钮仍可见，点击上传按钮会提示「最多上传 x 个文件」。建议配合 [Field](/zh-CN/field) 的 `label-comment` 向用户展示具体限制。

```html
<van-field
  label="文件数量限制"
  label-comment="最多上传 2 个文件"
  label-align="top"
>
  <template #input>
    <van-uploader-file
      v-model="fileList"
      :upload="upload"
      accept="*"
      multiple
      :max-count="2"
    />
  </template>
</van-field>
```

## API

### Props

#### UploaderFile 专有

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 已上传的文件列表 | _UploaderFileListItem[]_ | `[]` |
| upload | 单文件上传方法，返回 Promise；成功时可 `resolve({ url })` 合并进列表项 | _(item: UploaderFileListItem) => Promise\<UploaderFileUploadResult \| void\>_ | - |
| preview | 自定义预览，不传则对图片使用 [ImagePreview](/zh-CN/image-preview)（与 Uploader 一致） | _(item: UploaderFileListItem) => void_ | - |
| preview-full-image | 是否点击图片使用全屏图片预览 | _boolean_ | `true` |
| preview-options | 全屏图片预览配置，见 [ImagePreview](/zh-CN/image-preview) | _object_ | - |
| download | 自定义下载，不传则后台拉取 Blob 触发下载（不跳转页面） | _(item: UploaderFileListItem) => void_ | - |
| rename | 自定义重命名，不传则更新列表项 `displayName` | _(item, newName) => void \| Promise\<void\>_ | - |
| rename-maxlength | 重命名输入框最大字数，不传则不限制；传入后展示字数统计 | _number \| string_ | - |
| upload-text | 上传按钮文案 | _string_ | `添加附件` |

#### 继承自 Uploader

以下属性透传至内部 [Uploader](/zh-CN/uploader)，默认值与 Uploader 不同时已注明：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| accept | 允许上传的文件类型 | _string_ | `*` |
| multiple | 是否开启多选 | _boolean_ | `true` |
| result-type | 文件读取结果类型 | _string_ | `file` |
| name | 标识符，可在回调 `detail` 中获取 | _number \| string_ | - |
| disabled | 是否禁用 | _boolean_ | `false` |
| readonly | 是否只读 | _boolean_ | `false` |
| deletable | 是否展示删除按钮 | _boolean_ | `true` |
| max-size | 文件大小限制，单位 `byte` | _number \| string \| (file: File) => boolean_ | `Infinity` |
| max-count | 文件数量限制 | _number \| string_ | `Infinity` |
| before-read | 文件读取前的回调 | _Function_ | - |
| before-delete | 文件删除前的回调 | _Function_ | - |
| capture | 选取模式，如 `camera` | _string_ | - |

更多 Uploader 属性见 [Uploader 文档](/zh-CN/uploader#props)。组件内部固定 `preview-image` 为 `false`，由列表区域展示文件。

### 内置状态文案

组件内部自动维护，无需外部传入：

| 状态 | 文案 |
| --- | --- |
| 等待上传 | `等待上传` |
| 上传中 | `上传中` |
| 成功 | 文件大小，如 `1.5MB` |
| 失败 | `上传失败`（可被 `reject(Error)` 的 message 覆盖） |

上传失败时，列表项右侧展示「重新上传」链接，点击后使用同一文件重新执行 `upload`。

列表项左侧默认展示文件类型 SVG 图标；图片文件会直接展示缩略图（优先使用本地 `objectUrl` / `content`，否则使用 `url`），上传失败的图片仍展示错误态图标。

上传成功后，右侧展示 `weapp-nav` 菜单按钮，点击弹出 [ActionSheet 动作面板](/zh-CN/action-sheet)，包含预览、重命名、下载、删除（删除需 [Dialog](/zh-CN/dialog) 二次确认）。预览对图片文件使用与 [Uploader](/zh-CN/uploader) 相同的 [ImagePreview](/zh-CN/image-preview) 全屏预览，不再新开页面。

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 文件列表变化 | _fileList: UploaderFileListItem[]_ |
| preview | 点击预览 | _item, detail_ |
| rename | 重命名确认 | _item, newName, detail_ |
| download | 点击下载 | _item, detail_ |
| delete | 删除文件 | 同 Uploader 的 `delete` |
| oversize | 文件超出大小限制 | 同 Uploader 的 `oversize` |
| click-upload | 点击上传区域 | _event: MouseEvent_ |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 自定义上传触发区域，不传则使用默认「添加附件」按钮 |

### UploaderFileListItem 数据结构

列表项类型与 [Uploader](/zh-CN/uploader) 一致，常用字段：

| 键名 | 说明 | 类型 |
| --- | --- | --- |
| url | 文件 URL（`upload` 成功后由组件写入） | _string_ |
| file | 原始文件对象 | _File_ |
| status | 上传状态：`uploading` `done` `failed` 或空（等待） | _string_ |
| message | 状态提示文案（组件自动维护） | _string_ |
| deletable | 是否展示删除按钮 | _boolean_ |
| beforeDelete | 删除前置拦截 | _Function_ |

### 方法

通过 ref 可获取组件实例并调用方法（与 Uploader 一致）：

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| chooseFile | 调起文件选择 | - |
| closeImagePreview | 关闭图片预览 | - |
| reuploadFile | 覆盖上传指定项 | _index: number_ |

```ts
import { ref } from 'vue';
import type { UploaderFileInstance } from 'vant';

const uploaderFileRef = ref<UploaderFileInstance>();

uploaderFileRef.value?.chooseFile();
```

### 类型定义

```ts
import type {
  UploaderFileProps,
  UploaderFileInstance,
  UploaderFileUpload,
  UploaderFileUploadResult,
  UploaderFileThemeVars,
  UploaderFileListItem,
} from 'vant';
```

## 主题定制

### 样式变量

组件提供了下列 CSS 变量，可用于自定义样式，使用方法请参考 [ConfigProvider 组件](/zh-CN/config-provider)。

| 名称 | 默认值 | 描述 |
| --- | --- | --- |
| --van-uploader-file-upload-height | _40px_ | 上传按钮高度 |
| --van-uploader-file-upload-radius | _var(--van-radius-md)_ | 上传按钮圆角 |
| --van-uploader-file-upload-border-color | _var(--van-gray-4)_ | 上传按钮边框色 |
| --van-uploader-file-upload-color | _var(--van-text-color)_ | 上传按钮文字颜色 |
| --van-uploader-file-upload-font-size | _var(--van-font-size-md)_ | 上传按钮字号 |
| --van-uploader-file-upload-icon-size | _16px_ | 上传按钮图标大小 |
| --van-uploader-file-list-margin-top | _var(--van-padding-xs)_ | 文件列表上边距 |
| --van-uploader-file-item-padding | _20px 12px 20px 16px_ | 列表项内边距 |
| --van-uploader-file-item-background | _#fafafa_ | 列表项背景色 |
| --van-uploader-file-item-border-width | _1px_ | 列表项分割线宽度 |
| --van-uploader-file-item-border-color | _var(--van-border-color)_ | 列表项分割线颜色 |
| --van-uploader-file-icon-width | _32px_ | 文件类型 SVG 图标宽度 |
| --van-uploader-file-icon-height | _32px_ | 文件类型 SVG 图标高度 |
| --van-uploader-file-icon-margin-right | _8px_ | 文件类型 SVG 图标右边距 |
| --van-uploader-file-name-color | _var(--van-text-color)_ | 文件名颜色 |
| --van-uploader-file-name-font-size | _var(--van-font-size-md)_ | 文件名字号 |
| --van-uploader-file-name-line-height | _var(--van-line-height-md)_ | 文件名行高 |
| --van-uploader-file-name-tooltip-max-width | _280px_ | 文件名气泡最大宽度 |
| --van-uploader-file-name-tooltip-padding | _var(--van-padding-xs) var(--van-padding-sm)_ | 文件名气泡内边距 |
| --van-uploader-file-name-tooltip-font-size | _var(--van-font-size-sm)_ | 文件名气泡字号 |
| --van-uploader-file-name-tooltip-line-height | _var(--van-line-height-sm)_ | 文件名气泡行高 |
| --van-uploader-file-status-color | _var(--van-gray-6)_ | 状态文案颜色 |
| --van-uploader-file-status-uploading-color | _var(--van-orange)_ | 上传中状态颜色 |
| --van-uploader-file-status-font-size | _var(--van-font-size-sm)_ | 状态文案字号 |
| --van-uploader-file-status-margin-top | _2px_ | 状态文案上边距 |
| --van-uploader-file-status-line-height | _var(--van-line-height-sm)_ | 状态文案行高 |
| --van-uploader-file-status-loading-margin-right | _var(--van-padding-base)_ | 上传中 loading 右边距 |
| --van-uploader-file-status-failed-color | _var(--van-danger-color)_ | 上传失败状态颜色 |
| --van-uploader-file-actions-margin-left | _var(--van-padding-xs)_ | 操作区左边距 |
| --van-uploader-file-actions-gap | _var(--van-padding-xs)_ | 操作区间距 |
| --van-uploader-file-reupload-color | _var(--van-orange)_ | 重新上传颜色 |
| --van-uploader-file-reupload-icon-size | _16px_ | 重新上传图标大小 |
| --van-uploader-file-reupload-font-size | _var(--van-font-size-sm)_ | 重新上传字号 |
| --van-uploader-file-reupload-line-height | _var(--van-line-height-sm)_ | 重新上传行高 |
| --van-uploader-file-menu-color | _var(--van-uploader-file-delete-color)_ | 菜单图标颜色 |
| --van-uploader-file-menu-size | _20px_ | 菜单图标大小 |
| --van-uploader-file-delete-color | _var(--van-gray-9)_ | 删除图标颜色 |
| --van-uploader-file-delete-size | _18px_ | 删除图标大小 |
| --van-uploader-file-rename-wrap-margin | _var(--van-padding-md) var(--van-padding-lg)_ | 重命名弹窗输入框外边距 |
| --van-uploader-file-rename-wrap-padding | _var(--van-padding-xs) var(--van-padding-sm)_ | 重命名弹窗输入框内边距 |
| --van-uploader-file-rename-wrap-border-width | _1px_ | 重命名弹窗输入框边框宽度 |
| --van-uploader-file-rename-wrap-border-color | _var(--van-border-color)_ | 重命名弹窗输入框边框色 |
| --van-uploader-file-rename-wrap-radius | _var(--van-radius-md)_ | 重命名弹窗输入框圆角 |
| --van-uploader-file-rename-word-limit-margin-left | _var(--van-padding-xs)_ | 重命名字数统计左边距 |
