<template>
  <div class="archive-editor">
    <van-empty
      v-if="!schema.groupList.length"
      description="没有可展示的编辑字段"
    />
    <section
      v-for="(record, index) in drafts"
      :key="record.key"
      class="archive-editor-record"
    >
      <div v-if="multi" class="archive-editor-head">
        <strong>{{ schema.setName }} {{ index + 1 }}</strong>
        <button
          v-if="!record.id"
          type="button"
          class="archive-editor-remove"
          :disabled="disabled"
          :aria-label="`删除${schema.setName}${index + 1}`"
          @click="emit('remove', record.key)"
        >
          <van-icon name="delete-o" />
        </button>
        <span
          v-if="pending.some((item) => item.recordId === record.id)"
          class="archive-editor-pending"
          >审批中</span
        >
      </div>
      <div
        v-for="group in schema.groupList"
        :key="group.groupCode"
        class="archive-editor-group"
      >
        <SchemaProForm
          :ref="(form) => utils.setForm(record.key, group.groupCode, form)"
          v-model="record.groups[group.groupCode]"
          :schema="[
            { ...schema, setName: '', singleDataFlag: 1, groupList: [group] },
          ]"
          :map-group-name-as-set-name="false"
          :show-group-name="true"
          :show-submit="false"
          :disabled="disabled"
          :resolve-schema-field="
            (field, column) =>
              resolveField(record, group.groupCode, field, column)
          "
        />
      </div>
    </section>
    <van-button
      v-if="canAdd"
      class="archive-editor-add"
      type="primary"
      plain
      borderless
      icon="plus"
      :disabled="disabled"
      @click="emit('add')"
      >新增{{ schema.setName }}</van-button
    >
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { ProFormColumn, FieldValidateError, FormInstance } from 'vant';
import SchemaProForm from '@/_components/SchemaProForm';
import type { SchemaFieldItem } from '@/_components/SchemaProForm/types';
import { buildSchemaFieldColumn } from '@/_components/SchemaProForm/transform-schema';
import type {
  ArchiveDraft,
  ArchiveSchema,
  ArchivePending,
} from '@/types/employeeArchive';
import { archiveFieldLocked } from '../../utils/permissions';

/** 每个原分组独立绑定，保留同名银行卡字段及原信息集控件。 */
const props = defineProps<{
  drafts: ArchiveDraft[];
  schema: ArchiveSchema;
  multi: boolean;
  pending: ArchivePending[];
  canAdd: boolean;
  disabled: boolean;
}>();
const emit = defineEmits<{ add: []; remove: [key: string] }>();
/** 当前已挂载表单；折叠隐藏字段仍参与表单校验。 */
const forms = new Map<
  string,
  {
    validate: () => Promise<void>;
    proFormRef?: Pick<FormInstance, 'scrollToField'>;
  }
>();

const utils = {
  setForm(key: string, groupCode: string, instance: unknown) {
    const name = JSON.stringify([key, groupCode]);
    if (instance)
      forms.set(name, instance as NonNullable<ReturnType<typeof forms.get>>);
    else forms.delete(name);
  },
  async validate() {
    const results = await Promise.all(
      [...forms.values()].map((form) =>
        form.validate().then(
          () => null,
          (errors: FieldValidateError[]) => ({ form, errors }),
        ),
      ),
    );
    const first = results.find((result) => result);
    const name = first?.errors?.[0]?.name;
    if (name != null)
      first?.form.proFormRef?.scrollToField(String(name), { block: 'center' });
    return !first;
  },
};

function resolveField(
  record: ArchiveDraft,
  groupCode: string,
  field: SchemaFieldItem,
  column: ProFormColumn,
): Partial<ProFormColumn> {
  const metadata = props.schema.groupList
    .find((group) => group.groupCode === groupCode)
    ?.fieldList.find((item) => item.columnName === field.columnName);
  const locked =
    props.disabled ||
    field.disabled ||
    metadata?.permission !== 'editable' ||
    archiveFieldLocked(
      props.pending,
      record.id,
      groupCode,
      field.columnName,
      props.multi,
    );
  // 通用表单的业务默认选项不作为档案真实字典；始终从原元数据重新构建此列。
  const config = field.typeConfigJson as { dictCode?: string; dictId?: string };
  const dictCode = config?.dictCode || config?.dictId;
  const original = buildSchemaFieldColumn(field, {
    model: record.groups[groupCode],
    ...(dictCode && column.options
      ? { dictOptions: { [dictCode]: column.options } }
      : {}),
  });
  const isUpload = ['IMAGE', 'IMG', 'FILE'].includes(field.fieldType);
  return {
    ...original,
    options: original.options || [],
    component: original.component,
    fieldProps: {
      ...original.fieldProps,
      readonly: locked,
      disabled: locked,
      ...(locked ? { rules: [], required: false } : {}),
    },
    componentProps: {
      ...original.componentProps,
      options: original.options || [],
      readonly: locked,
      disabled: locked,
      ...(isUpload ? { deletable: !locked } : {}),
    },
    fieldSlots: {
      ...column.fieldSlots,
      ...original.fieldSlots,
      ...(metadata?.permission === 'editable' && metadata.needsApproval === true
        ? {
            'label-suffix': () =>
              h(
                'div',
                {
                  class: 'archive-editor-approval',
                  title: '修改后需要 HR 审批',
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    width: '16px',
                    height: '16px',
                    marginLeft: '6px',
                    borderRadius: '2px',
                    background: '#FFF2E9',
                    color: 'var(--van-primary-color)',
                    fontSize: '12px',
                    lineHeight: '16px',
                  },
                },
                '审',
              ),
          }
        : {}),
    },
  };
}

defineExpose({ validate: utils.validate });
</script>

<style scoped lang="less">
.archive-editor-record + .archive-editor-record {
  margin-top: 12px;
}
.archive-editor-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--van-background-2);
  font-size: 14px;
}
.archive-editor-head strong {
  font-weight: 500;
}
.archive-editor-remove {
  display: flex;
  border: 0;
  padding: 4px;
  background: transparent;
  color: var(--van-text-color-secondary);
  font-size: 18px;
}
.archive-editor-pending {
  margin-left: auto;
  color: var(--van-primary-color);
  font-size: 12px;
}
.archive-editor-group + .archive-editor-group {
  margin-top: 12px;
}
.archive-editor-add {
  width: 100%;
  margin-top: 12px;
}
</style>
