import { adaptDeptStaffPage } from '../src/services/api/organization/org/entity';
import { adaptRosterStaffPage } from '../src/services/api/employee/roster/entity';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { flushPromises, mount } from '@vue/test-utils';
import { closeToast } from 'vant';
import Settings from '../src/pages/roster/settings/index.vue';
import RosterNav from '../src/pages/roster/components/RosterNav.vue';
import { useRosterStore } from '../src/pinia/stores/roster';
import {
  adaptRosterSettingsTree,
  toRosterSettingsSaveBody,
} from '../src/services/api/employee/roster/settings/entity';
import {
  getRosterSettingsOptionsApi,
  saveRosterSettingsApi,
} from '../src/services/api/employee/roster/settings';
import {
  ROSTER_TEAM_AUTH_BASIC_URL,
  ROSTER_TEAM_AUTH_LIST_URL,
} from '../src/services/api/employee/roster/config';
import {
  cloneSettings,
  mergeSettings,
  selectSettings,
  settingLeaves,
} from '../src/pages/roster/settings/utils/selection';
import { rosterSettingsMockState } from '../src/mock/mockApi/employee/roster/settings/data';
import { saveRosterSettingsMock } from '../src/mock/mockApi/employee/roster/settings/entity';

// 仅隔离网络边界，设置页、Vant、路由、Store 与全部转换逻辑使用真实实现。
const request = vi.hoisted(() => vi.fn());
vi.mock('@/services/api', () => ({ default: request }));

/** PC 已核实的保存地址。 */
const ROSTER_SETTINGS_SAVE_URL = '/dthr-base/v4/system-config/team-save';

const fixedField = {
  id: 'required-id',
  fieldCode: 'configured-required',
  fieldName: '必选字段',
  columnName: 'name',
  sort: 3,
  systemConfig: { builtin: true },
};
const avatar = {
  id: 'avatar-id',
  fieldCode: 'avatar-config',
  fieldName: '头像',
  columnName: 'avatar',
};
const name = {
  id: 'name-id',
  fieldCode: 'name-config',
  fieldName: '员工姓名',
  columnName: 'different',
};
const allRaw = [
  {
    id: 'set-id',
    setCode: 'tab_staff_info',
    setName: '基础信息',
    systemConfig: { builtin: true },
    groupList: [
      {
        id: 'group-id',
        groupCode: 'default',
        groupName: '默认分组',
        systemConfig: { builtin: true },
        fieldList: [fixedField, avatar, name],
      },
      { groupCode: 'another', groupName: '另一个分组', fieldList: [avatar] },
    ],
  },
  {
    setCode: 'education',
    setName: '教育经历',
    fieldList: [
      {
        id: 'school-id',
        fieldCode: 'school-config',
        fieldName: '学校及所学专业名称很长',
      },
    ],
  },
  { setCode: 'whole', setName: '整个信息集' },
  {
    setCode: 'empty-group-set',
    setName: '空分组信息集',
    groupList: [{ groupCode: 'empty-group', groupName: '整个分组' }],
  },
];
const selectedRaw = [
  {
    ...allRaw[0],
    groupList: [
      { ...allRaw[0].groupList![0], fieldList: [fixedField, avatar] },
    ],
  },
];
const initial = () => adaptRosterSettingsTree(selectedRaw, true);
let selectedBody: unknown;
let saveResult: { success: boolean; body: null | boolean; message?: string };
let failRefresh: boolean;
const wrappers: Array<{ unmount: () => void }> = [];

beforeEach(() => {
  // Vant 导航栏会延时测量高度，确保测试结束前清理这些定时任务。
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  selectedBody = structuredClone(selectedRaw);
  saveResult = { success: true, body: null };
  failRefresh = false;
  setActivePinia(createPinia());
  request.mockReset().mockImplementation(async ({ url, data, params }) => {
    if (url === ROSTER_TEAM_AUTH_LIST_URL && params?.type === 'appTeamAuth')
      return {
        success: true,
        body: { code: '200', msg: '操作成功', data: allRaw },
      };
    if (url === ROSTER_TEAM_AUTH_BASIC_URL)
      return { success: true, body: { isAllowDepartmentManagerView: false } };
    if (url === ROSTER_TEAM_AUTH_LIST_URL)
      return failRefresh
        ? { success: false }
        : { success: true, body: selectedBody };
    if (url === ROSTER_SETTINGS_SAVE_URL) {
      if (saveResult.success && saveResult.body !== false)
        selectedBody = data.setList;
      return saveResult;
    }
    throw new Error(`Unexpected request: ${url}`);
  });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  closeToast(true);
  vi.clearAllTimers();
  vi.useRealTimers();
});

