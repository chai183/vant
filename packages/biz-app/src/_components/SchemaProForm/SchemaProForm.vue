<template>
  <div class="schema-pro-form">
    <!-- /*----加载start----*/ -->
    <van-skeleton
      v-if="loading"
      title
      :row="skeletonRow"
      class="schema-pro-form-skeleton"
    />
    <!-- /*----加载end----*/ -->

    <template v-else>
      <!-- /*----空态start----*/ -->
      <van-empty v-if="!columns.length" :description="emptyText" />
      <!-- /*----空态end----*/ -->

      <!-- /*----表单start----*/ -->
      <van-pro-form
        v-else
        ref="proFormRef"
        v-model="formModel"
        :columns="columns"
        :components="mergedComponents"
        :show-submit="showSubmit"
        :submit-text="submitText"
        :disabled="disabled"
        :readonly="readonly"
        v-bind="formAttrs"
        @submit="onSubmit"
        @failed="onFailed"
      >
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData || {}" />
        </template>
      </van-pro-form>
      <!-- /*----表单end----*/ -->
    </template>
  </div>
</template>

<script lang="ts" setup>
/**
 * SchemaProForm - 后端信息集 schema → vant ProForm
 * 供入职填写、花名册等复用：传入 schema，内部转 columns 并维护 model
 */
import { computed, ref, useAttrs, watch } from 'vue';
import type { Component } from 'vue';
import type { ProFormColumn, ProFormOption } from 'vant';
import { useDictStore } from '@/pinia/stores/dict';
import type { SchemaFieldSet } from './types';
import { createMergedResolveSchemaField } from './resolve-schema-field';
import SchemaTimePickerField from './SchemaTimePickerField.vue';
import SchemaDateTimePickerField from './SchemaDateTimePickerField.vue';
import type { SchemaOption } from './apply-type-config';
import {
  collectSchemaFieldRuntimeMetas,
  syncSchemaModelLinkages,
} from './schema-runtime';
import {
  buildSubmitPayload,
  collectSchemaDictCodes,
  createModelFromSchema,
  mapGroupNameAsSetName as applyGroupNameAsSetName,
  transformSchemaToColumns,
  type ResolveSchemaField,
  type TransformSchemaOptions,
} from './transform-schema';

defineOptions({
  name: 'SchemaProForm',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    /** 表单 model（须用 ref 绑定，增删分组才能生效） */
    modelValue?: Record<string, unknown>;
    /**
     * 后端信息集 JSON（setCode → groupList → fieldList）
     * 与 PC ProForm schema 同构
     */
    schema?: SchemaFieldSet[] | null;
    /** 拉取 / 转换中 */
    loading?: boolean;
    /** 骨架行数 */
    skeletonRow?: number;
    /** 无字段时文案 */
    emptyText?: string;
    /** 是否展示提交按钮 */
    showSubmit?: boolean;
    submitText?: string;
    disabled?: boolean;
    readonly?: boolean;
    /** 是否展示 groupName（默认 false：字段平铺在 setName 区块下） */
    showGroupName?: boolean;
    /**
     * 展示时是否把 groupName 提升为 setName（对齐 PC AddDialog）
     * 提交仍按原始 schema 的 setCode 组装
     */
    mapGroupNameAsSetName?: boolean;
    /** columnName → options */
    fieldOptions?: Record<string, ProFormOption[]>;
    /**
     * dictCode / dictId → options（可选覆盖）
     * 默认按 schema 的 dictCode 调 PC 同款字典接口拉一层；传入时覆盖对应 code
     */
    dictOptions?: Record<string, SchemaOption[]>;
    /** 是否自动按 schema 拉取字典（一层）；默认 true */
    autoLoadDict?: boolean;
    /**
     * 单字段转换钩子（在组件默认覆盖之后执行，可再改 type / options / rules）
     * 默认已处理 gender / staffType / orgId 无 options 兜底
     */
    resolveSchemaField?: ResolveSchemaField;
    /** 扩展 ProForm components（默认含 schemaTimePicker） */
    components?: Record<string, Component>;
  }>(),
  {
    modelValue: undefined,
    schema: null,
    loading: false,
    skeletonRow: 10,
    emptyText: '暂无表单字段配置',
    showSubmit: true,
    submitText: '提交',
    disabled: false,
    readonly: false,
    showGroupName: false,
    mapGroupNameAsSetName: true,
    fieldOptions: undefined,
    dictOptions: undefined,
    autoLoadDict: true,
    resolveSchemaField: undefined,
    components: undefined,
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
}>();

const attrs = useAttrs();
const dictStore = useDictStore();
const proFormRef = ref<{
  submit?: () => void;
  validate?: (name?: string | string[]) => Promise<void>;
  getValues?: () => Record<string, unknown>;
  resetValidation?: (name?: string | string[]) => void;
} | null>(null);

/** 接口拉取的一层字典（schema dictCode → options） */
const loadedDictOptions = ref<Record<string, SchemaOption[]>>({});
/** 避免 schema 快速切换时旧请求回写 */
let dictLoadToken = 0;

/** 透传给底层 van-pro-form 的其余 attrs（去掉已声明 props） */
const formAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  return next;
});

/** 原始 schema（提交用） */
const originSchema = computed(() =>
  Array.isArray(props.schema) ? props.schema : [],
);

/** 展示用 schema */
const displaySchema = computed(() => {
  const list = originSchema.value;
  return props.mapGroupNameAsSetName ? applyGroupNameAsSetName(list) : list;
});

