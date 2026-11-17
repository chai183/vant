<template>
  <van-nav-bar
    :title="title"
    left-arrow
    fixed
    placeholder
    safe-area-inset-top
    @click-left="emit('back')"
  >
    <template v-if="isDeptContact" #right>
      <button type="button" class="roster-nav-setting" @click="onSetting">
        花名册设置
      </button>
    </template>
  </van-nav-bar>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

/** 部门联系人进入花名册设置。 */
const router = useRouter();

withDefaults(
  defineProps<{
    /** 部门联系人才显示右上角花名册设置；搜索页不传 */
    isDeptContact?: boolean;
    /** 导航标题，详情页传员工详情 */
    title?: string;
  }>(),
  {
    isDeptContact: false,
    title: '员工花名册',
  },
);

const emit = defineEmits<{
  back: [];
}>();

function onSetting() {
  void router.push({ name: 'EmployeeRosterSettings' });
}
</script>

<style scoped lang="less">
.roster-nav-setting {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--van-primary-color);
  font-size: 14px;
}
</style>
