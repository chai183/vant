import type { ComponentPublicInstance } from 'vue';
import type { Numeric } from '../utils';
import type { CascadeTabsProps } from './CascadeTabs';

export type CascadeTabOption = {
  title: string;
  disabled?: boolean;
  children?: CascadeTabOption[];
};

export type CascadeTabsActivePath = Numeric[];

export type CascadeTabsChangeParams = {
  active: CascadeTabsActivePath;
  titles: string[];
};

export type CascadeTabsInstance = ComponentPublicInstance<CascadeTabsProps>;