/** 默认字段覆盖 + 业务侧钩子 */
const mergedResolveSchemaField = computed(() =>
  createMergedResolveSchemaField(props.resolveSchemaField),
);

const mergedComponents = computed(() => ({
  schemaTimePicker: SchemaTimePickerField,
  schemaDateTimePicker: SchemaDateTimePickerField,
  ...(props.components || {}),
}));

/** 内部 model；有 v-model 时与外部同步 */
const innerModel = ref<Record<string, unknown>>({});
/** 联动对比用快照 */
const linkageSnapshot = ref<Record<string, unknown>>({});

/** 接口结果 + 业务 dictOptions 覆盖 */
const mergedDictOptions = computed(() => ({
  ...loadedDictOptions.value,
  ...(props.dictOptions || {}),
}));

const transformOptions = computed<TransformSchemaOptions>(() => ({
  showGroupName: props.showGroupName,
  fieldOptions: props.fieldOptions,
  dictOptions: mergedDictOptions.value,
  model: props.modelValue ?? innerModel.value,
  resolveSchemaField: mergedResolveSchemaField.value,
}));

/** 按 schema 批量拉一层字典（对齐 PC getDict） */
async function loadDictOptionsFromSchema(schema: SchemaFieldSet[]) {
  if (!props.autoLoadDict) {
    loadedDictOptions.value = {};
    return;
  }
  const codes = collectSchemaDictCodes(schema);
  const token = ++dictLoadToken;
  if (!codes.length) {
    loadedDictOptions.value = {};
    return;
  }
  const batch = await dictStore.getDictBatch(codes);
  if (token !== dictLoadToken) return;
  const next: Record<string, SchemaOption[]> = {};
  codes.forEach((code) => {
    const list = batch[code];
    next[code] = Array.isArray(list)
      ? list.map((item) => ({
          label: item.label,
          value: item.value,
          ...(item.parentValue != null && item.parentValue !== ''
            ? { parentValue: item.parentValue }
            : {}),
          ...(item.disabled ? { disabled: true } : {}),
        }))
      : [];
  });
  loadedDictOptions.value = next;
}

watch(
  () => [originSchema.value, props.autoLoadDict] as const,
  ([schema]) => {
    loadDictOptionsFromSchema(Array.isArray(schema) ? schema : []);
  },
  { immediate: true, deep: true },
);

const columns = computed<ProFormColumn[]>(() =>
  transformSchemaToColumns(displaySchema.value, transformOptions.value),
);

const fieldMetas = computed(() =>
  collectSchemaFieldRuntimeMetas(columns.value),
);

const formModel = computed({
  get() {
    return props.modelValue ?? innerModel.value;
  },
  set(value: Record<string, unknown>) {
    innerModel.value = value;
    emit('update:modelValue', value);
  },
});

/** 按原始 schema 重置 model 默认值 */
function resetBySchema(schema: SchemaFieldSet[] = originSchema.value) {
  const next = createModelFromSchema(schema);
  innerModel.value = next;
  linkageSnapshot.value = { ...next };
  emit('update:modelValue', next);
}

watch(
  () => props.schema,
  (schema) => {
    if (!schema) return;
    const current = props.modelValue ?? innerModel.value;
    const hasKeys = current && Object.keys(current).length > 0;
    if (!hasKeys) {
      resetBySchema(Array.isArray(schema) ? schema : []);
    }
  },
  { immediate: true, deep: true },
);

/** fieldMapping 同步 + parentField 级联清空 */
watch(
  formModel,
  (model) => {
    if (!model || typeof model !== 'object') return;
    const prev = linkageSnapshot.value;
    const changed = syncSchemaModelLinkages(model, prev, fieldMetas.value);
    linkageSnapshot.value = { ...model };
    if (changed) {
      innerModel.value = model;
      emit('update:modelValue', model);
    }
  },
  { deep: true },
);

function getModel() {
  return formModel.value;
}

/** 按原始 schema 组装提交体 { [setCode]: [{ fieldKey: value }] } */
function getSubmitPayload(schema: SchemaFieldSet[] = originSchema.value) {
  return buildSubmitPayload(schema, formModel.value);
}

function onSubmit() {
  emit('submit', {
    model: formModel.value,
    formData: getSubmitPayload(),
  });
}

function onFailed(errorInfo: unknown) {
  emit('failed', errorInfo);
}

async function validate(name?: string | string[]) {
  return proFormRef.value?.validate?.(name);
}

function submit() {
  proFormRef.value?.submit?.();
}

function resetValidation(name?: string | string[]) {
  proFormRef.value?.resetValidation?.(name);
}

defineExpose({
  proFormRef,
  validate,
  submit,
  resetValidation,
  getModel,
  getSubmitPayload,
  resetBySchema,
  getOriginSchema: () => originSchema.value,
  getColumns: () => columns.value,
  getFieldMetas: () => fieldMetas.value,
});
</script>

<style scoped lang="less">
.schema-pro-form-skeleton {
  margin: 16px;
}

/* 上传限制说明（对齐 PC UploadField *tip） */
:deep(.schema-pro-form-upload-tips) {
  font-size: 12px;
  line-height: 18px;
  color: var(--van-gray-6, #969799);

  .schema-pro-form-upload-tip + .schema-pro-form-upload-tip {
    margin-top: 2px;
  }
}
</style>
