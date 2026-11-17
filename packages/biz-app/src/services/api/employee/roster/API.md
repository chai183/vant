# 花名册（移动端）- 接口文档

服务前缀：`/dthr-employee/v4`（团队授权字段列表在 `/dthr-base/v4`）

## 真接口

| 接口 | Method | URL | 来源 |
| --- | --- | --- | --- |
| 基础开关 | GET | `/dthr-employee/v4/corp/config/query-team-auth` | 同步pc |
| 全部可选 / 已选字段 | GET | `/dthr-base/v4/system-config/list` | 同步pc |
| 详情页签集合 | GET | `/dthr-employee/v4/staff-info-field/roster-detail-set/get` | 同步pc |
| 当前 Tab 字段 | GET | `/dthr-employee/v4/staff-info-field/roster-display-form/get` | 同步pc |
| 基础信息详情 | POST | `/dthr-employee/v4/staff-basic/detail` | 同步pc |
| 福利详情 | POST | `/dthr-employee/v4/staff-benefit-info/detail` | 同步pc |
| 薪资详情 | POST | `/dthr-employee/v4/staff-salary-tax-info/detail` | 同步pc |
| 个税申报详情 | POST | `/dthr-employee/v4/staff-tax-info/detail` | 同步pc |
| 教育经历详情 | POST | `/dthr-employee/v4/staff-education/detail` | 同步pc |
| 工作经历详情 | POST | `/dthr-employee/v4/staff-work-experience/detail` | 同步pc |
| 家庭成员详情 | POST | `/dthr-employee/v4/staff-family/detail` | 同步pc |
| 员工证书详情 | POST | `/dthr-employee/v4/staff-certificate/detail` | 同步pc |
| 绩效档案详情 | POST | `/dthr-employee/v4/staff-performance/detail` | 同步pc |
| 公司内兼任详情 | POST | `/dthr-employee/v4/staff-concurrent-position/detail` | 同步pc |
| 自定义信息集详情 | POST | `/dthr-employee/v4/archive/info/detail` | 同步pc |
| 直属领导详情 | POST | `/dthr-employee/v4/staff-report/detail` | 同步pc |

设置页接口见 [settings/API.md](./settings/API.md)。  
组织树 / 部门人员见 [organization/org/API.md](../../organization/org/API.md)。

## 假接口

| 接口 | Method | URL | 来源 |
| --- | --- | --- | --- |
| 当前登录人 | POST | `/dthr-employee/v4/mobile-roster/context` | mock假数据 |
| 人员全量（搜索） | POST | `/dthr-employee/v4/mobile-roster/staff` | mock假数据 |
| 成长-异动记录 | POST | `/dthr-employee/v4/staff-growth/change-list` | 同步pc |
| 成长-企业内任职 | POST | `/dthr-employee/v4/staff-growth/position-list` | 同步pc |
| 员工成本中心 | POST | `/dthr-employee/v4/staff-cost-center/detail` | 同步pc |
| 附件 | POST | `/dthr-employee/v4/staff-roster/detail` | 同步pc |

统一响应：`{ body, errorCode, errorMsg }`，成功 `errorCode` 为 `null` 或 `000000`。

---

## 【假接口】当前登录人（me）

- **作用**：入口取所属部门、是否部门联系人。PC 无此接口，移动端占位
- **URL**: `POST /dthr-employee/v4/mobile-roster/context`
- **入参**：无
- **返回 body**

| 字段          | 类型    | 必填 | 说明                            |
| ------------- | ------- | ---- | ------------------------------- |
| orgId         | String  | 是   | 所属部门 id                     |
| orgName       | String  | 是   | 所属部门名称                    |
| isDeptContact | Boolean | 是   | `true` 进入本部门并显示设置入口 |

---

## 【假接口】人员全量（搜索）

- **作用**：搜索页先拉全量再前端匹配；正式搜索接口接上后替换。PC 无此接口
- **URL**: `POST /dthr-employee/v4/mobile-roster/staff`
- **入参**：无
- **返回 body**：`{ records, total }`

records[]

| 字段       | 类型    | 说明         |
| ---------- | ------- | ------------ |
| id         | String  | 员工 id      |
| name       | String  | 姓名         |
| staffNo    | String  | 工号         |
| phone      | String  | 手机号       |
| orgId      | String  | 所属部门 id  |
| orgName    | String  | 所属部门名称 |
| avatar     | String  | 头像         |
| concurrent | Boolean | 是否兼任     |

---

## 基础设置

- **作用**：是否允许部门负责人查看
- **URL**: `GET /dthr-employee/v4/corp/config/query-team-auth`
- **入参**：无
- **返回 body**

| 字段                         | 类型    | 必填 | 说明                      |
| ---------------------------- | ------- | ---- | ------------------------- |
| isAllowDepartmentManagerView | Boolean | 是   | `true` 允许部门负责人查看 |

---

