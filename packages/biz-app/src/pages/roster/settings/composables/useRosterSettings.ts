import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showFailToast, showSuccessToast } from 'vant';
import { useRosterStore } from '@/pinia/stores/roster';
import {
  getRosterSettingsBasicApi,
  getRosterSettingsOptionsApi,
  saveRosterSettingsApi,
} from '@/services/api/employee/roster/settings';
import { ROSTER_DETAIL_BASIC_TAB } from '@/services/api/employee/roster/config';
import type { RosterSettingNode } from '@/types/employee/roster/settings';
import {
  cloneSettings,
  expandSettingsSelection,
  mergeSettings,
  selectSettings,
  settingLeaves,
} from '../utils/selection';

export function useRosterSettings() {
  /** 已选接口与列表、详情共享缓存。 */
  const store = useRosterStore();
  /** 保存成功后返回进入前页面。 */
  const router = useRouter();
  /** 首屏必须同时取得选项、已选和原开关才允许保存。 */
  const loading = ref(false);
  /** 三份配置都已成功加载。 */
  const ready = ref(false);
  /** 加载失败明确展示并允许重试。 */
  const error = ref('');
  /** 完整可选信息集树。 */
  const options = ref<RosterSettingNode[]>([]);
  /** 当前编辑的已选树。 */
  const selected = ref<RosterSettingNode[]>([]);
  /** 进入页面时的完整快照，重置不请求服务端。 */
  let initial: RosterSettingNode[] = [];
  /** 原基础开关只随保存透传。 */
  let allowView = false;
  /** 固定项只来自进入时已选接口的字段标记。 */
  const fixedKeys = ref(new Set<string>());
  /** 当前信息集。 */
  const activeCode = ref('');
  /** 正在提交或刷新已选缓存。 */
  const saving = ref(false);
  /** 保存已成功但刷新失败时只重试刷新，避免重复提交。 */
  const refreshFailed = ref(false);

  /** 所有叶子选项及其路径键。 */
  const leaves = computed(() => settingLeaves(options.value));
  /** 已选叶子键用于勾选、圆点、计数。 */
  const selectedKeys = computed(
    () =>
      new Set(
        settingLeaves(
          expandSettingsSelection(options.value, selected.value),
        ).map((item) => item.key),
      ),
  );
  /** 全部信息集的总选择数。 */
  const selectedCount = computed(() => selectedKeys.value.size);
  /** 全选同时涵盖全部信息集，不只当前页签。 */
  const allChecked = computed(
    () =>
      leaves.value.length > 0 &&
      leaves.value.every((item) => selectedKeys.value.has(item.key)),
  );
  /** 固定项保留勾选时，全选显示半选。 */
  const indeterminate = computed(
    () => selectedCount.value > 0 && !allChecked.value,
  );
  /** 当前信息集对象。 */
  const activeSet = computed(() =>
    options.value.find((item) => item.code === activeCode.value),
  );
  /** 请求期间与保存待刷新期间禁止修改草稿。 */
  const disabled = computed(
    () => !ready.value || saving.value || refreshFailed.value,
  );

  async function load() {
    loading.value = true;
    ready.value = false;
    error.value = '';
    try {
      const [all, basic] = await Promise.all([
        getRosterSettingsOptionsApi(),
        getRosterSettingsBasicApi(),
        store.loadTeamAuth(),
      ]);
      if (!all.success || !basic.success || !store.ready) {
        error.value = !all.success
          ? all.message || '加载可选配置失败'
          : !basic.success
            ? basic.message || '加载基础配置失败'
            : '加载已选配置失败';
        return;
      }
      initial = cloneSettings(store.settingsSelectedList);
      selected.value = cloneSettings(initial);
      options.value = mergeSettings(all.body, initial);
      fixedKeys.value = new Set(
        settingLeaves(initial)
          .filter(
            ({ node }) => node.nodeType === 'field' && node.builtin === true,
          )
          .map((item) => item.key),
      );
      allowView = basic.body.isAllowDepartmentManagerView;
      activeCode.value =
        options.value.find((item) => item.code === ROSTER_DETAIL_BASIC_TAB)
          ?.code ||
        options.value[0]?.code ||
        '';
      ready.value = true;
    } finally {
      loading.value = false;
    }
  }

  function applyKeys(keys: Set<string>) {
    fixedKeys.value.forEach((key) => keys.add(key));
    selected.value = selectSettings(options.value, selected.value, keys);
  }

  function toggle(key: string) {
    if (disabled.value || fixedKeys.value.has(key)) return;
    const keys = new Set(selectedKeys.value);
    if (keys.has(key)) keys.delete(key);
    else keys.add(key);
    applyKeys(keys);
  }

  function toggleAll() {
    if (disabled.value) return;
    applyKeys(
      new Set(allChecked.value ? [] : leaves.value.map((item) => item.key)),
    );
  }

  function reset() {
    if (!disabled.value) selected.value = cloneSettings(initial);
  }

  function back() {
    if (saving.value) return;
    if (router.options.history.state.back) router.back();
    else void router.replace({ name: 'EmployeeRoster' });
  }

  async function save() {
    if (!ready.value || saving.value) return;
    saving.value = true;
    try {
      if (!refreshFailed.value) {
        const response = await saveRosterSettingsApi(selected.value, allowView);
        if (!response.success || response.body === false) {
          showFailToast(
            response.body === false
              ? '保存失败，请重试'
              : response.message || '保存失败，请重试',
          );
          return;
        }
        refreshFailed.value = true;
      }
      await store.loadTeamAuth(true);
      if (!store.ready) {
        showFailToast('保存已成功，刷新配置失败，请重试刷新');
        return;
      }
      refreshFailed.value = false;
      showSuccessToast('保存成功');
      saving.value = false;
      back();
    } finally {
      saving.value = false;
    }
  }

  onMounted(load);
  return {
    loading,
    ready,
    error,
    options,
    activeCode,
    activeSet,
    selectedKeys,
    fixedKeys,
    selectedCount,
    allChecked,
    indeterminate,
    saving,
    disabled,
    refreshFailed,
    load,
    toggle,
    toggleAll,
    reset,
    save,
    back,
  };
}
