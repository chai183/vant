/**
 * 运行时联动：fieldMapping 同步 label、parentField 级联清空
 */
import type { ProFormOption } from 'vant';
import type { SchemaProFormColumn } from './apply-type-config';
import { unwrapLabelValue } from './transform-schema-utils';

export type SchemaFieldRuntimeMeta = {
  name: string;
  propReadOnly?: string;
  parentColumnName?: string;
  options?: ProFormOption[];
};

/** 从 columns 树收集字段运行时元数据 */
export function collectSchemaFieldRuntimeMetas(
  columns: SchemaProFormColumn[] = [],
): SchemaFieldRuntimeMeta[] {
  const list: SchemaFieldRuntimeMeta[] = [];
  const walk = (nodes: SchemaProFormColumn[]) => {
    (nodes || []).forEach((column) => {
      if (Array.isArray(column.content)) {
        walk(column.content as SchemaProFormColumn[]);
      }
      const name = String(column.name || '').trim();
      // 仅收集真实表单字段（有 component）
      if (!name || !column.component) return;
      list.push({
        name,
        propReadOnly: column.propReadOnly
          ? String(column.propReadOnly)
          : undefined,
        parentColumnName: column.parentColumnName
          ? String(column.parentColumnName)
          : undefined,
        options: column.options,
      });
    });
  };
  walk(columns);
  return list;
}

export function getOptionParentFieldProp(column?: SchemaProFormColumn | null) {
  if (!column || typeof column !== 'object') return '';
  return String(column.parentColumnName || '').trim();
}

/** 收集挂在某字段下的全部下级（含孙级） */
export function collectLinkedOptionDescendants(
  metas: SchemaFieldRuntimeMeta[],
  parentProp: string,
) {
  const root = String(parentProp || '').trim();
  if (!root) return [] as SchemaFieldRuntimeMeta[];
  const byParent = new Map<string, SchemaFieldRuntimeMeta[]>();
  metas.forEach((meta) => {
    const parent = String(meta.parentColumnName || '').trim();
    if (!parent || !meta.name) return;
    const bucket = byParent.get(parent) || [];
    bucket.push(meta);
    byParent.set(parent, bucket);
  });
  const result: SchemaFieldRuntimeMeta[] = [];
  const seen = new Set<string>();
  const collect = (fromProp: string) => {
    (byParent.get(fromProp) || []).forEach((item) => {
      if (seen.has(item.name)) return;
      seen.add(item.name);
      result.push(item);
      collect(item.name);
    });
  };
  collect(root);
  return result;
}

function findOptionLabel(options: ProFormOption[] | undefined, value: unknown) {
  if (value == null || value === '' || !options?.length) return '';
  const hit = options.find((item) => String(item.value) === String(value));
  return hit?.label != null ? String(hit.label) : '';
}

function valuesEqual(a: unknown, b: unknown) {
  return (
    String(unwrapLabelValue(a) ?? '') === String(unwrapLabelValue(b) ?? '')
  );
}

/**
 * 模型变更后：同步 fieldMapping 展示字段，并在上级改选时清空子孙
 * 原地修改 model，返回是否有变更
 */
export function syncSchemaModelLinkages(
  model: Record<string, unknown>,
  prevModel: Record<string, unknown> | null | undefined,
  metas: SchemaFieldRuntimeMeta[],
) {
  if (!model || typeof model !== 'object') return false;
  let changed = false;
  const prev = prevModel && typeof prevModel === 'object' ? prevModel : {};

  metas.forEach((meta) => {
    const {name} = meta;
    if (!name) return;
    const nextVal = model[name];
    const prevVal = prev[name];
    if (valuesEqual(nextVal, prevVal)) {
      // 值未变时仍可补全缺失的 mapping 文案
      if (meta.propReadOnly && nextVal != null && nextVal !== '') {
        const unwrapped = unwrapLabelValue(nextVal);
        if (
          (model[meta.propReadOnly] == null ||
            model[meta.propReadOnly] === '') &&
          meta.options?.length
        ) {
          const label = findOptionLabel(meta.options, unwrapped);
          if (label) {
            model[meta.propReadOnly] = label;
            changed = true;
          }
        }
      }
      return;
    }

    // 值变化：写 / 清 fieldMapping
    if (meta.propReadOnly) {
      const unwrapped = unwrapLabelValue(nextVal);
      if (unwrapped == null || unwrapped === '') {
        if (model[meta.propReadOnly] !== '') {
          model[meta.propReadOnly] = '';
          changed = true;
        }
      } else {
        const label = findOptionLabel(meta.options, unwrapped);
        if (label !== '' || model[meta.propReadOnly] != null) {
          model[meta.propReadOnly] = label;
          changed = true;
        }
      }
    }

    // 上级改选：清空整条子孙链
    const descendants = collectLinkedOptionDescendants(metas, name);
    descendants.forEach((child) => {
      if (model[child.name] != null && model[child.name] !== '') {
        model[child.name] = '';
        changed = true;
      }
      if (
        child.propReadOnly &&
        model[child.propReadOnly] != null &&
        model[child.propReadOnly] !== ''
      ) {
        model[child.propReadOnly] = '';
        changed = true;
      }
    });
  });

  return changed;
}
