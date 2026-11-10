<template>
  <div class="register-edit">
    <van-nav-bar
      :title="pageTitle"
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
          :show-submit="false"
          @failed="onFailed"
        />
      </van-tab>

      <van-tab
        v-if="showAttachmentTab"
        :name="REGISTER_FORM_VIEW_TAB.ATTACHMENT"
        title="附件材料"
      >
        <ViewAttachment
          ref="attachmentRef"
          :template-id="templateId"
          :materials="materials"
          :read-only="false"
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

    <!-- /*----底部操作start----*/ -->
    <!-- actions 插槽第一个按钮在最右侧，故主按钮写在前 -->
    <van-bottom-action-bar v-if="viewDetail && showFooterSave" placeholder>
      <template #actions>
        <van-button
          v-if="isConfirmType"
          type="primary"
          round
          :loading="saving"
          @click="onConfirmSaveAndEntry"
        >
          保存并确认入职
        </van-button>
        <van-button
          v-else
          type="primary"
          round
          :loading="saving"
          @click="onSave"
        >
          保存
        </van-button>
        <van-button round plain hairline @click="router.back()">
          取消
        </van-button>
      </template>
    </van-bottom-action-bar>
    <!-- /*----底部操作end----*/ -->
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccessToast, showToast } from 'vant';
import { confirmWaitEntryApi } from '@/services/api/employee/employment/onboarding';
import {
  editOnboardingRegisterFormApi,
  getOnboardingRegisterFormViewDetailApi,
} from '@/services/api/employee/employment/onboarding/register-form';
import type {
  OnboardingRegisterFormDetailResult,
  OnboardingRegisterFormViewDetail,
} from '@/types/employee/employment/onboarding/register-form';
import RegisterSchemaForm from './components/RegisterSchemaForm.vue';
import RegisterFormProfileCard from './components/RegisterFormProfileCard.vue';
import ViewAttachment from './components/ViewAttachment.vue';
import ViewCommitment from './components/ViewCommitment.vue';
import { REGISTER_FORM_EDIT_TYPE, REGISTER_FORM_VIEW_TAB } from './config';
import { getRegisterFormActionFlags } from './utils/row-actions';

defineOptions({ name: 'OnboardingRegisterFormEdit' });

const route = useRoute();
const router = useRouter();
const formRef = ref<{
  loadForDetail?: (options?: {
    formContent?: unknown[] | null;
    formData?: Record<string, unknown> | null;
    viewDetail?: OnboardingRegisterFormViewDetail | null;
  }) => unknown;
  validate?: () => Promise<void>;
  getSubmitPayload?: () => Record<string, Array<Record<string, unknown>>>;
  submit?: () => void;
} | null>(null);
const attachmentRef = ref<{
  validate?: () => Promise<boolean>;
  buildEditAttachmentList?: (processFormId?: string) => unknown[];
  buildSubmitPayload?: () => {
    materials: OnboardingRegisterFormDetailResult['materials'];
  };
} | null>(null);
const loading = ref(true);
const saving = ref(false);
const form = ref<Record<string, unknown>>({});
const detail = ref<OnboardingRegisterFormDetailResult | null>(null);
/** 当前内容 Tab */
const activeTab = ref<string>(REGISTER_FORM_VIEW_TAB.BASIC);

/** 二次确认入职后进入的编辑态（对齐 PC query.type=confirm） */
const isConfirmType = computed(
  () => String(route.query.type || '') === REGISTER_FORM_EDIT_TYPE.CONFIRM,
);

const pageTitle = computed(() =>
  isConfirmType.value ? '确认入职' : '编辑入职登记表',
);

const viewDetail = computed(
  () =>
    (detail.value?.viewDetail ||
      null) as OnboardingRegisterFormViewDetail | null,
);

/** 模板 id */
const templateId = computed(() =>
  String(detail.value?.templateId || viewDetail.value?.templateId || ''),
);

/** 模板主配置 */
const registerTemplate = computed(
  () =>
    (detail.value?.registerTemplate &&
    typeof detail.value.registerTemplate === 'object'
      ? detail.value.registerTemplate
      : {}) as Record<string, unknown>,
);

/** 人员附件材料 */
const materials = ref<Array<Record<string, unknown>>>([]);

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

/** 员工承诺 Tab 只读，不展示保存 */
const showFooterSave = computed(
  () => activeTab.value !== REGISTER_FORM_VIEW_TAB.COMMITMENT,
);

/** 待入职表单 id（编辑附件时 attachmentList.processFormId） */
const processFormId = computed(() =>
  String(
    viewDetail.value?.entryProcessFormId ||
      route.query.entryProcessFormId ||
      '',
  ),
);

