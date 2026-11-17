/**
 * 字典 Mock（对齐 PC GET /api/dthr-base/dict/simple/{dictCode}/items）
 * 档案/花名册编码使用 PC 同源样本；其余编码保留入职演示样本。
 */
import type { MockMethod } from 'vite-plugin-mock';
import { SCHEMA_DICT_OPTIONS } from '@/services/api/employee/employment/onboarding/schema-dict';
import { schemaDictMockData } from './data';

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
    response: ({ url }: { url?: string }) => {
      const matched = String(url || '').match(
        /\/api\/dthr-base\/dict\/simple\/([^/?]+)\/items/,
      );
      const dictCode = matched?.[1] ? decodeURIComponent(matched[1]) : '';
      const raw = SCHEMA_DICT_OPTIONS[dictCode] || [];
      const list = schemaDictMockData[dictCode] || toDictItemVO(dictCode, raw);

      return unifiedSuccess(list);
    },
  },
];

export default mocks;
