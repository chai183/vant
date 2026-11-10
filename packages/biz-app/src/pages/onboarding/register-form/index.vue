<template>
  <div class="register-form">
    <van-nav-bar
      title="入职登记表管理"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="router.back()"
    >
      <template v-if="isPendingTab" #right>
        <button
          type="button"
          class="register-form__batch-btn"
          @click="toggleBatch"
        >
          {{ batchMode ? '取消' : '批量操作' }}
          <van-badge
            v-if="!batchMode && selectedIds.length"
            :content="selectedIds.length"
            class="register-form__batch-badge"
          />
        </button>
      </template>
    </van-nav-bar>

    <div class="register-form__search">
      <van-search
        v-model="keyword"
        scene="filter-bar"
        action-text="搜索"
        placeholder="搜索姓名、手机号"
        @search="onSearch"
      />
    </div>

    <van-tabs
      v-model:active="activeTab"
      color="var(--van-primary-color)"
      title-active-color="var(--van-primary-color)"
      title-inactive-color="var(--van-text-color)"
      line-width="28"
      line-height="3"
      @change="onTabChange"
    >
      <van-tab
        :name="REGISTER_FORM_TAB.PENDING"
        title="待处理"
        :badge="pendingCount > 99 ? '99+' : pendingCount"
        :show-zero-badge="false"
      />
      <van-tab :name="REGISTER_FORM_TAB.COMPLETED" title="已处理" />
    </van-tabs>

    <van-filter-menu-bar
      v-model="filterModel"
      class="register-form__filters"
      :columns="filterColumns"
      :overflow-threshold="4"
      funnel-title="筛选"
      active-color="var(--van-primary-color)"
      @confirm="onFilterConfirm"
    />

    <div class="register-form__list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadMore"
        >
          <van-card
            v-for="item in list"
            :key="item.id"
            class="register-form-card"
            type="default"
            :title="item.name || '-'"
            :title-rows="2"
            :status-tag-props="getCardStatusTag(item)"
            :tags="getCardTags(item)"
            content-type="text-list"
            :content-items="getCardContentItems(item)"
            :selectable="isPendingTab && batchMode"
            :selected="selectedIds.includes(item.id)"
            :show-footer-buttons="isPendingTab && !batchMode"
            footer-button-type="outline"
            :footer-buttons="getCardFooterButtons(item)"
            @update:selected="
              (checked: boolean) => toggleSelect(item.id, checked)
            "
            @click-button="(payload) => onCardButton(item, payload)"
          />

          <van-empty
            v-if="!loading && !list.length"
            description="暂无数据"
            image-size="100"
          />
        </van-list>
      </van-pull-refresh>
    </div>

    <button
      v-if="isPendingTab"
      type="button"
      class="register-form__fab"
      aria-label="入职二维码"
      @click="router.push({ name: 'OnboardingRegisterFormQr' })"
    >
      <van-icon name="qr" size="20" color="#fff" />
    </button>

    <van-bottom-action-bar
      v-if="isPendingTab"
      placeholder
      :start-gap="batchMode ? 16 : undefined"
    >
      <template v-if="batchMode" #top>
        <div class="register-form__batch-summary">
          共{{ total }}条，已选
          <span class="register-form__batch-summary-num">{{
            selectedIds.length
          }}</span>
          条
        </div>
      </template>
      <template v-if="batchMode" #more>
        <van-checkbox v-model="isAllSelected" shape="square">
          全选
        </van-checkbox>
      </template>
      <template #actions>
        <template v-if="batchMode">
          <van-button
            round
            type="primary"
            :disabled="!selectedIds.length"
            @click="onBatchApprove"
          >
            同意
          </van-button>
          <van-button
            round
            plain
            type="primary"
            :disabled="!selectedIds.length"
            @click="onBatchConfirmEntry"
          >
            确认入职
          </van-button>
        </template>
        <van-button
          v-else
          type="primary"
          block
          round
          @click="openTemplatePopup"
        >
          填写入职登记表
        </van-button>
      </template>
    </van-bottom-action-bar>

    <!-- 单条：同意 / 退回 / 拒绝 -->
    <ApprovalActionPopup
      v-model:show="showApprovalPopup"
      :action="approvalAction"
      :loading="approvalSubmitting"
      @confirm="confirmApprovalAction"
    />

    <!-- 批量同意二次确认 -->
    <van-popup
      v-model:show="showBatchApprovePopup"
      round
      closeable
      position="bottom"
      title="批量同意"
      safe-area-inset-bottom
      class="register-form__batch-approve-popup"
      @closed="resetBatchApproveForm"
    >
      <div class="register-form__batch-approve">
        <van-pro-form
          ref="batchApproveFormRef"
          v-model="batchApproveForm"
          class="register-form__batch-approve-form"
          :columns="batchApproveColumns"
          required="auto"
          :show-submit="false"
        />
        <van-button
          block
          round
          type="primary"
          class="register-form__batch-approve-submit"
          :loading="batchApproving"
          @click="confirmBatchApprove"
        >
          确认同意 ({{ selectedIds.length }})
        </van-button>
      </div>
    </van-popup>

    <!-- 填写前选择入职登记模板 -->
    <van-popup
      v-model:show="showTemplatePopup"
      round
      closeable
      position="bottom"
      title="选择入职登记模板"
      safe-area-inset-bottom
      class="register-form__template-popup"
    >
      <div class="register-form__template">
        <van-loading
          v-if="templateLoading"
          class="register-form__template-loading"
          vertical
        >
          加载中
        </van-loading>
        <van-empty
          v-else-if="!templateOptions.length"
          description="暂无可用的入职登记模板"
        />
        <template v-else>
          <van-radio-group
            v-model="selectedTemplateId"
            class="register-form__template-list"
            is-list
            :options="templateOptions"
          />
          <div class="register-form__template-actions">
            <van-button
              round
              plain
              hairline
              class="register-form__template-action"
              @click="showTemplatePopup = false"
            >
              取消
            </van-button>
            <van-button
              round
              type="primary"
              class="register-form__template-action"
              @click="confirmTemplate"
            >
              确认
            </van-button>
          </div>
        </template>
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  showConfirmDialog,
  showSuccessToast,
  showToast,
  type CardFooterButton,
  type CardStatusTagProps,
  type CardTagOption,
  type CardTextListItem,
  type FilterMenuBarItem,
  type FilterMenuBarModel,
  type ProFormColumn,
  type ProFormOption,
} from 'vant';
import type {
  BatchOperationFailItem,
  OnboardingRegisterFormListItem,
} from '@/types/employee/employment/onboarding/register-form';
import {
  approveOnboardingRegisterFormApi,
  deleteOnboardingRegisterFormApi,
  getOnboardingRegisterFormPageApi,
  rejectOnboardingRegisterFormApi,
  returnOnboardingRegisterFormApi,
} from '@/services/api/employee/employment/onboarding/register-form';
import {
  confirmWaitEntryApi,
  getOnboardingRegisterFormTemplatePageApi,
} from '@/services/api/employee/employment/onboarding';
import {
  ENTRY_TEMPLATE_PAGE_SIZE,
  REGISTER_FORM_TEMPLATE_STATUS,
} from '@/services/api/employee/employment/onboarding/config';
import { createDataSourceLoadOptions } from '@/_components/SchemaProForm/dataSource';
import { useDictStore } from '@/pinia/stores/dict';
import {
  REGISTER_FORM_APPROVAL_ACTION,
  REGISTER_FORM_APPROVAL_NOTIFY,
} from '@/services/api/employee/employment/onboarding/register-form/config';
import {
  APPROVAL_NOTIFY_OPTIONS,
  BATCH_FEEDBACK_STORAGE_KEY,
  CONFIRM_ENTRY_BATCH_TIP,
  CONFIRM_ENTRY_SINGLE_TIP,
  DEPARTMENT_OPTIONS,
  formatPhone,
  getListTypeByTab,
  getRegisterFormStatusOptions,
  REGISTER_FORM_APPROVAL_OPINION_MAX_LENGTH,
  REGISTER_FORM_TAB,
  REGISTER_STATUS,
} from './config';
import ApprovalActionPopup, {
  type ApprovalActionType,
} from './components/ApprovalActionPopup.vue';
import {
  REGISTER_FORM_ROW_ACTION,
  buildConfirmEntryEditOptions,
  buildRegisterFormEditQuery,
  getRegisterFormActionFlags,
  type RegisterFormEditRouteOptions,
} from './utils/row-actions';

