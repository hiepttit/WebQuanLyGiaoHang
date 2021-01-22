import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/base'
import './plugins/chartist'
import './plugins/vee-validate'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import stores from './views/stores/store.js'

Vue.config.productionTip = false
Vue.prototype.$stores = stores;

new Vue({
  router,
  store,
  stores,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')
