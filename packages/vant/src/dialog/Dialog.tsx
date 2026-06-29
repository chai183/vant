import {
  ref,
  watch,
  reactive,
  nextTick,
  withKeys,
  onMounted,
  onUpdated,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  noop,
  pick,
  extend,
  addUnit,
  toArray,
  truthProp,
  isFunction,
  BORDER_TOP,
  BORDER_LEFT,
  unknownProp,
  numericProp,
  makeStringProp,
  makeNumericProp,
  callInterceptor,
  createNamespace,
  type ComponentInstance,
} from '../utils';
import { popupSharedProps, popupSharedPropKeys } from '../popup/shared';

// Components
import { Popup } from '../popup';
import { Button } from '../button';
import { ActionBar } from '../action-bar';
import { ActionBarButton } from '../action-bar-button';
import { Highlight } from '../highlight';
import { Field } from '../field';

// Types
import type { FieldInstance, FieldRule, FieldValidateTrigger } from '../field';
import type {
  DialogTheme,
  DialogAction,
  DialogButton,
  DialogMessage,
  DialogMessageAlign,
  DialogInputConfig,
  DialogInputValidateTrigger,
  DialogMessageHighlightConfig,
} from './types';

const [name, bem] = createNamespace('dialog');

/*-------默认文本配置start---------*/

// 定义提示弹窗默认文本
const DEFAULT_ALERT_CONFIRM_BUTTON_TEXT = '确定';
// 定义确认弹窗默认文本
const DEFAULT_CONFIRM_BUTTON_TEXT = '确定';
const DEFAULT_CANCEL_BUTTON_TEXT = '取消';

/*-------默认文本配置end---------*/

/*-------上下布局逻辑start---------*/
// 默认情况下，确认文案长度超过 6 个字符时切换为上下布局，可通过 props / options 覆盖。
const DEFAULT_CONFIRM_BUTTON_VERTICAL_THRESHOLD = 6;

// 上下布局下按钮文案按单行展示，默认最多显示 15 个字符，可通过 props / options 覆盖。
const DEFAULT_VERTICAL_BUTTON_MAX_TEXT_LENGTH = 15;

// 获取文字长度
const getTextLength = (value: string) => Array.from(value).length;
// 获取有效的关于按钮限制大小：目的是大于0
const getValidNumericValue = (
  value: string | number,
  defaultValue: number,
  min = 0,
) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? Math.max(numericValue, min)
    : defaultValue;
};
// 处理一行显示的按钮文本
const truncateVerticalButtonText = (value: string, maxTextLength: number) => {
  const chars = Array.from(value);

  if (chars.length <= maxTextLength) {
    return value;
  }

  return `${chars.slice(0, maxTextLength - 1).join('')}…`;
};

/*-------上下布局逻辑end---------*/

export const dialogProps = extend({}, popupSharedProps, {
  title: String,
  theme: String as PropType<DialogTheme>,
  width: numericProp,
  message: [String, Function] as PropType<DialogMessage>,
  callback: Function as PropType<
    (action?: DialogAction, inputValue?: string) => void
  >,
  allowHtml: Boolean,
  className: unknownProp,
  transition: makeStringProp('van-dialog-bounce'),
  messageAlign: String as PropType<DialogMessageAlign>,
  // 高亮类型设置
  messageHighlightConfig: Object as PropType<DialogMessageHighlightConfig>,
  // 输入框设置
  inputValue: String,
  inputConfig: Object as PropType<DialogInputConfig>,
  closeOnPopstate: truthProp,
  showCancelButton: Boolean,
  cancelButtonText: String,
  cancelButtonColor: makeStringProp('#333333'),
  cancelButtonDisabled: Boolean,
  confirmButtonText: String,
  confirmButtonColor: String,
  confirmButtonDisabled: Boolean,
  actionButtons: Array as PropType<DialogButton[]>,
  // 确认按钮文本限制长度字段
  confirmButtonVerticalThreshold: makeNumericProp(
    DEFAULT_CONFIRM_BUTTON_VERTICAL_THRESHOLD,
  ),
  // 一行按钮最多显示文字长度字段
  verticalButtonMaxTextLength: makeNumericProp(
    DEFAULT_VERTICAL_BUTTON_MAX_TEXT_LENGTH,
  ),
  showConfirmButton: truthProp,
  closeOnClickOverlay: Boolean,
  keyboardEnabled: truthProp,
  destroyOnClose: Boolean,
});

