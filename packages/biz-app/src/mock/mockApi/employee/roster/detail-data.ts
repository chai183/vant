/** 详情页签集合。样本范围按 roster.txt 对齐，既有专用页签保留。 */
export const rosterDetailTabs = [
  { type: 'tab', setCode: 'tab_staff_info', setName: '基础信息', builtin: 1 },
  {
    type: 'tab',
    setCode: 'tab_staff_education',
    setName: '教育经历',
    builtin: 1,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_job_history',
    setName: '工作经历',
    builtin: 1,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_family_member',
    setName: '家庭成员',
    builtin: 1,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_certificate',
    setName: '员工证书',
    builtin: 1,
  },
  {
    type: 'tab',
    setCode: 'tab_staff_performance',
    setName: '绩效档案',
    builtin: 1,
  },
  { type: 'tab', setCode: 'PROBATION', setName: '试用期管理', builtin: 1 },
  {
    type: 'tab',
    setCode: 'tab_staff_internal_concurrent',
    setName: '公司内兼任',
    builtin: 1,
  },
  { type: 'tab', setCode: 'tab_staff_benefit', setName: '福利', builtin: 1 },
  { type: 'tab', setCode: 'tab_staff_salary', setName: '薪资', builtin: 1 },
  { type: 'tab', setCode: 'ATTACHMENT', setName: '附件', builtin: 1 },
  {
    type: 'tab',
    setCode: 'dthr_staff_reporting_line',
    setName: '直属领导',
    builtin: 1,
  },
  { type: 'tab', setCode: 'GROWTH', setName: '成长记录', builtin: 1 },
  {
    type: 'tab',
    setCode: 'tab_staff_subset_ptd',
    setName: '个税申报',
    builtin: 1,
  },
  { type: 'tab', setCode: 'COST', setName: '员工成本中心', builtin: 1 },
  { type: 'tab', setCode: 'LICENSE', setName: '证照管理', builtin: 0 },
  {
    type: 'tab',
    setCode: 'a6ab0658308f45d4aa9cd237b8297e14',
    setName: '信息集测试',
    builtin: 0,
  },
];

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
    ...extra,
  };
}

function group(
  groupCode: string,
  groupName: string,
  children: ReturnType<typeof field>[],
  builtin = 1,
) {
  return {
    type: 'group',
    groupCode,
    groupName,
    builtin,
    children,
  };
}

function tab(
  setCode: string,
  setName: string,
  children: ReturnType<typeof group>[],
  builtin = 1,
) {
  return { type: 'tab', setCode, setName, builtin, children };
}