async function bootstrap() {
  loading.value = true;
  activeTab.value = REGISTER_FORM_VIEW_TAB.BASIC;
  try {
    const id = String(route.params.id || '');
    const detailRes = await getOnboardingRegisterFormViewDetailApi({ id });
    if (!detailRes.success) {
      showToast(detailRes.message || detailRes.errorMsg || '加载失败');
      detail.value = null;
      materials.value = [];
      await formRef.value?.loadForDetail?.({});
      return;
    }
    const nextDetail = detailRes.body || null;
    const status = String(nextDetail?.viewDetail?.registerStatus || '');
    if (
      getRegisterFormActionFlags(status).canRecheckEntry &&
      !isConfirmType.value
    ) {
      showToast('已退回不支持编辑');
      router.replace({
        name: 'OnboardingRegisterFormDetail',
        params: { id },
      });
      return;
    }
    detail.value = nextDetail;
    materials.value = Array.isArray(detailRes.body?.materials)
      ? (detailRes.body?.materials as Array<Record<string, unknown>>)
      : [];
    await nextTick();
    await formRef.value?.loadForDetail?.({
      formContent: detailRes.body?.formContent,
      formData: detailRes.body?.formData as Record<string, unknown> | undefined,
      viewDetail: viewDetail.value,
    });
  } finally {
    loading.value = false;
  }
}

async function saveForm(
  formData: Record<string, Array<Record<string, unknown>>>,
) {
  const id = String(route.params.id || '');
  const res = await editOnboardingRegisterFormApi({
    id,
    formData,
  });
  if ((res as { success?: boolean }).success === false) {
    showToast((res as { message?: string }).message || '保存失败');
    return false;
  }
  return true;
}

/** 按当前 Tab 保存基本信息或附件材料 */
async function onSave() {
  if (saving.value) return;

  if (activeTab.value === REGISTER_FORM_VIEW_TAB.ATTACHMENT) {
    await submitAttachment();
    return;
  }
  await submitBasicInfo();
}

async function submitBasicInfo() {
  try {
    await formRef.value?.validate?.();
  } catch {
    showToast('请完善必填项');
    activeTab.value = REGISTER_FORM_VIEW_TAB.BASIC;
    return;
  }

  const formData = formRef.value?.getSubmitPayload?.();
  if (!formData) {
    showToast('表单未就绪');
    return;
  }

  saving.value = true;
  try {
    const ok = await saveForm(formData);
    if (!ok) return;
    showSuccessToast('保存成功');
    router.back();
  } finally {
    saving.value = false;
  }
}

async function submitAttachment() {
  const valid = await attachmentRef.value?.validate?.();
  if (!valid) {
    activeTab.value = REGISTER_FORM_VIEW_TAB.ATTACHMENT;
    return;
  }

  saving.value = true;
  try {
    const attachmentList =
      attachmentRef.value?.buildEditAttachmentList?.(processFormId.value) || [];
    const res = await editOnboardingRegisterFormApi({
      id: String(route.params.id || ''),
      attachmentList,
    });
    if ((res as { success?: boolean }).success === false) {
      showToast((res as { message?: string }).message || '保存失败');
      return;
    }
    const payload = attachmentRef.value?.buildSubmitPayload?.() || {
      materials: [],
    };
    materials.value = JSON.parse(
      JSON.stringify(payload.materials || []),
    ) as Array<Record<string, unknown>>;
    showSuccessToast('保存成功');
    router.back();
  } finally {
    saving.value = false;
  }
}

/**
 * 确认保存并确认入职（对齐 PC：先保存再调确认入职）
 */
async function onConfirmSaveAndEntry() {
  if (saving.value) return;
  try {
    await formRef.value?.validate?.();
  } catch {
    showToast('请完善必填项');
    activeTab.value = REGISTER_FORM_VIEW_TAB.BASIC;
    return;
  }

  const formData = formRef.value?.getSubmitPayload?.();
  if (!formData) {
    showToast('表单未就绪');
    return;
  }

  const entryProcessFormId = String(
    route.query.entryProcessFormId ||
      viewDetail.value?.entryProcessFormId ||
      '',
  );
  if (!entryProcessFormId) {
    showToast('缺少待确认数据');
    return;
  }

  saving.value = true;
  try {
    const saved = await saveForm(formData);
    if (!saved) return;

    const res = await confirmWaitEntryApi([entryProcessFormId]);
    if ((res as { success?: boolean }).success === false) {
      showToast(
        (res as { message?: string; errorMsg?: string }).message ||
          (res as { errorMsg?: string }).errorMsg ||
          '确认入职失败',
      );
      return;
    }

    const body = res.body || {};
    const failList = Array.isArray(body.failList) ? body.failList : [];
    const failCount = Number(body.failCount ?? failList.length) || 0;
    if (failCount > 0) {
      const reason =
        failList[0]?.errorMessage || failList[0]?.errorMsg || '确认入职失败';
      showToast(reason);
      return;
    }

    showSuccessToast('确认入职成功');
    router.back();
  } finally {
    saving.value = false;
  }
}

function onFailed() {
  showToast('请完善必填项');
}

onMounted(bootstrap);
</script>

<style scoped lang="less">
.register-edit {
  min-height: 100%;
  background: var(--van-background, #f5f5f5);
}
</style>
