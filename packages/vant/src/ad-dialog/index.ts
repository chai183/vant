// src_index.ts

import { withInstall } from '../utils';
import _AdDialog from './AdDialog';

export const AdDialog = withInstall(_AdDialog);
export default AdDialog;
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
  AdDialogCloseIconnCustomPosition,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanAdDialog: typeof AdDialog;
  }
}
