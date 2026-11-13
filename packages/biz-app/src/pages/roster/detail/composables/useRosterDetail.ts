import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import type {
  RosterCascadeOption,
  RosterDetailAttachTab,
  RosterDetailCostData,
  RosterDetailFormData,
  RosterDetailGroup,
  RosterDetailGrowthChange,
  RosterDetailGrowthPosition,
  RosterDetailRecord,
  RosterDetailTabItem,
} from '@/types/employee/roster';
import {
  getRosterDetailAttachmentApi,
  getRosterDetailBasicApi,
  getRosterDetailCostApi,
  getRosterDetailGrowthChangeApi,
  getRosterDetailGrowthPositionApi,
  getRosterDetailLeaderApi,
  getRosterDetailFormColumnsApi,
  getRosterDetailMultiRecordApi,
  getRosterDetailSingleFormApi,
  getRosterDetailTabsApi,
} from '@/services/api/employee/roster';
import {
  ROSTER_DETAIL_BASIC_TAB,
  ROSTER_DETAIL_GROWTH_SUB_CHANGE,
} from '@/services/api/employee/roster/config';
import {
  buildRosterCascadeOptions,
  getRosterDetailTabKind,
} from '@/services/api/employee/roster/tab';
import { useRosterStore } from '@/pinia/stores/roster';

/** 基础信息、单条、直属领导、多行这些 Tab 才拉字段配置。 */
function needsFormColumns(kind: string) {
  return (
    kind === 'basic' ||
    kind === 'singleForm' ||
    kind === 'leader' ||
    kind === 'multiRecord'
  );
}

const EMPTY_COST = {
  displayType: 0,
  ratioTotal: '',
  amountTotal: '',
  ratioRows: [],
  amountRows: [],
};

type TabCache = {
  kind: string;
  mode: 'single' | 'multi';
  groups: RosterDetailGroup[];
  formData: RosterDetailFormData;
  records: RosterDetailRecord[];
  growthChanges?: RosterDetailGrowthChange[];
  growthPositions?: RosterDetailGrowthPosition[];
  costData?: RosterDetailCostData;
  attachTabs?: RosterDetailAttachTab[];
};

type TabLoadResult = { data?: TabCache; message?: string };