async function mountPage(cached = false) {
  const pinia = createPinia();
  const store = useRosterStore(pinia);
  if (cached) await store.loadTeamAuth();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/roster',
        name: 'EmployeeRoster',
        component: { template: '<div />' },
      },
      {
        path: '/roster/settings',
        name: 'EmployeeRosterSettings',
        component: Settings,
      },
    ],
  });
  await router.push('/roster');
  await router.push('/roster/settings');
  await router.isReady();
  const wrapper = mount(Settings, { global: { plugins: [pinia, router] } });
  wrappers.push(wrapper);
  await flushPromises();
  return { wrapper, store, router };
}

function calls(url: string, type = 'appTeamAuthSelected') {
  return request.mock.calls.filter(
    ([config]) =>
      config.url === url &&
      (url !== ROSTER_TEAM_AUTH_LIST_URL || config.params?.type === type),
  );
}

describe('设置编码与 PC 提交结构', () => {
  it('保留接口 id、设置编码和顺序，提交不混入 columnName / fieldMapping', () => {
    const tree = initial();
    const body = toRosterSettingsSaveBody(tree, false);
    expect(body).toEqual({
      isAllowDepartmentManagerView: false,
      setList: [
        {
          id: 'set-id',
          setCode: 'tab_staff_info',
          setName: '基础信息',
          sort: 1,
          groupList: [
            {
              id: 'group-id',
              groupCode: 'default',
              groupName: '默认分组',
              sort: 1,
              fieldList: [
                {
                  id: 'avatar-id',
                  fieldCode: 'avatar-config',
                  fieldName: '头像',
                  sort: 1,
                },
                {
                  id: 'required-id',
                  fieldCode: 'configured-required',
                  fieldName: '必选字段',
                  sort: 3,
                },
              ],
            },
          ],
        },
      ],
    });
    expect(JSON.stringify(body)).not.toMatch(/columnName|fieldMapping|builtin/);
  });

  it.each([true, false, 'true', 1, undefined])(
    '固定项只识别已选最深字段的严格 true：%s',
    (builtin) => {
      const raw = [
        {
          setCode: 's',
          systemConfig: { builtin: true },
          groupList: [
            {
              groupCode: 'g',
              systemConfig: { builtin: true },
              fieldList: [{ fieldCode: 'f', systemConfig: { builtin } }],
            },
          ],
          fieldList: [{ fieldCode: 'direct', systemConfig: { builtin } }],
        },
      ];
      const selected = adaptRosterSettingsTree(raw, true);
      expect(selected[0].builtin).toBeUndefined();
      expect(selected[0].children![0].builtin).toBeUndefined();
      expect(settingLeaves(selected).map(({ node }) => !!node.builtin)).toEqual(
        [builtin === true, builtin === true],
      );
      expect(
        settingLeaves(adaptRosterSettingsTree(raw)).every(
          ({ node }) => !node.builtin,
        ),
      ).toBe(true);
    },
  );

  it.each([null, {}, { data: null }, [null, {}]])('空响应 %j 给空树', (raw) => {
    expect(adaptRosterSettingsTree(raw, true)).toEqual([]);
  });

  it('配置选择按所属路径区分同名同码字段，并删除清空的父节点', () => {
    const options = adaptRosterSettingsTree(allRaw);
    const leaves = settingLeaves(options);
    const another = leaves.find(({ key }) => key.includes('another'))!;
    const tree = selectSettings(options, [], new Set([another.key]));
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children![0].code).toBe('another');
    expect(selectSettings(options, tree, new Set())).toEqual([]);
  });

  it('已选顺序与缺失于选项的节点保留，整体信息集和空分组也可提交', () => {
    const before = adaptRosterSettingsTree(
      [{ setCode: 'orphan', setName: '原有信息集' }, ...selectedRaw],
      true,
    );
    const snapshot = cloneSettings(before);
    const options = mergeSettings(adaptRosterSettingsTree(allRaw), before);
    const result = selectSettings(
      options,
      before,
      new Set(settingLeaves(options).map(({ key }) => key)),
    );
    expect(result.slice(0, 2).map((item) => item.code)).toEqual([
      'orphan',
      'tab_staff_info',
    ]);
    expect(toRosterSettingsSaveBody(result, true).setList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ setCode: 'whole' }),
        expect.objectContaining({
          setCode: 'empty-group-set',
          groupList: [expect.objectContaining({ groupCode: 'empty-group' })],
        }),
      ]),
    );
    expect(before).toEqual(snapshot);
  });

  it('全量请求 appTeamAuth，保存使用 PC 核实地址并保留 false 返回值', async () => {
    const response = await getRosterSettingsOptionsApi();
    expect(request).toHaveBeenLastCalledWith({
      url: '/dthr-base/v4/system-config/list',
      method: 'get',
      params: { type: 'appTeamAuth' },
    });
    expect(response.body).toEqual(adaptRosterSettingsTree(allRaw));
    saveResult = { success: true, body: false };
    expect((await saveRosterSettingsApi(initial(), false)).body).toBe(false);
    expect(request).toHaveBeenLastCalledWith({
      url: '/dthr-base/v4/system-config/team-save',
      method: 'post',
      data: toRosterSettingsSaveBody(initial(), false),
    });
  });

  it('全量选项失败不能使用错误响应中的数据', async () => {
    request.mockResolvedValueOnce({ success: false, body: allRaw });
    expect((await getRosterSettingsOptionsApi()).body).toEqual([]);
  });
});

