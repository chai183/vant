import { ref, computed, defineComponent, type ExtractPropTypes } from 'vue';

// Utils
import {
  pick,
  extend,
  truthProp,
  preventDefault,
  makeStringProp,
  createNamespace,
} from '../utils';
import { fieldSharedProps } from '../field/Field';
import type { FieldClearTrigger } from '../field/types';

// Composables
import { useId } from '../composables/use-id';
import { useExpose } from '../composables/use-expose';

// Components
import { Field, FieldInstance } from '../field';

// Types
import type { SearchScene, SearchShape } from './types';

const [name, bem, t] = createNamespace('search');

export const searchProps = extend({}, fieldSharedProps, {
  label: String,
  shape: makeStringProp<SearchShape>('square'),
  leftIcon: makeStringProp('search'),
  clearable: truthProp,
  clearTrigger: makeStringProp<FieldClearTrigger>('always'),
  actionText: String,
  background: String,
  showAction: Boolean,
  scene: makeStringProp<SearchScene>('default'),
});

export type SearchProps = ExtractPropTypes<typeof searchProps>;

export default defineComponent({
  name,

  props: searchProps,

  emits: [
    'blur',
    'focus',
    'clear',
    'search',
    'cancel',
    'clickInput',
    'clickLeftIcon',
    'clickRightIcon',
    'update:modelValue',
  ],

  setup(props, { emit, slots, attrs }) {
    const id = useId();
    const fieldRef = ref<FieldInstance>();
    const focused = ref(false);
    const filterBarSearchActivated = ref(false);

    const effectiveShowAction = computed(
      () =>
        props.showAction ||
        props.scene === 'search-page' ||
        props.scene === 'filter-bar',
    );

    const effectiveShape = computed(() => {
      if (props.scene === 'search-page' || props.scene === 'filter-bar') {
        return 'round';
      }
      if (props.scene === 'filter-inner') {
        return 'square';
      }
      return props.shape;
    });

    const effectiveLeftIcon = computed(() =>
      props.scene === 'filter-inner' ? '' : props.leftIcon,
    );

    const filterBarActionActive = computed(
      () =>
        props.scene === 'filter-bar' &&
        (focused.value || filterBarSearchActivated.value),
    );

    const onCancel = () => {
      if (!slots.action) {
        emit('update:modelValue', '');
        emit('cancel');
      }
    };

    const onFilterBarAction = () => {
      filterBarSearchActivated.value = true;
      emit('search', props.modelValue);
    };

    const onActionClick = () => {
      if (slots.action) {
        return;
      }
      if (props.scene === 'filter-bar') {
        onFilterBarAction();
      } else {
        onCancel();
      }
    };

    const onKeypress = (event: KeyboardEvent) => {
      const ENTER_CODE = 13;
      if (event.keyCode === ENTER_CODE) {
        preventDefault(event);
        if (props.scene === 'filter-bar') {
          filterBarSearchActivated.value = true;
        }
        emit('search', props.modelValue);
      }
    };

    const getInputId = () => props.id || `${id}-input`;

    const renderLabel = () => {
      if (props.scene === 'filter-inner') {
        return;
      }
      if (slots.label || props.label) {
        return (
          <label
            class={bem('label')}
            for={getInputId()}
            data-allow-mismatch="attribute"
          >
            {slots.label ? slots.label() : props.label}
          </label>
        );
      }
    };

    const getActionText = () => {
      if (props.scene === 'filter-bar') {
        return props.actionText || t('filterSearch');
      }
      return props.actionText || t('cancel');
    };

    const renderAction = () => {
      if (!effectiveShowAction.value) {
        return;
      }
      const text = getActionText();
      return (
        <div
          class={bem('action', {
            active: filterBarActionActive.value,
          })}
          role="button"
          tabindex={0}
          onClick={onActionClick}
        >
          {slots.action ? slots.action() : text}
        </div>
      );
    };

    const blur = () => fieldRef.value?.blur();
    const focus = () => fieldRef.value?.focus();
    const onBlur = (event: Event) => {
      focused.value = false;
      if (props.scene === 'filter-bar') {
        filterBarSearchActivated.value = false;
      }
      emit('blur', event);
    };
    const onFocus = (event: Event) => {
      focused.value = true;
      emit('focus', event);
    };
    const onClear = (event: MouseEvent) => emit('clear', event);
    const onClickInput = (event: MouseEvent) => emit('clickInput', event);
    const onClickLeftIcon = (event: MouseEvent) => emit('clickLeftIcon', event);
    const onClickRightIcon = (event: MouseEvent) =>
      emit('clickRightIcon', event);

    const fieldPropNames = Object.keys(fieldSharedProps) as Array<
      keyof typeof fieldSharedProps
    >;

    const renderField = () => {
      const picked = pick(props, fieldPropNames);
      const fieldAttrs = extend({}, attrs, picked, {
        id: getInputId(),
        leftIcon: effectiveLeftIcon.value,
      });

      if (props.scene === 'filter-inner') {
        fieldAttrs.rightIcon = undefined;
      }

      const onInput = (value: string) => emit('update:modelValue', value);

      return (
        <Field
          v-slots={pick(slots, ['left-icon', 'right-icon'])}
          ref={fieldRef}
          type="search"
          class={bem('field', { 'with-message': fieldAttrs.errorMessage })}
          border={false}
          labelAlign="left"
          onBlur={onBlur}
          onFocus={onFocus}
          onClear={onClear}
          onKeypress={onKeypress}
          onClickInput={onClickInput}
          onClickLeftIcon={onClickLeftIcon}
          onClickRightIcon={onClickRightIcon}
          onUpdate:modelValue={onInput}
          {...fieldAttrs}
        />
      );
    };

    useExpose({ focus, blur });

    return () => (
      <div
        class={bem({
          'show-action': effectiveShowAction.value,
          'search-page': props.scene === 'search-page',
          'filter-bar': props.scene === 'filter-bar',
          'filter-inner': props.scene === 'filter-inner',
        })}
        style={{ background: props.background }}
      >
        {props.scene === 'filter-inner' ? null : slots.left?.()}
        <div class={bem('content', effectiveShape.value)}>
          {renderLabel()}
          {renderField()}
        </div>
        {renderAction()}
      </div>
    );
  },
});
