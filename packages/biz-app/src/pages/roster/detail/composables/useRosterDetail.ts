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
  RosterDetailSet,
  RosterDetailTabItem,
  RosterStaff,
} from '@/types/employee/roster';
import {
  getRosterContextApi,
  getRosterDetailAllSetsApi,
  getRosterDetailAttachmentApi,
  getRosterDetailBasicApi,
  getRosterDetailCostApi,
  getRosterDetailGrowthChangeApi,
  getRosterDetailGrowthPositionApi,
  getRosterDetailLeaderApi,
  getRosterDetailMultiRecordApi,
  getRosterDetailSingleFormApi,
  getRosterDetailTabsApi,
  getRosterStaffApi,
} from '@/services/api/employee/roster';
import {
  ROSTER_DETAIL_BASIC_TAB,
  ROSTER_DETAIL_GROWTH_SUB_CHANGE,
} from '@/services/api/employee/roster/config';
import {
  buildRosterCascadeOptions,
  getRosterDetailTabKind,
} from '@/services/api/employee/roster/tab';

const EMPTY_COST = {
  ratioTotal: '',
  amountTotal: '',
  ratioRows: [],
  amountRows: [],
};

type TabCache = {
  kind: string;
  mode: 'single' | 'multi';
  formData: RosterDetailFormData;
  records: RosterDetailRecord[];
  growthChanges?: RosterDetailGrowthChange[];
  growthPositions?: RosterDetailGrowthPosition[];
  costData?: RosterDetailCostData;
  attachTabs?: RosterDetailAttachTab[];
};

