export type TagCurrencyFlagIconMap = Record<string, string>;
import { currencyFlagModules } from './assets/currency-flags';
// 获取对应目录下的svg
function getFlagSvgModules(): Array<[string, string]> {
  return currencyFlagModules;
}

// 读末尾的code 码
function parseCurrencyCodeFromPath(path: string): string | undefined {
  const filename = path.split('/').pop();
  if (!filename) return undefined;

  const basename = filename.replace(/\.svg$/i, '');
  const codeMatch = basename.match(/([A-Za-z]{3})$/);
  return codeMatch?.[1]?.toUpperCase();
}

// 导出 {code:iconurl}的 map
export const TAG_CURRENCY_FLAG_ICON_MAP: TagCurrencyFlagIconMap =
  getFlagSvgModules().reduce<TagCurrencyFlagIconMap>((map, [path, iconUrl]) => {
    const code = parseCurrencyCodeFromPath(path);
    if (code && iconUrl) {
      map[code] = iconUrl;
    }
    return map;
  }, {});

/** 未命中时回退 `currency-presets.json` 顶层 defaultIcon。 */
