import { withInstall } from '../utils';
import _ProForm from './ProForm';

export const ProForm = withInstall(_ProForm);
export default ProForm;
export { proFormProps } from './ProForm';
export type { ProFormProps } from './ProForm';
export type {
  ProFormColumn,
  ProFormOption,
  ProFormComponentMap,
  ProFormRenderContext,
  ProFormComponentRender,
  ProFormBuiltinComponent,
  ProFormThemeVars,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanProForm: typeof ProForm;
  }
}
