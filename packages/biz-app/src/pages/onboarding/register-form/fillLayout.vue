<template>
  <div class="register-fill-layout">
    <!-- /*----登录页start----*/ -->
    <div v-if="showGate" class="register-fill-gate">
      <div class="register-fill-gate-bar">
        <button
          type="button"
          class="register-fill-gate-lang"
          @click="utils.toggleLocale"
        >
          {{ localeSwitchLabel }}
        </button>
      </div>
      <h1 class="register-fill-gate-title">
        {{ t('onboarding.registerForm.gate.title') }}
      </h1>
      <van-form
        ref="formRef"
        class="register-fill-gate-form"
        :show-error-message="false"
      >
        <div class="register-fill-gate-fields">
          <div class="register-fill-gate-item">
            <van-field
              v-model="form.name"
              class="register-fill-gate-field"
              name="name"
              :border="false"
              :placeholder="t('onboarding.registerForm.gate.namePlaceholder')"
              :rules="[
                {
                  required: true,
                  message: t('onboarding.registerForm.gate.nameRequired'),
                },
              ]"
            />
            <p v-if="fieldErrors.name" class="register-fill-gate-error">
              {{ fieldErrors.name }}
            </p>
          </div>
          <div class="register-fill-gate-item">
            <van-field
              class="register-fill-gate-field"
              name="phone"
              type="tel"
              maxlength="13"
              :border="false"
              :show-maxlength-toast="false"
              validate-trigger="onSubmit"
              :placeholder="t('onboarding.registerForm.gate.phonePlaceholder')"
              :model-value="phoneDisplay"
              :rules="phoneRules"
              @update:model-value="utils.onPhoneInput"
            />
            <p v-if="fieldErrors.phone" class="register-fill-gate-error">
              {{ fieldErrors.phone }}
            </p>
          </div>
          <div class="register-fill-gate-item">
            <div class="register-fill-gate-code">
              <van-field
                v-model="form.code"
                class="register-fill-gate-field register-fill-gate-code-field"
                name="code"
                type="digit"
                maxlength="6"
                :border="false"
                :show-maxlength-toast="false"
                :placeholder="t('onboarding.registerForm.gate.codePlaceholder')"
                :rules="[
                  {
                    required: true,
                    message: t('onboarding.registerForm.gate.codeRequired'),
                  },
                ]"
              >
                <template #button>
                  <span class="register-fill-gate-code-side">
                    <i class="register-fill-gate-code-line" />
                    <span
                      v-if="countdown > 0"
                      class="register-fill-gate-countdown"
                    >
                      {{ countdownText }}
                    </span>
                    <button
                      v-else
                      type="button"
                      class="register-fill-gate-send"
                      @click="utils.sendCode"
                    >
                      {{ t('onboarding.registerForm.gate.sendCode') }}
                    </button>
                  </span>
                </template>
              </van-field>
            </div>
            <p v-if="fieldErrors.code" class="register-fill-gate-error">
              {{ fieldErrors.code }}
            </p>
          </div>
        </div>
        <div class="register-fill-gate-submit">
          <van-button
            block
            round
            type="primary"
            size="large"
            native-type="button"
            :loading="phoneChecking"
            @click="utils.startFill"
          >
            {{ t('onboarding.registerForm.gate.start') }}
          </van-button>
        </div>
      </van-form>
    </div>
    <!-- /*----登录页end----*/ -->

    <!-- /*----填写页start----*/ -->
    <router-view v-else v-slot="{ Component }">
      <component :is="Component" class="register-fill-layout-page" />
    </router-view>
    <!-- /*----填写页end----*/ -->
  </div>
</template>

<script lang="ts" setup>
/**
 * 入职登记表填写页布局
 * from !== app 时先校验姓名、手机号、验证码，点开始填写后再进入填写页
 * from = app 时直接进入填写页
 */
