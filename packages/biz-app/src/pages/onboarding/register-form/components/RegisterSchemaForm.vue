<template>
  <!-- /*----入职登记 Schema 表单（详情/编辑/填写共用）----*/ -->
  <div class="register-schema-form">
    <SchemaProForm
      ref="schemaFormRef"
      v-model="formModel"
      :schema="fieldSets"
      :loading="loading || schemaLoading"
      :readonly="readonly"
      :show-submit="false"
      :submit-text="submitText"
      :show-group-name="detailMode"
      :map-group-name-as-set-name="!detailMode"
      :resolve-schema-field="detailMode ? resolveDetailField : undefined"
      @submit="onSubmit"
      @failed="onFailed"
    />

    <!-- /*----底部提交start----*/ -->
    <van-bottom-action-bar v-if="showSubmit" placeholder>
      <template #actions>
        <van-button type="primary" block round @click="onClickSubmit">
          {{ submitText }}
        </van-button>
      </template>
    </van-bottom-action-bar>
    <!-- /*----底部提交end----*/ -->
  </div>
</template>

<script lang="ts" setup>
/**
 * 入职登记表公用 Form
 * 详情 / 编辑：用详情接口 formFiledMetaDataList（对齐 PC）
 * 填写：拉 field/search
 * 字典由 SchemaProForm 按 dictCode 调 PC 同款接口拉一层
 */
import { computed, onMounted, ref } from 'vue';
import { showToast } from 'vant';
import type { ProFormColumn } from 'vant';
import SchemaProForm, {
  createModelFromSubmitPayload,
  type SchemaFieldItem,
  type SchemaFieldSet,
} from '@/_components/SchemaProForm';
import { getWaitEntryCreateFormFieldsApi } from '@/services/api/employee/employment/onboarding';
import {
  DIRECT_MANAGER_SET_CODE,
  WAIT_ENTRY_FIELD_SEARCH_TYPE,
} from '@/services/api/employee/employment/onboarding/config';
import type { OnboardingRegisterFormViewDetail } from '@/types/employee/employment/onboarding/register-form';
import {
  alignRegisterFormDataKeys,
  templateFormContentToFieldSets,
} from '../utils/view-form';

defineOptions({ name: 'RegisterSchemaForm' });