/** 员工详情：进页拉页签，切 Tab 时按 setCode 拉这一页字段和详情 */
export function useRosterDetail() {
  const route = useRoute();
  const router = useRouter();

  /** 首屏加载 */
  const loading = ref(true);
  const rosterStore = useRosterStore();
  /** 接口页签原文，授权变化时再裁一次 */
  const rawTabList = ref<RosterDetailTabItem[]>([]);

  /** 路由员工 id */
  const staffId = computed(() => String(route.params.staffId || ''));

  /** 同一员工、同一页签的并发加载共用请求；切换员工时整体重建。 */
  let pendingTabs = new Map<string, Promise<TabLoadResult>>();

  /* ----页签面板start---- */
  const tabPanel = reactive({
    list: [] as RosterDetailTabItem[],
    options: [] as RosterCascadeOption[],
    active: [0, 0] as number[],
    loading: false,
    cache: {} as Record<string, TabCache>,
    kind: 'basic',
    mode: 'single' as 'single' | 'multi',
    groups: [] as RosterDetailGroup[],
    formData: {} as RosterDetailFormData,
    records: [] as RosterDetailRecord[],
    growthChanges: [] as RosterDetailGrowthChange[],
    growthPositions: [] as RosterDetailGrowthPosition[],
    costData: { ...EMPTY_COST } as RosterDetailCostData,
    attachTabs: [] as RosterDetailAttachTab[],
    currentOption() {
      return tabPanel.options[tabPanel.active[0]] || null;
    },
    currentChild() {
      const option = tabPanel.currentOption();
      return option?.children?.[tabPanel.active[1]] || null;
    },
    cacheKey(setCode: string, subCode = '') {
      return subCode ? `${setCode}:${subCode}` : setCode;
    },
    applyCache(code: string) {
      const cached = tabPanel.cache[code];
      const setCode = code.split(':')[0];
      tabPanel.groups = rosterStore.resolveGroups(
        setCode,
        cached?.groups || [],
      );
      tabPanel.kind = cached?.kind || 'empty';
      tabPanel.mode = cached?.mode || 'single';
      tabPanel.formData = cached?.formData || {};
      tabPanel.records = cached?.records || [];
      tabPanel.growthChanges = cached?.growthChanges || [];
      tabPanel.growthPositions = cached?.growthPositions || [];
      tabPanel.costData = cached?.costData || { ...EMPTY_COST };
      tabPanel.attachTabs = cached?.attachTabs || [];
    },
    async loadValues() {
      const tab = readActiveTab();
      const { setCode, kind, key } = tab;
      // 先应用当前缓存；无页签或无缓存时清空上一页的数据。
      const {cache} = tabPanel;
      tabPanel.applyCache(key);
      tabPanel.loading = false;
      if (!setCode || cache[key]) return;
      tabPanel.kind = kind;
      tabPanel.loading = true;
      const requests = pendingTabs;
      let request = requests.get(key);
      if (!request) {
        request = loadTabValues(tab, staffId.value);
        requests.set(key, request);
      }
      try {
        const response = await request;
        // 员工缓存已更换时，旧响应不再写入；切走的页签仅缓存成功结果。
        if (tabPanel.cache !== cache) return;
        if (response.data) cache[key] = response.data;
        if (readActiveTab().key !== key) return;
        tabPanel.applyCache(key);
        if (response.message) showToast(response.message);
      } finally {
        if (requests.get(key) === request) requests.delete(key);
        if (tabPanel.cache === cache && readActiveTab().key === key) {
          tabPanel.loading = false;
        }
      }
    },
    async change(payload?: { active?: number[] }) {
      if (payload?.active) {
        tabPanel.active = payload.active.map((item) => Number(item) || 0);
      }
      await tabPanel.loadValues();
    },
  });
  /* ----页签面板end---- */

  /** 字段与详情并行请求，只将完整成功的结果交给缓存。 */
  async function loadTabValues(
    { setCode, subCode, builtin, kind }: ReturnType<typeof readActiveTab>,
    employeeId: string,
  ): Promise<TabLoadResult> {
    const result: TabCache = {
      kind,
      mode: 'single',
      groups: [],
      formData: {},
      records: [],
    };
    const params = { staffId: employeeId };
    async function loadData() {
      if (kind === 'basic' || kind === 'singleForm' || kind === 'leader') {
        const response = await (kind === 'basic'
          ? getRosterDetailBasicApi(params)
          : kind === 'singleForm'
            ? getRosterDetailSingleFormApi({ ...params, tabCode: setCode })
            : getRosterDetailLeaderApi(params));
        result.formData = response.body || {};
        return response;
      }
      if (kind === 'multiRecord') {
        const response = await getRosterDetailMultiRecordApi({
          ...params,
          tabCode: setCode,
          builtin,
        });
        result.mode = 'multi';
        result.records = response.body || [];
        return response;
      }
      if (kind === 'growth') {
        if (subCode === ROSTER_DETAIL_GROWTH_SUB_CHANGE || !subCode) {
          const response = await getRosterDetailGrowthChangeApi(params);
          result.growthChanges = response.body || [];
          return response;
        }
        const response = await getRosterDetailGrowthPositionApi(params);
        result.growthPositions = response.body || [];
        return response;
      }
      if (kind === 'cost') {
        const response = await getRosterDetailCostApi(params);
        result.costData = response.body || { ...EMPTY_COST };
        return response;
      }
      if (kind === 'attachment') {
        const response = await getRosterDetailAttachmentApi(params);
        result.attachTabs = response.body || [];
        return response;
      }
      return { success: true, message: '' };
    }
    const [columns, response] = await Promise.all([
      needsFormColumns(kind)
        ? getRosterDetailFormColumnsApi({ setCode })
        : Promise.resolve({ success: true, body: { groups: [] }, message: '' }),
      loadData(),
    ]);
    if (!columns.success) return { message: columns.message || '加载字段失败' };
    if (!response.success)
      return { message: response.message || '加载详情失败' };
    result.groups = columns.body?.groups || [];
    return { data: result };
  }

  /** 加载详情和授权刷新共用当前页签解析，附件仍共用一级页签缓存。 */
  function readActiveTab() {
    const setCode = tabPanel.currentOption()?.setCode || '';
    const subCode = tabPanel.currentChild()?.subCode || '';
    const builtin = tabPanel.list.find(
      (item) => item.code === setCode,
    )?.builtin;
    const kind = getRosterDetailTabKind(setCode);
    const key =
      kind === 'attachment' ? setCode : tabPanel.cacheKey(setCode, subCode);
    return { setCode, subCode, builtin, kind, key };
  }

  /** 当前信息集名称，多行记录标题用 */
  const activeTabName = computed(() => tabPanel.currentOption()?.title || '');

  /** 当前二级编码 */
  const activeSubCode = computed(() => tabPanel.currentChild()?.subCode || '');

  function back() {
    router.back();
  }

  function applyTabList() {
    // 必须在重建选项前记住编码，不能用过滤后的旧下标定位页签。
    const current = readActiveTab();
    tabPanel.list = rosterStore.filterTabs(rawTabList.value);
    tabPanel.options = buildRosterCascadeOptions(tabPanel.list);
    const nextIndex = tabPanel.options.findIndex(
      (item) => item.setCode === current.setCode,
    );
    if (nextIndex >= 0) {
      const childIndex =
        tabPanel.options[nextIndex].children?.findIndex(
          (item) => item.subCode === current.subCode,
        ) ?? -1;
      tabPanel.active = [nextIndex, childIndex >= 0 ? childIndex : 0];
      return;
    }
    const basicIndex = tabPanel.options.findIndex(
      (item) => item.setCode === ROSTER_DETAIL_BASIC_TAB,
    );
    tabPanel.active = [basicIndex >= 0 ? basicIndex : 0, 0];
  }

  async function load() {
    loading.value = true;
    tabPanel.cache = {};
    pendingTabs = new Map();
    const {cache} = tabPanel;
    rawTabList.value = [];
    tabPanel.applyCache('');
    tabPanel.loading = false;
    try {
      const [tabsRes] = await Promise.all([
        getRosterDetailTabsApi(),
        rosterStore.loadTeamAuth(),
      ]);
      if (tabPanel.cache !== cache) return;
      rawTabList.value = tabsRes.body || [];
      applyTabList();
      if (!tabsRes.success) showToast(tabsRes.message || '加载信息集失败');
      await tabPanel.loadValues();
    } finally {
      if (tabPanel.cache === cache) loading.value = false;
    }
  }

  watch(staffId, load, { immediate: true });

  watch(
    () => rosterStore.version,
    async () => {
      applyTabList();
      // 同页签只重裁缓存；切换到未加载页签时请求，无授权时清空。
      await tabPanel.loadValues();
    },
  );

  return {
    loading,
    activeTabName,
    activeSubCode,
    tabPanel,
    back,
  };
}
