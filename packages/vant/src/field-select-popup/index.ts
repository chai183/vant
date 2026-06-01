import { withInstall } from '../utils';
import _FieldSelectPopup from './FieldSelectPopup';

export const FieldSelectPopup = withInstall(_FieldSelectPopup);
export default FieldSelectPopup;
export { fieldSelectPopupProps } from './FieldSelectPopup';
export type { FieldSelectPopupProps } from './FieldSelectPopup';
export type { FieldSelectPopupOption, FieldSelectPopupThemeVars } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanFieldSelectPopup: typeof FieldSelectPopup;
  }
}
