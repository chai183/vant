/**
 * 币种标签预制数据（与 `currency-presets.json` 配套）。
 *
 * 使用场景：`<van-tag currency currency-code="USD" />` 时，Tag 会调用
 * `getTagCurrencyPreset('USD')` 取中文名和左侧图标。
 *
 * 图标解析顺序（每条币种最终都会有一个 `icon` 字符串）：
 * 1. JSON 里该项的 `icon` 字段（若写了）
 * 2. `currency-flag-icons.ts` 里按 code 配的国旗 SVG
 * 3. JSON 顶层的 `defaultIcon`（如 `gold-coin-o`）
 */

import { currencyRaw } from './currency-presets-json';
import {
  TAG_CURRENCY_FLAG_ICON_MAP,
  type TagCurrencyFlagIconMap,
} from './currency-flag-icons';

/** JSON 里 `currencies` 数组的单项结构 */
export type TagCurrencyPresetItem = {
  /** ISO 4217 等三字母代码，如 `USD`、`CNY` */
  code: string;
  /** 中文展示名，如「美元」 */
  labelZh: string;
  /** 可选。备注说明（如 ISO 已撤回的历史兼容代码），不参与 Tag 展示 */
  des?: string;
  /**
   * 可选。左侧图标：Vant Icon 名（如 `gold-coin-o`）或图片 URL。
   * 不传则走「国旗映射 → defaultIcon」。
   */
  icon?: string;
};

/** `currency-presets.json` 根对象类型 */
export type TagCurrencyPresetsPayload = {
  /** 所有币种都未单独配置 icon、且未命中国旗映射时的默认图标 */
  defaultIcon: string;
  /** 数据集说明，仅文档用，运行时不用 */
  description?: string;
  /** 全量币种列表 */
  currencies: TagCurrencyPresetItem[];
};

/**
 * 原始 JSON 对象（只读数据源，一般不必直接使用）。
 *
 * 传：无（模块加载时从 JSON 导入）
 * 返：`{ defaultIcon, description?, currencies[] }`
 */
export const TAG_CURRENCY_PRESETS_PAYLOAD =
  currencyRaw as TagCurrencyPresetsPayload;

/**
 * 国旗 SVG 映射表的别名，等同 `currency-flag-icons.ts` 的 `TAG_CURRENCY_FLAG_ICON_MAP`。
 *
 * 传：无
 * 返：`Record<大写代码, 图片URL>`，例如 `{ USD: '/xxx.svg' }`；未配置的 code 无键
 */
export const TAG_CURRENCY_FLAG_ICONS: TagCurrencyFlagIconMap =
  TAG_CURRENCY_FLAG_ICON_MAP;

/**
 * 解析后的全量币种列表（启动时算好，每条都有确定的 `icon`）。
 *
 * 传：无
 * 返：只读数组，元素为 `{ code, labelZh, icon }`（`icon` 已按优先级填好）
 *
 * 用途：Demo 下拉、文档列举、遍历所有支持的币种代码。
 */
export const TAG_CURRENCY_PRESET_LIST: ReadonlyArray<
  TagCurrencyPresetItem & { icon: string }
> = TAG_CURRENCY_PRESETS_PAYLOAD.currencies.map((item) => {
  const code = item.code.toUpperCase();
  return {
    ...item,
    icon:
      item.icon ??
      TAG_CURRENCY_FLAG_ICONS[code] ??
      TAG_CURRENCY_PRESETS_PAYLOAD.defaultIcon,
  };
});

/**
 * 按币种代码快速查找的 Map（key 已统一为大写）。
 *
 * 传：无
 * 返：`Map<string, { code, labelZh, icon }>`，例如 `map.get('USD')`
 *
 * 用途：O(1) 查单条；`getTagCurrencyPreset` 内部就是用这个 Map。
 */
export const TAG_CURRENCY_PRESET_MAP = new Map(
  TAG_CURRENCY_PRESET_LIST.map((row) => [
    row.code.toUpperCase(),
    row as TagCurrencyPresetItem & { icon: string },
  ]),
);

/**
 * 类型别名：表示「JSON 里出现过的 code 字符串」。
 * 实际仍是 `string`，用于 TS 提示；全集见 `currency-presets.json`。
 */
export type TagCurrencyCode = TagCurrencyPresetItem['code'];

/**
 * 根据币种代码查一条预制配置（Tag 组件内部用这个）。
 *
 * @param code - 三字母代码，大小写不敏感，如 `'usd'`、`'CNY'`；`undefined` / `''` 视为未传
 * @returns 命中：`{ code, labelZh, icon }`（code 为大写）；未命中或空参数：`null`
 *
 * @example
 * getTagCurrencyPreset('USD')
 * // => { code: 'USD', labelZh: '美元', icon: 'gold-coin-o' } 或国旗 URL
 *
 * getTagCurrencyPreset('XXX')
 * // => null
 */
export function getTagCurrencyPreset(code: string | undefined): Readonly<
  TagCurrencyPresetItem & {
    icon: string;
  }
> | null {
  if (code === undefined || code === '') return null;
  return TAG_CURRENCY_PRESET_MAP.get(code.trim().toUpperCase()) ?? null;
}
