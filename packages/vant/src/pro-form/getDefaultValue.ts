import type { ProFormBuiltinComponent } from './types';

const BUILTIN_DEFAULTS: Record<ProFormBuiltinComponent, unknown> = {
  switch: false,
  checkbox: false,
  checkboxGroup: [],
  radio: '',
  radioGroup: '',
  stepper: 1,
  rate: 0,
  slider: 0,
  uploader: [],
  picker: '',
  radioPicker: '',
  checkboxPicker: [],
  datePicker: '',
  area: '',
  areaStepCascader: '',
  calendar: '',
  fieldMoney: '',
  fieldChildren: [''],
  rangeInput: ['', ''],
  uploaderFile: [],
  field: '',
};

export function getDefaultValueByComponent(component: string): unknown {
  if (component in BUILTIN_DEFAULTS) {
    return BUILTIN_DEFAULTS[component as ProFormBuiltinComponent];
  }
  return undefined;
}
