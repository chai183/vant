import { createApp } from 'vue';
import { pinia } from '@/pinia';
import { router } from '@/router';
import { installPlugins } from '@/plugins';
import App from '@/App.vue';
import 'normalize.css';
import 'nprogress/nprogress.css';
import 'vant/lib/index.css';
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
