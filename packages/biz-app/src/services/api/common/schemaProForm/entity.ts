import type { SchemaOption } from '@/_components/SchemaProForm/apply-type-config';

/** PC 的树形选项在移动列表中保留路径；职级仅叶子、人员仅人员可选。 */
export function toSchemaDataSourceOptions(
  body: unknown,
  source: string,
): SchemaOption[] {
  const value =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const raw =
    source === 'socialSecurityPlan'
      ? value.siBenefitList
      : source === 'providentFundPlan'
        ? value.hfBenefitList
        : body;
  const record =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const roots = Array.isArray(raw)
    ? raw
    : (record.records ?? record.list ?? []);
  const options: SchemaOption[] = [];
  function walk(nodes: unknown, parents: string[] = []) {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((node: Record<string, unknown>) => {
      if (!node || typeof node !== 'object') return;
      const children = node.childrenOrgs ?? node.children ?? node.child;
      const hasChildren = Array.isArray(children) && children.length > 0;
      const id = node.id ?? node.itemid ?? node.itemId ?? node.value;
      const label =
        node.orgName ??
        node.positionName ??
        node.jobTitleName ??
        node.jobCategoryName ??
        node.name ??
        node.itemName ??
        node.positionGradeName ??
        node.gradeName ??
        node.label;
      const path = label ? [...parents, String(label)] : parents;
      const selectable =
        source === 'grade' || source === 'grade-cascade'
          ? !hasChildren
          : source === 'orgUser'
            ? String(node.type).toLowerCase() === 'user'
            : source === 'position-enable'
              ? Number(node.positionState) === 1
              : true;
      if (selectable && id != null && id !== '' && label) {
        options.push({ label: path.join(' / '), value: String(id) });
      }
      walk(children, path);
    });
  }
  walk(roots);
  return options;
}