## 全部可选 / 已选字段

- **作用**：团队授权字段树；展示只按 `appTeamAuthSelected` 裁剪
- **URL**: `GET /dthr-base/v4/system-config/list`
- **入参**

| 字段 | 类型   | 必填 | 说明                                               |
| ---- | ------ | ---- | -------------------------------------------------- |
| type | String | 是   | `appTeamAuth` 全部可选；`appTeamAuthSelected` 已选 |

- **返回 body**：`{ code, msg, data }`，信息集在 `data`，`setCode → groupList → fieldList`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| setCode / setName | String | 信息集 |
| groupCode / groupName | String | 分组 |
| fieldCode / fieldName | String | 设置编码及名称；匹配展示字段看 `columnName` |
| columnName | String | 等于花名册 `fieldCode`，不加信息集前缀 |
| systemConfig.builtin | Boolean | 已选最深层字段为 `true` 时固定不可取消 |
| systemConfig.sort | Number | 排序 |

过滤关系：`设置.fieldList[].columnName === 花名册.children[].children[].fieldCode`。

---

## 详情页签集合

- **作用**：员工详情全部信息集 Tab
- **URL**: `GET /dthr-employee/v4/staff-info-field/roster-detail-set/get`
- **入参**：无
- **返回 body**：信息集数组

| 字段    | 类型   | 必填 | 说明              |
| ------- | ------ | ---- | ----------------- |
| setCode | String | 是   | 信息集编码        |
| setName | String | 否   | 信息集名称        |
| builtin | Number | 否   | 1 系统 / 0 自定义 |

---

## 当前 Tab 字段

- **作用**：按信息集取分组和字段
- **URL**: `GET /dthr-employee/v4/staff-info-field/roster-display-form/get`
- **入参**：`setCode` 必填
- **返回 body**：`tab > group > field`

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
- **返回 body**：记录数组

---

## 直属领导详情

- **URL**: `POST /dthr-employee/v4/staff-report/detail`
- **入参**：`staffId` 必填
- **返回 body**：`{ 汇报类型编码: { staffId, staffName } }`

---

## 【假接口】成长记录-异动记录

- **作用**：成长记录「异动记录」列表。正式协议未出；占位路径与 PC 假接口一致
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

- **作用**：成长记录「企业内任职记录」列表。正式协议未出；占位路径与 PC 假接口一致
- **URL**: `POST /dthr-employee/v4/staff-growth/position-list`
- **入参**：`staffId` 必填
- **返回 body**：`{ records, total }`

| 字段          | 类型   | 必填 | 说明                     |
| ------------- | ------ | ---- | ------------------------ |
| id            | String | 否   | 记录 id                  |
| startDate     | String | 否   | 任职开始日期             |
| endDate       | String | 否   | 任职结束日期，空表示至今 |
| positionType  | String | 否   | 任职类型                 |
| department    | String | 否   | 任职部门                 |
| position      | String | 否   | 任职职位                 |
| duty          | String | 否   | 任职职务                 |
| rank          | String | 否   | 任职职级                 |
| changeReason  | String | 否   | 任职变动原因             |
| source        | String | 否   | 数据来源                 |
| operator      | String | 否   | 操作人                   |
| operationTime | String | 否   | 操作时间                 |

---

## 【假接口】员工成本中心

- **作用**：成本中心详情；`displayType`：`0` 比例 / `1` 金额。正式协议未出；占位路径与 PC 假接口一致
- **URL**: `POST /dthr-employee/v4/staff-cost-center/detail`
- **入参**：`staffId` 必填
- **返回 body**

| 字段        | 类型   | 必填 | 说明               |
| ----------- | ------ | ---- | ------------------ |
| displayType | Number | 是   | `0` 比例，`1` 金额 |
| ratioTotal  | String | 否   | 总比例文案         |
| amountTotal | String | 否   | 总金额文案         |
| ratioRows   | Array  | 否   | 按比例分摊         |
| amountRows  | Array  | 否   | 按金额分摊         |

ratioRows[] / amountRows[]

| 字段            | 类型   | 说明               |
| --------------- | ------ | ------------------ |
| costCenterName  | String | 成本中心           |
| costProjectName | String | 成本项目（按金额） |
| value           | String | 分摊比例或金额     |

---

## 【假接口】附件

- **作用**：附件 Tab（花名册附件 / 入职附件）。正式协议未出；占位路径与 PC 假接口一致
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

| 字段        | 类型   | 说明             |
| ----------- | ------ | ---------------- |
| groupCode   | String | 分组编码         |
| groupName   | String | 分组名称         |
| displayType | String | `image` / `file` |
| files       | Array  | 文件列表         |

files[]

| 字段     | 类型   | 说明     |
| -------- | ------ | -------- |
| id       | String | 文件主键 |
| name     | String | 文件名   |
| url      | String | 文件地址 |
| thumbUrl | String | 缩略图   |
