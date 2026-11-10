<template>
  <div class="schema-field-types">
    <van-nav-bar
      title="字段类型配置全场景"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="router.back()"
    />

    <van-notice-bar
      wrapable
      :scrollable="false"
      text="覆盖 TEXT/数值/布尔/日期时间/字典OPTION(接口一层)/级联/上传/customFields/多行信息集。提交后可在下方查看 formData。"
    />

    <SchemaProForm
      ref="formRef"
      v-model="form"
      :schema="schema"
      :loading="loading"
      submit-text="校验并查看提交体"
      @submit="onSubmit"
      @failed="onFailed"
    />

    <!-- /*----提交结果start----*/ -->
    <div v-if="lastPayload" class="schema-field-types-result">
      <div class="schema-field-types-result-title">提交 formData</div>
      <pre class="schema-field-types-result-pre">{{ lastPayloadText }}</pre>
    </div>
    <!-- /*----提交结果end----*/ -->
  </div>
</template>

<script lang="ts" setup>
/**
 * SchemaProForm 字段类型配置全场景测试页
 * 拉 mock type=schema-field-types，验证 typeConfigJson 全量能力
 */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import SchemaProForm, {
  type SchemaFieldSet,
} from '@/_components/SchemaProForm';
import { getWaitEntryCreateFormFieldsApi } from '@/services/api/employee/employment/onboarding';
import { WAIT_ENTRY_FIELD_SEARCH_TYPE } from '@/services/api/employee/employment/onboarding/config';

defineOptions({ name: 'OnboardingSchemaFieldTypes' });

const router = useRouter();
const formRef = ref(null);
const loading = ref(true);
const schema = ref<SchemaFieldSet[]>([]);
const form = ref<Record<string, unknown>>({});
const lastPayload = ref<Record<string, unknown> | null>(null);

const lastPayloadText = computed(() =>
  lastPayload.value ? JSON.stringify(lastPayload.value, null, 2) : '',
);

async function bootstrap() {
  loading.value = true;
  try {
    const res = await getWaitEntryCreateFormFieldsApi({
      type: WAIT_ENTRY_FIELD_SEARCH_TYPE.SCHEMA_FIELD_TYPES,
    });
    if (!res?.success) {
      showToast(res?.message || '获取字段配置失败');
      schema.value = [];
      return;
    }
    schema.value = Array.isArray(res.body) ? res.body : [];
  } finally {
    loading.value = false;
  }
}

function onSubmit(payload: {
  model: Record<string, unknown>;
  formData: Record<string, Array<Record<string, unknown>>>;
}) {
  lastPayload.value = payload.formData;
  showToast('已生成提交体，见页面底部');
}

function onFailed() {
  showToast('请完善必填项或修正校验错误');
}

onMounted(bootstrap);
</script>

<style scoped lang="less">
.schema-field-types {
  min-height: 100%;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: var(--van-background, #f5f5f5);
}

.schema-field-types-result {
  margin: 12px 16px 24px;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
}

.schema-field-types-result-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.schema-field-types-result-pre {
  margin: 0;
  max-height: 360px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: #646566;
}
</style>
