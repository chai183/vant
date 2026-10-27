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
    /(?:^|[/\\])(?:[\w-]+-)?(utils|entity|data|formFields)\.(ts|js)$/i.test(
      fileName,
    ) || /bundled_/i.test(fileName)
  );
}

function kebabCase(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .join('-')
    .toLowerCase();
}

/**
 * 本地 workspace vant 的 es/index 会整包导出全部组件源码，开发态极慢。
 * 这里改为按组件目录解析，避免命中桶文件。
 */
function VantWorkspaceResolver() {
  const apiMap = new Map<string, string>([
    ['showToast', 'toast'],
    ['closeToast', 'toast'],
    ['showFailToast', 'toast'],
    ['showLoadingToast', 'toast'],
    ['showSuccessToast', 'toast'],
    ['allowMultipleToast', 'toast'],
    ['setToastDefaultOptions', 'toast'],
    ['resetToastDefaultOptions', 'toast'],
    ['showDialog', 'dialog'],
    ['closeDialog', 'dialog'],
    ['showConfirmDialog', 'dialog'],
    ['showNotify', 'notify'],
    ['closeNotify', 'notify'],
    ['showImagePreview', 'image-preview'],
  ]);

  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (name.startsWith('Van')) {
        const partialName = name.slice(3);
        return {
          name: partialName,
          from: `vant/es/${kebabCase(partialName)}`,
        };
      }

      const apiDir = apiMap.get(name);
      if (apiDir) {
        return {
          name,
          from: `vant/es/${apiDir}`,
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
        // 仅映射子路径，禁止把裸 "vant" 指到整包 index
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
        clientFiles: [
          './src/layouts/**/*.*',
          './src/pinia/**/*.*',
          './src/router/**/*.*',
        ],
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
      // 本地 workspace 直接消费 vant/es 下的 .tsx 源码时需要
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
