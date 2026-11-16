<template>
  <div class="roster-settings">
    <RosterNav title="花名册设置" @back="back" />
    <van-loading v-if="loading" class="roster-settings-status" vertical
      >加载中</van-loading
    >
    <div v-else-if="error" class="roster-settings-status" role="alert">
      <p>{{ error }}</p>
      <van-button size="small" @click="load">重新加载</van-button>
    </div>
    <template v-else>
      <!-- /*----信息集与字段选择start----*/ -->
      <div v-if="options.length" class="roster-settings-body">
        <nav class="roster-settings-tabs" aria-label="信息集">
          <button
            v-for="item in options"
            :key="item.code"
            type="button"
            :class="[
              'roster-settings-tab',
              { 'roster-settings-tab-active': item.code === activeCode },
            ]"
            :aria-current="item.code === activeCode ? 'true' : undefined"
            @click="activeCode = item.code"
          >
            <span class="roster-settings-tab-name">{{ item.name }}</span>
            <span
              v-if="utils.hasSelected(item)"
              class="roster-settings-dot"
              aria-label="已有选中项"
            />
          </button>
        </nav>
        <div :key="activeCode" class="roster-settings-content">
          <FieldsPanel
            :info-set="activeSet"
            :selected-keys="selectedKeys"
            :fixed-keys="fixedKeys"
            :disabled="disabled"
            @toggle="toggle"
          />
        </div>
      </div>
      <van-empty
        v-else
        class="roster-settings-empty"
        description="暂无可选配置"
      />
      <!-- /*----信息集与字段选择end----*/ -->
    </template>
    <!-- /*----选择统计与操作start----*/ -->
    <ActionsPanel
      :count="selectedCount"
      :all-checked="allChecked"
      :indeterminate="indeterminate"
      :disabled="disabled"
      :ready="ready"
      :saving="saving"
      :refresh-failed="refreshFailed"
      @toggle-all="toggleAll"
      @reset="reset"
      @save="save"
    />
    <!-- /*----选择统计与操作end----*/ -->
  </div>
</template>

<script setup lang="ts">
import type { RosterSettingNode } from '@/types/roster/settings';
import RosterNav from '../components/RosterNav.vue';
import FieldsPanel from './components/fieldsPanel.vue';
import ActionsPanel from './components/actionsPanel.vue';
import { useRosterSettings } from './composables/useRosterSettings';
import { settingLeaves } from './utils/selection';

defineOptions({ name: 'EmployeeRosterSettings' });

/*----设置加载与选择start----*/
/** 选择草稿和请求状态由同一个组合函数管理。 */
const {
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
} = useRosterSettings();
/** 页签圆点根据实际已选项即时更新。 */
const utils = {
  hasSelected(item: RosterSettingNode) {
    return settingLeaves([item]).some(({ key }) => selectedKeys.value.has(key));
  },
};
/*----设置加载与选择end----*/
</script>

<style scoped lang="less">
.roster-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--van-background-2);
}
.roster-settings-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.roster-settings-tabs {
  flex: 0 0 96px;
  overflow-y: auto;
  background: var(--van-background);
}
.roster-settings-tab {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 52px;
  padding: 16px 10px;
  gap: 5px;
  border: 0;
  border-left: 2px solid transparent;
  background: transparent;
  color: var(--van-text-color);
  font: inherit;
  font-size: 14px;
  text-align: left;
}
.roster-settings-tab-active {
  border-left-color: var(--van-primary-color);
  color: var(--van-primary-color);
  background: var(--van-background-2);
}
.roster-settings-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.roster-settings-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--van-primary-color);
}
.roster-settings-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
.roster-settings-tabs,
.roster-settings-content {
  scrollbar-width: thin;
  scrollbar-color: var(--van-gray-13) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--van-gray-13);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}
.roster-settings-status {
  flex: 1;
  padding: 48px 16px;
  text-align: center;
  color: var(--van-text-color-secondary);
}
.roster-settings-empty {
  flex: 1;
}
</style>
