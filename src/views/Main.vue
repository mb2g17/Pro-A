<template>
    <div class="about">

        <b-container fluid>
            <b-row>

                <!-- AUTOMATA OPERATIONS -->
                <b-col>
                    <p>Folds and stuff</p>
                </b-col>

                <!-- CYTOSCAPE -->
                <b-col cols="6">

                    <b-button variant="primary" @click="generate">Test button</b-button>

                    <!-- TABS -->
                    <b-tabs content-class="mt-3">
                        <b-tab title="Automata1" active>

                            <!-- AUTOMATA PREVIEW -->
                            <AutomataPreview
                                :automata="automata"
                                @tapArea="onTapArea"
                            ></AutomataPreview>

                        </b-tab>
                        <b-tab title="MyAutomata">
                            <p>MyAutomata</p>
                        </b-tab>
                        <b-tab title="TuringCalculator">
                            <p>TuringCalculator</p>
                        </b-tab>
                    </b-tabs>


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
                    <p>Decision: {{ outcome }}</p>
                </b-col>

            </b-row>
        </b-container>

    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea } from 'bootstrap-vue';
import AutomataPreview from '@/components/AutomataPreview.vue';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import uuidv1 from 'uuid/v1';
import {Outcome} from "@/classes/Outcome";

@Component({
    components: {
        AutomataPreview,
        BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea,
    },
})
export default class About extends Vue {

    private automata: Automata = new FiniteAutomata();
    private inputString: string = '';
    private outcome: string = "UNDECIDED";

    public mounted() {
        /*this.automata.addState("A", 50, 50, true, false);
        this.automata.addState("B", 150, 150, false, true);
        this.automata.addTransition("a", "B", "A");
        this.automata.addTransition("a", "A", "A");
        this.automata.addTransition("b", "A", "B");
        this.automata.addTransition("b", "B", "B");

        this.automata.addState("A", 50, 50, true, false);
        this.automata.addState("B", 150, 150, false, true);
        this.automata.addTransition("a", "A", "C");*/
    }

    /**
     * Executes when the user clicks on the preview area
     * @param e - event object
     */
    public async onTapArea(e: any) {

        // If there is no target (no node / edge selected)
        if (!e.target[0]) {
            const nodeID = prompt('Please enter node label:', 'A');
            const initial = confirm('Initial state?');
            const final = confirm('Final state?');
            if (nodeID !== null) {
                this.automata.addState(nodeID, e.position.x, e.position.y, initial, final);
            } else {
                this.automata.addState(uuidv1(), e.position.x, e.position.y, initial, final);
            }
        }
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

    public generate() {
        const newArray = [];

        for (let i = 0; i < 100; i++) {
            newArray.push({ // node c
                data: { id: ('a' + i) },
                position: {
                    x: 200 + (50 * (i % 30)),
                    y: 200 + (50 * (i / 30)),
                },
            });
        }

        // this.automata.getData() = Object.assign({}, this.elements, newArray);
    }
}
</script>

<style lang="scss">
    #cytoscape-div {
        background-color: lightskyblue;
        text-align: left;
    }
</style>
