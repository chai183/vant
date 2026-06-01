import { withInstall } from '../utils';
import _AreaStepCascader from './AreaStepCascader';

export const AreaStepCascader = withInstall(_AreaStepCascader);
export default AreaStepCascader;
export { areaStepCascaderProps } from './AreaStepCascader';
export type { AreaStepCascaderProps } from './AreaStepCascader';
export type { AreaStepCascaderThemeVars } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanAreaStepCascader: typeof AreaStepCascader;
  }
}