describe('设置页真实组件交互', () => {
  it('原已选整组回显全部子字段，修改后能部分取消，重置仍提交原分组快照', async () => {
    selectedBody = [
      {
        id: 'set-id',
        setCode: 'tab_staff_info',
        setName: '基础信息',
        groupList: [
          { id: 'group-id', groupCode: 'default', groupName: '默认分组' },
        ],
      },
    ];
    const expected = toRosterSettingsSaveBody(
      adaptRosterSettingsTree(selectedBody, true),
      false,
    );
    const { wrapper } = await mountPage();
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 3 个');
    // 全量的 builtin 不能把本次已选里没有固定标记的字段锁住。
    expect(
      wrapper.find('button[aria-label="必选字段"]').attributes('disabled'),
    ).toBeUndefined();
    await wrapper.find('button[aria-label="员工姓名"]').trigger('click');
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 2 个');
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[0]
      .trigger('click');
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 3 个');
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[1]
      .trigger('click');
    await flushPromises();
    expect(calls(ROSTER_SETTINGS_SAVE_URL)[0][0].data).toEqual(expected);
  });

  it('复用已选缓存，全量单独请求 appTeamAuth，不调用详情字段接口', async () => {
    const { wrapper } = await mountPage(true);
    expect(calls(ROSTER_TEAM_AUTH_LIST_URL)).toHaveLength(1);
    expect(calls(ROSTER_TEAM_AUTH_LIST_URL, 'appTeamAuth')).toHaveLength(1);
    expect(calls(ROSTER_TEAM_AUTH_LIST_URL)[0][0].params).toEqual({
      type: 'appTeamAuthSelected',
    });
    expect(request.mock.calls).toHaveLength(3);
    expect(wrapper.find('[aria-current="true"]').text()).toBe('基础信息');
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 2 个');
    expect(wrapper.findAll('.roster-settings-dot')).toHaveLength(1);
    expect(wrapper.find('.van-checkbox').attributes('aria-checked')).toBe(
      'mixed',
    );
  });

  it('固定字段禁取消，头像和员工姓名按标记正常选取，切页签保留选择', async () => {
    const { wrapper } = await mountPage();
    const fixed = wrapper.find('button[aria-label="必选字段，固定选中"]');
    expect(fixed.attributes('disabled')).toBeDefined();
    const avatars = wrapper.findAll('button[aria-label="头像"]');
    await avatars[0].trigger('click');
    expect(avatars[0].attributes('aria-checked')).toBe('false');
    await wrapper.find('button[aria-label="员工姓名"]').trigger('click');
    await wrapper.findAll('.roster-settings-tab')[1].trigger('click');
    await wrapper.find('.settings-fields-item').trigger('click');
    expect(wrapper.findAll('.roster-settings-dot')).toHaveLength(2);
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 3 个');
    await wrapper.findAll('.roster-settings-tab')[0].trigger('click');
    expect(
      wrapper.find('button[aria-label="员工姓名"]').attributes('aria-checked'),
    ).toBe('true');
    expect(
      wrapper
        .findAll('button[aria-label="头像"]')[1]
        .attributes('aria-checked'),
    ).toBe('false');
  });

  it('全选覆盖所有页签，再取消只保留固定字段，重置恢复完整进入快照', async () => {
    const { wrapper, store } = await mountPage();
    const snapshot = cloneSettings(store.settingsSelectedList);
    await wrapper.find('.van-checkbox').trigger('click');
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 7 个');
    await wrapper.find('.van-checkbox').trigger('click');
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 1 个');
    expect(wrapper.find('.van-checkbox').attributes('aria-checked')).toBe(
      'mixed',
    );
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[0]
      .trigger('click');
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 2 个');
    expect(store.settingsSelectedList).toEqual(snapshot);
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[1]
      .trigger('click');
    await flushPromises();
    expect(calls(ROSTER_SETTINGS_SAVE_URL)[0][0].data).toEqual(
      toRosterSettingsSaveBody(snapshot, false),
    );
  });

  it('保存成功后强制刷新共享缓存再退出，原基础开关 false 原样提交', async () => {
    const { wrapper, store, router } = await mountPage(true);
    const { version } = store;
    await wrapper.find('button[aria-label="员工姓名"]').trigger('click');
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[1]
      .trigger('click');
    await flushPromises();
    expect(calls(ROSTER_SETTINGS_SAVE_URL)).toHaveLength(1);
    expect(
      calls(ROSTER_SETTINGS_SAVE_URL)[0][0].data.isAllowDepartmentManagerView,
    ).toBe(false);
    expect(calls(ROSTER_TEAM_AUTH_LIST_URL)).toHaveLength(2);
    expect(store.version).toBe(version + 1);
    expect(router.currentRoute.value.name).toBe('EmployeeRoster');
  });

  it.each([
    { success: false, body: null },
    { success: true, body: false },
  ])('保存失败 %j 保留草稿且不刷新不退出', async (result) => {
    const { wrapper, router } = await mountPage();
    saveResult = result;
    await wrapper.find('button[aria-label="员工姓名"]').trigger('click');
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[1]
      .trigger('click');
    await flushPromises();
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 3 个');
    expect(calls(ROSTER_TEAM_AUTH_LIST_URL)).toHaveLength(1);
    expect(router.currentRoute.value.name).toBe('EmployeeRosterSettings');
    expect(document.body.textContent).toContain('保存失败');
  });

  it('保存后刷新失败明确显示并可只重试刷新，不重复提交', async () => {
    const { wrapper, router } = await mountPage();
    failRefresh = true;
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[1]
      .trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('EmployeeRosterSettings');
    expect(wrapper.text()).toContain('重试刷新');
    expect(document.body.textContent).toContain('保存已成功，刷新配置失败');
    failRefresh = false;
    await wrapper
      .findAll('.settings-actions-buttons .van-button')[1]
      .trigger('click');
    await flushPromises();
    expect(calls(ROSTER_SETTINGS_SAVE_URL)).toHaveLength(1);
    expect(calls(ROSTER_TEAM_AUTH_LIST_URL)).toHaveLength(3);
    expect(router.currentRoute.value.name).toBe('EmployeeRoster');
  });

  it.each([
    [ROSTER_TEAM_AUTH_LIST_URL, 'appTeamAuth'],
    [ROSTER_TEAM_AUTH_BASIC_URL, undefined],
    [ROSTER_TEAM_AUTH_LIST_URL, 'appTeamAuthSelected'],
  ])(
    '初始查询 %s type=%s 失败不允许空数据覆盖原设置',
    async (failedUrl, type) => {
      const normal = request.getMockImplementation()!;
      request.mockImplementation((config) =>
        config.url === failedUrl && config.params?.type === type
          ? Promise.resolve({ success: false, message: '配置加载失败' })
          : normal(config),
      );
      const { wrapper } = await mountPage();
      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
      expect(
        wrapper
          .findAll('.settings-actions-buttons .van-button')[1]
          .attributes('disabled'),
      ).toBeDefined();
      expect(calls(ROSTER_SETTINGS_SAVE_URL)).toHaveLength(0);
    },
  );

  it('无选项和已选时展示空状态，不编造固定姓名或头像', async () => {
    selectedBody = [];
    const normal = request.getMockImplementation()!;
    request.mockImplementation((config) =>
      config.url === ROSTER_TEAM_AUTH_LIST_URL &&
      config.params?.type === 'appTeamAuth'
        ? Promise.resolve({ success: true, body: [] })
        : normal(config),
    );
    const { wrapper } = await mountPage();
    expect(wrapper.text()).toContain('暂无可选配置');
    expect(wrapper.find('.settings-actions-count').text()).toBe('已选 0 个');
  });

  it('仅部门联系人显示设置入口并进入设置路由', async () => {
    const { router } = await mountPage();
    const nav = mount(RosterNav, { global: { plugins: [router] } });
    wrappers.push(nav);
    expect(nav.find('.roster-nav-setting').exists()).toBe(false);
    await nav.setProps({ isDeptContact: true });
    await router.push('/roster');
    await nav.find('.roster-nav-setting').trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('EmployeeRosterSettings');
  });
});

