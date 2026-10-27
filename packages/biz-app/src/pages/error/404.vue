<template>
  <div class="error-page">
    <van-empty image="search" :description="t('error.notFound')">
      <van-button round type="primary" @click="router.replace('/')">
        {{ t('common.back') }}
      </van-button>
    </van-empty>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

defineOptions({ name: 'Error404' });

const { t } = useI18n();
const router = useRouter();
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}
</style>
