<template>
    <div class="about">

        <b-container fluid>
            <b-row>

                <!-- AUTOMATA OPERATIONS -->
                <b-col>
                    <h1 v-if="automatas[automataTab] !== undefined">{{ automatas[automataTab].getModelName() }}</h1>
                    <p>Folds and stuff</p>
                </b-col>

                <!-- CYTOSCAPE -->
                <b-col cols="6">

                    <b-button variant="primary" @click="generate">Test button</b-button>

                    <!-- TABS -->
                    <b-tabs content-class="mt-3" v-model="automataTab">
                        <b-tab v-for="(automata, index) in automatas" active>

                            <!-- AUTOMATA PREVIEW -->
                            <AutomataPreview
                                :automata="automata"
                                :ref="`automata` + index"
                                @tapArea="onTapArea($event, automata)"
                            ></AutomataPreview>

                            <!-- Tab title -->
                            <template v-slot:title>
                                Automata
                                <b-button variant="danger" @click="closeTab(index)">X</b-button>
                            </template>

                        </b-tab>

                        <!-- New Automata Button (Using tabs-end slot) -->
                        <template v-slot:tabs-end>
                            <b-nav-item @click.prevent="newTab" href="#"><b>+</b></b-nav-item>
                        </template>
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
import PushdownAutomata from "@/classes/PushdownAutomata";
import TuringMachine from "@/classes/TuringMachine";

@Component({
    components: {
        AutomataPreview,
        BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea,
    },
})
export default class About extends Vue {

    private automatas: Automata[] = [];
    private inputString: string = '';
    private outcome: string = "UNDECIDED";

    /**
     * Stores the tab the user is currently selected
     */
    private automataTab: number = 0;

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
        this.automatas[this.automataTab].reset();

        // Sets the input string
        this.automatas[this.automataTab].setInput(this.inputString);
        this.inputString = '';
        this.automatas[this.automataTab].simulate();

        // Sets outcome
        this.outcome = this.automatas[this.automataTab].getOutcome().toLocaleString();
    }

    public generate() {

        /*const stateName = "A";
        const initial = this.automatas[this.automataTab].getState(stateName).initial;
        this.automatas[this.automataTab].setInitialState(stateName, !initial);*/
        this.$forceUpdate();

        /*const newArray = [];

        for (let i = 0; i < 100; i++) {
            newArray.push({ // node c
                data: { id: ('a' + i) },
                position: {
                    x: 200 + (50 * (i % 30)),
                    y: 200 + (50 * (i / 30)),
                },
            });
        }*/

        // this.automata.getData() = Object.assign({}, this.elements, newArray);
    }

    /**
     * Closes the tab the user is on
     */
    private closeTab(index: number) {
        // Removes the cytoscape elements
        for (const dataObjKey of Object.keys(this.automatas[index].getData())) {
            console.log(`Removing ${dataObjKey}`);
            (this.$refs["automata" + index] as any)[0].cy.remove(`#${dataObjKey}`);
        }

        // Destroys the Automata reference
        this.automatas.splice(index, 1);

        // Updates Vue
        this.$forceUpdate();
    }

    /**
     * Creates a new automata tab
     */
    private newTab() {
        const choice = prompt("What kind of automata? (f for finite, p for pushdown, t for turing)", "f");

        if (choice === "f")
            this.automatas.push(new FiniteAutomata());
        else if (choice === "p")
            this.automatas.push(new PushdownAutomata());
        else
            this.automatas.push(new TuringMachine());
    }
}
</script>

<style lang="scss">
    #cytoscape-div {
        background-color: lightskyblue;
        text-align: left;
    }
</style>
