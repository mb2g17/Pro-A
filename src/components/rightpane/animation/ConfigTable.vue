<template>
    <div id="configTable">

        <h4>Configuration table</h4>
        <p v-if="configs === undefined || configs.size === 0">No configurations!</p>
        <b-table v-else :fields="fields" :items="tableItems" @row-clicked="onRowClicked">
            <template v-slot:row-details="data">
                <b-button variant="danger" class="mr-2" @click="$emit('onDeleteConfig', data.item._config)">Delete</b-button>
                <b-button variant="warning" @click="$emit('onPruneConfig', data.item._config)">Prune</b-button>
            </template>
        </b-table>

    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {BButton, BTable} from 'bootstrap-vue';
    import AutomataConfig from '@/classes/AutomataConfig';
    import PushdownAutomataConfig from "@/classes/PushdownAutomataConfig";
    import TuringMachineConfig from "@/classes/TuringMachineConfig";
    import Automata from "@/classes/Automata";
    import FiniteAutomata from "@/classes/FiniteAutomata";
    import PushdownAutomata from "@/classes/PushdownAutomata";
    import TuringMachine from "@/classes/TuringMachine";

    @Component({
        components: {
            BTable, BButton
        }
    })
    export default class ConfigTable extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        @Prop() public readonly configs: Set<AutomataConfig> | undefined;

        /**
         * The fields that will appear on the table
         */
        get fields() {
            const fields: string[] = ["state"];

            if (this.automata instanceof FiniteAutomata)
                fields.push("remaining_input");
            else if (this.automata instanceof PushdownAutomata) {
                fields.push("remaining_input");
                fields.push("stack");
            }
            else if (this.automata instanceof TuringMachine)
                fields.push("tape");

            return fields;
        }

        /**
         * Table items from config prop
         * @returns array of items if configs is defined, null if undefined
         */
        get tableItems() {
            // If configs is not undefined
            if (this.configs !== undefined) {
                // Creates array of items
                let items = [];

                // For each config, add table item
                for (const config of this.configs) {

                    // If this is a pushdown automata
                    if (config instanceof PushdownAutomataConfig) {
                        const pConfig: PushdownAutomataConfig = (config as PushdownAutomataConfig);
                        items.push({
                            "state": this.automata.getState(config.state).data.displayName,
                            "remaining_input": config.getInputLength() > 0 ? config.getInput() : "Empty",
                            "stack": pConfig.stackAsString(),

                            "_showDetails": false,
                            "_config": pConfig
                        });
                    }

                    // If this is a turing machine
                    else if (config instanceof TuringMachineConfig) {
                        const tConfig: TuringMachineConfig = (config as TuringMachineConfig);
                        items.push({
                            "state": this.automata.getState(config.state).data.displayName,
                            "tape": tConfig.tapeToString(5),

                            "_showDetails": false,
                            "_config": tConfig
                        });
                    }

                    // If this is a finite automata
                    else {
                        items.push({
                            "state": this.automata.getState(config.state).data.displayName,
                            "remaining_input": config.getInputLength() > 0 ? config.getInput() : "Empty",

                            "_showDetails": false,
                            "_config": config
                        });
                    }
                }

                // Return array of items
                return items;
            }
            return null;
        }

        /**
         * When a user clicks on a row
         */
        private onRowClicked(item: any, index: any, event: any) {
            item._showDetails = !item._showDetails;
        }
    }
</script>

<style scoped>

</style>
