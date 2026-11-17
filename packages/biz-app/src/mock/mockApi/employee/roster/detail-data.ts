/** 与 PC 花名册详情 Mock 同步（2026-11-17），仅补移动端设计图需要的图片字段。 */
/** 详情页 Tab 集合 Mock：setCode 编码、setName 名称、builtin 1 系统 / 0 自定义。 */
export const rosterDetailTabs = [
  {
    type: 'tab',
    setCode: 'tab_staff_info',
    setName: '基础信息',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_education',
    setName: '教育经历',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_job_history',
    setName: '工作经历',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_family_member',
    setName: '家庭成员',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_certificate',
    setName: '员工证书',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_performance',
    setName: '绩效档案',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'PROBATION',
    setName: '试用期管理',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_internal_concurrent',
    setName: '公司内兼任',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_benefit',
    setName: '福利',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_salary',
    setName: '薪资',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'ATTACHMENT',
    setName: '附件',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'dthr_staff_reporting_line',
    setName: '直属领导',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'GROWTH',
    setName: '成长记录',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_subset_ptd',
    setName: '个税申报',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'COST',
    setName: '员工成本中心',
    builtin: 1,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'LICENSE',
    setName: '证照管理',
    builtin: 0,
    uniqueSortFields: null,
    children: null,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_custom_region',
    setName: '地区信息',
    builtin: 0,
    uniqueSortFields: null,
    children: null,
  },
];

/** 是否字段默认选项：是=1 / 否=0。 */
const YES_NO_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

/** 字段节点：对齐正式接口（含 fieldMapping / length / required / systemFlag）。 */
function field(
  fieldCode: string,
  fieldName: string,
  fieldType = 'TEXT',
  extra: Record<string, unknown> = {},
) {
  return {
    type: 'field',
    fieldCode,
    fieldName,
    fieldType,
    fieldMapping: '',
    dictCode: '',
    dataSourceUrl: '',
    /** 选项层级：null 普通下拉；1 省；2 省市；3 省市区 */
    level: null,
    /** 上级字段编码；null 表示不挂上级 */
    parentColumnName: null,
    required: 0,
    length: 0,
    fixed: false,
    orderFlag: false,
    /** 是否系统字段：1 是 / 0 否 */
    systemFlag: 1,
    /** 是否高级字段：1 是 / 0 否 */
    advancedFlag: 0,
    ...extra,
  };
}

/** 是否类字段（BOOLEAN + 是/否选项）。 */
function yesNoField(
  fieldCode: string,
  fieldName: string,
  extra: Record<string, unknown> = {},
) {
  return field(fieldCode, fieldName, 'BOOLEAN', {
    options: YES_NO_OPTIONS,
    ...extra,
  });
}

/** 分组节点：children 挂字段。 */
function group(
  groupCode: string,
  groupName: string,
  children: ReturnType<typeof field>[],
  sort = 1,
  builtin = 1,
) {
  return {
    type: 'group',
    groupCode,
    groupName,
    sort,
    /** 是否系统分组：1 是 / 0 否 */
    builtin,
    children,
  };
}

