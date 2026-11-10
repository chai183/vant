/**
 * 字典 Mock（对齐 PC GET /api/dthr-base/dict/simple/{dictCode}/items）
 * 数据复用 onboarding SCHEMA_DICT_OPTIONS，转成后端 DictItemVO
 */
import type { MockMethod } from 'vite-plugin-mock';
import { SCHEMA_DICT_OPTIONS } from '@/services/api/employee/employment/onboarding/schema-dict';

function unifiedSuccess<T>(body: T) {
  return {
    body,
    data: body,
    errorCode: '000000',
    errorMsg: '操作成功',
    success: true,
  };
}

/** label/value 本地表 → 后端 VO */
function toDictItemVO(
  dictCode: string,
  options: Array<{
    label: string;
    value: string | number;
    parentValue?: string | number;
  }>,
) {
  return options.map((item, index) => ({
    id: `${dictCode}-${item.value}`,
    dictCode,
    itemValue: String(item.value),
    itemLabel: item.label,
    parentValue:
      item.parentValue == null || item.parentValue === ''
        ? null
        : String(item.parentValue),
    level: 1,
    leafFlag: true,
    sortNo: index + 1,
    status: 1,
  }));
}

const mocks: MockMethod[] = [
  {
    // 与 PC 一致：GET /api/dthr-base/dict/simple/{dictCode}/items
    // vite-plugin-mock 类型只声明 string，运行时支持 RegExp
    url: /\/api\/dthr-base\/dict\/simple\/([^/]+)\/items/ as unknown as string,
    method: 'get',
    response: ({
      url,
      query,
    }: {
      url?: string;
      query?: { parentValue?: string; status?: string | number };
    }) => {
      const matched = String(url || '').match(
        /\/api\/dthr-base\/dict\/simple\/([^/?]+)\/items/,
      );
      const dictCode = matched?.[1] ? decodeURIComponent(matched[1]) : '';
      const raw = SCHEMA_DICT_OPTIONS[dictCode] || [];
      let list = toDictItemVO(dictCode, raw);

      // 一层为主；若带 parentValue 则按上级过滤（便于联调）
      const parentValue = query?.parentValue;
      if (parentValue != null && String(parentValue).trim() !== '') {
        const parentText = String(parentValue);
        list = list.filter((item) => String(item.parentValue) === parentText);
      }

      return unifiedSuccess(list);
    },
  },
];

export default mocks;
