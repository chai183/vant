<template>
  <!-- /*----承诺与签名start----*/ -->
  <div class="fill-commitment">
    <div class="fill-commitment__section">
      <div class="fill-commitment__head">
        <van-checkbox v-model="agreed" shape="square"
          >我已阅读并同意</van-checkbox
        >
      </div>
      <div class="fill-commitment__title">员工承诺</div>
      <div class="fill-commitment__content">
        {{ content || '暂无承诺内容' }}
      </div>
    </div>

    <div v-if="signatureEnabled" class="fill-commitment__section">
      <div class="fill-commitment__title">
        手写签名
        <span class="fill-commitment__required">*</span>
      </div>
      <van-signature
        ref="signatureRef"
        class="fill-commitment__sign"
        @submit="onSignatureSubmit"
        @clear="onSignatureClear"
      />
    </div>
  </div>
  <!-- /*----承诺与签名end----*/ -->
</template>

<script lang="ts" setup>
/**
 * 入职登记填写 - 承诺与签名
 * 承诺必勾选；模板开启 signature 时提交前读取画布
 */
import { computed, nextTick, ref, watch } from 'vue';
import { showToast } from 'vant';
import { REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT } from '../config';

defineOptions({ name: 'RegisterFormFillCommitment' });

const props = withDefaults(
  defineProps<{
    promiseContent?: string;
    signatureEnabled?: boolean;
    /** 当前步骤可见时重算画布尺寸 */
    active?: boolean;
  }>(),
  {
    promiseContent: '',
    signatureEnabled: false,
    active: false,
  },
);

const agreed = ref(false);
const signUrl = ref('');
const signatureRef = ref<{
  resize?: () => void;
  submit?: () => void;
  clear?: () => void;
} | null>(null);

const content = computed(() => {
  const raw = String(props.promiseContent || '').trim();
  return raw || REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT;
});

function onSignatureSubmit(payload: { image?: string }) {
  signUrl.value = String(payload?.image || '');
}

function onSignatureClear() {
  signUrl.value = '';
}

watch(
  () => props.active,
  async (active) => {
    if (!active || !props.signatureEnabled) return;
    await nextTick();
    signatureRef.value?.resize?.();
  },
  { immediate: true },
);

async function validate() {
  if (!agreed.value) {
    showToast('请确认员工承诺');
    return false;
  }
  if (!props.signatureEnabled) return true;
  await nextTick();
  signatureRef.value?.resize?.();
  signatureRef.value?.submit?.();
  if (!signUrl.value) {
    showToast('请完成手写签名');
    return false;
  }
  return true;
}

function getValue() {
  return {
    signed: agreed.value,
    signUrl: props.signatureEnabled ? signUrl.value : '',
  };
}

defineExpose({
  validate,
  getValue,
});
</script>

<style scoped lang="less">
.fill-commitment {
  padding: 12px;
}

.fill-commitment__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  padding: 12px;
  background: var(--van-background-2, #fff);
  border-radius: 8px;
}

.fill-commitment__head {
  display: flex;
  align-items: center;
}

.fill-commitment__title {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--van-text-color);
}

.fill-commitment__required {
  margin-left: 2px;
  color: var(--van-danger-color);
}

.fill-commitment__content {
  line-height: 20px;
  color: var(--van-text-color);
  white-space: pre-wrap;
}

.fill-commitment__sign {
  :deep(.van-signature__footer .van-button--primary) {
    display: none;
  }
}
</style>
