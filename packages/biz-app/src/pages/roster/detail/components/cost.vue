<template>
  <div class="roster-cost">
    <van-loading v-if="loading" class="roster-cost-loading" vertical>
      加载中
    </van-loading>

    <template v-else>
      <!-- /*----标题栏start----*/ -->
      <div class="roster-cost-head">
        <span class="roster-cost-title">成本详情</span>
        <span class="roster-cost-mode">{{ modeText }}</span>
        <span class="roster-cost-total">{{ totalText }}</span>
      </div>
      <!-- /*----标题栏end----*/ -->

      <!-- /*----卡片start----*/ -->
      <van-empty v-if="!cardList.length" description="暂无成本数据" />
      <div v-else class="roster-cost-list">
        <van-card
          v-for="card in cardList"
          :key="card.id"
          class="roster-cost-card"
          :show-title="false"
          content-type="text-list"
          :content-items="card.items"
        >
          <template #text-list-row="{ item }">
            <div class="roster-cost-row">
              <span class="roster-cost-row-label">{{ item.label }}</span>
              <span class="roster-cost-row-value">{{ item.value }}</span>
            </div>
          </template>
        </van-card>
      </div>
      <!-- /*----卡片end----*/ -->
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { RosterDetailCostData } from '@/types/employee/roster';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    data?: RosterDetailCostData;
  }>(),
  {
    loading: false,
    data: () => ({
      displayType: 0,
      ratioTotal: '',
      amountTotal: '',
      ratioRows: [],
      amountRows: [],
    }),
  },
);

/** 展示形式跟接口：0 比例，1 金额 */
const mode = computed(() =>
  Number(props.data.displayType) === 1 ? 'amount' : 'ratio',
);

/** 标题旁的模式文案 */
const modeText = computed(() =>
  mode.value === 'amount' ? '按金额' : '按比例',
);

/** 当前列表 */
const rows = computed(() =>
  mode.value === 'ratio'
    ? props.data.ratioRows || []
    : props.data.amountRows || [],
);

/** 合计文案 */
const totalText = computed(() =>
  mode.value === 'ratio'
    ? `总比例：${props.data.ratioTotal || ''}`
    : `总金额：${props.data.amountTotal || ''}`,
);

/** 每张卡：成本中心 + 按金额时的成本项目 + 比例/金额 */
const cardList = computed(() =>
  rows.value.map((row, index) => {
    const items = [{ label: '成本中心', value: row.costCenterName || '' }];
    if (mode.value === 'amount') {
      items.push({ label: '成本项目', value: row.costProjectName || '' });
    }
    items.push({
      label: mode.value === 'ratio' ? '分摊比例 (%)' : '分摊金额 (元)',
      value: row.value || '',
    });
    return { id: index, items };
  }),
);
</script>

<style scoped lang="less">
.roster-cost {
  min-height: 120px;
}

.roster-cost-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.roster-cost-head {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.roster-cost-title {
  flex: none;
  margin-right: 8px;
  padding-left: 8px;
  border-left: 3px solid #ff8125;
  color: #666666;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
}

.roster-cost-mode {
  flex: none;
  color: #999999;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.roster-cost-total {
  margin-left: auto;
  color: #666666;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.roster-cost-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.roster-cost-card.van-card {
  --van-card-background: var(--van-white);
  --van-padding-base: var(--van-padding-sm);
  --van-card-text-list-row-padding-y: 4px;
  margin-top: 0;
}

.roster-cost-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.roster-cost-row-label {
  flex: none;
  width: 96px;
  color: var(--van-text-color-secondary);
  font-size: 14px;
  line-height: 20px;
}

.roster-cost-row-value {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
  color: var(--van-text-color);
  font-size: 14px;
  line-height: 20px;
  word-break: break-all;
}
</style>
