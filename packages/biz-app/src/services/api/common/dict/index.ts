/**
 * 字典接口（与 PC digital-workforce/services/api/common/dict 对齐）
 * 移动端 SchemaProForm 目前只接一层：不传 parentValue
 */
import type { DictItemsResponseData } from '@/types/common/dict';
import apiClient from '@/services/api';

/**
 * 根据字典编码获取字典项
 * GET dthr-base/dict/simple/{dictCode}/items
 * @param dictCode 字典编码
 * @param parentValue 上级选中项 itemValue；一层场景不传
 * @param status 不传=仅启用；0=仅停用；-1=全量
 */
export function getDictItemsApi(
  dictCode: string,
  parentValue?: string,
  status?: number,
) {
  const params: Record<string, string | number> = {};
  if (parentValue) {
    params.parentValue = parentValue;
  }
  if (status !== undefined && status !== null && `${status}` !== '') {
    params.status = status;
  }
  return apiClient<DictItemsResponseData>({
    url: `dthr-base/dict/simple/${encodeURIComponent(dictCode)}/items`,
    method: 'get',
    params: Object.keys(params).length ? params : undefined,
  });
}
