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
                </b-col>

            </b-row>
        </b-container>

    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator';
    import { BButton, BContainer, BRow, BCol, BTabs, BTab } from 'bootstrap-vue';
    import AutomataPreview from '@/components/AutomataPreview.vue';
    import Automata from "@/classes/Automata";
    import FiniteAutomata from "@/classes/FiniteAutomata";
    import uuidv1 from "uuid/v1";

    @Component({
        components: {
            AutomataPreview,
            BButton, BContainer, BRow, BCol, BTabs, BTab
        }
    })
    export default class About extends Vue {

        automata: Automata = new FiniteAutomata();

        mounted() {
            this.automata.addState("A", 50, 50);
            this.automata.addState("B", 150, 150);
            this.automata.addTransition("a", "B", "A");
            this.automata.addTransition("a", "A", "A");
            this.automata.addTransition("b", "A", "B");
            this.automata.addTransition("b", "B", "B");
        }

        /**
         * Executes when the user clicks on the preview area
         * @param e - event object
         */
        async onTapArea(e: any) {
            console.log(e);

            // If there is no target (no node / edge selected)
            if (!e.target[0]) {
                this.automata.addState(uuidv1(), e.position.x, e.position.y);
            }
        }

        generate() {
            let newArray = [];

            for (let i = 0; i < 100; i++) {
                newArray.push({ // node c
                    data: { id: ("a" + i) },
                    position: {
                        x: 200 + (50 * (i % 30)),
                        y: 200 + (50 * (i / 30))
                    }
                });
            }

            //this.automata.getData() = Object.assign({}, this.elements, newArray);
        }
    }

</script>

<style lang="scss">
    #cytoscape-div {
        background-color: lightskyblue;
        text-align: left;
    }
</style>
