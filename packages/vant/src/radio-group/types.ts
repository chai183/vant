import type { Numeric } from '../utils';
import type { CellProps } from '../cell';

export type RadioGroupOption = {
  label: string;
  value: Numeric;
  disabled?: boolean;
  icon?: string;
  cellProps?: Partial<CellProps>;
};
