export type TagCurrencyFlagIconMap = Record<string, string>;
import { currentFlagModules } from './assets/currency-flags/index';

function getFlagSvgModules(): Array<[string, string]> {
  return currentFlagModules;
}

function parseCurrencyCodeFromPath(path: string): string | undefined {
  const filename = path.split('/').pop();
  if (!filename) return undefined;

  const basename = filename.replace(/\.svg$/i, '');
  const codeMatch = basename.match(/([A-Za-z]{3})$/);
  return codeMatch?.[1]?.toUpperCase();
}

/** 自动收集 `currency-flags` 目录下 svg，文件名末尾三位字母作为币种 code。 */
export const TAG_CURRENCY_FLAG_ICON_MAP: TagCurrencyFlagIconMap =
  getFlagSvgModules().reduce<TagCurrencyFlagIconMap>((map, [path, iconUrl]) => {
    const code = parseCurrencyCodeFromPath(path);
    if (code && iconUrl) {
      map[code] = iconUrl;
    }
    return map;
  }, {});
