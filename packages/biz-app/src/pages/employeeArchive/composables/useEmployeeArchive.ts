import { computed, ref, watch } from 'vue';
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from 'vue-router';
import { cloneDeep } from 'lodash-es';
import {
  showDialog,
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
  showToast,
} from 'vant';
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
  ArchiveSubmission,
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
  archiveSubmissionSummary,
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
  /** 快速切回尚未返回的信息集时复用请求，切换员工后不复用。 */
  let pendingPanels = new Map<string, Promise<ArchivePanel>>();
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
  /** 确认弹窗与已校验的本次提交快照，取消弹窗不清除表单草稿。 */
  const confirming = ref(false);
  const preparedSubmission = ref<ArchiveSubmission | null>(null);

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
    archiveEditSchema(readSchema.value, permissions.value, panel.value.pending),
  );
  /** 提示条跟随可编辑的审批字段，不因存在一个只读审批字段就展示。 */
  const approvalNotice = computed(() => {
    const hasApproval = editSchema.value.groupList.some((group) =>
      group.fieldList.some(
        (field) =>
          field.permission === 'editable' &&
          !field.disabled &&
          field.needsApproval === true,
      ),
    );
    if (!hasApproval) return '';
    return activeCode.value === ROSTER_DETAIL_BASIC_TAB
      ? '带“审”标记的内容修改后需 HR 审核通过才生效。'
      : '页面信息修改后需 HR 审核通过后才能生效。';
  });
  /** 二次确认展示实际修改的字段，不包含未修改、隐藏或只读字段。 */
  const submitSummary = computed(() =>
    preparedSubmission.value
      ? archiveSubmissionSummary(editSchema.value, preparedSubmission.value)
      : { approval: [], immediate: [] },
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
    () =>
      ARCHIVE_ADDABLE_SETS.includes(activeCode.value) &&
      canEdit.value &&
      !panel.value.pending.length,
  );
  /** 保存与离开页面共用实际字段变更，不把控件回显转换算作修改。 */
  const submission = computed(() =>
    buildArchiveSubmission(
      staffId.value,
      editSchema.value,
      drafts.value,
      initialDrafts,
      panel.value.pending,
      panel.value.multi,
    ),
  );
  /** 未修改或修改后还原时，离开不弹确认。 */
  const dirty = computed(
    () => editing.value && submission.value.records.length > 0,
  );
  /** 复用普通 Tab 的切换拦截。 */
  const title = computed(
    () => tabs.value.find((tab) => tab.code === activeCode.value)?.name || '',
  );

  function showError(cause: unknown) {
    error.value = cause instanceof Error ? cause.message : '加载档案失败';
  }

  async function readPanel(
    tab: RosterDetailTabItem,
    employeeId: string,
  ): Promise<ArchivePanel> {
    const kind = getRosterDetailTabKind(tab.code);
    const result = emptyPanel();
    result.kind = kind;
    if (kind === 'growth') {
      const [changes, positions] = await Promise.all([
        getRosterDetailGrowthChangeApi({ staffId: employeeId }),
        getRosterDetailGrowthPositionApi({ staffId: employeeId }),
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
      const response = await getRosterDetailCostApi({ staffId: employeeId });
      if (!response.success)
        throw new Error(response.message || '加载成本信息失败');
      return { ...result, cost: response.body };
    }
    if (kind === 'attachment') {
      const response = await getRosterDetailAttachmentApi({
        staffId: employeeId,
      });
      if (!response.success)
        throw new Error(response.message || '加载附件失败');
      return { ...result, attachments: response.body || [] };
    }
    if (kind === 'empty') return result;
    const [metadata, workflow] = await Promise.all([
      getArchiveSchemaApi(tab.code),
      getArchiveWorkflowApi(employeeId, tab.code),
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
    const response = await getArchiveRecordsApi(employeeId, metadata.body);
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
    const requests = pendingPanels;
    let request: Promise<ArchivePanel> | undefined;
    try {
      let next = !force ? cache.get(code) : undefined;
      if (!next) {
        request = !force ? requests.get(code) : undefined;
        if (!request) {
          request = readPanel(tab, id);
          requests.set(code, request);
        }
        next = await request;
      }
      if (id !== staffId.value || requests !== pendingPanels) return;
      // 切走的信息集也缓存成功结果，但不覆盖当前面板。
      cache.set(code, next);
      if (code !== activeCode.value) return;
      panel.value = next;
    } finally {
      if (request && requests.get(code) === request) requests.delete(code);
      if (
        requests === pendingPanels &&
        id === staffId.value &&
        code === activeCode.value
      )
        loading.value = false;
    }
  }

  async function initialize() {
    const id = staffId.value;
    editing.value = false;
    confirming.value = false;
    preparedSubmission.value = null;
    savedNeedsRefresh.value = false;
    cache.clear();
    pendingPanels = new Map();
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

  async function startEdit() {
    if (!canEdit.value || loading.value || saving.value) return;
    const employeeId = staffId.value;
    const code = activeCode.value;
    if (panel.value.pending.length) {
      const basic = activeCode.value === ROSTER_DETAIL_BASIC_TAB;
      const accepted = await showDialog({
        title: '提示',
        message: basic
          ? '该信息类型下已存在待审批的申请，将无法变更需审批的信息项。'
          : '该信息类型下已存在待审批的申请，无法编辑。',
        confirmButtonText: '确定',
      }).then(
        () => true,
        () => false,
      );
      if (
        !accepted ||
        !basic ||
        employeeId !== staffId.value ||
        code !== activeCode.value
      )
        return;
    }
    drafts.value = archiveDrafts(editSchema.value, panel.value.records);
    initialDrafts = cloneDeep(drafts.value);
    editing.value = true;
    confirming.value = false;
    preparedSubmission.value = null;
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

  function cancelEdit() {
    if (saving.value || savedNeedsRefresh.value) return;
    drafts.value = [];
    initialDrafts = [];
    confirming.value = false;
    preparedSubmission.value = null;
    editing.value = false;
  }

  async function beforeTabChange(code: string | number) {
    if (String(code) === activeCode.value) return true;
    if (!(await confirmDiscard())) return false;
    editing.value = false;
    confirming.value = false;
    preparedSubmission.value = null;
    drafts.value = [];
    savedNeedsRefresh.value = false;
    return true;
  }

  async function performSave(submission?: ArchiveSubmission) {
    if (saving.value) return;
    saving.value = true;
    try {
      if (!savedNeedsRefresh.value) {
        if (!submission) throw new Error('请先确认本次修改');
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
      confirming.value = false;
      preparedSubmission.value = null;
      drafts.value = [];
      initialDrafts = [];
      savedNeedsRefresh.value = false;
      showSuccessToast('修改成功');
    } finally {
      saving.value = false;
    }
  }

  /** 首次提交只准备确认内容，重试回读不再确认或重复发保存请求。 */
  async function save(validate?: () => Promise<boolean>) {
    if (saving.value || !editing.value) return;
    if (savedNeedsRefresh.value) return performSave();
    if (!dirty.value) {
      showToast('无信息变更，无需提交');
      return;
    }
    if (validate && !(await validate())) {
      showFailToast('请完善必填信息或修正字段错误');
      return;
    }
    // 未配置审批方式时显式报错，不把未知状态当成无需审批。
    archiveSubmissionSummary(editSchema.value, submission.value);
    preparedSubmission.value = cloneDeep(submission.value);
    confirming.value = true;
  }

  async function confirmSave(reason = '') {
    if (
      saving.value ||
      !editing.value ||
      !confirming.value ||
      !preparedSubmission.value
    )
      return;
    const needsReason = submitSummary.value.approval.length > 0;
    if (needsReason && !reason.trim()) {
      showFailToast('请填写申请原因');
      return;
    }
    const submission = cloneDeep(preparedSubmission.value);
    if (needsReason) submission.reason = reason.trim();
    confirming.value = false;
    await performSave(submission);
  }

  function submitError(cause: unknown) {
    showFailToast(
      savedNeedsRefresh.value
        ? '已提交，回读失败，请重试刷新'
        : cause instanceof Error
          ? cause.message
          : '提交失败',
    );
  }

  function back() {
    // WebView 有上级路由时交由路由守卫确认；无上级时只触发宿主已有的浏览历史。
    if (window.history.length > 1) router.back();
    else
      void confirmDiscard().then((accepted) => {
        if (accepted) cancelEdit();
      });
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
    approvalNotice,
    confirming,
    submitSummary,
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
    save: (validate?: () => Promise<boolean>) =>
      save(validate).catch(submitError),
    confirmSave: (reason?: string) => confirmSave(reason).catch(submitError),
  };
}
