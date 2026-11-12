import type {
  RosterContext,
  RosterDetailAttachFile,
  RosterDetailAttachGroup,
  RosterDetailAttachTab,
  RosterDetailCostData,
  RosterDetailCostRow,
  RosterDetailField,
  RosterDetailFormData,
  RosterDetailGroup,
  RosterDetailGrowthChange,
  RosterDetailGrowthPosition,
  RosterDetailRecord,
  RosterDetailSet,
  RosterDetailTabItem,
  RosterStaff,
  RosterStaffPage,
  RosterTeamAuthConfig,
  RosterTeamAuthNode,
} from '@/types/employee/roster';

export const EMPTY_ROSTER_CONTEXT: RosterContext = {
  myDeptId: '',
  myDeptName: '',
  isOrgLeader: false,
  contacts: [],
};

export const EMPTY_ROSTER_STAFF_PAGE: RosterStaffPage = {
  records: [],
  total: 0,
};

export const EMPTY_ROSTER_TEAM_AUTH: RosterTeamAuthConfig = {
  isAllowDepartmentManagerView: false,
  allList: [],
  selectedList: [],
};

function adaptStaff(row: unknown): RosterStaff {
  const source = (row || {}) as Record<string, unknown>;
  return {
    id: String(source.id ?? ''),
    name: String(source.name ?? source.staffName ?? ''),
    workNo: String(source.workNo ?? source.workNumber ?? ''),
    phone: String(source.phone ?? source.mobileNo ?? ''),
    deptId: String(source.deptId ?? source.departmentId ?? ''),
    deptName: String(source.deptName ?? source.departmentName ?? ''),
    concurrent: Boolean(source.concurrent),
  };
}

export function adaptRosterStaffPage(body: unknown): RosterStaffPage {
  const source = (body || {}) as {
    records?: unknown;
    list?: unknown;
    total?: unknown;
  };
  const raw = Array.isArray(body)
    ? body
    : Array.isArray(source.records)
      ? source.records
      : Array.isArray(source.list)
        ? source.list
        : [];
  const records = raw.map(adaptStaff).filter((item) => item.id);
  const total = Number(source.total);
  return {
    records,
    total: Number.isFinite(total) ? total : records.length,
  };
}

export function adaptRosterContext(body: unknown): RosterContext {
  if (!body || typeof body !== 'object') return { ...EMPTY_ROSTER_CONTEXT };
  const source = body as Record<string, unknown>;
  const contacts = adaptRosterStaffPage(source.contacts).records;
  return {
    myDeptId: String(source.myDeptId ?? ''),
    myDeptName: String(source.myDeptName ?? ''),
    isOrgLeader: Boolean(source.isOrgLeader),
    contacts,
  };
}

function readString(row: Record<string, unknown>, key: string) {
  const value = row[key];
  if (value == null || value === '') return '';
  return String(value);
}

function readFlag01(value: unknown) {
  if (value == null || value === '') return undefined;
  if (value === true || value === 1 || value === '1') return 1;
  if (value === false || value === 0 || value === '0') return 0;
  const number = Number(value);
  if (number === 1) return 1;
  if (number === 0) return 0;
  return undefined;
}

function readChildList(row: Record<string, unknown>) {
  return Array.isArray(row.children) ? row.children : [];
}

/** 详情页签集合。没有编码丢掉。 */
export function adaptRosterDetailTabs(body: unknown): RosterDetailTabItem[] {
  if (!Array.isArray(body)) return [];
  return body
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const code = readString(row, 'setCode');
      if (!code) return null;
      const mapped: RosterDetailTabItem = {
        code,
        name: readString(row, 'setName') || code,
      };
      const builtin = readFlag01(row.builtin);
      if (builtin != null) mapped.builtin = builtin;
      return mapped;
    })
    .filter(Boolean) as RosterDetailTabItem[];
}

