<template>
    <div id="stateSearch">

        <!-- Search -->
        <b-form-input type="text" placeholder="State search" class="mt-3" @keyup.enter="onSearch"/>
        <SearchTable :automata="automata"
                     ref="searchTable"
                     @itemClick="$emit('onSearchItemClick', $event)"
        ></SearchTable>

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import Vue from "vue";
    import SearchTable from "@/components/leftpane/visualisation/SearchTable.vue";
    import Automata from "@/classes/Automata";

    @Component({
        components: {
            SearchTable
        }
    })
    export default class StateSearch extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        /**
         * When the user wants to search for a state
         */
        private onSearch(event: any) {
            // Gets query string
            const query: string = event.target.value;

            // Gets search table reference
            const searchTable: any = (this.$refs[`searchTable`] as any);

            // Sets table contents via query
            searchTable.setTable(query, this.automata.findStates(query));
        }
    }
</script>

<style scoped>

</style>