type BatchApproveFormExpose = {
  validate?: (name?: string | string[]) => Promise<void>;
  resetValidation?: (name?: string | string[]) => void;
};

/** 审批状态角标：对齐设计稿待处理 / 已处理配色 */
const STATUS_TAG_TYPE_MAP: Record<
  string,
  NonNullable<CardStatusTagProps['type']>
> = {
  [REGISTER_STATUS.CONFIRM]: 'primary',
  [REGISTER_STATUS.WAIT_COMMIT]: 'primary',
  [REGISTER_STATUS.RECHECK]: 'info',
  [REGISTER_STATUS.UN_SENT]: 'info',
  [REGISTER_STATUS.PASSED]: 'success',
  [REGISTER_STATUS.REJECTED]: 'danger',
  [REGISTER_STATUS.ABANDON]: 'info',
};

defineOptions({ name: 'OnboardingRegisterForm' });

const STAFF_TYPE_DICT_CODE = 'GROUP.Enum.StaffType';

const router = useRouter();
const dictStore = useDictStore();

const activeTab = ref<string>(REGISTER_FORM_TAB.PENDING);
const keyword = ref('');
const searchKeyword = ref('');

const filterModel = ref<FilterMenuBarModel>({
  enrollDate: ['', ''],
  registerStatus: [],
  departmentId: '',
  positionIds: [],
  staffTypes: [],
});

