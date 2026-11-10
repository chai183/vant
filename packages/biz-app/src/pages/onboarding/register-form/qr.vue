<template>
  <div class="register-qr">
    <van-nav-bar
      title="扫码填写入职登记表"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="router.back()"
    />

    <div class="register-qr__body">
      <!-- /*----入职模板start----*/ -->
      <div class="register-qr__template">
        <van-field
          label="入职模板"
          readonly
          is-link
          required
          :model-value="selectedTemplateLabel"
          placeholder="请选择"
          @click="openTemplatePopup"
        />
      </div>
      <!-- /*----入职模板end----*/ -->

      <!-- /*----二维码展示start----*/ -->
      <div class="register-qr__card">
        <p class="register-qr__card-title">入职二维码</p>
        <div class="register-qr__frame">
          <img
            v-if="qrImageUrl"
            class="register-qr__image"
            :src="qrImageUrl"
            alt="入职二维码"
          />
          <van-icon
            v-else
            name="qr"
            size="120"
            color="var(--van-text-color-auxiliary)"
          />
        </div>
        <p class="register-qr__desc">
          {{ QR_CODE_DESC }}
        </p>
      </div>
      <!-- /*----二维码展示end----*/ -->
    </div>

    <van-bottom-action-bar placeholder>
      <template #actions>
        <van-button
          type="primary"
          block
          round
          :loading="saving"
          @click="handleSave"
        >
          保存二维码
        </van-button>
      </template>
    </van-bottom-action-bar>

    <!-- /*----选择入职模板弹层start----*/ -->
    <van-popup
      v-model:show="showTemplatePopup"
      round
      closeable
      position="bottom"
      title="请选择入职模板"
      safe-area-inset-bottom
    >
      <div class="register-qr__template-popup">
        <van-empty
          v-if="!templateOptions.length"
          description="暂无可用的入职模板"
        />
        <template v-else>
          <van-radio-group
            v-model="draftTemplateId"
            class="register-qr__template-list"
            is-list
            :options="templateOptions"
          />
          <div class="register-qr__template-actions">
            <van-button
              round
              plain
              hairline
              class="register-qr__template-action"
              @click="resetTemplateDraft"
            >
              重置
            </van-button>
            <van-button
              round
              type="primary"
              class="register-qr__template-action"
              @click="confirmTemplate"
            >
              确认
            </van-button>
          </div>
        </template>
      </div>
    </van-popup>
    <!-- /*----选择入职模板弹层end----*/ -->
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showToast, type ProFormOption } from 'vant';
import { getOnboardingRegisterFormTemplatePageApi } from '@/services/api/employee/employment/onboarding';
import {
  ENTRY_TEMPLATE_PAGE_SIZE,
  QR_CODE_DESC,
  REGISTER_FORM_TEMPLATE_STATUS,
  buildQrImageUrl,
} from '@/services/api/employee/employment/onboarding/config';

defineOptions({ name: 'OnboardingRegisterFormQr' });

const router = useRouter();

const form = ref({
  templateId: '',
});

/** 已启用入职模板选项（接口拉取） */
const templateOptions = ref<ProFormOption[]>([]);
const saving = ref(false);
/** 二维码图片地址 */
const qrImageUrl = ref('');
const showTemplatePopup = ref(false);
/** 弹层内草稿选中，确认后才写入 form */
const draftTemplateId = ref('');

const selectedTemplateLabel = computed(() => {
  const current = String(form.value.templateId || '');
  if (!current) return '';
  const matched = templateOptions.value.find(
    (item) => String(item.value) === current,
  );
  return String(matched?.label || '');
});

/** 刷新预览图（对齐 PC refreshQrImage） */
function refreshQrImage() {
  qrImageUrl.value = buildQrImageUrl(String(form.value.templateId || ''));
}

watch(
  () => form.value.templateId,
  () => {
    refreshQrImage();
  },
);

function openTemplatePopup() {
  draftTemplateId.value = String(form.value.templateId || '');
  showTemplatePopup.value = true;
}

/** 弹框内重置：恢复为打开弹层时 form 已选中的值，不改 form */
function resetTemplateDraft() {
  draftTemplateId.value = String(form.value.templateId || '');
}

function confirmTemplate() {
  form.value.templateId = String(draftTemplateId.value || '');
  showTemplatePopup.value = false;
}

/**
 * 拉取已启用的入职登记表模板，并默认选中第一项
 * 对齐 PC SendFormDialog.loadTemplateOptions
 */
async function loadTemplateOptions() {
  const res = await getOnboardingRegisterFormTemplatePageApi({
    pageNum: 1,
    pageSize: ENTRY_TEMPLATE_PAGE_SIZE,
    status: REGISTER_FORM_TEMPLATE_STATUS.ENABLED,
  });
  if (!res?.success) {
    showToast(res?.message || res?.errorMsg || '获取入职模板失败');
    templateOptions.value = [];
    form.value.templateId = '';
    refreshQrImage();
    return;
  }
  const records = res.body?.records ?? [];
  templateOptions.value = records
    .map((item) => ({
      label: item.name || '-',
      value: item.id,
    }))
    .filter((item) => item.value);
  form.value.templateId = String(templateOptions.value[0]?.value ?? '');
  refreshQrImage();
}

onMounted(() => {
  loadTemplateOptions();
});

/**
 * 保存二维码（对齐 PC handleDownload：先拉 blob，避免跨域直链跳转）
 */
async function handleSave() {
  if (!qrImageUrl.value) {
    showToast('暂无可保存的二维码');
    return;
  }
  saving.value = true;
  const blob = await fetch(qrImageUrl.value)
    .then((res) => (res.ok ? res.blob() : Promise.reject(res)))
    .catch(() => null);
  const link = document.createElement('a');
  link.download = '二维码.png';
  if (blob) {
    const url = URL.createObjectURL(blob);
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } else {
    link.href = qrImageUrl.value;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.append(link);
    link.click();
    link.remove();
  }
  saving.value = false;
  showSuccessToast('保存成功');
}
</script>

<style scoped lang="less">
.register-qr__body {
  padding: 12px;
}

.register-qr__template {
  overflow: hidden;
  background: var(--van-background-2, #fff);
  border-radius: 8px;
}

.register-qr__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  padding: 24px 24px 40px;
  background: var(--van-background-2, #fff);
  border-radius: 8px;
}

.register-qr__card-title {
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  line-height: 16px;
}

.register-qr__frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
}

.register-qr__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.register-qr__desc {
  width: 100%;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 18px;
  color: var(--van-text-color-auxiliary);
  background: var(--van-background, #f5f5f5);
  border-radius: 4px;
}

.register-qr__template-popup {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  padding: 0 0 16px;
}

.register-qr__template-list {
  flex: 1;
  overflow: auto;
}

.register-qr__template-actions {
  display: flex;
  gap: 12px;
  margin: 12px 16px 0;
}

.register-qr__template-action {
  flex: 1;
  min-width: 0;
}
</style>
