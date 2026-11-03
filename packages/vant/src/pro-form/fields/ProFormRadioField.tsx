import { ref, defineComponent } from 'vue';
import { omit } from '../../utils';
import { Field } from '../../field';
import { Popup } from '../../popup';
import { RadioGroup } from '../../radio-group';
import { List } from '../../list';
import { Search } from '../../search';
import {
  builtinFieldProps,
  defaultPopupProps,
  resolveFieldPopupProps,
  useFormFieldState,
  getFormFieldOptions,
  resolveOptionLabel,
} from './shared';
import {
  useRemoteListOptions,
  type LoadOptionsFn,
} from './useRemoteListOptions';

export default defineComponent({
  name: 'ProFormRadioField',

  props: builtinFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
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

    const onChange = (value: string | number) => {
      if (isDisabled() || isReadonly()) {
        return;
      }
      emit('update:modelValue', value);
      show.value = false;
    };

    const open = () => {
      guardOpen(() => {
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
      const { popupHeaderProps, restComponentProps } = resolveFieldPopupProps(
        props.componentProps,
        {
          fallbackTitle:
            label !== undefined && label !== null ? String(label) : undefined,
          closeable: true,
        },
      );
      const radioProps = omit(restComponentProps, [
        'options',
        'loadOptions',
        'pageSize',
      ]);
      const locked = isDisabled() || isReadonly();
      const displaySource =
        remoteOptions.value.length > 0 ? remoteOptions.value : options;
      const displayValue = props.modelValue
        ? resolveOptionLabel(displaySource, props.modelValue)
        : '';
      const popupBottom = props.popupSlots?.['popup-bottom'];
      const showSearch = Boolean(radioProps.showSearch);

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
          >
            {remote && show.value ? (
              <div class="van-pro-form-field-popup-panel">
                {showSearch ? (
                  <Search
                    class="van-pro-form-field-popup-search"
                    modelValue={keyword.value}
                    placeholder={
                      (radioProps.searchPlaceholder as string) || undefined
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
                    <RadioGroup
                      {...omit(radioProps, ['showSearch', 'searchPlaceholder'])}
                      isList
                      showSearch={false}
                      disabled={locked}
                      modelValue={props.modelValue}
                      options={options}
                      onUpdate:modelValue={onChange}
                    />
                  </List>
                </div>
              </div>
            ) : (
              <div
                class={[
                  'van-pro-form-field-popup-body',
                  radioProps.isList && 'van-pro-form-field-popup-body--list',
                  showSearch && 'van-pro-form-field-popup-body--show-search',
                ]}
              >
                <RadioGroup
                  {...radioProps}
                  disabled={locked}
                  modelValue={props.modelValue}
                  options={options}
                  onUpdate:modelValue={onChange}
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
