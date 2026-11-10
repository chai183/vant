<template>
  <div class="batch-feedback">
    <van-nav-bar
      title="批量操作反馈"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="router.back()"
    />

    <div class="batch-feedback__summary">
      <div class="batch-feedback__summary-item">
        <span class="batch-feedback__summary-label">成功数</span>
        <span
          class="batch-feedback__summary-value batch-feedback__summary-value--success"
        >
          {{ feedback.successCount }}
        </span>
      </div>
      <div class="batch-feedback__summary-item">
        <span class="batch-feedback__summary-label">失败数</span>
        <span
          class="batch-feedback__summary-value batch-feedback__summary-value--fail"
        >
          {{ feedback.failCount }}
        </span>
      </div>
    </div>

    <div class="batch-feedback__list">
      <div
        v-for="item in feedback.failList"
        :key="item.id"
        class="batch-feedback__item"
      >
        <div class="batch-feedback__row">
          <span class="batch-feedback__row-label">员工姓名</span>
          <span class="batch-feedback__row-value">{{ item.name || '-' }}</span>
        </div>
        <div class="batch-feedback__row">
          <span class="batch-feedback__row-label">失败原因</span>
          <span class="batch-feedback__row-value">{{
            item.reason || '-'
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { BatchOperationFeedback } from '@/types/employee/employment/onboarding/register-form';
import { BATCH_FEEDBACK_STORAGE_KEY, EMPTY_BATCH_FEEDBACK } from './config';

defineOptions({ name: 'OnboardingRegisterFormBatchFeedback' });

const router = useRouter();

const feedback = ref<BatchOperationFeedback>({ ...EMPTY_BATCH_FEEDBACK });

onMounted(() => {
  try {
    const raw = sessionStorage.getItem(BATCH_FEEDBACK_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as BatchOperationFeedback;
    feedback.value = {
      successCount: Number(parsed.successCount) || 0,
      failCount: Number(parsed.failCount) || 0,
      failList: Array.isArray(parsed.failList) ? parsed.failList : [],
    };
  } catch {
    feedback.value = { ...EMPTY_BATCH_FEEDBACK };
  } finally {
    sessionStorage.removeItem(BATCH_FEEDBACK_STORAGE_KEY);
  }
});
</script>

<style scoped lang="less">
.batch-feedback {
  min-height: 100%;
  background: var(--van-background-2, #fff);
}

.batch-feedback__summary {
  display: flex;
  gap: 32px;
  padding: 16px;
  font-size: 14px;
  line-height: 20px;
}

.batch-feedback__summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-feedback__summary-label {
  color: var(--van-text-color);
}

.batch-feedback__summary-value {
  font-weight: 500;

  &--success {
    color: var(--van-success-color);
  }

  &--fail {
    color: var(--van-danger-color);
  }
}

.batch-feedback__list {
  padding: 0 16px 24px;
}

.batch-feedback__item {
  padding: 12px 0;

  & + & {
    border-top: 1px solid var(--van-border-color, #ebedf0);
  }
}

.batch-feedback__row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font-size: 14px;
  line-height: 22px;

  & + & {
    margin-top: 8px;
  }
}

.batch-feedback__row-label {
  flex: none;
  width: 64px;
  color: var(--van-text-color-auxiliary);
}

.batch-feedback__row-value {
  flex: 1;
  min-width: 0;
  color: var(--van-text-color);
  word-break: break-word;
}
</style>
