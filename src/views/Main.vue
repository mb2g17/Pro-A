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
                            <AutomataPreview :automata="automata"></AutomataPreview>

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
    const uuidv1 = require('uuid/v1');

    import AutomataPreview from '@/components/AutomataPreview.vue';
    import Automata from "@/classes/Automata";
    import FiniteAutomata from "@/classes/FiniteAutomata";

    @Component({
        components: {
            AutomataPreview,
            BButton, BContainer, BRow, BCol, BTabs, BTab
        }
    })
    export default class About extends Vue {

        automata: Automata = new FiniteAutomata();

        onMouseDown() {
            console.log("Mouse down");
        }

        onStart() {
            console.log("Start");
        }

        onStateClick() {
            console.log("On state click");
        }

        mounted() {
            this.automata.addState("a", 50, 50);
            this.automata.addState("b", 150, 150);
            this.automata.addTransition("ab", "a", "b");
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

            this.elements = Object.assign({}, this.elements, newArray);
        }
    }

</script>

<style lang="scss">
    #cytoscape-div {
        background-color: lightskyblue;
        text-align: left;
    }
</style>
