<template>
    <div id="app">

        <!--
        <router-link to="/">Go to Home</router-link>
        <router-link to="/about">Go to About</router-link>
        -->

        <router-view></router-view>

    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import HelloWorld from './components/HelloWorld.vue';

    @Component({
        components: {
            HelloWorld,
        },
    })
    export default class App extends Vue {}
</script>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
</style>
