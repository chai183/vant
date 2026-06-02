import { extend, isObject, inBrowser, type ComponentInstance } from '../utils';
import { mountComponent, usePopupState } from '../utils/mount-component';
import VanNotify from './Notify';
import { getNotifyAutoCloseDuration } from './duration';
import type { NotifyMessage, NotifyOptions } from './types';

export { getNotifyAutoCloseDuration } from './duration';

let timer: ReturnType<typeof setTimeout>;
let instance: ComponentInstance;

const parseOptions = (message: NotifyMessage | NotifyOptions) =>
  isObject(message) ? message : { message };

function initInstance() {
  ({ instance } = mountComponent({
    setup() {
      const { state, toggle } = usePopupState();
      return () => <VanNotify {...state} onUpdate:show={toggle} />;
    },
  }));
}

const getDefaultOptions = (): NotifyOptions => ({
  type: 'warning',
  color: undefined,
  message: '',
  onClose: undefined,
  onClick: undefined,
  onOpened: undefined,
  onClickAction: undefined,
  onClickButton: undefined,
  duration: 3000,
  persistent: false,
  position: undefined,
  className: '',
  lockScroll: false,
  background: undefined,
  leftIcon: undefined,
  actionText: undefined,
  buttonText: undefined,
  closeable: false,
  wrapable: false,
  scrollable: false,
  plain: false,
  speed: 60,
  scrollDelay: 1500,
});

let currentOptions = getDefaultOptions();

/**
 * Close the currently displayed Notify
 */
export const closeNotify = () => {
  if (instance) {
    instance.toggle(false);
  }
};

/**
 * Display Notify at the top of the page
 */
export function showNotify(options: NotifyMessage | NotifyOptions = {}) {
  if (!inBrowser) {
    return;
  }

  if (!instance) {
    initInstance();
  }

  const parsed = extend({}, currentOptions, parseOptions(options));
  const autoCloseDuration = getNotifyAutoCloseDuration(parsed);

  instance.open(parsed);
  clearTimeout(timer);

  if (autoCloseDuration > 0) {
    timer = setTimeout(() => {
      closeNotify();
      parsed.onClose?.();
    }, autoCloseDuration);
  }

  return instance;
}

/**
 * 展示常驻 Notify，不会自动消失，需手动调用 closeNotify 或配置 closeable
 */
export function showPersistentNotify(
  options: NotifyMessage | NotifyOptions = {},
) {
  return showNotify(extend(parseOptions(options), { persistent: true }));
}

/**
 * Modify the default configuration, affecting all `showNotify` calls
 */
export const setNotifyDefaultOptions = (options: NotifyOptions) =>
  extend(currentOptions, options);

/**
 * Reset the default configuration, affecting all `showNotify` calls
 */
export const resetNotifyDefaultOptions = () => {
  currentOptions = getDefaultOptions();
};
