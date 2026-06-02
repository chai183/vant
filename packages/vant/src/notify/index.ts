import { withInstall } from '../utils';
import _Notify from './Notify';

export const Notify = withInstall(_Notify);
export default Notify;
export { notifyProps, NOTIFY_BUTTON_TEXT_MAX_LENGTH } from './Notify';
export {
  showNotify,
  showPersistentNotify,
  closeNotify,
  getNotifyAutoCloseDuration,
  setNotifyDefaultOptions,
  resetNotifyDefaultOptions,
} from './function-call';

export type { NotifyProps } from './Notify';
export type { NotifyType, NotifyOptions, NotifyThemeVars } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanNotify: typeof Notify;
  }
}