function adaptDetailField(field: unknown): RosterDetailField | null {
  if (!field || typeof field !== 'object') return null;
  const row = field as Record<string, unknown>;
  const fieldCode = readString(row, 'fieldCode');
  if (!fieldCode) return null;
  const mapped: RosterDetailField = {
    fieldCode,
    fieldName: readString(row, 'fieldName') || fieldCode,
    fieldType: readString(row, 'fieldType'),
  };
  const fieldMapping = readString(row, 'fieldMapping');
  if (fieldMapping) mapped.fieldMapping = fieldMapping;
  const fieldLabel = readString(row, 'fieldLabel');
  if (fieldLabel) mapped.fieldLabel = fieldLabel;
  const fieldValue = readString(row, 'fieldValue');
  if (fieldValue) mapped.fieldValue = fieldValue;
  if (Array.isArray(row.options)) {
    mapped.options = row.options
      .map((option) => {
        if (!option || typeof option !== 'object') return null;
        const optionRow = option as Record<string, unknown>;
        const value = optionRow.value ?? optionRow.code ?? optionRow.id;
        if (value == null || value === '') return null;
        return {
          label:
            readString(optionRow, 'label') ||
            readString(optionRow, 'name') ||
            String(value),
          value: typeof value === 'number' ? value : String(value),
        };
      })
      .filter(Boolean) as Array<{ label: string; value: string | number }>;
  }
  return mapped;
}

function extractGroups(children: unknown[]): RosterDetailGroup[] {
  const groups: RosterDetailGroup[] = [];
  const looseFields: RosterDetailField[] = [];
  children.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const row = item as Record<string, unknown>;
    const type = readString(row, 'type').toLowerCase();
    if (type === 'group' || readString(row, 'groupCode')) {
      const groupCode = readString(row, 'groupCode') || 'default';
      const fields = readChildList(row)
        .map((child) => adaptDetailField(child))
        .filter(Boolean) as RosterDetailField[];
      groups.push({
        groupCode,
        groupName: readString(row, 'groupName') || groupCode,
        fields,
      });
      return;
    }
    const field = adaptDetailField(item);
    if (field) looseFields.push(field);
  });
  if (looseFields.length) {
    groups.unshift({
      groupCode: 'default',
      groupName: '默认分组',
      fields: looseFields,
    });
  }
  return groups;
}

/** 当前 Tab 的字段。接口已按 setCode 裁剪，失败兜底空分组。 */
export function adaptRosterDetailFormColumns(
  body: unknown,
  setCode = '',
): RosterDetailSet {
  const empty: RosterDetailSet = { setCode: setCode || '', groups: [] };
  if (!Array.isArray(body)) return empty;
  const tabs = body.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Record<string, unknown>;
    const type = readString(row, 'type').toLowerCase();
    return type === 'tab' || Boolean(readString(row, 'setCode'));
  }) as Record<string, unknown>[];
  if (!tabs.length) {
    return { setCode, groups: extractGroups(body) };
  }
  const matched =
    tabs.find((item) => readString(item, 'setCode') === setCode) || tabs[0];
  const code = readString(matched, 'setCode') || setCode;
  const set: RosterDetailSet = {
    setCode: code,
    setName: readString(matched, 'setName') || code,
    groups: extractGroups(readChildList(matched)),
  };
  const builtin = readFlag01(matched.builtin);
  if (builtin != null) set.builtin = builtin;
  return set;
}

function flattenCustomFields(source: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...source };
  const custom = source.customFields;
  delete result.customFields;
  if (custom && typeof custom === 'object' && !Array.isArray(custom)) {
    Object.assign(result, custom);
  }
  return result;
}

const BASIC_BANK_CARD_GROUP_PREFIX = 'tab_staff_info.bank_card';

function isBasicBankCardGroup(groupCode = '') {
  const code = String(groupCode || '');
  if (!code) return false;
  if (code === 'staffAccountInfo') return true;
  return code.startsWith(BASIC_BANK_CARD_GROUP_PREFIX);
}

/** 按分组 code 取值的单条信息集。银行卡仍挂在 groupCode 下。 */
export function adaptRosterDetailGroupedForm(
  body: unknown,
  nestedGroup?: (groupCode: string) => boolean,
): RosterDetailFormData {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  const formData: RosterDetailFormData = {};
  Object.keys(body as Record<string, unknown>).forEach((groupCode) => {
    const groupValue = (body as Record<string, unknown>)[groupCode];
    if (
      !groupValue ||
      typeof groupValue !== 'object' ||
      Array.isArray(groupValue)
    ) {
      return;
    }
    const fieldMap = flattenCustomFields({
      ...(groupValue as Record<string, unknown>),
    });
    if (nestedGroup?.(groupCode) || isBasicBankCardGroup(groupCode)) {
      formData[groupCode] = [{ ...fieldMap }];
      return;
    }
    Object.assign(formData, fieldMap);
  });
  return formData;
}

/** 基础信息详情。失败兜底 {}。 */
export function adaptRosterDetailBasic(body: unknown): RosterDetailFormData {
  return adaptRosterDetailGroupedForm(body, isBasicBankCardGroup);
}

