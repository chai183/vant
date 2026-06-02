import { withInstall } from '../utils';
import _BottomActionBar from './BottomActionBar';

export const BottomActionBar = withInstall(_BottomActionBar);
export default BottomActionBar;
export { bottomActionBarProps } from './BottomActionBar';
export type { BottomActionBarProps } from './BottomActionBar';
export type {
  BottomActionBarMoreIconPosition,
  BottomActionBarMoreOptions,
  BottomActionBarThemeVars,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanBottomActionBar: typeof BottomActionBar;
  }
}
