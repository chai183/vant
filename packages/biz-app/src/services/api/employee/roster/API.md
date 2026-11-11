# 花名册（移动端）- 接口文档

服务前缀：`/dthr-employee/v4`

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

## 全量信息集字段

- **作用**：进入详情时不传 `setCode`，一次拿到所有信息集的分组和字段
- **URL**: `/dthr-employee/v4/staff-info-field/roster-display-form/get`
- **Method**: `GET`
- **入参**：无（全量）
- **返回 body**：三级树 `tab > group > field`

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

正式接口未出，PC 端暂无，先走占位 Mock。

- **作用**：员工成本中心按比例 / 按金额展示
- **URL**: `POST /dthr-employee/v4/staff-cost-center/detail`
- **入参**：`staffId` 必填
- **返回 body**

| 字段        | 类型   | 必填 | 说明       |
| ----------- | ------ | ---- | ---------- |
| ratioTotal  | String | 否   | 总比例文案 |
| amountTotal | String | 否   | 总金额文案 |
| ratioRows   | Array  | 否   | 按比例分摊 |
| amountRows  | Array  | 否   | 按金额分摊 |

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
