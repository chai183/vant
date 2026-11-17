<template>
  <div class="employee-archive">
    <RosterNav title="档案详情" @back="back" />
    <!-- /*----档案信息集页签start----*/ -->
    <div class="employee-archive-tabs-row">
      <van-tabs
        v-if="tabs.length"
        v-model:active="activeCode"
        class="employee-archive-tabs"
        :before-change="beforeTabChange"
        :swipe-threshold="5"
        :show-nav-menu="false"
        nav-overflow="shadow"
        @change="changeTab"
      >
        <van-tab
          v-for="tab in tabs"
          :key="tab.code"
          :name="tab.code"
          :title="tab.name"
        />
      </van-tabs>
      <van-dropdown-menu v-if="tabs.length > 8" class="employee-archive-menu">
        <van-dropdown-item ref="menuRef">
          <template #title><van-icon name="wap-nav" /></template>
          <nav class="employee-archive-menu-options" aria-label="全部信息集">
            <button
              v-for="tab in tabs"
              :key="tab.code"
              type="button"
              :class="[
                'employee-archive-menu-option',
                { 'employee-archive-menu-selected': tab.code === activeCode },
              ]"
              :aria-current="tab.code === activeCode ? 'true' : undefined"
              @click="selectMenuTab(tab.code)"
            >
              {{ tab.name
              }}<van-icon v-if="tab.code === activeCode" name="success" />
            </button>
          </nav>
        </van-dropdown-item>
      </van-dropdown-menu>
    </div>
    <!-- /*----档案信息集页签end----*/ -->
    <van-notice-bar
      v-if="editing && approvalNotice && !savedNeedsRefresh"
      :key="activeCode"
      mode="closeable"
      wrapable
      :scrollable="false"
      left-icon="info-o"
      :text="approvalNotice"
    />
    <!-- /*----档案内容start----*/ -->
    <main class="employee-archive-main">
      <van-loading v-if="loading" class="employee-archive-loading" vertical
        >加载中</van-loading
      >
      <div
        v-else-if="error && !editing"
        class="employee-archive-error"
        role="alert"
      >
        <p>{{ error }}</p>
        <van-button size="small" @click="retry">重新加载</van-button>
      </div>
      <ArchiveEditPanel
        v-else-if="editing"
        ref="editorRef"
        :drafts="drafts"
        :schema="editSchema"
        :multi="panel.multi"
        :pending="panel.pending"
        :can-add="canAdd && !savedNeedsRefresh"
        :disabled="saving || savedNeedsRefresh"
        @add="addRecord"
        @remove="removeRecord"
      />
      <template v-else-if="readSchema.groupList.length && panel.records.length">
        <section
          v-for="(record, index) in panel.records"
          :key="record.id || index"
          class="employee-archive-record"
        >
          <h2 v-if="panel.multi" class="employee-archive-record-title">
            {{ title }} {{ index + 1
            }}<span
              v-if="panel.pending.some((item) => item.recordId === record.id)"
              >审批中</span
            >
          </h2>
          <SchemaCard :schema="[readSchema]" :model-value="record.groups" />
        </section>
      </template>
      <template v-else-if="panel.kind === 'growth'">
        <van-tabs v-model:active="secondaryTab">
          <van-tab title="异动记录" name="change" /><van-tab
            title="企业内任职记录"
            name="position"
          />
        </van-tabs>
        <RosterGrowth
          :sub-code="secondaryTab"
          :changes="panel.changes"
          :positions="panel.positions"
        />
      </template>
      <RosterCost v-else-if="panel.kind === 'cost'" :data="panel.cost" />
      <template v-else-if="panel.kind === 'attachment'">
        <van-tabs v-model:active="attachmentTab"
          ><van-tab title="花名册附件" name="ROSTER_ATTACH" /><van-tab
            title="入职附件"
            name="ONBOARDING_ATTACH"
        /></van-tabs>
        <RosterAttachment :sub-code="attachmentTab" :tabs="panel.attachments" />
      </template>
      <van-empty v-else description="暂无数据" />
    </main>
    <!-- /*----档案内容end----*/ -->
    <!-- /*----档案编辑操作start----*/ -->
    <footer
      v-if="!loading && !error && (canEdit || editing)"
      class="employee-archive-actions"
    >
      <template v-if="editing">
        <van-button
          round
          plain
          type="primary"
          :disabled="saving || savedNeedsRefresh"
          @click="cancelEdit"
          >取消</van-button
        >
        <van-button
          round
          type="primary"
          :loading="saving"
          @click="saveCurrent"
          >{{ savedNeedsRefresh ? '重试刷新' : '提交' }}</van-button
        >
      </template>
      <van-button v-else round plain type="primary" block @click="startEdit"
        >编辑</van-button
      >
    </footer>
    <!-- /*----档案编辑操作end----*/ -->
    <!-- /*----提交二次确认start----*/ -->
    <ArchiveSubmitDialog
      v-model:show="confirming"
      :basic="activeCode === ROSTER_DETAIL_BASIC_TAB"
      :summary="submitSummary"
      @submit="confirmSave"
    />
    <!-- /*----提交二次确认end----*/ -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { DropdownItemInstance } from 'vant';
