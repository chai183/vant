/** 花名册里用到的部门节点（由组织树接口转出） */
export type RosterOrgNode = {
  id: string;
  name: string;
  parentId: string;
  /** 本部门直属在职人数 */
  directCount: number;
  /** 含下级的总人数 */
  totalCount: number;
  children: RosterOrgNode[];
};

/** 部门下的人 / 常用联系人 */
export type RosterStaff = {
  id: string;
  name: string;
  workNo: string;
  phone: string;
  deptId: string;
  deptName: string;
  /** 在当前部门是否兼任 */
  concurrent: boolean;
};

/** 花名册首页上下文：我的部门、是否组织负责人、常用联系人 */
export type RosterContext = {
  myDeptId: string;
  myDeptName: string;
  /** 当前用户是否组织/部门负责人，决定右上角花名册设置 */
  isOrgLeader: boolean;
  contacts: RosterStaff[];
};

export type RosterStaffPage = {
  records: RosterStaff[];
  total: number;
};

/** 详情页签：setCode → code，setName → name */
export type RosterDetailTabItem = {
  code: string;
  name: string;
  builtin?: number;
};

/** 详情多级 Tab。无 children 时不渲染二级 */
export type RosterCascadeOption = {
  title: string;
  setCode?: string;
  subCode?: string;
  children?: RosterCascadeOption[];
};

/** 详情动态字段 */
export type RosterDetailField = {
  fieldCode: string;
  fieldName: string;
  fieldType?: string;
  fieldMapping?: string;
  fieldLabel?: string;
  fieldValue?: string;
  options?: Array<{ label: string; value: string | number }>;
};

/** 详情动态分组 */
export type RosterDetailGroup = {
  groupCode: string;
  groupName: string;
  fields: RosterDetailField[];
};

/** 一个信息集（页签 + 分组字段） */
export type RosterDetailSet = {
  setCode: string;
  setName: string;
  builtin?: number;
  groups: RosterDetailGroup[];
};

/** 基础信息 / 单条信息集打平后的表单值 */
export type RosterDetailFormData = Record<string, unknown>;

/** 多行信息集的一条记录 */
export type RosterDetailRecord = Record<string, unknown>;

/** 成长记录-异动 */
export type RosterDetailGrowthChange = {
  id: string;
  changeDate: string;
  operationTime: string;
  changeType: string;
  detail: string;
};

/** 成长记录-企业内任职 */
export type RosterDetailGrowthPosition = {
  id: string;
  startDate: string;
  endDate: string;
  positionType: string;
  department: string;
  position: string;
  duty: string;
  rank: string;
  changeReason: string;
  source: string;
  operator: string;
  operationTime: string;
};

/** 成本中心一行 */
export type RosterDetailCostRow = {
  costCenterName: string;
  costProjectName?: string;
  value: string;
};

/** 成本中心详情 */
export type RosterDetailCostData = {
  ratioTotal: string;
  amountTotal: string;
  ratioRows: RosterDetailCostRow[];
  amountRows: RosterDetailCostRow[];
};

/** 附件文件 */
export type RosterDetailAttachFile = {
  id: string;
  name: string;
  url: string;
  thumbUrl?: string;
};

/** 附件分组 */
export type RosterDetailAttachGroup = {
  groupCode: string;
  groupName: string;
  displayType: 'image' | 'file';
  files: RosterDetailAttachFile[];
};

/** 附件二级页 */
export type RosterDetailAttachTab = {
  code: string;
  name: string;
  groups: RosterDetailAttachGroup[];
};
