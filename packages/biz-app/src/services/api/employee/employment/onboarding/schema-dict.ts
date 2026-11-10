/**
 * 信息集 OPTION 字典 mock 数据
 * 正式环境走 dthr-base/dict/simple/{dictCode}/items；本表仅给 mock 用
 * 业务仍可通过 SchemaProForm.dictOptions 覆盖接口结果
 */
import type { SchemaOption } from '@/_components/SchemaProForm';

export const SCHEMA_DICT_OPTIONS: Record<string, SchemaOption[]> = {
  'GROUP.Enum.StaffType': [
    { label: '全职', value: 'fulltime' },
    { label: '兼职', value: 'parttime' },
    { label: '实习', value: 'intern' },
    { label: '外派', value: 'expat' },
  ],
  'GROUP.Enum.IdCardType': [
    { label: '身份证', value: 'id_card' },
    { label: '护照', value: 'passport' },
    { label: '港澳通行证', value: 'hk_macau' },
  ],
  'GROUP.Enum.ContractType': [
    { label: '固定期限', value: 'fixed' },
    { label: '无固定期限', value: 'open' },
    { label: '实习协议', value: 'intern' },
  ],
  'GROUP.Enum.Nation': [
    { label: '汉族', value: 'han' },
    { label: '回族', value: 'hui' },
    { label: '满族', value: 'man' },
  ],
  'GROUP.Enum.MaritalStatus': [
    { label: '未婚', value: 'single' },
    { label: '已婚', value: 'married' },
    { label: '离异', value: 'divorced' },
  ],
  'GROUP.Enum.PoliticalStatus': [
    { label: '群众', value: 'masses' },
    { label: '中共党员', value: 'party' },
    { label: '共青团员', value: 'league' },
  ],
  'GROUP.Enum.EducationLevel': [
    { label: '高中', value: 'high' },
    { label: '大专', value: 'college' },
    { label: '本科', value: 'bachelor' },
    { label: '硕士', value: 'master' },
    { label: '博士', value: 'doctor' },
  ],
  'GROUP.Enum.DemoProvince': [
    { label: '广东省', value: 'gd' },
    { label: '浙江省', value: 'zj' },
  ],
  'GROUP.Enum.DemoCity': [
    { label: '广州市', value: 'gz', parentValue: 'gd' },
    { label: '深圳市', value: 'sz', parentValue: 'gd' },
    { label: '杭州市', value: 'hz', parentValue: 'zj' },
    { label: '宁波市', value: 'nb', parentValue: 'zj' },
  ],
  'GROUP.Enum.DemoDistrict': [
    { label: '天河区', value: 'th', parentValue: 'gz' },
    { label: '越秀区', value: 'yx', parentValue: 'gz' },
    { label: '南山区', value: 'ns', parentValue: 'sz' },
    { label: '福田区', value: 'ft', parentValue: 'sz' },
    { label: '西湖区', value: 'xh', parentValue: 'hz' },
    { label: '余杭区', value: 'yh', parentValue: 'hz' },
    { label: '海曙区', value: 'hs', parentValue: 'nb' },
  ],
  'GROUP.Enum.Color': [
    { label: '红色', value: 'red' },
    { label: '蓝色', value: 'blue' },
    { label: '绿色', value: 'green' },
  ],
  'GROUP.Enum.RegionLeaf': [
    { label: '广东 / 广州 / 天河', value: 'gd-gz-th' },
    { label: '浙江 / 杭州 / 西湖', value: 'zj-hz-xh' },
  ],
  /** 入职地址省市区（level=3 单字段，扁平叶子选项） */
  'GROUP.ProvinceCityRegion.Enum': [
    { label: '广东 / 广州 / 天河', value: 'gd-gz-th' },
    { label: '广东 / 深圳 / 南山', value: 'gd-sz-ns' },
    { label: '浙江 / 杭州 / 西湖', value: 'zj-hz-xh' },
    { label: '浙江 / 宁波 / 海曙', value: 'zj-nb-hs' },
  ],
};
