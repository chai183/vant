import { withInstall } from '../utils';
import _Tag from './Tag';

export const Tag = withInstall(_Tag);
export default Tag;
export { tagProps } from './Tag';
export type { TagProps } from './Tag';
export type {
  TagSize,
  TagType,
  TagPreset,
  TagStampType,
  TagThemeVars,
} from './types';
export type {
  TagCurrencyCode,
  TagCurrencyPresetItem,
  TagCurrencyPresetsPayload,
} from './currency-presets';
export type { TagCurrencyFlagIconMap } from './currency-flag-icons';
export {
  TAG_CURRENCY_FLAG_ICONS,
  TAG_CURRENCY_PRESET_LIST,
  TAG_CURRENCY_PRESET_MAP,
  TAG_CURRENCY_PRESETS_PAYLOAD,
  getTagCurrencyPreset,
} from './currency-presets';
export { TAG_CURRENCY_FLAG_ICON_MAP } from './currency-flag-icons';

declare module 'vue' {
  export interface GlobalComponents {
    VanTag: typeof Tag;
  }
}
