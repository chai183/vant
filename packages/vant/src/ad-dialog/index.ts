import { withInstall } from '../utils';
import _AdDialog from './AdDialog';

export const AdDialog = withInstall(_AdDialog);
export default AdDialog;
export { adDialogProps } from './AdDialog';
export {
  showAdDialog,
  closeAdDialog,
  setAdDialogDefaultOptions,
  resetAdDialogDefaultOptions,
} from './function-call';

export type { AdDialogProps } from './AdDialog';
export type {
  AdDialogOptions,
  AdDialogThemeVars,
  AdDialogSwipeProps,
  AdDialogCloseIconMode,
  AdDialogCloseIconPosition,
  AdDialogCloseIconPresetPosition,
  AdDialogCloseIconCustomPosition,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanAdDialog: typeof AdDialog;
  }
}
