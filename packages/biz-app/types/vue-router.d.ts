import type { SvgName } from '~virtual/svg-component';
import 'vue-router';

export {};

declare module 'vue-router' {
  interface RouteMeta {
    /** 侧边栏 / 导航栏标题 */
    title?: string;
    /** SVG 图标名（需放入 src/_assets/icons） */
    svgIcon?: SvgName;
    /** Vant Icon 名称（与 svgIcon 同时设置时 svgIcon 优先） */
    vanIcon?: string;
    /** 默认 false，为 true 时不在导航中展示 */
    hidden?: boolean;
    /** 可进入该路由的角色 */
    roles?: string[];
    /** 可进入该路由的权限标识 */
    permissions?: string[];
    /** 默认 true，为 false 时不在面包屑中显示 */
    breadcrumb?: boolean;
    /** 是否固定在标签栏 */
    affix?: boolean;
    /** 父路由始终显示 */
    alwaysShow?: boolean;
    /** 高亮对应侧边栏菜单 */
    activeMenu?: string;
    /** 是否缓存页面（需路由与组件 Name 一致） */
    keepAlive?: boolean;
    /** 是否在底部 Tabbar 显示 */
    tabbar?: boolean;
  }
}
