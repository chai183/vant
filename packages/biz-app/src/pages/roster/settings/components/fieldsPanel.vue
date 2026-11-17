<template>
  <div v-if="infoSet" class="settings-fields">
    <section
      v-for="section in sections"
      :key="section.key"
      class="settings-fields-section"
    >
      <h2 v-if="section.title" class="settings-fields-title">
        {{ section.title }}
      </h2>
      <div class="settings-fields-grid">
        <button
          v-for="item in section.items"
          :key="item.key"
          type="button"
          role="checkbox"
          :aria-checked="selectedKeys.has(item.key)"
          :aria-label="`${item.node.name}${fixedKeys.has(item.key) ? '，固定选中' : ''}`"
          :disabled="disabled || fixedKeys.has(item.key)"
          :class="[
            'settings-fields-item',
            {
              'settings-fields-selected': selectedKeys.has(item.key),
              'settings-fields-fixed': fixedKeys.has(item.key),
            },
          ]"
          @click="emit('toggle', item.key)"
        >
          <span class="settings-fields-name">{{ item.node.name }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RosterSettingNode } from '@/types/roster/settings';
import { settingLeaves } from '../utils/selection';

/** 当前信息集及选择状态。 */
const props = defineProps<{
  infoSet?: RosterSettingNode;
  selectedKeys: Set<string>;
  fixedKeys: Set<string>;
  disabled: boolean;
}>();
/** 只发出字段选择，不在展示组件中处理提交。 */
const emit = defineEmits<{ toggle: [key: string] }>();
/** 分组保留标题，直挂字段单独展示；无下级节点可整体选择。 */
const sections = computed(() => {
  const node = props.infoSet;
  if (!node) return [];
  if (!node.children?.length)
    return [{ key: node.code, title: '', items: settingLeaves([node]) }];
  const path = [node.code || node.id];
  const groups = node.children
    .filter((item) => item.nodeType === 'group')
    .map((group) => ({
      key: group.code,
      title: group.children?.length ? group.name : '',
      items: settingLeaves([group], path),
    }));
  const fields = node.children.filter((item) => item.nodeType === 'field');
  if (fields.length)
    groups.push({
      key: `${node.code}-fields`,
      title: '',
      items: settingLeaves(fields, path),
    });
  return groups;
});
</script>

<style scoped lang="less">
.settings-fields {
  padding: 12px 12px 20px;
}
.settings-fields-section + .settings-fields-section {
  margin-top: 20px;
}
.settings-fields-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: normal;
  color: var(--van-text-color-secondary);
}
.settings-fields-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-items: stretch;
}
.settings-fields-item {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  padding: 8px 2px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--van-background);
  color: var(--van-text-color);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
}
.settings-fields-name {
  max-width: 4em;
  overflow-wrap: anywhere;
  word-break: break-all;
}
.settings-fields-selected {
  border-color: var(--van-primary-color);
  background: var(--van-background-2);
  color: var(--van-primary-color);
}
.settings-fields-fixed {
  opacity: 0.55;
}
</style>
