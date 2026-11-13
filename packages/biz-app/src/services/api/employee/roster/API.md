# 花名册（移动端）- 接口文档

服务前缀：`/dthr-employee/v4`

---

## 当前登录人（me）

- **作用**：花名册入口取当前登录人所属部门、是否部门联系人。无入参，按登录态返回。
- **URL**: `POST /dthr-employee/v4/mobile-roster/context`
- **入参**：无
- **返回 body**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| orgId | String | 是 | 当前登录人所属部门 id |
| orgName | String | 是 | 当前登录人所属部门名称 |
| isDeptContact | Boolean | 是 | 是否部门联系人。`true` 时入口进入自己的部门，并显示右上角花名册设置 |

部门联系人为 `false` 时，入口停留在组织架构根。部门人员列表不走本接口，按 `orgId` 调组织人员接口。

---

## 员工身份字段

花名册真实字段以提供的 `roster.txt` 为准；手机设置的旧 `fieldCode` 不能作为人员字段名来源：

| 接口字段 | 说明 | 移动端处理 |
| --- | --- | --- |
| avatar | 头像原始值 | 设置接口的 `fieldCode: tab_staff_info.staffImageId` 对应 `columnName: avatar`；人员数据只读取 `avatar` |
| name | 员工姓名 | 列表、搜索和详情使用真实列名 `name`；设置节点只通过 `columnName: "name"` 对应它 |
| staffNo | 工号 | 列表、详情均使用 `staffNo`，字段授权通过 `columnName` 对应 |
| orgId | 部门字段 | 按 `orgId` 做字段授权，不转换为其他部门别名 |
| orgName | 部门展示值 | 来自 `orgId` 的 `fieldMapping: orgName`，列表展示和部门关键字搜索读取此值 |

- 详情字段以 2026-11-13 提供的 `roster.txt` 为准：11 个信息集、19 个分组、187 个字段；Mock 同步其编码、名称、字段类型及展示映射。样本未覆盖的既有专用页签保持原样。
- 人员列表的必填性尚未提供，缺失值在适配层保留为空字符串。
- `idPhotoFront` 是证件照正面，与头像 `avatar` 分开处理。
- 头像配置按用户补充加入手机设置 Mock：`fieldCode: tab_staff_info.staffImageId`、`columnName: avatar`。原 `roster.txt` 未包含头像字段，因此不修改其 187 个详情字段，也不把设置编码当作人员字段。
- 姓名设置节点保留 `fieldCode: "tab_staff_info.staffName"`，新增 `columnName: "name"`；备注节点保留原设置编码，`columnName` 为 `remarks`。这些设置编码不是详情数据取值键。
- 人员适配只读取确认的真实字段，不再对部门、手机号、头像添加未确认的别名兼容。`fieldMapping` 只决定展示取值，不参与授权匹配。
- 当前列表仍使用姓名文字头像；`avatar` 的值格式和图片访问规则尚未提供，本次不拼接或推断图片地址。

---

## 团队信息授权

管理员在「员工设置 → 手机花名册设置 → 团队信息授权」配好。当前花名册展示只按 `appTeamAuthSelected` 的团队已选字段裁剪，不叠加个人设置。

- `appTeamAuth`：团队设置的全量字段选项，供后续花名册设置页使用，不参与当前展示转换。
- `appTeamAuthSelected`：团队已选字段，当前列表、搜索和详情的唯一字段授权来源；后续设置页也用它回显已选项。
- 个人设置属于后续员工档案模块，当前花名册 Store 不保存、不求交，也不用于裁剪详情。

`isAllowDepartmentManagerView` 给 App 入口判断部门负责人是否能看到花名册，进页后不再拦一次。

### 基础设置

- **URL**: `/dthr-employee/v4/corp/config/query-team-auth`
- **Method**: `GET`
- **入参**：无
- **返回 body**

| 字段                         | 类型    | 必填 | 说明                      |
| ---------------------------- | ------- | ---- | ------------------------- |
| isAllowDepartmentManagerView | Boolean | 是   | `true` 允许部门负责人查看 |

### 全部可选 / 已选字段

- **URL**: `/dthr-base/v4/system-config/list`
- **Method**: `GET`
- **入参**

| 字段 | 类型   | 必填 | 说明                                               |
| ---- | ------ | ---- | -------------------------------------------------- |
| type | String | 是   | `appTeamAuth` 全部可选；`appTeamAuthSelected` 已选 |

- **返回 body**：`{ code, msg, data }`，信息集在 `data` 数组，`setCode → groupList → fieldList`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| setCode / setName | String | 信息集，与花名册 setCode 一致 |
| groupCode / groupName | String | 分组 |
| fieldCode / fieldName | String | 设置接口原有编码及名称；字段编码不参与花名册匹配或个人／团队范围交集，展示名称仍读取 fieldName |
| columnName | String | 字段级过滤必需，值精确等于对应信息集的花名册 `fieldCode`，不加信息集前缀 |
| systemConfig.builtin | Boolean | 信息集或已选内置字段，不可从设置里拿掉 |
| systemConfig.sort | Number | 排序 |

