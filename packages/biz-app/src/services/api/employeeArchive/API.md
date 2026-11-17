# 本人员工档案 - 页面与接口

## 入口与范围

宿主 App 的“我的 → 我的档案”打开 `/#/employee-archive?id=员工ID`，也支持 `/#/employee-archive/员工ID`。`id` 是员工 ID，作为现有详情请求的 `staffId`；不是教育经历等子记录的 ID。缺失时显示错误，不查询其他员工或选取示例员工代替。此仓库仅实现档案页，不添加宿主入口、Tabbar 或原生关闭协议。

宿主接入时仍需由服务端验证登录身份与员工 ID 的关系。页面的字段权限只决定交互，不能替代服务端授权。

## 展示与编辑规则

- 只读：复用花名册的页签元数据、详情查询、团队已选缓存和 `SchemaCard`。个人“隐藏”不会影响只读展示。
- 编辑：团队可见范围内叠加 PC `appPersonalAuth`。隐藏字段移除，仅显示字段锁定，可编辑字段沿用信息集的原字段类型。`CALCULATE`、`DISPLAY`、未支持独立编辑的 `ADVANCED` 不作为普通可修改文本提交。
- 个人权限缺失时不授予编辑权；个人接口失败明确提示，只允许查看。团队配置失败不展示未经授权的数据。
- `required`、`typeConfigJson`、`options`、`dataSource`、字段映射、日期精度、文本长度、数值范围、附件格式/大小/数量等从原信息集保留。权限接口不提供这些字段定义，也不按字段名称猜测配置。
- 默认基础信息。5 个以内直接显示，超过 5 个横向滚动；超过 8 个增加完整信息集菜单，面板最多 580px 且受可视高度约束。菜单和普通 Tab 使用相同的未保存确认。
- 信息集内按原分组展示和折叠。未修改时切换或返回直接离开；修改后取消离开则保留草稿，确认离开则丢弃当前草稿。路由返回、路由切换及更换 `id` 都有保护。原生 WebView 直接关闭需宿主提供关闭协议后接入，当前不虚构 JS Bridge。
- 教育经历、工作经历支持新增记录。仅本次新增且未提交的记录可删除，无二次确认；提交后获得记录 ID，不再显示本地删除按钮。
- 每个信息集独立进入编辑并独立提交，不一次提交所有 Tab。页面先提取有编辑权的实际变更，再叠加到当前信息集原快照，按 PC 协议组装保存请求。列表接口回传当前集全部记录，未修改记录及只读、隐藏字段的原值保留，避免整表保存误删。银行卡按分组保留 ID，显示映射值不作为原字段值提交。失败保留草稿；业务返回 `false` 不视为成功；提交成功后回读，回读失败只重试刷新，不重复提交。
- 需审批字段显示“审”字标记（16×16px、圆角2px、背景 #FFF2E9，与左侧标签间隔6px）；已提交的待审值不会覆盖已生效值。多行待审记录整条锁定，单条信息集锁定对应待审字段。其他可编辑字段仍可修改。可编辑必填字段沿用 Field 的星号样式与 required 校验，锁定字段不参与必填校验。

## 已有接口

| 功能 | 请求 | 入参 | 说明 |
| --- | --- | --- | --- |
| 信息集列表 | `GET /dthr-employee/v4/staff-info-field/roster-detail-set/get` | 无 | 沿用花名册列表并按团队范围裁剪 |
| 原始信息集元数据 | `GET /dthr-employee/v4/staff-info-field/roster-display-form/get` | `setCode: string`，必填 | 保留原始字段与完整类型配置，不经过展示适配裁掉编辑元数据 |
| 团队已选 | `GET /dthr-base/v4/system-config/list` | `type=appTeamAuthSelected`，必填 | 复用现有花名册 Store 的成功缓存 |
| 个人信息授权 | `GET /dthr-base/v4/system-config/list` | `type=appPersonalAuth`，必填 | 查询配置，不调用管理员的 `person-save` 修改配置 |
| 字段值 | 沿用各信息集现有花名册详情接口 | `staffId`，自定义信息集另传 `setCode` | 基础信息、单条和多行按现有实现；详情接口参见相邻花名册文档 |

个人授权参照只读 PC 仓库 `src/services/api/employee/settings/mobile-roster-setting/index.ts`、`entity.ts` 与 `API.md`。后端已确认本人保存使用 PC 花名册详情同一组编辑接口；页面不调用管理员的 `staff-info-change/approve` 审批接口。

