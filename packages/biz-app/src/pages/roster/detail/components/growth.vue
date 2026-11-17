<template>
  <div
    class="roster-growth"
    :class="{ 'roster-growth-timeline': isChange && viewMode === 'timeline' }"
  >
    <template v-if="isChange">
      <!-- /*----视图切换start----*/ -->
      <div v-if="!loading" class="roster-growth-toolbar">
        <button type="button" class="roster-growth-switch" @click="toggleView">
          <van-icon
            :name="viewMode === 'list' ? 'todo-list-o' : 'orders-o'"
            size="20"
          />
          <span>{{ viewMode === 'list' ? '时间轴显示' : '列表显示' }}</span>
        </button>
      </div>
      <!-- /*----视图切换end----*/ -->

      <!-- /*----时间轴start----*/ -->
      <div v-if="viewMode === 'timeline'" class="roster-growth-axis">
        <ProcessTimeline
          :loading="loading"
          :items="timelineItems"
          empty-text="暂无异动记录"
        />
      </div>
      <!-- /*----时间轴end----*/ -->

      <!-- /*----异动卡片start----*/ -->
      <SchemaCard
        v-else
        :loading="loading"
        :groups="changeGroups"
        :model-value="changeFormData"
        empty-text="暂无异动记录"
      />
      <!-- /*----异动卡片end----*/ -->
    </template>

    <!-- /*----任职卡片start----*/ -->
    <SchemaCard
      v-else
      :loading="loading"
      :groups="positionGroups"
      :model-value="positionFormData"
      empty-text="暂无任职记录"
    />
    <!-- /*----任职卡片end----*/ -->
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import ProcessTimeline from '@/_components/ProcessTimeline';
import SchemaCard from '@/_components/SchemaCard';
import type {
  RosterDetailGrowthChange,
  RosterDetailGrowthPosition,
} from '@/types/employee/roster';
import { ROSTER_DETAIL_GROWTH_SUB_CHANGE } from '@/services/api/employee/roster/config';

/** 异动类型对应时间轴图标 */
function getChangeIcon(changeType: string) {
  if (changeType === '入职') return 'contact';
  if (changeType === '转正') return 'replay';
  if (changeType === '调动') return 'friends';
  if (changeType === '离职') return 'close';
  if (changeType === '退休') return 'manager';
  return 'contact';
}

/** 异动记录字段，卡片标题用异动类型 */
const CHANGE_FIELDS = [
  { name: 'changeDate', label: '异动日期' },
  { name: 'operationTime', label: '操作时间' },
  { name: 'detail', label: '详情' },
];

/** 企业内任职字段，卡片标题用岗位类型 */
const POSITION_FIELDS = [
  { name: 'startDate', label: '任职开始日期' },
  { name: 'endDate', label: '任职结束日期' },
  { name: 'department', label: '任职部门' },
  { name: 'position', label: '任职职位' },
  { name: 'duty', label: '任职职务' },
  { name: 'rank', label: '任职职级' },
  { name: 'changeReason', label: '任职变动原因说明' },
  { name: 'source', label: '数据来源' },
  { name: 'operator', label: '操作人' },
  { name: 'operationTime', label: '操作时间' },
];

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

watch(
  () => props.subCode,
  () => {
    viewMode.value = 'list';
  },
);

/** 时间轴节点：标题用异动类型，附加信息用日期 */
const timelineItems = computed(() =>
  (props.changes || []).map((item) => ({
    id: item.id,
    title: item.changeType,
    extra: item.changeDate,
    desc: item.detail,
    icon: getChangeIcon(item.changeType),
  })),
);

/** 一条异动一张卡，标题是转正 / 调动 / 入职 */
const changeGroups = computed(() =>
  (props.changes || []).map((item) => ({
    name: item.id,
    groupCode: item.id,
    title: item.changeType,
    fields: CHANGE_FIELDS,
  })),
);

/** 异动值按卡片 id 挂上，给 SchemaCard 按组取值 */
const changeFormData = computed(() =>
  Object.fromEntries(props.changes.map((item) => [item.id, item])),
);

/** 一条任职一张卡，标题是兼岗 / 主岗 */
const positionGroups = computed(() =>
  (props.positions || []).map((item) => ({
    name: item.id,
    groupCode: item.id,
    title: item.positionType,
    fields: POSITION_FIELDS,
  })),
);

/** 任职值按卡片 id 挂上；结束日期空时展示至今 */
const positionFormData = computed(() =>
  Object.fromEntries(
    props.positions.map((item) => [
      item.id,
      { ...item, endDate: item.endDate || '至今' },
    ]),
  ),
);

function toggleView() {
  viewMode.value = viewMode.value === 'list' ? 'timeline' : 'list';
}
</script>

<style scoped lang="less">
.roster-growth {
  min-height: 120px;
}

.roster-growth-timeline {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.roster-growth-axis {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: calc(100% + var(--van-padding-sm) * 2);
  margin-left: calc(0px - var(--van-padding-sm));
}

.roster-growth-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.roster-growth-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--van-text-color-secondary);
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
}
</style>
