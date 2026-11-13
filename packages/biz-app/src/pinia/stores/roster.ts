/**
 * 花名册展示状态：只加载 appTeamAuthSelected，并缓存可复用的字段转换器。
 * 全量选项属于后续设置页；个人设置属于后续员工档案，不参与当前展示。
 */
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  RosterDetailGroup,
  RosterDetailTabItem,
  RosterListFieldCode,
  RosterTeamAuthNode,
} from '@/types/employee/roster';
import { getRosterTeamAuthSelectedApi } from '@/services/api/employee/roster';
import { createRosterFieldSchema } from '@/pages/roster/utils/fieldSchema';

export const useRosterStore = defineStore('roster', () => {
  /** 已成功拿到已选字段，才按授权裁剪 */
  const ready = ref(false);
  /** 已选字段请求状态。 */
  const loading = ref(false);
  /** 已选字段刷新后通知详情页重新整理缓存。 */
  const version = ref(0);
  /** 团队已选字段，当前花名册唯一的字段授权来源。 */
  const selectedList = ref<RosterTeamAuthNode[]>([]);

  /** 并发进入多个页面时复用同一个请求。 */
  let pending: Promise<void> | null = null;

  /** 转换规则只随团队已选设置变化，不随员工或页签变化重复构建。 */
  const fieldSchema = computed(() =>
    createRosterFieldSchema(selectedList.value, ready.value),
  );

  function applySelected(list: RosterTeamAuthNode[], selectedOk: boolean) {
    selectedList.value = list;
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
    pending = getRosterTeamAuthSelectedApi()
      .then((response) => {
        applySelected(response.body || [], Boolean(response.success));
      })
      .catch(() => {
        applySelected([], false);
      })
      .finally(() => {
        loading.value = false;
        pending = null;
      });
    await pending;
  }

  return {
    ready,
    loading,
    version,
    selectedList,
    loadTeamAuth,
    filterTabs(tabs: RosterDetailTabItem[] = []) {
      return fieldSchema.value.filterTabs(tabs);
    },
    resolveGroups(setCode = '', groups: RosterDetailGroup[] = []) {
      return fieldSchema.value.resolveGroups(setCode, groups);
    },
    isListFieldAllowed(key: RosterListFieldCode) {
      return fieldSchema.value.isListFieldAllowed(key);
    },
  };
});
