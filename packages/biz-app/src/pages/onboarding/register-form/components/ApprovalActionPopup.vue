<template>
  <!-- /*----单条审批弹层：同意 / 退回 / 拒绝----*/ -->
  <van-popup
    v-model:show="visible"
    round
    closeable
    position="bottom"
    :title="actionConfig.title"
    safe-area-inset-bottom
    class="approval-action-popup"
    @closed="resetForm"
  >
    <div class="approval-action-popup__body">
      <van-pro-form
        ref="formRef"
        v-model="form"
        class="approval-action-popup__form"
        :columns="columns"
        required="auto"
        :show-submit="false"
      />
      <van-button
        block
        round
        type="primary"
        class="approval-action-popup__submit"
        :loading="loading"
        @click="onSubmit"
      >
        {{ actionConfig.confirmText }}
      </van-button>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { ProFormColumn } from 'vant';
import {
  REGISTER_FORM_APPROVAL_ACTION,
  REGISTER_FORM_APPROVAL_ACTION_CONFIG,
  REGISTER_FORM_APPROVAL_NOTIFY,
  REGISTER_FORM_APPROVAL_OPINION_MAX_LENGTH,
} from '@/services/api/employee/employment/onboarding/register-form/config';
import { APPROVAL_NOTIFY_OPTIONS } from '../config';

type ApprovalFormExpose = {
  validate?: (name?: string | string[]) => Promise<void>;
  resetValidation?: (name?: string | string[]) => void;
};

defineOptions({ name: 'RegisterFormApprovalActionPopup' });

export type ApprovalActionType =
  (typeof REGISTER_FORM_APPROVAL_ACTION)[keyof typeof REGISTER_FORM_APPROVAL_ACTION];

const props = withDefaults(
  defineProps<{
    show: boolean;
    action: ApprovalActionType;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const emit = defineEmits<{
  'update:show': [value: boolean];
  confirm: [payload: { comment: string; notifyMethods: string[] }];
}>();

const visible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
});

const formRef = ref<ApprovalFormExpose>();
const form = ref({
  comment: '',
  notifyMethods: [REGISTER_FORM_APPROVAL_NOTIFY.EMAIL] as string[],
});

const actionConfig = computed(() => {
  const config = REGISTER_FORM_APPROVAL_ACTION_CONFIG[props.action];
  return (
    config || {
      title: '',
      confirmText: '确认',
      commentRequired: false,
      failFallback: '操作失败',
    }
  );
});

const columns = computed<ProFormColumn[]>(() => {
  const commentRequired = Boolean(actionConfig.value.commentRequired);
  return [
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
        placeholder: commentRequired
          ? '请输入意见（必填）'
          : '请输入意见（非必填）',
        // 星号由 Form required="auto" 根据 rules 自动展示
        rules: commentRequired
          ? [{ required: true, message: '请输入意见' }]
          : undefined,
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
  ];
});

function resetFormModel() {
  form.value = {
    comment: '',
    notifyMethods: [REGISTER_FORM_APPROVAL_NOTIFY.EMAIL],
  };
  formRef.value?.resetValidation?.();
}

watch(
  () => props.show,
  (open) => {
    if (open) resetFormModel();
  },
);

function resetForm() {
  resetFormModel();
}

async function onSubmit() {
  try {
    await formRef.value?.validate?.();
  } catch {
    return;
  }
  const comment = String(form.value.comment || '').trim();
  const notifyMethods = Array.isArray(form.value.notifyMethods)
    ? form.value.notifyMethods.map(String)
    : [];
  emit('confirm', { comment, notifyMethods });
}
</script>

<style scoped lang="less">
.approval-action-popup__body {
  padding: 8px 16px 20px;
}

.approval-action-popup__form {
  margin-bottom: 12px;

  :deep(.van-cell-group) {
    background: transparent;
  }

  :deep(.van-cell) {
    padding-left: 0;
    padding-right: 0;
    background: transparent;
  }

  /* 意见：标签在上，无底色 + 描边输入区 */
  :deep(.van-field--label-top .van-field__value) {
    margin-top: 8px;
    padding: 8px 12px;
    border: 1px solid var(--van-border-color);
    border-radius: 4px;
  }

  :deep(.van-field--label-top .van-field__body) {
    background: transparent;
  }
}

.approval-action-popup__submit {
  margin-top: 4px;
}
</style>
