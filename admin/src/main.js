import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import router from './router'

import PHUploadimage from './components/PHUploadimage'

Vue.config.productionTip = false

Vue.prototype.$axios= axios

Vue.use(ElementUI);

Vue.component('ph-uploadimage', PHUploadimage);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
