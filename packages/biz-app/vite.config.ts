/// <reference types="vitest/config" />

import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import SvgComponent from 'unplugin-svg-component/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import svgLoader from 'vite-svg-loader';

/** 判断是否为 mock 辅助文件（非路由定义） */
function isMockHelperFile(fileName: string) {
  return (
    /(?:^|[/\\])(?:[\w-]+-)?(utils|entity|data|formFields|form-fields-data)\.(ts|js)$/i.test(
      fileName,
    ) || /bundled_/i.test(fileName)
  );
}

/** 组件与函数式 API 统一从 vant 入口解析 */
function VantWorkspaceResolver() {
  const apis = new Set([
    'showToast',
    'closeToast',
    'showFailToast',
    'showLoadingToast',
    'showSuccessToast',
    'allowMultipleToast',
    'setToastDefaultOptions',
    'resetToastDefaultOptions',
    'showDialog',
    'closeDialog',
    'showConfirmDialog',
    'showNotify',
    'closeNotify',
    'showImagePreview',
  ]);

  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (name.startsWith('Van')) {
        return {
          name: name.slice(3),
          from: 'vant',
        };
      }

      if (apis.has(name)) {
        return {
          name,
          from: 'vant',
        };
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const { VITE_PUBLIC_PATH, VITE_USE_MOCK } = loadEnv(
    mode,
    process.cwd(),
    '',
  ) as ImportMetaEnv;
  const useMock = VITE_USE_MOCK === 'true';

  return {
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        // 语言包等子路径仍走本地构建产物；组件与 API 从包入口 vant 引入
        'vant/es': resolve(__dirname, '../vant/es'),
        'vant/lib': resolve(__dirname, '../vant/lib'),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      open: true,
      ...(useMock
        ? {}
        : {
            proxy: {
              '/api': {
                target: 'http://localhost:3001',
                ws: false,
                changeOrigin: true,
              },
            },
          }),
      cors: true,
      warmup: {
        clientFiles: ['./src/pinia/**/*.*', './src/router/**/*.*'],
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          },
        },
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2048,
    },
    esbuild:
      mode === 'development'
        ? undefined
        : {
            pure: ['console.log'],
            drop: ['debugger'],
            legalComments: 'none',
          },
    css: {
      preprocessorMaxWorkers: true,
    },
    plugins: [
      vue(),
      vueJsx(),
      viteMockServe({
        mockPath: resolve(__dirname, 'src/mock/mockApi'),
        enable: useMock,
        watchFiles: true,
        logger: true,
        ignore: isMockHelperFile,
      }),
      svgLoader({
        defaultImport: 'url',
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      }),
      SvgComponent({
        iconDir: [resolve(__dirname, 'src/_assets/icons')],
        preserveColor: resolve(__dirname, 'src/_assets/icons/preserve-color'),
        dts: true,
        dtsDir: resolve(__dirname, 'types/auto'),
      }),
      UnoCSS(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
        dts: 'types/auto/auto-imports.d.ts',
        resolvers: [VantWorkspaceResolver()],
      }),
      Components({
        dts: 'types/auto/components.d.ts',
        resolvers: [VantWorkspaceResolver()],
      }),
    ],
    test: {
      include: ['tests/**/*.test.{ts,js}'],
      environment: 'happy-dom',
    },
  };
});
