import {
  defineComponent,
  computed,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  truthProp,
  makeNumberProp,
  makeStringProp,
  createNamespace,
} from '../utils';

// Components
import { Icon } from '../icon';
import { Button } from '../button';

// Types
import type {
  ResultStatus,
  ResultButtonLayout,
} from './types';

const [name, bem] = createNamespace('result');

const STATUS_ICON_MAP: Record<ResultStatus, string> = {
  waiting: 'underway',
  fail: 'clear',
  warning: 'warning',
  success: 'checked',
};

const DEFAULT_BUTTON_LAYOUT: Record<ResultStatus, ResultButtonLayout> =
  {
    waiting: 'horizontal',
    fail: 'vertical',
    warning: 'hybrid',
    success: 'vertical',
  };

export const resultProps = {
  status: makeStringProp<ResultStatus>('success'),
  title: String,
  description: String,
  icon: String,
  size: makeNumberProp(64),
  buttonLayout: String as PropType<ResultButtonLayout>,
  mainButtonText: String,
  secondaryButtonText: String,
  secondaryButtonText2: String,
  mainButtonDisabled: Boolean,
  secondaryButtonDisabled: Boolean,
  secondaryButtonDisabled2: Boolean,
  mainButtonLoading: Boolean,
  secondaryButtonLoading: Boolean,
  secondaryButtonLoading2: Boolean,
  safeAreaInsetBottom: truthProp,
};

export type ResultProps = ExtractPropTypes<typeof resultProps>;

export default defineComponent({
  name,

  props: resultProps,

  emits: [
    'clickMainButton',
    'clickSecondaryButton',
    'clickSecondaryButton2',
  ],

  setup(props, { slots, emit }) {
    const resolvedButtonLayout = computed(
      () => props.buttonLayout ?? DEFAULT_BUTTON_LAYOUT[props.status],
    );

    const resolvedIcon = computed(
      () => props.icon ?? STATUS_ICON_MAP[props.status],
    );

    const hasMainButton = () =>
      Boolean(props.mainButtonText || slots['main-button']);

    const hasSecondaryButton = () =>
      Boolean(props.secondaryButtonText || slots['secondary-button']);

    const hasSecondaryButton2 = () =>
      Boolean(props.secondaryButtonText2 || slots['secondary-button-2']);

    const hasActions = () =>
      hasMainButton() || hasSecondaryButton() || hasSecondaryButton2();

    const renderIcon = () => {
      if (slots.icon) {
        return <div class={bem('icon', props.status)}>{slots.icon()}</div>;
      }

      return (
        <Icon
          class={bem('icon', props.status)}
          name={resolvedIcon.value}
          size={props.size}
        />
      );
    };

    const renderTitle = () => {
      const title = slots.title ? slots.title() : props.title;

      if (title) {
        return <div class={bem('title', props.status)}>{title}</div>;
      }
    };

    const renderContent = () => {
      if (slots.default) {
        return <div class={bem('content')}>{slots.default()}</div>;
      }
    };

    const renderDescription = () => {
      const description = slots.description
        ? slots.description()
        : props.description;

      if (description) {
        return <div class={bem('description')}>{description}</div>;
      }
    };

    const renderMainButton = () => {
      if (!hasMainButton()) {
        return null;
      }

      if (slots['main-button']) {
        return (
          <div class={bem('action', 'main')}>{slots['main-button']()}</div>
        );
      }

      return (
        <Button
          block
          round
          type="primary"
          class={bem('action', 'main')}
          disabled={props.mainButtonDisabled}
          loading={props.mainButtonLoading}
          onClick={() => emit('clickMainButton')}
        >
          {props.mainButtonText}
        </Button>
      );
    };

    const renderSecondaryButton = (index: 1 | 2) => {
      const slotName =
        index === 1 ? 'secondary-button' : ('secondary-button-2' as const);
      const text =
        index === 1 ? props.secondaryButtonText : props.secondaryButtonText2;
      const disabled =
        index === 1
          ? props.secondaryButtonDisabled
          : props.secondaryButtonDisabled2;
      const loading =
        index === 1
          ? props.secondaryButtonLoading
          : props.secondaryButtonLoading2;
      const hasButton = index === 1 ? hasSecondaryButton() : hasSecondaryButton2();

      if (!hasButton) {
        return null;
      }

      if (slots[slotName]) {
        return (
          <div class={bem('action', 'secondary')}>{slots[slotName]()}</div>
        );
      }

      return (
        <Button
          round
          plain
          type='primary'
          class={bem('action', 'secondary')}
          disabled={disabled}
          loading={loading}
          onClick={() =>
            emit(index === 1 ? 'clickSecondaryButton' : 'clickSecondaryButton2')
          }
        >
          {text}
        </Button>
      );
    };

    const renderActions = () => {
      if (!hasActions()) {
        return null;
      }

      const layout = resolvedButtonLayout.value;
      const mainButton = renderMainButton();
      const secondaryButton = renderSecondaryButton(1);
      const secondaryButton2 = renderSecondaryButton(2);
      const secondaryButtons = [secondaryButton, secondaryButton2].filter(
        Boolean,
      );

      if (layout === 'horizontal') {
        const buttons = [...secondaryButtons, mainButton].filter(Boolean);
        return <div class={bem('actions', layout)}>{buttons}</div>;
      }

      if (layout === 'hybrid') {
        return (
          <div class={bem('actions', layout)}>
            {mainButton}
            {secondaryButtons.length > 0 ? (
              <div class={bem('secondary-row')}>{secondaryButtons}</div>
            ) : null}
          </div>
        );
      }

      const buttons = [mainButton, ...secondaryButtons].filter(Boolean);
      return <div class={bem('actions', layout)}>{buttons}</div>;
    };

    const renderFooter = () => {
      if (slots.footer) {
        return <div class={bem('footer')}>{slots.footer()}</div>;
      }
    };

    return () => (
      <div
        class={[
          bem(),
          {
            'van-safe-area-bottom': props.safeAreaInsetBottom,
          },
        ]}
      >
        {renderIcon()}
        {renderTitle()}
        {renderContent()}
        {renderDescription()}
        {renderActions()}
        {renderFooter()}
      </div>
    );
  },
});
