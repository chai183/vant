<template>
  <section class="roster-block">
    <!-- /*----部门标题start----*/ -->
    <div v-if="showHead && mode === 'dept'" class="roster-block-head">
      <span class="roster-block-main">{{ title }}</span>
      <span v-if="extra" class="roster-block-extra">{{ extra }}</span>
    </div>
    <!-- /*----部门标题end----*/ -->

    <!-- /*----员工标题start----*/ -->
    <div v-else-if="showHead" class="roster-block-title">{{ title }}</div>
    <!-- /*----员工标题end----*/ -->

    <van-empty
      v-if="mode === 'staff' && empty"
      image-size="80"
      :description="emptyText"
    />
    <van-cell-group v-else :border="false">
      <slot />
    </van-cell-group>
  </section>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    mode: 'dept' | 'staff';
    title?: string;
    extra?: string;
    showHead?: boolean;
    empty?: boolean;
    emptyText?: string;
  }>(),
  {
    title: '',
    extra: '',
    showHead: true,
    empty: false,
    emptyText: '暂无员工',
  },
);
</script>

<style scoped lang="less">
.roster-block {
  background: #ffffff;
}

.roster-block + .roster-block {
  margin-top: 8px;
}

.roster-block-head {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 32px;
  padding: 0 12px;
  gap: 6px;
  color: #333333;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.roster-block-main {
  flex: 1;
  min-width: 0;
}

.roster-block-extra {
  flex-shrink: 0;
}

.roster-block-title {
  padding: 12px 12px 8px;
  color: #999999;
  font-size: 12px;
  font-weight: 400;
}
</style>
