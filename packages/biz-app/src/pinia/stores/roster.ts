/**
 * 花名册展示状态：只加载 appTeamAuthSelected，并缓存可复用的字段转换器。
 * 同一次请求分别缓存展示树和设置树；全量选项由设置页单独查询。
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
import type { RosterSettingNode } from '@/types/roster/settings';

export const useRosterStore = defineStore('roster', () => {
  /** 已成功拿到已选字段，才按授权裁剪 */
  const ready = ref(false);
  /** 已选字段请求状态。 */
  const loading = ref(false);
  /** 已选字段刷新后通知详情页重新整理缓存。 */
  const version = ref(0);
  /** 团队已选字段，当前花名册唯一的字段授权来源。 */
  const selectedList = ref<RosterTeamAuthNode[]>([]);
  /** 保留设置编码的已选树，与展示字段映射分开。 */
  const settingsSelectedList = ref<RosterSettingNode[]>([]);

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
      // 保存后的强制刷新必须晚于在途请求，不能复用保存前的结果。
      if (!force) return;
    }
    loading.value = true;
    pending = getRosterTeamAuthSelectedApi()
      .then((response) => {
        settingsSelectedList.value = response.settingsList || [];
        applySelected(response.body || [], Boolean(response.success));
      })
      .catch(() => {
        settingsSelectedList.value = [];
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
    settingsSelectedList,
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
