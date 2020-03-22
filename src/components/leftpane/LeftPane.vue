<template>
    <div id="leftPane">
        <!-- Automata type display -->
        <h2>{{ automata.getModelName() }}</h2>

        <!-- Tabs -->
        <b-tabs>

            <!-- Computation -->
            <b-tab title="Computation" class="pt-2" active>
                <ComputationPane ref="computationPane"
                                 :automata="automata"
                                 @onOperationButtonClick="$emit('onOperationButtonClick', $event)"
                                 @onStateFoldCompute="$emit('onStateFoldCompute', $event)"
                                 @onDuplicateCompute="$emit('onDuplicateCompute', $event)"
                                 @onUnionCompute="$emit('onUnionCompute', $event)"
                                 @onConcatenationCompute="$emit('onConcatenationCompute', $event)"
                                 @onKleeneStarCompute="$emit('onKleeneStarCompute', $event)"
                                 @onProductCompute="$emit('onProductCompute', $event)"
                ></ComputationPane>
            </b-tab>

            <!-- Visualisation -->
            <b-tab title="Visualisation" class="pt-2">
                <VisualisationPane ref="visualisationPane"
                                   :automata="automata"
                                   @onMultiLevelExplore="$emit('onMultiLevelExplore', $event)"
                                   @onSearchItemClick="$emit('onSearchItemClick', $event)"
                ></VisualisationPane>
            </b-tab>

        </b-tabs>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import {BTab, BTabs} from "bootstrap-vue";
    import Vue from "vue";
    import VisualisationPane from "@/components/leftpane/visualisation/VisualisationPane.vue";
    import ComputationPane from "@/components/leftpane/computation/ComputationPane.vue";
    import Automata from "@/classes/Automata";

    @Component({
        components: {
            ComputationPane,
            VisualisationPane,
            BTab, BTabs
        }
    })
    export default class LeftPane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        /** Computation pane reference */
        private computationPane: any;

        /** Visualisation pane reference */
        private visualisationPane: any;

        private mounted() {
            this.computationPane = this.$refs["computationPane"];
            this.visualisationPane = this.$refs["visualisationPane"];
        }

        /** Accessor for computation pane reference */
        get ComputationPane() {
            return this.computationPane;
        }

        /** Accessor for visualisation pane reference */
        get VisualisationPane() {
            return this.visualisationPane;
        }
    }
</script>

<style scoped>

</style>