/** 员工类型：字典选项 */
const staffTypeOptions = ref<Array<{ label: string; value: string }>>([]);

/** 职位：弹层分页 loadOptions */
const loadPositionOptions = createDataSourceLoadOptions('position');

async function loadStaffTypeOptions() {
  const items = await dictStore.getDict(STAFF_TYPE_DICT_CODE);
  staffTypeOptions.value = items
    .filter((item) => !item.disabled)
    .map((item) => ({
      label: item.label,
      value: String(item.value),
    }));
}

onMounted(() => {
  loadStaffTypeOptions();
});

const list = ref<OnboardingRegisterFormListItem[]>([]);
const pageNum = ref(1);
const pageSize = 10;
const total = ref(0);
const pendingCount = ref(0);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

const batchMode = ref(false);
const selectedIds = ref<string[]>([]);

const showApprovalPopup = ref(false);
const approvalAction = ref<ApprovalActionType>(
  REGISTER_FORM_APPROVAL_ACTION.APPROVE,
);
const approvalSubmitting = ref(false);
const showBatchApprovePopup = ref(false);
const showTemplatePopup = ref(false);
const templateLoading = ref(false);
const templateOptions = ref<ProFormOption[]>([]);
const selectedTemplateId = ref('');
const batchApproving = ref(false);
const batchConfirming = ref(false);
const batchApproveFormRef = ref<BatchApproveFormExpose>();
const batchApproveForm = ref({
  comment: '',
  notifyMethods: [REGISTER_FORM_APPROVAL_NOTIFY.EMAIL] as string[],
});

const currentRow = ref<OnboardingRegisterFormListItem | null>(null);

const batchApproveColumns = computed<ProFormColumn[]>(() => [
  {
    name: 'comment',
    label: '意见',
    component: 'field',
    fieldProps: {
      labelAlign: 'top',
      type: 'textarea',
      rows: 3,
      autosize: true,
      maxlength: REGISTER_FORM_APPROVAL_OPINION_MAX_LENGTH,
      showWordLimit: true,
      placeholder: '请输入意见（非必填）',
    },
  },
  {
    name: 'notifyMethods',
    label: '通知方式',
    component: 'checkboxPicker',
    options: [...APPROVAL_NOTIFY_OPTIONS],
    fieldProps: {
      placeholder: '请选择',
      isLink: true,
    },
    componentProps: {
      isList: true,
      popupTitle: '通知方式',
      shape: 'square',
    },
  },
]);

const isPendingTab = computed(
  () => activeTab.value === REGISTER_FORM_TAB.PENDING,
);

const statusOptions = computed(() =>
  getRegisterFormStatusOptions(!isPendingTab.value),
);

