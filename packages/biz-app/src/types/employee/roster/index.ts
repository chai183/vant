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
