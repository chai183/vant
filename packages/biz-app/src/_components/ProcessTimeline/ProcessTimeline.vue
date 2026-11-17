<template>
  <div class="process-timeline">
    <!-- /*----加载start----*/ -->
    <van-loading v-if="loading" class="process-timeline-loading" vertical>
      加载中
    </van-loading>
    <!-- /*----加载end----*/ -->

    <!-- /*----空态start----*/ -->
    <van-empty v-else-if="!items.length" :description="emptyText" />
    <!-- /*----空态end----*/ -->

    <!-- /*----节点start----*/ -->
    <template v-else>
      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        class="process-timeline-item"
      >
        <div class="process-timeline-axis">
          <div class="process-timeline-dot">
            <van-icon :name="item.icon || 'user-o'" size="14" />
          </div>
          <div v-if="index < items.length - 1" class="process-timeline-line" />
        </div>
        <div class="process-timeline-main">
          <div class="process-timeline-head">
            <span class="process-timeline-title">{{ item.title }}</span>
            <span v-if="item.extra" class="process-timeline-extra">{{
              item.extra
            }}</span>
          </div>
          <div v-if="item.desc" class="process-timeline-desc">
            <div
              v-for="(line, lineIndex) in item.desc.split('\n')"
              :key="lineIndex"
              class="process-timeline-desc-line"
            >
              {{ line }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- /*----节点end----*/ -->
  </div>
</template>

<script lang="ts" setup>
/**
 * ProcessTimeline - 流程时间轴
 * 左侧圆点连线，右侧标题 / 附加信息 / 说明，适合异动、审批这类节点流
 */
import type { ProcessTimelineItem } from './types';

defineOptions({
  name: 'ProcessTimeline',
});

withDefaults(
  defineProps<{
    items?: ProcessTimelineItem[];
    loading?: boolean;
    emptyText?: string;
  }>(),
  {
    items: () => [],
    loading: false,
    emptyText: '暂无数据',
  },
);
</script>

<style scoped lang="less">
.process-timeline {
  display: flex;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: var(--van-padding-sm);
  background: var(--van-white);
}

.process-timeline-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.process-timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.process-timeline-axis {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  width: 24px;
}

.process-timeline-dot {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--van-primary-color);
  color: var(--van-white);
}

.process-timeline-line {
  flex: 1;
  width: 1px;
  background: var(--van-gray-13);
}

.process-timeline-main {
  flex: 1;
  min-width: 0;
  padding-bottom: 32px;
}

.process-timeline-item:last-child .process-timeline-main {
  padding-bottom: 0;
}

.process-timeline-head {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.process-timeline-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--van-text-color);
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.process-timeline-extra {
  flex: none;
  color: var(--van-text-color-secondary);
  font-weight: 400;
  font-size: 12px;
  line-height: 12px;
}

.process-timeline-desc {
  margin-top: 8px;
}

.process-timeline-desc-line {
  color: var(--van-text-color-secondary);
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  word-break: break-all;
}
</style>