describe('缓存与 Mock 保存回读', () => {
  it('保存后的强制刷新不复用保存前在途请求', async () => {
    const store = useRosterStore();
    const pending = Promise.withResolvers<unknown>();
    request.mockReturnValueOnce(pending.promise);
    const first = store.loadTeamAuth();
    const forced = store.loadTeamAuth(true);
    pending.resolve({ success: true, body: selectedRaw });
    await Promise.all([first, forced]);
    expect(calls(ROSTER_TEAM_AUTH_LIST_URL)).toHaveLength(2);
    expect(store.settingsSelectedList).toEqual(initial());
  });

  it('保存 Mock 更新同一份已选状态并保留 columnName 与 builtin', () => {
    const previous = structuredClone(rosterSettingsMockState.selected);
    const basic = { ...rosterSettingsMockState.basic };
    const selected = adaptRosterSettingsTree(previous, true);
    const leaf = settingLeaves(selected).find(({ node }) => node.builtin)!;
    const draft = selectSettings(selected, selected, new Set([leaf.key]));
    try {
      expect(
        saveRosterSettingsMock(
          toRosterSettingsSaveBody(draft, basic.isAllowDepartmentManagerView),
        ).errorCode,
      ).toBe('000000');
      const fields = rosterSettingsMockState.selected.flatMap((set) =>
        (set.groupList || []).flatMap((group) => group.fieldList || []),
      );
      expect(fields).toHaveLength(1);
      expect(fields[0].columnName).toBe('name');
      expect(fields[0].systemConfig?.builtin).toBe(true);
    } finally {
      rosterSettingsMockState.selected = previous;
      rosterSettingsMockState.basic = basic;
    }
  });
});

