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

/** 银行卡是否默认。只读详情末尾手动补，展示是 / 否。 */
const BANK_CARD_DEFAULT_FLAG = 'defaultFlag';

function isBankCardGroup(groupCode = '') {
  return String(groupCode || '').includes('.bank_card');
}

/** 基础信息、单条、直属领导、多行这些 Tab 才拉字段配置。 */
function needsFormColumns(kind: string) {
  return (
    kind === 'basic' ||
    kind === 'singleForm' ||
    kind === 'leader' ||
    kind === 'multiRecord'
  );
}

function appendBankCardDefaultField(groups: RosterDetailGroup[]) {
  return groups.map((group) => {
    if (!isBankCardGroup(group.groupCode)) return group;
    const fields = (group.fields || []).filter(
      (item) => item.fieldCode !== BANK_CARD_DEFAULT_FLAG,
    );
    return {
      ...group,
      fields: [
        ...fields,
        {
          fieldCode: BANK_CARD_DEFAULT_FLAG,
          fieldName: '是否默认',
          fieldType: 'BOOLEAN',
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
      ],
    };
  });
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
      tabPanel.groups = appendBankCardDefaultField(
        rosterStore.filterGroups(setCode, cached?.groups || []),
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
      const groupsPromise = needsFormColumns(kind)
        ? loadFormGroups(setCode)
        : Promise.resolve([] as RosterDetailGroup[]);
      if (kind === 'basic') {
        const [groups, response] = await Promise.all([
          groupsPromise,
          getRosterDetailBasicApi({
            staffId: staffId.value,
          }),
        ]);
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          groups,
          formData: response.body || {},
          records: [],
        });
      } else if (kind === 'singleForm') {
        const [groups, response] = await Promise.all([
          groupsPromise,
          getRosterDetailSingleFormApi({
            staffId: staffId.value,
            tabCode: setCode,
          }),
        ]);
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          groups,
          formData: response.body || {},
          records: [],
        });
      } else if (kind === 'leader') {
        const [groups, response] = await Promise.all([
          groupsPromise,
          getRosterDetailLeaderApi({
            staffId: staffId.value,
          }),
        ]);
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          groups,
          formData: response.body || {},
          records: [],
        });
      } else if (kind === 'multiRecord') {
        const [groups, response] = await Promise.all([
          groupsPromise,
          getRosterDetailMultiRecordApi({
            staffId: staffId.value,
            tabCode: setCode,
            builtin,
          }),
        ]);
        tabPanel.applyResult(key, {
          kind,
          mode: 'multi',
          groups,
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
            groups: [],
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
            groups: [],
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
          groups: [],
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
          groups: [],
          formData: {},
          records: [],
          attachTabs: response.body || [],
        });
      } else {
        tabPanel.applyResult(key, {
          kind,
          mode: 'single',
          groups: [],
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

  function applyTabList() {
    tabPanel.list = rosterStore.filterTabs(rawTabList.value);
    tabPanel.options = buildRosterCascadeOptions(tabPanel.list);
    const currentCode = tabPanel.options[tabPanel.active[0]]?.setCode;
    const nextIndex = tabPanel.options.findIndex(
      (item) => item.setCode === currentCode,
    );
    if (nextIndex >= 0) {
      tabPanel.active = [nextIndex, tabPanel.active[1] || 0];
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
    tabPanel.groups = [];
    tabPanel.formData = {};
    tabPanel.records = [];
    tabPanel.growthChanges = [];
    tabPanel.growthPositions = [];
    tabPanel.attachTabs = [];
    tabPanel.costData = { ...EMPTY_COST };
    const [tabsRes] = await Promise.all([
      getRosterDetailTabsApi(),
      rosterStore.loadTeamAuth(),
    ]);
    rawTabList.value = tabsRes.body || [];
    applyTabList();
    if (!tabsRes.success) {
      showToast(tabsRes.message || '加载信息集失败');
    }
    await tabPanel.loadValues();
    loading.value = false;
  }

  watch(staffId, load, { immediate: true });

  watch(
    () => rosterStore.version,
    () => {
      if (loading.value) return;
      applyTabList();
      const option = tabPanel.currentOption();
      const setCode = option?.setCode || '';
      if (!setCode) return;
      const kind = getRosterDetailTabKind(
        setCode,
        tabPanel.list.find((item) => item.code === setCode)?.builtin,
      );
      const key =
        kind === 'attachment'
          ? setCode
          : tabPanel.cacheKey(setCode, tabPanel.currentChild()?.subCode || '');
      if (tabPanel.cache[key]) tabPanel.applyCache(key);
    },
  );

  /** 当前 Tab 的分组字段。和详情一起拉，查询参数带 setCode。 */
  async function loadFormGroups(setCode: string) {
    const response = await getRosterDetailFormColumnsApi({ setCode });
    if (!response.success) {
      showToast(response.message || '加载字段失败');
    }
    return response.body?.groups || [];
  }

  return {
    loading,
    activeTabName,
    activeSubCode,
    tabPanel,
    back,
  };
}
