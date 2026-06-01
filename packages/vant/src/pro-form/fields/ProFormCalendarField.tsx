import { ref, defineComponent, type PropType } from 'vue';
import { Field } from '../../field';
import Calendar from '../../calendar';
import { builtinFieldProps, useFormFieldDisabled } from './shared';

const defaultFormatDate = (date: Date) =>
  `${date.getMonth() + 1}/${date.getDate()}`;

export default defineComponent({
  name: 'ProFormCalendarField',

  props: {
    ...builtinFieldProps,
    formatDate: {
      type: Function as PropType<(date: Date) => string>,
      default: defaultFormatDate,
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const { guardOpen } = useFormFieldDisabled(() => props.fieldProps);

    const onConfirm = (date: Date) => {
      const format =
        (props.componentProps.formatDate as typeof defaultFormatDate) ||
        props.formatDate;
      emit('update:modelValue', format(date));
      show.value = false;
    };

    const open = () => {
      guardOpen(() => {
        show.value = true;
      });
    };

    return () => {
      const { formatDate: _format, ...calendarProps } = props.componentProps;
      const { placeholder, ...restFieldProps } = props.fieldProps;

      return (
        <>
          <Field
            {...restFieldProps}
            modelValue={props.modelValue}
            readonly
            is-link
            placeholder={placeholder}
            onClickInput={open}
          />
          <Calendar
            round
            teleport="body"
            {...calendarProps}
            show={show.value}
            onUpdate:show={(v: boolean) => {
              show.value = v;
            }}
            onConfirm={onConfirm}
          />
        </>
      );
    };
  },
});