const filterColumns = computed<FilterMenuBarItem[]>(() => [
  {
    key: 'enrollDate',
    title: '入职日期',
    showFooter: true,
    columns: [
      {
        name: 'enrollDate',
        label: '入职日期',
        component: 'rangeInput',
        defaultValue: ['', ''],
        componentProps: {
          layout: 'horizontal',
          showDateShortcuts: true,
          start: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '开始日期',
              isLink: false,
            },
          },
          end: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '结束日期',
              isLink: false,
            },
          },
        },
      },
    ],
  },
  {
    key: 'registerStatus',
    title: '审批状态',
    showFooter: true,
    columns: [
      {
        name: 'registerStatus',
        label: '审批状态',
        component: 'checkboxGroup',
        defaultValue: [],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: statusOptions.value.map((item) => ({
            label: item.label,
            value: item.value,
          })),
        },
      },
    ],
  },
  {
    key: 'departmentId',
    title: '部门',
    columns: [
      {
        name: 'departmentId',
        label: '部门',
        component: 'radioGroup',
        defaultValue: '',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: DEPARTMENT_OPTIONS.map((item) => ({
            label: item.text,
            value: item.value,
          })),
        },
      },
    ],
  },
  {
    key: 'positionIds',
    title: '职位',
    showFooter: true,
    columns: [
      {
        name: 'positionIds',
        label: '职位',
        component: 'checkboxPicker',
        defaultValue: [],
        fieldProps: {
          placeholder: '请选择职位',
        },
        componentProps: {
          isList: true,
          showSearch: true,
          pageSize: 20,
          loadOptions: loadPositionOptions,
        },
      },
    ],
  },
  {
    key: 'staffTypes',
    title: '员工类型',
    showFooter: true,
    columns: [
      {
        name: 'staffTypes',
        label: '员工类型',
        component: 'checkboxPicker',
        defaultValue: [],
        fieldProps: {
          placeholder: '请选择员工类型',
        },
        componentProps: {
          isList: true,
          options: staffTypeOptions.value,
        },
      },
    ],
  },
]);

function getEnrollDateRange() {
  const range = filterModel.value.enrollDate;
  if (!Array.isArray(range)) {
    return { start: '', end: '' };
  }
  return {
    start: String(range[0] || ''),
    end: String(range[1] || range[0] || ''),
  };
}

function getPendingActionFlags(item?: OnboardingRegisterFormListItem | null) {
  if (!isPendingTab.value) {
    return { canApprove: false, canEdit: false, canRecheckEntry: false };
  }
  return getRegisterFormActionFlags(item?.registerStatus);
}

function getCardStatusTag(
  item: OnboardingRegisterFormListItem,
): CardStatusTagProps {
  const status = String(item.registerStatus || '');
  return {
    text: item.registerStatusName || '-',
    plain: true,
    type: STATUS_TAG_TYPE_MAP[status] || 'primary',
  };
}

function getCardTags(item: OnboardingRegisterFormListItem): CardTagOption[] {
  const tags: CardTagOption[] = [];
  // 员工类型：全职 / 兼职等同色 primary
  if (item.staffTypeName) {
    tags.push({ text: item.staffTypeName, type: 'primary', plain: true });
  }
  // 已承诺展示；未承诺为空
  if (item.tagName) {
    tags.push({ text: item.tagName, type: 'success', plain: true });
  }
  return tags;
}

function getCardContentItems(
  item: OnboardingRegisterFormListItem,
): CardTextListItem[] {
  return [
    { label: '手机号', value: formatPhone(item.phone), valueRows: 'auto' },
    {
      label: '部门',
      value: item.departmentName || '-',
      valueRows: 'auto',
    },
    { label: '入职日期', value: item.enrollDate || '-', valueRows: 'auto' },
    { label: '创建日期', value: item.submitTime || '-', valueRows: 'auto' },
  ];
}

/**
 * 从右往左：详情 / 主操作 / 次操作外露；超出由 Card「更多」收纳
 * 审批中更多内：拒绝 / 退回 / 确认入职 / 发起入职审批
 * 已退回仅：确认入职 / 发起入职审批
 */
