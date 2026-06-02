import {
  nextTick,
  computed,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  pick,
  extend,
  truthProp,
  makeArrayProp,
  makeStringProp,
  createNamespace,
  HAPTICS_FEEDBACK,
} from '../utils';

// Components
import { Icon } from '../icon';
import { Popup } from '../popup';
import { Loading } from '../loading';
import { popupSharedProps, popupSharedPropKeys } from '../popup/shared';

// Types
import type { ActionSheetGridOptions } from './types';

const [name, bem] = createNamespace('action-sheet');

const DEFAULT_GRID_OPTIONS: Required<ActionSheetGridOptions> = {
  scrollable: true,
  columns: 3,
};

export type ActionSheetAction = {
  icon?: string;
  image?: string;
  name?: string;
  color?: string;
  subname?: string;
  loading?: boolean;
  disabled?: boolean;
  callback?: (action: ActionSheetAction) => void;
  className?: unknown;
};

export const actionSheetProps = extend({}, popupSharedProps, {
  title: String,
  round: truthProp,
  actions: makeArrayProp<ActionSheetAction>(),
  closeIcon: makeStringProp('cross'),
  closeable: truthProp,
  cancelText: String,
  description: String,
  closeOnPopstate: truthProp,
  closeOnClickAction: Boolean,
  safeAreaInsetBottom: truthProp,
  grid: Boolean,
  gridOptions: Object as PropType<ActionSheetGridOptions>,
});

export type ActionSheetProps = ExtractPropTypes<typeof actionSheetProps>;

const popupInheritKeys = [
  ...popupSharedPropKeys,
  'round',
  'closeOnPopstate',
  'safeAreaInsetBottom',
] as const;

export default defineComponent({
  name,

  props: actionSheetProps,

  emits: ['select', 'cancel', 'update:show'],

  setup(props, { slots, emit }) {
    const updateShow = (show: boolean) => emit('update:show', show);

    const gridOptions = computed(() => ({
      scrollable:
        props.gridOptions?.scrollable ?? DEFAULT_GRID_OPTIONS.scrollable,
      columns: props.gridOptions?.columns ?? DEFAULT_GRID_OPTIONS.columns,
    }));

    const onCancel = () => {
      updateShow(false);
      emit('cancel');
    };

    const renderHeader = () => {
      if (props.title) {
        return (
          <div class={bem('header')}>
            {props.title}
            {props.closeable && (
              <Icon
                name={props.closeIcon}
                class={[bem('close'), HAPTICS_FEEDBACK]}
                onClick={onCancel}
              />
            )}
          </div>
        );
      }
    };

    const renderCancel = () => {
      if (slots.cancel || props.cancelText) {
        return [
          <div class={bem('gap')} />,
          <button type="button" class={bem('cancel')} onClick={onCancel}>
            {slots.cancel ? slots.cancel() : props.cancelText}
          </button>,
        ];
      }
    };

    const renderIcon = (action: ActionSheetAction) => {
      if (action.image) {
        return <img class={bem('item-image')} src={action.image} alt="" />;
      }

      if (action.icon) {
        return <Icon class={bem('item-icon')} name={action.icon} />;
      }
    };

    const renderActionContent = (action: ActionSheetAction, index: number) => {
      if (action.loading) {
        return <Loading class={bem('loading-icon')} />;
      }

      if (slots.action) {
        return slots.action({ action, index });
      }

      return [
        <span class={bem('name')}>{action.name}</span>,
        action.subname && <div class={bem('subname')}>{action.subname}</div>,
      ];
    };

    const renderAction = (action: ActionSheetAction, index: number) => {
      const { color, loading, callback, disabled, className } = action;

      const onClick = () => {
        if (disabled || loading) {
          return;
        }

        if (callback) {
          callback(action);
        }

        if (props.closeOnClickAction) {
          updateShow(false);
        }

        nextTick(() => emit('select', action, index));
      };

      return (
        <button
          type="button"
          style={{ color }}
          class={[bem('item', { loading, disabled }), className]}
          onClick={onClick}
        >
          {renderIcon(action)}
          {renderActionContent(action, index)}
        </button>
      );
    };

    const renderDescription = () => {
      if (props.description || slots.description) {
        const content = slots.description
          ? slots.description()
          : props.description;
        return <div class={bem('description')}>{content}</div>;
      }
    };

    const renderGridIcon = (action: ActionSheetAction) => {
      if (action.image) {
        return <img class={bem('grid-item-image')} src={action.image} alt="" />;
      }

      if (action.icon) {
        return <Icon class={bem('grid-item-icon')} name={action.icon} />;
      }
    };

    const renderGridAction = (action: ActionSheetAction, index: number) => {
      const { color, loading, callback, disabled, className } = action;

      const onClick = () => {
        if (disabled || loading) {
          return;
        }

        if (callback) {
          callback(action);
        }

        if (props.closeOnClickAction) {
          updateShow(false);
        }

        nextTick(() => emit('select', action, index));
      };

      return (
        <button
          type="button"
          style={{ color }}
          class={[bem('grid-item', { loading, disabled }), className]}
          onClick={onClick}
        >
          {loading ? (
            <Loading class={bem('loading-icon')} />
          ) : (
            [
              renderGridIcon(action),
              <span class={bem('grid-item-name')}>{action.name}</span>,
            ]
          )}
        </button>
      );
    };

    const renderGridContent = () => {
      const { scrollable, columns } = gridOptions.value;

      return (
        <div
          class={bem('grid', { scrollable })}
          style={
            {
              '--van-action-sheet-grid-columns': columns,
            } as Record<string, number>
          }
        >
          {props.actions.map(renderGridAction)}
        </div>
      );
    };

    const renderContent = () => {
      if (props.grid) {
        return renderGridContent();
      }

      return [props.actions.map(renderAction), slots.default?.()];
    };

    return () => (
      <Popup
        class={bem()}
        position="bottom"
        onUpdate:show={updateShow}
        {...pick(props, popupInheritKeys)}
      >
        {renderHeader()}
        {renderDescription()}
        <div class={bem('content')}>{renderContent()}</div>
        {renderCancel()}
      </Popup>
    );
  },
});
