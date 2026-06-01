import type { Numeric } from '../utils';
import type { CellProps } from '../cell';

export type RadioGroupOption = {
  label: string;
  value: Numeric;
  disabled?: boolean;
  cellProps?: Partial<CellProps>;
};
