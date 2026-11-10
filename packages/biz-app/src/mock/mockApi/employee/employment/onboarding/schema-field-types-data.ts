// @ts-nocheck
/**
 * 自定义信息集「字段类型配置」全场景 mock
 * 覆盖 typeConfigJson 全部能力，供 Schema 字段类型测试页使用
 */
function field(
  infoFieldId,
  setCode,
  setName,
  groupCode,
  groupName,
  columnName,
  fieldName,
  fieldType,
  { required = false, systemFlag = 1, ...extra } = {},
) {
  return {
    id: null,
    infoFieldId,
    setCode,
    setName,
    groupCode,
    groupName,
    columnName,
    fieldName,
    fieldType,
    systemFlag,
    isEntryConfig: true,
    required,
    ...extra,
  };
}

function f(
  setCode,
  setName,
  groupCode,
  groupName,
  id,
  columnName,
  fieldName,
  fieldType,
  extra = {},
) {
  return field(
    id,
    setCode,
    setName,
    groupCode,
    groupName,
    columnName,
    fieldName,
    fieldType,
    extra,
  );
}

/** 字段类型配置全场景信息集 */
export const schemaFieldTypesFieldSets = [
  {
    setCode: 'type_text',
    setName: '文本类型',
    groupList: [
      {
        groupCode: 'text_group',
        groupName: '文本 / 长文本',
        fieldList: [
          f(
            'type_text',
            '文本类型',
            'text_group',
            '文本 / 长文本',
            't1',
            'shortText',
            '短文本',
            'TEXT',
            {
              required: true,
              typeConfigJson: { valueLength: 20, defaultValue: '' },
            },
          ),
          f(
            'type_text',
            '文本类型',
            'text_group',
            '文本 / 长文本',
            't2',
            'longText',
            '长文本',
            'LONG_TEXT',
            {
              typeConfigJson: { valueLength: 100 },
            },
          ),
          f(
            'type_text',
            '文本类型',
            'text_group',
            '文本 / 长文本',
            't3',
            'customRemark',
            '自定义备注',
            'TEXT',
            {
              systemFlag: 0,
              typeConfigJson: { valueLength: 50 },
            },
          ),
        ],
      },
    ],
  },
  {
    setCode: 'type_number',
    setName: '数值类型',
    groupList: [
      {
        groupCode: 'number_group',
        groupName: '整数 / 小数',
        fieldList: [
          f(
            'type_number',
            '数值类型',
            'number_group',
            '整数 / 小数',
            'n1',
            'intRange',
            '试用月数',
            'INTEGER',
            {
              required: true,
              typeConfigJson: {
                defaultValue: '3',
                minimumValue: 0,
                maximumValue: 24,
              },
            },
          ),
          f(
            'type_number',
            '数值类型',
            'number_group',
            '整数 / 小数',
            'n2',
            'doublePrec',
            '绩效系数',
            'DOUBLE',
            {
              typeConfigJson: {
                defaultValue: '1.5',
                minimumValue: 0,
                maximumValue: 10,
                decimalPlaces: 2,
              },
            },
          ),
        ],
      },
    ],
  },
  {
    setCode: 'type_boolean',
    setName: '是否类型',
    groupList: [
      {
        groupCode: 'bool_group',
        groupName: '布尔',
        fieldList: [
          f(
            'type_boolean',
            '是否类型',
            'bool_group',
            '布尔',
            'b1',
            'defaultYes',
            '默认是',
            'BOOLEAN',
            {
              typeConfigJson: { booleanDefault: '1' },
            },
          ),
          f(
            'type_boolean',
            '是否类型',
            'bool_group',
            '布尔',
            'b2',
            'defaultNo',
            '默认否',
            'BOOLEAN',
            {
              typeConfigJson: { booleanDefault: '0' },
            },
          ),
        ],
      },
    ],
  },
  {
    setCode: 'type_date',
    setName: '日期时间',
    groupList: [
      {
        groupCode: 'date_group',
        groupName: '日期格式',
        fieldList: [
          f(
            'type_date',
            '日期时间',
            'date_group',
            '日期格式',
            'd1',
            'dateDay',
            '完整日期',
            'DATE',
            {
              required: true,
              typeConfigJson: { dateFormat: 'yyyy-MM-dd' },
            },
          ),
          f(
            'type_date',
            '日期时间',
            'date_group',
            '日期格式',
            'd2',
            'dateMonth',
            '年月',
            'DATE',
            {
              typeConfigJson: { dateFormat: 'yyyy-MM' },
            },
          ),
          f(
            'type_date',
            '日期时间',
            'date_group',
            '日期格式',
            'd3',
            'dateYear',
            '年份',
            'DATE',
            {
              typeConfigJson: { dateFormat: 'yyyy' },
            },
          ),
          f(
            'type_date',
            '日期时间',
            'date_group',
            '日期格式',
            'd4',
            'timeHm',
            '时间(时分)',
            'TIME',
            {
              typeConfigJson: { dateFormat: 'HH:mm' },
            },
          ),
          f(
            'type_date',
            '日期时间',
            'date_group',
            '日期格式',
            'd5',
            'timeHms',
            '时间(时分秒)',
            'TIME',
            {
              typeConfigJson: { dateFormat: 'HH:mm:ss' },
            },
          ),
          f(
            'type_date',
            '日期时间',
            'date_group',
            '日期格式',
            'd6',
            'dateTime',
            '日期时间',
            'DATETIME',
            {
              typeConfigJson: { dateFormat: 'yyyy-MM-dd HH:mm:ss' },
            },
          ),
        ],
      },
    ],
  },
  {
    setCode: 'type_option',
    setName: '选项类型',
    groupList: [
      {
        groupCode: 'option_dict_group',
        groupName: '字典 + fieldMapping',
        fieldList: [
          f(
            'type_option',
            '选项类型',
            'option_dict_group',
            '字典 + fieldMapping',
            'o1',
            'colorCode',
            '颜色',
            'OPTION',
            {
              required: true,
              typeConfigJson: {
                dictId: 'GROUP.Enum.Color',
                level: 1,
                fieldMapping: 'colorName',
              },
            },
          ),
          f(
            'type_option',
            '选项类型',
            'option_dict_group',
            '字典 + fieldMapping',
            'o2',
            'staffType',
            '员工类型',
            'OPTION',
            {
              typeConfigJson: {
                dictId: 'GROUP.Enum.StaffType',
                level: 1,
                fieldMapping: 'staffTypeName',
              },
            },
          ),
          f(
            'type_option',
            '选项类型',
            'option_dict_group',
            '字典 + fieldMapping',
            'o3',
            'regionLeaf',
            '地区(level=3叶子)',
            'OPTION',
            {
              typeConfigJson: {
                dictCode: 'GROUP.Enum.RegionLeaf',
                level: 3,
                fieldMapping: 'regionLeafName',
              },
            },
          ),
        ],
      },
      {
        groupCode: 'option_cascade_group',
        groupName: 'parentField 级联',
        fieldList: [
          f(
            'type_option',
            '选项类型',
            'option_cascade_group',
            'parentField 级联',
            'c1',
            'provinceCode',
            '省',
            'OPTION',
            {
              required: true,
              typeConfigJson: {
                dictId: 'GROUP.Enum.DemoProvince',
                level: 1,
                fieldMapping: 'provinceName',
              },
            },
          ),
          f(
            'type_option',
            '选项类型',
            'option_cascade_group',
            'parentField 级联',
            'c2',
            'cityCode',
            '市',
            'OPTION',
            {
              typeConfigJson: {
                dictId: 'GROUP.Enum.DemoCity',
                level: 1,
                fieldMapping: 'cityName',
                parentColumnName: 'provinceCode',
              },
            },
          ),
          f(
            'type_option',
            '选项类型',
            'option_cascade_group',
            'parentField 级联',
            'c3',
            'districtCode',
            '区',
            'OPTION',
            {
              typeConfigJson: {
                dictId: 'GROUP.Enum.DemoDistrict',
                level: 1,
                fieldMapping: 'districtName',
                parentFieldCode: 'cityCode',
              },
            },
          ),
        ],
      },
      {
        groupCode: 'option_datasource_group',
        groupName: 'dataSource 接口选项(上拉分页)',
        fieldList: [
          f(
            'type_option',
            '选项类型',
            'option_datasource_group',
            'dataSource 接口选项(上拉分页)',
            'ds1',
            'positionId',
            '职位(接口分页)',
            'OPTION',
            {
              dataSource: 'position',
              typeConfigJson: {
                fieldMapping: 'positionName',
              },
            },
          ),
          f(
            'type_option',
            '选项类型',
            'option_datasource_group',
            'dataSource 接口选项(上拉分页)',
            'ds2',
            'skillTags',
            '技能标签(多选分页)',
            'OPTION',
            {
              dataSource: 'skillTags',
              typeConfigJson: {
                fieldMapping: 'skillTagsName',
              },
            },
          ),
        ],
      },
    ],
  },
  {
    setCode: 'type_upload',
    setName: '上传类型',
    groupList: [
      {
        groupCode: 'upload_group',
        groupName: '图片 / 文件',
        fieldList: [
          f(
            'type_upload',
            '上传类型',
            'upload_group',
            '图片 / 文件',
            'u1',
            'avatarImages',
            '头像图片',
            'IMAGE',
            {
              typeConfigJson: {
                uploadCount: 3,
                imageSizeLimit: 2,
                uploadUnit: 'MB',
                allowedFormats: ['.jpg', '.jpeg', '.png'],
              },
            },
          ),
          f(
            'type_upload',
            '上传类型',
            'upload_group',
            '图片 / 文件',
            'u2',
            'legacyImages',
            '证明材料(兼容旧键)',
            'IMAGE',
            {
              typeConfigJson: {
                uploadCount: 9,
                maxSize: 8,
                sizeUnit: 'MB',
                formats: ['.bmp', '.jpg', '.jpeg', '.png', '.gif'],
              },
            },
          ),
          f(
            'type_upload',
            '上传类型',
            'upload_group',
            '图片 / 文件',
            'u3',
            'contractFiles',
            '合同附件',
            'FILE',
            {
              typeConfigJson: {
                uploadCount: 2,
                fileSizeLimit: '500KB',
                allowedFormats: ['.pdf', '.doc', '.docx'],
              },
            },
          ),
          f(
            'type_upload',
            '上传类型',
            'upload_group',
            '图片 / 文件',
            'u4',
            'legacyFiles',
            '学历证书(兼容旧键)',
            'FILE',
            {
              typeConfigJson: {
                uploadCount: 2,
                maxSize: 10,
                sizeUnit: 'MB',
                formats: ['.pdf', '.jpg', '.jpeg', '.png'],
              },
            },
          ),
        ],
      },
    ],
  },
  {
    setCode: 'type_multi',
    setName: '多行信息集',
    singleDataFlag: 0,
    collapseMin: 0,
    collapseMax: 3,
    groupList: [
      {
        groupCode: 'multi_base',
        groupName: '经历条目',
        fieldList: [
          f(
            'type_multi',
            '多行信息集',
            'multi_base',
            '经历条目',
            'm1',
            'companyName',
            '公司名称',
            'TEXT',
            {
              required: true,
              typeConfigJson: { valueLength: 30 },
            },
          ),
          f(
            'type_multi',
            '多行信息集',
            'multi_base',
            '经历条目',
            'm2',
            'workMonths',
            '任职月数',
            'INTEGER',
            {
              typeConfigJson: {
                minimumValue: 1,
                maximumValue: 120,
                defaultValue: '12',
              },
            },
          ),
          f(
            'type_multi',
            '多行信息集',
            'multi_base',
            '经历条目',
            'm3',
            'extraNote',
            '自定义说明',
            'TEXT',
            {
              systemFlag: 0,
              typeConfigJson: { valueLength: 40 },
            },
          ),
        ],
      },
    ],
  },
];