`getRosterTeamAuthSelectedApi()` 只请求 `type=appTeamAuthSelected`，返回已适配的团队已选树，供当前展示使用。

`getRosterTeamAuthApi()` 保留基础设置、全部可选字段、已选字段三个请求，仅供后续设置页使用，当前花名册页面不调用它。基础设置只有开关，不添加无意义的 `columnName`；两份字段树的字段节点均返回 `columnName`。

- 过滤关系：`设置.fieldList[].columnName === 花名册.children[].children[].fieldCode`。例如设置 `fieldCode` 为 `tab_staff_info.staffName`，其 `columnName` 为 `name`，最终匹配详情 `fieldCode: name`。
- 设置接口的 `fieldCode` 完全不参与字段匹配；字段适配也不读取它。信息集和分组仍分别按 `setCode`、`groupCode` 对齐。
- 不截取前缀、按名称猜测或回退到旧编码。字段节点缺少有效 `columnName` 时不授予字段权限。
- 模块、分组整体授权，以及姓名列表展示和部门负责人入口规则保持原样。
- `fieldMapping` 仍只负责展示取值（如 `orgId → orgName`），不能代替 `columnName` 作为授权键。
- 分组字段按 `setCode + groupCode + columnName` 匹配，同名银行卡字段不会跨分组放行；列表字段查询基础信息的默认分组，整组授权同样有效。
- 已选查询成功但结果为空时按空授权处理；查询失败时仍沿用原有“不裁剪”策略，不把失败当作成功的空设置。

### 字段转换入口

- 业务工具位于 `src/pages/roster/utils/`：`fieldSchema.ts` 统一整理页面字段，`teamAuth.ts` 负责字段匹配与授权规则。它们是模块内的纯函数，不依赖 Vue 页面组件或 Pinia；接口请求和响应结构适配仍留在 `services` 的 `index.ts`、`entity.ts` 中。
- `createRosterFieldSchema(selectedList, ready)` 接收已适配的团队已选树与请求状态，不请求接口。
- `filterTabs(tabs)` 返回可用页签；`resolveGroups(setCode, groups)` 返回可直接展示的分组字段，统一完成授权过滤和既有银行卡「是否默认」字段整理。
- `isListFieldAllowed(fieldCode)` 复用同一个索引，供列表和搜索查询。元数据的顺序、`fieldMapping`、字段类型和选项保留，转换不修改输入。
- Store 在已选设置变化时重建转换器；详情切换页签时传入对应元数据，不为字段转换请求全量设置或全部页签字段。
- 既有个人范围求交函数仅作为后续员工档案的独立工具保留，不接入当前花名册转换入口。

### 详情加载与缓存

- 字段和详情并行请求，仅在两者都成功时写入缓存；失败明确提示，下次进入允许重试，不把失败结果缓存成空数据。
- 缓存按员工隔离，同一页签的并发请求复用；切换员工或部门后，旧响应不覆盖新页面。附件二级页继续共用一次请求。
- 权限刷新按编码保留当前页签和二级页；当前页失去权限时切换到可见页，无可见页时清空内容。
- 字段接口返回了其他信息集、或指定附件分类不存在时，不回退显示第一个不相关分类。

---

## 详情页签集合

- **作用**：进入员工详情后查询全部信息集，作为 Tab
- **URL**: `/dthr-employee/v4/staff-info-field/roster-detail-set/get`
- **Method**: `GET`
- **入参**：无
- **返回 body**：信息集数组

| 字段    | 类型   | 必填 | 说明                  |
| ------- | ------ | ---- | --------------------- |
| setCode | String | 是   | 信息集编码，页签 name |
| setName | String | 否   | 信息集名称            |
| builtin | Number | 否   | 1 系统 / 0 自定义     |

---

## 当前 Tab 字段

- **作用**：切到某个信息集时，按 `setCode` 取这一页的分组和字段
- **URL**: `/dthr-employee/v4/staff-info-field/roster-display-form/get`
- **Method**: `GET`
- **入参**：`setCode` 必填，当前 Tab 的信息集编码
- **返回 body**：当前信息集，`tab > group > field`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| type | String | `tab` / `group` / `field` |
| setCode / setName | String | 信息集 |
| groupCode / groupName | String | 分组 |
| fieldCode / fieldName | String | 字段 |
| fieldType | String | TEXT / OPTION / DATE / BOOLEAN / IMAGE / FILE 等 |
| fieldMapping | String | 展示取值映射，如 orgId → orgName |

---

## 基础信息详情

- **URL**: `POST /dthr-employee/v4/staff-basic/detail`
- **入参**：`staffId` 必填
- **返回 body**：按 `groupCode` 分组取值

---

## 单条信息集详情

| 信息集   | URL                                                   |
| -------- | ----------------------------------------------------- |
| 福利     | `POST /dthr-employee/v4/staff-benefit-info/detail`    |
| 薪资     | `POST /dthr-employee/v4/staff-salary-tax-info/detail` |
| 个税申报 | `POST /dthr-employee/v4/staff-tax-info/detail`        |

- **入参**：`staffId` 必填
- **返回 body**：按 `groupCode` 分组取值