/** 动态列按信息集存全量（供 Mock 按 setCode 取当前页）。接口字段 setCode / setName。 */
export const rosterDetailFormColumns = [
  {
    type: 'tab',
    setCode: 'tab_staff_info',
    setName: '基础信息',
    builtin: 1,
    children: [
      group(
        'tab_staff_info.default',
        '默认分组',
        [
          field('name', '姓名', 'TEXT', { sort: 1, required: 1, length: 80 }),
          field('englishName', '英文姓名', 'TEXT', { sort: 2, length: 128 }),
          field('staffStatus', '员工状态', 'OPTION', {
            sort: 3,
            dictCode: 'GROUP.Enum.StaffStatus',
            fieldMapping: 'staffStatusName',
          }),
          field('orgId', '部门', 'OPTION', {
            sort: 4,
            fieldMapping: 'orgName',
            required: 1,
          }),
          field('positionId', '职位', 'OPTION', {
            sort: 5,
            fieldMapping: 'positionName',
            required: 1,
          }),
          field('positionCategoryId', '职务分类', 'OPTION', {
            sort: 6,
            fieldMapping: 'positionCategoryName',
          }),
          field('positionTitleId', '职务', 'OPTION', {
            sort: 7,
            fieldMapping: 'positionTitleName',
          }),
          field('jobLevelId', '职级', 'OPTION', {
            sort: 8,
            fieldMapping: 'jobLevelName',
          }),
          field('staffNo', '工号', 'TEXT', { sort: 9, length: 32 }),
          field('idCardType', '证件类型', 'OPTION', {
            sort: 10,
            required: 1,
            dictCode: 'GROUP.Enum.IdCardType',
            fieldMapping: 'idCardTypeName',
          }),
          field('idCardNo', '证件号', 'TEXT', {
            sort: 11,
            required: 1,
            length: 30,
          }),
          field('phone', '手机号码', 'TEXT', {
            sort: 12,
            required: 1,
            length: 15,
          }),
          field('contractType', '合同类型', 'OPTION', {
            sort: 13,
            dictCode: 'GROUP.Enum.ContractType',
            fieldMapping: 'contractTypeName',
          }),
          field('staffType', '员工类型', 'OPTION', {
            sort: 14,
            required: 1,
            dictCode: 'GROUP.Enum.StaffType',
            fieldMapping: 'staffTypeName',
          }),
          field('hireDate', '入职日期', 'DATE', {
            sort: 15,
            required: 1,
            orderFlag: true,
          }),
          field('historicalYears', '历史工龄(年)', 'DOUBLE', {
            sort: 16,
            orderFlag: true,
          }),
          field('contractCompanyId', '合同公司', 'OPTION', {
            sort: 17,
            fieldMapping: 'contractCompanyName',
          }),
          field('gender', '性别', 'OPTION', {
            sort: 18,
            dictCode: 'GROUP.Enum.SexType',
            fieldMapping: 'genderName',
          }),
          field('birthdayType', '生日类型', 'BOOLEAN', { sort: 19 }),
          field('birthDate', '出生日期', 'DATE', {
            sort: 20,
            required: 1,
            orderFlag: true,
          }),
          field('workLocation', '工作地点', 'OPTION', {
            sort: 21,
            fieldMapping: 'workLocationName',
            length: 100,
          }),
          field('address', '联系地址', 'TEXT', { sort: 22, length: 255 }),
          field('age', '年龄', 'CALCULATE', { sort: 23 }),
          field('country', '国家', 'OPTION', {
            sort: 24,
            dictCode: 'GROUP.Enum.Country',
            fieldMapping: 'countryName',
          }),
          field('lastName', '姓', 'TEXT', { sort: 25, length: 50 }),
          field('firstName', '名', 'TEXT', { sort: 26, length: 50 }),
          field('hireYearEmploymentType', '入职年度就业情形', 'OPTION', {
            sort: 27,
            dictCode: 'GROUP.Enum.EnrollmentSituation',
            fieldMapping: 'hireYearEmploymentTypeName',
          }),
          field('workHoursSystem', '工时制度', 'OPTION', {
            sort: 28,
            dictCode: 'GROUP.Enum.WorkingHoursSystem',
            fieldMapping: 'workHoursSystemName',
          }),
          field('firstWorkDate', '首次参加工作日期', 'DATE', {
            sort: 29,
            orderFlag: true,
          }),
          field('validityStartDate', '有效期开始日期', 'DATE', {
            sort: 30,
            orderFlag: true,
          }),
          field('validityEndDate', '有效期结束日期', 'DATE', {
            sort: 31,
            orderFlag: true,
          }),
        ],
        1,
      ),
      group(
        'tab_staff_info.contract',
        '合同信息',
        [
          field('termType', '期限类型', 'OPTION', {
            sort: 1,
            dictCode: 'GROUP.Enum.ContractTermType',
            fieldMapping: 'termTypeName',
          }),
          field('currentContractStartDate', '当前合同开始日期', 'DATE', {
            sort: 2,
            orderFlag: true,
          }),
          field('currentContractEndDate', '当前合同结束日期', 'DATE', {
            sort: 3,
            orderFlag: true,
          }),
          field('email', '工作邮箱', 'TEXT', { sort: 4, length: 128 }),
          field('workPhone', '工作电话', 'TEXT', { sort: 5, length: 64 }),
          field('probationEndDate', '试用期到期日', 'DATE', {
            sort: 6,
            orderFlag: true,
          }),
          field('probationMonths', '试用期(月)', 'INTEGER', {
            sort: 7,
            orderFlag: true,
          }),
          field('regularDate', '转正日期', 'DATE', {
            sort: 8,
            orderFlag: true,
          }),
          field('probationStatus', '试用期状态', 'OPTION', {
            sort: 9,
            dictCode: 'GROUP.Enum.ProbationStatus',
            fieldMapping: 'probationStatusName',
          }),
        ],
        2,
      ),
      group(
        'tab_staff_info.employee',
        '员工信息',
        [
          field('nickname', '花名', 'TEXT', {
            sort: 1,
            length: 80,
            advancedFlag: 1,
          }),
          field('idName', '证件姓名', 'TEXT', { sort: 2, length: 80 }),
          field('nationality', '民族', 'OPTION', {
            sort: 3,
            dictCode: 'GROUP.Enum.Nationality',
            fieldMapping: 'nationalityName',
          }),
          field('householdType', '户口类型', 'OPTION', {
            sort: 4,
            dictCode: 'GROUP.Enum.HukouType',
            fieldMapping: 'householdTypeName',
          }),
          field('householdLocation', '户口所在地', 'TEXT', {
            sort: 5,
            length: 255,
          }),
          field('ancestralHome', '籍贯', 'TEXT', { sort: 6, length: 100 }),
          field('residenceAddress', '居住地址', 'TEXT', {
            sort: 7,
            length: 255,
          }),
          field('highestEducation', '最高学历', 'OPTION', {
            sort: 8,
            dictCode: 'GROUP.Enum.DiplomaType',
            fieldMapping: 'highestEducationName',
          }),
          field('politicalStatus', '政治面貌', 'OPTION', {
            sort: 9,
            dictCode: 'GROUP.Enum.PoliticalStatus',
            fieldMapping: 'politicalStatusName',
          }),
          field('maritalStatus', '婚姻状况', 'OPTION', {
            sort: 10,
            dictCode: 'GROUP.Enum.MarryStatus',
            fieldMapping: 'maritalStatusName',
          }),
          field('bloodType', '血型', 'OPTION', {
            sort: 11,
            dictCode: 'GROUP.Enum.BloodType',
            fieldMapping: 'bloodTypeName',
          }),
          field('emergencyContactName', '紧急联系人姓名', 'TEXT', {
            sort: 12,
            length: 80,
          }),
          field('emergencyContactPhone', '紧急联系人电话', 'TEXT', {
            sort: 13,
            length: 18,
          }),
          field('spouseName', '配偶姓名', 'TEXT', { sort: 14, length: 80 }),
          field('childName', '孩子姓名', 'TEXT', { sort: 15, length: 80 }),
          field('qq', 'QQ', 'TEXT', { sort: 16, length: 40 }),
          field('wechat', '微信', 'TEXT', { sort: 17, length: 80 }),
          field('personalEmail', '个人邮箱', 'TEXT', { sort: 18, length: 128 }),
          field('remarks', '备注', 'LONG_TEXT', {
            sort: 19,
            span: 24,
            length: 255,
          }),
        ],
        3,
      ),
      group(
        'tab_staff_info.bank_card1',
        '银行卡信息1',
        [
          field('bankName', '工资卡开户银行', 'OPTION', {
            sort: 1,
            dictCode: 'GROUP.Enum.BankName',
            fieldMapping: 'bankNameName',
          }),
          field('branchName', '工资卡分支行', 'TEXT', { sort: 2, length: 100 }),
          field('bankAccount', '工资卡银行账号', 'TEXT', {
            sort: 3,
            length: 100,
          }),
          field('accountHolderName', '工资卡开户名', 'TEXT', {
            sort: 4,
            length: 100,
          }),
        ],
        4,
      ),
      group(
        'tab_staff_info.bank_card2',
        '银行卡信息2',
        [
          field('bankName', '工资卡开户银行', 'OPTION', {
            sort: 1,
            dictCode: 'GROUP.Enum.BankName',
            fieldMapping: 'bankNameName',
          }),
          field('branchName', '工资卡分支行', 'TEXT', { sort: 2, length: 100 }),
          field('bankAccount', '工资卡银行账号', 'TEXT', {
            sort: 3,
            length: 100,
          }),
          field('accountHolderName', '工资卡开户名', 'TEXT', {
            sort: 4,
            length: 100,
          }),
        ],
        5,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_education',
    setName: '教育经历',
    builtin: 1,
    uniqueSortFields: null,
    children: [
      group(
        'tab_staff_education.default',
        '默认分组',
        [
          field('school', '学校', 'TEXT', {
            sort: 1,
            required: 1,
            length: 80,
            operator: 'LIKE',
          }),
          field('major', '专业', 'TEXT', {
            sort: 2,
            length: 80,
            operator: 'LIKE',
          }),
          field('entryDate', '入校时间', 'DATE', {
            sort: 3,
            length: null,
            operator: 'BETWEEN',
            orderFlag: true,
          }),
          field('graduationDate', '毕业日期', 'DATE', {
            sort: 4,
            length: null,
            operator: 'BETWEEN',
            orderFlag: true,
          }),
          field('educationLevel', '学历', 'OPTION', {
            sort: 5,
            length: null,
            dictCode: 'GROUP.Enum.DiplomaType',
            fieldMapping: 'educationLevelName',
            operator: 'EQ',
          }),
          field('hasDegree', '是否取得学位', 'BOOLEAN', {
            sort: 6,
            length: null,
            operator: 'EQ',
          }),
        ],
        1,
      ),
      group(
        'c9f28d8ed01947548b8a305c0f3d4ad2',
        '教育经历分组1',
        [
          field('e7f27f8c689c47329a15d5d9f8108890', '字段1有市区', 'OPTION', {
            sort: 1,
            length: null,
            fieldMapping: '99fc6401d5674009282d82ea27da1bc52',
            dictCode: 'GROUP.ProvinceCityRegion.Enum',
            level: 3,
            operator: 'EQ',
            systemFlag: 0,
          }),
          field('71f89d218cf94ae4aa2d453e7fb365cb', '字段2整数', 'INTEGER', {
            sort: 2,
            length: null,
            operator: 'EQ',
            orderFlag: true,
            systemFlag: 0,
            defaultValue: '1',
            minimumValue: '0',
            maximumValue: '100',
          }),
          field('9ca10d007c4d486f9bea5ab7288fc917', '字段3小数', 'DOUBLE', {
            sort: 3,
            length: null,
            operator: 'EQ',
            orderFlag: true,
            systemFlag: 0,
            defaultValue: '1.50',
            decimalPlaces: 2,
            minimumValue: '0',
            maximumValue: '9999.99',
          }),
        ],
        2,
        0,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_job_history',
    setName: '工作经历',
    builtin: 1,
    uniqueSortFields: null,
    children: [
      group(
        'tab_staff_job_history.default',
        '默认分组',
        [
          field('companyName', '公司名称', 'TEXT', {
            sort: 1,
            required: 1,
            length: 100,
            operator: 'LIKE',
          }),
          field('position', '担任职位', 'TEXT', {
            sort: 2,
            length: 64,
            operator: 'LIKE',
          }),
          field('startDate', '入职日期', 'DATE', {
            sort: 3,
            required: 1,
            length: null,
            operator: 'BETWEEN',
            orderFlag: true,
          }),
          field('endDate', '离职日期', 'DATE', {
            sort: 4,
            length: null,
            operator: 'BETWEEN',
            orderFlag: true,
          }),
          field('jobDescription', '职位描述', 'LONG_TEXT', {
            sort: 5,
            length: 1024,
            operator: 'LIKE',
          }),
        ],
        1,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_family_member',
    setName: '家庭成员',
    builtin: 1,
    children: [
      group(
        'tab_staff_family_member.default',
        '默认分组',
        [
          field('memberName', '成员姓名', 'TEXT', {
            sort: 1,
            required: 1,
            length: 100,
            operator: 'LIKE',
          }),
          field('relationship', '关系', 'OPTION', {
            sort: 2,
            dictCode: 'GROUP.Enum.FamilyMemberRelationEnum',
            fieldMapping: 'relationshipName',
            operator: 'EQ',
          }),
          field('birthDate', '出生日期', 'DATE', { sort: 3 }),
        ],
        1,
      ),
      group(
        'FAMILY.extra',
        '补充信息',
        [
          field('birthCertificate', '出生证明照', 'IMAGE', {
            sort: 1,
            uploadCount: 1,
            imageSizeLimit: '8',
            allowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
          }),
        ],
        2,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_certificate',
    setName: '员工证书',
    builtin: 1,
    children: [
      group(
        'tab_staff_certificate.default',
        '默认分组',
        [
          field('certificateName', '证照名称', 'TEXT', {
            sort: 1,
            required: 1,
            length: 128,
          }),
          field('certificateType', '证照类型', 'OPTION', {
            sort: 2,
            required: 1,
            dictCode: 'GROUP.Enum.CertificateType',
            fieldMapping: 'certificateTypeName',
          }),
          field('certificateNumber', '证照编号', 'TEXT', {
            sort: 3,
            required: 1,
            length: 128,
          }),
          field('issuingAuthority', '发证机构', 'TEXT', {
            sort: 4,
            length: 128,
          }),
          field('issueDate', '发证日期', 'DATE', {
            sort: 5,
            required: 1,
            orderFlag: true,
          }),
          field('recordDate', '备案日期', 'DATE', { sort: 6, orderFlag: true }),
          field('reminderDate', '提醒日期', 'DATE', {
            sort: 7,
            orderFlag: true,
          }),
          field('expiryDate', '到期日期', 'DATE', { sort: 8, orderFlag: true }),
          field('major', '专业', 'TEXT', { sort: 9, length: 40 }),
          field('level', '级别', 'TEXT', { sort: 10, length: 40 }),
          field('description', '描述', 'LONG_TEXT', { sort: 11, length: 1024 }),
        ],
        1,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_performance',
    setName: '绩效档案',
    builtin: 1,
    children: [
      group(
        'PERFORMANCE.default',
        '默认分组',
        [
          field('performanceYear', '考核所属年份', 'TEXT', { sort: 1 }),
          field('performanceQuarter', '绩效季度', 'TEXT', { sort: 2 }),
          field('performanceLevel', '绩效等级', 'TEXT', { sort: 3 }),
          field('performanceScore', '绩效评分', 'TEXT', { sort: 4 }),
          field('appraiser', '考核人', 'TEXT', { sort: 5 }),
          field('appraisalDate', '考核日期', 'DATE', { sort: 6 }),
        ],
        1,
      ),
      group(
        'PERFORMANCE.extra',
        '补充信息',
        [
          field('remarks', '备注', 'LONG_TEXT', {
            sort: 1,
            span: 24,
            length: 500,
          }),
          yesNoField('defaultFlag', '是否默认', { sort: 2 }),
        ],
        2,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_internal_concurrent',
    setName: '公司内兼任',
    builtin: 1,
    children: [
      group(
        'tab_staff_internal_concurrent.default',
        '默认分组',
        [
          field('concurrentOrg', '兼任部门', 'OPTION', {
            sort: 1,
            required: 1,
            operator: 'EQ',
          }),
          field('concurrentPosition', '兼任职位', 'JOBCATEGORY', {
            sort: 2,
            length: 100,
            operator: 'EQ',
          }),
          field('startDate', '开始日期', 'DATE', {
            sort: 3,
            orderFlag: true,
            operator: 'BETWEEN',
          }),
          field('endDate', '结束日期', 'DATE', {
            sort: 4,
            orderFlag: true,
            operator: 'BETWEEN',
          }),
          field('remarks', '备注', 'LONG_TEXT', {
            sort: 5,
            length: 200,
            operator: 'LIKE',
          }),
        ],
        1,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_benefit',
    setName: '福利',
    builtin: 1,
    children: [
      group(
        'tab_staff_benefit.social_insurance',
        '社保',
        [
          field('socialSecurityPlanName', '社保方案名称', 'OPTION', {
            sort: 1,
            length: 100,
          }),
          field('socialSecurityRegion', '社保缴纳地区', 'TEXT', {
            sort: 2,
            length: 100,
          }),
          field('socialSecurityOrg', '社保缴纳组织', 'OPTION', {
            sort: 3,
            length: 100,
          }),
          field('socialSecurityBase', '社保申报基数', 'DOUBLE', {
            sort: 4,
            orderFlag: true,
          }),
          field('socialSecurityStartDate', '当前社保生效年月', 'DATE', {
            sort: 5,
            orderFlag: true,
          }),
          field('socialSecurityEndDate', '当前社保失效年月', 'DATE', {
            sort: 6,
            orderFlag: true,
          }),
          field('socialSecurityAccount', '社保账号', 'TEXT', {
            sort: 7,
            length: 200,
          }),
        ],
        1,
      ),
      group(
        'tab_staff_benefit.housing_fund',
        '公积金',
        [
          field('providentFundPlanName', '公积金方案名称', 'OPTION', {
            sort: 1,
            length: 100,
          }),
          field('providentFundRegion', '公积金缴纳地区', 'TEXT', {
            sort: 2,
            length: 100,
          }),
          field('providentFundOrg', '公积金缴纳组织', 'OPTION', {
            sort: 3,
            length: 100,
          }),
          field('providentFundBase', '公积金申报基数', 'DOUBLE', {
            sort: 4,
            orderFlag: true,
          }),
          field('providentFundStartDate', '当前公积金生效年月', 'DATE', {
            sort: 5,
            orderFlag: true,
          }),
          field('providentFundEndDate', '当前公积金失效年月', 'DATE', {
            sort: 6,
            orderFlag: true,
          }),
          field('providentFundAccount', '公积金账号', 'TEXT', {
            sort: 7,
            length: 200,
          }),
          field('suppFundAccount', '补充公积金账号', 'TEXT', {
            sort: 8,
            length: 200,
          }),
        ],
        2,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_salary',
    setName: '薪资',
    builtin: 1,
    children: [
      group(
        'tab_staff_salary.tax_info',
        '税务信息',
        [
          field('taxEffectiveDate', '生效日期', 'DATE', {
            sort: 1,
            required: 1,
            orderFlag: true,
          }),
          field('taxAdjustmentReason', '调整原因', 'OPTION', {
            sort: 2,
            required: 1,
            dictCode: 'GROUP.Enum.SalaryProfileChangeType',
            fieldMapping: 'taxAdjustmentReasonName',
          }),
          field('taxpayerStatus', '纳税人身份', 'TEXT', {
            sort: 3,
            required: 1,
          }),
          field('taxRegion', '纳税地区', 'OPTION', { sort: 4 }),
          field('taxExemptAmount', '当前已免税额', 'INTEGER', {
            sort: 5,
            orderFlag: true,
          }),
          field('taxWithholdingObligor', '个税扣缴义务人', 'OPTION', {
            sort: 6,
            required: 1,
          }),
        ],
        1,
      ),
      group(
        'tab_staff_salary.probation_salary',
        '试用期薪资',
        [
          field('probationEffectiveDate', '生效日期', 'DATE', {
            sort: 1,
            required: 1,
            orderFlag: true,
          }),
          field('probationAdjustmentReason', '调整原因', 'OPTION', {
            sort: 2,
            required: 1,
            dictCode: 'GROUP.Enum.SalaryProfileChangeType',
            fieldMapping: 'probationAdjustmentReasonName',
          }),
          field('probationRemarks', '备注', 'TEXT', { sort: 3, length: 100 }),
          field('probationSalaryGrade', '薪级', 'TEXT', {
            sort: 4,
            length: 100,
          }),
          field('probationSalaryId', '薪资项（元）', 'DOUBLE', {
            sort: 5,
            orderFlag: true,
          }),
        ],
        2,
      ),
      group(
        'tab_staff_salary.formal_salary',
        '正式薪资',
        [
          field('formalEffectiveDate', '生效日期', 'DATE', {
            sort: 1,
            orderFlag: true,
          }),
          field('formalAdjustmentReason', '调整原因', 'OPTION', {
            sort: 2,
            required: 1,
            dictCode: 'GROUP.Enum.SalaryProfileChangeType',
            fieldMapping: 'formalAdjustmentReasonName',
          }),
          field('formalRemarks', '备注', 'TEXT', { sort: 3, length: 100 }),
          field('formalSalaryGrade', '薪级', 'TEXT', { sort: 4, length: 100 }),
          field('formalSalaryId', '薪资项（元）', 'DOUBLE', {
            sort: 5,
            orderFlag: true,
          }),
        ],
        3,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'ATTACHMENT',
    setName: '附件',
    builtin: 1,
    children: [
      group(
        'ATTACHMENT.default',
        '附件',
        [
          field('images', '图片', 'IMAGE', {
            sort: 1,
            span: 24,
            uploadCount: 20,
            imageSizeLimit: '30',
            allowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
          }),
          field('files', '文件', 'FILE', {
            sort: 2,
            span: 24,
            uploadCount: 20,
            fileSizeLimit: '30',
            allowedFormats: [
              'pdf',
              'doc',
              'docx',
              'xls',
              'xlsx',
              'ppt',
              'pptx',
              'txt',
            ],
          }),
        ],
        1,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_subset_ptd',
    setName: '个税申报',
    builtin: 1,
    uniqueSortFields: null,
    children: [
      group(
        'tab_staff_subset_ptd.default',
        '默认分组',
        [
          field('employmentType', '任职受雇从业类型', 'OPTION', {
            sort: 1,
            required: 1,
            dictCode: 'GROUP.Enum.EmploymentType',
            fieldMapping: 'employmentTypeName',
          }),
          yesNoField('deductStandardExpense', '是否扣除减除费用', {
            sort: 2,
            required: 1,
          }),
          field('otherExplanation', '其他情况说明', 'OPTION', {
            sort: 3,
            dictCode: 'GROUP.Enum.EmploymentOtherDesc',
            fieldMapping: 'otherExplanationName',
          }),
          yesNoField('disabledFlag', '是否残疾', { sort: 4, defaultValue: 0 }),
          field('disabledCertType', '残疾证件类型', 'OPTION', {
            sort: 5,
            dictCode: 'GROUP.Enum.DisabilityType',
            fieldMapping: 'disabledCertTypeName',
          }),
          yesNoField('martyrFamilyFlag', '是否烈属', {
            sort: 6,
            defaultValue: 0,
          }),
          yesNoField('elderlyOrphanFlag', '是否孤老', {
            sort: 7,
            defaultValue: 0,
          }),
          field('disabledCertNumber', '残疾证号', 'TEXT', {
            sort: 8,
            length: 100,
          }),
          field('martyrCertNumber', '烈属证号', 'TEXT', {
            sort: 9,
            length: 100,
          }),
          field('personalInvestmentAmount', '个人投资额', 'DOUBLE', {
            sort: 10,
            orderFlag: true,
          }),
          field('personalInvestmentRatio', '个人投资比例', 'DOUBLE', {
            sort: 11,
            orderFlag: true,
          }),
          field('remarks', '备注', 'LONG_TEXT', { sort: 12, length: 500 }),
          yesNoField('foreignPersonFlag', '是否境外人员', {
            sort: 13,
            required: 1,
            defaultValue: 0,
          }),
          field('taxReason', '涉税事由', 'OPTION', {
            sort: 14,
            dictCode: 'GROUP.Enum.TaxRelated',
            fieldMapping: 'taxReasonName',
          }),
          field('chineseName', '中文名', 'TEXT', { sort: 15, length: 100 }),
          field('birthCountryRegion', '出生国家（地区）', 'OPTION', {
            sort: 16,
            dictCode: 'GROUP.Enum.Country',
            fieldMapping: 'birthCountryRegionName',
          }),
          field('firstEntryTime', '首次入境时间', 'DATE', {
            sort: 17,
            orderFlag: true,
          }),
          field('estimatedDepartureTime', '预计离境时间', 'DATE', {
            sort: 18,
            orderFlag: true,
          }),
          field('otherCertType', '其他证照类型', 'OPTION', {
            sort: 19,
            dictCode: 'GROUP.Enum.OtherLicensingType',
            fieldMapping: 'otherCertTypeName',
          }),
          field('otherCertNumber', '其他证照号码', 'TEXT', { sort: 20 }),
          field('householdProvince', '户籍所在地（省）', 'TEXT', {
            sort: 21,
            length: 40,
          }),
          field('householdCity', '户籍所在地（市）', 'TEXT', {
            sort: 22,
            length: 40,
          }),
          field('householdDistrict', '户籍所在地（区县）', 'TEXT', {
            sort: 23,
            length: 40,
          }),
          field('householdAddressDetail', '户籍所在地(详细地址)', 'TEXT', {
            sort: 24,
            length: 40,
          }),
          field('residenceProvince', '居住地址（省）', 'TEXT', {
            sort: 25,
            length: 40,
          }),
          field('residenceCity', '居住地址（市）', 'TEXT', {
            sort: 26,
            length: 40,
          }),
          field('residenceDistrict', '居住地址（区县）', 'TEXT', {
            sort: 27,
            length: 40,
          }),
          field('residenceAddressDetail', '居住地址(详细地址)', 'TEXT', {
            sort: 28,
            length: 40,
          }),
          field('contactProvince', '联系地址（省）', 'TEXT', {
            sort: 29,
            length: 40,
          }),
          field('contactCity', '联系地址（市）', 'TEXT', {
            sort: 30,
            length: 40,
          }),
          field('contactDistrict', '联系地址（区县）', 'TEXT', {
            sort: 31,
            length: 40,
          }),
          field('contactAddressDetail', '联系地址(详细地址)', 'TEXT', {
            sort: 32,
            length: 40,
          }),
          field('education', '学历', 'OPTION', {
            sort: 33,
            dictCode: 'GROUP.Enum.DiplomaType',
            fieldMapping: 'educationName',
          }),
          field('openingBank', '开户银行', 'TEXT', { sort: 34, length: 40 }),
          field('bankAccount', '银行账号', 'TEXT', { sort: 35, length: 40 }),
          field('position', '职务', 'OPTION', {
            sort: 36,
            dictCode: 'GROUP.Enum.PositionTwo',
            fieldMapping: 'jobTitleName',
          }),
        ],
        1,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'dthr_staff_reporting_line',
    setName: '直属领导',
    builtin: 1,
    children: [
      group(
        'dthr_staff_reporting_line.default',
        '直属领导',
        [
          field('dthr_staff_reporting_line.default1', '汇报类型', '', {
            fieldLabel: '行政',
            fieldValue: 'Enum.Administration',
          }),
          field('Enum.Administration', '汇报对象', 'person'),
          field('dthr_staff_reporting_line.default2', '汇报类型', '', {
            fieldLabel: '业务',
            fieldValue: 'Enum.Business',
          }),
          field('Enum.Business', '汇报对象', 'person'),
          field('dthr_staff_reporting_line.default3', '汇报类型', '', {
            fieldLabel: '财务',
            fieldValue: 'Enum.Finance',
          }),
          field('Enum.Finance', '汇报对象', 'person'),
          field('dthr_staff_reporting_line.default4', '汇报类型', '', {
            fieldLabel: '技术',
            fieldValue: 'Enum.Technology',
          }),
          field('Enum.Technology', '汇报对象', 'person'),
        ],
        1,
      ),
    ],
  },
  {
    type: 'tab',
    setCode: 'tab_staff_custom_region',
    setName: '地区信息',
    builtin: 0,
    children: [
      group(
        'tab_staff_custom_region.linked',
        '拆开关联',
        [
          field('region_linked_province', '省份', 'OPTION', {
            sort: 1,
            length: null,
            fieldMapping: 'region_linked_provinceName',
            dictCode: 'GROUP.ProvinceCityRegion.Enum',
            level: 1,
            operator: 'EQ',
            systemFlag: 0,
          }),
          field('region_linked_city', '城市', 'OPTION', {
            sort: 2,
            length: null,
            fieldMapping: 'region_linked_cityName',
            dictCode: 'GROUP.ProvinceCityRegion.Enum',
            level: 2,
            parentColumnName: 'region_linked_province',
            operator: 'EQ',
            systemFlag: 0,
          }),
          field('region_linked_district', '区县', 'OPTION', {
            sort: 3,
            length: null,
            fieldMapping: 'region_linked_districtName',
            dictCode: 'GROUP.ProvinceCityRegion.Enum',
            level: 3,
            parentColumnName: 'region_linked_city',
            operator: 'EQ',
            systemFlag: 0,
          }),
        ],
        1,
        0,
      ),
      group(
        'tab_staff_custom_region.cascade',
        '单控件层级',
        [
          field('region_level1', '只选省份', 'OPTION', {
            sort: 1,
            length: null,
            fieldMapping: 'region_level1Name',
            dictCode: 'GROUP.ProvinceCityRegion.Enum',
            level: 1,
            operator: 'EQ',
            systemFlag: 0,
          }),
          field('region_level2', '省市', 'OPTION', {
            sort: 2,
            length: null,
            fieldMapping: 'region_level2Name',
            dictCode: 'GROUP.ProvinceCityRegion.Enum',
            level: 2,
            operator: 'EQ',
            systemFlag: 0,
          }),
          field('region_level3', '省市区', 'OPTION', {
            sort: 3,
            length: null,
            fieldMapping: 'region_level3Name',
            dictCode: 'GROUP.ProvinceCityRegion.Enum',
            level: 3,
            operator: 'EQ',
            systemFlag: 0,
          }),
        ],
        2,
        0,
      ),
    ],
  },
];

/** PC LICENSE 详情有证照数据但缺独立列；保留证照对应字段，不借用家庭成员占位列。 */
rosterDetailFormColumns.push({
  type: 'tab',
  setCode: 'LICENSE',
  setName: '证照管理',
  builtin: 0,
  children: [
    group(
      'LICENSE.default',
      '默认分组',
      [
        field('licenseName', '证照名称', 'TEXT'),
        field('licenseNo', '证照编号', 'TEXT'),
        field('validUntil', '有效期至', 'DATE'),
      ],
      1,
      0,
    ),
  ],
});

/** 移动端蓝湖图的补充字段：沿用既有字段名，不覆盖 PC 已有字段。 */
const mobileImageFields = [
  {
    setCode: 'tab_staff_info',
    groupCode: 'tab_staff_info.default',
    codes: [
      ['idPhotoFront', '证件照正面'],
      ['idPhotoBack', '证件照反面'],
    ],
  },
  {
    setCode: 'tab_staff_info',
    groupCode: 'tab_staff_info.bank_card1',
    codes: [['bankCardPhoto', '工资卡照片']],
  },
  {
    setCode: 'tab_staff_info',
    groupCode: 'tab_staff_info.bank_card2',
    codes: [['bankCardPhoto', '工资卡照片']],
  },
  {
    setCode: 'tab_staff_education',
    groupCode: 'tab_staff_education.default',
    codes: [
      ['certificatePhoto1', '教育证书照1'],
      ['certificatePhoto2', '教育证书照2'],
    ],
  },
];
mobileImageFields.forEach((item) => {
  const target = rosterDetailFormColumns
    .find((set) => set.setCode === item.setCode)
    ?.children.find((group) => group.groupCode === item.groupCode);
  item.codes.forEach(([code, name]) => {
    if (target && !target.children.some((field) => field.fieldCode === code))
      target.children.push(
        field(code, name, 'IMAGE', {
          uploadCount: 1,
          imageSizeLimit: '8',
          uploadUnit: 'MB',
          allowedFormats: ['png', 'jpg', 'jpeg'],
        }),
      );
  });
});

const MOCK_IMG =
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg';

/**
 * 基础信息详情 Mock：按分组 code 取值。
 * BOOLEAN（含 birthdayType）直接给 0/1。
 */
export const rosterDetailBasicFormData = {
  'tab_staff_info.default': {
    name: '叶文洁',
    englishName: 'Ye Wenjie',
    staffStatus: 'IN_SERVICE',
    staffStatusName: '在职',
    orgId: 'org-001',
    orgName: '体验设计部',
    positionId: 'pos-001',
    positionName: '体验设计师',
    positionCategoryId: 'pc-001',
    positionCategoryName: '专业类',
    positionTitleId: 'duty-001',
    positionTitleName: '设计助理',
    jobLevelId: 'position-grade-3',
    jobLevelName: 'P3',
    staffNo: '23344555',
    idCardType: 'IDENTITY_CARD',
    idCardTypeName: '居民身份证',
    idCardNo: '330281197005121234',
    phone: '13800138000',
    contractType: 'fixed_term',
    contractTypeName: '固定期限',
    staffType: 'FULLTIME',
    staffTypeName: '全职',
    hireDate: '2001-03-15',
    historicalYears: 3,
    contractCompanyId: '宁波银行股份有限公司',
    contractCompanyName: '宁波银行股份有限公司',
    gender: 'female',
    genderName: '女',
    birthdayType: 0,
    birthDate: '1970-05-12',
    workLocation: 'loc-ningbo',
    workLocationName: '宁波',
    address: '浙江省宁波市鄞州区中山东路1888号',
    age: 56,
    country: 'CN',
    countryName: '中国',
    lastName: '叶',
    firstName: '文洁',
    hireYearEmploymentType: 'FIRST_JOB_OTHER',
    hireYearEmploymentTypeName: '当年首次入职其他人员',
    workHoursSystem: 'STANDARD',
    workHoursSystemName: '标准工时',
    firstWorkDate: '1995-07-01',
    validityStartDate: '2024-01-01',
    validityEndDate: '2034-01-01',
  },
  'tab_staff_info.contract': {
    termType: 'FIXED',
    termTypeName: '固定期限',
    currentContractStartDate: '2024-01-01',
    currentContractEndDate: '2026-12-31',
    email: 'ye.wenjie@nbcb.example',
    workPhone: '0574-88888888',
    probationEndDate: '2001-09-15',
    probationMonths: 6,
    regularDate: '2001-09-15',
    probationStatus: 'passed',
    probationStatusName: '已转正',
  },
  'tab_staff_info.employee': {
    nickname: '叶老师',
    idName: '叶文洁',
    nationality: 'HAN',
    nationalityName: '汉族',
    householdType: 'URBAN',
    householdTypeName: '城镇',
    householdLocation: '浙江省宁波市',
    ancestralHome: '浙江宁波',
    residenceAddress: '浙江省宁波市鄞州区中山东路1888号',
    highestEducation: 'UNDER_GRADUATE',
    highestEducationName: '本科',
    politicalStatus: 'MASSES',
    politicalStatusName: '群众',
    maritalStatus: 'MARRIED',
    maritalStatusName: '已婚',
    bloodType: 'A',
    bloodTypeName: 'A型',
    emergencyContactName: '杨冬',
    emergencyContactPhone: '13900139000',
    spouseName: '',
    childName: '杨冬',
    qq: '10001',
    wechat: 'ye_wenjie',
    personalEmail: 'yewenjie@example.com',
    remarks: '备注内容备注内容备注内容备注内容备注内容备注内容备注内容备注内容',
  },
  'tab_staff_info.bank_card1': {
    id: 'acc-001',
    bankName: 'NBCB',
    bankNameName: '宁波银行',
    branchName: '鄞州支行',
    bankAccount: '6222****8899',
    accountHolderName: '叶文洁',
    defaultFlag: 1,
  },
  'tab_staff_info.bank_card2': {
    id: 'acc-002',
    bankName: 'ICBC',
    bankNameName: '中国工商银行',
    branchName: '宁波分行',
    bankAccount: '6222****6688',
    accountHolderName: '北野武',
    defaultFlag: 0,
  },
};

/**
 * 单条多分组 Tab 详情 Mock：按分组 code 取值。
 * BOOLEAN 直接给 0/1。
 */
export const rosterDetailSingleFormByTab: Record<
  string,
  Record<string, unknown>
> = {
  tab_staff_benefit: {
    'tab_staff_benefit.social_insurance': {
      id: 'benefit-1',
      socialSecurityPlanName: '标准社保方案',
      socialSecurityRegion: '宁波市',
      socialSecurityOrg: '体验设计部',
      socialSecurityBase: 8000,
      socialSecurityStartDate: '2024-01-01',
      socialSecurityEndDate: '',
      socialSecurityAccount: 'SS-330200-001',
    },
    'tab_staff_benefit.housing_fund': {
      providentFundPlanName: '标准公积金方案',
      providentFundRegion: '宁波市',
      providentFundOrg: '体验设计部',
      providentFundBase: 8000,
      providentFundStartDate: '2024-01-01',
      providentFundEndDate: '',
      providentFundAccount: 'PF-330200-001',
      suppFundAccount: '',
    },
  },
  tab_staff_salary: {
    'tab_staff_salary.tax_info': {
      id: 'salary-tax-1',
      taxEffectiveDate: '2024-01-01',
      taxAdjustmentReason: 'ENTRY',
      taxAdjustmentReasonName: '入职核定',
      taxpayerStatus: 1,
      taxRegion: '宁波市',
      taxExemptAmount: 5000,
      taxWithholdingObligor: '宁波银行股份有限公司',
    },
    'tab_staff_salary.probation_salary': {
      probationEffectiveDate: '2023-07-01',
      probationAdjustmentReason: 'PROBATION',
      probationAdjustmentReasonName: '试用期定薪',
      probationRemarks: '',
      probationSalaryGrade: 'P4',
      probationSalaryId: 8000,
    },
    'tab_staff_salary.formal_salary': {
      formalEffectiveDate: '2024-01-01',
      formalAdjustmentReason: 'REGULAR',
      formalAdjustmentReasonName: '转正调薪',
      formalRemarks: '',
      formalSalaryGrade: 'P5',
      formalSalaryId: 12000,
    },
  },
  tab_staff_subset_ptd: {
    'tab_staff_subset_ptd.default': {
      id: 'tax-1',
      employmentType: 'EMPLOYEE',
      employmentTypeName: '雇员',
      deductStandardExpense: 1,
      otherExplanation: '',
      otherExplanationName: '',
      disabledFlag: 0,
      disabledCertType: '',
      disabledCertTypeName: '',
      martyrFamilyFlag: 0,
      elderlyOrphanFlag: 0,
      disabledCertNumber: '',
      martyrCertNumber: '',
      personalInvestmentAmount: 0,
      personalInvestmentRatio: 0,
      remarks: '',
      foreignPersonFlag: 0,
      taxReason: '',
      taxReasonName: '',
      chineseName: '叶文洁',
      birthCountryRegion: 'CN',
      birthCountryRegionName: '中国',
      firstEntryTime: '',
      estimatedDepartureTime: '',
      otherCertType: '',
      otherCertTypeName: '',
      otherCertNumber: '',
      householdProvince: '浙江省',
      householdCity: '宁波市',
      householdDistrict: '鄞州区',
      householdAddressDetail: '',
      residenceProvince: '浙江省',
      residenceCity: '宁波市',
      residenceDistrict: '鄞州区',
      residenceAddressDetail: '',
      contactProvince: '浙江省',
      contactCity: '宁波市',
      contactDistrict: '鄞州区',
      contactAddressDetail: '',
      education: 'DOCTOR',
      educationName: '博士',
      openingBank: '宁波银行',
      bankAccount: '6222****001',
      position: 'RESEARCHER',
      jobTitleName: '研究员',
    },
  },
};

/** 教育经历详情 Mock：系统字段编码固定；学历存字典编码，名称走 educationLevelName。 */
export const rosterDetailEducationRecords = [
  {
    id: 'edu-001',
    school: '清华大学',
    major: '物理学',
    entryDate: '1990-09-01',
    graduationDate: '1995-06-30',
    educationLevel: 'DOCTOR',
    educationLevelName: '博士',
    hasDegree: 1,
    customFields: {
      e7f27f8c689c47329a15d5d9f8108890: '110105',
      '99fc6401d5674009282d82ea27da1bc52': '北京市/市辖区/朝阳区',
      '71f89d218cf94ae4aa2d453e7fb365cb': 12,
      '9ca10d007c4d486f9bea5ab7288fc917': 3.5,
    },
  },
  {
    id: 'edu-002',
    school: '北京大学',
    major: '哲学',
    entryDate: '1984-09-01',
    graduationDate: '1988-07-01',
    educationLevel: 'UNDER_GRADUATE',
    educationLevelName: '本科',
    hasDegree: 1,
    customFields: {
      e7f27f8c689c47329a15d5d9f8108890: '310115',
      '99fc6401d5674009282d82ea27da1bc52': '上海市/市辖区/浦东新区',
      '71f89d218cf94ae4aa2d453e7fb365cb': 4,
      '9ca10d007c4d486f9bea5ab7288fc917': 88.6,
    },
  },
];

/** 工作经历详情 Mock：body 直接是扁平记录数组。系统字段都在默认分组。 */
export const rosterDetailWorkRecords = [
  {
    id: 'work-1',
    companyName: '红岸基地',
    position: '研究员',
    startDate: '1995-07-01',
    endDate: '2001-02-28',
    jobDescription: '负责红岸工程相关科研工作',
    customFields: {},
  },
  {
    id: 'work-2',
    companyName: '清华大学',
    position: '副教授',
    startDate: '2001-03-01',
    endDate: '2004-12-31',
    jobDescription: '从事天体物理教学与研究',
    customFields: {},
  },
];

/** 家庭成员详情 Mock：body 直接是扁平记录数组。 */
export const rosterDetailFamilyRecords = [
  {
    id: 'family-1',
    memberName: '叶文洁父亲',
    relationship: 'FATHER',
    relationshipName: '父亲',
    birthDate: '1935-01-01',
    birthCertificate: '',
    customFields: {},
  },
  {
    id: 'family-2',
    memberName: '叶文洁母亲',
    relationship: 'MOTHER',
    relationshipName: '母亲',
    birthDate: '1938-05-12',
    birthCertificate: '',
    customFields: {},
  },
];

/** 员工证书详情 Mock：body 直接是扁平记录数组。 */
export const rosterDetailCertificateRecords = [
  {
    id: 'cert-1',
    certificateName: '高级工程师职称证',
    certificateType: 'other',
    certificateTypeName: '其他',
    certificateNumber: 'ZC-1990-001',
    issuingAuthority: '人事部',
    issueDate: '1990-06-01',
    recordDate: '1990-06-15',
    reminderDate: '2029-12-01',
    expiryDate: '2030-06-01',
    major: '天体物理',
    level: '高级',
    description: '红岸工程相关技术资格',
    customFields: {},
  },
  {
    id: 'cert-2',
    certificateName: '特种作业操作证',
    certificateType: 'other',
    certificateTypeName: '其他',
    certificateNumber: 'ZC-2026-002',
    issuingAuthority: '应急管理局',
    issueDate: '2024-11-01',
    recordDate: '2024-11-10',
    reminderDate: '2026-10-20',
    expiryDate: '2026-11-05',
    major: '',
    level: '中级',
    description: '高压电工作业资格',
    customFields: {},
  },
  {
    id: 'cert-3',
    certificateName: '会计从业资格证',
    certificateType: 'other',
    certificateTypeName: '其他',
    certificateNumber: 'ZC-2018-003',
    issuingAuthority: '财政局',
    issueDate: '2018-05-01',
    recordDate: '2018-05-20',
    reminderDate: '2026-09-01',
    expiryDate: '2026-10-01',
    major: '会计',
    level: '初级',
    description: '已过有效期',
    customFields: {},
  },
];

/** 绩效档案详情 Mock：body 直接是扁平记录数组。 */
export const rosterDetailPerformanceRecords = [
  {
    id: 'perf-1',
    performanceYear: '2024',
    performanceQuarter: '全年',
    performanceLevel: '优秀',
    performanceScore: 95,
    appraiser: '常伟思',
    appraisalDate: '2024-12-20',
    remarks: '红岸工程相关科研表现突出',
    defaultFlag: 1,
    customFields: {},
  },
  {
    id: 'perf-2',
    performanceYear: '2023',
    performanceQuarter: '全年',
    performanceLevel: '良好',
    performanceScore: 88,
    appraiser: '常伟思',
    appraisalDate: '2023-12-18',
    remarks: '',
    defaultFlag: 0,
    customFields: {},
  },
];

/** 公司内兼任详情 Mock：body 直接是扁平记录数组。 */
export const rosterDetailPartTimeRecords = [
  {
    id: 'part-1',
    concurrentOrg: 'hq-hr',
    concurrentPosition: 'position-004',
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    remarks: '红岸工程专项顾问',
    customFields: {},
  },
];

/** 自定义信息集详情 Mock：每条是一条记录。 */
export const rosterDetailCustomRecordsByTab = {
  LICENSE: [
    {
      id: 'license-1',
      licenseName: '驾驶证',
      licenseNo: '3301****1234',
      validUntil: '2030-12-31',
    },
    {
      id: 'license-2',
      licenseName: '护照',
      licenseNo: 'E12345678',
      validUntil: '2028-06-01',
    },
  ],
  tab_staff_custom_region: [
    {
      id: 'region-1',
      customFields: {
        region_linked_province: '440000',
        region_linked_provinceName: '广东省',
        region_linked_city: '440300',
        region_linked_cityName: '深圳市',
        region_linked_district: '440305',
        region_linked_districtName: '南山区',
        region_level1: '110000',
        region_level1Name: '北京市',
        region_level2: ['310000', '310100'],
        region_level2Name: '上海市/市辖区',
        region_level3: ['440000', '440100', '440106'],
        region_level3Name: '广东省/广州市/天河区',
      },
    },
  ],
};

/** 直属领导详情 Mock：汇报类型编码 → 汇报对象。 */
export const rosterDetailLeaderDetail = {
  'Enum.Administration': { staffId: 'staff-luoji', staffName: '罗辑' },
  'Enum.Business': { staffId: 'staff-luoji', staffName: '罗辑' },
  'Enum.Finance': { staffId: 'staff-luoji', staffName: '罗辑' },
  'Enum.Technology': { staffId: 'staff-luoji', staffName: '罗辑' },
};

/** PC 未提供的移动图片样本，同时带 Mock 文件 ID 和已有展示地址。 */
const mobileBasic = rosterDetailBasicFormData as Record<
  string,
  Record<string, unknown>
>;
mobileImageFields
  .filter((item) => item.setCode === 'tab_staff_info')
  .forEach((item) => {
    item.codes.forEach(([code, name]) => {
      mobileBasic[item.groupCode][code] = [
        {
          fileId: 'mock-' + item.groupCode + '-' + code,
          name: name + '.jpg',
          url: MOCK_IMG,
        },
      ];
    });
  });
rosterDetailEducationRecords.forEach((row, index) =>
  Object.assign(row, {
    certificatePhoto1: [
      {
        fileId: 'mock-edu-' + (index + 1) + '-certificate1',
        name: '教育证书照1.jpg',
        url: MOCK_IMG,
      },
    ],
    certificatePhoto2: [
      {
        fileId: 'mock-edu-' + (index + 1) + '-certificate2',
        name: '教育证书照2.jpg',
        url: MOCK_IMG,
      },
    ],
  }),
);

/** 现有移动接口按信息集返回 PC 原始列表，不按人员 ID 筛选或生成业务值。 */
export const rosterDetailMultiRecordByTab: Record<
  string,
  Record<string, unknown>[]
> = {
  tab_staff_education: rosterDetailEducationRecords,
  tab_staff_job_history: rosterDetailWorkRecords,
  tab_staff_family_member: rosterDetailFamilyRecords,
  tab_staff_certificate: rosterDetailCertificateRecords,
  tab_staff_performance: rosterDetailPerformanceRecords,
  tab_staff_internal_concurrent: rosterDetailPartTimeRecords,
  ...rosterDetailCustomRecordsByTab,
};

function mockImages(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-img-${index + 1}`,
    name: `${prefix}-${index + 1}.jpg`,
    url: MOCK_IMG,
    thumbUrl: MOCK_IMG,
  }));
}

function mockFiles(prefix: string, names: string[]) {
  return names.map((name, index) => ({
    id: `${prefix}-file-${index + 1}`,
    name,
    url: MOCK_IMG,
  }));
}

/** 成长记录-异动。Mock 不按 staffId 过滤 */
export const rosterDetailGrowthChangeRecords = [
  {
    id: 'gc-1',
    changeDate: '2025-01-22',
    operationTime: '2025-01-02 09:30:30',
    changeType: '转正',
    detail: '北野武通过花名册导入，为王小明办理入职',
  },
  {
    id: 'gc-2',
    changeDate: '2025-01-20',
    operationTime: '2025-01-02 09:30:30',
    changeType: '转正',
    detail: '北野武通过花名册导入，为王小明办理入职',
  },
  {
    id: 'gc-3',
    changeDate: '2025-01-13',
    operationTime: '2025-01-02 09:30:30',
    changeType: '转正',
    detail: '北野武通过花名册导入，为王小明办理入职',
  },
  {
    id: 'gc-4',
    changeDate: '2025-01-08',
    operationTime: '2025-01-02 09:30:30',
    changeType: '转正',
    detail: '北野武通过花名册导入，为王小明办理入职',
  },
  {
    id: 'gc-5',
    changeDate: '2024-10-14',
    operationTime: '2024-10-14 09:30:30',
    changeType: '调动',
    detail: '北野武为叶文洁办理了入职\n部门由体验设计部变更为科技部',
  },
  {
    id: 'gc-6',
    changeDate: '2024-10-13',
    operationTime: '2024-10-13 09:30:30',
    changeType: '转正',
    detail: '北野武为叶文洁办理了入职\n部门由体验设计部变更为科技部',
  },
  {
    id: 'gc-7',
    changeDate: '2024-10-14',
    operationTime: '2024-10-14 09:30:30',
    changeType: '入职',
    detail: '北野武为叶文洁办理了入职\n部门由体验设计部变更为科技部',
  },
];

/** 成长记录-企业内任职。Mock 不按 staffId 过滤 */
export const rosterDetailGrowthPositionRecords = [
  {
    id: 'gp-1',
    startDate: '2025-01-22',
    endDate: '',
    positionType: '兼岗',
    department: '体验设计部体验设计部体验设计部体验设计部体验设计部体',
    position: '体验设计师体验设计师',
    duty: '设计助理设计助理设计助理',
    rank: '23',
    changeReason:
      '原因内容原因内容原因内容原因内容原因内容原因内容原因内容原因内容原因内容原因内容',
    source: '系统生成',
    operator: '北野武',
    operationTime: '2025-01-02 09:30:30',
  },
  {
    id: 'gp-2',
    startDate: '2025-01-22',
    endDate: '',
    positionType: '主岗',
    department: '体验设计部体验设计部体验设计部体验设计部体验设计部体',
    position: '体验设计师体验设计师',
    duty: '设计助理设计助理设计助理',
    rank: '23',
    changeReason:
      '原因内容原因内容原因内容原因内容原因内容原因内容原因内容原因内容',
    source: '系统生成',
    operator: '北野武',
    operationTime: '2025-01-02 09:30:30',
  },
];

/** 员工成本中心。Mock 不按 staffId 过滤。displayType：0 比例，1 金额 */
export const rosterDetailCostData = {
  displayType: 0,
  ratioTotal: '100%',
  amountTotal: '2,233,233,100.00元',
  ratioRows: [
    { costCenterName: '营销部', value: '40' },
    { costCenterName: '设计部', value: '20' },
    { costCenterName: '行政部', value: '25' },
    { costCenterName: '市场部', value: '15' },
  ],
  amountRows: [
    {
      costCenterName: '营销部',
      costProjectName: '营销部营销部营销部营销部营销部营销部营销',
      value: '573,573,573,994.00',
    },
    {
      costCenterName: '营销部',
      costProjectName: '营销部营销部营销部营销部营销部营销部营销',
      value: '573,573,573,994.00',
    },
    {
      costCenterName: '营销部',
      costProjectName: '营销部营销部营销部营销部营销部营销部营销',
      value: '573,573,573,994.00',
    },
    {
      costCenterName: '营销部',
      costProjectName: '营销部营销部营销部营销部营销部营销部营销',
      value: '573,573,573,994.00',
    },
    {
      costCenterName: '营销部',
      costProjectName: '营销部营销部营销部营销部营销部营销部营销',
      value: '573,573,573,994.00',
    },
  ],
};

const ATTACH_FILE_NAMES = [
  '附件名称很长很长很长很长很长很长很长很长的示例.xls',
  ...Array.from({ length: 15 }, () => '附件名称.xls'),
];

/** 附件。Mock 不按 staffId 过滤 */
export const rosterDetailAttachments = {
  subTabs: [
    {
      code: 'ROSTER_ATTACH',
      name: '花名册附件',
      groups: [
        {
          groupCode: 'images',
          groupName: '图片',
          displayType: 'image',
          files: mockImages('roster', 16),
        },
        {
          groupCode: 'files',
          groupName: '文件',
          displayType: 'file',
          files: mockFiles('roster', ATTACH_FILE_NAMES),
        },
      ],
    },
    {
      code: 'ONBOARDING_ATTACH',
      name: '入职附件',
      groups: [
        {
          groupCode: 'work',
          groupName: '工作经历',
          displayType: 'image',
          files: mockImages('work', 4),
        },
        {
          groupCode: 'edu_cert',
          groupName: '学历证书',
          displayType: 'file',
          files: mockFiles('edu', [
            '附件名称.xls',
            '附件名称.xls',
            '附件名称.xls',
          ]),
        },
        {
          groupCode: 'degree',
          groupName: '学位证书',
          displayType: 'file',
          files: mockFiles('degree', [
            '附件名称.xls',
            '附件名称.xls',
            '附件名称.xls',
          ]),
        },
        {
          groupCode: 'resign',
          groupName: '离职证明',
          displayType: 'image',
          files: mockImages('resign', 3),
        },
        {
          groupCode: 'resign2',
          groupName: '离职证明',
          displayType: 'image',
          files: mockImages('resign2', 4),
        },
      ],
    },
  ],
};
