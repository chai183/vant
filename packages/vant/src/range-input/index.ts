import { withInstall } from '../utils';
import _RangeInput from './RangeInput';

export const RangeInput = withInstall(_RangeInput);
export default RangeInput;
export { rangeInputProps } from './RangeInput';
export type { RangeInputProps } from './RangeInput';
export type {
  RangeInputThemeVars,
  RangeInputShortcut,
  RangeInputDateShortcutType,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanRangeInput: typeof RangeInput;
  }
}
