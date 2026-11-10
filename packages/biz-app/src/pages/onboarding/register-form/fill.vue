<template>
  <div class="register-fill">
    <van-nav-bar
      :title="navBarTitle"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="onBack"
    />

    <van-loading
      v-if="entering && !steps.length"
      class="register-fill__loading"
      vertical
    >
      加载中
    </van-loading>
    <van-empty v-else-if="loadFailed" description="无法打开该入职登记模板" />

    <div v-else :key="wizardKey" class="register-fill__body">
      <FillGuide
        v-if="hasStep(FILL_STEP.GUIDE)"
        v-show="currentStepKey === FILL_STEP.GUIDE"
        :title="templateDetail?.guideTitle"
        :content="templateDetail?.guideContent"
      />

      <RegisterSchemaForm
        v-if="hasStep(FILL_STEP.FORM)"
        v-show="currentStepKey === FILL_STEP.FORM"
        ref="formRef"
        v-model="form"
        :loading="schemaLoading"
        :auto-load="false"
        :show-submit="false"
      />

      <ViewAttachment
        v-if="hasStep(FILL_STEP.MATERIAL)"
        v-show="currentStepKey === FILL_STEP.MATERIAL"
        ref="attachmentRef"
        :template-id="templateDetail?.id"
        :read-only="false"
      />

      <FillCommitment
        v-if="hasStep(FILL_STEP.COMMITMENT)"
        v-show="currentStepKey === FILL_STEP.COMMITMENT"
        ref="commitmentRef"
        :promise-content="templateDetail?.promiseContent"
        :signature-enabled="Boolean(templateDetail?.signature)"
        :active="currentStepKey === FILL_STEP.COMMITMENT"
      />
    </div>

    <!-- actions 第一个在最右，存草稿写在最后以落在左侧 -->
    <van-bottom-action-bar v-if="steps.length" placeholder>
      <template #actions>
        <van-button
          v-if="!isLastStep"
          type="primary"
          round
          :disabled="draftSaving"
          @click="onNext"
        >
          下一步
        </van-button>
        <van-button
          v-else
          type="primary"
          round
          :loading="saving"
          :disabled="draftSaving"
          @click="onSubmit"
        >
          提交
        </van-button>
        <van-button
          v-if="canGoPrev"
          round
          plain
          hairline
          :disabled="saving || draftSaving"
          @click="onPrev"
        >
          上一步
        </van-button>
        <van-button
          v-if="showSaveDraft"
          round
          plain
          hairline
          :loading="draftSaving"
          :disabled="saving"
          @click="onSaveDraft"
        >
          存草稿
        </van-button>
      </template>
    </van-bottom-action-bar>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccessToast, showToast } from 'vant';
import {
  fillOnboardingRegisterFormApi,
  getOnboardingRegisterFormTemplateDetailApi,
} from '@/services/api/employee/employment/onboarding/register-form';
import type {
  OnboardingRegisterFormFillParams,
  OnboardingRegisterFormTemplateDetail,
} from '@/types/employee/employment/onboarding/register-form';
import FillCommitment from './components/FillCommitment.vue';
import FillGuide from './components/FillGuide.vue';
import RegisterSchemaForm from './components/RegisterSchemaForm.vue';
import ViewAttachment from './components/ViewAttachment.vue';
import { REGISTER_FORM_UPDATE_STATUS } from './config';
import { pickSummaryFromModel } from './utils/form';
import {
  FILL_STEP,
  buildFillSteps,
  type FillStepKey,
} from './utils/fill-steps';

defineOptions({ name: 'OnboardingRegisterFormFill' });

type SchemaFormExpose = {
  loadForFill?: () => Promise<unknown>;
  loadForDetail?: (options?: {
    formContent?: unknown[] | null;
    fill?: boolean;
  }) => unknown;
  getSubmitPayload?: () => Record<string, Array<Record<string, unknown>>>;
  validate?: () => Promise<void>;
};

type AttachmentExpose = {
  validate?: () => Promise<boolean>;
  buildSubmitPayload?: () => {
    materials?: Array<{
      materialId?: string;
      fileList?: Array<{
        fileId?: string;
        fileName?: string;
        url?: string;
      }>;
    }>;
  };
};

type CommitmentExpose = {
  validate?: () => Promise<boolean>;
  getValue?: () => { signed: boolean; signUrl: string };
};

const route = useRoute();
const router = useRouter();

/** 路由参数或 query.templateId */
function readRouteTemplateId() {
  const fromParam = route.params.templateId;
  const fromQuery = route.query.templateId;
  const raw =
    (Array.isArray(fromParam) ? fromParam[0] : fromParam) ||
    (Array.isArray(fromQuery) ? fromQuery[0] : fromQuery);
  return String(raw ?? '').trim();
}

