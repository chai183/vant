import { rosterDetailFormColumns, rosterDetailTabs } from './detail-data';

/** 保留已有设置节点编码；真实花名册字段名单独放在 columnName。 */
const BASIC_SETTING_FIELD_CODES: Record<string, string> = {
  name: 'staffName',
  avatar: 'staffImageId',
  remarks: 'remark',
};

/** 用户补充的头像设置字段；不写入 roster.txt 未包含的详情元数据。 */
const AVATAR_SETTING_FIELD = { fieldCode: 'avatar', fieldName: '头像' };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** 设置节点编码保留原格式；花名册字段匹配由 columnName 指定。 */
function signFieldCode(setCode: string, fieldCode: string) {
  const set = String(setCode || '').trim();
  const code = String(fieldCode || '').trim();
  if (!code) return '';
  if (!set) return code;
  if (code.startsWith(`${set}.`)) return code;
  return `${set}.${code}`;
}

function toInfoSet(tab: Record<string, unknown>, sort: number) {
  const setCode = String(tab.setCode || '');
  const builtin = Number(tab.builtin) === 1;
  const groups = Array.isArray(tab.children) ? tab.children : [];
  return {
    id: setCode,
    setCode,
    setName: String(tab.setName || ''),
    sort,
    systemConfig: {
      sort,
      ...(builtin ? { builtin: true } : {}),
    },
    groupList: groups.map(
      (group: Record<string, unknown>, groupIndex: number) => ({
        id: String(group.groupCode || ''),
        groupCode: String(group.groupCode || ''),
        groupName: String(group.groupName || ''),
        sort: groupIndex + 1,
        fieldList: [
          ...(setCode === 'tab_staff_info' &&
          group.groupCode === 'tab_staff_info.default'
            ? [AVATAR_SETTING_FIELD]
            : []),
          ...(Array.isArray(group.children) ? group.children : []),
        ].map((field: Record<string, unknown>, fieldIndex: number) => {
          const columnName = String(field.fieldCode || '');
          const settingCode =
            setCode === 'tab_staff_info'
              ? BASIC_SETTING_FIELD_CODES[columnName] || columnName
              : columnName;
          const fieldCode = signFieldCode(setCode, settingCode);
          const fieldSort = fieldIndex + 1;
          return {
            id: fieldCode,
            fieldCode,
            columnName,
            fieldName: String(field.fieldName || ''),
            sort: fieldSort,
            systemConfig: { sort: fieldSort },
          };
        }),
      }),
    ),
  };
}

/** 全部可选字段。结构对齐 list?type=appTeamAuth */
export const rosterTeamAuthAll = rosterDetailTabs.map((tab, index) => {
  const columns = rosterDetailFormColumns.find(
    (item) => item.setCode === tab.setCode,
  );
  if (columns) return toInfoSet(columns as Record<string, unknown>, index + 1);
  const builtin = Number(tab.builtin) === 1;
  return {
    id: tab.setCode,
    setCode: tab.setCode,
    setName: tab.setName,
    sort: index + 1,
    systemConfig: {
      sort: index + 1,
      ...(builtin ? { builtin: true } : {}),
    },
  };
});

/** 已选字段。开发阶段先全量放开，和全部可选一致。 */
export const rosterTeamAuthSelected = (() => {
  const list = clone(rosterTeamAuthAll);
  const basic = list.find((row) => row.setCode === 'tab_staff_info');
  (basic && 'groupList' in basic ? basic.groupList : []).forEach(
    (group: {
      fieldList?: Array<{
        fieldCode?: string;
        columnName?: string;
        systemConfig?: Record<string, unknown>;
      }>;
    }) => {
      (group.fieldList || []).forEach((field) => {
        if (field.columnName === 'name') {
          field.systemConfig = {
            ...(field.systemConfig || {}),
            builtin: true,
          };
        }
      });
    },
  );
  return list;
})();

export const rosterTeamAuthBasic = {
  isAllowDepartmentManagerView: true,
};
