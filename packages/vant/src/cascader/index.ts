import { withInstall } from '../utils';
import _Cascader from './Cascader';

export const Cascader = withInstall(_Cascader);
export default Cascader;
export { cascaderProps } from './Cascader';
export type { CascaderProps } from './Cascader';
export type {
  CascaderOption,
  CascaderTab,
  CascaderThemeVars,
  CascaderFieldNames,
  CascaderTabLayout,
  CascaderStepTitleSlotParams,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanCascader: typeof Cascader;
  }
}
