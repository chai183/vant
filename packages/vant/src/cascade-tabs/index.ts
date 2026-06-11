import { withInstall } from '../utils';
import _CascadeTabs from './CascadeTabs';

export const CascadeTabs = withInstall(_CascadeTabs);
export default CascadeTabs;
export { cascadeTabsProps } from './CascadeTabs';
export type { CascadeTabsProps } from './CascadeTabs';
export type {
  CascadeTabOption,
  CascadeTabsActivePath,
  CascadeTabsChangeParams,
  CascadeTabsInstance,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanCascadeTabs: typeof CascadeTabs;
  }
}
