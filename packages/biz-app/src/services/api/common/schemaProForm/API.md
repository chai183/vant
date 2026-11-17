# 公共表单固定数据源

请求集合位于本目录 `index.ts`，控件注册位于 `SchemaProForm/dataSource.config.ts`。路径、方法和取值规则核对 PC；不使用早期职位示例地址冒充正式接口。

## 加载与缓存

- 部门、职位、职务、分类、职级、法律实体、地点、方案和人员：打开对应选择弹层才查询。
- 全量接口同数据源、同业务参数共享缓存和在途请求；搜索在返回列表中进行，不向全量接口发送伪分页参数。
- 请求失败显式显示列表错误，不缓存为成功空列表，点击重试可重新请求。
- 普通 OPTION 字典仍由 `SchemaProForm` 进入编辑时按当前字段去重预取。

## 已核实请求

以下组织接口前缀均为 `/dthr-organization/v4`。

| 数据源 | 方法与路径 | 入参 | 返参及取值 |
| --- | --- | --- | --- |
| department | POST `/org-organization/tree` | `mode=simple`、`status=1`，可被显式配置覆盖 | 树，`id` / `orgName` / `childrenOrgs`；列表保留路径 |
| position / position-enable | POST `/dthrCompanyPosition/positionList` | 无 | 数组，`id` / `positionName`；enable 仅保留 `positionState=1` |
| position（范围） | POST `/dthrCompanyPosition/positionListOrgScope` | 非空 `ids: string[]` 部门 ID | 同上；未配置部门 ids 时走全量接口 |
| job | POST `/dthrJobTitle/titleList` | 无 | 数组，`id` / `jobTitleName` |
| jobCategory | POST `/dthrJobCategory/page` | `{}` | 数组，`id` / `jobCategoryName` |
| grade | POST `/dthrGradeSystem/gradeSystemList` | `{}` | 树，`id` / `name` / `children`；仅叶子可选 |
| grade-cascade | GET `/dthrGradeSystem/gradeSystemTreeById` | `id`、`type` 必填，未选驱动项不请求 | 职位或职务关联树，归一为叶子选项 |
| legalEntity / corporation / socialSecurityOrg / providentFundOrg | POST `/corporation/page-query` | `pageNum=1`、`pageSize=9999` | `records`，`id` / `name` |
| workLocation | POST `/work-location/queryPage` | `pageNum=1`、`pageSize=9999` | `records`，`id` / `name` |
| orgUser | POST `/org-organization/mixed-tree` | `{}` | 组织人员混合树，仅人员节点可选 |
| socialSecurityPlan / providentFundPlan | POST `/dthr-employee/v4/staff-roster/benefit-list` | `{}` | `siBenefitList` / `hfBenefitList`，`id` / `name` |

统一响应为 `{ body, errorCode, errorMsg }`。选项提交原始 `value`，不能提交路径或展示文案。

## 开发 Mock

`src/mock/mockApi/common/schemaProForm` 返回 PC 同源固定样本，组织树复用现有组织 Mock。字典样本在 `src/mock/mockApi/common/dict/data.ts`，对齐花名册字段的编码和原值；仅用于开发，不作为请求失败后的兜底。

原有 `skillTags` 仍是独立开发示例，不用于档案固定字段。
