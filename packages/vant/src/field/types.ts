/* eslint-disable no-use-before-define */
import type { ComputedRef, ComponentPublicInstance } from 'vue';
import type { FieldProps } from './Field';

export type FieldType =
  | 'account'
  | 'idcard'
  | 'ukey'
  | 'tel'
  | 'url'
  | 'date'
  | 'file'
  | 'text'
  | 'time'
  | 'week'
  | 'color'
  | 'digit'
  | 'email'
  | 'image'
  | 'month'
  | 'money'
  | 'radio'
  | 'range'
  | 'reset'
  | 'button'
  | 'hidden'
  | 'number'
  | 'search'
  | 'submit'
  | 'checkbox'
  | 'password'
  | 'textarea'
  | 'datetime-local';

export type FieldTextAlign = 'left' | 'center' | 'right' | 'top';

export type FieldClearTrigger = 'always' | 'focus';

export type FieldFormatTrigger = 'onBlur' | 'onChange';

export type FieldValidateTrigger = 'onBlur' | 'onChange' | 'onSubmit';

export type FieldEnterKeyHint =
  | 'search'
  | 'done'
  | 'enter'
  | 'go'
  | 'next'
  | 'previous'
  | 'send';

export type FieldAutosizeConfig = {
  maxHeight?: number;
  minHeight?: number;
};

export type FieldValidateError = {
  name?: string;
  message: string;
};

export type FieldRuleMessage =
  | string
  | ((value: any, rule: FieldRule) => string);

export type FieldRuleValidator = (
  value: any,
  rule: FieldRule,
) => boolean | string | Promise<boolean | string>;

export type FieldRuleFormatter = (value: any, rule: FieldRule) => string;

/**
 * 当输入框展示与 v-model 字符不一致（千分位、空格等）时，用于同步展示与还原光标。
 * 可通过 Field 的 `groupedDisplay` 传入；不传时按 `type` 使用内置预设（money / tel / account / idcard / ukey）。
 */
export type FieldGroupedDisplayNormalizeContext = {
  maxlength: number | undefined;
};

export type FieldGroupedDisplayConfig = {
  /** 将展示串 `slice(0, caret)` 后去掉展示用分隔符，得到 v-model 内光标前的字符数 */
  stripDisplayRegex: RegExp;
  /** v-model（无展示分隔符）→ 输入框展示 */
  formatDisplay: (modelValue: string) => string;
  /** v-model 字符下标 → 展示串中的下标，用于 `setSelectionRange` */
  rawOffsetToDisplayIndex: (display: string, rawOffset: number) => number;
  /**
   * 为 true 时在 `updateValue` 中跳过组件 `maxlength` 的 `limitValueLength`
   *（由 `normalizeModelValue` 内自行截断，如 tel / account / idcard / ukey）
   */
  skipLimitValueLength?: boolean;
  /**
   * 将输入框展示串转为 v-model（在 `normalizeModelValue` 之前执行）。
   * 与 `type="text"` 等搭配自定义展示时，可在此去掉分隔符。
   */
  parseDisplayToModel?: (display: string) => string;
  /**
   * 在 `parseDisplayToModel` 之后、`maxlength` 组件截断之前，将串规范为最终 v-model。
   * 返回 `capDiffLen` 表示本步内因位数上限等截断的长度差，用于光标修正；未返回则视为 0。
   */
  normalizeModelValue?: (
    value: string,
    ctx: FieldGroupedDisplayNormalizeContext,
  ) => { value: string; capDiffLen?: number };
};

export type FieldRule = {
  pattern?: RegExp;
  trigger?: FieldValidateTrigger | FieldValidateTrigger[];
  message?: FieldRuleMessage;
  required?: boolean;
  validator?: FieldRuleValidator;
  formatter?: FieldRuleFormatter;
  validateEmpty?: boolean;
};

export type FieldValidationStatus = 'passed' | 'failed' | 'unvalidated';

// Shared props of Field and Form
export type FieldFormSharedProps =
  | 'colon'
  | 'required'
  | 'disabled'
  | 'readonly'
  | 'labelWidth'
  | 'labelAlign'
  | 'inputAlign'
  | 'errorMessageAlign';

export type FieldExpose = {
  blur: () => void | undefined;
  focus: () => void | undefined;
  validate: (
    rules?: FieldRule[] | undefined,
  ) => Promise<void | FieldValidateError>;
  resetValidation: () => void;
  getValidationStatus: () => FieldValidationStatus;
  /** @private */
  formValue: ComputedRef<unknown>;
};

export type FieldInstance = ComponentPublicInstance<FieldProps, FieldExpose>;

declare global {
  interface EventTarget {
    composing?: boolean;
  }
}

export type FieldThemeVars = {
  fieldLabelWidth?: string;
  fieldLabelColor?: string;
  fieldLabelMarginRight?: string;
  fieldInputTextColor?: string;
  fieldInputErrorTextColor?: string;
  fieldInputDisabledTextColor?: string;
  fieldPlaceholderTextColor?: string;
  fieldIconSize?: string;
  fieldClearIconSize?: string;
  fieldClearIconColor?: string;
  fieldRightIconColor?: string;
  fieldErrorMessageColor?: string;
  fieldErrorMessageFontSize?: string;
  fieldTextAreaMinHeight?: string;
  fieldWordLimitColor?: string;
  fieldWordLimitFontSize?: string;
  fieldWordLimitLineHeight?: number | string;
  fieldDisabledTextColor?: string;
  fieldRequiredMarkColor?: string;
  fieldLabelActionColor?: string;
  fieldLabelActionFontSize?: string;
  fieldInputBorderColor?: string;
  fieldInputBorderRadius?: string;
  fieldInputBorderPaddingY?: string;
  fieldInputBorderPaddingX?: string;
  fieldInputBorderBackground?: string;
};
