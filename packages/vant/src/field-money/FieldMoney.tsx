import {
  defineComponent,
  computed,
  type ExtractPropTypes,
  type StyleValue,
} from 'vue';

// Utils
import {
  extend,
  numericProp,
  truthProp,
  makeStringProp,
  createNamespace,
} from '../utils';

// Components
import Field from '../field';

// Types
import type { FieldTextAlign } from '../field/types';

const [name, bem, t] = createNamespace('field-money');

export const fieldMoneyProps = {
  modelValue: numericProp,
  label: String,
  placeholder: String,
  currency: makeStringProp('¥'),
  labelTooltip: String,
  errorMessage: String,
  inputComment: String,
  showMoneyUppercase: truthProp,
  showMoneyUnit: truthProp,
  moneyUppercaseLabel: String,
  labelAlign: makeStringProp<FieldTextAlign>('top'),
};

export type FieldMoneyProps = ExtractPropTypes<typeof fieldMoneyProps>;

export default defineComponent({
  name,

  inheritAttrs: false,

  props: fieldMoneyProps,

  emits: ['update:modelValue'],

  setup(props, { attrs, emit, slots }) {
    const passAttrs = attrs as Record<string, unknown>;

    const resolvedMoneyUppercaseLabel = computed(
      () => props.moneyUppercaseLabel ?? t('uppercase'),
    );

    return () => {
      const fieldAttrs = extend({}, passAttrs) as Record<string, unknown>;
      const rootClass = fieldAttrs.class;
      const rootStyle = fieldAttrs.style;
      delete fieldAttrs.class;
      delete fieldAttrs.style;

      return (
        <Field
          {...fieldAttrs}
          class={[bem(), rootClass].filter(Boolean)}
          style={rootStyle as StyleValue | undefined}
          type="money"
          modelValue={props.modelValue}
          label={props.label}
          placeholder={props.placeholder}
          labelAlign={props.labelAlign}
          labelTooltip={props.labelTooltip}
          errorMessage={props.errorMessage}
          inputComment={props.inputComment}
          showMoneyUppercase={props.showMoneyUppercase}
          showMoneyUnit={props.showMoneyUnit}
          moneyUppercaseLabel={resolvedMoneyUppercaseLabel.value}
          moneyCurrency={props.currency}
          onUpdate:modelValue={(value: string | number) =>
            emit('update:modelValue', value)
          }
          v-slots={slots}
        />
      );
    };
  },
});