export type DialogProps = ExtractPropTypes<typeof dialogProps>;

// footer中按钮的配置
type FooterButton = {
  action: DialogAction;
  key: string;
  className: unknown;
  color?: string;
  disabled?: boolean;
  text: string;
  onClick: () => void;
};

const popupInheritKeys = [
  ...popupSharedPropKeys,
  'transition',
  'closeOnPopstate',
  'destroyOnClose',
] as const;

/*-------高亮逻辑start--------*/

/*判断高亮--关键词是否有效
两种传参:1.字符串 2.字符串数组
找到一个非空关键词，开启高亮渲染逻辑
*/
const hasHighlightKeywords = (keywords: string | string[]) =>
  Array.isArray(keywords) ? keywords.some(Boolean) : !!keywords;

// 高亮样式传递处理展示处理--加入颜色
const getMessageHighlightStyle = (
  messageHighlightConfig?: DialogMessageHighlightConfig,
) => {
  if (!messageHighlightConfig) {
    return;
  }
  const { color, style } = messageHighlightConfig;
  // 没传color和style,只想使用组件能力，无额外扩展样式
  if (!color && !style) return;

  return { ...style, ...(color ? { color } : {}) };
};

// 设置样式到具体的dom节点--下方给tag高亮点处理
const setElementStyle = (
  element: HTMLElement,
  style: NonNullable<ReturnType<typeof getMessageHighlightStyle>>,
) => {
  element.removeAttribute('style');
  Object.entries(style).forEach(([key, value]) => {
    if (value == null) return;
    // 处理传递数组的可能
    const normalizedValue = Array.isArray(value)
      ? value.join(' ')
      : String(value);
    // 处理字符的可能
    if (key.includes('-')) {
      element.style.setProperty(key, normalizedValue);
    } else {
      // 保证字符串key，字符串value
      (element.style as unknown as Record<string, string>)[key] =
        normalizedValue;
    }
  });
};
/*-------高亮逻辑end--------*/

/*------输入文本逻辑start-------*/

// 默认校验触发事件类型
const DEFAULT_INPUT_VALIDATE_TRIGGER: DialogInputValidateTrigger = 'onConfirm';

// 获取输入框-初始值
const getDialogInputValue = (
  inputConfig?: DialogInputConfig,
  inputValue?: string,
) => inputValue ?? inputConfig?.defaultValue ?? '';

// 弹窗定义了onConfirm触发时机，field是onSubmit，做一下映射
const normalizeInputValidateTrigger = (
  trigger: DialogInputValidateTrigger,
): FieldValidateTrigger => (trigger === 'onConfirm' ? 'onSubmit' : trigger);

// 根据触发时机，获取对应的规则
const getDialogInputRules = (
  inputConfig: DialogInputConfig | undefined,
  trigger: DialogInputValidateTrigger,
) => {
  const rules = inputConfig?.rules;
  if (!rules?.length) {
    return [] as FieldRule[];
  }

  // 最终动作，触发所有规则
  if (trigger === 'onConfirm') {
    return rules;
  }
  // 获取默认的触发规则
  const defaultTriggers = toArray(
    inputConfig?.validateTrigger ?? DEFAULT_INPUT_VALIDATE_TRIGGER,
  );
  const normalizedTrigger = normalizeInputValidateTrigger(trigger);

  return rules.filter((rule) => {
    if (rule.trigger) {
      return toArray(rule.trigger).includes(normalizedTrigger);
    }

    return defaultTriggers.includes(trigger);
  });
};

/*------输入文本逻辑end--------*/

