# SchemaProForm 公共图片 / 附件接口

## 来源和边界

只读核对 PC 仓库 `src/_components/UploadField/index.vue`、`src/_components/ProForm/transform-schema.js`、`src/services/api/common/file/{config,index,entity}.js`。移动端由 `SchemaUploadField.vue` 统一调用，下层复用现有 Vant Uploader / UploaderFile，不在业务页面单独接上传，不修改 PC 或 Vant 源码。

只实现普通附件链路。没有接入 Excel 导入、轮询解析、文件重命名或文件服务物理删除。不提供上传 Mock，不用 data URL 冒充文件服务。

## 1. 普通附件上传

`POST /dthr-file/v4/api/file/upload`

使用 `FormData`，浏览器自动设置 multipart boundary，不能沿用 JSON Content-Type。与 PC 一致携带 `isNoCrypto: true` 请求头。

| 入参      | 类型   | 必填 | 含义                             |
| --------- | ------ | ---- | -------------------------------- |
| file      | File   | 是   | 实际选择的文件内容               |
| sceneCode | string | 否   | 场景码；未配置不发送，不自行编造 |

统一响应 `{body, errorCode, errorMsg}`，成功码 `null` / `000000`。原始 body：

| 字段 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| id | string | 是 | 文件服务真实 ID，兼容 PC 同时支持的 fileId |
| originalName | string | 否 | 原始文件名，兼容 PC 同时支持的 fileName；缺失时使用实际 File.name |

API 适配为 `{fileId, fileName}`。失败给空字符串，不生成 ID。上传成功缺 ID 仍视为失败。进度使用 Axios 的实际 loaded/total，传输结束最多显示 99%，收到成功响应及 ID 后才标记完成；不估算进度。

## 2. 展示 / 下载链接

`GET /dthr-file/v4/api/file/{id}/url`，路径 id 必填并 URL 编码，无请求体。

| body 字段 | 类型   | 必填 | 含义                                   |
| --------- | ------ | ---- | -------------------------------------- |
| url       | string | 是   | 用于图片展示、预览及附件下载的真实链接 |
| objectId  | string | 否   | 文件对象标识；不当作人员档案的文件 ID  |

失败适配 `{url: '', objectId: ''}`，组件显示错误并保留原 ID。已有 previewUrl/fileUrl/url/downloadUrl 时优先复用；图片仅有 ID 时补缩略图，普通附件在预览或下载时再取链接。同组件复用成功链接和正在查询的请求。地址缓存不写回表单草稿，不会仅因回显就产生未保存修改。

图片使用移动端大图预览；普通文件参照 PC 使用返回链接下载（新窗口，不替换当前档案页），不虚构 Office 在线预览。宿主 WebView 的下载能力仍需实际接入验证。

## Schema 组装与渲染

`IMAGE/IMG/FILE → component: 'schemaUpload'`，在 `SchemaProForm` 的 components 注册中映射为 `SchemaUploadField`。图片 `mode='image'`，附件 `mode='file'`。组件自身不再包 Field，沿用 ProForm 外层标签和校验，避免双层表单项。

- 图片：缩略图 + “添加图片”入口，附件：“添加附件”按钮 + 文件类型图标、名称、状态/大小列表，两者不共用同一个按钮样式。
- `typeConfigJson.uploadCount`、`imageSizeLimit/fileSizeLimit` 或 `maxSize`、`uploadUnit/sizeUnit`、`allowedFormats/formats` 转换为 maxCount、字节 maxSize、accept。数量、单文件大小和格式提示按配置组装多行，在字段标题下、上传区上方展示，不硬编码业务上限。
- 可编辑时允许上传/删除；只读和禁用时隐藏入口、删除及限制提示，保留文件展示、预览/下载。
- 新文件成功后回填真实 fileId、原名、大小与 done 状态。失败保留 failed；表单统一阻止 uploading、failed 和无 ID 文件提交。多文件独立上传，移除后不把迟到结果重新加回。
- 回显兼容 ID 字符串、逗号串、数组、PC 文件项及 response.body 中的附件信息。文件名称适配移动端 displayName；状态不把缺失 ID 的本地文件标为成功。

## 提交值

同 PC ProForm，`getSubmitPayload` / `buildSubmitPayload` 中 IMAGE/IMG/FILE 裁剪为 `[{fileId, fileName}]`，自定义字段仍进 customFields，剔除 File、预览地址和状态。回填模型时再转换成控件列表，保留已有展示地址。

员工档案的具体保存接口仍由该模块负责最终 ID 字符串化，例如 `[{fileId:'a'},{fileId:'b'}] → 'a,b'`，删除全部为 `''`。通用表单不硬编码某个业务信息集的保存协议。

## 验证

`node_modules/.bin/vitest.CMD run tests/schema-upload.test.ts tests/employee-archive.test.ts`。自动化使用实际组件和转换器，只隔离 HTTP 边界；不能代替真实文件服务及宿主下载联调。
