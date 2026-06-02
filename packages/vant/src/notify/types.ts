import type { TeleportProps } from 'vue';
import type { Numeric } from '../utils';

export type NotifyMessage = Numeric;

export type NotifyType = 'primary' | 'success' | 'danger' | 'warning';

export type NotifyPosition = 'top' | 'bottom';

export type NotifyOptions = {
  type?: NotifyType;
  color?: string;
  message?: NotifyMessage;
  duration?: number;
  /** 为 true 时常驻展示，不会自动消失 */
  persistent?: boolean;
  zIndex?: number;
  position?: NotifyPosition;
  className?: unknown;
  background?: string;
  lockScroll?: boolean;
  teleport?: TeleportProps['to'];
  leftIcon?: string;
  actionText?: string;
  buttonText?: string;
  closeable?: boolean;
  wrapable?: boolean;
  /** 为 true 时文案超出一行将自动向上滚动；为 false 时最多展示两行，超出省略 */
  scrollable?: boolean;
  speed?: Numeric;
  scrollDelay?: number;
  onClick?: (event: MouseEvent) => void;
  onClose?: () => void;
  onOpened?: () => void;
  onClickAction?: (event: MouseEvent) => void;
  onClickButton?: (event: MouseEvent) => void;
};

export type NotifyThemeVars = {
  notifyTextColor?: string;
  notifyPadding?: string;
  notifyWidth?: string;
  notifyTopOffset?: string;
  notifyShadow?: string;
  notifyFontSize?: string;
  notifyLineHeight?: number | string;
  notifyHeight?: string;
  notifyRadius?: string;
  notifyBackground?: string;
  notifyIconSize?: string;
  notifyIconGap?: string;
  notifyPrimaryColor?: string;
  notifySuccessColor?: string;
  notifyDangerColor?: string;
  notifyWarningColor?: string;
  notifyActionColor?: string;
  notifyPlainColor?: string;
  notifyScrollHeight?: string;
};
