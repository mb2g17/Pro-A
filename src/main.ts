import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Imports Cytoscape
import VueCytoscape from 'vue-cytoscape';
Vue.use(VueCytoscape);

// Imports Bootstrap-Vue
import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);
import './custom.scss';

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
