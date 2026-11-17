# 本人员工档案 - 接口文档

路由：`/#/employee-archive/:id?` 或 `/#/employee-archive?id=员工ID`。`id` 即 `staffId`。

## 真接口

| 接口 | Method | URL | 来源 |
| --- | --- | --- | --- |
| 信息集列表 | GET | `/dthr-employee/v4/staff-info-field/roster-detail-set/get` | 同步pc |
| 信息集元数据 | GET | `/dthr-employee/v4/staff-info-field/roster-display-form/get` | 同步pc |
| 团队已选 | GET | `/dthr-base/v4/system-config/list?type=appTeamAuthSelected` | 同步pc |
| 个人授权 | GET | `/dthr-base/v4/system-config/list?type=appPersonalAuth` | 同步pc |
| 字段值详情 | POST | 各信息集花名册详情接口 | 同步pc |
| 基础信息保存 | POST | `/dthr-employee/v4/staff-basic/edit` | 同步pc |
| 教育经历保存 | POST | `/dthr-employee/v4/staff-education/edit` | 同步pc |
| 工作经历保存 | POST | `/dthr-employee/v4/staff-work-experience/edit` | 同步pc |
| 家庭成员保存 | POST | `/dthr-employee/v4/staff-family/edit` | 同步pc |
| 员工证书保存 | POST | `/dthr-employee/v4/staff-certificate/edit` | 同步pc |
| 绩效档案保存 | POST | `/dthr-employee/v4/staff-performance/edit` | 同步pc |
| 公司内兼任保存 | POST | `/dthr-employee/v4/staff-concurrent-position/edit` | 同步pc |
| 福利保存 | POST | `/dthr-employee/v4/staff-benefit-info/edit` | 同步pc |
| 薪资保存 | POST | `/dthr-employee/v4/staff-salary-tax-info/edit` | 同步pc |
| 个税申报保存 | POST | `/dthr-employee/v4/staff-tax-info/edit` | 同步pc |
| 直属领导保存 | POST | `/dthr-employee/v4/staff-report/edit` | 同步pc |
| 自定义信息集保存 | POST | `/dthr-employee/v4/archive/info/edit` | 同步pc |
| 文件上传 | POST | `/dthr-file/v4/api/file/upload` | 同步pc |
| 文件链接 | GET | `/dthr-file/v4/api/file/{id}/url` | 同步pc |

详情查询路径见 [花名册接口文档](../employee/roster/API.md)。  
文件上传详见 [common/file/API.md](../common/file/API.md)。

## 假接口

| 接口         | Method | URL                            | 来源       |
| ------------ | ------ | ------------------------------ | ---------- |
| 档案审批状态 | GET    | `/mock/employee-archive/state` | mock假数据 |

统一响应：`{ body, errorCode, errorMsg }`，成功 `errorCode` 为 `null` 或 `000000`。

---

## 信息集列表

- **作用**：档案页签；复用花名册并按团队已选裁剪
- **URL**: `GET /dthr-employee/v4/staff-info-field/roster-detail-set/get`
- **入参**：无
- **返回 body**：信息集数组（`setCode` / `setName` / `builtin`）

---

## 信息集元数据

- **作用**：当前信息集分组字段；保留编辑用类型配置
- **URL**: `GET /dthr-employee/v4/staff-info-field/roster-display-form/get`
- **入参**

| 字段    | 类型   | 必填 | 说明       |
| ------- | ------ | ---- | ---------- |
| setCode | String | 是   | 信息集编码 |

- **返回 body**：`tab > group > field`，含 `fieldType` / `required` / `options` / `typeConfigJson` 等

---

## 团队已选

- **作用**：只读可见范围；复用花名册 Store 缓存
- **URL**: `GET /dthr-base/v4/system-config/list`
- **入参**

| 字段 | 类型   | 必填 | 说明                       |
| ---- | ------ | ---- | -------------------------- |
| type | String | 是   | 固定 `appTeamAuthSelected` |

---

## 个人授权

- **作用**：编辑权限（隐藏 / 仅显示 / 可编辑 / 是否审批）；不调用 `person-save`
- **URL**: `GET /dthr-base/v4/system-config/list`
- **入参**

| 字段 | 类型   | 必填 | 说明                   |
| ---- | ------ | ---- | ---------------------- |
| type | String | 是   | 固定 `appPersonalAuth` |

- **返回 body**：`setCode → groupList → fieldList`，或 `{ data }` / `{ setList }`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| setCode | String | 是 | 信息集编码 |
| groupCode | String | 分组字段是 | 所属分组 |
| columnName | String | 推荐 | 花名册真实字段名 |
| fieldCode | String | 字段是 | 配置编码 |
| systemConfig.authType / auth | String | 是 | `hide`/`hidden`、`readonly`/`display`、`editable` |
| systemConfig.editable | Boolean | 否 | `false` 时不可编辑 |
| systemConfig.isApproval | Boolean | 可编辑字段是 | `true` 需 HR 审批 |

---

