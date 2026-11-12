<template>
  <div class="roster-detail">
    <RosterNav title="员工详情" @back="back" />

    <van-loading v-if="loading" class="roster-detail-loading" vertical>
      加载中
    </van-loading>

    <template v-else-if="tabPanel.options.length">
      <!-- /*----页签start----*/ -->
      <van-cascade-tabs
        v-model:active="tabPanel.active"
        class="roster-detail-tabs"
        :levels="2"
        :options="tabPanel.options"
        :show-nav-menu="false"
        color="var(--van-primary-color)"
        @change="tabPanel.change"
      />
      <!-- /*----页签end----*/ -->

      <!-- /*----内容区域start----*/ -->
      <div class="roster-detail-main">
        <RosterGrowth
          v-if="tabPanel.kind === 'growth'"
          :loading="tabPanel.loading"
          :sub-code="activeSubCode"
          :changes="tabPanel.growthChanges"
          :positions="tabPanel.growthPositions"
        />
        <RosterCost
          v-else-if="tabPanel.kind === 'cost'"
          :loading="tabPanel.loading"
          :data="tabPanel.costData"
        />
        <RosterAttachment
          v-else-if="tabPanel.kind === 'attachment'"
          :loading="tabPanel.loading"
          :sub-code="activeSubCode"
          :tabs="tabPanel.attachTabs"
        />
        <van-empty
          v-else-if="tabPanel.kind === 'empty'"
          description="暂无数据"
        />
        <RosterFields
          v-else
          :loading="tabPanel.loading"
          :mode="tabPanel.mode"
          :tab-name="activeTabName"
          :groups="tabPanel.groups"
          :form-data="tabPanel.formData"
          :records="tabPanel.records"
        />
      </div>
      <!-- /*----内容区域end----*/ -->
    </template>

    <van-empty v-else description="暂无信息集" />
  </div>
</template>

<script lang="ts" setup>
import { useRosterDetail } from './composables/useRosterDetail';
import RosterNav from '../components/RosterNav.vue';
import RosterFields from './components/fields.vue';
import RosterGrowth from './components/growth.vue';
import RosterCost from './components/cost.vue';
import RosterAttachment from './components/attachment.vue';

defineOptions({ name: 'EmployeeRosterDetail' });

const { loading, activeTabName, activeSubCode, tabPanel, back } =
  useRosterDetail();
</script>

<style scoped lang="less">
.roster-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
  --van-background-2: #f5f5f5;
  --van-tabs-nav-background: #ffffff;
  --van-cell-background: #ffffff;
  --van-cell-group-background: #ffffff;
  --van-collapse-item-content-background: #ffffff;
  --van-grid-item-content-background: #ffffff;
}

.roster-detail-tabs {
  flex: none;
}

.roster-detail-main {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--van-gray-13) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--van-gray-13);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.roster-detail-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}
</style>
