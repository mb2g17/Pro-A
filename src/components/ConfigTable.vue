<template>
    <div id="configTable">

        <h4>Configuration table</h4>
        <p v-if="configs === undefined || configs.size === 0">No configurations!</p>
        <b-table v-else :items="tableItems"/>

    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import { BTable } from 'bootstrap-vue';
    import AutomataConfig from '@/classes/AutomataConfig';
    import PushdownAutomataConfig from "@/classes/PushdownAutomataConfig";
    import TuringMachineConfig from "@/classes/TuringMachineConfig";

    @Component
    export default class ConfigTable extends Vue {
        @Prop() public readonly configs: Set<AutomataConfig> | undefined;

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
                            "state": config.state,
                            "remaining_input": config.getInputLength() > 0 ? config.getInput() : "Empty",
                            "stack": pConfig.stackAsString()
                        });
                    }

                    // If this is a turing machine
                    else if (config instanceof TuringMachineConfig) {
                        const tConfig: TuringMachineConfig = (config as TuringMachineConfig);
                        items.push({
                            "state": config.state,
                            "tape": tConfig.tapeToString(5),
                        });
                    }

                    // If this is a finite automata
                    else {
                        items.push({
                            "state": config.state,
                            "remaining_input": config.getInputLength() > 0 ? config.getInput() : "Empty",
                        });
                    }
                }

                // Return array of items
                return items;
            }
            return null;
        }
    }
</script>

<style scoped>

</style>