## 字段值详情

- **作用**：当前信息集已生效数据
- **URL / 入参**：与花名册详情相同；`staffId` 必填，自定义另传 `setCode`
- **说明**：保留记录 `id`、分组 ID、`customFields`，供保存回传

---

## 本人保存

- **作用**：按信息集独立提交；复用 PC 花名册编辑接口
- **Method**: `POST`
- **路径与专用字段**

| setCode | URL | 专用字段 |
| --- | --- | --- |
| tab_staff_info | `/dthr-employee/v4/staff-basic/edit` | `staffBasicInfo`；`staffAccountInfo` 数组或 `null` |
| tab_staff_education | `/dthr-employee/v4/staff-education/edit` | `educationList`；`forceSave: true` |
| tab_staff_job_history | `/dthr-employee/v4/staff-work-experience/edit` | `workExperienceList` |
| tab_staff_family_member | `/dthr-employee/v4/staff-family/edit` | `familyList` |
| tab_staff_certificate | `/dthr-employee/v4/staff-certificate/edit` | `certificateList` |
| tab_staff_performance | `/dthr-employee/v4/staff-performance/edit` | `performanceList` |
| tab_staff_internal_concurrent | `/dthr-employee/v4/staff-concurrent-position/edit` | `concurrentPositionList` |
| tab_staff_benefit | `/dthr-employee/v4/staff-benefit-info/edit` | `staffBenefitInfo` |
| tab_staff_salary | `/dthr-employee/v4/staff-salary-tax-info/edit` | `staffSalaryTaxInfo` |
| tab_staff_subset_ptd | `/dthr-employee/v4/staff-tax-info/edit` | `staffTaxInfo` |
| dthr_staff_reporting_line | `/dthr-employee/v4/staff-report/edit` | `reportingLine` |
| 自定义 | `/dthr-employee/v4/archive/info/edit` | `setCode`、`list` |

- **公共入参**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| staffId | String | 是 | 本人员工 ID |
| 对应专用对象/数组 | Object / Array | 是 | 只含当前信息集 |
| reason | String | 本次包含需审批变更时 | 申请原因；去除首尾空白后提交到请求最外层，与 `staffId` 同级，不进入专用对象、记录或 `customFields` |
| 记录 id | String | 是 | 已有记录保留；新增传 `''` |
| customFields | Object | 有自定义字段时 | `systemFlag === 0` 的字段 |
| forceSave | Boolean | 教育经历是 | 固定 `true` |
| regularFlag | Number | 基础信息有效时 | 同级仅 `1`/`2` |
| staffAccountInfo | Array / null | 基础信息是 | 未改账号传 `null` |
| setCode | String | 自定义是 | 顶层与 list 每行都带 |

- **返回 body**：Boolean；`true` 成功，`false` 未保存

IMAGE/IMG/FILE 只传文件 ID 字符串，多张逗号拼接。

### 提示条与提交流程

- 审批说明复用可关闭的 NoticeBar，仅编辑态且当前存在可编辑的需审批字段时展示；基础信息提示“审”标记字段的审批规则，其余信息集提示页面信息审批规则。
- 基础信息存在待审批申请时，点击编辑先提醒，确认后只允许修改无需审批字段，所有需审批字段灰显；其余信息集存在待审批申请时，整个信息集不能进入编辑。
- 底部为“取消 / 提交”。取消直接退出编辑；切换信息集、路由离开仍按未保存确认处理。
- 提交先判断实际字段值是否变化；没有改动或改后还原时仅提示“无信息变更，无需提交”，不校验、不弹确认、不发送请求。数字与控件文本、选择项标签、同一文件 ID 的回显变化不算修改；新增记录算变更。
- 有变更后校验实际表单并定位首个错误。
- 校验通过后打开二次确认。基础信息按实际修改区分审批后生效字段和直接生效字段，其余信息集按审批规则提示生效时机。
- 有需审批修改时，用 Dialog 内置输入框在说明上方填写申请原因，错误显示在输入框下方，空白不能提交；只有直接生效修改时不要求原因，也不发送 `reason`。
- 关闭或取消二次确认保留档案草稿；确认后使用当前信息集已核实的保存接口。失败保留编辑内容，成功强制回读当前信息集并返回只读态。
- 已提交但回读失败时，只重试回读，不重复提交，也不再次索要申请原因。

---

## 【假接口】档案审批状态

- **作用**：联调待审/已生效状态；正式协议未出
- **URL**: `GET /mock/employee-archive/state`
- **入参**

| 字段    | 类型   | 必填 | 说明        |
| ------- | ------ | ---- | ----------- |
| staffId | String | 是   | 本人员工 ID |
| setCode | String | 是   | 当前信息集  |

- **返回 body**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| records | Array / null | `null` 表示尚未 Mock 提交，继续用详情；数组为已生效记录 |
| pending | Array | 待审变更 `{ recordId, changes: [{ groupCode, columnName, value }], reason? }[]`；开发样本保留申请原因，正式状态协议待后端提供 |
