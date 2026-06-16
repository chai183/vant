import { withInstall } from '../utils';
import _FilterMenuBar, {
  type FilterMenuBarProps,
  type FilterMenuBarExpose,
  type FilterMenuBarValidateError,
} from './FilterMenuBar';

export const FilterMenuBar = withInstall(_FilterMenuBar);
export default FilterMenuBar;
export { filterMenuBarProps } from './FilterMenuBar';
export type {
  FilterMenuBarProps,
  FilterMenuBarExpose,
  FilterMenuBarValidateError,
};
export type {
  FilterMenuBarCloseOptions,
  FilterMenuBarConfig,
  FilterMenuBarConfirmPayload,
  FilterMenuBarFunnelFooterSlotProps,
  FilterMenuBarItem,
  FilterMenuBarItemSlotProps,
  FilterMenuBarModel,
  FilterMenuBarPanelActions,
  FilterMenuBarPanelFooterSlotProps,
  FilterMenuBarTitleIconSlotProps,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanFilterMenuBar: typeof FilterMenuBar;
  }
}