/** 样本字段来自 2026-11-13 提供的 roster.txt，保留原始字段名、分组与映射。 */
export const rosterDetailFormColumns = [
  tab(
    'tab_staff_info',
    '基础信息',
    [
      group(
        'tab_staff_info.default',
        '默认分组',
        [
          field('name', '姓名', 'TEXT'),
          field('orgId', '部门', 'OPTION', { fieldMapping: 'orgName' }),
          field('positionId', '职位', 'OPTION'),
          field('positionCategoryId', '职务分类', 'OPTION', {
            fieldMapping: 'positionCategoryName',
          }),
          field('positionTitleId', '职务', 'OPTION', {
            fieldMapping: 'positionTitleName',
          }),
          field('jobLevelId', '职级', 'OPTION', {
            fieldMapping: 'jobLevelName',
          }),
          field('staffNo', '工号', 'TEXT'),
          field('idCardType', '证件类型', 'OPTION', {
            fieldMapping: 'idCardTypeName',
          }),
          field('idCardNo', '证件号', 'TEXT'),
          field('idPhotoFront', '证件照正面', 'IMAGE'),
          field('idPhotoBack', '证件照反面', 'IMAGE'),
          field('phone', '手机号码', 'TEXT'),
          field('contractType', '合同类型', 'OPTION', {
            fieldMapping: 'contractTypeName',
          }),
          field('staffType', '员工类型', 'OPTION', {
            fieldMapping: 'staffTypeName',
          }),
          field('hireDate', '入职日期', 'DATE'),
          field('historicalYears', '历史工龄(年)', 'DOUBLE'),
          field('contractCompanyId', '合同公司', 'OPTION', {
            fieldMapping: 'contractCompanyName',
          }),
          field('gender', '性别', 'OPTION', { fieldMapping: 'genderName' }),
          field('birthdayType', '生日类型', 'BOOLEAN'),
          field('birthDate', '出生日期', 'DATE'),
          field('workLocation', '工作地点', 'OPTION', {
            fieldMapping: 'workLocationName',
          }),
          field('address', '联系地址', 'TEXT'),
          field('age', '年龄', 'CALCULATE'),
          field('country', '国籍', 'OPTION', { fieldMapping: 'countryName' }),
          field('lastName', '名', 'TEXT'),
          field('firstName', '姓', 'TEXT'),
          field('hireYearEmploymentType', '入职年度就业情形', 'OPTION', {
            fieldMapping: 'hireYearEmploymentTypeName',
          }),
          field('workHourSystem', '工时制度', 'OPTION', {
            fieldMapping: 'workHourSystemName',
          }),
          field('firstWorkDate', '首次参加工作日期', 'DATE'),
          field('validityStartDate', '有效期开始日期', 'DATE'),
          field('validityEndDate', '有效期结束日期', 'DATE'),
          field('3752aedfbe0b4b07815c6757f0f2b6f2', 'QQQ', 'TEXT'),
          field('3b612cde9cd64698bba71a5e68930298', 'WWW', 'TEXT'),
          field('3084b5a96ebe452fb1d46900969081ff', 'EE', 'BOOLEAN'),
          field('41f2e0fdcfb04cd5bf1f50b4920cf604', 'RRR', 'BOOLEAN'),
          field('f90c6bd902ab4b4e94868a60c9647565', 'TTT', 'BOOLEAN'),
          field('c762ba027c414ea3b6ae340b8a65495d', '高级字段', 'ADVANCED'),
          field('98bbe19e6fe34989bc945c8be59846a4', '时分', 'TIME'),
          field('5854e640301f4046a5a7aedbd029b982', '时间测试', 'DATETIME'),
          field('cb9063ba232f49dfa525ee3f28f04ee1', 'asdad', 'DATETIME'),
          field('83ae3546145e4afca54998fd5116b282', '一级', 'OPTION', {
            fieldMapping: 'ab3dc5a239a04d2b8f98115e904f7fab',
          }),
          field('5795477fc89e4724a3d1a181d09a6819', '二级', 'OPTION', {
            fieldMapping: '312bcf642d774e1b9c381ef5ee55741a',
          }),
          field('ace9fcc25ce14625bff1e7c0d9bab5b3', '三级', 'OPTION', {
            fieldMapping: 'fd9ae4d20eca4d8d989581a050166e3b',
          }),
          field('3ddf944733cd4d3f8da947c2bf72e9a6', '一级1', 'OPTION', {
            fieldMapping: 'a664cfdbff0c450d8d71e0d956b855d6',
          }),
          field('f1c3f79785254488a28e0f4adebc4264', '二级1', 'OPTION', {
            fieldMapping: '42c95328aa784b929d0ec4b4f32dbe65',
          }),
          field('48d5a0d48aa44c3eb967bf6a5e77ac93', '三级1', 'OPTION', {
            fieldMapping: '8f70aa7438524b5994867fca42fbeab1',
          }),
          field('d3a6cfcfc01e41ba90cf7e738768bbb3', '冲冲冲', 'TEXT'),
        ],
        1,
      ),
      group(
        'tab_staff_info.contract',
        '合同信息',
        [
          field('termType', '期限类型', 'OPTION', {
            fieldMapping: 'termTypeName',
          }),
          field('currentContractStartDate', '当前合同开始日', 'DATE'),
          field('currentContractEndDate', '当前合同结束日', 'DATE'),
          field('email', '工作邮箱', 'TEXT'),
          field('workPhone', '工作电话', 'TEXT'),
          field('probationEndDate', '试用期到期日', 'DATE'),
          field('probationMonths', '试用期(月)', 'INTEGER'),
          field('regularDate', '转正日期', 'DATE'),
        ],
        1,
      ),
      group(
        'tab_staff_info.employee',
        '员工信息',
        [
          field('nickname', '花名', 'TEXT'),
          field('idName', '证件姓名', 'TEXT'),
          field('nationality', '民族', 'OPTION', {
            fieldMapping: 'nationalityName',
          }),
          field('householdType', '户口类型', 'OPTION', {
            fieldMapping: 'householdTypeName',
          }),
          field('householdLocation', '户口所在地', 'TEXT'),
          field('ancestralHome', '籍贯', 'TEXT'),
          field('residenceAddress', '居住住址', 'TEXT'),
          field('highestEducation', '最高学历', 'OPTION', {
            fieldMapping: 'highestEducationName',
          }),
          field('politicalStatus', '政治面貌', 'OPTION', {
            fieldMapping: 'politicalStatusName',
          }),
          field('maritalStatus', '婚姻状况', 'OPTION', {
            fieldMapping: 'maritalStatusName',
          }),
          field('bloodType', '血型', 'OPTION', {
            fieldMapping: 'bloodTypeName',
          }),
          field('emergencyContactName', '紧急联系人姓名', 'TEXT'),
          field('emergencyContactPhone', '紧急联系人电话', 'TEXT'),
          field('spouseName', '配偶姓名', 'TEXT'),
          field('childName', '孩子姓名', 'TEXT'),
          field('qq', 'QQ', 'TEXT'),
          field('wechat', '微信', 'TEXT'),
          field('personalEmail', '个人邮箱', 'TEXT'),
          field('remarks', '备注', 'LONG_TEXT'),
        ],
        1,
      ),
      group(
        'tab_staff_info.bank_card1',
        '银行卡信息1',
        [
          field('bankName', '工资卡开户银行', 'OPTION', {
            fieldMapping: 'bankNameName',
          }),
          field('branchName', '工资卡分支行', 'TEXT'),
          field('bankAccount', '工资卡银行账号', 'TEXT'),
          field('accountHolderName', '工资卡开户名', 'TEXT'),
          field('bankCardPhoto', '工资卡照片', 'IMAGE'),
        ],
        1,
      ),
      group(
        'tab_staff_info.bank_card2',
        '银行卡信息2',
        [
          field('bankName', '工资卡开户银行', 'OPTION', {
            fieldMapping: 'bankNameName',
          }),
          field('branchName', '工资卡分支行', 'TEXT'),
          field('bankAccount', '工资卡银行账号', 'TEXT'),
          field('accountHolderName', '工资卡开户名', 'TEXT'),
          field('bankCardPhoto', '工资卡照片', 'IMAGE'),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_education',
    '教育经历',
    [
      group(
        'tab_staff_education.default',
        '默认分组',
        [
          field('school', '学校', 'TEXT'),
          field('major', '专业', 'TEXT'),
          field('entryDate', '入校时间', 'DATE'),
          field('graduationDate', '毕业日期', 'DATE'),
          field('educationLevel', '学历', 'OPTION', {
            fieldMapping: 'educationLevelName',
          }),
          field('hasDegree', '是否取得学位', 'BOOLEAN'),
          field('certificatePhoto1', '教育证书照1', 'IMAGE'),
          field('certificatePhoto2', '教育证书照2', 'IMAGE'),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_job_history',
    '工作经历',
    [
      group(
        'tab_staff_job_history.default',
        '默认分组',
        [
          field('companyName', '公司名称', 'TEXT'),
          field('position', '担任职位', 'TEXT'),
          field('startDate', '入职日期', 'DATE'),
          field('endDate', '离职日期', 'DATE'),
        ],
        1,
      ),
      group(
        '138ffb2658a04a02acc941fbf31986f5',
        '2212',
        [field('jobDescription', '职位描述', 'LONG_TEXT')],
        0,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_family_member',
    '家庭成员',
    [
      group(
        'tab_staff_family_member.default',
        '默认分组',
        [
          field('memberName', '成员姓名', 'TEXT'),
          field('relationship', '关系', 'OPTION', {
            fieldMapping: 'relationshipName',
          }),
          field('birthDate', '出生日期', 'DATE'),
          field('birthCertificate', '出生证明', 'FILE'),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_certificate',
    '员工证书',
    [
      group(
        'tab_staff_certificate.default',
        '默认分组',
        [
          field('certificateName', '证照名称', 'TEXT'),
          field('certificateType', '证照类型', 'OPTION', {
            fieldMapping: 'certificateTypeName',
          }),
          field('certificateNumber', '证照编号', 'TEXT'),
          field('issuingAuthority', '发证机构', 'TEXT'),
          field('issueDate', '发证日期', 'DATE'),
          field('recordDate', '备案日期', 'DATE'),
          field('reminderDate', '提醒日期', 'DATE'),
          field('expiryDate', '到期日期', 'DATE'),
          field('major', '专业', 'TEXT'),
          field('level', '级别', 'TEXT'),
          field('description', '描述', 'LONG_TEXT'),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_subset_ptd',
    '个税申报',
    [
      group(
        'tab_staff_subset_ptd.default',
        '默认分组',
        [
          field('employmentType', '任职受雇从业类型', 'OPTION', {
            fieldMapping: 'employmentTypeName',
          }),
          field('deductStandardExpense', '是否扣除减除费用', 'BOOLEAN'),
          field('otherExplanation', '其他情况说明', 'OPTION', {
            fieldMapping: 'otherExplanationName',
          }),
          field('disabledFlag', '是否残疾', 'BOOLEAN'),
          field('disabledCertType', '残疾证件类型', 'OPTION', {
            fieldMapping: 'disabledCertTypeName',
          }),
          field('martyrFamilyFlag', '是否烈属', 'BOOLEAN'),
          field('elderlyOrphanFlag', '是否孤老', 'BOOLEAN'),
          field('disabledCertNumber', '残疾证号', 'TEXT'),
          field('martyrCertNumber', '烈属证号', 'TEXT'),
          field('personalInvestmentAmount', '个人投资额', 'DOUBLE'),
          field('personalInvestmentRatio', '个人投资比例', 'DOUBLE'),
          field('remarks', '备注', 'LONG_TEXT'),
          field('foreignPersonFlag', '是否境外人员', 'BOOLEAN'),
          field('taxReason', '涉税事由', 'OPTION', {
            fieldMapping: 'taxReasonName',
          }),
          field('chineseName', '中文名', 'TEXT'),
          field('birthCountryRegion', '出生国家（地区）', 'OPTION', {
            fieldMapping: 'birthCountryRegionName',
          }),
          field('firstEntryTime', '首次入境时间', 'DATE'),
          field('estimatedDepartureTime', '预计离境时间', 'DATE'),
          field('otherCertType', '其他证照类型', 'OPTION', {
            fieldMapping: 'otherCertTypeName',
          }),
          field('otherCertNumber', '其他证照号码', 'TEXT'),
          field('householdProvince', '户籍所在地（省）', 'TEXT'),
          field('householdCity', '户籍所在地（市）', 'TEXT'),
          field('householdDistrict', '户籍所在地（区县）', 'TEXT'),
          field('householdAddressDetail', '户籍所在地(详细地址)', 'TEXT'),
          field('residenceProvince', '居住地址（省）', 'TEXT'),
          field('residenceCity', '居住地址（市）', 'TEXT'),
          field('residenceDistrict', '居住地址（区县）', 'TEXT'),
          field('residenceAddressDetail', '居住地址(详细地址)', 'TEXT'),
          field('contactProvince', '联系地址（省）', 'TEXT'),
          field('contactCity', '联系地址（市）', 'TEXT'),
          field('contactDistrict', '联系地址（区县）', 'TEXT'),
          field('contactAddressDetail', '联系地址(详细地址)', 'TEXT'),
          field('education', '学历', 'OPTION', {
            fieldMapping: 'educationName',
          }),
          field('openingBank', '开户银行', 'TEXT'),
          field('bankAccount', '银行账号', 'TEXT'),
          field('position', '职务', 'OPTION', { fieldMapping: 'jobTitleName' }),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_benefit',
    '福利',
    [
      group(
        'tab_staff_benefit.social_insurance',
        '社保',
        [
          field('socialSecurityPlanName', '社保方案名称', 'OPTION'),
          field('socialSecurityRegion', '社保缴纳地区', 'TEXT'),
          field('socialSecurityOrg', '社保缴纳组织', 'OPTION', {
            fieldMapping: 'socialSecurityOrgName',
          }),
          field('socialSecurityBase', '社保申报基数', 'DOUBLE'),
          field('socialSecurityStartDate', '当前社保生效年月', 'DATE'),
          field('socialSecurityEndDate', '当前社保失效年月', 'DATE'),
          field('socialSecurityAccount', '社保账号', 'TEXT'),
        ],
        1,
      ),
      group(
        'tab_staff_benefit.housing_fund',
        '公积金',
        [
          field('providentFundPlanName', '公积金方案名称', 'OPTION'),
          field('providentFundRegion', '公积金缴纳地区', 'TEXT'),
          field('providentFundOrg', '公积金缴纳组织', 'OPTION', {
            fieldMapping: 'providentFundOrgName',
          }),
          field('providentFundBase', '公积金申报基数', 'DOUBLE'),
          field('providentFundStartDate', '当前公积金生效年月', 'DATE'),
          field('providentFundEndDate', '当前公积金失效年月', 'DATE'),
          field('providentFundAccount', '公积金账号', 'TEXT'),
          field('suppFundAccount', '补充公积金账号', 'TEXT'),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_salary',
    '薪资',
    [
      group(
        'tab_staff_salary.tax_info',
        '税务信息',
        [
          field('taxEffectiveDate', '生效日期', 'DATE'),
          field('taxAdjustmentReason', '调整原因', 'OPTION', {
            fieldMapping: 'taxAdjustmentReasonName',
          }),
          field('taxpayerStatus', '纳税人身份', 'OPTION'),
          field('taxRegion', '纳税地区', 'OPTION', {
            fieldMapping: 'taxRegionName',
          }),
          field('taxExemptAmount', '当前已免税额', 'INTEGER'),
          field('taxWithholdingObligor', '个税扣缴义务人', 'OPTION', {
            fieldMapping: 'taxWithholdingObligorName',
          }),
        ],
        1,
      ),
      group(
        'tab_staff_salary.probation_salary',
        '试用期薪资',
        [
          field('probationEffectiveDate', '生效日期', 'DATE'),
          field('probationAdjustmentReason', '调整原因', 'OPTION', {
            fieldMapping: 'probationAdjustmentReasonName',
          }),
          field('probationRemarks', '备注', 'TEXT'),
          field('probationSalaryGrade', '薪级', 'OPTION', {
            fieldMapping: 'probationSalaryGradeName',
          }),
          field('probationSalaryId', '薪资项（动态）', 'DOUBLE'),
        ],
        1,
      ),
      group(
        'tab_staff_salary.formal_salary',
        '正式薪资',
        [
          field('formalEffectiveDate', '生效日期', 'DATE'),
          field('formalAdjustmentReason', '调整原因', 'OPTION', {
            fieldMapping: 'formalAdjustmentReasonName',
          }),
          field('formalRemarks', '备注', 'TEXT'),
          field('formalSalaryGrade', '薪级', 'OPTION', {
            fieldMapping: 'formalSalaryGradeName',
          }),
          field('formalSalaryId', '薪资项（动态）', 'DOUBLE'),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'tab_staff_internal_concurrent',
    '公司内兼任',
    [
      group(
        'tab_staff_internal_concurrent.default',
        '默认分组',
        [
          field('concurrentOrg', '兼任部门', 'OPTION', {
            fieldMapping: 'concurrentOrgName',
          }),
          field('concurrentPosition', '兼任职位', 'JOBCATEGORY', {
            fieldMapping: 'concurrentPositionName',
          }),
          field('startDate', '开始日期', 'DATE'),
          field('endDate', '结束日期', 'DATE'),
          field('remarks', '备注', 'LONG_TEXT'),
          field('79b260913e5b4c2b8ee50eec7f649c07', '规划局规划局', 'TEXT'),
        ],
        1,
      ),
    ],
    1,
  ),
  tab(
    'a6ab0658308f45d4aa9cd237b8297e14',
    '信息集测试',
    [group('f2c83c57e51d46179f648199726ea575', '默认分组', [], 1)],
    0,
  ),
  tab(
    'dthr_staff_reporting_line',
    '直属领导',
    [
      group(
        'dthr_staff_reporting_line.default',
        '直属领导',
        [
          field('dthr_staff_reporting_line.default1', '汇报类型', '', {
            fieldLabel: '行政',
            fieldValue: 'Enum.Administration',
          }),
          field('Enum.Administration', '汇报对象', 'person'),
        ],
        1,
      ),
    ],
    1,
  ),
  // 样本未覆盖的既有专用页签保持原样，不推测其字段。
  tab('tab_staff_performance', '绩效档案', [
    group('PERFORMANCE.default', '默认分组', [
      field('performanceYear', '考核所属年份', 'TEXT'),
      field('performanceQuarter', '绩效季度', 'TEXT'),
      field('performanceLevel', '绩效等级', 'TEXT'),
      field('performanceScore', '绩效评分', 'TEXT'),
      field('appraiser', '考核人', 'TEXT'),
      field('appraisalDate', '考核日期', 'DATE'),
    ]),
  ]),
  tab(
    'LICENSE',
    '证照管理',
    [
      group('LICENSE.default', '默认分组', [
        field('licenseName', '证照名称', 'TEXT'),
        field('licenseNo', '证照编号', 'TEXT'),
        field('validUntil', '有效期至', 'DATE'),
      ]),
    ],
    0,
  ),
  tab('PROBATION', '试用期管理', []),
  tab('GROWTH', '成长记录', []),
  tab('COST', '员工成本中心', []),
  tab('ATTACHMENT', '附件', []),
];

const MOCK_IMG =
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg';

const MOCK_REMARK = Array.from({ length: 18 }, () => '备注内容').join('');

/** 基础信息详情。Mock 不按 staffId 过滤 */
export const rosterDetailBasicFormData = {
  'tab_staff_info.default': {
    name: '叶文洁',
    staffStatus: 'IN_SERVICE',
    staffStatusName: '在职',
    orgId: 'org-001',
    orgName: '体验设计部',
    positionId: 'pos-001',
    positionName: '体验设计师',
    positionTitleId: 'duty-001',
    positionTitleName: '设计助理',
    historicalYears: 5,
    staffNo: '33455345556334565356',
    idPhotoFront: MOCK_IMG,
    phone: '13800138000',
    gender: 'female',
    genderName: '女',
    birthDate: '1970-05-12',
    hireDate: '2001-03-15',
  },
  'tab_staff_info.employee': {
    nickname: '小花',
    idName: '北野武',
    remarks: MOCK_REMARK,
  },
  'tab_staff_info.contract': {
    termType: 'FIXED',
    termTypeName: '固定期限',
    currentContractStartDate: '2024-01-01',
    currentContractEndDate: '2026-12-31',
    email: 'ye.wenjie@example.com',
    probationMonths: 6,
    probationEndDate: '2001-09-15',
  },
  'tab_staff_info.bank_card1': {
    bankName: 'NBCB',
    bankNameName: '宁波银行',
    branchName: '鄞州支行',
    bankAccount: '6222****8899',
    accountHolderName: '叶文洁',
    defaultFlag: 1,
  },
};

export const rosterDetailSingleFormByTab: Record<
  string,
  Record<string, unknown>
> = {
  tab_staff_benefit: {
    'tab_staff_benefit.social_insurance': {
      socialSecurityPlanName: '标准社保方案',
      socialSecurityRegion: '宁波市',
      socialSecurityOrgName: '财务一部',
      socialSecurityBase: 8000,
      socialSecurityStartDate: '2024-01-01',
    },
    'tab_staff_benefit.housing_fund': {
      providentFundPlanName: '标准公积金方案',
      providentFundRegion: '宁波市',
      providentFundBase: 8000,
    },
  },
  tab_staff_salary: {
    'tab_staff_salary.tax_info': {
      taxEffectiveDate: '2024-01-01',
      taxAdjustmentReasonName: '入职核定',
      taxpayerStatus: 1,
      taxRegionName: '宁波市',
    },
    'tab_staff_salary.formal_salary': {
      formalEffectiveDate: '2024-01-01',
      formalSalaryGradeName: 'P5',
      formalSalaryId: 12000,
    },
  },
  tab_staff_subset_ptd: {
    'tab_staff_subset_ptd.default': {
      employmentTypeName: '雇员',
      deductStandardExpense: 1,
      disabledFlag: 0,
      foreignPersonFlag: 0,
      chineseName: '叶文洁',
    },
  },
};

export const rosterDetailMultiRecordByTab: Record<
  string,
  Record<string, unknown>[]
> = {
  tab_staff_education: [
    {
      id: 'edu-001',
      school: '清华大学',
      major: '物理学',
      entryDate: '1990-09-01',
      graduationDate: '1995-06-30',
      educationLevelName: '博士',
      hasDegree: 1,
    },
    {
      id: 'edu-002',
      school: '北京大学',
      major: '哲学',
      entryDate: '1984-09-01',
      graduationDate: '1988-07-01',
      educationLevelName: '本科',
      hasDegree: 1,
    },
  ],
  tab_staff_job_history: [
    {
      id: 'work-1',
      companyName: '红岸基地',
      position: '研究员',
      startDate: '1995-07-01',
      endDate: '2001-02-28',
      jobDescription: '负责红岸工程相关科研工作',
    },
  ],
  tab_staff_family_member: [
    {
      id: 'family-1',
      memberName: '杨冬',
      relationshipName: '子女',
      birthDate: '2001-06-01',
      birthCertificate: 'file-001',
    },
  ],
  tab_staff_certificate: [
    {
      id: 'cert-1',
      certificateName: '会计专业技术资格',
      certificateTypeName: '职业资格',
      certificateNumber: '3302****8899',
      issuingAuthority: '财政部',
      issueDate: '2018-06-01',
    },
  ],
  tab_staff_performance: [
    {
      id: 'perf-1',
      performanceYear: '2024',
      performanceQuarter: '全年',
      performanceLevel: 'A',
      performanceScore: '95',
      appraiser: '罗辑',
      appraisalDate: '2024-12-20',
    },
  ],
  tab_staff_internal_concurrent: [
    {
      id: 'part-1',
      concurrentOrgName: '计划财务中心',
      concurrentPositionName: '核算专员',
      startDate: '2024-01-01',
      endDate: '',
    },
  ],
  LICENSE: [
    {
      id: 'license-1',
      licenseName: '驾驶证',
      licenseNo: '3301****1234',
      validUntil: '2030-12-31',
    },
  ],
};

export const rosterDetailLeaderDetail = {
  'Enum.Administration': { staffId: 'staff-luoji', staffName: '罗辑' },
  'Enum.Business': { staffId: 'staff-luoji', staffName: '罗辑' },
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

const ATTACH_FILE_NAMES = Array.from({ length: 16 }, () => '附件名称.xls');

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
