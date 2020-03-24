<template>
    <!-- Tabs -->
    <b-tabs>

        <!-- Animation -->
        <b-tab title="Animation" class="pt-2" active>
            <AnimationPane ref="animationPane"
                           :automata="automata"
                           @changeHighlightedNodes="$emit('changeHighlightedNodes', $event)"
            ></AnimationPane>
        </b-tab>

        <!-- Information -->
        <b-tab title="Information" class="pt-2">
            <InformationPane ref="informationPane"
                             :automata="automata"
            ></InformationPane>
        </b-tab>

    </b-tabs>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import {BTab, BTabs} from "bootstrap-vue";
    import AnimationPane from "./animation/AnimationPane.vue";
    import InformationPane from "./information/InformationPane.vue";
    import Vue from "vue";
    import Automata from "@/classes/Automata";

    @Component({
        components: {
            BTabs, BTab,
            AnimationPane, InformationPane
        }
    })
    export default class RightPane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        /** Animation pane reference */
        private animationPane: any;

        /** Information pane reference */
        private informationPane: any;

        /** Accessor for animation pane reference */
        get AnimationPane() {
            return this.animationPane;
        }

        /** Accessor for information pane reference */
        get InformationPane() {
            return this.informationPane;
        }

        private mounted() {
            this.animationPane = (this.$refs["animationPane"] as any);
            this.informationPane = (this.$refs["informationPane"] as any);
        }
    }
</script>

<style scoped>
</style>