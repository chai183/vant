/**
 * 花名册团队授权。
 * - selectedList：管理员配置的可查看上限，详情/列表都按它裁
 * - allList：后续花名册设置页的选项源
 * - personalDisplayList：用户个性化，必须是 selectedList 子集；未配置时等于上限
 * - isAllowDepartmentManagerView：只存着给入口用，页面不二次拦截
 */
import type { RosterTeamAuthNode } from '@/types/employee/roster';
import {
  EMPTY_ROSTER_TEAM_AUTH,
  getRosterTeamAuthApi,
} from '@/services/api/employee/roster';
import {
  buildRosterTeamAuthIndex,
  clipRosterTeamAuthTree,
  filterRosterGroups,
  filterRosterTabs,
  isRosterListFieldAllowed,
} from '@/services/api/employee/roster/teamAuth';

export const useRosterStore = defineStore('roster', () => {
  /** 已成功拿到已选字段，才按授权裁剪 */
  const ready = ref(false);
  const loading = ref(false);
  const version = ref(0);
  const isAllowDepartmentManagerView = ref(false);
  const allList = ref<RosterTeamAuthNode[]>([]);
  const selectedList = ref<RosterTeamAuthNode[]>([]);
  /** 未配置时为 null，展示走团队已选 */
  const personalDisplayList = ref<RosterTeamAuthNode[] | null>(null);

  let pending: Promise<void> | null = null;

  const effectiveList = computed(() => {
    if (personalDisplayList.value) {
      return clipRosterTeamAuthTree(
        personalDisplayList.value,
        selectedList.value,
      );
    }
    return selectedList.value;
  });

  const authIndex = computed(() =>
    buildRosterTeamAuthIndex(effectiveList.value, ready.value),
  );

  function applyConfig(
    payload: {
      isAllowDepartmentManagerView?: boolean;
      allList?: RosterTeamAuthNode[];
      selectedList?: RosterTeamAuthNode[];
    },
    selectedOk: boolean,
  ) {
    isAllowDepartmentManagerView.value = Boolean(
      payload.isAllowDepartmentManagerView,
    );
    allList.value = payload.allList || [];
    selectedList.value = payload.selectedList || [];
    ready.value = selectedOk;
    version.value += 1;
  }

  async function loadTeamAuth(force = false) {
    if (ready.value && !force) return;
    if (pending) {
      await pending;
      return;
    }
    loading.value = true;
    pending = getRosterTeamAuthApi()
      .then((response) => {
        applyConfig(
          response.body || EMPTY_ROSTER_TEAM_AUTH,
          Boolean(response.selectedOk),
        );
      })
      .catch(() => {
        applyConfig(EMPTY_ROSTER_TEAM_AUTH, false);
      })
      .finally(() => {
        loading.value = false;
        pending = null;
      });
    await pending;
  }

  /** 后续花名册设置保存时写入。会裁到团队已选范围内。 */
  function setPersonalDisplay(list: RosterTeamAuthNode[] | null) {
    personalDisplayList.value = list
      ? clipRosterTeamAuthTree(list, selectedList.value)
      : null;
    version.value += 1;
  }

  return {
    ready,
    loading,
    version,
    isAllowDepartmentManagerView,
    allList,
    selectedList,
    personalDisplayList,
    effectiveList,
    authIndex,
    loadTeamAuth,
    setPersonalDisplay,
    filterTabs(tabs = []) {
      return filterRosterTabs(authIndex.value, tabs);
    },
    filterGroups(setCode = '', groups = []) {
      return filterRosterGroups(authIndex.value, setCode, groups);
    },
    isListFieldAllowed(key: 'name' | 'deptName' | 'workNo' | 'phone') {
      return isRosterListFieldAllowed(authIndex.value, key);
    },
  };
});
