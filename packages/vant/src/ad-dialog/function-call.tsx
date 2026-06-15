import { extend, inBrowser, type ComponentInstance } from '../utils';
import { mountComponent, usePopupState } from '../utils/mount-component';
import AdDialog from './AdDialog';
import type { AdDialogOptions } from './types';

let instance: ComponentInstance;

// 函数式 API 共用这一份默认配置。
const DEFAULT_OPTIONS: AdDialogOptions = {
  overlay: true,
  width: undefined,
  height: undefined,
  image: '',
  imageStyle: undefined,
  imageClass: '',
  swipeProps: undefined,
  checked: false,
  showCheckbox: true,
  checkboxText: '今日不再提醒',
  checkboxDisabled: false,
  closeIcon: 'cross',
  closeIconPosition: 'bottom-center',
  closeIconMode: 'outside',
  closeOnClickOverlay: false,
  closeOnPopstate: true,
  destroyOnClose: false,
  className: '',
  style: undefined,
  'onUpdate:checked': undefined,
  onOpen: undefined,
  onClose: undefined,
  onClickImage: undefined,
  onClickCloseIcon: undefined,
};

let currentOptions = extend({}, DEFAULT_OPTIONS);

function initInstance() {
  const Wrapper = {
    setup() {
      const { state, toggle } = usePopupState();

      // 函数式调用没有父组件接住 v-model:checked，这里手动回写最新勾选值。
      const onUpdateChecked = (value: boolean) => {
        state.checked = value;
        state['onUpdate:checked']?.(value);
      };

      return () => (
        <AdDialog
          {...state}
          onUpdate:show={toggle}
          onUpdate:checked={onUpdateChecked}
        />
      );
    },
  };

  ({ instance } = mountComponent(Wrapper));
}

/**
 * 展示广告弹窗
 */
export const showAdDialog = (options: AdDialogOptions = {}) => {
  /* istanbul ignore if */
  if (!inBrowser) {
    return;
  }

  if (!instance) {
    initInstance();
  }

  instance.open(extend({}, currentOptions, options));

  return instance;
};

/**
 * 关闭当前展示的广告弹窗
 */
export const closeAdDialog = () => {
  if (instance) {
    instance.toggle(false);
  }
};

/**
 * 修改默认配置，影响所有的 `showAdDialog` 调用
 */
export const setAdDialogDefaultOptions = (options: AdDialogOptions) => {
  extend(currentOptions, options);
};

/**
 * 重置默认配置，影响所有的 `showAdDialog` 调用
 */
export const resetAdDialogDefaultOptions = () => {
  currentOptions = extend({}, DEFAULT_OPTIONS);
};
