import type { JSX } from 'vue/jsx-runtime';
import ProFormPickerField from './fields/ProFormPickerField';
import ProFormRadioField from './fields/ProFormRadioField';
import ProFormCheckboxField from './fields/ProFormCheckboxField';
import ProFormDatePickerField from './fields/ProFormDatePickerField';
import ProFormAreaField from './fields/ProFormAreaField';
import ProFormAreaStepCascaderField from './fields/ProFormAreaStepCascaderField';
import ProFormCalendarField from './fields/ProFormCalendarField';
import ProFormMoneyField from './fields/ProFormMoneyField';
import ProFormRangeInputField from './fields/ProFormRangeInputField';
import ProFormFieldChildrenField from './fields/ProFormFieldChildrenField';
import ProFormUploaderFileField from './fields/ProFormUploaderFileField';
import type { ProFormColumn } from './types';
import type { FieldProps } from '../field/Field';
import {
  mergeBuiltinFieldComponentProps,
  resolveFormDisabled,
  resolveFormReadonly,
} from './resolveFormState';

export type BuiltinFieldRenderContext = {
  column: ProFormColumn;
  value: unknown;
  setValue: (value: unknown) => void;
  fieldProps: Partial<FieldProps>;
  formDisabled?: boolean;
  formReadonly?: boolean;
};

export function renderBuiltinField(
  ctx: BuiltinFieldRenderContext,
): JSX.Element | null {
  const { column, value, setValue, fieldProps, formDisabled, formReadonly } =
    ctx;
  const disabled = resolveFormDisabled(
    formDisabled,
    fieldProps,
    column.componentProps,
  );
  const readonly = resolveFormReadonly(
    formReadonly,
    fieldProps,
    column.componentProps,
  );
  const componentProps = mergeBuiltinFieldComponentProps(
    column.component ?? '',
    column.componentProps ?? {},
    { disabled, readonly },
  );
  const bind = {
    fieldProps,
    componentProps,
    modelValue: value as string | number,
    'onUpdate:modelValue': setValue,
  };

  switch (column.component) {
    case 'picker':
      return <ProFormPickerField {...bind} />;
    case 'radioPicker':
      return (
        <ProFormRadioField
          fieldProps={fieldProps}
          componentProps={{
            ...componentProps,
            options: column.options ?? componentProps.options,
          }}
          modelValue={value as string | number}
          onUpdate:modelValue={setValue}
        />
      );
    case 'checkboxPicker':
      return (
        <ProFormCheckboxField
          fieldProps={fieldProps}
          componentProps={{
            ...componentProps,
            options: column.options ?? componentProps.options,
          }}
          modelValue={Array.isArray(value) ? value : []}
          onUpdate:modelValue={setValue}
        />
      );
    case 'datePicker':
      return <ProFormDatePickerField {...bind} />;
    case 'area':
      return <ProFormAreaField {...bind} />;
    case 'areaStepCascader':
      return <ProFormAreaStepCascaderField {...bind} />;
    case 'calendar':
      return <ProFormCalendarField {...bind} />;
    case 'fieldMoney':
      return <ProFormMoneyField {...bind} />;
    case 'fieldChildren':
      return (
        <ProFormFieldChildrenField
          fieldProps={fieldProps}
          componentProps={componentProps}
          modelValue={Array.isArray(value) ? value : ['']}
          onUpdate:modelValue={setValue}
        />
      );
    case 'rangeInput':
      return (
        <ProFormRangeInputField
          fieldProps={fieldProps}
          componentProps={componentProps}
          modelValue={Array.isArray(value) ? (value as string[]) : ['', '']}
          onUpdate:modelValue={setValue}
        />
      );
    case 'uploaderFile':
      return (
        <ProFormUploaderFileField
          fieldProps={fieldProps}
          componentProps={componentProps}
          modelValue={Array.isArray(value) ? value : []}
          onUpdate:modelValue={setValue}
        />
      );
    default:
      return null;
  }
}