function getCardFooterButtons(
  item: OnboardingRegisterFormListItem,
): CardFooterButton[] {
  const buttons: CardFooterButton[] = [
    {
      text: '详情',
      name: REGISTER_FORM_ROW_ACTION.DETAIL,
      color: 'var(--van-primary-color)',
    },
  ];
  const { canApprove, canEdit, canRecheckEntry } = getPendingActionFlags(item);

  if (canApprove) {
    buttons.push({
      text: '同意',
      name: REGISTER_FORM_ROW_ACTION.APPROVE,
      color: 'var(--van-primary-color)',
    });
  }

  if (canEdit) {
    buttons.push({ text: '编辑', name: REGISTER_FORM_ROW_ACTION.EDIT });
  }

  if (canApprove) {
    // 超出 outline 默认 3 个，自动收进「更多」
    buttons.push({ text: '拒绝', name: REGISTER_FORM_ROW_ACTION.REJECT });
    buttons.push({ text: '退回', name: REGISTER_FORM_ROW_ACTION.RETURN });
    buttons.push({
      text: '确认入职',
      name: REGISTER_FORM_ROW_ACTION.CONFIRM_ENTRY,
    });
    buttons.push({
      text: '发起入职审批',
      name: REGISTER_FORM_ROW_ACTION.START_APPROVAL,
    });
  } else if (canRecheckEntry) {
    buttons.push({
      text: '确认入职',
      name: REGISTER_FORM_ROW_ACTION.CONFIRM_ENTRY,
      color: 'var(--van-primary-color)',
    });
    buttons.push({
      text: '发起入职审批',
      name: REGISTER_FORM_ROW_ACTION.START_APPROVAL,
    });
  }

  return buttons;
}

function onCardButton(
  item: OnboardingRegisterFormListItem,
  payload: { name?: string | number; text?: string },
) {
  const name = String(payload.name || '');
  if (name === REGISTER_FORM_ROW_ACTION.DETAIL) {
    goDetail(item);
    return;
  }
  if (name === REGISTER_FORM_ROW_ACTION.EDIT) {
    goEdit(item);
    return;
  }
  if (name === REGISTER_FORM_ROW_ACTION.APPROVE) {
    openApprove(item);
    return;
  }
  if (name === REGISTER_FORM_ROW_ACTION.CONFIRM_ENTRY) {
    openConfirmEntry(item);
    return;
  }
  if (name === REGISTER_FORM_ROW_ACTION.START_APPROVAL) {
    showToast('发起入职审批功能开发中');
    return;
  }
  if (
    name === REGISTER_FORM_ROW_ACTION.RETURN ||
    name === REGISTER_FORM_ROW_ACTION.REJECT ||
    name === REGISTER_FORM_ROW_ACTION.DELETE
  ) {
    currentRow.value = item;
    onMoreSelect({ value: name });
  }
}

