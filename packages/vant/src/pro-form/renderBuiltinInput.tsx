import type { JSX } from 'vue/jsx-runtime';
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

export function renderBuiltinInput(
  ctx: ProFormRenderContext,
): JSX.Element | null {
  const { column, value, setValue, disabled, readonly } = ctx;
  const props = mergeBuiltinInputProps(
    column.component ?? '',
    column.componentProps ?? {},
    { disabled, readonly },
  );
  const locked = disabled || readonly;

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
      const options = column.options ?? defaultOptions(column);

      if (props.isList) {
        return (
          <CheckboxGroup
            {...props}
            modelValue={value as unknown[]}
            options={options}
            onUpdate:modelValue={setValue}
          />
        );
      }

      return (
        <CheckboxGroup
          direction="horizontal"
          {...props}
          modelValue={value as unknown[]}
          onUpdate:modelValue={setValue}
        >
          {options.map((opt) => (
            <Checkbox
              key={String(opt.value)}
              name={opt.value}
              shape="square"
              disabled={locked || opt.disabled}
            >
              {opt.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      );
    }
    case 'radio': {
      const options = column.options ?? defaultOptions(column);

      return (
        <RadioGroup
          {...(props.isList ? {} : { direction: 'horizontal' })}
          {...props}
          modelValue={value}
          options={options}
          onUpdate:modelValue={setValue}
        />
      );
    }
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
