<template>
    <div id="informationPane">

        <p>Number of states: {{ Object.keys(automata["cacheNodeID"]).length }}</p>
        <p>Number of transitions: {{ automata["cacheTransition"].getNumberOfTransitions() }}</p>
        <p>Number of objects: {{ Object.keys(automata["cacheNodeID"]).length + automata["cacheTransition"]["cacheNoOfTransitions"] }}</p>

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import Automata from "@/classes/Automata";
    import Vue from "vue";

    @Component
    export default class InformationPane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;
    }
</script>

<style scoped>

</style>