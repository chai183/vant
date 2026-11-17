<template>
  <footer class="settings-actions">
    <p class="settings-actions-count" aria-live="polite">
      已选 <strong>{{ count }}</strong> 个
    </p>
    <div class="settings-actions-buttons">
      <van-checkbox
        class="settings-actions-check"
        shape="square"
        :model-value="allChecked"
        :indeterminate="indeterminate"
        :aria-checked="indeterminate ? 'mixed' : allChecked"
        :disabled="disabled"
        @click="emit('toggleAll')"
        >全选</van-checkbox
      >
      <van-button
        round
        plain
        type="primary"
        size="large"
        :disabled="disabled"
        @click="emit('reset')"
        >重置</van-button
      >
      <van-button
        round
        type="primary"
        size="large"
        :disabled="!ready"
        :loading="saving"
        @click="emit('save')"
        >{{ refreshFailed ? '重试刷新' : '保存' }}</van-button
      >
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
  allChecked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  ready: boolean;
  saving: boolean;
  refreshFailed: boolean;
}>();
/** 底部操作统一由页面状态处理。 */
const emit = defineEmits<{ toggleAll: []; reset: []; save: [] }>();
</script>

<style scoped lang="less">
.settings-actions {
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--van-background-2);
}
.settings-actions-count {
  box-sizing: border-box;
  height: 38px;
  margin: 0;
  padding: 12px;
  border-bottom: 1px solid #eee;
  color: var(--van-text-color-auxiliary);
  font-size: 14px;
  line-height: 14px;
}
.settings-actions-count strong {
  color: var(--van-text-color);
}
.settings-actions-buttons {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  height: 64px;
  padding: 8px 12px;
  gap: 8px;
}
.settings-actions-check {
  --van-checkbox-label-font-size: 16px;
}
</style>
