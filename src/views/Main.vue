<template>
    <div class="main">

        <!-- TABS -->
        <b-tabs id="tabs" content-class="mt-3" v-model="automataTab">

            <!-- Logo at the start of the tabs -->
            <template v-slot:tabs-start>
                <img id="logo" src="../assets/logo.png" />
            </template>

            <b-tab v-for="(automata, index) in automatas" active>

                <!-- Tab title -->
                <template v-slot:title>
                    Automata
                    <!--<b-button variant="danger" @click="closeTab(index)">X</b-button>-->
                    <font-awesome-icon :icon="['fas', 'times-circle']" @click="closeTab(index)" />
                </template>

                <!-- Body -->
                <TabBody :automata="automata" :index="index"></TabBody>

            </b-tab>

            <!-- New Automata Button (Using tabs-end slot) -->
            <template v-slot:tabs-end>
                <b-nav-item @click.prevent="newTab" href="#"><b>+</b></b-nav-item>
            </template>
        </b-tabs>

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
import ConfigTable from '@/components/ConfigTable.vue';
import TabBody from "@/components/TabBody.vue";

@Component({
    components: {
        ConfigTable,
        AutomataPreview,
        BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea,
        TabBody
    },
})
export default class Main extends Vue {
    /**
     * The list of automatas that are in the program
     */
    private automatas: Automata[] = [];

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
    #logo {
        width: 100px;
        margin: 10px 20px 0 20px;
    }
    #tabs {
        margin-top: 10px;
    }
</style>
