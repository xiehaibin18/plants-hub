import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import router from './router'

import PFUploadimage from './components/PFUploadimage'

Vue.config.productionTip = false

Vue.prototype.$axios= axios

Vue.use(ElementUI);

Vue.component('pf-uploadimage', PFUploadimage);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
