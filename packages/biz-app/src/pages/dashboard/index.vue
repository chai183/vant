<template>
  <div class="dashboard">
    <van-cell-group inset>
      <van-cell :title="t('dashboard.welcome')" :label="t('dashboard.desc')" />
      <van-cell title="当前用户" :value="userStore.username" />
      <van-cell title="角色" :value="userStore.roles.join(', ')" />
    </van-cell-group>

    <div class="dashboard__actions">
      <van-button type="primary" block round @click="onToast">
        试一下 Toast
      </van-button>
      <van-button
        plain
        block
        round
        style="margin-top: 12px"
        @click="toggleTheme"
      >
        切换主题（{{ activeThemeName }}）
      </van-button>
      <van-button
        plain
        type="danger"
        block
        round
        style="margin-top: 12px"
        @click="userStore.logout"
      >
        重置会话
      </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { showToast } from 'vant/es/toast';
import { useTheme } from '@/_composables/_useTheme';
import { useUserStore } from '@/pinia/stores/user';

defineOptions({ name: 'Dashboard' });

const { t } = useI18n();
const userStore = useUserStore();
const { activeThemeName, setTheme } = useTheme();

function onToast() {
  showToast('Vant 组件工作正常');
}

function toggleTheme() {
  setTheme(activeThemeName.value === 'light' ? 'dark' : 'light');
}
</script>

<style scoped lang="scss">
.dashboard {
  padding: 16px 0 24px;
}

.dashboard__actions {
  margin: 16px;
}
</style>
