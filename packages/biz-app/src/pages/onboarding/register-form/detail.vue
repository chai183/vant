<template>
  <div class="register-detail">
    <van-nav-bar
      title="入职登记表详情"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="router.back()"
    />

    <!-- /*----信息卡start----*/ -->
    <RegisterFormProfileCard v-if="viewDetail" :detail="viewDetail" />
    <!-- /*----信息卡end----*/ -->

    <!-- /*----内容 Tabs start----*/ -->
    <van-tabs
      v-if="viewDetail"
      v-model:active="activeTab"
      sticky
      offset-top="46"
      color="var(--van-primary-color)"
      title-active-color="var(--van-primary-color)"
      title-inactive-color="var(--van-text-color)"
      line-width="28"
      line-height="3"
    >
      <van-tab :name="REGISTER_FORM_VIEW_TAB.BASIC" title="基本信息">
        <RegisterSchemaForm
          ref="formRef"
          v-model="form"
          :loading="loading"
          :auto-load="false"
          readonly
          :show-submit="false"
        />
      </van-tab>

      <van-tab
        v-if="showAttachmentTab"
        :name="REGISTER_FORM_VIEW_TAB.ATTACHMENT"
        title="附件材料"
      >
        <ViewAttachment
          :template-id="templateId"
          :materials="materials"
          read-only
        />
      </van-tab>

      <van-tab
        v-if="showCommitmentTab"
        :name="REGISTER_FORM_VIEW_TAB.COMMITMENT"
        title="员工承诺"
      >
        <ViewCommitment
          :register-template="registerTemplate"
          :commitment="commitment"
        />
      </van-tab>
    </van-tabs>
    <!-- /*----内容 Tabs end----*/ -->

    <van-empty v-if="!loading && !viewDetail" description="登记表不存在" />

    <!-- /*----底部操作start----*/ -->
    <!-- 与列表对齐。审批中：同意 / 编辑外露；已退回仅确认入职、发起入职审批 -->
    <van-bottom-action-bar
      v-if="showActions"
      placeholder
      :max-visible-actions="2"
      more-popover-placement="top-start"
    >
      <template #actions>
        <van-button
          v-if="canApprove"
          type="primary"
          round
          @click="openApproval(REGISTER_FORM_APPROVAL_ACTION.APPROVE)"
        >
          同意
        </van-button>
        <van-button v-if="canEdit" plain hairline round @click="goEdit()">
          编辑
        </van-button>
        <template v-if="canApprove">
          <van-button
            plain
            hairline
            round
            type="danger"
            @click="openApproval(REGISTER_FORM_APPROVAL_ACTION.REJECT)"
          >
            拒绝
          </van-button>
          <van-button
            plain
            hairline
            round
            @click="openApproval(REGISTER_FORM_APPROVAL_ACTION.RETURN)"
          >
            退回
          </van-button>
          <van-button plain hairline round @click="openConfirmEntry">
            确认入职
          </van-button>
          <van-button plain hairline round @click="onStartApproval">
            发起入职审批
          </van-button>
        </template>
        <template v-else-if="canRecheckEntry">
          <van-button type="primary" round @click="openConfirmEntry">
            确认入职
          </van-button>
          <van-button plain hairline round @click="onStartApproval">
            发起入职审批
          </van-button>
        </template>
      </template>
    </van-bottom-action-bar>

    <ApprovalActionPopup
      v-model:show="showApprovalPopup"
      :action="approvalAction"
      :loading="approvalSubmitting"
      @confirm="confirmApprovalAction"
    />
    <!-- /*----底部操作end----*/ -->
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import type {
  OnboardingRegisterFormDetailResult,
  OnboardingRegisterFormViewDetail,
} from '@/types/employee/employment/onboarding/register-form';
import {
  approveOnboardingRegisterFormApi,
  getOnboardingRegisterFormViewDetailApi,
  rejectOnboardingRegisterFormApi,
  returnOnboardingRegisterFormApi,
} from '@/services/api/employee/employment/onboarding/register-form';
import { REGISTER_FORM_APPROVAL_ACTION } from '@/services/api/employee/employment/onboarding/register-form/config';
import RegisterSchemaForm from './components/RegisterSchemaForm.vue';
import RegisterFormProfileCard from './components/RegisterFormProfileCard.vue';
import ViewAttachment from './components/ViewAttachment.vue';
import ViewCommitment from './components/ViewCommitment.vue';
import ApprovalActionPopup, {
  type ApprovalActionType,
} from './components/ApprovalActionPopup.vue';
import { CONFIRM_ENTRY_SINGLE_TIP, REGISTER_FORM_VIEW_TAB } from './config';
import {
  buildConfirmEntryEditOptions,
  buildRegisterFormEditQuery,
  getRegisterFormActionFlags,
  type RegisterFormEditRouteOptions,
} from './utils/row-actions';

defineOptions({ name: 'OnboardingRegisterFormDetail' });

