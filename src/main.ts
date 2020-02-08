import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Imports Cytoscape
import VueCytoscape from 'vue-cytoscape';
Vue.use(VueCytoscape);

// Imports Bootstrap-Vue and toast plugin for toasts
import BootstrapVue, { ToastPlugin } from 'bootstrap-vue';
Vue.use(BootstrapVue);
Vue.use(ToastPlugin);
import './custom.scss';

// Imports Bootstrap-Vue-Dialog
import Dialog from 'bootstrap-vue-dialog';
Vue.use(Dialog, {
    store, router,
});

// Imports Font Awesome
import FontAwesomeIcon from './fontawesome';
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
