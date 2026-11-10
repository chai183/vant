import type {
  RosterContext,
  RosterStaff,
  RosterStaffPage,
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