/** 多行 / 自定义信息集记录。失败兜底 []。 */
export function adaptRosterDetailRecords(body: unknown): RosterDetailRecord[] {
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object'
      ? [body]
      : [];
  return list
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => {
      const flat = flattenCustomFields(item as Record<string, unknown>);
      if (flat.id == null) flat.id = '';
      return flat;
    });
}

/** 直属领导：汇报类型编码 → 人员。失败兜底 {}。 */
export function adaptRosterDetailLeader(body: unknown): RosterDetailFormData {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  const formData: RosterDetailFormData = {};
  Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
    if (!key) return;
    formData[key] = value;
  });
  return formData;
}

function readRecordList(body: unknown) {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object') {
    const source = body as Record<string, unknown>;
    if (Array.isArray(source.records)) return source.records;
    if (Array.isArray(source.list)) return source.list;
  }
  return [];
}

/** 成长记录-异动。失败兜底 []。 */
export function adaptRosterDetailGrowthChanges(
  body: unknown,
): RosterDetailGrowthChange[] {
  return readRecordList(body)
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: readString(row, 'id'),
        changeDate: readString(row, 'changeDate'),
        operationTime: readString(row, 'operationTime'),
        changeType: readString(row, 'changeType'),
        detail: readString(row, 'detail'),
      };
    });
}

/** 成长记录-企业内任职。失败兜底 []。 */
export function adaptRosterDetailGrowthPositions(
  body: unknown,
): RosterDetailGrowthPosition[] {
  return readRecordList(body)
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: readString(row, 'id'),
        startDate: readString(row, 'startDate'),
        endDate: readString(row, 'endDate'),
        positionType: readString(row, 'positionType'),
        department: readString(row, 'department'),
        position: readString(row, 'position'),
        duty: readString(row, 'duty'),
        rank: readString(row, 'rank'),
        changeReason: readString(row, 'changeReason'),
        source: readString(row, 'source'),
        operator: readString(row, 'operator'),
        operationTime: readString(row, 'operationTime'),
      };
    });
}

function adaptCostRows(
  list: unknown,
  withProject = false,
): RosterDetailCostRow[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => {
      const row = item as Record<string, unknown>;
      const mapped: RosterDetailCostRow = {
        costCenterName: readString(row, 'costCenterName'),
        value:
          readString(row, 'value') ||
          readString(row, 'ratio') ||
          readString(row, 'amount'),
      };
      if (withProject) {
        mapped.costProjectName = readString(row, 'costProjectName');
      }
      return mapped;
    });
}

export const EMPTY_ROSTER_COST: RosterDetailCostData = {
  displayType: 0,
  ratioTotal: '',
  amountTotal: '',
  ratioRows: [],
  amountRows: [],
};

/** 展示形式：0 比例，1 金额。其它值按比例兜底。 */
function readCostDisplayType(value: unknown) {
  return Number(value) === 1 ? 1 : 0;
}

/** 成本中心详情。失败兜底空对象。 */
export function adaptRosterDetailCost(body: unknown): RosterDetailCostData {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ...EMPTY_ROSTER_COST, ratioRows: [], amountRows: [] };
  }
  const row = body as Record<string, unknown>;
  return {
    displayType: readCostDisplayType(row.displayType),
    ratioTotal: readString(row, 'ratioTotal'),
    amountTotal: readString(row, 'amountTotal'),
    ratioRows: adaptCostRows(row.ratioRows),
    amountRows: adaptCostRows(row.amountRows, true),
  };
}

function adaptAttachFile(item: unknown): RosterDetailAttachFile | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const row = item as Record<string, unknown>;
  const id = readString(row, 'id');
  const url = readString(row, 'url');
  if (!id && !url) return null;
  const mapped: RosterDetailAttachFile = {
    id: id || url,
    name: readString(row, 'name') || '附件',
    url,
  };
  const thumbUrl = readString(row, 'thumbUrl');
  if (thumbUrl) mapped.thumbUrl = thumbUrl;
  return mapped;
}

function adaptAttachGroup(item: unknown): RosterDetailAttachGroup | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const row = item as Record<string, unknown>;
  const groupCode = readString(row, 'groupCode');
  if (!groupCode) return null;
  const displayType =
    readString(row, 'displayType') === 'image' ? 'image' : 'file';
  const files = (Array.isArray(row.files) ? row.files : [])
    .map((file) => adaptAttachFile(file))
    .filter(Boolean) as RosterDetailAttachFile[];
  return {
    groupCode,
    groupName: readString(row, 'groupName') || groupCode,
    displayType,
    files,
  };
}

