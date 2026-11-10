<template>
  <div class="roster-search">
    <RosterNav :is-org-leader="isOrgLeader" @back="back" />

    <van-search
      v-model="keyword"
      show-action
      autofocus
      scene="search-page"
      placeholder="搜索员工姓名"
      @cancel="back"
    />

    <van-loading v-if="loading" class="roster-search-loading" vertical>
      加载中
    </van-loading>

    <template v-else-if="keyword.trim()">
      <!-- /*----搜索到组织start----*/ -->
      <section v-if="orgs.length">
        <div class="roster-search-section">搜索到组织</div>
        <van-cell-group>
          <OrgRow
            v-for="(item, index) in orgs"
            :key="item.id"
            :name="item.name"
            :count="item.totalCount"
            :tone="orgTone(index)"
            :keyword="keyword.trim()"
            @select="openOrg(item.id)"
          />
        </van-cell-group>
      </section>
      <!-- /*----搜索到组织end----*/ -->

      <!-- /*----搜索到员工start----*/ -->
      <section v-if="staff.length">
        <div class="roster-search-section">搜索到员工</div>
        <van-cell-group>
          <StaffRow
            v-for="item in staff"
            :key="item.id"
            :staff="item"
            variant="search"
            :keyword="keyword.trim()"
          />
        </van-cell-group>
      </section>
      <!-- /*----搜索到员工end----*/ -->

      <van-empty
        v-if="!orgs.length && !staff.length"
        description="暂无搜索结果"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { showToast } from 'vant';
import type { RosterOrgNode, RosterStaff } from '@/types/employee/roster';
import {
  getRosterContextApi,
  getRosterStaffApi,
} from '@/services/api/employee/roster';
import { getOrgTreeApi } from '@/services/api/organization/org';
import { flattenOrgs, matchKeyword, orgTone } from './utils/org';
import { useOpenOrg } from './composables/useOpenOrg';
import RosterNav from './components/RosterNav.vue';
import OrgRow from './components/OrgRow.vue';
import StaffRow from './components/StaffRow.vue';

defineOptions({ name: 'EmployeeRosterSearch' });

const { openOrg, back } = useOpenOrg();
const loading = ref(true);
const keyword = ref('');
const isOrgLeader = ref(false);
const allOrgs = ref<RosterOrgNode[]>([]);
const allStaff = ref<RosterStaff[]>([]);

const orgs = computed(() =>
  allOrgs.value.filter((item) => matchKeyword(item.name, keyword.value)),
);

const staff = computed(() =>
  allStaff.value.filter((item) =>
    [item.name, item.workNo, item.phone, item.deptName].some((text) =>
      matchKeyword(text, keyword.value),
    ),
  ),
);

async function load() {
  loading.value = true;
  try {
    const [contextRes, treeRes, staffRes] = await Promise.all([
      getRosterContextApi(),
      getOrgTreeApi(),
      getRosterStaffApi(),
    ]);
    if (!treeRes.success && !staffRes.success) {
      showToast('加载失败');
    }
    isOrgLeader.value = Boolean(contextRes.body?.isOrgLeader);
    allOrgs.value = flattenOrgs(treeRes.body || []);
    allStaff.value = staffRes.body?.records || [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped lang="less">
.roster-search {
  min-height: 100%;
  background: #f5f5f5;
}

.roster-search-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.roster-search-section {
  padding: 8px 12px;
  color: #999999;
  font-size: 14px;
  line-height: 14px;
}
</style>
