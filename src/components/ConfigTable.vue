<template>
    <div id="configTable">

        <h4>Configuration table</h4>
        <p v-if="configs === undefined || configs.size === 0">No configurations!</p>
        <b-table v-else :items="tableItems"></b-table>

    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import { BTable } from 'bootstrap-vue';
    import AutomataConfig from '@/classes/AutomataConfig';

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
                    items.push({
                        "state": config.state,
                        "remaining_input": config.getInputLength() > 0 ? config.getInput() : "Empty",
                    });
                    console.log("Get input:");
                    console.log(config.getInput());
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
