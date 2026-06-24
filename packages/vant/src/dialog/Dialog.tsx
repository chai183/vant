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
  DialogMessage,
  DialogMessageAlign,
  DialogInputConfig,
  DialogInputValidateTrigger,
  DialogMessageHighlightConfig,
} from './types';

const [name, bem] = createNamespace('dialog');

// 提示弹窗默认只有一个确认按钮，确认弹窗默认显示主确认和取消。
const DEFAULT_ALERT_CONFIRM_BUTTON_TEXT = '确定';
const DEFAULT_CONFIRM_BUTTON_TEXT = '确定';
const DEFAULT_CANCEL_BUTTON_TEXT = '取消';

// 默认情况下，确认文案长度超过 5 个字符时切换为上下布局，可通过 props / options 覆盖。
const DEFAULT_CONFIRM_BUTTON_VERTICAL_THRESHOLD = 5;

// 上下布局下按钮文案按单行展示，默认最多显示 15 个字符，可通过 props / options 覆盖。
const DEFAULT_VERTICAL_BUTTON_MAX_TEXT_LENGTH = 15;

const getTextLength = (value: string) => Array.from(value).length;
// 获取有效的文案长度值
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

const truncateVerticalButtonText = (value: string, maxTextLength: number) => {
  const chars = Array.from(value);

  if (chars.length <= maxTextLength) {
    return value;
  }

  return `${chars.slice(0, maxTextLength - 1).join('')}…`;
};

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
  // 为字符串 message 开启关键词高亮，并允许配置匹配规则与额外样式。
  // 仅在 message 为字符串、且 allowHtml 为 false 时生效。
  messageHighlightConfig: Object as PropType<DialogMessageHighlightConfig>,
  // 当前内置输入框的值，可配合 v-model:input-value / onUpdate:inputValue 使用。
  inputValue: String,
  // 使用内置输入配置时，会在 message 下方追加一个 Field，
  // 从而保留 title、message 和默认 footer，而不是用 default slot 整块覆盖。
  inputConfig: Object as PropType<DialogInputConfig>,
  closeOnPopstate: truthProp,
  showCancelButton: Boolean,
  cancelButtonText: String,
  cancelButtonColor: String,
  cancelButtonDisabled: Boolean,
  confirmButtonText: String,
  confirmButtonColor: String,
  confirmButtonDisabled: Boolean,
  secondaryButtonText: String,
  secondaryButtonColor: String,
  secondaryButtonDisabled: Boolean,
  confirmButtonVerticalThreshold: makeNumericProp(
    DEFAULT_CONFIRM_BUTTON_VERTICAL_THRESHOLD,
  ),
  verticalButtonMaxTextLength: makeNumericProp(
    DEFAULT_VERTICAL_BUTTON_MAX_TEXT_LENGTH,
  ),
  showConfirmButton: truthProp,
  closeOnClickOverlay: Boolean,
  keyboardEnabled: truthProp,
  destroyOnClose: Boolean,
});

export type DialogProps = ExtractPropTypes<typeof dialogProps>;

