<template>
    <div id="visualisationPane">

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

    @Component({
        components: {
            StateSearch,
            SearchTable, MultiLevelSelect
        }
    })
    export default class VisualisationPane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;
    }
</script>

<style scoped>

</style>