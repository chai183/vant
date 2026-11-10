/**
 * 详情 formFiledMetaDataList（对齐 PC 核心信息集）
 * setCode / groupList / fieldList；返回的字段都会渲染
 */

function field(
  id: string,
  name: string,
  fieldType: string,
  extra: Record<string, unknown> = {},
  approverRequired = 0,
) {
  return {
    id,
    infoFieldId: extra.infoFieldId || id,
    fieldCode: extra.fieldCode || extra.columnName || id,
    fieldName: name,
    columnName: extra.columnName || extra.fieldCode || id,
    fieldType,
    typeConfigJson: extra.typeConfigJson,
    dictCode: extra.dictCode,
    options: extra.options,
    staffShow: true,
    staffRequired: false,
    approveShow: true,
    approveRequired: approverRequired === 1,
  };
}

/** 入职登记表详情字段元数据（基础信息 / 教育 / 工作 / 家庭 / 证书） */
export const registerFormFiledMetaDataList = [
  {
    setCode: 'basic-info',
    setName: '基础信息',
    groupList: [
      {
        groupCode: 'basic-info-root',
        groupName: '默认分组',
        fieldList: [
          field('b-1', '头像', 'IMAGE'),
          field(
            'b-2',
            '姓名',
            'TEXT',
            {
              columnName: 'name',
              fieldCode: 'name',
              infoFieldId: 'info-name',
            },
            1,
          ),
          field(
            'b-3',
            '证件类型',
            'OPTION',
            {
              columnName: 'idCardType',
              fieldCode: 'idCardType',
              infoFieldId: 'info-idCardType',
              typeConfigJson: {
                dictId: 'GROUP.Enum.IdCardType',
                level: 1,
                fieldMapping: 'idCardTypeName',
              },
            },
            1,
          ),
          field('b-4', '手机号码', 'TEXT', {
            columnName: 'phone',
            fieldCode: 'phone',
            infoFieldId: 'info-phone',
          }),
          field('b-5', '入职日期', 'DATE', {
            columnName: 'enrollDate',
            fieldCode: 'enrollDate',
            infoFieldId: 'info-enrollDate',
          }),
          field(
            'b-6',
            '出生日期',
            'DATE',
            {
              columnName: 'birthday',
              fieldCode: 'birthday',
              infoFieldId: 'info-birthday',
            },
            1,
          ),
        ],
      },
      {
        groupCode: 'employee-info',
        groupName: '员工信息',
        fieldList: [
          field('e-1', '证件姓名', 'TEXT'),
          field('e-2', '民族', 'OPTION'),
          field('e-4', '最高学历', 'OPTION', {
            typeConfigJson: { dictId: 'GROUP.Enum.DiplomaType' },
          }),
        ],
      },
    ],
  },
  {
    setCode: 'education',
    setName: '教育经历',
    singleDataFlag: 0,
    groupList: [
      {
        groupCode: 'education-root',
        groupName: '默认分组',
        fieldList: [
          field('edu-1', '学校名称', 'TEXT'),
          field('edu-2', '学历', 'OPTION', {
            typeConfigJson: { dictId: 'GROUP.Enum.DiplomaType' },
          }),
          field('edu-3', '专业', 'TEXT'),
          field('edu-4', '入学日期', 'DATE'),
          field('edu-5', '毕业日期', 'DATE'),
          field('edu-6', '学历证明', 'FILE', {
            typeConfigJson: {
              uploadCount: 3,
              maxSize: 8,
              sizeUnit: 'MB',
              formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
            },
          }),
        ],
      },
    ],
  },
  {
    setCode: 'work',
    setName: '工作经历',
    singleDataFlag: 0,
    groupList: [
      {
        groupCode: 'work-root',
        groupName: '默认分组',
        fieldList: [
          field('work-1', '公司名称', 'TEXT'),
          field('work-2', '职位', 'TEXT'),
          field('work-3', '入职日期', 'DATE'),
          field('work-4', '离职日期', 'DATE'),
        ],
      },
    ],
  },
  {
    setCode: 'family',
    setName: '家庭成员',
    singleDataFlag: 0,
    groupList: [
      {
        groupCode: 'family-root',
        groupName: '默认分组',
        fieldList: [
          field('fam-1', '姓名', 'TEXT'),
          field('fam-2', '关系', 'OPTION'),
          field('fam-3', '联系电话', 'TEXT'),
        ],
      },
    ],
  },
  {
    setCode: 'certificate',
    setName: '员工证书',
    singleDataFlag: 0,
    groupList: [
      {
        groupCode: 'certificate-root',
        groupName: '默认分组',
        fieldList: [
          field('cert-1', '证书名称', 'TEXT'),
          field('cert-2', '证书编号', 'TEXT'),
          field('cert-3', '发证日期', 'DATE'),
          field('cert-4', '有效期至', 'DATE'),
        ],
      },
    ],
  },
];
