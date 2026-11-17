<template>
  <div class="roster-search">
    <RosterNav @back="back" />

    <van-search
      v-model="keyword"
      show-action
      autofocus
      scene="search-page"
      placeholder="搜索姓名和手机号"
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
import { orgTone } from '../utils/org';
import { useOpenOrg } from '../composables/useOpenOrg';
import { useRosterSearch } from './composables/useRosterSearch';
import RosterNav from '../components/RosterNav.vue';
import OrgRow from '../components/OrgRow.vue';
import StaffRow from '../components/StaffRow.vue';

defineOptions({ name: 'EmployeeRosterSearch' });

/*----搜索面板start----*/
/** 组织跳转和返回沿用花名册导航。 */
const { openOrg, back } = useOpenOrg();
/** 页面只消费搜索状态，加载和授权匹配收拢到搜索逻辑中。 */
const { loading, keyword, orgs, staff } = useRosterSearch();
/*----搜索面板end----*/
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
