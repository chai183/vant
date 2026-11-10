<template>
  <van-cell class="roster-org-cell" center clickable @click="emit('select')">
    <template #icon>
      <span class="roster-org-mark" :class="`roster-org-mark-${tone}`" />
    </template>
    <template #title>
      <div class="roster-org-main">
        <div class="roster-org-name">
          <KeywordText v-if="keyword" :text="name" :keyword="keyword" />
          <van-text-ellipsis v-else :content="name" :rows="2" />
        </div>
        <span class="roster-org-count">({{ countText }})</span>
      </div>
    </template>
    <template #right-icon>
      <van-icon class="roster-org-arrow" name="arrow" size="16" />
    </template>
  </van-cell>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { formatCount } from '../utils/org';
import KeywordText from './KeywordText.vue';

const props = defineProps<{
  name: string;
  count: number;
  tone: number;
  keyword?: string;
}>();

const emit = defineEmits<{
  select: [];
}>();

const countText = computed(() => formatCount(props.count));
</script>

<style scoped lang="less">
.roster-org-cell {
  padding: 8px 12px;
}

.roster-org-mark {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  border-radius: 7px;
  flex-shrink: 0;
}

.roster-org-mark-0 {
  background: #fff1e5;
}

.roster-org-mark-1 {
  background: #eef1f9;
}

.roster-org-mark-2 {
  background: #fef7ec;
}

.roster-org-main {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.roster-org-name {
  min-width: 0;
  overflow: hidden;
  color: #333333;
  word-break: break-all;
}

.roster-org-count {
  margin-left: 4px;
  flex-shrink: 0;
  color: #333333;
}

.roster-org-arrow {
  margin-left: 24px;
  flex-shrink: 0;
  color: #cccccc;
}
</style>
