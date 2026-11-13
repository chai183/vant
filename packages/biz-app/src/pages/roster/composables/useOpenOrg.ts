import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/** 花名册里进入部门、打开搜索 */
export function useOpenOrg() {
  const route = useRoute();
  const router = useRouter();

  const orgId = computed(() => String(route.params.orgId || ''));

  /** 下钻部门用 push，返回才能回到上一级 */
  function openOrg(id?: string) {
    const nextId = String(id || '');
    const path = nextId ? `/roster/org/${nextId}` : '/roster';
    if (nextId && nextId === orgId.value) return;
    if (!nextId && route.name === 'EmployeeRoster') return;
    router.push(path);
  }

  function goSearch() {
    router.push({ name: 'EmployeeRosterSearch' });
  }

  function back() {
    router.back();
  }

  return { orgId, openOrg, goSearch, back };
}