// footer 按钮的标准化配置，便于后面统一组织与渲染按钮列表。
type FooterButton = {
  action: DialogAction;
  className: string;
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

const DEFAULT_INPUT_VALIDATE_TRIGGER: DialogInputValidateTrigger = 'onConfirm';

// 统一计算内置输入框的初始值：
// 1. 外部显式传入 inputValue 时，以受控值为准
// 2. 否则回退到 inputConfig.defaultValue
// 3. 再否则使用空字符串，确保 Field 始终拿到稳定的字符串值
const getDialogInputValue = (
  inputConfig?: DialogInputConfig,
  inputValue?: string,
) => inputValue ?? inputConfig?.defaultValue ?? '';

// Dialog 额外定义了 onConfirm 这个触发时机，
// 但 Field 内部使用的是 onSubmit，所以这里做一层映射。
const normalizeInputValidateTrigger = (
  trigger: DialogInputValidateTrigger,
): FieldValidateTrigger => (trigger === 'onConfirm' ? 'onSubmit' : trigger);

// 根据当前触发时机筛选需要执行的规则：
// - 规则自己声明了 trigger 时，以规则自身为准
// - 规则没有声明 trigger 时，回退到 Dialog 输入配置上的 validateTrigger
const getDialogInputRules = (
  inputConfig: DialogInputConfig | undefined,
  trigger: DialogInputValidateTrigger,
) => {
  const rules = inputConfig?.rules;

  if (!rules?.length) {
    return [] as FieldRule[];
  }

  // confirm 按钮是最终提交动作，
  // 这里统一兜底执行全部规则，避免只配置了 onBlur / onChange 时直接绕过校验。
  if (trigger === 'onConfirm') {
    return rules;
  }

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

const hasHighlightKeywords = (keywords: string | string[]) =>
  Array.isArray(keywords)
    ? // 数组场景：只要至少存在一个非空关键词，就认为可以开启高亮。
      keywords.some(Boolean)
    : // 单字符串场景：空字符串不高亮，非空字符串才高亮。
      !!keywords;

// 从 messageHighlightConfig 里提取“展示层”的样式配置。
// Highlight 组件负责“哪些文字命中了关键词”，
// Dialog 这里负责“命中的文字最终长什么样”，比如颜色、字重、斜体等。
const getMessageHighlightStyle = (
  messageHighlightConfig?: DialogMessageHighlightConfig,
) => {
  if (!messageHighlightConfig) {
    return;
  }

  const { color, style } = messageHighlightConfig;

  // 如果既没有 color，也没有 style，说明这次只想使用 Highlight 的结构能力，
  // 不需要给命中的内容额外补内联样式。
  if (!color && !style) {
    return;
  }

  return {
    // 先展开完整样式对象，保留外部传入的 fontWeight / fontStyle 等配置。
    ...style,
    // color 是便捷写法，单独传入时也要补到最终样式里。
    ...(color ? { color } : {}),
  };
};

// 把整理好的高亮样式逐项写回真实 DOM。
// 之所以手动同步，是因为高亮标签不是 Dialog 直接渲染出来的，
// 而是 Highlight 在内部拆分字符串后生成的。
const setElementStyle = (
  element: HTMLElement,
  style: NonNullable<ReturnType<typeof getMessageHighlightStyle>>,
) => {
  // 先清掉旧 style，避免上一次渲染残留的样式污染这一次。
  element.removeAttribute('style');

  Object.entries(style).forEach(([key, value]) => {
    // 跳过 null / undefined，避免把无效样式写进 DOM。
    if (value == null) {
      return;
    }

    // Vue/JS 里的 style 值可能是数组，也可能是普通值；
    // 这里统一转成浏览器能识别的字符串。
    const normalizedValue = Array.isArray(value)
      ? value.join(' ')
      : String(value);

    // 带连字符的样式名（如 font-weight、--custom-color）要用 setProperty；
    // 驼峰写法（如 fontWeight）则可以直接赋值。
    if (key.includes('-')) {
      element.style.setProperty(key, normalizedValue);
    } else {
      (element.style as unknown as Record<string, string>)[key] =
        normalizedValue;
    }
  });
};

export default defineComponent({
  name,

  props: dialogProps,

  emits: [
    'confirm',
    'secondary',
    'cancel',
    'keydown',
    'update:show',
    'update:inputValue',
  ],

  setup(props, { emit, slots }) {
    const root = ref<ComponentInstance>();
    const inputRef = ref<FieldInstance>();
    const currentInputValue = ref(
      getDialogInputValue(props.inputConfig, props.inputValue),
    );
    const loading = reactive({
      confirm: false,
      secondary: false,
      cancel: false,
    });

    // Highlight 负责把命中的关键词包成 .van-highlight__tag，
    // 但外部传入的 color / style 只是配置数据，不会自动落到这些真实节点上。
    // 所以这里在组件挂载 / 更新后，主动把样式同步到 DOM。
    const syncMessageHighlightStyle = () => {
      const popupRef = root.value?.popupRef?.value as HTMLElement | undefined;

      // Popup 还没挂载好时拿不到真实节点，直接跳过即可。
      if (!popupRef) {
        return;
      }

      // 只处理 message 区域内的高亮标签，避免误伤 Dialog 其他位置的 Highlight。
      const highlightTags = popupRef.querySelectorAll<HTMLElement>(
        '.van-dialog__message .van-highlight__tag',
      );
      const highlightStyle = getMessageHighlightStyle(
        props.messageHighlightConfig,
      );

      highlightTags.forEach((tag) => {
        if (highlightStyle) {
          // 每次都用最新配置覆盖，保证关键词、颜色、字重等动态变化时界面同步。
          setElementStyle(tag, highlightStyle);
        } else {
          // 外部取消 color / style 后，也要把旧的内联样式清掉，
          // 否则界面会残留上一次的红色、粗体等效果。
          tag.removeAttribute('style');
        }
      });
    };

    // 首次渲染后同步一次，保证弹窗第一次出现时就能看到正确的高亮样式。
    onMounted(syncMessageHighlightStyle);
    // 后续 message / keywords / style 发生变化后，再同步一次。
    onUpdated(syncMessageHighlightStyle);

    // 按不同触发时机执行对应的规则。
    // Field.validate 在通过时返回空值，在失败时返回错误信息，
    // 所以这里统一转成 boolean，后面判断会更直观。
    const validateInput = async (trigger: DialogInputValidateTrigger) => {
      const rules = getDialogInputRules(props.inputConfig, trigger);
      inputRef.value?.$el.classList.remove('van-field__error');
      if (!rules.length) {
        return true;
      }

      const result = await inputRef.value?.validate(rules);
      // 若校验通过，result 是 undefined / null / '' 等空值；若校验失败，result 是错误信息字符串。
      if (result) {
        // 检验失败后面会新增一个 class .van-field__error-message
        // 这里顺便把输入框的边框也变成错误色，增强视觉提示。
        inputRef.value?.$el.classList.add('van-field__error');
      }
      return !result;
    };

    // blur 时只执行属于 onBlur 的规则。
    const onInputBlur = () => {
      void validateInput('onBlur');
    };

    const updateInputValue = (value: string) => {
      currentInputValue.value = value;
      emit('update:inputValue', value);

      // Field.validate 读取的是子组件当前 props。
      // 所以要先把新值同步回 Field，再在 nextTick 里执行 onChange 校验，
      // 避免拿旧值做校验。
      void nextTick(() => {
        void validateInput('onChange');
      });
    };

    // 受控用法：外部通过 v-model / onUpdate 改值时，同步回内部状态。
    watch(
      () => props.inputValue,
      (value) => {
        if (value !== undefined && value !== currentInputValue.value) {
          currentInputValue.value = value;
        }
      },
    );

    // 每次重新打开弹窗时，都重新初始化输入值与校验状态：
    // 1. 优先使用外部传入的 inputValue（受控场景）
    // 2. 否则回退到 inputConfig.defaultValue
    // 3. 顺手清掉上一次打开留下的校验提示
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

    const updateShow = (value: boolean) => emit('update:show', value);

    // 组件事件保持兼容：
    // - 未启用 inputConfig 时，沿用原来的无参事件
    // - 启用 inputConfig 后，把当前输入值作为参数一并抛出
    const emitAction = (action: DialogAction) => {
      if (props.inputConfig) {
        emit(action, currentInputValue.value);
      } else {
        emit(action);
      }
    };

    // 关闭时也把输入值同步透传给 callback，
    // 这样函数调用 showDialog / showConfirmDialog 的场景也能直接拿到结果。
    const close = (action: DialogAction) => {
      updateShow(false);

      if (props.inputConfig) {
        props.callback?.(action, currentInputValue.value);
      } else {
        props.callback?.(action);
      }
    };

    const getActionHandler = (action: DialogAction) => async () => {
      // 弹窗已经隐藏时，不再响应按钮点击，避免重复触发关闭流程。
      if (!props.show) {
        return;
      }

      // confirm 按钮承担“最终提交”语义：
      // 只有确认前校验通过，才允许继续走 emit / beforeClose / close 流程。
      if (action === 'confirm' && props.inputConfig) {
        loading[action] = true;

        const isValid = await validateInput('onConfirm');

        if (!isValid) {
          loading[action] = false;
          return;
        }
      }

      emitAction(action);

      if (props.beforeClose) {
        loading[action] = true;
        callInterceptor(props.beforeClose, {
          // 开启 inputConfig 时，把当前输入值作为第二个参数一并传给 beforeClose，
          // 方便业务在真正关闭前做异步校验、二次确认或条件拦截。
          args: props.inputConfig
            ? [action, currentInputValue.value]
            : [action],
          done() {
            // 拦截器放行后，才真正关闭弹窗。
            close(action);
            loading[action] = false;
          },
          canceled() {
            // beforeClose 返回 false / reject 时，只结束 loading，保留弹窗。
            loading[action] = false;
          },
          error() {
            // 发生异常时也要兜底清理 loading，避免按钮一直转圈。
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
    const onSecondary = getActionHandler('secondary');
    const getCancelButtonText = () =>
      props.cancelButtonText || DEFAULT_CANCEL_BUTTON_TEXT;
    const getConfirmButtonText = () =>
      props.confirmButtonText ||
      (props.showCancelButton
        ? DEFAULT_CONFIRM_BUTTON_TEXT
        : DEFAULT_ALERT_CONFIRM_BUTTON_TEXT);
    const getSecondaryButtonText = () => props.secondaryButtonText || '';
    const hasSecondaryButton = () => !!getSecondaryButtonText();

    const getConfirmButtonVerticalThreshold = () =>
      getValidNumericValue(
        props.confirmButtonVerticalThreshold,
        DEFAULT_CONFIRM_BUTTON_VERTICAL_THRESHOLD,
      );
    const getVerticalButtonMaxTextLength = () =>
      getValidNumericValue(
        props.verticalButtonMaxTextLength,
        DEFAULT_VERTICAL_BUTTON_MAX_TEXT_LENGTH,
        1,
      );

    // 只要满足以下任一条件，就切换到底部纵向布局：
    // 1. 配置了 secondaryButtonText，需要三按钮上下排列；
    // 2. 同时展示取消按钮和确认按钮，且确认文案长度超过阈值。
    const shouldUseVerticalButtonLayout = () =>
      hasSecondaryButton() ||
      (props.showCancelButton &&
        props.showConfirmButton &&
        getTextLength(getConfirmButtonText()) >
          getConfirmButtonVerticalThreshold());

    // 纵向布局时按钮文案强制单行展示；
    // 超出长度后使用省略号截断，避免把底部布局撑坏。
    const getRenderedButtonText = (value: string) =>
      shouldUseVerticalButtonLayout()
        ? truncateVerticalButtonText(value, getVerticalButtonMaxTextLength())
        : value;

    const getButtonStyle = (color?: string) => (color ? { color } : undefined);
    const getButtonClass = (vertical: boolean) => bem('button', { vertical });

    const getDefaultFooterButtons = (vertical: boolean) => {
      const buttons: FooterButton[] = [];

      if (vertical) {
        // 纵向布局下的顺序固定为：主确认 -> 次级操作 -> 取消。
        if (props.showConfirmButton) {
          buttons.push({
            action: 'confirm',
            className: bem('confirm') as string,
            color: props.confirmButtonColor,
            disabled: props.confirmButtonDisabled,
            text: getConfirmButtonText(),
            onClick: onConfirm,
          });
        }

        if (hasSecondaryButton()) {
          buttons.push({
            action: 'secondary',
            className: bem('secondary') as string,
            color: props.secondaryButtonColor,
            disabled: props.secondaryButtonDisabled,
            text: getSecondaryButtonText(),
            onClick: onSecondary,
          });
        }

        if (props.showCancelButton) {
          buttons.push({
            action: 'cancel',
            className: bem('cancel') as string,
            color: props.cancelButtonColor,
            disabled: props.cancelButtonDisabled,
            text: getCancelButtonText(),
            onClick: onCancel,
          });
        }

        return buttons;
      }

      // 横向布局保持常见顺序：取消在左，确认在右。
      if (props.showCancelButton) {
        buttons.push({
          action: 'cancel',
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

      // message 支持两种写法：
      // 1. 直接传字符串
      // 2. 传函数，函数返回自定义 JSX 内容
      // 这里先统一拿到最终内容，后面只围绕 content 决定渲染策略。
      const content = isFunction(message) ? message() : message;

      // allowHtml = true 代表业务明确要求按 HTML 插入字符串。
      // 这种场景直接走 innerHTML，不再做关键词高亮，
      // 避免 HTML 结构拆分与 Highlight 的文本拆分逻辑互相干扰。
      if (allowHtml && typeof content === 'string') {
        return <div class={classNames} innerHTML={content} />;
      }

      // 只有“纯字符串 message”才适合交给 Highlight 自动拆分关键词。
      // 如果 message 是函数返回的自定义节点，内部结构由业务自己控制，
      // Dialog 不再强行介入，继续走普通渲染即可。
      //
      // 同时还要确保：
      // 1. 传入了 messageHighlightConfig
      // 2. keywords 里至少存在一个非空关键词
      if (
        typeof content === 'string' &&
        messageHighlightConfig &&
        hasHighlightKeywords(messageHighlightConfig.keywords)
      ) {
        const {
          // 要匹配的关键词，可以是单个字符串，也可以是字符串数组。
          keywords,
          // 是否自动转义正则特殊字符，避免关键词中包含 []() 等字符时匹配异常。
          autoEscape,
          // 是否区分大小写。
          caseSensitive,
          // 命中片段对应的 class / 标签名。
          highlightClass,
          highlightTag,
          // 未命中片段对应的 class / 标签名。
          unhighlightClass,
          unhighlightTag,
        } = messageHighlightConfig;

        return (
          <Highlight
            // 外层继续使用 Dialog 原本的消息容器结构，保持布局与样式一致。
            tag="div"
            class={classNames}
            // Highlight 会基于原始 message 字符串查找关键词并拆分节点。
            sourceString={content}
            // 以下配置全部透传给 Highlight，用来控制匹配规则与生成标签。
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

      // 不需要高亮时，保持原来的普通文本 / 自定义节点渲染方式。
      return <div class={classNames}>{content}</div>;
    };

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
          {/*
            Dialog 不重复造输入框，直接复用 Field 的现成能力：
            - text / textarea
            - rules 校验
            - formatter 格式化
            - maxlength + showWordLimit 字数统计
            - clearable / autosize 等常用输入体验
          */}
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
          // 这里通过切换 key 强制重建内容区，
          // 避免 allowHtml 切换时复用旧节点，参考 issue #7963。
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

            这次新增 inputConfig 的目标，就是让 2 + 3 可以同时存在。
            所以只要没有 default slot，就允许 message 和 input 一起渲染。
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
              key={button.action}
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

      if (shouldUseVerticalButtonLayout()) {
        // 纵向布局优先级高于 round-button，避免主题样式与布局规则互相冲突。
        return renderButtons(true);
      }

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
