// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

Vue.use(VueLazyLoad,{
  loading: require('common/image/default.png')
})

//每个body下面的点击都没有300ms的延迟
fastclick.attach(document.body)

Vue.config.productionTip = false
import 'common/stylus/index.styl'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h =>h(App),
  router,
  store
})
