import { rosterDetailFormColumns, rosterDetailTabs } from './detail-data';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function toInfoSet(tab: Record<string, unknown>, sort: number) {
  const groups = Array.isArray(tab.children) ? tab.children : [];
  return {
    id: String(tab.setCode || ''),
    setCode: String(tab.setCode || ''),
    setName: String(tab.setName || ''),
    sort,
    groupList: groups.map(
      (group: Record<string, unknown>, groupIndex: number) => ({
        id: String(group.groupCode || ''),
        groupCode: String(group.groupCode || ''),
        groupName: String(group.groupName || ''),
        sort: groupIndex + 1,
        fieldList: (Array.isArray(group.children) ? group.children : []).map(
          (field: Record<string, unknown>, fieldIndex: number) => ({
            id: String(field.fieldCode || ''),
            fieldCode: String(field.fieldCode || ''),
            fieldName: String(field.fieldName || ''),
            sort: fieldIndex + 1,
          }),
        ),
      }),
    ),
  };
}

/** 全部可选字段。设置页左侧数据源。 */
export const rosterTeamAuthAll = rosterDetailTabs.map((tab, index) => {
  const columns = rosterDetailFormColumns.find(
    (item) => item.setCode === tab.setCode,
  );
  if (columns) return toInfoSet(columns as Record<string, unknown>, index + 1);
  return {
    id: tab.setCode,
    setCode: tab.setCode,
    setName: tab.setName,
    sort: index + 1,
  };
});

/** 已选字段。开发阶段先全量放开，和全部可选一致。 */
export const rosterTeamAuthSelected = (() => {
  const list = clone(rosterTeamAuthAll);
  const basic = list.find((row) => row.setCode === 'tab_staff_info');
  (basic?.groupList || []).forEach(
    (group: {
      fieldList?: Array<{ fieldCode?: string; systemConfig?: unknown }>;
    }) => {
      (group.fieldList || []).forEach((field) => {
        if (field.fieldCode === 'name' || field.fieldCode === 'idPhotoFront') {
          field.systemConfig = { builtin: true };
        }
      });
    },
  );
  return list;
})();

export const rosterTeamAuthBasic = {
  isAllowDepartmentManagerView: true,
};
