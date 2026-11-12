import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/** 花名册里进入部门、打开搜索 */
export function useOpenOrg() {
  const route = useRoute();
  const router = useRouter();

  const orgId = computed(() => String(route.params.orgId || ''));

  /** replace：组织内切换部门，避免返回键一层层回退 */
  function openOrg(id?: string, replace?: boolean) {
    const nextId = String(id || '');
    const path = nextId ? `/roster/org/${nextId}` : '/roster';
    if (nextId && nextId === orgId.value) return;
    if (!nextId && route.name === 'EmployeeRoster') return;
    if (replace) {
      router.replace(path);
      return;
    }
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