/** 员工详情：进页拉页签 + 全量信息集，再按 Tab 取值 */
export function useRosterDetail() {
  const route = useRoute();
  const router = useRouter();

  /** 首屏加载 */
  const loading = ref(true);
  /** 列表里的当前员工，用来覆盖基础信息身份字段 */
  const staff = ref<RosterStaff | null>(null);
  /** 全量信息集，按 setCode 取分组字段 */
  const setMap = ref<Record<string, RosterDetailSet>>({});

  /** 路由员工 id */
  const staffId = computed(() => String(route.params.staffId || ''));

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
      const set = setMap.value[setCode];
      tabPanel.groups = set?.groups || [];
      tabPanel.kind = cached?.kind || 'empty';
      tabPanel.mode = cached?.mode || 'single';
      tabPanel.formData = cached?.formData || {};
      tabPanel.records = cached?.records || [];
      tabPanel.growthChanges = cached?.growthChanges || [];
      tabPanel.growthPositions = cached?.growthPositions || [];
      tabPanel.costData = cached?.costData || { ...EMPTY_COST };
      tabPanel.attachTabs = cached?.attachTabs || [];
    },
    applyResult(code: string, payload: TabCache) {
      tabPanel.cache[code] = payload;
      tabPanel.applyCache(code);
    },
    async loadValues() {
      const option = tabPanel.currentOption();
      const setCode = option?.setCode || '';
      if (!setCode) return;
      const child = tabPanel.currentChild();
      const subCode = child?.subCode || '';
      const builtin = tabPanel.list.find(
        (item) => item.code === setCode,
      )?.builtin;
      const kind = getRosterDetailTabKind(setCode, builtin);
      const key =
        kind === 'attachment' ? setCode : tabPanel.cacheKey(setCode, subCode);
      if (tabPanel.cache[key]) {
        tabPanel.applyCache(key);
        return;
      }
      tabPanel.kind = kind;
      tabPanel.loading = true;
      if (kind === 'basic') {
        const response = await getRosterDetailBasicApi({
          staffId: staffId.value,
        });
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          formData: overlayStaffIdentity(response.body || {}, staff.value),
          records: [],
        });
      } else if (kind === 'singleForm') {
        const response = await getRosterDetailSingleFormApi({
          staffId: staffId.value,
          tabCode: setCode,
        });
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          formData: response.body || {},
          records: [],
        });
      } else if (kind === 'leader') {
        const response = await getRosterDetailLeaderApi({
          staffId: staffId.value,
        });
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          formData: response.body || {},
          records: [],
        });
      } else if (kind === 'multiRecord') {
        const response = await getRosterDetailMultiRecordApi({
          staffId: staffId.value,
          tabCode: setCode,
          builtin,
        });
        tabPanel.applyResult(key, {
          kind,
          mode: 'multi',
          formData: {},
          records: response.body || [],
        });
      } else if (kind === 'growth') {
        if (subCode === ROSTER_DETAIL_GROWTH_SUB_CHANGE || !subCode) {
          const response = await getRosterDetailGrowthChangeApi({
            staffId: staffId.value,
          });
          tabPanel.applyResult(key, {
            kind,
            mode: 'single',
            formData: {},
            records: [],
            growthChanges: response.body || [],
          });
        } else {
          const response = await getRosterDetailGrowthPositionApi({
            staffId: staffId.value,
          });
          tabPanel.applyResult(key, {
            kind,
            mode: 'single',
            formData: {},
            records: [],
            growthPositions: response.body || [],
          });
        }
      } else if (kind === 'cost') {
        const response = await getRosterDetailCostApi({
          staffId: staffId.value,
        });
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          formData: {},
          records: [],
          costData: response.body || { ...EMPTY_COST },
        });
      } else if (kind === 'attachment') {
        const response = await getRosterDetailAttachmentApi({
          staffId: staffId.value,
        });
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          formData: {},
          records: [],
          attachTabs: response.body || [],
        });
      } else {
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          formData: {},
          records: [],
        });
      }
      tabPanel.loading = false;
    },
    async change(payload?: { active?: number[] }) {
      if (payload?.active) {
        tabPanel.active = payload.active.map((item) => Number(item) || 0);
      }
      await tabPanel.loadValues();
    },
  });
  /* ----页签面板end---- */

  /** 当前信息集名称，多行记录标题用 */
  const activeTabName = computed(() => tabPanel.currentOption()?.title || '');

  /** 当前二级编码 */
  const activeSubCode = computed(() => tabPanel.currentChild()?.subCode || '');

  function back() {
    router.back();
  }

  async function load() {
    loading.value = true;
    tabPanel.cache = {};
    tabPanel.groups = [];
    tabPanel.formData = {};
    tabPanel.records = [];
    tabPanel.growthChanges = [];
    tabPanel.growthPositions = [];
    tabPanel.attachTabs = [];
    tabPanel.costData = { ...EMPTY_COST };
    const [contextRes, staffRes, tabsRes, setsRes] = await Promise.all([
      getRosterContextApi(),
      getRosterStaffApi(),
      getRosterDetailTabsApi(),
      getRosterDetailAllSetsApi(),
    ]);
    if (!contextRes.success && !tabsRes.success) {
      showToast(tabsRes.message || contextRes.message || '加载失败');
    }
    /** 列表人员，用来对上当前员工 */
    const records = staffRes.body?.records || [];
    staff.value = records.find((item) => item.id === staffId.value) || null;
    /** 全量信息集 */
    const sets = setsRes.body || [];
    const nextMap: Record<string, RosterDetailSet> = {};
    sets.forEach((item) => {
      nextMap[item.setCode] = item;
    });
    setMap.value = nextMap;
    tabPanel.list = tabsRes.body?.length
      ? tabsRes.body
      : sets.map((item) => ({
          code: item.setCode,
          name: item.setName,
          builtin: item.builtin,
        }));
    tabPanel.options = buildRosterCascadeOptions(tabPanel.list);
    const basicIndex = tabPanel.options.findIndex(
      (item) => item.setCode === ROSTER_DETAIL_BASIC_TAB,
    );
    tabPanel.active = [basicIndex >= 0 ? basicIndex : 0, 0];
    if (!tabsRes.success) {
      showToast(tabsRes.message || '加载信息集失败');
    }
    await tabPanel.loadValues();
    loading.value = false;
  }

  watch(staffId, load, { immediate: true });

  return {
    loading,
    activeTabName,
    activeSubCode,
    tabPanel,
    back,
  };
}

/** 列表点进来的人，覆盖基础信息里的姓名 / 部门 / 工号 / 手机 */
function overlayStaffIdentity(
  formData: RosterDetailFormData,
  staff: RosterStaff | null,
) {
  if (!staff) return formData;
  return {
    ...formData,
    name: staff.name || formData.name,
    orgName: staff.deptName || formData.orgName,
    staffNo: staff.workNo || formData.staffNo,
    phone: staff.phone || formData.phone,
  };
}
