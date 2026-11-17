import { withInstall } from '../utils';
import _Step, { stepProps } from './Step';

export const Step = withInstall(_Step);
export default Step;
export { stepProps };
export type { StepThemeVars, StepStatus } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanStep: typeof Step;
  }
}