/** query.from：默认展示引导页；from=app 时不展示 */
function readFromQuery() {
  const fromQuery = route.query.from;
  const raw = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  return String(raw ?? '')
    .trim()
    .toLowerCase();
}

function readShowGuide() {
  return readFromQuery() !== 'app';
}

function readFromApp() {
  return readFromQuery() === 'app';
}

const routeTemplateId = ref(readRouteTemplateId());
const entering = ref(false);
const saving = ref(false);
const draftSaving = ref(false);
const schemaLoading = ref(false);
const loadFailed = ref(false);
const wizardKey = ref(0);
const stepIndex = ref(0);
const steps = ref(buildFillSteps(null));
const templateDetail = ref<OnboardingRegisterFormTemplateDetail | null>(null);
const loadedTemplateId = ref('');
const loadedShowGuide = ref(true);
const form = ref<Record<string, unknown>>({});

const formRef = ref<SchemaFormExpose | null>(null);
const attachmentRef = ref<AttachmentExpose | null>(null);
const commitmentRef = ref<CommitmentExpose | null>(null);

const currentStepKey = computed(() => steps.value[stepIndex.value]?.key || '');
const isGuideStep = computed(() => currentStepKey.value === FILL_STEP.GUIDE);
const isFromApp = computed(() => readFromApp());
/** 引导步：引导页；app：填写入职登记表；其它：入职登记表 */
const navBarTitle = computed(() => {
  if (isGuideStep.value) return '引导页';
  return isFromApp.value ? '填写入职登记表' : '入职登记表';
});
const isLastStep = computed(
  () => steps.value.length > 0 && stepIndex.value >= steps.value.length - 1,
);
/** 引导页之后不能再退回引导页 */
const canGoPrev = computed(() => {
  if (!steps.value.length || isGuideStep.value) return false;
  const prev = steps.value[stepIndex.value - 1];
  return Boolean(prev && prev.key !== FILL_STEP.GUIDE);
});
/** 引导页、最后一步（已有提交）不展示存草稿 */
const showSaveDraft = computed(
  () => steps.value.length > 0 && !isGuideStep.value && !isLastStep.value,
);

function hasStep(key: FillStepKey) {
  return steps.value.some((item) => item.key === key);
}

function goSelectTemplate() {
  router.replace({ name: 'OnboardingRegisterForm' });
}

function onBack() {
  if (canGoPrev.value) {
    onPrev();
    return;
  }
  router.back();
}

function onPrev() {
  if (!canGoPrev.value) return;
  stepIndex.value -= 1;
}

async function loadFormSchema(detail: OnboardingRegisterFormTemplateDetail) {
  if (!detail.enableForm) return;
  schemaLoading.value = true;
  try {
    await nextTick();
    if (detail.formContent.length) {
      formRef.value?.loadForDetail?.({
        formContent: detail.formContent,
        fill: true,
      });
      return;
    }
    await formRef.value?.loadForFill?.();
  } finally {
    schemaLoading.value = false;
  }
}

async function enterWizard(templateId: string) {
  if (!templateId) {
    goSelectTemplate();
    return;
  }
  const showGuide = readShowGuide();
  if (
    loadedTemplateId.value === templateId &&
    loadedShowGuide.value === showGuide &&
    steps.value.length
  ) {
    stepIndex.value = 0;
    loadFailed.value = false;
    return;
  }

  entering.value = true;
  loadFailed.value = false;
  try {
    const res = await getOnboardingRegisterFormTemplateDetailApi({
      id: templateId,
    });
    if (!res?.success || !res.body?.id) {
      showToast(res?.message || res?.errorMsg || '获取模板配置失败');
      steps.value = [];
      templateDetail.value = null;
      loadedTemplateId.value = '';
      loadedShowGuide.value = true;
      loadFailed.value = true;
      return;
    }
    const nextSteps = buildFillSteps(res.body, { showGuide });
    if (!nextSteps.length) {
      showToast('该模板未配置填写内容');
      steps.value = [];
      templateDetail.value = null;
      loadedTemplateId.value = '';
      loadedShowGuide.value = true;
      loadFailed.value = true;
      return;
    }
    templateDetail.value = res.body;
    loadedTemplateId.value = templateId;
    loadedShowGuide.value = showGuide;
    steps.value = nextSteps;
    stepIndex.value = 0;
    form.value = {};
    wizardKey.value += 1;
    await loadFormSchema(res.body);
  } finally {
    entering.value = false;
  }
}

