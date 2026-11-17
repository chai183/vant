<template>
  <van-dialog
    class="archive-submit-dialog"
    :show="show"
    v-model:input-value="reason"
    title="提示"
    show-cancel-button
    confirm-button-text="提交"
    cancel-button-text="取消"
    :before-close="beforeClose"
    :input-config="inputConfig"
    :close-on-click-overlay="false"
    @update:show="emit('update:show', $event)"
  >
    <template #title>
      <div class="archive-submit-heading">
        <span>提示</span>
        <button
          type="button"
          class="archive-submit-close"
          aria-label="关闭提交确认"
          @click="emit('update:show', false)"
        >
          <van-icon name="cross" />
        </button>
      </div>
    </template>
    <div class="archive-submit-content">
      <template v-if="basic">
        <section v-if="summary.approval.length" class="archive-submit-section">
          <p>以下变更的信息将提交给 HR 审批，可至【申请-信息变更】中查看。</p>
          <p class="archive-submit-fields">{{ summary.approval.join('、') }}</p>
        </section>
        <section v-if="summary.immediate.length" class="archive-submit-section">
          <p>以下变更的信息将直接生效。</p>
          <p class="archive-submit-fields">
            {{ summary.immediate.join('、') }}
          </p>
        </section>
      </template>
      <section v-else class="archive-submit-section">
        <p>
          {{
            summary.approval.length
              ? '保存后，需 HR 审批后生效。'
              : '保存后，变更信息将直接生效。'
          }}
        </p>
      </section>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DialogInputConfig } from 'vant';

/** 确认信息由当前信息集实际修改生成，原因不进入动态信息集表单。 */
const props = defineProps<{
  show: boolean;
  basic: boolean;
  summary: { approval: string[]; immediate: string[] };
}>();
const emit = defineEmits<{
  'update:show': [value: boolean];
  submit: [reason: string];
}>();
/** 每次新打开确认框时清空原因；取消框不修改外部档案草稿。 */
const reason = ref('');
/** 只有实际修改含审批字段才填写原因，输入与错误位置由 Dialog 负责。 */
const inputConfig = computed<DialogInputConfig | undefined>(() =>
  props.summary.approval.length
    ? {
        type: 'textarea',
        position: 'before',
        rows: 3,
        placeholder: '请填写申请原因',
        rules: [
          {
            validator: (value) => Boolean(String(value || '').trim()),
            message: '请填写申请原因',
          },
        ],
      }
    : undefined,
);
watch(
  () => props.show,
  (show) => {
    if (show) {
      reason.value = '';
    }
  },
);

function beforeClose(action: string, inputValue = '') {
  if (action !== 'confirm') return true;
  emit('submit', inputValue.trim());
  return true;
}
</script>

<style scoped lang="less">
.archive-submit-dialog {
  --van-dialog-message-max-height: min(400px, calc(100dvh - 180px));
}
.archive-submit-heading {
  position: relative;
  padding: 0 36px;
}
.archive-submit-close {
  position: absolute;
  top: 0;
  right: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 24px;
  height: 24px;
  border: 0;
  background: transparent;
  color: var(--van-text-color-secondary);
  font: inherit;
}
.archive-submit-content {
  box-sizing: border-box;
  padding: 16px 24px 24px;
  text-align: left;
  font-size: var(--van-font-size-md);
  line-height: 22px;
}
.archive-submit-section + .archive-submit-section {
  margin-top: 16px;
}
.archive-submit-section p {
  margin: 0;
  overflow-wrap: anywhere;
}
.archive-submit-section .archive-submit-fields {
  margin-top: 8px;
  color: var(--van-primary-color);
}
</style>
