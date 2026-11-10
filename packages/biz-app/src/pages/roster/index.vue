<template>
  <div class="roster-home">
    <RosterNav :is-org-leader="isOrgLeader" @back="back" />

    <van-loading v-if="loading" class="roster-home-loading" vertical>
      加载中
    </van-loading>

    <template v-else>
      <!-- /*----入口start----*/ -->
      <van-cell-group>
        <van-cell
          is-link
          center
          :title="`组织架构 (${orgTotalText})`"
          @click="openOrg()"
        >
          <template #icon>
            <span class="roster-home-mark roster-home-mark-org" />
          </template>
        </van-cell>
        <van-cell is-link center title="我的部门" @click="openMyDept">
          <template #icon>
            <span class="roster-home-mark roster-home-mark-dept" />
          </template>
        </van-cell>
      </van-cell-group>
      <!-- /*----入口end----*/ -->

      <!-- /*----常用联系人start----*/ -->
      <section v-if="contacts.length" class="roster-home-contacts">
        <div class="roster-home-contacts-head">
          <span>常用联系人</span>
          <button
            type="button"
            class="roster-home-contacts-toggle"
            @click="contactsOpen = !contactsOpen"
          >
            {{ contactsOpen ? '收起' : '展开' }}
          </button>
        </div>
        <van-cell-group v-show="contactsOpen">
          <StaffRow
            v-for="item in contacts"
            :key="item.id"
            :staff="item"
            variant="contact"
          />
        </van-cell-group>
      </section>
      <!-- /*----常用联系人end----*/ -->
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { showToast } from 'vant';
import type { RosterStaff } from '@/types/employee/roster';
import { getRosterContextApi } from '@/services/api/employee/roster';
import { getOrgTreeApi } from '@/services/api/organization/org';
import { formatCount, sumTotalCount } from './utils/org';
import { useOpenOrg } from './composables/useOpenOrg';
import RosterNav from './components/RosterNav.vue';
import StaffRow from './components/StaffRow.vue';

defineOptions({ name: 'EmployeeRoster' });

const { openOrg, back } = useOpenOrg();
const loading = ref(true);
const isOrgLeader = ref(false);
const myDeptId = ref('');
const orgTotal = ref(0);
const contacts = ref<RosterStaff[]>([]);
const contactsOpen = ref(true);

const orgTotalText = computed(() => formatCount(orgTotal.value));

function openMyDept() {
  if (!myDeptId.value) {
    showToast('未找到我的部门');
    return;
  }
  openOrg(myDeptId.value);
}

async function load() {
  loading.value = true;
  try {
    const [contextRes, treeRes] = await Promise.all([
      getRosterContextApi(),
      getOrgTreeApi(),
    ]);
    if (!contextRes.success && !treeRes.success) {
      showToast(contextRes.message || treeRes.message || '加载失败');
    }
    isOrgLeader.value = Boolean(contextRes.body?.isOrgLeader);
    myDeptId.value = contextRes.body?.myDeptId || '';
    contacts.value = contextRes.body?.contacts || [];
    orgTotal.value = sumTotalCount(treeRes.body || []);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped lang="less">
.roster-home {
  min-height: 100%;
  background: #f5f5f5;
}

.roster-home-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.roster-home-mark {
  width: 22px;
  height: 22px;
  margin-right: 8px;
  border-radius: 4px;
}

.roster-home-mark-org {
  background: #1989fa;
}

.roster-home-mark-dept {
  background: #ff976a;
}

.roster-home-contacts {
  margin-top: 12px;
}

.roster-home-contacts-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  color: #999999;
  font-size: 12px;
}

.roster-home-contacts-toggle {
  border: 0;
  padding: 0;
  background: transparent;
  color: #ff8125;
  font-size: 12px;
}
</style>