const route = useRoute();
const router = useRouter();
const formRef = ref<{
  loadForDetail?: (options?: {
    formContent?: unknown[] | null;
    formData?: Record<string, unknown> | null;
    viewDetail?: OnboardingRegisterFormViewDetail | null;
  }) => unknown;
} | null>(null);
const loading = ref(true);
const form = ref<Record<string, unknown>>({});
const detail = ref<OnboardingRegisterFormDetailResult | null>(null);
/** 当前内容 Tab */
const activeTab = ref<string>(REGISTER_FORM_VIEW_TAB.BASIC);

const showApprovalPopup = ref(false);
const approvalAction = ref<ApprovalActionType>(
  REGISTER_FORM_APPROVAL_ACTION.APPROVE,
);
const approvalSubmitting = ref(false);

const viewDetail = computed(
  () =>
    (detail.value?.viewDetail ||
      null) as OnboardingRegisterFormViewDetail | null,
);

/** 模板 id */
const templateId = computed(() =>
  String(detail.value?.templateId || viewDetail.value?.templateId || ''),
);

/** 模板主配置（Tab 开关） */
const registerTemplate = computed(
  () =>
    (detail.value?.registerTemplate &&
    typeof detail.value.registerTemplate === 'object'
      ? detail.value.registerTemplate
      : {}) as Record<string, unknown>,
);

/** 人员附件材料 */
const materials = computed(
  () =>
    (Array.isArray(detail.value?.materials)
      ? detail.value?.materials
      : []) as Array<Record<string, unknown>>,
);

/** 人员承诺签署 */
const commitment = computed(
  () =>
    (detail.value?.commitment && typeof detail.value.commitment === 'object'
      ? detail.value.commitment
      : {}) as Record<string, unknown>,
);

/** 是否展示附件材料 Tab */
const showAttachmentTab = computed(() =>
  Boolean(registerTemplate.value?.enableAttach),
);

/** 是否展示员工承诺 Tab */
const showCommitmentTab = computed(() =>
  Boolean(registerTemplate.value?.staffPromise),
);

const actionFlags = computed(() =>
  getRegisterFormActionFlags(viewDetail.value?.registerStatus),
);

/** 审批中：同意 / 拒绝 / 退回 / 确认入职 / 发起入职审批 */
const canApprove = computed(() => actionFlags.value.canApprove);

/** 待处理可编辑；已退回不支持编辑 */
const canEdit = computed(() => actionFlags.value.canEdit);

/** 已退回：仅确认入职、发起入职审批 */
const canRecheckEntry = computed(() => actionFlags.value.canRecheckEntry);

const showActions = computed(
  () =>
    Boolean(viewDetail.value) &&
    (canApprove.value || canEdit.value || canRecheckEntry.value),
);

function goEdit(options?: RegisterFormEditRouteOptions) {
  const id = String(viewDetail.value?.id || route.params.id || '');
  if (!id) return;
  router.push({
    name: 'OnboardingRegisterFormEdit',
    params: { id },
    query: buildRegisterFormEditQuery(options),
  });
}

/** 单条确认入职：二次确认后进入编辑页（复用列表逻辑） */
async function openConfirmEntry() {
  try {
    await showConfirmDialog({
      title: '确认入职',
      message: CONFIRM_ENTRY_SINGLE_TIP.replace(
        '【姓名】',
        viewDetail.value?.name || '-',
      ),
      confirmButtonText: '确认入职',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  goEdit(
    buildConfirmEntryEditOptions({
      entryProcessFormId: viewDetail.value?.entryProcessFormId,
    }),
  );
}

function onStartApproval() {
  showToast('发起入职审批功能开发中');
}

async function bootstrap() {
  loading.value = true;
  activeTab.value = REGISTER_FORM_VIEW_TAB.BASIC;
  try {
    const id = String(route.params.id || '');
    const detailRes = await getOnboardingRegisterFormViewDetailApi({ id });
    if (!detailRes.success) {
      showToast(detailRes.message || detailRes.errorMsg || '加载失败');
      detail.value = null;
      await formRef.value?.loadForDetail?.({});
      return;
    }
    detail.value = detailRes.body || null;
    await nextTick();
    await formRef.value?.loadForDetail?.({
      formContent: detail.value?.formContent,
      formData: detail.value?.formData as Record<string, unknown> | undefined,
      viewDetail: detail.value?.viewDetail,
    });
  } finally {
    loading.value = false;
  }
}

function openApproval(action: ApprovalActionType) {
  approvalAction.value = action;
  showApprovalPopup.value = true;
}

async function confirmApprovalAction(payload: {
  comment: string;
  notifyMethods: string[];
}) {
  if (approvalSubmitting.value) return;
  const id = String(viewDetail.value?.id || route.params.id || '');
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
      id,
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
    router.back();
  } finally {
    approvalSubmitting.value = false;
  }
}

onMounted(bootstrap);
</script>

<style scoped lang="less">
.register-detail {
  min-height: 100%;
  background: var(--van-background, #f5f5f5);
}
</style>