function getFilterStringList(key: string) {
  const value = filterModel.value[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(String).filter(Boolean);
}

function buildQuery(page = pageNum.value) {
  const kw = searchKeyword.value.trim();
  const isPhone = /^\d[\d\s]*$/.test(kw);
  const { start, end } = getEnrollDateRange();
  const registerStatusList = getFilterStringList('registerStatus');
  const positionIds = getFilterStringList('positionIds');
  const staffTypes = getFilterStringList('staffTypes');
  const departmentId = String(filterModel.value.departmentId || '');
  return {
    listType: getListTypeByTab(activeTab.value),
    pageNum: page,
    pageSize,
    staffName: kw && !isPhone ? kw : undefined,
    phone: kw && isPhone ? kw.replace(/\s/g, '') : undefined,
    registerStatusList: registerStatusList.length
      ? registerStatusList
      : undefined,
    departmentId: departmentId || undefined,
    positionIds: positionIds.length ? positionIds : undefined,
    staffTypes: staffTypes.length ? staffTypes : undefined,
    enrollDateStart: start || undefined,
    enrollDateEnd: end || undefined,
  };
}

async function fetchPendingCount() {
  try {
    const res = await getOnboardingRegisterFormPageApi({
      listType: 1,
      pageNum: 1,
      pageSize: 1,
    });
    pendingCount.value = res.body?.total || 0;
  } catch {
    // ignore badge errors
  }
}

async function fetchList(reset = false) {
  if (reset) {
    pageNum.value = 1;
    finished.value = false;
  }

  loading.value = true;
  try {
    const res = await getOnboardingRegisterFormPageApi(
      buildQuery(pageNum.value),
    );
    const records = res.body?.records || [];
    const nextTotal = res.body?.total || 0;
    total.value = nextTotal;

    if (activeTab.value === REGISTER_FORM_TAB.PENDING) {
      pendingCount.value = nextTotal;
    } else {
      fetchPendingCount();
    }

    list.value = reset ? records : [...list.value, ...records];
    finished.value =
      list.value.length >= nextTotal || records.length < pageSize;
    if (!finished.value) {
      pageNum.value += 1;
    }
  } catch {
    showToast('加载失败');
    finished.value = true;
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function loadMore() {
  fetchList(false);
}

async function onRefresh() {
  selectedIds.value = [];
  await fetchList(true);
}

function onSearch() {
  searchKeyword.value = keyword.value;
  selectedIds.value = [];
  fetchList(true);
}

function onTabChange() {
  batchMode.value = false;
  selectedIds.value = [];
  filterModel.value = {
    ...filterModel.value,
    registerStatus: [],
  };
  fetchList(true);
}

function onFilterConfirm() {
  selectedIds.value = [];
  fetchList(true);
}

async function openTemplatePopup() {
  showTemplatePopup.value = true;
  templateLoading.value = true;
  try {
    const res = await getOnboardingRegisterFormTemplatePageApi({
      pageNum: 1,
      pageSize: ENTRY_TEMPLATE_PAGE_SIZE,
      status: REGISTER_FORM_TEMPLATE_STATUS.ENABLED,
    });
    if (!res?.success) {
      showToast(res?.message || res?.errorMsg || '获取入职登记模板失败');
      templateOptions.value = [];
      selectedTemplateId.value = '';
      return;
    }
    const records = res.body?.records ?? [];
    templateOptions.value = records
      .map((item) => ({
        label: item.name || '-',
        value: item.id,
      }))
      .filter((item) => item.value);
    const current = String(selectedTemplateId.value || '');
    const stillExists = templateOptions.value.some(
      (item) => String(item.value) === current,
    );
    selectedTemplateId.value = stillExists
      ? current
      : String(templateOptions.value[0]?.value ?? '');
  } finally {
    templateLoading.value = false;
  }
}

function confirmTemplate() {
  const templateId = String(selectedTemplateId.value || '');
  if (!templateId) {
    showToast('请选择入职登记模板');
    return;
  }
  showTemplatePopup.value = false;
  router.push({
    name: 'OnboardingRegisterFormFill',
    params: { templateId },
    query: { from: 'app' },
  });
}

function toggleBatch() {
  batchMode.value = !batchMode.value;
  if (!batchMode.value) selectedIds.value = [];
}

const isAllSelected = computed({
  get: () =>
    list.value.length > 0 &&
    list.value.every((item) => selectedIds.value.includes(item.id)),
  set: (checked: boolean) => {
    selectedIds.value = checked ? list.value.map((item) => item.id) : [];
  },
});

function toggleSelect(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id);
  } else {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  }
}

function goDetail(item: OnboardingRegisterFormListItem) {
  router.push({
    name: 'OnboardingRegisterFormDetail',
    params: { id: item.id },
  });
}

function goEdit(
  item: OnboardingRegisterFormListItem,
  options?: RegisterFormEditRouteOptions,
) {
  router.push({
    name: 'OnboardingRegisterFormEdit',
    params: { id: item.id },
    query: buildRegisterFormEditQuery(options),
  });
}

/** 单条确认入职：二次确认后进入编辑页（对齐 PC type=confirm） */
async function openConfirmEntry(item: OnboardingRegisterFormListItem) {
  try {
    await showConfirmDialog({
      title: '确认入职',
      message: CONFIRM_ENTRY_SINGLE_TIP.replace('【姓名】', item.name || '-'),
      confirmButtonText: '确认入职',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  goEdit(item, buildConfirmEntryEditOptions(item));
}

function openApprovalAction(
  item: OnboardingRegisterFormListItem,
  action: ApprovalActionType,
) {
  currentRow.value = item;
  approvalAction.value = action;
  showApprovalPopup.value = true;
}

function openApprove(item: OnboardingRegisterFormListItem) {
  openApprovalAction(item, REGISTER_FORM_APPROVAL_ACTION.APPROVE);
}

async function onMoreSelect(action: { value?: string }) {
  const row = currentRow.value;
  if (!row || !action.value) return;

  if (action.value === 'return') {
    openApprovalAction(row, REGISTER_FORM_APPROVAL_ACTION.RETURN);
    return;
  }
  if (action.value === 'reject') {
    openApprovalAction(row, REGISTER_FORM_APPROVAL_ACTION.REJECT);
    return;
  }
  if (action.value === 'delete') {
    try {
      await showConfirmDialog({
        title: '删除',
        message: `确认删除「${row.name}」的入职登记表？`,
      });
      const res = await deleteOnboardingRegisterFormApi([row.id]);
      if ((res as { success?: boolean }).success === false) {
        showToast((res as { message?: string }).message || '删除失败');
        return;
      }
      showSuccessToast('已删除');
      fetchList(true);
    } catch {
      // cancelled
    }
  }
}

async function confirmApprovalAction(payload: {
  comment: string;
  notifyMethods: string[];
}) {
  const row = currentRow.value;
  if (!row || approvalSubmitting.value) return;

  const action = approvalAction.value;
  const api =
    action === REGISTER_FORM_APPROVAL_ACTION.RETURN
      ? returnOnboardingRegisterFormApi
      : action === REGISTER_FORM_APPROVAL_ACTION.REJECT
        ? rejectOnboardingRegisterFormApi
        : approveOnboardingRegisterFormApi;
  const successText =
    action === REGISTER_FORM_APPROVAL_ACTION.RETURN
      ? '已退回'
      : action === REGISTER_FORM_APPROVAL_ACTION.REJECT
        ? '已拒绝'
        : '已同意';
  const failText =
    action === REGISTER_FORM_APPROVAL_ACTION.RETURN
      ? '退回失败'
      : action === REGISTER_FORM_APPROVAL_ACTION.REJECT
        ? '拒绝失败'
        : '同意失败';

  approvalSubmitting.value = true;
  try {
    const res = await api({
      id: row.id,
      comment: payload.comment || undefined,
      notifyMethods: payload.notifyMethods.length
        ? payload.notifyMethods
        : undefined,
    });
    if ((res as { success?: boolean }).success === false) {
      showToast(
        (res as { message?: string; errorMsg?: string }).message ||
          (res as { errorMsg?: string }).errorMsg ||
          failText,
      );
      return;
    }
    showApprovalPopup.value = false;
    showSuccessToast(successText);
    fetchList(true);
  } finally {
    approvalSubmitting.value = false;
  }
}

function resetBatchApproveForm() {
  batchApproveForm.value = {
    comment: '',
    notifyMethods: [REGISTER_FORM_APPROVAL_NOTIFY.EMAIL],
  };
  batchApproveFormRef.value?.resetValidation?.();
}

function onBatchApprove() {
  if (!selectedIds.value.length) return;
  resetBatchApproveForm();
  showBatchApprovePopup.value = true;
}

async function confirmBatchApprove() {
  if (!selectedIds.value.length || batchApproving.value) return;
  try {
    await batchApproveFormRef.value?.validate?.();
  } catch {
    return;
  }

  batchApproving.value = true;
  try {
    const commentText = String(batchApproveForm.value.comment || '').trim();
    const notifyMethods = Array.isArray(batchApproveForm.value.notifyMethods)
      ? batchApproveForm.value.notifyMethods.map(String)
      : [];
    const ids = [...selectedIds.value];
    const failList: BatchOperationFailItem[] = [];
    let successCount = 0;

    for (const id of ids) {
      const row = list.value.find((item) => item.id === id);
      if (getRegisterFormActionFlags(row?.registerStatus).canRecheckEntry) {
        failList.push({
          id,
          name: row?.name || '-',
          reason: '已退回不支持同意',
        });
        continue;
      }
      try {
        const res = await approveOnboardingRegisterFormApi({
          id,
          comment: commentText || undefined,
          notifyMethods: notifyMethods.length ? notifyMethods : undefined,
        });
        if ((res as { success?: boolean }).success === false) {
          failList.push({
            id,
            name: row?.name || '-',
            reason:
              (res as { message?: string; errorMsg?: string }).message ||
              (res as { errorMsg?: string }).errorMsg ||
              '同意失败',
          });
        } else {
          successCount += 1;
        }
      } catch {
        failList.push({
          id,
          name: row?.name || '-',
          reason: '同意失败',
        });
      }
    }

    showBatchApprovePopup.value = false;
    selectedIds.value = [];
    batchMode.value = false;
    openBatchFeedbackOrSuccess(successCount, failList);
    fetchList(true);
  } finally {
    batchApproving.value = false;
  }
}

/** 有失败跳转反馈页，全部成功 toast */
function openBatchFeedbackOrSuccess(
  successCount: number,
  failList: BatchOperationFailItem[],
) {
  if (failList.length) {
    sessionStorage.setItem(
      BATCH_FEEDBACK_STORAGE_KEY,
      JSON.stringify({
        successCount,
        failCount: failList.length,
        failList,
      }),
    );
    router.push({ name: 'OnboardingRegisterFormBatchFeedback' });
    return;
  }
  showSuccessToast('操作成功');
}

async function onBatchConfirmEntry() {
  if (!selectedIds.value.length || batchConfirming.value) return;

  try {
    await showConfirmDialog({
      title: '批量确认入职',
      message: CONFIRM_ENTRY_BATCH_TIP.replace(
        '{count}',
        String(selectedIds.value.length),
      ),
      confirmButtonText: '确认入职',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  const rows = selectedIds.value
    .map((id) => list.value.find((item) => item.id === id))
    .filter((item): item is OnboardingRegisterFormListItem => Boolean(item));
  const entryProcessFormIds = rows
    .map((item) => item.entryProcessFormId || item.processFormId || '')
    .filter(Boolean);

  if (!entryProcessFormIds.length) {
    showToast('缺少待确认数据');
    return;
  }

  batchConfirming.value = true;
  try {
    const res = await confirmWaitEntryApi(entryProcessFormIds);
    if ((res as { success?: boolean }).success === false) {
      showToast(
        (res as { message?: string; errorMsg?: string }).message ||
          (res as { errorMsg?: string }).errorMsg ||
          '确认入职失败',
      );
      return;
    }

    const body = res.body || {};
    const rawFailList = Array.isArray(body.failList) ? body.failList : [];
    const failCount = Number(body.failCount ?? rawFailList.length) || 0;
    const successCount =
      Number(body.successCount ?? entryProcessFormIds.length - failCount) || 0;

    const failList: BatchOperationFailItem[] = rawFailList.map(
      (item, index) => {
        const name = item.staffName || '-';
        const matched = rows.find((row) => row.name === name);
        return {
          id: matched?.id || `confirm-fail-${index}`,
          name,
          reason: item.errorMessage || item.errorMsg || '确认入职失败',
        };
      },
    );

    selectedIds.value = [];
    batchMode.value = false;
    openBatchFeedbackOrSuccess(successCount, failList);
    fetchList(true);
  } finally {
    batchConfirming.value = false;
  }
}
</script>

<style scoped lang="less">
.register-form {
  min-height: 100%;
  background: var(--van-background, #f5f5f5);
  --van-nav-bar-z-index: 100;
}

.register-form__batch-btn {
  position: relative;
  border: 0;
  background: transparent;
  color: var(--van-primary-color);
  font-size: 14px;
  padding: 0 4px;
}

.register-form__batch-badge {
  position: absolute;
  top: -8px;
  right: -10px;
}

.register-form__search {
  background: var(--van-background-2, #fff);
}

.register-form__filters {
  background: var(--van-background-2, #fff);
  border-bottom: 1px solid var(--van-border-color, #ebedf0);
}

.register-form__list {
  padding: 12px;
}

.register-form-card {
  margin-bottom: 12px;

  :deep(.van-card__status-tag .van-tag--plain::before) {
    display: none;
  }
}

.register-form__fab {
  position: fixed;
  right: 12px;
  bottom: calc(146px + env(safe-area-inset-bottom));
  z-index: 20;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  background: var(--van-primary-color);
  box-shadow: 0 4px 10px 0
    color-mix(in srgb, var(--van-primary-color) 40%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-form__batch-summary {
  padding: 11px 12px;
  font-size: var(--van-font-size-md);
  line-height: var(--van-font-size-md);
  color: var(--van-text-color-auxiliary);
}

.register-form__batch-summary-num {
  margin: 0 4px;
  color: var(--van-text-color);
}

.register-form__batch-approve {
  padding: 8px 16px 20px;
}

.register-form__batch-approve-form {
  margin-bottom: 12px;

  :deep(.van-cell-group) {
    background: transparent;
  }

  :deep(.van-cell) {
    padding-left: 0;
    padding-right: 0;
    background: transparent;
  }

  :deep(.van-field--label-top .van-field__value) {
    margin-top: 8px;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid var(--van-border-color);
    border-radius: 8px;
  }

  :deep(.van-field--label-top .van-field__body) {
    background: transparent;
  }
}

.register-form__batch-approve-submit {
  margin-top: 4px;
}

.register-form__template {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  padding: 0 0 16px;
}

.register-form__template-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.register-form__template-list {
  flex: 1;
  overflow: auto;
}

.register-form__template-actions {
  display: flex;
  gap: 12px;
  margin: 12px 16px 0;
}

.register-form__template-action {
  flex: 1;
  min-width: 0;
}
</style>
