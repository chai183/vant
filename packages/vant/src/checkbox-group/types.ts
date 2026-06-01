import type { ComponentPublicInstance } from 'vue';
import type { Numeric } from '../utils';
import type { CellProps } from '../cell';
import type { CheckboxGroupProps } from './CheckboxGroup';
import type { CheckerParent, CheckerDirection } from '../checkbox/Checker';

export type CheckboxGroupOption = {
  label: string;
  value: Numeric;
  disabled?: boolean;
  cellProps?: Partial<CellProps>;
};

export type CheckboxGroupDirection = CheckerDirection;

export type CheckboxGroupToggleAllOptions =
  | boolean
  | {
      checked?: boolean;
      skipDisabled?: boolean;
    };

export type CheckboxGroupExpose = {
  toggleAll: (options?: CheckboxGroupToggleAllOptions) => void;
};

export type CheckboxGroupInstance = ComponentPublicInstance<
  CheckboxGroupProps,
  CheckboxGroupExpose
>;

export type CheckboxGroupProvide = CheckerParent & {
  props: CheckboxGroupProps;
  updateValue: (value: unknown[]) => void;
};
