# 花名册设置 - 接口文档

页面：`/roster/settings`

## 真接口

| 接口 | Method | URL | 来源 |
| --- | --- | --- | --- |
| 已选配置 | GET | `/dthr-base/v4/system-config/list?type=appTeamAuthSelected` | 同步pc |
| 全量可选 | GET | `/dthr-base/v4/system-config/list?type=appTeamAuth` | 同步pc |
| 基础开关 | GET | `/dthr-employee/v4/corp/config/query-team-auth` | 同步pc |
| 保存 | POST | `/dthr-base/v4/system-config/team-save` | 同步pc |

## 假接口

无。

统一响应：`{ body, errorCode, errorMsg }`，成功 `errorCode` 为 `null` 或 `000000`。

---

## 已选配置

- **作用**：回显当前团队已选字段；复用 `useRosterStore.loadTeamAuth()`，不另发请求
- **URL**: `GET /dthr-base/v4/system-config/list`
- **入参**

| 字段 | 类型   | 必填 | 说明                       |
| ---- | ------ | ---- | -------------------------- |
| type | String | 是   | 固定 `appTeamAuthSelected` |

- **返回 body**：信息集数组，或 `{ data }` / `{ setList }`。同一响应适配为展示树 `body` 与配置树 `settingsList`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | String | 否 | 节点主键，缺省用配置编码 |
| setCode / setName | String | 信息集是 | 信息集编码 / 名称 |
| groupCode / groupName | String | 分组是 | 分组编码 / 名称 |
| fieldCode / fieldName | String | 字段是 | 设置字段编码 / 名称，提交原样带回 |
| sort | Number | 否 | 同级排序 |
| groupList | Array | 否 | 信息集下分组 |
| fieldList | Array | 否 | 信息集或分组下字段 |
| systemConfig.builtin | Boolean | 否 | 仅已选最深层字段为 `true` 时不可取消 |

---

## 全量可选

- **作用**：设置页可选字段树
- **URL**: `GET /dthr-base/v4/system-config/list`
- **入参**

| 字段 | 类型   | 必填 | 说明                                 |
| ---- | ------ | ---- | ------------------------------------ |
| type | String | 是   | 固定 `appTeamAuth`，返回完整可选配置 |

- **返回 body**：结构同「已选配置」。全量接口上的 `builtin` 不决定固定项

---

## 基础开关

- **作用**：保存时原样携带；移动端不编辑
- **URL**: `GET /dthr-employee/v4/corp/config/query-team-auth`
- **入参**：无
- **返回 body**

| 字段                         | 类型    | 必填 | 说明                   |
| ---------------------------- | ------- | ---- | ---------------------- |
| isAllowDepartmentManagerView | Boolean | 是   | 是否允许部门负责人查看 |

---

## 保存

- **作用**：提交当前完整已选树
- **URL**: `POST /dthr-base/v4/system-config/team-save`
- **入参**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| isAllowDepartmentManagerView | Boolean | 是 | 查询原值，`false` 也原样提交 |
| setList | Array | 是 | 已选信息集树，可为空数组 |
| setList[].id | String | 否 | 原节点 ID |
| setList[].setCode | String | 是 | 信息集配置编码 |
| setList[].setName | String | 否 | 信息集名称 |
| setList[].sort | Number | 否 | 已选顺序，从 1 起 |
| setList[].groupList | Array | 否 | 已选分组 |
| groupList[].groupCode | String | 是 | 分组配置编码 |
| groupList[].id / groupName / sort | String / String / Number | 否 | 分组 ID、名称、排序 |
| fieldList | Array | 否 | 信息集或分组下已选字段 |
| fieldList[].fieldCode | String | 是 | 设置字段编码，不能用 `columnName` 替换 |
| fieldList[].id / fieldName / sort | String / String / Number | 否 | 字段 ID、名称、排序 |

- **返回 body**：`null` 或 Boolean；`false` 不视为成功
