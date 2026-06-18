import { withInstall } from '../utils';
import _Search from './Search';

export const Search = withInstall(_Search);
export default Search;
export { searchProps } from './Search';
export type { SearchProps } from './Search';
export type {
  SearchShape,
  SearchScene,
  SearchInstance,
  SearchThemeVars,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanSearch: typeof Search;
  }
}
