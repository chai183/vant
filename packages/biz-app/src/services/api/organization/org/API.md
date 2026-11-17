# 组织（花名册）- 接口文档

服务前缀：`/dthr-organization/v4`

## 真接口

| 接口 | Method | URL | 来源 |
| --- | --- | --- | --- |
| 组织完整树 | POST | `/dthr-organization/v4/org-organization/tree` | 同步pc |
| 按部门查询人员 | POST | `/dthr-organization/v4/org-organization/page-query-staff` | 同步pc |

## 假接口

无。

统一响应：`{ body, errorCode, errorMsg }`，成功 `errorCode` 为 `null` 或 `000000`。

---

## 组织完整树

- **作用**：花名册部门树。`mode` 不传才能拿到 `onDutyCount` / `onDutyTotalCount`
- **URL**: `POST /dthr-organization/v4/org-organization/tree`
- **入参**（对齐 PC `TreeParam`）

| 字段   | 类型   | 必填 | 说明                        |
| ------ | ------ | ---- | --------------------------- |
| mode   | null   | 否   | 固定传 `null`，拿完整树人数 |
| status | Number | 否   | 固定传 `1`，只取启用部门    |

- **返回 body**：组织节点数组

| 字段             | 类型            | 说明                                   |
| ---------------- | --------------- | -------------------------------------- |
| id               | String          | 部门 id                                |
| orgName          | String          | 部门名称                               |
| parentOrgId      | String          | 上级部门 id                            |
| status           | String / Number | `0` 停用，其余启用；停用节点不进花名册 |
| onDutyCount      | Number          | 直属在职人数                           |
| onDutyTotalCount | Number          | 含下级在职总人数                       |
| childrenOrgs     | Array           | 子部门                                 |

页面适配为 `RosterOrgNode`：`name ← orgName`，`directCount ← onDutyCount`，`totalCount ← onDutyTotalCount`。

---

## 按部门查询人员

- **作用**：查询指定组织直属在职员工。对齐 PC `getStaffDetailList`
- **URL**: `POST /dthr-organization/v4/org-organization/page-query-staff`
- **入参**（对齐 PC `StaffDetailListParam`）

| 字段      | 类型   | 必填 | 说明                                  |
| --------- | ------ | ---- | ------------------------------------- |
| orgId     | String | 是   | 部门 id。未分组员工约定传 `UNGROUPED` |
| queryType | String | 是   | 花名册固定 `DIRECT`（直属）           |
| pageNum   | Number | 是   | 花名册固定 `1`                        |
| pageSize  | Number | 是   | 花名册一次拉全量，固定 `9999`         |
| staffName | String | 否   | 姓名，花名册当前不传                  |
| mobileNo  | String | 否   | 手机号，花名册当前不传                |

- **返回 body**（对齐 PC `OrgMemberPageRes`）

| 字段    | 类型   | 说明     |
| ------- | ------ | -------- |
| current | Number | 当前页   |
| pages   | Number | 总页数   |
| size    | Number | 每页条数 |
| total   | Number | 总记录数 |
| records | Array  | 员工列表 |

records[]（对齐 PC `OrgStaffDetailVO`）

| 字段                         | 类型            | 说明             |
| ---------------------------- | --------------- | ---------------- |
| id                           | String          | 员工 id          |
| staffName                    | String          | 姓名             |
| workNumber                   | String          | 工号             |
| mobileNo                     | String          | 手机号           |
| departmentId                 | String          | 所属部门 id      |
| departmentName               | String          | 所属部门名称     |
| staffImageId                 | String          | 头像 id          |
| assignDeptIds                | String[]        | 兼职部门 id 列表 |
| chargeDeptIds                | String[]        | 负责部门 id 列表 |
| positionName                 | String          | 职位名称         |
| jobTitleName                 | String          | 职务名称         |
| positionLevelName            | String          | 职级             |
| staffStatus                  | String          | 员工状态         |
| staffType                    | String          | 员工类型         |
| sex                          | String          | 性别             |
| idCardType / idCardNo        | String          | 证件类型 / 号码  |
| corporationId                | String          | 公司 id          |
| companySiteName              | String          | 工作地点         |
| enrollDate / enrollWorkYears | String / Number | 入职日期 / 工龄  |
| startDate / endDate          | String          | 开始 / 结束日期  |

页面适配为 `RosterStaff`：

字段转换仅在组织接口的 `adaptDeptStaffPage` 中执行，不与搜索接口混用；搜索接口仍按自身的 `name/staffNo/avatar/phone/orgId/orgName` 契约取值。

| 页面字段   | 来源                                                    |
| ---------- | ------------------------------------------------------- |
| name       | staffName                                               |
| staffNo    | workNumber                                              |
| phone      | mobileNo                                                |
| orgId      | departmentId                                            |
| orgName    | departmentName                                          |
| avatar     | staffImageId                                            |
| concurrent | 当前部门在 `assignDeptIds` 中，或本部门人员另有兼职部门 |
