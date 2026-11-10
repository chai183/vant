<template>
  <van-nav-bar
    title="员工花名册"
    left-arrow
    fixed
    placeholder
    safe-area-inset-top
    @click-left="emit('back')"
  >
    <template v-if="isOrgLeader" #right>
      <button type="button" class="roster-nav-setting" @click="onSetting">
        花名册设置
      </button>
    </template>
  </van-nav-bar>
</template>

<script lang="ts" setup>
import { showToast } from 'vant';

defineProps<{
  isOrgLeader: boolean;
}>();

const emit = defineEmits<{
  back: [];
}>();

function onSetting() {
  showToast('花名册设置开发中');
}
</script>

<style scoped lang="less">
.roster-nav-setting {
  border: 0;
  padding: 0;
  background: transparent;
  color: #ff8125;
  font-size: 14px;
}
</style>
