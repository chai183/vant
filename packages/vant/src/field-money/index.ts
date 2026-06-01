import { withInstall } from '../utils';
import _FieldMoney from './FieldMoney';

export const FieldMoney = withInstall(_FieldMoney);
export default FieldMoney;
export { fieldMoneyProps } from './FieldMoney';
export type { FieldMoneyProps } from './FieldMoney';
export type { FieldMoneyThemeVars } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanFieldMoney: typeof FieldMoney;
  }
}
