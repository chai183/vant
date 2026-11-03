import { ref, defineComponent, type PropType } from 'vue';
import { omit } from '../../utils';
import { Field } from '../../field';
import { Popup } from '../../popup';
import { CheckboxGroup } from '../../checkbox-group';
import { List } from '../../list';
import { Search } from '../../search';
import {
  defaultPopupProps,
  resolveFieldPopupProps,
  useFormFieldState,
  getFormFieldOptions,
  resolveOptionLabels,
  builtinFieldProps,
} from './shared';
import {
  useRemoteListOptions,
  type LoadOptionsFn,
} from './useRemoteListOptions';
import type { FieldProps } from '../../field/Field';

const proFormCheckboxFieldProps = {
  ...builtinFieldProps,
  modelValue: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },
  fieldProps: {
    type: Object as PropType<Partial<FieldProps>>,
    default: () => ({}),
  },
};

export default defineComponent({
  name: 'ProFormCheckboxField',

  props: proFormCheckboxFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const draft = ref<unknown[]>([]);
    const { guardOpen, isDisabled, isReadonly } = useFormFieldState(
      () => props.fieldProps,
    );

    const resolveLoadOptions = () => {
      const fn = props.componentProps?.loadOptions as LoadOptionsFn | undefined;
      return typeof fn === 'function' ? fn : undefined;
    };

    const {
      remoteOptions,
      listLoading,
      finished,
      listError,
      keyword,
      listEpoch,
      onLoad,
      onSearch,
    } = useRemoteListOptions({
      resolveLoadOptions,
      getPageSize: () => props.componentProps?.pageSize,
    });

    const getModelValue = () =>
      Array.isArray(props.modelValue) ? props.modelValue : [];

    const syncDraftFromModel = () => {
      draft.value = [...getModelValue()];
    };

    const onDraftChange = (value: unknown[]) => {
      if (isDisabled() || isReadonly()) {
        return;
      }
      draft.value = value;
    };

    const onConfirm = () => {
      if (isDisabled() || isReadonly()) {
        return;
      }
      emit('update:modelValue', [...draft.value]);
    };

    const open = () => {
      guardOpen(() => {
        syncDraftFromModel();
        show.value = true;
      });
    };

    return () => {
      const label = props.fieldProps.label;
      const staticOptions = getFormFieldOptions(props.componentProps);
      const remote = Boolean(
        props.componentProps?.isList && resolveLoadOptions(),
      );
      const options = remote
        ? remoteOptions.value
        : remoteOptions.value.length > 0
          ? remoteOptions.value
          : staticOptions;
      const modelValue = getModelValue();
      const { popupHeaderProps, restComponentProps } = resolveFieldPopupProps(
        props.componentProps,
        {
          fallbackTitle:
            label !== undefined && label !== null ? String(label) : undefined,
          confirmable: true,
        },
      );
      const checkboxProps = omit(restComponentProps, [
        'options',
        'loadOptions',
        'pageSize',
      ]);
      const locked = isDisabled() || isReadonly();
      const labelOptions =
        remoteOptions.value.length > 0 ? remoteOptions.value : options;
      const displayValue = resolveOptionLabels(labelOptions, modelValue);
      const popupBottom = props.popupSlots?.['popup-bottom'];
      const showSearch = Boolean(checkboxProps.showSearch);

      return (
        <>
          <Field
            {...props.fieldProps}
            modelValue={displayValue}
            readonly
            is-link
            onClickInput={open}
          >
            {{ ...props.fieldSlots }}
          </Field>
          <Popup
            {...defaultPopupProps}
            {...popupHeaderProps}
            show={show.value}
            onUpdate:show={(v: boolean) => {
              show.value = v;
            }}
            onConfirm={onConfirm}
          >
            {remote && show.value ? (
              <div class="van-pro-form-field-popup-panel">
                {showSearch ? (
                  <Search
                    class="van-pro-form-field-popup-search"
                    modelValue={keyword.value}
                    placeholder={
                      (checkboxProps.searchPlaceholder as string) || undefined
                    }
                    onUpdate:modelValue={onSearch}
                  />
                ) : null}
                <div class="van-pro-form-field-popup-body van-pro-form-field-popup-body--list van-pro-form-field-popup-body--remote">
                  <List
                    key={listEpoch.value}
                    class="van-pro-form-field-popup-list"
                    loading={listLoading.value}
                    finished={finished.value}
                    error={listError.value}
                    finishedText="没有更多了"
                    onLoad={onLoad}
                    onUpdate:loading={(v: boolean) => {
                      listLoading.value = v;
                    }}
                    onUpdate:error={(v: boolean) => {
                      listError.value = v;
                    }}
                  >
                    <CheckboxGroup
                      {...omit(checkboxProps, [
                        'showSearch',
                        'searchPlaceholder',
                      ])}
                      isList
                      showSearch={false}
                      disabled={locked}
                      modelValue={draft.value}
                      options={options}
                      onUpdate:modelValue={onDraftChange}
                    />
                  </List>
                </div>
              </div>
            ) : (
              <div
                class={[
                  'van-pro-form-field-popup-body',
                  checkboxProps.isList && 'van-pro-form-field-popup-body--list',
                  showSearch && 'van-pro-form-field-popup-body--show-search',
                ]}
              >
                <CheckboxGroup
                  {...checkboxProps}
                  disabled={locked}
                  modelValue={draft.value}
                  options={options}
                  onUpdate:modelValue={onDraftChange}
                />
              </div>
            )}
            {popupBottom ? popupBottom() : null}
          </Popup>
        </>
      );
    };
  },
});
