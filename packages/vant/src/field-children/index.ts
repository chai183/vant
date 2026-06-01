import { withInstall } from '../utils';
import _FieldChildren from './FieldChildren';

export const FieldChildren = withInstall(_FieldChildren);
export default FieldChildren;
export { fieldChildrenProps } from './FieldChildren';
export type { FieldChildrenProps } from './FieldChildren';
export type {
  FieldChildrenExpose,
  FieldChildrenInstance,
  FieldChildrenThemeVars,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanFieldChildren: typeof FieldChildren;
  }
}
