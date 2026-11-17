/** 设置树只使用配置节点编码，不参与人员详情的字段映射。 */
export type RosterSettingNode = {
  id: string;
  code: string;
  name: string;
  nodeType: 'module' | 'group' | 'field';
  sort?: number;
  builtin?: boolean;
  children?: RosterSettingNode[];
};

/** PC team-save 的信息集、分组、字段结构。 */
export type RosterSettingField = {
  id?: string;
  fieldCode: string;
  fieldName?: string;
  sort?: number;
};

export type RosterSettingGroup = {
  id?: string;
  groupCode: string;
  groupName?: string;
  sort?: number;
  fieldList?: RosterSettingField[];
};

export type RosterSettingSet = {
  id?: string;
  setCode: string;
  setName?: string;
  sort?: number;
  groupList?: RosterSettingGroup[];
  fieldList?: RosterSettingField[];
};

export type RosterSettingsSaveBody = {
  isAllowDepartmentManagerView: boolean;
  setList: RosterSettingSet[];
};
