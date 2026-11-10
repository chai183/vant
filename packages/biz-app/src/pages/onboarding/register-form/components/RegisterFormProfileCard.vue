<template>
  <div class="register-profile">
    <div class="register-profile-avatar">
      <img v-if="detail?.avatar" :src="detail.avatar" alt="" />
      <span v-else>{{ avatarText }}</span>
    </div>
    <div class="register-profile-main">
      <div class="register-profile-name">{{ nameText }}</div>
      <div v-if="profileTags.length" class="register-profile-tags">
        <van-tag
          v-for="tag in profileTags"
          :key="tag.text"
          :type="tag.type"
          plain
        >
          {{ tag.text }}
        </van-tag>
      </div>
      <div class="register-profile-contact">{{ contactText }}</div>
      <div class="register-profile-date">
        <van-icon name="calendar-o" size="14" />
        <span>入职日期：{{ enrollText }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 入职登记表编辑 / 详情头部信息卡
 * 字段对齐 PC RegisterFormProfileCard：头像、姓名、组织、职位、已承诺、手机号、证件号、入职日期
 */
import { computed } from 'vue';
import type { OnboardingRegisterFormViewDetail } from '@/types/employee/employment/onboarding/register-form';
import { isRegisterFormCommittedTag } from '@/services/api/employee/employment/onboarding/register-form/config';
import { formatPhone } from '../config';

const props = defineProps<{
  detail?: OnboardingRegisterFormViewDetail | null;
}>();

const nameText = computed(() => props.detail?.name || '-');

const avatarText = computed(() => nameText.value.slice(0, 1));

/** 组织，对齐 PC profile.organization */
const departmentText = computed(() =>
  String(props.detail?.departmentName || '').trim(),
);

/** 职位，对齐 PC profile.position */
const positionText = computed(() =>
  String(props.detail?.positionName || '').trim(),
);

/** 已承诺：与列表 tagName / PC tag === 1 同一套判断 */
const committedLabel = computed(() => {
  if (props.detail?.tagName) return props.detail.tagName;
  if (isRegisterFormCommittedTag(props.detail?.tag)) return '已承诺';
  return '';
});

/** 描边标签，样式对齐列表 van-tag plain：组织 / 职位 primary，已承诺 success */
const profileTags = computed(() => {
  const tags: Array<{ text: string; type: 'primary' | 'success' }> = [];
  if (departmentText.value) {
    tags.push({ text: departmentText.value, type: 'primary' });
  }
  if (positionText.value) {
    tags.push({ text: positionText.value, type: 'primary' });
  }
  if (committedLabel.value) {
    tags.push({ text: committedLabel.value, type: 'success' });
  }
  return tags;
});

/** 证件号按 6-4-4-4 分组，对齐设计稿展示 */
function formatIdentityCard(value?: string) {
  const compact = String(value || '').replace(/\s/g, '');
  if (!compact) return '-';
  if (/^\d{17}[\dXx]$/.test(compact)) {
    return `${compact.slice(0, 6)} ${compact.slice(6, 10)} ${compact.slice(10, 14)} ${compact.slice(14)}`;
  }
  return String(value);
}

/** 手机号 | 证件号，对齐 PC profile.phone / profile.identityCard */
const contactText = computed(() => {
  const phone = formatPhone(props.detail?.phone);
  const identityCard = formatIdentityCard(props.detail?.identityCard);
  return `${phone} | ${identityCard}`;
});

/** 入职日期，对齐 PC profile.enrollDate */
const enrollText = computed(() => props.detail?.enrollDate || '-');
</script>

<style scoped lang="less">
.register-profile {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--van-background-2);
}

.register-profile-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border-radius: 50%;
  background: var(--van-primary-color);
  color: var(--van-white);
  font-size: 20px;
  font-weight: 500;
  line-height: 48px;
}

.register-profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.register-profile-main {
  min-width: 0;
  flex: 1;
}

.register-profile-name {
  color: var(--van-text-color);
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.register-profile-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 2px;

  :deep(.van-tag--plain::before) {
    display: none;
  }
}

.register-profile-contact {
  margin-top: 8px;
  color: var(--van-text-color-secondary);
  font-size: 12px;
  line-height: 16px;
  word-break: break-all;
}

.register-profile-date {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: var(--van-text-color-secondary);
  font-size: 12px;
  line-height: 16px;
}
</style>
