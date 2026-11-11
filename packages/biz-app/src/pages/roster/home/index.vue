<template>
  <div class="roster-home">
    <RosterNav :is-org-leader="isOrgLeader" @back="back" />

    <van-loading v-if="loading" class="roster-home-loading" vertical>
      加载中
    </van-loading>

    <template v-else>
      <!-- /*----入口start----*/ -->
      <van-cell-group>
        <OrgRow
          name="组织架构"
          :count="orgTotal"
          color="#EEF1F9"
          @select="openOrg()"
        />
        <OrgRow name="我的部门" color="#FFF1E5" @select="openMyDept" />
      </van-cell-group>
      <!-- /*----入口end----*/ -->

      <!-- /*----常用联系人start----*/ -->
      <van-collapse
        v-if="contacts.length"
        v-model="contactNames"
        class="roster-home-contacts"
      >
        <van-collapse-item
          title="常用联系人"
          name="contacts"
          :value="contactsExpanded ? '收起' : '展开'"
        >
          <StaffRow
            v-for="item in contacts"
            :key="item.id"
            :staff="item"
            variant="contact"
          />
        </van-collapse-item>
      </van-collapse>
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
import { sumTotalCount } from '../utils/org';
import { useOpenOrg } from '../composables/useOpenOrg';
import RosterNav from '../components/RosterNav.vue';
import OrgRow from '../components/OrgRow.vue';
import StaffRow from '../components/StaffRow.vue';

defineOptions({ name: 'EmployeeRoster' });

const { openOrg, back } = useOpenOrg();
const loading = ref(true);
const isOrgLeader = ref(false);
const myDeptId = ref('');
const orgTotal = ref(0);
const contacts = ref<RosterStaff[]>([]);
// 常用联系人折叠面板，默认展开
const contactNames = ref(['contacts']);

// 展开时右侧是收起，收起时是展开
const contactsExpanded = computed(() =>
  contactNames.value.includes('contacts'),
);

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

.roster-home-contacts {
  margin-top: 12px;
  --van-collapse-item-content-padding: 0;
  --van-cell-value-color: #333333;
}
</style>
