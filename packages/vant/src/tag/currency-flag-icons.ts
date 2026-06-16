export type TagCurrencyFlagIconMap = Record<string, string>;

/** 未命中时回退 `currency-presets.json` 顶层 defaultIcon。 */
type WebpackRequireContext = {
  keys: () => string[];
  <T = string>(id: string): T;
};

declare const require: {
  context: (
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp,
  ) => WebpackRequireContext;
};

function getFlagSvgModules(): Array<[string, string]> {
  const context = require.context('./assets/currency-flags', false, /\.svg$/i);
  return context.keys().map((path) => {
    const mod = context<string | { default?: string }>(path);
    const iconUrl = typeof mod === 'string' ? mod : (mod.default ?? '');
    return [path, iconUrl] as [string, string];
  });
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
