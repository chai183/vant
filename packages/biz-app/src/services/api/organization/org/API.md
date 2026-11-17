# 组织（花名册）- 接口文档

服务前缀：`/dthr-organization/v4`

---

## 组织完整树

- **作用**：花名册部门树。`mode` 不传才能拿到 `onDutyCount` / `onDutyTotalCount`。
- **URL**: `POST /dthr-organization/v4/org-organization/tree`
- **入参**

| 字段   | 类型   | 必填 | 说明                        |
| ------ | ------ | ---- | --------------------------- |
| mode   | null   | 否   | 固定传 `null`，拿完整树人数 |
| status | Number | 否   | 固定传 `1`，只取启用部门    |

---

## 按部门查询人员

- **作用**：根据部门 id 查询该部门的人。花名册进入某个部门后调用。不分页。
- **URL**: `POST /dthr-organization/v4/org-organization/page-query-staff`
- **入参**

| 字段  | 类型   | 必填 | 说明                                  |
| ----- | ------ | ---- | ------------------------------------- |
| orgId | String | 是   | 部门 id。未分组员工约定传 `UNGROUPED` |

- **返回 body**：`{ records, total }`

records[] 使用花名册列表字段：

| 字段       | 类型    | 说明               |
| ---------- | ------- | ------------------ |
| id         | String  | 员工 id            |
| name       | String  | 姓名               |
| staffNo    | String  | 工号               |
| phone      | String  | 手机号             |
| orgId      | String  | 所属部门 id        |
| orgName    | String  | 所属部门名称       |
| avatar     | String  | 头像               |
| concurrent | Boolean | 在当前部门是否兼任 |
