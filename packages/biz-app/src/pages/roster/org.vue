<template>
  <div class="roster-org">
    <RosterNav :is-org-leader="isOrgLeader" @back="back" />

    <div @click="goSearch">
      <van-search readonly placeholder="搜索员工姓名" />
    </div>

    <van-loading v-if="loading" class="roster-org-loading" vertical>
      加载中
    </van-loading>

    <template v-else>
      <!-- /*----路径start----*/ -->
      <Curmb :items="path" @select="openOrg" />
      <!-- /*----路径end----*/ -->

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
        />
      </RosterBlock>
      <!-- /*----本部门员工end----*/ -->
    </template>
  </div>
</template>

<script lang="ts" setup>
import { orgTone } from './utils/org';
import { useRosterOrg } from './composables/useRosterOrg';
import RosterNav from './components/RosterNav.vue';
import Curmb from '@/_components/curmb/index.vue';
import RosterBlock from './components/RosterBlock.vue';
import OrgRow from './components/OrgRow.vue';
import StaffRow from './components/StaffRow.vue';

defineOptions({ name: 'EmployeeRosterOrg' });

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
  min-height: 100%;
  background: #f5f5f5;
}

.roster-org-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}
</style>
