import { ref, watch, defineComponent, type PropType } from 'vue';
import { useCustomFieldValue } from '@vant/use';
import { createNamespace } from '../../utils';
import './ProFormDeliverySlotField.less';
import { Popup } from '../../popup';
import Calendar from '../../calendar';
import { RadioGroup } from '../../radio-group';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Button } from '../../button';

const [, bem] = createNamespace('pro-form-delivery-slot');

export type DeliverySlotValue = {
  date: string;
  period: string;
  urgent: boolean;
};

export type DeliveryPeriodOption = {
  label: string;
  value: string;
};

const defaultFormatDate = (date: Date) =>
  `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

function parseDateString(dateStr: string): Date | undefined {
  if (!dateStr) {
    return undefined;
  }
  const parts = dateStr.split(/[/-]/).map(Number);
  if (parts.length < 3) {
    return undefined;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isEmptyValue(value: DeliverySlotValue | undefined | null) {
  return !value?.date || !value?.period;
}

export default defineComponent({
  name: 'ProFormDeliverySlotField',

  props: {
    modelValue: {
      type: Object as PropType<DeliverySlotValue>,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: '请选择配送时段',
    },
    periodOptions: {
      type: Array as PropType<DeliveryPeriodOption[]>,
      default: () => [],
    },
    urgentLabel: {
      type: String,
      default: '加急配送',
    },
    popupTitle: {
      type: String,
      default: '选择配送时段',
    },
    confirmText: {
      type: String,
      default: '确定',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    urgentTag: {
      type: String,
      default: '加急',
    },
    dateTitle: {
      type: String,
      default: '配送日期',
    },
    periodTitle: {
      type: String,
      default: '配送时段',
    },
    disabled: Boolean,
    readonly: Boolean,
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const draft = ref<DeliverySlotValue>({
      date: '',
      period: '',
      urgent: false,
    });

    useCustomFieldValue(() => props.modelValue);

    const syncDraftFromModel = () => {
      draft.value = {
        date: props.modelValue?.date ?? '',
        period: props.modelValue?.period ?? props.periodOptions[0]?.value ?? '',
        urgent: props.modelValue?.urgent ?? false,
      };
    };

    watch(
      () => props.modelValue,
      () => {
        if (!show.value) {
          syncDraftFromModel();
        }
      },
      { deep: true },
    );

    const open = () => {
      if (props.disabled) {
        return;
      }
      syncDraftFromModel();
      show.value = true;
    };

    const close = () => {
      show.value = false;
    };

    const onConfirm = () => {
      if (props.disabled || props.readonly) {
        return;
      }
      if (!draft.value.date || !draft.value.period) {
        return;
      }
      emit('update:modelValue', { ...draft.value });
      close();
    };

    const onCalendarConfirm = (date: Date) => {
      if (props.disabled || props.readonly) {
        return;
      }
      draft.value = {
        ...draft.value,
        date: defaultFormatDate(date),
      };
    };

    const panelLocked = () => props.disabled || props.readonly;

    const resolvePeriodLabel = (period: string) =>
      props.periodOptions.find((item) => item.value === period)?.label ?? period;

    const formatSummary = (value: DeliverySlotValue) => {
      const periodLabel = resolvePeriodLabel(value.period);
      const urgentText = value.urgent ? ` · ${props.urgentTag}` : '';
      return `${value.date} ${periodLabel}${urgentText}`;
    };

    return () => {
      const empty = isEmptyValue(props.modelValue);
      const calendarDefault = parseDateString(draft.value.date);

      return (
        <div class={bem()}>
          <div
            class={bem('trigger', {
              placeholder: empty,
              disabled: props.disabled,
              readonly: props.readonly,
            })}
            role="button"
            tabindex={props.disabled ? undefined : 0}
            onClick={open}
          >
            {empty ? props.placeholder : formatSummary(props.modelValue!)}
          </div>

          <Popup
            show={show.value}
            round
            position="bottom"
            teleport="body"
            safeAreaInsetBottom
            style={{ height: '78%' }}
            onUpdate:show={(visible: boolean) => {
              show.value = visible;
            }}
          >
            <div class={bem('panel')}>
              <div class={bem('header')}>{props.popupTitle}</div>

              <div class={bem('section')}>
                <div class={bem('section-title')}>{props.dateTitle}</div>
                <Calendar
                  poppable={false}
                  showConfirm={false}
                  readonly={props.readonly}
                  defaultDate={calendarDefault}
                  onConfirm={onCalendarConfirm}
                />
              </div>

              <div class={bem('section')}>
                <div class={bem('section-title')}>{props.periodTitle}</div>
                <RadioGroup
                  modelValue={draft.value.period}
                  direction="horizontal"
                  class={bem('periods')}
                  disabled={panelLocked()}
                  onUpdate:modelValue={(period: string) => {
                    draft.value.period = period;
                  }}
                >
                  {props.periodOptions.map((opt) => (
                    <Radio
                      key={opt.value}
                      name={opt.value}
                      disabled={panelLocked()}
                    >
                      {opt.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>

              <div class={bem('row')}>
                <span>{props.urgentLabel}</span>
                <Switch
                  modelValue={draft.value.urgent}
                  size="22px"
                  disabled={panelLocked()}
                  onUpdate:modelValue={(urgent: boolean) => {
                    draft.value.urgent = urgent;
                  }}
                />
              </div>

              <div class={bem('footer')}>
                <Button block onClick={close}>
                  {props.cancelText}
                </Button>
                <Button
                  block
                  type="primary"
                  disabled={
                    panelLocked() ||
                    !draft.value.date ||
                    !draft.value.period
                  }
                  onClick={onConfirm}
                >
                  {props.confirmText}
                </Button>
              </div>
            </div>
          </Popup>
        </div>
      );
    };
  },
});
