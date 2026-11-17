import { computed, ref, watch } from 'vue';
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from 'vue-router';
import { cloneDeep, isEqual } from 'lodash-es';
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { useRosterStore } from '@/pinia/stores/roster';
import {
  getRosterDetailTabsApi,
  getRosterDetailGrowthChangeApi,
  getRosterDetailGrowthPositionApi,
  getRosterDetailCostApi,
  getRosterDetailAttachmentApi,
} from '@/services/api/employee/roster';
import { ROSTER_DETAIL_BASIC_TAB } from '@/services/api/employee/roster/config';
import { getRosterDetailTabKind } from '@/services/api/employee/roster/tab';
import {
  getArchiveSchemaApi,
  getArchivePermissionsApi,
  getArchiveWorkflowApi,
  submitArchiveApi,
  getArchiveRecordsApi,
} from '@/services/api/employeeArchive';
import {
  ARCHIVE_ADDABLE_SETS,
  ARCHIVE_DISCARD_MESSAGE,
} from '@/services/api/employeeArchive/config';
import type {
  ArchiveDraft,
  ArchivePending,
  ArchivePermission,
  ArchiveRecord,
  ArchiveSchema,
} from '@/types/employeeArchive';
import type {
  RosterDetailTabItem,
  RosterDetailGrowthChange,
  RosterDetailGrowthPosition,
  RosterDetailCostData,
  RosterDetailAttachTab,
} from '@/types/employee/roster';
import {
  archiveDrafts,
  archiveTeamSchema,
  archiveEditSchema,
  buildArchiveSubmission,
} from '../utils/permissions';

type ArchivePanel = {
  schema: ArchiveSchema;
  records: ArchiveRecord[];
  pending: ArchivePending[];
  multi: boolean;
  kind: string;
  changes?: RosterDetailGrowthChange[];
  positions?: RosterDetailGrowthPosition[];
  cost?: RosterDetailCostData;
  attachments?: RosterDetailAttachTab[];
};

function emptyPanel(): ArchivePanel {
  return {
    schema: { setCode: '', setName: '', groupList: [] },
    records: [],
    pending: [],
    multi: false,
    kind: 'empty',
  };
}