---

## 多行信息集详情

| 信息集     | URL                                                       |
| ---------- | --------------------------------------------------------- |
| 教育经历   | `POST /dthr-employee/v4/staff-education/detail`           |
| 工作经历   | `POST /dthr-employee/v4/staff-work-experience/detail`     |
| 家庭成员   | `POST /dthr-employee/v4/staff-family/detail`              |
| 员工证书   | `POST /dthr-employee/v4/staff-certificate/detail`         |
| 绩效档案   | `POST /dthr-employee/v4/staff-performance/detail`         |
| 公司内兼任 | `POST /dthr-employee/v4/staff-concurrent-position/detail` |
| 自定义     | `POST /dthr-employee/v4/archive/info/detail`              |

- **固定信息集入参**：`staffId`
- **自定义入参**：`setCode`、`staffId`
- 没有固定详情接口的页签使用通用接口，即使 `builtin=1` 也必须携带 `setCode`；已有固定接口的入参保持不变。
- **返回 body**：记录数组

---

## 直属领导详情

- **URL**: `POST /dthr-employee/v4/staff-report/detail`
- **入参**：`staffId` 必填
- **返回 body**：`{ 汇报类型编码: { staffId, staffName } }`

---

## 【假接口】成长记录-异动记录

正式接口未出，先走占位 Mock。

- **作用**：成长记录「异动记录」列表
- **URL**: `POST /dthr-employee/v4/staff-growth/change-list`
- **入参**：`staffId` 必填
- **返回 body**：`{ records, total }`

| 字段          | 类型   | 必填 | 说明     |
| ------------- | ------ | ---- | -------- |
| id            | String | 否   | 记录 id  |
| changeDate    | String | 否   | 异动日期 |
| operationTime | String | 否   | 操作时间 |
| changeType    | String | 否   | 异动类型 |
| detail        | String | 否   | 详情     |

---

## 【假接口】成长记录-企业内任职记录

正式接口未出，先走占位 Mock。

- **作用**：成长记录「企业内任职记录」列表
- **URL**: `POST /dthr-employee/v4/staff-growth/position-list`
- **入参**：`staffId` 必填
- **返回 body**：`{ records, total }`

| 字段          | 类型   | 必填 | 说明                     |
| ------------- | ------ | ---- | ------------------------ |
| id            | String | 否   | 记录 id                  |
| startDate     | String | 否   | 任职开始日期             |
| endDate       | String | 否   | 任职结束日期，空表示至今 |
| positionType  | String | 否   | 任职类型，如兼岗 / 主岗  |
| department    | String | 否   | 任职部门                 |
| position      | String | 否   | 任职职位                 |
| duty          | String | 否   | 任职职务                 |
| rank          | String | 否   | 任职职级                 |
| changeReason  | String | 否   | 任职变动原因说明         |
| source        | String | 否   | 数据来源                 |
| operator      | String | 否   | 操作人                   |
| operationTime | String | 否   | 操作时间                 |

---

## 【假接口】员工成本中心

正式接口未出，先走占位 Mock。

- **作用**：员工成本中心详情。`displayType` 决定移动端展示形式：`0` 按比例，`1` 按金额。
- **URL**: `POST /dthr-employee/v4/staff-cost-center/detail`
- **入参**：`staffId` 必填
- **返回 body**

| 字段        | 类型   | 必填 | 说明                         |
| ----------- | ------ | ---- | ---------------------------- |
| displayType | Number | 是   | 展示形式：`0` 比例，`1` 金额 |
| ratioTotal  | String | 否   | 总比例文案                   |
| amountTotal | String | 否   | 总金额文案                   |
| ratioRows   | Array  | 否   | 按比例分摊                   |
| amountRows  | Array  | 否   | 按金额分摊                   |

ratioRows[] / amountRows[]

| 字段            | 类型   | 说明               |
| --------------- | ------ | ------------------ |
| costCenterName  | String | 成本中心           |
| costProjectName | String | 成本项目（按金额） |
| value           | String | 分摊比例或分摊金额 |

---

## 【假接口】附件

正式接口未出，先走占位 Mock。

- **作用**：附件 Tab，含花名册附件 / 入职附件
- **URL**: `POST /dthr-employee/v4/staff-roster/detail`
- **入参**：`staffId` 必填；`code` 固定 `ATTACHMENT`
- **返回 body**：`attachments.subTabs`

subTabs[]

| 字段   | 类型   | 说明          |
| ------ | ------ | ------------- |
| code   | String | 二级 Tab 编码 |
| name   | String | 二级 Tab 名称 |
| groups | Array  | 分组          |

groups[]

| 字段        | 类型   | 说明                       |
| ----------- | ------ | -------------------------- |
| groupCode   | String | 分组编码                   |
| groupName   | String | 分组名称                   |
| displayType | String | `image` 宫格 / `file` 列表 |
| files       | Array  | 文件列表                   |

files[]

| 字段     | 类型   | 说明     |
| -------- | ------ | -------- |
| id       | String | 文件主键 |
| name     | String | 文件名   |
| url      | String | 文件地址 |
| thumbUrl | String | 缩略图   |