### 个人授权响应

`body` 支持数组、`{data: []}`、`{setList: []}`，层级 `setCode → groupList → fieldList`，也支持信息集直挂字段和整集授权。

| 字段 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| setCode | string | 是 | 与花名册信息集编码一致 |
| groupCode | string | 分组字段是 | 字段所属分组，避免同名字段串权限 |
| columnName | string | 推荐提供 | 花名册真实字段名；缺失时只接受 `fieldCode` 与真实字段名精确一致，不截前缀、不按中文名称映射 |
| fieldCode | string | 字段是 | 个人授权配置编码，不保证等于人员字段名 |
| systemConfig.authType / auth | string | 是 | `hide`/`hidden` 隐藏；`readonly`/`display` 仅显示；`editable` 可编辑 |
| systemConfig.editable | boolean | 否 | `false` 表示不支持可编辑，即使配置 editable 也不会赋予编辑权 |
| systemConfig.isApproval | boolean | 可编辑字段是 | `true` 需 HR 审批，`false` 直接生效；缺失不擅自决定，提交时明确报告配置不完整 |

PC 旧开发样本存在 `basic` 等与真实信息集不一致的编码。本页开发 Mock 按花名册真实编码生成授权样本；正式响应需由后端提供一致的 `setCode`、`groupCode`、`columnName`，前端不维护旧名称映射表。

## 本人保存：已确认复用 PC 各信息集接口

以下均为 `POST`，服务前缀 `/dthr-employee/v4`。路径和请求体核对 PC `src/services/api/employee/roster/list/detail/tabApi.ts`、`entity.ts`、`index.ts` 以及详情页的 `saveEdit` 分发。开发环境开启 Mock 时在这些相同路径联调；关闭后保存函数不改地址，也不会退回统一 Mock 保存接口。

| 信息集 setCode | 路径 | 专用请求字段 |
| --- | --- | --- |
| tab_staff_info | `/staff-basic/edit` | `staffBasicInfo` 对象、`staffAccountInfo` 数组或 null |
| tab_staff_education | `/staff-education/edit` | `educationList` 数组、`forceSave: true` |
| tab_staff_job_history | `/staff-work-experience/edit` | `workExperienceList` 数组 |
| tab_staff_family_member | `/staff-family/edit` | `familyList` 数组 |
| tab_staff_certificate | `/staff-certificate/edit` | `certificateList` 数组 |
| tab_staff_performance | `/staff-performance/edit` | `performanceList` 数组 |
| tab_staff_internal_concurrent | `/staff-concurrent-position/edit` | `concurrentPositionList` 数组 |
| tab_staff_benefit | `/staff-benefit-info/edit` | `staffBenefitInfo` 对象 |
| tab_staff_salary | `/staff-salary-tax-info/edit` | `staffSalaryTaxInfo` 对象 |
| tab_staff_subset_ptd | `/staff-tax-info/edit` | `staffTaxInfo` 对象 |
| dthr_staff_reporting_line | `/staff-report/edit` | `reportingLine` 对象，汇报编码 → 人员 ID |
| 自定义信息集 | `/archive/info/edit` | `setCode`、`list` 数组 |

### 保存字段与返回值

| 字段 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| staffId | string | 是 | 宿主传入的本人 ID，所有编辑接口均传 |
| 对应专用对象/数组 | object / array | 是 | 只包含当前信息集，不能混用其他信息集包装字段 |
| 数组项/单条对象 id | string | 是 | 保留详情记录 ID；新增记录为空字符串；不传本地草稿 key |
| customFields | object | 有自定义字段时 | 元数据 `systemFlag === 0` 的字段；其余原字段放同层 |
| forceSave | boolean | 教育经历是 | 后端已明确确认本人也固定传 `true`，不是前端按审批权限推算 |
| regularFlag | number | 基础信息有效值时 | 与 staffId 同级，仅 1/2；regularDate 不提交 |
| staffAccountInfo | array / null | 基础信息是 | 未改账号传 null；改账号时保留其他卡及各自 ID、defaultFlag，不能用空数组删除未编辑账号 |
| setCode | string | 自定义是 | 最外层及 list 每行都带，行内另带 staffId；无顶层记录 id |

系统字段与自定义字段取原信息集元数据，不取个人授权接口的字段类型。选项 `{label,value}` 提交原 value；BOOLEAN、birthdayType、hasDegree、taxpayerStatus 转 0/1。字段映射文案、未知键和 `_` 开头的临时键不回传。IMAGE/IMG/FILE 只传文件 ID 字符串，多张逗号连接，不传 URL、data URL 或 File；缺少文件 ID 时显式报错。详情读取保留原始分组 ID、customFields 和所有银行卡，不能经展示适配后再推测记录 ID。