export function useEmployeeArchive() {
  /** 宿主通过 query.id 或路径 id 传入员工 ID，不读取其他员工列表推断本人。 */
  const route = useRoute();
  const router = useRouter();
  const staffId = computed(() =>
    String(route.params.id || route.query.id || ''),
  );
  /** 团队展示配置复用花名册缓存，个人权限只属于档案编辑。 */
  const store = useRosterStore();
  const rawTabs = ref<RosterDetailTabItem[]>([]);
  const permissions = ref<ArchivePermission[]>([]);
  const permissionsReady = ref(false);
  /** 当前页签与内容缓存，离开后不保留未提交草稿。 */
  const activeCode = ref('');
  const panel = ref<ArchivePanel>(emptyPanel());
  const cache = new Map<string, ArchivePanel>();
  /** 加载和提交状态。 */
  const loading = ref(false);
  const error = ref('');
  const saving = ref(false);
  const editing = ref(false);
  /** 单条信息集也使用一条草稿记录，字段按分组保存。 */
  const drafts = ref<ArchiveDraft[]>([]);
  let initialDrafts: ArchiveDraft[] = [];
  /** 记录是否已保存但回读失败，失败时可以只重试回读。 */
  const savedNeedsRefresh = ref(false);

  /** 页签仅按团队配置裁剪，不受个人授权隐藏影响。 */
  const tabs = computed(() =>
    store.ready ? store.filterTabs(rawTabs.value) : [],
  );
  /** 完整元数据先按团队配置过滤，原始缓存不被改写。 */
  const readSchema = computed(() =>
    archiveTeamSchema(panel.value.schema, store.selectedList),
  );
  /** 编辑权限叠加在团队范围之内。 */
  const editSchema = computed(() =>
    archiveEditSchema(readSchema.value, permissions.value),
  );
  /** 只有字段明确可编辑才提供编辑入口。 */
  const canEdit = computed(
    () =>
      permissionsReady.value &&
      editSchema.value.groupList.some((group) =>
        group.fieldList.some((field) => field.permission === 'editable'),
      ),
  );
  /** 教育经历、工作经历支持新增；新增记录提交后不再显示本地删除操作。 */
  const canAdd = computed(
    () => ARCHIVE_ADDABLE_SETS.includes(activeCode.value) && canEdit.value,
  );
  /** 每次只比较当前草稿，未改动时离开不弹确认。 */
  const dirty = computed(
    () => editing.value && !isEqual(drafts.value, initialDrafts),
  );
  /** 复用普通 Tab 的切换拦截。 */
  const title = computed(
    () => tabs.value.find((tab) => tab.code === activeCode.value)?.name || '',
  );

  function showError(cause: unknown) {
    error.value = cause instanceof Error ? cause.message : '加载档案失败';
  }

  async function readPanel(tab: RosterDetailTabItem): Promise<ArchivePanel> {
    const kind = getRosterDetailTabKind(tab.code);
    const result = emptyPanel();
    result.kind = kind;
    if (kind === 'growth') {
      const [changes, positions] = await Promise.all([
        getRosterDetailGrowthChangeApi({ staffId: staffId.value }),
        getRosterDetailGrowthPositionApi({ staffId: staffId.value }),
      ]);
      if (!changes.success || !positions.success)
        throw new Error('加载成长记录失败');
      return {
        ...result,
        changes: changes.body || [],
        positions: positions.body || [],
      };
    }
    if (kind === 'cost') {
      const response = await getRosterDetailCostApi({ staffId: staffId.value });
      if (!response.success)
        throw new Error(response.message || '加载成本信息失败');
      return { ...result, cost: response.body };
    }
    if (kind === 'attachment') {
      const response = await getRosterDetailAttachmentApi({
        staffId: staffId.value,
      });
      if (!response.success)
        throw new Error(response.message || '加载附件失败');
      return { ...result, attachments: response.body || [] };
    }
    if (kind === 'empty') return result;
    const [metadata, workflow] = await Promise.all([
      getArchiveSchemaApi(tab.code),
      getArchiveWorkflowApi(staffId.value, tab.code),
    ]);
    if (!metadata.success || !workflow.success)
      throw new Error(
        metadata.message || workflow.message || '加载档案配置失败',
      );
    result.schema = metadata.body;
    result.multi =
      metadata.body.singleDataFlag != null
        ? metadata.body.singleDataFlag === 0
        : kind === 'multiRecord';
    result.pending = workflow.body.pending;
    // Mock 状态显式返回已生效记录时使用该记录，否则查询花名册原详情。
    if (workflow.body.records !== null)
      return { ...result, records: workflow.body.records };
    const response = await getArchiveRecordsApi(staffId.value, metadata.body);
    if (!response.success)
      throw new Error(response.message || '加载档案内容失败');
    result.records = response.body;
    return result;
  }

  async function loadTab(force = false) {
    const id = staffId.value;
    const code = activeCode.value;
    const tab = tabs.value.find((item) => item.code === code);
    if (!tab) {
      panel.value = emptyPanel();
      return;
    }
    loading.value = true;
    error.value = '';
    if (!force) panel.value = emptyPanel();
    try {
      const next =
        !force && cache.has(code) ? cache.get(code)! : await readPanel(tab);
      if (id !== staffId.value || code !== activeCode.value) return;
      cache.set(code, next);
      panel.value = next;
    } finally {
      if (id === staffId.value && code === activeCode.value)
        loading.value = false;
    }
  }

  async function initialize() {
    const id = staffId.value;
    editing.value = false;
    savedNeedsRefresh.value = false;
    cache.clear();
    panel.value = emptyPanel();
    rawTabs.value = [];
    permissionsReady.value = false;
    error.value = '';
    if (!staffId.value) {
      error.value = '缺少员工 ID，请从宿主的“我的档案”重新进入';
      return;
    }
    loading.value = true;
    try {
      const [allTabs, personal] = await Promise.all([
        getRosterDetailTabsApi(),
        getArchivePermissionsApi(),
        store.loadTeamAuth(),
      ]);
      if (id !== staffId.value) return;
      if (!store.ready || !allTabs.success)
        throw new Error('加载档案展示配置失败');
      rawTabs.value = allTabs.body || [];
      permissions.value = personal.body;
      permissionsReady.value = Boolean(personal.success);
      if (!personal.success)
        showFailToast(personal.message || '个人权限加载失败，当前只能查看档案');
      activeCode.value =
        tabs.value.find((item) => item.code === ROSTER_DETAIL_BASIC_TAB)
          ?.code ||
        tabs.value[0]?.code ||
        '';
      await loadTab();
    } finally {
      loading.value = false;
    }
  }

  function startEdit() {
    if (!canEdit.value || loading.value || saving.value) return;
    drafts.value = archiveDrafts(editSchema.value, panel.value.records);
    initialDrafts = cloneDeep(drafts.value);
    editing.value = true;
  }

  function addRecord() {
    if (!canAdd.value || saving.value) return;
    const [record] = archiveDrafts(editSchema.value, [{ id: '', groups: {} }]);
    drafts.value.push({ ...record, key: crypto.randomUUID() });
  }

  function removeRecord(key: string) {
    const index = drafts.value.findIndex((item) => item.key === key);
    if (index >= 0 && !drafts.value[index].id && !saving.value)
      drafts.value.splice(index, 1);
  }

  async function confirmDiscard() {
    if (saving.value) return false;
    if (!dirty.value || savedNeedsRefresh.value) return true;
    return showConfirmDialog({
      message: ARCHIVE_DISCARD_MESSAGE,
      confirmButtonText: '离开',
      cancelButtonText: '取消',
    }).then(
      () => true,
      () => false,
    );
  }

  async function cancelEdit() {
    if (await confirmDiscard()) {
      drafts.value = [];
      editing.value = false;
    }
  }

  async function beforeTabChange(code: string | number) {
    if (String(code) === activeCode.value) return true;
    if (!(await confirmDiscard())) return false;
    editing.value = false;
    drafts.value = [];
    savedNeedsRefresh.value = false;
    return true;
  }

  async function save() {
    if (saving.value) return;
    saving.value = true;
    try {
      if (!savedNeedsRefresh.value) {
        const submission = buildArchiveSubmission(
          staffId.value,
          editSchema.value,
          drafts.value,
          initialDrafts,
          panel.value.pending,
          panel.value.multi,
        );
        if (!submission.records.length) {
          showFailToast('没有可提交的修改');
          return;
        }
        const response = await submitArchiveApi(
          submission,
          panel.value.schema,
          panel.value.records,
          tabs.value.find((item) => item.code === activeCode.value)?.builtin,
        );
        if (!response.success || response.body !== true) {
          showFailToast(response.message || '提交失败，请重试');
          return;
        }
        savedNeedsRefresh.value = true;
      }
      await loadTab(true);
      editing.value = false;
      drafts.value = [];
      initialDrafts = [];
      savedNeedsRefresh.value = false;
      showSuccessToast(
        panel.value.pending.length
          ? '提交成功，需审批内容待审核后生效'
          : '保存成功',
      );
    } finally {
      saving.value = false;
    }
  }

  function back() {
    // WebView 有上级路由时交由路由守卫确认；无上级时只触发宿主已有的浏览历史。
    if (window.history.length > 1) router.back();
    else void cancelEdit();
  }

  onBeforeRouteLeave(confirmDiscard);
  onBeforeRouteUpdate((to, from) =>
    to.params.id !== from.params.id || to.query.id !== from.query.id
      ? confirmDiscard()
      : true,
  );
  watch(
    staffId,
    () => {
      void initialize().catch(showError);
    },
    { immediate: true },
  );
  watch(
    () => store.version,
    () => {
      if (
        !tabs.value.some((item) => item.code === activeCode.value) &&
        !loading.value
      ) {
        editing.value = false;
        activeCode.value = tabs.value[0]?.code || '';
        void loadTab().catch(showError);
      }
    },
  );

  return {
    staffId,
    loading,
    error,
    tabs,
    activeCode,
    title,
    panel,
    readSchema,
    editSchema,
    canEdit,
    canAdd,
    permissionsReady,
    editing,
    saving,
    drafts,
    dirty,
    savedNeedsRefresh,
    startEdit,
    cancelEdit,
    addRecord,
    removeRecord,
    beforeTabChange,
    back,
    changeTab: () => loadTab().catch(showError),
    retry: () => initialize().catch(showError),
    save: () =>
      save().catch((cause) => {
        showFailToast(
          savedNeedsRefresh.value
            ? '已提交，回读失败，请重试刷新'
            : cause instanceof Error
              ? cause.message
              : '提交失败',
        );
      }),
  };
}
