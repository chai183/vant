# Currency Flag SVGs

将币种对应国家/地区旗帜 SVG 放在此目录（例如 `USD.svg`、`EUR.svg`、`CNY.svg`）。

放置后请在 `../../currency-flag-icons.ts` 中引入并建立映射：

```ts
import usd from './assets/currency-flags/USD.svg';

export const TAG_CURRENCY_FLAG_ICON_MAP = {
  USD: usd,
};
```

当 `currency` + `currency-code` 命中该映射时，Tag 会优先使用对应 SVG；否则回退到 `currency-presets.json` 的 `icon` / `defaultIcon`。