describe('组织人员与花名册搜索使用各自明确的字段契约', () => {
  it('部门接口只转换 PC 字段，不能被搜索字段或未知别名覆盖', () => {
    const body = {
      total: 3,
      records: [
        {
          id: 'staff',
          staffName: 'PC姓名',
          workNumber: '001',
          staffImageId: 'pc-avatar',
          mobileNo: '123',
          departmentId: 'org',
          departmentName: 'PC部门',
          name: '搜索姓名',
          avatar: 'search-avatar',
          phone: '999',
          orgId: 'other',
          orgName: '搜索部门',
          assignDeptIds: ['part-time'],
        },
      ],
    };
    expect(adaptDeptStaffPage(body, 'org')).toEqual({
      total: 3,
      records: [
        {
          id: 'staff',
          name: 'PC姓名',
          staffNo: '001',
          avatar: 'pc-avatar',
          phone: '123',
          orgId: 'org',
          orgName: 'PC部门',
          concurrent: true,
        },
      ],
    });
    expect(adaptRosterStaffPage(body).records[0]).toMatchObject({
      name: '搜索姓名',
      avatar: 'search-avatar',
      phone: '999',
      orgId: 'other',
      orgName: '搜索部门',
    });
  });

  it('PC 字段缺失时给空值，不从搜索字段猜测回填；异常响应给空页', () => {
    expect(
      adaptDeptStaffPage(
        {
          records: [
            {
              id: 'staff',
              name: '搜索姓名',
              avatar: 'search-avatar',
              phone: '999',
              orgId: 'other',
              orgName: '搜索部门',
            },
          ],
        },
        'org',
      ).records[0],
    ).toMatchObject({
      name: '',
      staffNo: '',
      avatar: '',
      phone: '',
      orgId: '',
      orgName: '',
      concurrent: false,
    });
    expect(adaptDeptStaffPage(null, 'org')).toEqual({ records: [], total: 0 });
  });

  it('兼任依据 PC assignDeptIds 和当前部门计算，不读取搜索接口的 concurrent 标志', () => {
    const body = {
      records: [
        {
          id: 'staff',
          departmentId: 'main',
          assignDeptIds: ['part-time'],
          concurrent: false,
        },
      ],
    };
    expect(adaptDeptStaffPage(body, 'main').records[0].concurrent).toBe(true);
    expect(adaptDeptStaffPage(body, 'part-time').records[0].concurrent).toBe(
      true,
    );
    expect(adaptDeptStaffPage(body, 'other').records[0].concurrent).toBe(false);
  });
});
