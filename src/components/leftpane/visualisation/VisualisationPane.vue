<template>
    <div id="visualisationPane">

        <!-- Outline pane -->
        <OutlinePane ref="outlinePane"></OutlinePane>

        <!-- Multi-level exploration -->
        <MultiLevelSelect @multiLevelExplore="$emit('onMultiLevelExplore', $event)"
        ></MultiLevelSelect>

        <!-- Search -->
        <StateSearch :automata="automata"
                     @onSearchItemClick="$emit('onSearchItemClick', $event)"
        ></StateSearch>

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import Vue from "vue";
    import Automata from "@/classes/Automata";
    import MultiLevelSelect from "@/components/leftpane/visualisation/MultiLevelSelect.vue";
    import SearchTable from "@/components/leftpane/visualisation/SearchTable.vue";
    import StateSearch from "@/components/leftpane/visualisation/StateSearch.vue";
    import OutlinePane from "@/components/leftpane/visualisation/OutlinePane.vue";

    @Component({
        components: {
            OutlinePane,
            StateSearch,
            SearchTable, MultiLevelSelect
        }
    })
    export default class VisualisationPane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        /**
         * Outline pane component reference
         */
        private outlinePane: any;

        private mounted() {
            this.outlinePane = this.$refs["outlinePane"];
        }

        get OutlinePane(): any {
            return this.outlinePane;
        }
    }
</script>

<style scoped>

</style>