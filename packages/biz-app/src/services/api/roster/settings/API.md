# 移动端花名册设置 - 接口文档

页面：`/roster/settings`，由花名册右上角的部门联系人设置入口进入。

## 已选配置（复用缓存）

`GET /dthr-base/v4/system-config/list?type=appTeamAuthSelected`

| 入参 | 类型   | 必填 | 说明                         |
| ---- | ------ | ---- | ---------------------------- |
| type | string | 是   | 固定为 `appTeamAuthSelected` |

复用 `useRosterStore.loadTeamAuth()`，不另发一份已选请求。同一响应分别适配为 `selectedList`（已有展示树）和 `settingsSelectedList`（保留设置编码的配置树）。已有缓存时直接回显；保存后 `loadTeamAuth(true)` 强制刷新，且不会复用保存前的在途请求。

返回 `body` 支持信息集数组、`{ data: 信息集数组 }`、`{ setList: 信息集数组 }`。配置树层级为 `setCode → groupCode → fieldCode`，也支持信息集直挂 `fieldList`。

| 返回字段 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| id | string | 否 | PC 配置节点主键；缺失时沿用对应配置编码 |
| setCode / groupCode / fieldCode | string | 对应层级是 | 信息集、分组和字段的设置编码，提交时原样使用 |
| setName / groupName / fieldName | string | 否 | 对应节点显示名称 |
| sort | number | 否 | 同级顺序 |
| groupList | array | 否 | 信息集下的分组 |
| fieldList | array | 否 | 信息集或分组下的字段 |
| systemConfig.builtin | boolean | 否 | **仅已选最深层字段严格等于 `true` 时固定不可取消**，不继承父级标记，不按字段名称判断 |

设置选择使用配置编码及所属信息集、分组路径，不使用 `columnName`、人员字段名、详情页的 `fieldMapping` 或授权转换器。信息集和分组本身没有下级时可整体选择；有下级时移除最后一个字段会移除空父节点，避免扩大授权。

## 全量可选配置

`GET /dthr-base/v4/system-config/list?type=appTeamAuth`

| 入参 | 类型   | 必填 | 说明                                   |
| ---- | ------ | ---- | -------------------------------------- |
| type | string | 是   | 固定为 `appTeamAuth`，返回全量可选配置 |

已与后端确认继续使用此接口，后端将 `appTeamAuth` 调整为返回完整选项。返回沿用上述信息集、分组和字段结构，由设置适配保留配置编码。开发环境由现有 `system-config/list` Mock 按 `type` 返回全量或已选数据，不再保留独立临时地址。全量接口上的 `builtin` 不决定固定项。

## 基础开关（保存时原样携带）

`GET /dthr-employee/v4/corp/config/query-team-auth`，无入参。

| 返回字段 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| isAllowDepartmentManagerView | boolean | 是 | 是否允许部门负责人查看，移动端设置页不编辑此开关 |

全量、已选、基础开关任一查询失败，页面显示失败和重试入口，不允许用失败兜底值提交。

## 保存（已从 PC 核实）

`POST /dthr-base/v4/system-config/team-save`

核实来源：参考仓库 `E:/工作_记录/nbcb/digital-workforce` 的 `src/services/api/employee/settings/mobile-roster-setting/index.ts` 中 `saveTeamAuthConfigApi`、同目录 `entity.ts` 中 `toTeamAuthSaveSource`，以及 `src/pages/employee/settings/mobile-roster-setting/components/TeamAuthPanel.vue` 的保存调用。

| 请求体字段 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| isAllowDepartmentManagerView | boolean | 是 | 查询得到的原值，`false` 也原样提交 |
| setList | array | 是 | 当前完整已选信息集树，可为空 |
| setList[].id | string | 否 | 原节点 ID |
| setList[].setCode | string | 是 | 信息集配置编码 |
| setList[].setName | string | 否 | 信息集名称 |
| setList[].sort | number | 否 | 按已选顺序从 1 开始 |
| setList[].groupList | array | 否 | 已选分组 |
| groupList[].id / groupName / sort | string / string / number | 否 | 分组 ID、名称及排序 |
| groupList[].groupCode | string | 是 | 分组配置编码 |
| fieldList | array | 否 | 信息集或分组下已选字段 |
| fieldList[].id / fieldName / sort | string / string / number | 否 | 字段 ID、名称及排序 |
| fieldList[].fieldCode | string | 是 | 设置字段编码，不能用 `columnName` 替换 |

按照 PC 保存转换只提交上述信息集、分组、字段数据，不附加个人授权、审批、展示映射等配置。已有已选顺序保留，新选项追加；分组和字段排序沿用原 `sort`，缺失时从 1 开始。

统一响应为 `{ body, errorCode, errorMsg }`，成功码是 `null` 或 `000000`。PC 保存接口声明 `body: null`；若响应包含 boolean 则保留原值，`false` 不提示成功。失败保留草稿；成功后刷新共享已选缓存再提示“保存成功”并退出。若提交成功但刷新失败，明确提示并允许只重试刷新，不重复提交。

## 重置与开发验证

- 重置恢复本次成功进入页面时的信息集、分组和字段已选快照，不调用恢复默认接口，也不覆盖 Store。
- 已选返回整个信息集或分组时，按 PC 的父节点勾选行为回显其全部子字段；交互展开不改变原始快照，重置后仍提交进入时的结构。
- 全选覆盖所有信息集；取消全选保留固定字段和必要父节点，半选状态和计数随草稿变化。
- 开发 Mock 在内存中保存提交结果，已选接口回读同一状态，同时保留字段 `columnName` 和原固定标记供现有花名册展示。重启 Mock 服务恢复初始样本。
- 回归测试：`tests/roster-settings.test.ts`；执行 `node_modules/.bin/vitest.CMD run tests/roster-settings.test.ts`，TS 检查执行 `node_modules/.bin/vue-tsc.CMD --noEmit`。
