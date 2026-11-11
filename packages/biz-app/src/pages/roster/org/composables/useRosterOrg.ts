import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import type { RosterOrgNode, RosterStaff } from '@/types/employee/roster';
import { getRosterContextApi } from '@/services/api/employee/roster';
import { ROSTER_UNGROUPED_ORG_ID } from '@/services/api/organization/org/config';
import {
  getDeptStaffApi,
  getOrgTreeApi,
} from '@/services/api/organization/org';
import { buildOrgCrumb, findOrg } from '../../utils/org';
import { useOpenOrg } from '../../composables/useOpenOrg';

/** 部门页：路径、下级部门、本部门员工 */
export function useRosterOrg() {
  const { orgId, openOrg, goSearch, back } = useOpenOrg();

  const loading = ref(true);
  const isOrgLeader = ref(false);
  const orgs = ref<RosterOrgNode[]>([]);
  const path = ref<RosterOrgNode[]>([]);
  const staff = ref<RosterStaff[]>([]);
  const currentName = ref('');

  // 根级是未分组，进入部门后用部门名
  const staffTitle = computed(() => {
    const count = staff.value.length;
    if (!orgId.value) return `未分组员工(${count})`;
    return `${currentName.value || '本部门'}员工(${count})`;
  });

  async function load() {
    loading.value = true;
    try {
      const currentId = orgId.value;
      const [contextRes, treeRes, staffRes] = await Promise.all([
        getRosterContextApi(),
        getOrgTreeApi(),
        getDeptStaffApi(currentId || ROSTER_UNGROUPED_ORG_ID),
      ]);
      if (!treeRes.success) {
        showToast(treeRes.message || '加载部门失败');
      }
      isOrgLeader.value = Boolean(contextRes.body?.isOrgLeader);
      const tree = treeRes.body || [];
      if (!currentId) {
        path.value = [];
        orgs.value = tree;
        currentName.value = '';
      } else {
        const node = findOrg(tree, currentId);
        if (!node) {
          showToast('部门不存在');
          path.value = [];
          orgs.value = [];
          currentName.value = '';
        } else {
          path.value = buildOrgCrumb(tree, currentId);
          orgs.value = node.children;
          currentName.value = node.name;
        }
      }
      staff.value = staffRes.body?.records || [];
    } finally {
      loading.value = false;
    }
  }

  watch(orgId, load, { immediate: true });

  return {
    loading,
    isOrgLeader,
    orgs,
    path,
    staff,
    staffTitle,
    openOrg,
    goSearch,
    back,
  };
}
