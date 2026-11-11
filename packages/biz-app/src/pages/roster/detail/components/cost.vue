<template>
  <div class="roster-cost">
    <van-loading v-if="loading" class="roster-cost-loading" vertical>
      加载中
    </van-loading>

    <template v-else>
      <div class="roster-cost-head">
        <span class="roster-cost-title">成本详情</span>
        <van-button
          type="text"
          size="small"
          class="roster-cost-mode"
          :class="{ 'roster-cost-mode-active': mode === 'ratio' }"
          @click="mode = 'ratio'"
        >
          按比例
        </van-button>
        <van-button
          type="text"
          size="small"
          class="roster-cost-mode"
          :class="{ 'roster-cost-mode-active': mode === 'amount' }"
          @click="mode = 'amount'"
        >
          按金额
        </van-button>
        <span class="roster-cost-total">{{ totalText }}</span>
      </div>

      <van-empty v-if="!rows.length" description="暂无成本数据" />

      <van-cell-group
        v-for="(row, index) in rows"
        :key="index"
        class="roster-cost-card"
      >
        <van-cell title="成本中心" :value="row.costCenterName" />
        <van-cell v-if="mode === 'amount'" title="成本项目">
          <span class="roster-detail-field-value">{{
            row.costProjectName
          }}</span>
        </van-cell>
        <van-cell
          :title="mode === 'ratio' ? '分摊比例(%)' : '分摊金额(元)'"
          :value="row.value"
        />
      </van-cell-group>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { RosterDetailCostData } from '@/types/employee/roster';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    data?: RosterDetailCostData;
  }>(),
  {
    loading: false,
    data: () => ({
      ratioTotal: '',
      amountTotal: '',
      ratioRows: [],
      amountRows: [],
    }),
  },
);

/** 按比例 / 按金额，页内切换不是二级 Tab */
const mode = ref('ratio');

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
</script>

<style scoped lang="less">
.roster-cost {
  min-height: 120px;
  padding: 8px 0 16px;
}

.roster-cost-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.roster-cost-head {
  display: flex;
  align-items: center;
  padding: 8px 12px 12px;
  background: #ffffff;
}

.roster-cost-title {
  margin-right: 8px;
  padding-left: 8px;
  border-left: 3px solid var(--van-primary-color);
  color: #333333;
  font-size: 14px;
  line-height: 20px;
}

.roster-cost-mode {
  color: #969799;
}

.roster-cost-mode-active {
  color: var(--van-primary-color);
}

.roster-cost-total {
  margin-left: auto;
  color: #333333;
  font-size: 12px;
  line-height: 18px;
}

.roster-cost-card {
  margin-top: 8px;
}

.roster-detail-field-value {
  text-align: right;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
