import { withInstall } from '../utils';
import _OrderSelectBar from './OrderSelectBar';

export const OrderSelectBar = withInstall(_OrderSelectBar);
export default OrderSelectBar;
export { orderSelectBarProps } from './OrderSelectBar';
export type { OrderSelectBarProps } from './OrderSelectBar';
export type { OrderSelectBarThemeVars } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanOrderSelectBar: typeof OrderSelectBar;
  }
}
