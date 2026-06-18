# Tag `assets`

- **`stamp-frame1.svg`**：印章外框蒙版（`currentColor`）。用于**单行**文案（字数 ≤ 5，与 `Tag.formatStampLines` 一致）。
- **`stamp-frame2.svg`**：印章外框蒙版，用于**换行**文案（字数 > 5，两行：首行 4 字）。默认同 `stamp-frame1.svg`，可按设计替换为更适合双行排版的形状。

- **`../currency-presets.json`**：币种预制（ISO 代码、`labelZh`、`defaultIcon`；单项可增 `icon`），供 `currency-code` 使用。
- **`currency-flags/*.svg`**：可选的币种国旗 SVG 资源目录。放置文件后，在 `../currency-flag-icons.ts` 建立代码到文件 URL 的映射（如 `USD: usdSvg`）即可生效。
