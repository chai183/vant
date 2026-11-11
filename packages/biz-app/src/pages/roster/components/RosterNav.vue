<template>
  <van-nav-bar
    :title="title"
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

withDefaults(
  defineProps<{
    /** 组织负责人才显示右上角花名册设置；搜索页不传 */
    isOrgLeader?: boolean;
    /** 导航标题，详情页传员工详情 */
    title?: string;
  }>(),
  {
    isOrgLeader: false,
    title: '员工花名册',
  },
);

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
