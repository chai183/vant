import type { CSSProperties } from 'vue';
import type { SwipeProps } from '../swipe';
import type { Numeric } from '../utils';

export type AdDialogCloseIconPresetPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left';

export type AdDialogCloseIconCustomPosition = Partial<
  Record<'top' | 'right' | 'bottom' | 'left', Numeric>
>;

export type AdDialogCloseIconPosition =
  | AdDialogCloseIconPresetPosition
  | AdDialogCloseIconCustomPosition;

export type AdDialogCloseIconMode = 'outside' | 'inside';

// 仅开放广告轮播常用配置，避免把 Swipe 的全部能力都透传出去。
export type AdDialogSwipeProps = Partial<
  Pick<
    SwipeProps,
    | 'loop'
    | 'vertical'
    | 'autoplay'
    | 'duration'
    | 'touchable'
    | 'lazyRender'
    | 'initialSwipe'
    | 'indicatorColor'
    | 'showIndicators'
    | 'stopPropagation'
  >
>;

export type AdDialogOptions = {
  overlay?: boolean;
  width?: Numeric;
  height?: Numeric;
  // 传字符串时展示单图，传数组时按轮播广告处理。
  image?: string | string[];
  imageStyle?: CSSProperties;
  imageClass?: unknown;
  // 仅在 image 为多图时生效。
  swipeProps?: AdDialogSwipeProps;
  checked?: boolean;
  showCheckbox?: boolean;
  checkboxText?: string;
  checkboxDisabled?: boolean;
  closeIcon?: string;
  closeIconPosition?: AdDialogCloseIconPosition;
  closeIconMode?: AdDialogCloseIconMode;
  closeOnClickOverlay?: boolean;
  closeOnPopstate?: boolean;
  destroyOnClose?: boolean;
  className?: unknown;
  style?: CSSProperties;
  'onUpdate:checked'?: (value: boolean) => void;
  onOpen?: () => void;
  onClose?: (checked: boolean) => void;
  onClickImage?: (event: MouseEvent) => void;
  onClickCloseIcon?: (checked: boolean, event: MouseEvent) => void;
};

// AdDialogThemeVars 仅包含组件内部会用到的样式变量，用户可以通过 CSS 变量覆盖它们来定制组件样式。
export type AdDialogThemeVars = {
  adDialogWidth?: string;
  adDialogCheckboxPadding?: string;
  adDialogCheckboxFontSize?: string;
  adDialogCheckboxTextColor?: string;
  adDialogCloseIconMargin?: string;
  adDialogCloseButtonSize?: string;
  adDialogCloseButtonBackground?: string;
  adDialogCloseButtonBorderColor?: string;
  adDialogCloseIconSize?: string;
  adDialogCloseIconColor?: string;
};