function adaptAttachTab(item: unknown): RosterDetailAttachTab | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const row = item as Record<string, unknown>;
  const code = readString(row, 'code');
  if (!code) return null;
  const groups = (Array.isArray(row.groups) ? row.groups : [])
    .map((group) => adaptAttachGroup(group))
    .filter(Boolean) as RosterDetailAttachGroup[];
  return {
    code,
    name: readString(row, 'name') || code,
    groups,
  };
}

/** 附件二级页。失败兜底 []。 */
export function adaptRosterDetailAttachments(
  body: unknown,
): RosterDetailAttachTab[] {
  if (Array.isArray(body)) {
    return body
      .map((item) => adaptAttachTab(item))
      .filter(Boolean) as RosterDetailAttachTab[];
  }
  if (!body || typeof body !== 'object') return [];
  const row = body as Record<string, unknown>;
  const attachments =
    row.attachments &&
    typeof row.attachments === 'object' &&
    !Array.isArray(row.attachments)
      ? (row.attachments as Record<string, unknown>)
      : row;
  const subTabs = Array.isArray(attachments.subTabs) ? attachments.subTabs : [];
  return subTabs
    .map((item) => adaptAttachTab(item))
    .filter(Boolean) as RosterDetailAttachTab[];
}

function toBoolFlag(value: unknown) {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }
  return undefined;
}

function readSort(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function sortTeamNodes(list: RosterTeamAuthNode[]) {
  return [...list].sort((prev, next) => (prev.sort || 0) - (next.sort || 0));
}

function readBuiltin(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  return toBoolFlag((raw as Record<string, unknown>).builtin) === true;
}

function adaptTeamFieldNode(raw: unknown, allowBuiltin = false) {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = readString(row, 'id') || readString(row, 'fieldCode');
  if (!id) return null;
  const node: RosterTeamAuthNode = {
    id,
    name: readString(row, 'fieldName') || id,
    nodeType: 'field',
    code: readString(row, 'fieldCode') || undefined,
    sort: readSort(row.sort),
  };
  if (allowBuiltin && readBuiltin(row.systemConfig)) node.builtin = true;
  return node;
}

function adaptTeamGroupNode(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = readString(row, 'id') || readString(row, 'groupCode');
  if (!id) return null;
  const fields = Array.isArray(row.fieldList) ? row.fieldList : [];
  const children = sortTeamNodes(
    fields
      .map((item) => adaptTeamFieldNode(item, true))
      .filter(Boolean) as RosterTeamAuthNode[],
  );
  const node: RosterTeamAuthNode = {
    id,
    name: readString(row, 'groupName') || id,
    nodeType: 'group',
    code: readString(row, 'groupCode') || undefined,
    sort: readSort(row.sort),
  };
  if (children.length) node.children = children;
  return node;
}

function adaptTeamSetNode(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = readString(row, 'id') || readString(row, 'setCode');
  if (!id) return null;
  const groups = Array.isArray(row.groupList) ? row.groupList : [];
  const setFields = Array.isArray(row.fieldList) ? row.fieldList : [];
  const children = [
    ...sortTeamNodes(
      groups
        .map((item) => adaptTeamGroupNode(item))
        .filter(Boolean) as RosterTeamAuthNode[],
    ),
    ...sortTeamNodes(
      setFields
        .map((item) => adaptTeamFieldNode(item, false))
        .filter(Boolean) as RosterTeamAuthNode[],
    ),
  ];
  const node: RosterTeamAuthNode = {
    id,
    name: readString(row, 'setName') || id,
    nodeType: 'module',
    code: readString(row, 'setCode') || undefined,
    sort: readSort(row.sort),
  };
  if (children.length) node.children = children;
  return node;
}

function readTeamSetList(body: unknown) {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object') {
    const list = (body as Record<string, unknown>).setList;
    if (Array.isArray(list)) return list;
  }
  return [];
}

/** 团队授权全部可选 / 已选字段树。失败兜底 []。 */
export function adaptRosterTeamAuthTree(body: unknown): RosterTeamAuthNode[] {
  return sortTeamNodes(
    readTeamSetList(body)
      .map((item) => adaptTeamSetNode(item))
      .filter(Boolean) as RosterTeamAuthNode[],
  );
}

/** 是否允许部门负责人查看。失败兜底 false。 */
export function adaptRosterTeamAuthBasic(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { isAllowDepartmentManagerView: false };
  }
  const row = body as Record<string, unknown>;
  return {
    isAllowDepartmentManagerView:
      toBoolFlag(row.isAllowDepartmentManagerView) ?? false,
  };
}