const props = withDefaults(
  defineProps<{
    modelValue?: Record<string, unknown>;
    /** 页面侧 loading（与 schema 拉取合并展示） */
    loading?: boolean;
    readonly?: boolean;
    showSubmit?: boolean;
    submitText?: string;
    /** 挂载后是否自动拉取 field/search */
    autoLoad?: boolean;
  }>(),
  {
    modelValue: undefined,
    loading: false,
    readonly: false,
    showSubmit: true,
    submitText: '提交',
    autoLoad: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
  submit: [
    payload: {
      model: Record<string, unknown>;
      formData: Record<string, Array<Record<string, unknown>>>;
    },
  ];
  failed: [errorInfo: unknown];
  'schema-loaded': [schema: SchemaFieldSet[]];
}>();

const schemaFormRef = ref<{
  resetBySchema?: (schema?: SchemaFieldSet[]) => void;
  getSubmitPayload?: () => Record<string, Array<Record<string, unknown>>>;
  validate?: () => Promise<void>;
  submit?: () => void;
} | null>(null);

const schemaLoading = ref(false);
/** 详情 / 编辑：按信息集 + 分组渲染（对齐 PC）；填写仍把分组提升为区块 */
const detailMode = ref(false);
const fieldSets = ref<SchemaFieldSet[]>([]);
const innerModel = ref<Record<string, unknown>>({});

/** 详情编辑：姓名不可改（对齐 PC resolve-schema-field） */
function resolveDetailField(
  field: SchemaFieldItem,
  column: ProFormColumn,
): Partial<ProFormColumn> | void {
  if (field?.columnName !== 'name') return undefined;
  return {
    fieldProps: {
      ...column.fieldProps,
      disabled: true,
    },
  };
}

const formModel = computed({
  get() {
    const external = props.modelValue;
    if (external && Object.keys(external).length) return external;
    return innerModel.value;
  },
  set(value: Record<string, unknown>) {
    innerModel.value = value;
    emit('update:modelValue', value);
  },
});

/** 拉取 field/search（过滤直属领导） */
async function loadSchema() {
  detailMode.value = false;
  schemaLoading.value = true;
  try {
    const res = await getWaitEntryCreateFormFieldsApi({
      type: WAIT_ENTRY_FIELD_SEARCH_TYPE.ENTRY_WAIT,
    });
    if (!res?.success) {
      showToast(res?.message || '获取表单字段配置失败');
      fieldSets.value = [];
      applyModel(createModelFromSubmitPayload([]));
      emit('schema-loaded', []);
      return [];
    }
    const list = (Array.isArray(res?.body) ? res.body : []).filter(
      (item) => item?.setCode !== DIRECT_MANAGER_SET_CODE,
    );
    fieldSets.value = list;
    emit('schema-loaded', list);
    return list;
  } finally {
    schemaLoading.value = false;
  }
}

function applyModel(model: Record<string, unknown>) {
  innerModel.value = model;
  emit('update:modelValue', model);
}

/** 空表（填写页） */
function resetEmpty() {
  applyModel(createModelFromSubmitPayload(fieldSets.value));
}

/** 详情 / 编辑：formFiledMetaDataList 作 schema，再按 formData 回填（对齐 PC） */
function applyDetail(
  options: {
    formContent?: unknown[] | null;
    formData?: Record<string, unknown> | null;
    viewDetail?: OnboardingRegisterFormViewDetail | null;
    /** 填写场景：按模板字段渲染，姓名可编辑 */
    fill?: boolean;
  } = {},
) {
  detailMode.value = !options.fill;
  const schema = templateFormContentToFieldSets(options.formContent || []);
  const aligned = alignRegisterFormDataKeys(schema, options.formData || {});
  applyModel(
    createModelFromSubmitPayload(schema, aligned as Record<string, unknown>),
  );
  fieldSets.value = schema;
  emit('schema-loaded', schema);
}

/** 先拉 schema，再空表初始化（填写） */
async function loadForFill() {
  const schema = await loadSchema();
  applyModel(createModelFromSubmitPayload(schema));
  return schema;
}

/** 按详情接口字段元数据回填（详情 / 编辑，不走 field/search） */
function loadForDetail(
  options: {
    formContent?: unknown[] | null;
    formData?: Record<string, unknown> | null;
    viewDetail?: OnboardingRegisterFormViewDetail | null;
    fill?: boolean;
  } = {},
) {
  applyDetail(options);
  return fieldSets.value;
}

function onSubmit(payload: {
  model: Record<string, unknown>;
  formData: Record<string, Array<Record<string, unknown>>>;
}) {
  emit('submit', payload);
}

function onFailed(errorInfo: unknown) {
  emit('failed', errorInfo);
}

function onClickSubmit() {
  schemaFormRef.value?.submit?.();
}

onMounted(() => {
  if (props.autoLoad) {
    loadSchema().then((schema) => {
      // 外部尚未写入 model 时给空默认值
      const current = props.modelValue ?? innerModel.value;
      if (!current || !Object.keys(current).length) {
        applyModel(createModelFromSubmitPayload(schema));
      }
    });
  }
});

defineExpose({
  loadSchema,
  loadForFill,
  loadForDetail,
  applyDetail,
  resetEmpty,
  getSchema: () => fieldSets.value,
  getModel: () => formModel.value,
  getSubmitPayload: () => schemaFormRef.value?.getSubmitPayload?.(),
  validate: () => schemaFormRef.value?.validate?.(),
  submit: () => schemaFormRef.value?.submit?.(),
});
</script>
