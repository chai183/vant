<template>
  <!-- /*----员工承诺start----*/ -->
  <div class="view-commitment">
    <div class="view-commitment-section">
      <div class="view-commitment-head">
        <van-checkbox
          :model-value="commitmentInfo.signed"
          disabled
          shape="square"
        />
        <div class="view-commitment-title">员工承诺</div>
      </div>
      <div class="view-commitment-content">
        {{ commitmentContent || '暂无承诺内容' }}
      </div>
    </div>

    <div v-if="signatureEnabled" class="view-commitment-section">
      <div class="view-commitment-title">手写签名</div>
      <div v-if="commitmentInfo.signUrl" class="view-commitment-sign">
        <img :src="commitmentInfo.signUrl" alt="手写签名" />
      </div>
      <van-empty v-else description="暂无签名" image-size="80" />
    </div>
  </div>
  <!-- /*----员工承诺end----*/ -->
</template>

<script lang="ts" setup>
/**
 * 入职登记表查看 - 员工承诺（只读）
 * 开关与文案取 registerTemplate，签署信息取人员填报
 */
import { computed } from 'vue';
import { REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT } from '../config';

defineOptions({ name: 'RegisterFormViewCommitment' });

const props = withDefaults(
  defineProps<{
    registerTemplate?: Record<string, unknown> | null;
    commitment?: Record<string, unknown> | null;
  }>(),
  {
    registerTemplate: () => ({}),
    commitment: () => ({}),
  },
);

/** 承诺正文 */
const commitmentContent = computed(() => {
  const raw = String(props.registerTemplate?.promiseContent || '').trim();
  return raw || REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT;
});

/** 是否启用手写签名 */
const signatureEnabled = computed(() =>
  Boolean(props.registerTemplate?.signature),
);

/** 人员签署信息 */
const commitmentInfo = computed(() => ({
  signed: Boolean(props.commitment?.signed),
  signUrl: String(props.commitment?.signUrl || ''),
}));
</script>

<style scoped lang="less">
.view-commitment {
  padding: 16px 12px;
}

.view-commitment-section {
  margin-bottom: 8px;
  padding: 12px;
  background: var(--van-background-2, #fff);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-commitment-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-commitment-title {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}

.view-commitment-content {
  line-height: 20px;
}

.view-commitment-sign {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  background: #ddd;
  border-radius: 4px;

  img {
    max-width: 100%;
    max-height: 160px;
    object-fit: contain;
  }
}
</style>
