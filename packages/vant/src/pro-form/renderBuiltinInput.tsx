import type { JSX } from 'vue/jsx-runtime';
import { omit } from '../utils';
import { Switch } from '../switch';
import { Checkbox } from '../checkbox';
import { CheckboxGroup } from '../checkbox-group';
import { RadioGroup } from '../radio-group';
import { Stepper } from '../stepper';
import { Rate } from '../rate';
import { Slider } from '../slider';
import { Uploader } from '../uploader';
import { mergeBuiltinInputProps } from './resolveFormState';
import type {
  ProFormColumn,
  ProFormOption,
  ProFormRenderContext,
} from './types';

function defaultOptions(column: ProFormColumn): ProFormOption[] {
  const base = column.label ?? '';
  return [
    { label: `${base} 1`, value: '1' },
    { label: `${base} 2`, value: '2' },
  ];
}

function renderRadioGroupInput(
  column: ProFormColumn,
  props: Record<string, unknown>,
  value: unknown,
  setValue: (value: unknown) => void,
) {
  const options =
    column.options ??
    (props.options as ProFormOption[] | undefined) ??
    defaultOptions(column);
  const radioProps = omit(props, ['options']);

  return (
    <RadioGroup
      {...(radioProps.isList ? {} : { direction: 'horizontal' })}
      {...radioProps}
      modelValue={value}
      options={options}
      onUpdate:modelValue={setValue}
    />
  );
}

export function renderBuiltinInput(
  ctx: ProFormRenderContext,
): JSX.Element | null {
  const { column, value, setValue, disabled, readonly } = ctx;
  const props = mergeBuiltinInputProps(
    column.component ?? '',
    column.componentProps ?? {},
    { disabled, readonly },
  );
  switch (column.component) {
    case 'switch':
      return (
        <Switch
          {...props}
          modelValue={value}
          onUpdate:modelValue={setValue}
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          shape="square"
          {...props}
          modelValue={value}
          onUpdate:modelValue={setValue}
        />
      );
    case 'checkboxGroup': {
      const options =
        column.options ??
        (props.options as ProFormOption[] | undefined) ??
        defaultOptions(column);
      const groupProps = omit(props, ['options']);

      return (
        <CheckboxGroup
          {...(groupProps.isList ? {} : { direction: 'horizontal' })}
          {...groupProps}
          modelValue={value as unknown[]}
          options={options}
          onUpdate:modelValue={setValue}
        />
      );
    }
    case 'radio':
    case 'radioGroup':
      return renderRadioGroupInput(column, props, value, setValue);
    case 'stepper':
      return (
        <Stepper
          {...props}
          modelValue={value as number}
          onUpdate:modelValue={setValue}
        />
      );
    case 'rate':
      return (
        <Rate
          {...props}
          modelValue={value as number}
          onUpdate:modelValue={setValue}
        />
      );
    case 'slider':
      return (
        <Slider
          {...props}
          modelValue={value as number}
          onUpdate:modelValue={setValue}
        />
      );
    case 'uploader':
      return (
        <Uploader
          {...props}
          modelValue={value as []}
          onUpdate:modelValue={setValue}
        />
      );
    default:
      return null;
  }
}
