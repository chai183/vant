import { withInstall } from '../utils';
import _CascadeTreeSelect from './CascadeTreeSelect';

export const CascadeTreeSelect = withInstall(_CascadeTreeSelect);
export default CascadeTreeSelect;
export { cascadeTreeSelectProps } from './CascadeTreeSelect';
export type { CascadeTreeSelectProps } from './CascadeTreeSelect';
export type {
  CascadeTreeSelectOption,
  CascadeTreeSelectFieldNames,
  CascadeTreeSelectEventParams,
  CascadeTreeSelectThemeVars,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanCascadeTreeSelect: typeof CascadeTreeSelect;
  }
}
