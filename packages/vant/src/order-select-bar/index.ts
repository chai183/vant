import { withInstall } from '../utils';
import _OrderSelectBar, { OrderSelectBarProps } from './OrderSelectBar';

export const OrderSelectBar = withInstall(_OrderSelectBar);
export default OrderSelectBar;
export { orderSelectBarProps } from './OrderSelectBar';
export type { OrderSelectBarProps };
export type { OrderSelectBarThemeVars } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanOrderSelectBar: typeof OrderSelectBar;
  }
}
