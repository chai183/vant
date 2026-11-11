<template>
  <div class="roster-growth">
    <van-loading v-if="loading" class="roster-growth-loading" vertical>
      加载中
    </van-loading>

    <template v-else-if="isChange">
      <div class="roster-growth-toolbar">
        <van-button type="text" size="small" icon="notes-o" @click="toggleView">
          {{ viewMode === 'list' ? '时间轴显示' : '列表显示' }}
        </van-button>
      </div>

      <van-empty v-if="!changes.length" description="暂无异动记录" />

      <template v-else-if="viewMode === 'timeline'">
        <van-cell-group>
          <van-cell
            v-for="item in changes"
            :key="item.id"
            :title="item.changeType"
            :value="item.changeDate"
          >
            <template #label>
              <span class="roster-detail-field-value roster-growth-label">
                {{ item.detail }}
              </span>
            </template>
            <template #icon>
              <div class="roster-growth-dot">
                <van-icon name="user-o" />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </template>

      <template v-else>
        <van-collapse
          v-for="item in changes"
          :key="item.id"
          v-model="expandedNames"
          class="roster-detail-card"
        >
          <van-collapse-item
            :name="item.id"
            :title="item.changeType"
            :value="isExpanded(item.id) ? '收起' : '展开'"
          >
            <van-cell title="异动日期" :value="item.changeDate" />
            <van-cell title="操作时间" :value="item.operationTime" />
            <van-cell title="详情">
              <span class="roster-detail-field-value">{{ item.detail }}</span>
            </van-cell>
          </van-collapse-item>
        </van-collapse>
      </template>
    </template>

    <template v-else>
      <van-empty v-if="!positions.length" description="暂无任职记录" />
      <van-collapse
        v-for="item in positions"
        :key="item.id"
        v-model="expandedNames"
        class="roster-detail-card"
      >
        <van-collapse-item
          :name="item.id"
          :title="item.positionType"
          :value="isExpanded(item.id) ? '收起' : '展开'"
        >
          <van-cell title="任职开始日期" :value="item.startDate" />
          <van-cell title="任职结束日期" :value="endDateText(item.endDate)" />
          <van-cell title="任职部门">
            <span class="roster-detail-field-value">{{ item.department }}</span>
          </van-cell>
          <van-cell title="任职职位">
            <span class="roster-detail-field-value">{{ item.position }}</span>
          </van-cell>
          <van-cell title="任职职务">
            <span class="roster-detail-field-value">{{ item.duty }}</span>
          </van-cell>
          <van-cell title="任职职级" :value="item.rank" />
          <van-cell title="任职变动原因说明">
            <span class="roster-detail-field-value">{{
              item.changeReason
            }}</span>
          </van-cell>
          <van-cell title="数据来源" :value="item.source" />
          <van-cell title="操作人" :value="item.operator" />
          <van-cell title="操作时间" :value="item.operationTime" />
        </van-collapse-item>
      </van-collapse>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type {
  RosterDetailGrowthChange,
  RosterDetailGrowthPosition,
} from '@/types/employee/roster';
import { ROSTER_DETAIL_GROWTH_SUB_CHANGE } from '@/services/api/employee/roster/config';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    subCode?: string;
    changes?: RosterDetailGrowthChange[];
    positions?: RosterDetailGrowthPosition[];
  }>(),
  {
    loading: false,
    subCode: ROSTER_DETAIL_GROWTH_SUB_CHANGE,
    changes: () => [],
    positions: () => [],
  },
);

/** 是否异动记录 */
const isChange = computed(
  () => props.subCode === ROSTER_DETAIL_GROWTH_SUB_CHANGE,
);

/** 异动列表 / 时间轴 */
const viewMode = ref('list');
/** 展开的卡片 */
const expandedNames = ref<string[]>([]);

watch(
  () => [props.subCode, props.changes, props.positions],
  () => {
    viewMode.value = 'list';
    const list = isChange.value ? props.changes : props.positions;
    expandedNames.value = (list || []).map((item) => item.id);
  },
  { immediate: true },
);

function isExpanded(name: string) {
  return expandedNames.value.includes(name);
}

function toggleView() {
  viewMode.value = viewMode.value === 'list' ? 'timeline' : 'list';
}

function endDateText(value: string) {
  return value ? value : '至今';
}
</script>

<style scoped lang="less">
.roster-growth {
  min-height: 120px;
  padding: 0 0 16px;
}

.roster-growth-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.roster-growth-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 4px 12px 8px;
}

.roster-detail-card {
  margin-bottom: 8px;
  --van-collapse-item-content-padding: 0;
  --van-cell-value-color: #333333;
}

.roster-growth-dot {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--van-primary-color);
  color: #ffffff;
}

.roster-detail-field-value {
  text-align: right;
  white-space: pre-wrap;
  word-break: break-all;
}

.roster-growth-label {
  display: block;
  text-align: left;
  color: #999999;
}
</style>
