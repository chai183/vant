/** 详情页签集合。对齐 PC roster-detail-set */
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
];

const YES_NO_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
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

function group(
  groupCode: string,
  groupName: string,
  children: ReturnType<typeof field>[],
) {
  return {
    type: 'group',
    groupCode,
    groupName,
    builtin: 1,
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

/** 各信息集字段。接口按 setCode 返回其中一项。 */
export const rosterDetailFormColumns = [
  tab('tab_staff_info', '基础信息', [
    group('tab_staff_info.default', '默认分组', [
      field('name', '员工姓名', 'TEXT'),
      field('orgId', '部门', 'OPTION', { fieldMapping: 'orgName' }),
      field('positionId', '职位', 'OPTION', { fieldMapping: 'positionName' }),
      field('positionTitleId', '职务', 'OPTION', {
        fieldMapping: 'positionTitleName',
      }),
      field('historicalYears', '司龄', 'TEXT'),
      field('staffNo', '工号', 'TEXT'),
      field('idPhotoFront', '证件照正面', 'IMAGE'),
    ]),
    group('tab_staff_info.employee', '员工信息', [
      field('nickname', '花名', 'TEXT'),
      field('idName', '证件姓名', 'TEXT'),
      field('remark', '备注', 'LONG_TEXT'),
    ]),
    group('tab_staff_info.contract', '合同信息', [
      field('termType', '合同期限类型', 'OPTION', {
        fieldMapping: 'termTypeName',
      }),
      field('currentContractStartDate', '现合同开始日期', 'DATE'),
      field('currentContractEndDate', '现合同结束日期', 'DATE'),
      field('email', '企业邮箱', 'TEXT'),
      field('probationMonths', '试用期（月）', 'INTEGER'),
      field('probationEndDate', '试用期到期日', 'DATE'),
    ]),
    group('tab_staff_info.bank_card1', '银行卡信息1', [
      field('bankName', '工资卡开户银行', 'OPTION', {
        fieldMapping: 'bankNameName',
      }),
      field('branchName', '工资卡分支行', 'TEXT'),
      field('bankAccount', '工资卡银行账号', 'TEXT'),
      field('accountHolderName', '工资卡开户名', 'TEXT'),
    ]),
  ]),
  tab('tab_staff_education', '教育经历', [
    group('tab_staff_education.default', '默认分组', [
      field('school', '学校', 'TEXT'),
      field('major', '专业', 'TEXT'),
      field('entryDate', '入校时间', 'DATE'),
      field('graduationDate', '毕业日期', 'DATE'),
      field('educationLevel', '学历', 'OPTION', {
        fieldMapping: 'educationLevelName',
      }),
      yesNoField('hasDegree', '是否取得学位'),
    ]),
  ]),
  tab('tab_staff_job_history', '工作经历', [
    group('tab_staff_job_history.default', '默认分组', [
      field('companyName', '公司名称', 'TEXT'),
      field('position', '担任职位', 'TEXT'),
      field('startDate', '入职日期', 'DATE'),
      field('endDate', '离职日期', 'DATE'),
      field('jobDescription', '职位描述', 'LONG_TEXT'),
    ]),
  ]),
  tab('tab_staff_family_member', '家庭成员', [
    group('tab_staff_family_member.default', '默认分组', [
      field('memberName', '成员姓名', 'TEXT'),
      field('relationship', '关系', 'OPTION', {
        fieldMapping: 'relationshipName',
      }),
      field('birthDate', '出生日期', 'DATE'),
    ]),
    group('FAMILY.extra', '补充信息', [
      field('birthCertificate', '出生证明照', 'IMAGE'),
    ]),
  ]),
  tab('tab_staff_certificate', '员工证书', [
    group('tab_staff_certificate.default', '默认分组', [
      field('certificateName', '证照名称', 'TEXT'),
      field('certificateType', '证照类型', 'OPTION', {
        fieldMapping: 'certificateTypeName',
      }),
      field('certificateNumber', '证照编号', 'TEXT'),
      field('issuingAuthority', '发证机构', 'TEXT'),
      field('issueDate', '发证日期', 'DATE'),
    ]),
  ]),
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
  tab('tab_staff_internal_concurrent', '公司内兼任', [
    group('tab_staff_internal_concurrent.default', '默认分组', [
      field('concurrentOrg', '兼任部门', 'TEXT'),
      field('concurrentPosition', '兼任职位', 'TEXT'),
      field('startDate', '开始日期', 'DATE'),
      field('endDate', '结束日期', 'DATE'),
    ]),
  ]),
  tab('tab_staff_benefit', '福利', [
    group('tab_staff_benefit.social_insurance', '社保', [
      field('socialSecurityPlanName', '社保方案名称', 'TEXT'),
      field('socialSecurityRegion', '社保缴纳地区', 'TEXT'),
      field('socialSecurityOrg', '社保缴纳组织', 'TEXT'),
      field('socialSecurityBase', '社保申报基数', 'DOUBLE'),
      field('socialSecurityStartDate', '当前社保生效年月', 'DATE'),
    ]),
    group('tab_staff_benefit.housing_fund', '公积金', [
      field('providentFundPlanName', '公积金方案名称', 'TEXT'),
      field('providentFundRegion', '公积金缴纳地区', 'TEXT'),
      field('providentFundBase', '公积金申报基数', 'DOUBLE'),
    ]),
  ]),
  tab('tab_staff_salary', '薪资', [
    group('tab_staff_salary.tax_info', '税务信息', [
      field('taxEffectiveDate', '生效日期', 'DATE'),
      field('taxAdjustmentReason', '调整原因', 'OPTION', {
        fieldMapping: 'taxAdjustmentReasonName',
      }),
      field('taxpayerStatus', '纳税人身份', 'BOOLEAN', {
        options: [
          { label: '居民', value: 1 },
          { label: '非居民', value: 0 },
        ],
      }),
      field('taxRegion', '纳税地区', 'TEXT'),
    ]),
    group('tab_staff_salary.formal_salary', '正式薪资', [
      field('formalEffectiveDate', '生效日期', 'DATE'),
      field('formalSalaryGrade', '薪级', 'TEXT'),
      field('formalSalaryId', '薪资项（元）', 'DOUBLE'),
    ]),
  ]),
  tab('tab_staff_subset_ptd', '个税申报', [
    group('tab_staff_subset_ptd.default', '默认分组', [
      field('employmentType', '任职受雇从业类型', 'OPTION', {
        fieldMapping: 'employmentTypeName',
      }),
      yesNoField('deductStandardExpense', '是否扣除减除费用'),
      yesNoField('disabledFlag', '是否残疾'),
      yesNoField('foreignPersonFlag', '是否境外人员'),
      field('chineseName', '中文名', 'TEXT'),
    ]),
  ]),
  tab('dthr_staff_reporting_line', '直属领导', [
    group('dthr_staff_reporting_line.default', '直属领导', [
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
    historicalYears: 'p1',
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
    remark: MOCK_REMARK,
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
      socialSecurityOrg: '财务一部',
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
      taxRegion: '宁波市',
    },
    'tab_staff_salary.formal_salary': {
      formalEffectiveDate: '2024-01-01',
      formalSalaryGrade: 'P5',
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
      concurrentOrg: '计划财务中心',
      concurrentPosition: '核算专员',
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

/** 员工成本中心。Mock 不按 staffId 过滤 */
export const rosterDetailCostData = {
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