自定义示例：`{staffId, setCode, list: [{id, staffId, setCode, ...系统字段, customFields: {...自定义字段}}]}`。

响应统一 `{body: boolean, errorCode, errorMsg}`；`true` 为提交成功，`false` 为未保存。页面不将 `false`、缺失返回值或请求失败转换为成功。成长记录、成本、附件独立页、试用期等未确认编辑协议的特殊页不冒充自定义信息集保存。

## 仍为明确开发 Mock 的接口

待审批状态尚未提供正式协议，仍保留临时状态 Mock。正式保存路径已经替换，不再使用 `/mock/employee-archive/submit`。图片和附件由 `SchemaProForm` 的 `SchemaUploadField` 统一处理，本页不实现独立上传请求或上传 Mock。

### 查询本次联调的状态

`GET /mock/employee-archive/state`

| 入参    | 类型   | 必填 | 说明              |
| ------- | ------ | ---- | ----------------- |
| staffId | string | 是   | 宿主传入的本人 ID |
| setCode | string | 是   | 当前信息集        |

返回 `body: {records, pending}`。`records: null` 表示尚未在 Mock 提交过，页面继续查询既有详情；数组表示 Mock 保存后的已生效记录。记录为 `{id: string, groups: {[groupCode]: {[columnName]: value}}}`。`pending` 为 `{recordId, changes: [{groupCode, columnName, value}] }[]`，与已生效记录分开保存。

开发 Mock 的各编辑路由解析对应 PC 请求体，只比较实际变化。Mock 按样本团队和个人配置校验权限及审批方式，非审批值更新已生效记录，审批值保存在 pending；失败不部分写入。状态按 `staffId + setCode` 隔离，重启恢复初始样本。不伪造 HR 审批通过，也不代表已经验证真实后端 `forceSave=true` 与审批的关系；真实审批结果以后端实际返回和状态接口为准。`ArchiveSubmission` 的 `records[].changes` 仅为页面内部变更描述，不是对后端的请求协议。

### 图片与附件处理

复用 `SchemaProForm` 的 IMAGE/IMG/FILE 控件与字段配置。通用表单负责将已有文件 ID 字符串、数组或完整文件对象转换为控件列表，保留 `fileId/id`、名称及已有地址；只有 ID 时不虚构预览 URL。上传中、上传失败和未取得文件 ID 的新文件由通用字段校验明确提示并阻止提交。档案页面只叠加编辑权限，不再注入独立的 `upload/afterRead` 逻辑。

公共上传已按 PC 核实并接入：`POST /dthr-file/v4/api/file/upload` 使用真实 multipart file，图片和附件共用；`GET /dthr-file/v4/api/file/{id}/url` 获取回显和下载链接。图片与附件使用不同入口、多行限制说明和各自列表样式；补链接不写回草稿。详见相邻公共文件模块接口文档。不调用原 `/mock/employee-archive/upload`，也不生成 Mock 文件 ID；真实文件服务尚需联调。

最终保存的数据转换仍由档案 API `archiveUploadIds` 负责：每项取 `fileId` 或 `id`，多项用英文逗号拼接，例如 `[{fileId:'a'},{id:'b'}] → 'a,b'`；清空列表为 `''`。文件名、预览地址、本地 File 不作为保存值；自定义附件字段照常进 `customFields`。

以上 Mock 响应统一 `{body, errorCode, errorMsg}`，成功码 `000000`；权限或配置校验失败返回 `ARCHIVE_INVALID` 及具体消息。关闭开发 Mock 后，状态临时接口仍需替换；上传走已接入的公共真实地址，与各信息集保存请求相互独立。

## 验证

在 `packages/biz-app` 执行 `node_modules/.bin/vitest.CMD run tests/schema-upload.test.ts tests/employee-archive.test.ts tests/roster-settings.test.ts tests/roster-field-schema.test.ts tests/roster-column-name.test.ts`。覆盖公共文件上传/回显接口、不同按钮与多行限制、上传失败/并发、独立保存请求体、全量记录保留、自定义字段、银行卡、文件 ID、forceSave、权限和保存失败/回读重试。TS 使用 `node_modules/.bin/vue-tsc.CMD --noEmit`。新增依赖为零，PC 仓库只读。
