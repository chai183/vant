import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/** 花名册里进入部门、打开搜索 */
export function useOpenOrg() {
  const route = useRoute();
  const router = useRouter();

  // 当前部门。首页和搜索页没有这个参数
  const orgId = computed(() => String(route.params.orgId || ''));

  function openOrg(id?: string) {
    if (id && id === orgId.value) return;
    router.push(id ? `/roster/org/${id}` : '/roster/org');
  }

  function goSearch() {
    router.push({ name: 'EmployeeRosterSearch' });
  }

  function back() {
    router.back();
  }

  return { orgId, openOrg, goSearch, back };
}