import SchemaCard from '@/_components/SchemaCard';
import RosterNav from '@/pages/roster/components/RosterNav.vue';
import RosterGrowth from '@/pages/roster/detail/components/growth.vue';
import RosterCost from '@/pages/roster/detail/components/cost.vue';
import RosterAttachment from '@/pages/roster/detail/components/attachment.vue';
import ArchiveEditPanel from './components/ArchiveEditPanel/index.vue';
import ArchiveSubmitDialog from './components/ArchiveSubmitDialog/index.vue';
import { ROSTER_DETAIL_BASIC_TAB } from '@/services/api/employee/roster/config';
import { useEmployeeArchive } from './composables/useEmployeeArchive';

defineOptions({ name: 'EmployeeArchive' });

/*----档案数据与编辑start----*/
/** 本人档案、原始信息集、权限和未提交草稿。 */
const {
  loading,
  error,
  tabs,
  activeCode,
  title,
  panel,
  readSchema,
  editSchema,
  approvalNotice,
  confirming,
  submitSummary,
  canEdit,
  canAdd,
  editing,
  saving,
  drafts,
  savedNeedsRefresh,
  startEdit,
  cancelEdit,
  addRecord,
  removeRecord,
  beforeTabChange,
  changeTab,
  back,
  retry,
  save,
  confirmSave,
} = useEmployeeArchive();
/** 原有专用信息集仍复用详情组件。 */
const secondaryTab = ref('change');
/** 附件页内切换，不改变档案一级页签。 */
const attachmentTab = ref('ROSTER_ATTACH');
/** 有实际变更后，再校验动态表单并定位错误。 */
const editorRef = ref<InstanceType<typeof ArchiveEditPanel> | null>(null);
/** 页签展开菜单也必须通过未保存确认。 */
const menuRef = ref<DropdownItemInstance | null>(null);
async function selectMenuTab(code: string) {
  if (code !== activeCode.value && (await beforeTabChange(code))) {
    activeCode.value = code;
    await changeTab();
  }
  menuRef.value?.toggle(false);
}
async function saveCurrent() {
  await save(async () => Boolean(await editorRef.value?.validate()));
}
/*----档案数据与编辑end----*/
</script>

<style scoped lang="less">
.employee-archive {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--van-background);
}
.employee-archive-tabs {
  flex: 1;
  min-width: 0;
}
.employee-archive-tabs-row {
  display: flex;
  flex-shrink: 0;
  background: var(--van-background-2);
}
.employee-archive-menu {
  flex: 0 0 40px;
  --van-dropdown-menu-shadow: none;
  --van-dropdown-menu-background: var(--van-background-2);
  --van-dropdown-menu-content-max-height: min(580px, 80vh);
}
.employee-archive-menu-options {
  overflow: auto;
  max-height: min(580px, 80vh);
}
.employee-archive-menu-option {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  border: 0;
  text-align: left;
  font: inherit;
  font-size: 14px;
  background: var(--van-background-2);
  color: var(--van-text-color);
}
.employee-archive-menu-selected {
  color: var(--van-primary-color);
}
.employee-archive-main {
  flex: 1;
  min-height: 0;
  padding: 12px;
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
.employee-archive-loading,
.employee-archive-error {
  padding: 48px 0;
  text-align: center;
}
.employee-archive-record + .employee-archive-record {
  margin-top: 12px;
}
.employee-archive-record-title {
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 12px;
  background: var(--van-background-2);
  font-size: 14px;
  font-weight: 500;
}
.employee-archive-record-title span {
  font-size: 12px;
  color: var(--van-primary-color);
}
.employee-archive-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  background: var(--van-background-2);
}
.employee-archive-actions > * {
  flex: 1;
}
</style>
