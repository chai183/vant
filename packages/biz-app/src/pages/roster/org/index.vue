<template>
  <div class="roster-org">
    <RosterNav :is-org-leader="isOrgLeader" @back="back" />

    <!-- /*----搜索路径start----*/ -->
    <div class="roster-org-head">
      <div class="roster-org-search" @click="goSearch">
        <van-search readonly placeholder="搜索姓名和手机号" />
      </div>
      <Curmb :items="path" @select="openOrg" />
    </div>
    <!-- /*----搜索路径end----*/ -->

    <div class="roster-org-body">
      <van-loading v-if="loading" class="roster-org-loading" vertical>
        加载中
      </van-loading>

      <template v-else>
        <!-- /*----下级部门start----*/ -->
        <RosterBlock
          v-if="orgs.length"
          mode="dept"
          title="组织"
          :extra="`(${orgs.length})`"
          :show-head="!!path.length"
        >
          <OrgRow
            v-for="(item, index) in orgs"
            :key="item.id"
            :name="item.name"
            :count="item.totalCount"
            :tone="orgTone(index)"
            @select="openOrg(item.id)"
          />
        </RosterBlock>
        <!-- /*----下级部门end----*/ -->

        <!-- /*----本部门员工start----*/ -->
        <RosterBlock mode="staff" :title="staffTitle" :empty="!staff.length">
          <StaffRow
            v-for="item in staff"
            :key="item.id"
            :staff="item"
            variant="member"
            arrow
          />
        </RosterBlock>
        <!-- /*----本部门员工end----*/ -->
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { orgTone } from '../utils/org';
import { useRosterOrg } from './composables/useRosterOrg';
import RosterNav from '../components/RosterNav.vue';
import Curmb from '@/_components/curmb/index.vue';
import RosterBlock from './components/rosterBlock.vue';
import OrgRow from '../components/OrgRow.vue';
import StaffRow from '../components/StaffRow.vue';

defineOptions({ name: 'EmployeeRoster' });

/** 花名册入口就是组织架构。部门负责人进我的部门，其他人进组织架构根 */

const {
  loading,
  isOrgLeader,
  orgs,
  path,
  staff,
  staffTitle,
  openOrg,
  goSearch,
  back,
} = useRosterOrg();
</script>

<style scoped lang="less">
.roster-org {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

.roster-org-head {
  flex-shrink: 0;
  background: #f5f5f5;
}

.roster-org-search {
  --van-radius-sm: 16px;
}

.roster-org-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
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

.roster-org-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}
</style>