import {
  computed,
  onUnmounted,
  reactive,
  ref,
  useTemplateRef,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { showSuccessToast, showToast } from 'vant';
import { useLocale } from '@/_composables/_useLocale';
import { checkOnboardingRegisterFormPhoneApi } from '@/services/api/employee/employment/onboarding/register-form';

defineOptions({ name: 'OnboardingRegisterFormFillLayout' });

const CODE_WAIT_SECONDS = 30;
const PHONE_PATTERN = /^1[3-9]\d{9}$/;

const route = useRoute();
const { t, locale } = useI18n();
const { setLocale } = useLocale();
/** 欢迎页表单，只在发送验证码和开始填写时校验 */
const formRef = useTemplateRef<{
  validate?: (name?: string | string[]) => Promise<void>;
  resetValidation?: (name?: string | string[]) => void;
}>('formRef');

/** 当前这次进入是否已点过开始填写。应用内代填直接进入 */
const loggedIn = ref(false);
/** 验证码倒计时（秒） */
const countdown = ref(0);
/** 是否已点击发送验证码 */
const codeSent = ref(false);
/** 手机号接口校验中 */
const phoneChecking = ref(false);
/** 欢迎页表单。手机号只存 11 位数字 */
const form = reactive({
  name: '',
  phone: '',
  code: '',
});
/** 校验文案，显示在输入框边框下方 */
const fieldErrors = reactive({
  name: '',
  phone: '',
  code: '',
});

let countdownTimer = 0;

function readQueryValue(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw ?? '').trim();
}

function readFromQuery() {
  return readQueryValue(route.query.from).toLowerCase();
}

function readFromApp() {
  return readFromQuery() === 'app';
}

function readTemplateId() {
  return readQueryValue(route.params.templateId);
}

/** 应用内代填 */
const isFromApp = computed(() => readFromApp());
/** 候选人入口才展示欢迎页 */
const showGate = computed(() => !isFromApp.value && !loggedIn.value);
/** 右上角展示可切换到的语言 */
const localeSwitchLabel = computed(() =>
  locale.value === 'en' ? '简体中文' : 'English',
);
/** 倒计时文案：重新发送(秒数) */
const countdownText = computed(() =>
  t('onboarding.registerForm.gate.resendWait', { seconds: countdown.value }),
);

function readPhoneDigits(value: unknown) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11);
}

/** 欢迎页校验。手机号业务校验走接口，文案用接口返回值；只在发送验证码和开始填写时跑 */
const phoneRules = [
  {
    validator(value: unknown) {
      const phone = readPhoneDigits(value);
      if (!phone) return t('onboarding.registerForm.gate.phoneRequired');
      if (!PHONE_PATTERN.test(phone)) {
        return t('onboarding.registerForm.gate.phoneInvalid');
      }
      return true;
    },
  },
  {
    async validator(value: unknown) {
      const phone = readPhoneDigits(value);
      if (!PHONE_PATTERN.test(phone)) return true;
      const res = await checkOnboardingRegisterFormPhoneApi({
        phone,
        templateId: readTemplateId(),
      });
      if (res?.success) return true;
      return (
        res?.message ||
        res?.errorMsg ||
        t('onboarding.registerForm.gate.phoneCheckFail')
      );
    },
  },
];

const utils = {
  /** 中英文切换，按钮展示即将切到的语言 */
  toggleLocale() {
    setLocale(locale.value === 'en' ? 'zh' : 'en');
  },

  /** 去非数字后按 3-4-4 加空格，最多 11 位 */
  formatPhone(value: unknown) {
    const digits = readPhoneDigits(value);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  },

  /** 输入只保留数字，改号后清掉上一次报错 */
  onPhoneInput(value: unknown) {
    form.phone = readPhoneDigits(value);
    fieldErrors.phone = '';
    formRef.value?.resetValidation?.('phone');
  },

  /** 把校验结果写到边框外。只校某一项时不动其它项 */
  applyErrors(errors: unknown, onlyName?: 'name' | 'phone' | 'code') {
    const list = Array.isArray(errors) ? errors : errors ? [errors] : [];
    const next = { name: '', phone: '', code: '' };
    list.forEach((item) => {
      const record = item as { name?: string; message?: string };
      const key = record?.name;
      if (key === 'name' || key === 'phone' || key === 'code') {
        next[key] = String(record.message || '');
      }
    });
    if (onlyName) {
      fieldErrors[onlyName] = next[onlyName];
      return;
    }
    fieldErrors.name = next.name;
    fieldErrors.phone = next.phone;
    fieldErrors.code = next.code;
  },

  clearFieldErrors() {
    fieldErrors.name = '';
    fieldErrors.phone = '';
    fieldErrors.code = '';
  },

  clearCountdown() {
    if (!countdownTimer) return;
    window.clearInterval(countdownTimer);
    countdownTimer = 0;
  },

  /** 回到登录页并清空本次填写 */
  resetGate() {
    loggedIn.value = false;
    codeSent.value = false;
    countdown.value = 0;
    phoneChecking.value = false;
    form.name = '';
    form.phone = '';
    form.code = '';
    utils.clearFieldErrors();
    utils.clearCountdown();
    formRef.value?.resetValidation?.();
  },

  /** 先校验手机号（含接口），通过后再开始 30 秒倒计时。验证码接口尚未接入 */
  async sendCode() {
    if (countdown.value > 0 || phoneChecking.value) return;
    phoneChecking.value = true;
    const valid = await formRef.value?.validate?.('phone')?.then(
      () => {
        fieldErrors.phone = '';
        return true;
      },
      (errors) => {
        utils.applyErrors(errors, 'phone');
        return false;
      },
    );
    phoneChecking.value = false;
    if (!valid) return;
    codeSent.value = true;
    countdown.value = CODE_WAIT_SECONDS;
    utils.clearCountdown();
    countdownTimer = window.setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        countdown.value = 0;
        utils.clearCountdown();
      }
    }, 1000);
    showSuccessToast(t('onboarding.registerForm.gate.codeSent'));
  },

  /** 校验通过后进入填写页。整表校验会带上手机号接口 */
  async startFill() {
    if (phoneChecking.value) return;
    phoneChecking.value = true;
    const valid = await formRef.value?.validate?.()?.then(
      () => {
        utils.clearFieldErrors();
        return true;
      },
      (errors) => {
        utils.applyErrors(errors);
        return false;
      },
    );
    phoneChecking.value = false;
    if (!valid) return;
    if (!codeSent.value) {
      showToast(t('onboarding.registerForm.gate.sendCodeFirst'));
      return;
    }
    loggedIn.value = true;
  },
};

