import { withInstall } from '../utils';
import _Result from './Result';

export const Result = withInstall(_Result);
export default Result;
export { resultProps } from './Result';
export type { ResultProps } from './Result';
export type {
  ResultStatus,
  ResultButtonLayout,
  ResultThemeVars,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanResult: typeof Result;
  }
}