async function validateCurrentStep() {
  const key = currentStepKey.value;
  if (key === FILL_STEP.FORM) {
    try {
      await formRef.value?.validate?.();
    } catch {
      showToast('请完善必填项');
      return false;
    }
    if (!pickSummaryFromModel(form.value).name) {
      showToast('请填写姓名');
      return false;
    }
  }
  if (key === FILL_STEP.MATERIAL) {
    const passed = await attachmentRef.value?.validate?.();
    if (!passed) return false;
  }
  if (key === FILL_STEP.COMMITMENT) {
    const passed = await commitmentRef.value?.validate?.();
    if (!passed) return false;
  }
  return true;
}

async function onNext() {
  if (!(await validateCurrentStep())) return;
  if (stepIndex.value < steps.value.length - 1) {
    stepIndex.value += 1;
  }
}

function buildFillPayload(
  formUpdateStatus: number,
): OnboardingRegisterFormFillParams {
  const detail = templateDetail.value;
  const summary = hasStep(FILL_STEP.FORM)
    ? pickSummaryFromModel(form.value)
    : {
        name: '',
        phone: '',
        staffType: '',
        staffTypeName: '',
        departmentId: '',
        departmentName: '',
        enrollDate: '',
        committed: false,
      };
  const commitment = hasStep(FILL_STEP.COMMITMENT)
    ? commitmentRef.value?.getValue?.() || { signed: false, signUrl: '' }
    : { signed: false, signUrl: '' };
  const materials = hasStep(FILL_STEP.MATERIAL)
    ? attachmentRef.value?.buildSubmitPayload?.().materials || []
    : [];

  return {
    ...summary,
    templateId: detail?.id || loadedTemplateId.value,
    committed: Boolean(commitment.signed),
    formUpdateStatus,
    formData: formRef.value?.getSubmitPayload?.() || {},
    materials,
    commitment,
    formContent: detail?.formContent || [],
    registerTemplate: {
      id: detail?.id || '',
      enableGuide: Boolean(detail?.enableGuide),
      enableAttach: Boolean(detail?.enableAttach),
      staffPromise: Boolean(detail?.staffPromise),
      promiseContent: detail?.promiseContent || '',
      signature: Boolean(detail?.signature),
    },
  };
}

async function persistFill(
  formUpdateStatus: number,
  options: { loading: typeof saving; successText: string; failText: string },
) {
  if (options.loading.value || !steps.value.length) return false;
  options.loading.value = true;
  try {
    const res = await fillOnboardingRegisterFormApi(
      buildFillPayload(formUpdateStatus),
    );
    if ((res as { success?: boolean }).success === false) {
      showToast((res as { message?: string }).message || options.failText);
      return false;
    }
    showSuccessToast(options.successText);
    router.replace({ name: 'OnboardingRegisterForm' });
    return true;
  } finally {
    options.loading.value = false;
  }
}

/** 存草稿：不校验必填，直接落库 */
async function onSaveDraft() {
  if (saving.value || draftSaving.value || !showSaveDraft.value) return;
  await persistFill(REGISTER_FORM_UPDATE_STATUS.DRAFT, {
    loading: draftSaving,
    successText: '存草稿成功',
    failText: '存草稿失败',
  });
}

async function onSubmit() {
  if (saving.value || draftSaving.value || !steps.value.length) return;
  if (!(await validateCurrentStep())) return;

  const summary = hasStep(FILL_STEP.FORM)
    ? pickSummaryFromModel(form.value)
    : { name: '' };
  if (hasStep(FILL_STEP.FORM) && !summary.name) {
    showToast('请填写姓名');
    return;
  }

  await persistFill(REGISTER_FORM_UPDATE_STATUS.NORMAL, {
    loading: saving,
    successText: '提交成功',
    failText: '提交失败',
  });
}

function syncRouteTemplate() {
  const templateId = readRouteTemplateId();
  routeTemplateId.value = templateId;
  if (!templateId) {
    goSelectTemplate();
    return;
  }
  enterWizard(templateId);
}

watch(
  () => [route.params.templateId, route.query.templateId, route.query.from],
  () => {
    const templateId = readRouteTemplateId();
    const showGuide = readShowGuide();
    if (
      templateId === routeTemplateId.value &&
      showGuide === loadedShowGuide.value
    )
      return;
    syncRouteTemplate();
  },
);

onMounted(syncRouteTemplate);
</script>

<style scoped lang="less">
.register-fill {
  min-height: 100%;
  background: var(--van-background);
}

.register-fill__loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.register-fill__body {
  padding-bottom: 12px;
}
</style>