/** 手机号按 3-4-4 展示，表单里仍存 11 位数字 */
const phoneDisplay = computed(() => utils.formatPhone(form.phone));

if (readFromApp()) {
  loggedIn.value = true;
}

watch(
  () => route.params.templateId,
  () => {
    if (readFromApp()) return;
    utils.resetGate();
  },
);

watch(
  () => route.query.from,
  () => {
    if (readFromApp()) {
      loggedIn.value = true;
      return;
    }
    utils.resetGate();
  },
);

watch(
  () => form.name,
  () => {
    fieldErrors.name = '';
  },
);

watch(
  () => form.code,
  () => {
    fieldErrors.code = '';
  },
);

onUnmounted(() => {
  utils.clearCountdown();
});
</script>

<style scoped lang="less">
.register-fill-layout {
  min-height: 100%;
  background: var(--van-background);
}

.register-fill-layout-page {
  min-height: 100%;
}

.register-fill-gate {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(12px + env(safe-area-inset-top)) 24px
    calc(65px + env(safe-area-inset-bottom));
  background: var(--van-background-2);
}

.register-fill-gate-bar {
  display: flex;
  justify-content: flex-end;
}

.register-fill-gate-lang {
  padding: 2px 12px;
  color: var(--van-primary-color);
  font-size: 14px;
  line-height: 22px;
  background: transparent;
  border: 1px solid var(--van-primary-color);
  border-radius: 999px;
}

.register-fill-gate-title {
  margin: 40px 0 0;
  color: var(--van-primary-color);
  font-size: 22px;
  font-weight: 500;
  line-height: 32px;
}

.register-fill-gate-form {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 64px;
}

.register-fill-gate-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register-fill-gate-field {
  --van-cell-horizontal-padding: 16px;
  --van-cell-vertical-padding: 12px;
  --van-cell-background: transparent;
  --van-field-placeholder-text-color: var(--van-text-color-auxiliary);
  background: transparent;
  border: 1px solid var(--van-border-color);
  border-radius: 999px;
  overflow: hidden;
}

.register-fill-gate-code-field {
  width: 100%;
}

.register-fill-gate-code-side {
  display: inline-flex;
  align-items: center;
}

.register-fill-gate-code-line {
  width: 1px;
  height: 16px;
  margin-right: 12px;
  background: var(--van-border-color);
}

.register-fill-gate-send {
  padding: 0;
  color: var(--van-primary-color);
  font-size: 14px;
  line-height: 22px;
  background: transparent;
  border: 0;
}

.register-fill-gate-countdown {
  color: var(--van-text-color-auxiliary);
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  white-space: nowrap;
}

.register-fill-gate-error {
  margin: 12px 8px 0;
  color: var(--van-danger-color);
  font-size: var(--van-font-size-sm);
  line-height: 16px;
}

.register-fill-gate-submit {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  box-sizing: border-box;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  background: var(--van-background-2);
  border: 0;
  border-top: 1px solid #eee;
}
</style>
