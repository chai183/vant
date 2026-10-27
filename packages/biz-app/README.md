# biz-app

基于 `packages/digital-workforce` 架构精简的业务开发工程，UI 使用本仓库的 `vant`（workspace），替代 Element Plus。

## 技术栈

- Vue 3 + Vite + TypeScript + Pinia + Vue Router
- Vant（`packages/vant`）+ `@vant/auto-import-resolver`
- UnoCSS / Less / Sass
- vite-plugin-mock

## 目录结构（对齐 digital-workforce）

```text
src/
  _assets/       # 静态资源、样式、图标
  _composables/  # 通用组合式 API
  _constants/    # 常量
  _utils/        # 工具方法
  layouts/       # 布局（NavBar + Tabbar）
  locales/       # i18n
  mock/          # mock 接口
  pages/         # 页面（与 router/modules 对应）
  pinia/         # 全局状态
  plugins/       # 插件安装
  router/        # 路由与守卫
  services/      # API 请求
```

## 开发

在仓库根目录安装依赖后：

```bash
pnpm --dir ./packages/biz-app dev
# 或根目录
pnpm dev:biz
```

## 说明

- `packages/digital-workforce` 以 git submodule 接入（见仓库根目录 `.gitmodules`），仅作架构参考，已从 pnpm workspace 排除；克隆主仓时请加 `--recurse-submodules`，或事后执行 `git submodule update --init`
- 业务页面请在 `src/pages` 新增，并在 `src/router/modules` 注册路由
