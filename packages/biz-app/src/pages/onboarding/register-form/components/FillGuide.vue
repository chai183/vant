<template>
  <!-- /*----引导页start----*/ -->
  <div class="fill-guide">
    <div class="fill-guide__card">
      <h2 class="fill-guide__title">{{ title }}</h2>
      <p class="fill-guide__content">{{ content || '暂无引导说明' }}</p>
    </div>
  </div>
  <!-- /*----引导页end----*/ -->
</template>

<script lang="ts" setup>
/**
 * 入职登记填写 - 引导页
 * 文案来自所选模板
 */
defineOptions({ name: 'RegisterFormFillGuide' });

withDefaults(
  defineProps<{
    title?: string;
    content?: string;
  }>(),
  {
    title: '入职引导',
    content: '',
  },
);
</script>

<style scoped lang="less">
.fill-guide {
  padding: 12px;
}

.fill-guide__card {
  padding: 16px;
  background: var(--van-background-2, #fff);
  border-radius: 8px;
}

.fill-guide__title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: var(--van-text-color);
}

.fill-guide__content {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--van-text-color-secondary);
  white-space: pre-wrap;
}
</style>
