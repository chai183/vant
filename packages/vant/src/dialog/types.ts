import type { CSSProperties, TeleportProps } from 'vue';
import type { HighlightProps } from '../highlight';
import type {
  FieldRule,
  FieldType,
  FieldTextAlign,
  FieldClearTrigger,
  FieldFormatTrigger,
  FieldAutosizeConfig,
  FieldEnterKeyHint,
} from '../field';
import type { Interceptor, Numeric } from '../utils';

export type DialogTheme = 'default' | 'round-button';
export type DialogAction =
  | 'confirm'
  | 'cancel'
  | (string & Record<never, never>);
export type DialogMessage = string | (() => JSX.Element);
export type DialogMessageAlign = 'left' | 'center' | 'right' | 'justify';
export type DialogInputType = Extract<FieldType, 'text' | 'textarea'>;
export type DialogInputValidateTrigger = 'onBlur' | 'onChange' | 'onConfirm';

export type DialogButton = {
  action: DialogAction;
  text: string;
  color?: string;
  disabled?: boolean;
  className?: string;
  [key: PropertyKey]: any;
};

// Dialog 消息高亮配置：复用 Highlight 的匹配能力，并补充便捷样式设置。
export type DialogMessageHighlightConfig = Partial<
  Pick<
    HighlightProps,
    | 'autoEscape'
    | 'caseSensitive'
    | 'highlightClass'
    | 'highlightTag'
    | 'unhighlightClass'
    | 'unhighlightTag'
  >
> & {
  keywords: HighlightProps['keywords'];
  color?: string;
  style?: CSSProperties;
};

// Dialog 内置输入框配置：在保留 title 和 message 的同时，
// 复用 Field 的文本输入、长文本、字数限制和校验能力。
export type DialogInputConfig = {
  type?: DialogInputType;
  defaultValue?: string;
  placeholder?: string;
  maxlength?: Numeric;
  rows?: Numeric;
  clearable?: boolean;
  clearIcon?: string;
  readonly?: boolean;
  disabled?: boolean;
  autofocus?: boolean;
  autosize?: boolean | FieldAutosizeConfig;
  rules?: FieldRule[];
  formatter?: (value: string) => string;
  inputAlign?: FieldTextAlign;
  enterkeyhint?: FieldEnterKeyHint;
  clearTrigger?: FieldClearTrigger;
  formatTrigger?: FieldFormatTrigger;
  showWordLimit?: boolean;
  error?: boolean;
  errorMessage?: string;
  validateTrigger?: DialogInputValidateTrigger | DialogInputValidateTrigger[];
};

export type DialogOptions = {
  title?: string;
  width?: Numeric;
  theme?: DialogTheme;
  message?: DialogMessage;
  overlay?: boolean;
  teleport?: TeleportProps['to'];
  className?: unknown;
  allowHtml?: boolean;
  callback?: (action?: DialogAction, inputValue?: string) => void;
  lockScroll?: boolean;
  transition?: string;
  beforeClose?: Interceptor;
  messageAlign?: DialogMessageAlign;
  messageHighlightConfig?: DialogMessageHighlightConfig;
  inputValue?: string;
  inputConfig?: DialogInputConfig;
  'onUpdate:inputValue'?: (value: string) => void;
  overlayClass?: string;
  overlayStyle?: CSSProperties;
  closeOnPopstate?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  cancelButtonText?: string;
  cancelButtonColor?: string;
  cancelButtonDisabled?: boolean;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  confirmButtonDisabled?: boolean;
  actionButtons?: DialogButton[];
  confirmButtonVerticalThreshold?: Numeric;
  verticalButtonMaxTextLength?: Numeric;
  closeOnClickOverlay?: boolean;
  destroyOnClose?: boolean;
  keyboardEnabled?: boolean;
};

export type DialogThemeVars = {
  dialogWidth?: string;
  dialogSmallScreenWidth?: string;
  dialogFontSize?: string;
  dialogTransition?: string;
  dialogRadius?: string;
  dialogBackground?: string;
  dialogHeaderFontWeight?: string;
  dialogHeaderLineHeight?: number | string;
  dialogHeaderPaddingTop?: string;
  dialogHeaderIsolatedPadding?: string;
  dialogMessagePadding?: string;
  dialogMessageFontSize?: string;
  dialogMessageLineHeight?: number | string;
  dialogMessageMaxHeight?: string;
  dialogHasTitleMessageTextColor?: string;
  dialogHasTitleMessagePaddingTop?: string;
  dialogButtonHeight?: string;
  dialogRoundButtonHeight?: string;
  dialogConfirmButtonTextColor?: string;
};
