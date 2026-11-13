import { computed, onMounted, ref } from 'vue';
import { showToast } from 'vant';
import type { RosterOrgNode, RosterStaff } from '@/types/employee/roster';
import { getRosterStaffApi } from '@/services/api/employee/roster';
import { ROSTER_LIST_SEARCH_FIELDS } from '@/services/api/employee/roster/config';
import { getOrgTreeApi } from '@/services/api/organization/org';
import { useRosterStore } from '@/pinia/stores/roster';
import { flattenOrgs } from '../../utils/org';

/** 搜索页：加载组织与人员，按当前授权范围匹配关键字。 */
export function useRosterSearch() {
  /** 搜索字段始终跟随当前团队授权和个人展示配置。 */
  const rosterStore = useRosterStore();
  /** 首屏加载状态。 */
  const loading = ref(true);
  /** 输入框原文保留给页面展示和高亮。 */
  const keyword = ref('');
  /** 组织树只在加载时展开，输入关键字时不重复遍历树。 */
  const allOrgs = ref<RosterOrgNode[]>([]);
  /** 搜索使用接口返回的完整人员列表。 */
  const allStaff = ref<RosterStaff[]>([]);

  /** 每次输入只规范化一次，空关键字直接返回空结果。 */
  const searchWord = computed(() => keyword.value.trim().toLowerCase());
  /** 权限变化时统一计算可搜索字段，不对每位员工重复检查。 */
  const searchFields = computed(() =>
    ROSTER_LIST_SEARCH_FIELDS.filter((field) =>
      rosterStore.isListFieldAllowed(field.fieldCode),
    ).map((field) =>
      'fieldMapping' in field ? field.fieldMapping : field.fieldCode,
    ),
  );

  /** 匹配组织名称，保持原有组织排列顺序。 */
  const orgs = computed(() => {
    const word = searchWord.value;
    if (!word) return [];
    return allOrgs.value.filter((item) =>
      String(item.name || '')
        .toLowerCase()
        .includes(word),
    );
  });

  /** 姓名始终可搜索，其余字段沿用列表授权规则。 */
  const staff = computed(() => {
    const word = searchWord.value;
    if (!word) return [];
    const fields = searchFields.value;
    return allStaff.value.filter((item) =>
      fields.some((key) =>
        String(item[key] ?? '')
          .toLowerCase()
          .includes(word),
      ),
    );
  });

  async function load() {
    loading.value = true;
    try {
      const [treeRes, staffRes] = await Promise.all([
        getOrgTreeApi(),
        getRosterStaffApi(),
        rosterStore.loadTeamAuth(),
      ]);
      if (!treeRes.success && !staffRes.success) {
        showToast('加载失败');
      }
      allOrgs.value = flattenOrgs(treeRes.body || []);
      allStaff.value = staffRes.body?.records || [];
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  return { loading, keyword, orgs, staff };
}
