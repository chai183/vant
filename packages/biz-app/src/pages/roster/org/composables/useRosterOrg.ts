import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import type { RosterOrgNode, RosterStaff } from '@/types/employee/roster';
import { getRosterContextApi } from '@/services/api/employee/roster';
import { useRosterStore } from '@/pinia/stores/roster';
import { ROSTER_UNGROUPED_ORG_ID } from '@/services/api/organization/org/config';
import {
  getDeptStaffApi,
  getOrgTreeApi,
} from '@/services/api/organization/org';
import { buildOrgCrumb } from '../../utils/org';
import { useOpenOrg } from '../../composables/useOpenOrg';

/** 部门页：路径、下级部门、本部门员工 */
export function useRosterOrg() {
  const { orgId, openOrg, goSearch, back } = useOpenOrg();
  const rosterStore = useRosterStore();

  const loading = ref(true);
  /** 组织负责人显示右上角花名册设置 */
  const isOrgLeader = ref(false);
  /** 我的部门。部门负责人面包屑从这里起算 */
  const myDeptId = ref('');
  const orgs = ref<RosterOrgNode[]>([]);
  const path = ref<RosterOrgNode[]>([]);
  const staff = ref<RosterStaff[]>([]);
  const currentName = ref('');
  /** 实际在看的部门。入口页部门负责人用我的部门，其他人用组织架构根 */
  const viewOrgId = ref('');

  /** 员工块标题：根节点是未分组，进入部门后带部门名 */
  const staffTitle = computed(() => {
    const count = staff.value.length;
    if (!viewOrgId.value) return `未分组员工(${count})`;
    return `${currentName.value || '本部门'}员工(${count})`;
  });

  function goOrg(id?: string) {
    const nextId = String(id || '');
    if (nextId && nextId === viewOrgId.value) return;
    // 部门负责人点回自己的部门，回到入口
    if (isOrgLeader.value && nextId && nextId === myDeptId.value) {
      openOrg(undefined, true);
      return;
    }
    openOrg(nextId || undefined, true);
  }

  async function load(isCurrent: () => boolean) {
    loading.value = true;
    try {
      const fromRoute = orgId.value;
      const contextPromise = getRosterContextApi();
      const treePromise = getOrgTreeApi();
      const teamPromise = rosterStore.loadTeamAuth();
      // 明确部门时并行加载人员；入口仍先确定当前用户的部门。
      const [contextRes, treeRes, routeStaffRes] = await Promise.all([
        contextPromise,
        treePromise,
        fromRoute ? getDeptStaffApi(fromRoute) : undefined,
        teamPromise,
      ]);
      if (!isCurrent()) return;
      const context = contextRes.body;
      // 入口页：部门负责人进我的部门，其他人进组织架构根
      let currentId = fromRoute;
      if (!currentId && context?.isOrgLeader) {
        currentId = context.myDeptId;
        if (!currentId) showToast('未找到我的部门');
      }
      const staffRes = fromRoute
        ? routeStaffRes
        : await getDeptStaffApi(currentId || ROSTER_UNGROUPED_ORG_ID);
      if (!isCurrent()) return;
      if (!treeRes.success) {
        showToast(treeRes.message || '加载部门失败');
      }
      isOrgLeader.value = context?.isOrgLeader ?? false;
      myDeptId.value = context?.myDeptId || '';
      viewOrgId.value = currentId;
      const tree = treeRes.body || [];
      if (!currentId) {
        path.value = [];
        orgs.value = tree;
        currentName.value = '';
      } else {
        // 面包屑最后一项就是当前部门，一次遍历同时取得路径与部门。
        const currentPath = buildOrgCrumb(
          tree,
          currentId,
          isOrgLeader.value ? myDeptId.value : '',
        );
        const node = currentPath[currentPath.length - 1];
        if (!node) {
          showToast('部门不存在');
          path.value = [];
          orgs.value = [];
          currentName.value = '';
        } else {
          path.value = currentPath;
          orgs.value = node.children;
          currentName.value = node.name;
        }
      }
      staff.value = staffRes?.body?.records || [];
    } finally {
      if (isCurrent()) loading.value = false;
    }
  }

  watch(
    orgId,
    (_current, _previous, onCleanup) => {
      // 路由变化或组件卸载后，上一轮加载不再修改当前页面。
      let active = true;
      onCleanup(() => {
        active = false;
      });
      return load(() => active);
    },
    { immediate: true },
  );

  return {
    loading,
    isOrgLeader,
    orgs,
    path,
    staff,
    staffTitle,
    openOrg: goOrg,
    goSearch,
    back,
  };
}
