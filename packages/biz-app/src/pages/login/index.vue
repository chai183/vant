<template>
  <div class="login">
    <h1 class="login__title">{{ t('login.title') }}</h1>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          :label="t('login.username')"
          :placeholder="t('login.username')"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          :label="t('login.password')"
          :placeholder="t('login.password')"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit">
          {{ t('login.submit') }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { showSuccessToast } from 'vant/es/toast';
import { useUserStore } from '@/pinia/stores/user';
import { DASHBOARD_PATH } from '@/router/config';

defineOptions({ name: 'Login' });

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  username: 'admin',
  password: '123456',
});

function onSubmit() {
  userStore.setToken(`mock-token-${form.username}`);
  showSuccessToast('登录成功');
  router.replace(DASHBOARD_PATH);
}
</script>

<style scoped lang="scss">
.login {
  min-height: 100%;
  padding-top: 20vh;
  background: var(--van-background-2, #f7f8fa);
}

.login__title {
  margin: 0 0 24px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
}
</style>
