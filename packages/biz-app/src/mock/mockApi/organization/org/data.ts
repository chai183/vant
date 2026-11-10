import { ROSTER_UNGROUPED_ORG_ID } from '@/services/api/organization/org/config';

/** 组织完整树样例。人数字段对齐 PC：onDutyCount 直属，onDutyTotalCount 含下级 */
export const rosterOrgTree = [
  {
    id: 'org-group',
    orgName: '办公室',
    parentOrgId: '',
    status: '1',
    onDutyCount: 3,
    onDutyTotalCount: 3,
    childrenOrgs: [],
  },
  {
    id: 'org-mid',
    orgName: '计划财务中心',
    parentOrgId: '',
    status: '1',
    onDutyCount: 0,
    onDutyTotalCount: 56,
    childrenOrgs: [
      {
        id: 'org-fin',
        orgName: '财务部',
        parentOrgId: 'org-mid',
        status: '1',
        onDutyCount: 3,
        onDutyTotalCount: 20,
        childrenOrgs: [
          {
            id: 'org-fin-1',
            orgName: '财务一部',
            parentOrgId: 'org-fin',
            status: '1',
            onDutyCount: 3,
            onDutyTotalCount: 12,
            childrenOrgs: [
              {
                id: 'org-fin-1-a',
                orgName: '会计核算室',
                parentOrgId: 'org-fin-1',
                status: '1',
                onDutyCount: 0,
                onDutyTotalCount: 3,
                childrenOrgs: [
                  {
                    id: 'org-leaf',
                    orgName: '核算一组',
                    parentOrgId: 'org-fin-1-a',
                    status: '1',
                    onDutyCount: 3,
                    onDutyTotalCount: 3,
                    childrenOrgs: [],
                  },
                ],
              },
              {
                id: 'org-fin-1-b',
                orgName: '资金管理室',
                parentOrgId: 'org-fin-1',
                status: '1',
                onDutyCount: 2,
                onDutyTotalCount: 56,
                childrenOrgs: [],
              },
              {
                id: 'org-fin-1-c',
                orgName: '税务管理室',
                parentOrgId: 'org-fin-1',
                status: '1',
                onDutyCount: 2,
                onDutyTotalCount: 2,
                childrenOrgs: [],
              },
            ],
          },
          {
            id: 'org-fin-2',
            orgName: '财务二部',
            parentOrgId: 'org-fin',
            status: '1',
            onDutyCount: 0,
            onDutyTotalCount: 6,
            childrenOrgs: [
              {
                id: 'org-fin-2-a',
                orgName: '结算室',
                parentOrgId: 'org-fin-2',
                status: '1',
                onDutyCount: 1,
                onDutyTotalCount: 3,
                childrenOrgs: [],
              },
              {
                id: 'org-fin-2-b',
                orgName: '费用管理室',
                parentOrgId: 'org-fin-2',
                status: '1',
                onDutyCount: 1,
                onDutyTotalCount: 56,
                childrenOrgs: [],
              },
              {
                id: 'org-fin-2-c',
                orgName: '报表管理室',
                parentOrgId: 'org-fin-2',
                status: '1',
                onDutyCount: 1,
                onDutyTotalCount: 2,
                childrenOrgs: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'org-small',
    orgName: '人力资源部',
    parentOrgId: '',
    status: '1',
    onDutyCount: 2,
    onDutyTotalCount: 2,
    childrenOrgs: [],
  },
];

function staff(
  id: string,
  name: string,
  workNo: string,
  phone: string,
  deptId: string,
  deptName: string,
  concurrent = false,
) {
  return { id, name, workNo, phone, deptId, deptName, concurrent };
}

/** 按部门备好的直属人员。Mock 按 orgId 取对应一份，不在这里做关键字筛选 */
export const rosterStaffByOrg: Record<string, ReturnType<typeof staff>[]> = {
  [ROSTER_UNGROUPED_ORG_ID]: [
    staff(
      'staff-1',
      '小明',
      'AB1232',
      '15858888888',
      'org-group',
      '办公室',
      true,
    ),
    staff(
      'staff-2',
      '小红',
      'AB1232',
      '15858888888',
      'org-fin',
      '财务部',
      true,
    ),
    staff(
      'staff-3',
      '小白',
      'AB1232',
      '15858888888',
      'org-small',
      '公司金融部大客户业务管理中心华东分部',
      false,
    ),
  ],
  'org-group': [
    staff('staff-g1', '赵六', 'AB1001', '13800000001', 'org-group', '办公室'),
    staff('staff-g2', '钱七', 'AB1002', '13800000002', 'org-group', '办公室'),
    staff('staff-g3', '孙八', 'AB1003', '13800000003', 'org-group', '办公室'),
  ],
  'org-fin': [
    staff('staff-f1', '周九', 'AB2001', '13800000011', 'org-fin', '财务部'),
    staff(
      'staff-f2',
      '吴十',
      'AB2002',
      '13800000012',
      'org-fin',
      '财务部',
      true,
    ),
    staff('staff-f3', '郑一', 'AB2003', '13800000013', 'org-fin', '财务部'),
  ],
  'org-fin-1': [
    staff('staff-a1', '张三', 'AB1232', '15858888888', 'org-fin-1', '财务一部'),
    staff('staff-a2', '李四', 'AB1232', '15858888888', 'org-fin-1', '财务一部'),
    staff('staff-a3', '王五', 'AB1232', '15858888888', 'org-fin-1', '财务一部'),
  ],
  'org-fin-2': [],
  'org-leaf': [
    staff('staff-l1', '张三', 'AB1232', '15858888888', 'org-leaf', '核算一组'),
    staff('staff-l2', '李四', 'AB1232', '15858888888', 'org-leaf', '核算一组'),
    staff('staff-l3', '王五', 'AB1232', '15858888888', 'org-leaf', '核算一组'),
  ],
  'org-small': [
    staff(
      'staff-s1',
      '冯二',
      'AB3001',
      '13800000021',
      'org-small',
      '人力资源部',
    ),
    staff(
      'staff-s2',
      '陈三',
      'AB3002',
      '13800000022',
      'org-small',
      '人力资源部',
    ),
  ],
  'org-fin-1-b': [
    staff(
      'staff-b1',
      '褚四',
      'AB4001',
      '13800000031',
      'org-fin-1-b',
      '资金管理室',
    ),
    staff(
      'staff-b2',
      '卫五',
      'AB4002',
      '13800000032',
      'org-fin-1-b',
      '资金管理室',
    ),
  ],
  'org-fin-1-c': [
    staff(
      'staff-c1',
      '蒋六',
      'AB4003',
      '13800000033',
      'org-fin-1-c',
      '税务管理室',
    ),
    staff(
      'staff-c2',
      '沈七',
      'AB4004',
      '13800000034',
      'org-fin-1-c',
      '税务管理室',
    ),
  ],
};

export const rosterAllStaff = Object.values(rosterStaffByOrg).flat();

export const rosterContext = {
  myDeptId: 'org-fin-1',
  myDeptName: '财务一部',
  isOrgLeader: true,
  contacts: [
    staff('staff-a1', '张三', 'AB1232', '15858888888', 'org-fin-1', '外部员工'),
    staff('staff-a2', '李四', 'AB1232', '15858888888', 'org-fin-1', '采购部'),
    staff(
      'staff-a3',
      '王五',
      'AB1232',
      '15858888888',
      'org-fin-1',
      '公司金融部大客户业务管理中心',
    ),
  ],
};
