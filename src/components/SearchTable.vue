<template>
    <!-- Scrollable pane -->
    <div id="scrollablePane" v-if="dirty">

        <!-- Table -->
        <b-table :items="items" :fields="fields" v-if="items.length > 0">

            <!-- Items -->
            <template v-slot:cell(state_name)="data">
                <p class="item" @click="onItemClick(data.item.id)">{{ data.item.state_name }}</p>
            </template>

        </b-table>
        <p v-else>No results for '{{ query }}'.</p>

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import {BTable} from "bootstrap-vue";
    import Vue from 'vue';
    import Automata from "@/classes/Automata";

    @Component({
        components: {
            BTable
        }
    })
    export default class SearchTable extends Vue {
        @Prop() public readonly automata!: Automata;

        /** Array of items for table to display */
        private items: SearchTableResult[] = [];

        /** Fields definition */
        private fields: any[] = [
            { key: 'id', thClass: 'd-none', tdClass: 'd-none' },
            { key: 'state_name' }
        ];

        /** If true, search has been used */
        private dirty: boolean = false;

        /** The query that was used */
        private query: string = "";

        /**
         * Sets the table
         * @param query - the string that was used to search
         * @param ids - the IDs of the states to put
         */
        public setTable(query: string, ids: Set<string>) {
            this.clear();
            this.dirty = true;
            this.query = query;
            ids.forEach(id => this.items.push(new SearchTableResult(
                id,
                this.automata.getData()[id].data.displayName
            )));
        }

        /**
         * Clears the table
         */
        public clear() {
            Vue.set(this, "items", []);
        }

        private onItemClick(id: string) {
            this.$emit('itemClick', id);
        }
    }

    /**
     * A displayable result via the table
     */
    class SearchTableResult {
        constructor(id: string, state_name: string) {
            this.id = id;
            this.state_name = state_name;
        }

        public id: string = "";
        public state_name: string = "";
    }
</script>

<style scoped>
    .item {
        margin: 0;
    }

    .item:hover {
        cursor:pointer;
        background-color: palegreen;
    }

    #scrollablePane {
        overflow-y: scroll;
        height: 400px;
    }
</style>