import { getLayoutsConfig } from '@/_utils/_local-storage';

export interface LayoutsConfig {
  /** 是否显示底部 Tabbar */
  showTabbar: boolean;
  /** 是否显示顶部 NavBar */
  showNavbar: boolean;
  /** 是否缓存标签栏 */
  cacheTagsView: boolean;
  /** 是否显示灰色模式 */
  showGreyMode: boolean;
  /** 是否显示色弱模式 */
  showColorWeakness: boolean;
}

const DEFAULT_CONFIG: LayoutsConfig = {
  showTabbar: true,
  showNavbar: true,
  cacheTagsView: false,
  showGreyMode: false,
  showColorWeakness: false,
};

export const layoutsConfig: LayoutsConfig = {
  ...DEFAULT_CONFIG,
  ...getLayoutsConfig(),
};
