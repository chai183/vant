import { createApp } from 'vue';
import { pinia } from '@/pinia';
import { router } from '@/router';
import { installPlugins } from '@/plugins';
import App from '@/App.vue';
import 'normalize.css';
import 'nprogress/nprogress.css';
// 本地 workspace 的组件 css 产物不完整，开发态使用全量 less
import 'vant/lib/index.less';
import '@/_assets/styles/index.scss';
import 'virtual:uno.css';

const app = createApp(App);

installPlugins(app);

app.use(pinia).use(router);

router
  .isReady()
  .then(() => {
    app.mount('#app');
  })
  .catch((error) => {
    console.error(error);
    app.mount('#app');
  });
