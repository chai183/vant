import { withInstall } from '../utils';
import _Anchor from './Anchor';

export const Anchor = withInstall(_Anchor);
export default Anchor;
export { anchorProps } from './Anchor';

export type { AnchorProps } from './Anchor';
export type {
  AnchorThemeVars,
  AnchorType,
  AnchorMode,
  AnchorItem,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanAnchor: typeof Anchor;
  }
}
