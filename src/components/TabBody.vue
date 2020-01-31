<template>

    <!-- Body -->
    <b-container fluid>
        <b-row>

            <!-- AUTOMATA OPERATIONS -->
            <b-col>
                <h1>{{ automata.getModelName() }}</h1>
                <p>Folds and stuff</p>
            </b-col>

            <!-- CYTOSCAPE -->
            <b-col cols="6">

                <!-- AUTOMATA PREVIEW -->
                <AutomataPreview
                        :automata="automata"
                        :ref="`automata` + index"
                        @tapArea="onTapArea($event, automata)"
                ></AutomataPreview>

            </b-col>

            <!-- INPUTS -->
            <b-col>
                <p>Input, alphabet tree, past inputs</p>
                <p>Input string:</p>
                <b-form-textarea
                        v-model="inputString"
                        placeholder="Input string"
                        rows="3"
                        max-rows="6"
                ></b-form-textarea>
                <b-button variant="primary" @click="onPassInputClick">Pass input</b-button>
                <b-button variant="primary" @click="onStepClick">Step</b-button>
                <p>Decision: {{ outcome }}</p>

                <!-- Config -->
                <ConfigTable :configs="automata.getCurrentConfigs()"></ConfigTable>
            </b-col>

        </b-row>
    </b-container>

</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator';
    import { BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea } from 'bootstrap-vue';
    import AutomataPreview from '@/components/AutomataPreview.vue';
    import ConfigTable from '@/components/ConfigTable.vue';
    import Automata from "../classes/Automata";

    @Component({
        components: {
            // Custom components
            ConfigTable, AutomataPreview,

            // Bootstrap components
            BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea,
        },
    })
    export default class TabBody extends Vue {
        @Prop() public readonly automata!: Automata;

        /** The input string inputted by the user */
        private inputString: string = '';

        /** The outcome of an animation */
        private outcome: string = "UNDECIDED";

        /**
         * Executes when the user clicks on the preview area
         * @param e - event object
         */
        public async onTapArea(e: any, automata: any) {
            console.log(automata);
            // If there is no target (no node / edge selected)
            /*if (!e.target[0]) {
                const nodeID = prompt('Please enter node label:', 'A');
                const initial = confirm('Initial state?');
                const final = confirm('Final state?');
                if (nodeID !== null) {
                    this.automata.addState(nodeID, e.position.x, e.position.y, initial, final);
                } else {
                    this.automata.addState(uuidv1(), e.position.x, e.position.y, initial, final);
                }
            }*/
        }

        /**
         * When the user clicks on "Pass input" button
         */
        public onPassInputClick() {
            // Clears automata
            this.automata.reset();

            // Sets the input string
            this.automata.setInput(this.inputString);
            this.inputString = '';
            this.automata.simulate();

            // Sets outcome
            this.outcome = this.automata.getOutcome().toLocaleString();
        }

        /**
         * When the user clicks on "Step" button
         */
        public onStepClick() {
            // If it exists
            if (this.automata) {
                // If there are no more configs, set new input
                if (this.automata.getCurrentConfigs().size === 0) {
                    this.automata.setInput(this.inputString);
                }
                // Steps the automata
                this.automata.step();
                this.$forceUpdate();

                // Gets outcome
                this.outcome = this.automata.getOutcome().toLocaleString();
            } else {
                alert("No automata exists!");
            }
        }
    }
</script>

<style scoped>

</style>