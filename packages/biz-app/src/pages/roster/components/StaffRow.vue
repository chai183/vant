<template>
  <van-cell
    center
    :title-style="
      variant === 'search' ? { minWidth: 0, overflow: 'hidden' } : undefined
    "
  >
    <template #icon>
      <van-avatar class="roster-staff-avatar" size="small" :text="staff.name" />
    </template>
    <template #title>
      <div v-if="variant === 'search'" class="roster-staff-info">
        <span class="roster-staff-title">
          <span class="roster-staff-name">
            <KeywordText :text="staff.name" :keyword="keyword" />
          </span>
          <span v-if="staff.concurrent" class="roster-staff-concurrent"
            >兼</span
          >
          <span v-if="staff.deptName" class="roster-staff-dept">
            <KeywordText :text="staff.deptName" :keyword="keyword" />
          </span>
        </span>
        <div v-if="subText" class="roster-staff-meta">
          <KeywordText :text="subText" :keyword="keyword" />
        </div>
      </div>
      <span v-else class="roster-staff-title">
        <span class="roster-staff-name">{{ staff.name }}</span>
        <span
          v-if="staff.concurrent && variant !== 'contact'"
          class="roster-staff-concurrent"
        >
          兼
        </span>
      </span>
    </template>
    <template v-if="variant !== 'search' && subText" #label>
      <van-text-ellipsis
        v-if="variant === 'contact'"
        :content="subText"
        rows="1"
      />
      <span v-else>{{ subText }}</span>
    </template>
  </van-cell>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { RosterStaff } from '@/types/employee/roster';
import { staffMeta } from '../utils/org';
import KeywordText from './KeywordText.vue';

const props = defineProps<{
  staff: RosterStaff;
  variant: 'contact' | 'member' | 'search';
  keyword?: string;
}>();

const subText = computed(() => {
  if (props.variant === 'contact') return props.staff.deptName;
  return staffMeta(props.staff);
});
</script>

<style scoped lang="less">
.roster-staff-avatar {
  margin-right: 8px;
}

.roster-staff-info {
  min-width: 0;
}

.roster-staff-title {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  color: #333333;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.roster-staff-name {
  flex-shrink: 0;
}

.roster-staff-concurrent {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 4px;
  border-radius: 4px;
  background: #e5eeff;
  color: #0058ff;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.roster-staff-meta {
  margin-top: 2px;
  overflow: hidden;
  color: #999999;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.roster-staff-dept {
  flex: 0 1 auto;
  max-width: 192px;
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: #999999;
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