export default defineComponent({
  name,

  props: dialogProps,

  emits: [
    'confirm',
    'cancel',
    'clickButton',
    'keydown',
    'update:show',
    'update:inputValue',
  ],

  setup(props, { emit, slots }) {
    const root = ref<ComponentInstance>();
    // Field组件的实例
    const inputRef = ref<FieldInstance>();
    // input初始值
    const currentInputValue = ref(
      getDialogInputValue(props.inputConfig, props.inputValue),
    );
    const loading = reactive<Record<string, boolean>>({
      confirm: false,
      cancel: false,
    });

    // 弹窗中-高亮样式额外处理
    const syncMessageHighlightStyle = () => {
      // 获取弹窗根节点
      const popupRef = root.value?.popupRef?.value as HTMLElement | undefined;
      if (!popupRef) return;

      // 只处理 message消息 区域内的高亮标签
      const highlightTags = popupRef.querySelectorAll<HTMLElement>(
        '.van-dialog__message .van-highlight__tag',
      );
      const highlightStyle = getMessageHighlightStyle(
        props.messageHighlightConfig,
      );

      highlightTags.forEach((tag) => {
        if (highlightStyle) setElementStyle(tag, highlightStyle);
        else tag.removeAttribute('style');
      });
    };
    // 初次挂载-更新都执行，保证高亮的准确，及时
    onMounted(syncMessageHighlightStyle);
    onUpdated(syncMessageHighlightStyle);

    // 验证对应trigger的rule
    const validateInput = async (trigger: DialogInputValidateTrigger) => {
      const rules = getDialogInputRules(props.inputConfig, trigger);
      inputRef.value?.$el.classList.remove('van-field__error');
      if (!rules.length) return true;
      const result = await inputRef.value?.validate(rules);
      // 错误时 result是错误信息，正确是undefined,null,''等
      if (result) {
        inputRef.value?.$el.classList.add('van-field__error');
      }
      return !result;
    };

    // blur规则
    const onInputBlur = () => {
      void validateInput('onBlur');
    };
    // 更新--触发change验证
    const updateInputValue = (value: string) => {
      currentInputValue.value = value;
      emit('update:inputValue', value);
      nextTick(() => {
        validateInput('onChange');
      });
    };

    // 监听传递值
    watch(
      () => props.inputValue,
      (value) => {
        if (value !== undefined && value !== currentInputValue.value) {
          currentInputValue.value = value;
        }
      },
    );

    // 兼容打开弹窗监听初始化
    // 1. 优先使用外部传入的 inputValue,否则回退 inputConfig.defaultValue
    // 2. 清除上一次的验证
    watch(
      () => props.show,
      (show, prevShow) => {
        if (show && !prevShow) {
          inputRef.value?.$el.classList.remove('van-field__error');
          currentInputValue.value = getDialogInputValue(
            props.inputConfig,
            props.inputValue,
          );
          nextTick(() => {
            inputRef.value?.resetValidation();
          });
        }
      },
    );

    // 组件事件保持兼容--传递值
    const isBuiltinAction = (
      action: DialogAction,
    ): action is 'confirm' | 'cancel' =>
      action === 'confirm' || action === 'cancel';

    // action传递事件，兼容action为confirm和cancel
    const emitAction = (action: DialogAction, button?: DialogButton) => {
      if (props.inputConfig) {
        if (isBuiltinAction(action)) {
          emit(action, currentInputValue.value);
        }
        if (button) {
          emit('clickButton', action, button, currentInputValue.value);
        }
      } else {
        if (isBuiltinAction(action)) {
          emit(action);
        }
        if (button) {
          emit('clickButton', action, button);
        }
      }
    };
    const updateShow = (value: boolean) => emit('update:show', value);
    const close = (action: DialogAction) => {
      updateShow(false);
      // 兼容--输入值-返回输入框的值
      if (props.inputConfig) {
        props.callback?.(action, currentInputValue.value);
      } else {
        props.callback?.(action);
      }
    };

    const getActionHandler =
      (action: DialogAction, button?: DialogButton) => async () => {
        // 弹窗已经隐藏时，不再响应按钮点击，避免重复触发关闭流程。
        if (!props.show) {
          return;
        }
        // confirm 兼容最后校验
        if (action === 'confirm' && props.inputConfig) {
          loading[action] = true;
          const isValid = await validateInput('onConfirm');
          if (!isValid) {
            loading[action] = false;
            return;
          }
        }

        emitAction(action, button);

        if (props.beforeClose) {
          loading[action] = true;
          callInterceptor(props.beforeClose, {
            // 新增输入的值进入到beforeClose
            args: props.inputConfig
              ? [action, currentInputValue.value]
              : [action],
            done() {
              // 拦截器放行后，才真正关闭弹窗。
              close(action);
              loading[action] = false;
            },
            canceled() {
              loading[action] = false;
            },
            error() {
              // 异常清理loading
              loading[action] = false;
            },
          });
        } else {
          close(action);
          loading[action] = false;
        }
      };

    const onCancel = getActionHandler('cancel');
    const onConfirm = getActionHandler('confirm');
    // 获取取消按钮文本
    const getCancelButtonText = () =>
      props.cancelButtonText || DEFAULT_CANCEL_BUTTON_TEXT;
    // 获取确认按钮文本
    const getConfirmButtonText = () =>
      props.confirmButtonText ||
      (props.showCancelButton
        ? DEFAULT_CONFIRM_BUTTON_TEXT
        : DEFAULT_ALERT_CONFIRM_BUTTON_TEXT);
    // 按钮操作集合
    const hasActionButtons = () => !!props.actionButtons?.length;
    // 获取确认按钮限制值
    const getConfirmButtonVerticalThreshold = () =>
      getValidNumericValue(
        props.confirmButtonVerticalThreshold,
        DEFAULT_CONFIRM_BUTTON_VERTICAL_THRESHOLD,
      );
    // 获取文本长度限制值
    const getVerticalButtonMaxTextLength = () =>
      getValidNumericValue(
        props.verticalButtonMaxTextLength,
        DEFAULT_VERTICAL_BUTTON_MAX_TEXT_LENGTH,
        1,
      );

    /*
      满足以下任意条件，切换时上下布局：
      1. 存在操作列表actionButtons
      2. 同时展示取消按钮和确认按钮，且确认文案长度超过阈值(默认6)。
    */
    //  判断是否上下布局
    const shouldUseVerticalButtonLayout = () =>
      hasActionButtons() ||
      (props.showCancelButton &&
        props.showConfirmButton &&
        getTextLength(getConfirmButtonText()) >
          getConfirmButtonVerticalThreshold());

    // 获取渲染按钮文本
    const getRenderedButtonText = (value: string) =>
      shouldUseVerticalButtonLayout()
        ? truncateVerticalButtonText(value, getVerticalButtonMaxTextLength())
        : value;

    const getButtonStyle = (color?: string) => (color ? { color } : undefined);
    const getButtonClass = (vertical: boolean) => bem('button', { vertical });
    //获取action按钮的类名
    const getActionClass = (action: DialogAction) => {
      if (isBuiltinAction(action)) {
        return bem(action);
      }

      return bem('action');
    };
    // 内置按钮展示时优先级最高，同名 actionButtons 会被过滤；
    // 若对应内置按钮未展示，则允许 actionButtons 使用 confirm / cancel。
    const isReservedActionButtonAction = (action: DialogAction) =>
      (action === 'confirm' && props.showConfirmButton) ||
      (action === 'cancel' && props.showCancelButton);

    // 处理action按钮的名称
    const getFallbackActionButtonAction = (
      index: number,
      usedActions: Set<DialogAction>,
    ) => {
      let action = `action-button-${index}` as DialogAction;
      let count = 1;

      while (usedActions.has(action)) {
        action = `action-button-${index}-${count}` as DialogAction;
        count++;
      }

      return action;
    };
    // 返回需要的按钮数据列表
    const createFooterButton = (
      button: DialogButton,
      index: number,
      action: DialogAction,
    ): FooterButton => {
      return {
        action,
        key: `${action}-${index}`,
        className: [getActionClass(action), button.className],
        color: button.color,
        disabled: button.disabled,
        text: button.text,
        onClick: getActionHandler(action, button),
      };
    };
    // 自定义actionButtons的列表
    const getCustomFooterButtons = () => {
      const usedActions = new Set<DialogAction>();
      const buttons: FooterButton[] = [];
      const length = props.actionButtons?.length || 0;

      for (let index = length - 1; index >= 0; index--) {
        const button = props.actionButtons![index];
        const { action } = button;

        if (action) {
          // 内置按钮的情况判断-外层是否配置
          if (isReservedActionButtonAction(action)) {
            continue;
          }
          // 重复 action 只保留最后一个
          if (usedActions.has(action)) {
            continue;
          }
          usedActions.add(action);
          buttons.unshift(createFooterButton(button, index, action));
          continue;
        }
        // 处理无action按钮名称的逻辑
        const fallbackAction = getFallbackActionButtonAction(
          index,
          usedActions,
        );
        usedActions.add(fallbackAction);
        buttons.unshift(createFooterButton(button, index, fallbackAction));
      }

      return buttons;
    };

    const getDefaultFooterButtons = (vertical: boolean) => {
      const buttons: FooterButton[] = [];

      if (vertical) {
        // 上下布局固定顺序：主操作按钮 -> 自定义操作按钮 -> 取消。
        if (props.showConfirmButton) {
          buttons.push({
            action: 'confirm',
            key: 'confirm',
            className: bem('confirm') as string,
            color: props.confirmButtonColor,
            disabled: props.confirmButtonDisabled,
            text: getConfirmButtonText(),
            onClick: onConfirm,
          });
        }
        buttons.push(...getCustomFooterButtons());

        if (props.showCancelButton) {
          buttons.push({
            action: 'cancel',
            key: 'cancel',
            className: bem('cancel') as string,
            color: props.cancelButtonColor,
            disabled: props.cancelButtonDisabled,
            text: getCancelButtonText(),
            onClick: onCancel,
          });
        }

        return buttons;
      }

      if (props.showCancelButton) {
        buttons.push({
          action: 'cancel',
          key: 'cancel',
          className: bem('cancel') as string,
          color: props.cancelButtonColor,
          disabled: props.cancelButtonDisabled,
          text: getCancelButtonText(),
          onClick: onCancel,
        });
      }

      if (props.showConfirmButton) {
        buttons.push({
          action: 'confirm',
          key: 'confirm',
          className: bem('confirm') as string,
          color: props.confirmButtonColor,
          disabled: props.confirmButtonDisabled,
          text: getConfirmButtonText(),
          onClick: onConfirm,
        });
      }

      return buttons;
    };
    const onKeydown = withKeys(
      (event: KeyboardEvent) => {
        if (!props.keyboardEnabled) {
          return;
        }

        // 只响应弹窗根节点自己的键盘事件。
        // 如果焦点在输入框等子元素上，就交给子元素自己处理，避免误触发 confirm / cancel。
        if (event.target !== root.value?.popupRef?.value) {
          return;
        }

        const onEventType: Record<string, () => void> = {
          Enter: props.showConfirmButton ? onConfirm : noop,
          Escape: props.showCancelButton ? onCancel : noop,
        };

        onEventType[event.key]();
        emit('keydown', event);
      },
      ['enter', 'esc'],
    );

    const renderTitle = () => {
      const title = slots.title ? slots.title() : props.title;
      if (title) {
        return (
          <div
            class={bem('header', {
              isolated: !props.message && !slots.default && !props.inputConfig,
            })}
          >
            {title}
          </div>
        );
      }
    };

    const renderMessage = (hasTitle: boolean) => {
      const { message, allowHtml, messageAlign, messageHighlightConfig } =
        props;
      const classNames = bem('message', {
        'has-title': hasTitle,
        [messageAlign as string]: messageAlign,
      });

      // message 支持字符串和函数两种形式
      const content = isFunction(message) ? message() : message;
      // 外部要求使用html时会直接走innerHTML，此时设置了高亮也没用
      if (allowHtml && typeof content === 'string') {
        return <div class={classNames} innerHTML={content} />;
      }

      // message文字消息，设置高亮配置，走高亮逻辑
      if (
        typeof content === 'string' &&
        messageHighlightConfig &&
        hasHighlightKeywords(messageHighlightConfig.keywords)
      ) {
        const {
          keywords, //关键字
          autoEscape, //自动转移特殊字符
          caseSensitive, //是否区分大小写
          highlightClass, //命中片段对应的class
          highlightTag, //命中片段对应的tag
          unhighlightClass, //未命中class
          unhighlightTag, //未命中tag
        } = messageHighlightConfig;

        return (
          //保留原本的容器结构
          <Highlight
            tag="div"
            class={classNames}
            sourceString={content}
            keywords={keywords}
            autoEscape={autoEscape}
            caseSensitive={caseSensitive}
            highlightClass={highlightClass}
            highlightTag={highlightTag}
            unhighlightClass={unhighlightClass}
            unhighlightTag={unhighlightTag}
          />
        );
      }
      return <div class={classNames}>{content}</div>;
    };
    // 渲染input输入
    const renderInput = (hasTitle: boolean, hasMessage: boolean) => {
      const inputConfig = props.inputConfig;
      if (!inputConfig) {
        return;
      }
      const {
        type = 'text',
        rules,
        rows,
        error,
        autosize,
        clearIcon,
        clearable,
        disabled,
        readonly,
        autofocus,
        maxlength,
        formatter,
        inputAlign,
        placeholder,
        enterkeyhint,
        clearTrigger,
        formatTrigger,
        showWordLimit,
        errorMessage,
      } = inputConfig;

      return (
        <div
          class={bem('input', {
            'has-title': hasTitle && !hasMessage,
            isolated: !hasTitle && !hasMessage,
          })}
        >
          <Field
            ref={inputRef}
            border={false}
            type={type}
            rows={rows}
            error={error}
            rules={rules}
            autosize={autosize}
            clearIcon={clearIcon}
            clearable={clearable}
            disabled={disabled}
            readonly={readonly}
            autofocus={autofocus}
            maxlength={maxlength}
            formatter={formatter}
            inputAlign={inputAlign}
            placeholder={placeholder}
            enterkeyhint={enterkeyhint}
            clearTrigger={clearTrigger}
            formatTrigger={formatTrigger}
            showWordLimit={showWordLimit}
            errorMessage={errorMessage}
            modelValue={currentInputValue.value}
            onBlur={onInputBlur}
            onUpdate:modelValue={updateInputValue}
          />
        </div>
      );
    };

    const renderContent = () => {
      const hasCustomContent = !!slots.default;
      const { title, message, allowHtml, inputConfig } = props;
      const hasTitle = !!(title || slots.title);
      const hasMessage = !hasCustomContent && !!message;
      const hasInput = !!inputConfig;

      if (!hasCustomContent && !hasMessage && !hasInput) {
        return;
      }

      return (
        <div
          key={allowHtml ? 1 : 0}
          class={bem('content', {
            isolated: !hasTitle && hasMessage && !hasInput,
          })}
        >
          {/*
            内容区有 3 种来源：
            1. default slot：业务完全自定义内容，此时不再渲染默认的 message
            2. message：Dialog 默认文本内容
            3. inputConfig：在 message 下方追加内置输入框
          */}
          {hasCustomContent
            ? slots.default?.()
            : hasMessage && renderMessage(hasTitle)}
          {hasInput && renderInput(hasTitle, hasMessage)}
        </div>
      );
    };

    const renderButtons = (vertical = false) => {
      const buttons = getDefaultFooterButtons(vertical);

      return (
        <div class={[BORDER_TOP, bem('footer', { vertical })]}>
          {buttons.map((button, index) => (
            <Button
              key={button.key}
              size="large"
              text={getRenderedButtonText(button.text)}
              class={[
                button.className,
                getButtonClass(vertical),
                {
                  [BORDER_LEFT]: !vertical && index > 0,
                  [BORDER_TOP]: vertical && index > 0,
                },
              ]}
              style={getButtonStyle(button.color)}
              loading={loading[button.action]}
              disabled={button.disabled}
              onClick={button.onClick}
              borderless
              plain
            />
          ))}
        </div>
      );
    };

    const renderRoundButtons = () => (
      <ActionBar class={bem('footer')}>
        {props.showCancelButton && (
          <ActionBarButton
            type="warning"
            text={getCancelButtonText()}
            class={bem('cancel')}
            color={props.cancelButtonColor}
            loading={loading.cancel}
            disabled={props.cancelButtonDisabled}
            onClick={onCancel}
          />
        )}
        {props.showConfirmButton && (
          <ActionBarButton
            type="danger"
            text={getConfirmButtonText()}
            class={bem('confirm')}
            color={props.confirmButtonColor}
            loading={loading.confirm}
            disabled={props.confirmButtonDisabled}
            onClick={onConfirm}
          />
        )}
      </ActionBar>
    );

    const renderFooter = () => {
      if (slots.footer) {
        return slots.footer();
      }

      // 如果上下布局，进项判断渲染
      if (shouldUseVerticalButtonLayout()) return renderButtons(true);
      return props.theme === 'round-button'
        ? renderRoundButtons()
        : renderButtons();
    };

    return () => {
      const { width, title, theme, message, className } = props;
      const resolvedTheme = shouldUseVerticalButtonLayout() ? undefined : theme;

      return (
        <Popup
          ref={root}
          role="dialog"
          class={[bem([resolvedTheme]), className]}
          style={{ width: addUnit(width) }}
          tabindex={0}
          aria-labelledby={title || message}
          onKeydown={onKeydown}
          onUpdate:show={updateShow}
          {...pick(props, popupInheritKeys)}
        >
          {renderTitle()}
          {renderContent()}
          {renderFooter()}
        </Popup>
      );
    };
  },
});
