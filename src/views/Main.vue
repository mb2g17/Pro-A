<template>
    <div class="main">

        <!-- TABS -->
        <b-tabs id="tabs" content-class="mt-3" v-model="automataTab">

            <!-- Logo at the start of the tabs -->
            <template v-slot:tabs-start>
                <img id="logo" src="../assets/logo.png" />
                <b-button class="mr-3" variant="primary" @click="onLoadAutomataClick">Load Automata</b-button>
                <input id="loadFileInput" type="file" style="display:none" @change="onFileLoad" />

            </template>

            <b-tab v-for="(automata, index) in automatas" active>

                <!-- Tab title -->
                <template v-slot:title>
                    {{ automata.getName() }}
                    <!--<b-button variant="danger" @click="closeTab(index)">X</b-button>-->
                    <font-awesome-icon class="mr-1" :icon="['fas', 'save']" @click="onSaveAutomataClick(index)" />
                    <font-awesome-icon class="mr-1" :icon="['fas', 'pen-square']" @click="renameTab(index)" />
                    <font-awesome-icon :icon="['fas', 'times-circle']" @click="closeTab(index)" />
                </template>

                <!-- Body -->
                <TabBody :automata="automata" :index="index" :ref="`tab${index}`"></TabBody>

            </b-tab>

            <!-- New Automata Button (Using tabs-end slot) -->
            <template v-slot:tabs-end>
                <b-nav-item @click.prevent="$refs['newTabModal'].toggle()" href="#"><b>+</b></b-nav-item>
            </template>
        </b-tabs>

        <NewTabModal ref="newTabModal" @add="createAutomata($event.type, $event.name)" />

    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import {
    BButton,
    BContainer,
    BRow,
    BCol,
    BTabs,
    BTab,
    BFormTextarea,
    BModal,
    BButtonGroup,
    BFormInput, BForm
} from 'bootstrap-vue';
import AutomataPreview from '@/components/middlepane/AutomataPreview.vue';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import uuidv1 from 'uuid/v1';
import {Outcome} from "@/classes/Outcome";
import PushdownAutomata from "@/classes/PushdownAutomata";
import TuringMachine from "@/classes/TuringMachine";
import ConfigTable from '@/components/rightpane/animation/ConfigTable.vue';
import TabBody from "@/components/TabBody.vue";
import NewTabModal from '@/components/modals/NewTabModal.vue';
import deserialize from '../classes/AutomataDeserializer';
import {FileSaverOptions, saveAs} from 'file-saver';
import {readFileAsync} from "@/misc/filereader";
import AutomataDeserializer from "../classes/AutomataDeserializer";
import { Base64 } from 'js-base64';

@Component({
    components: {
        ConfigTable,
        AutomataPreview,
        NewTabModal,
        BButton, BContainer, BRow, BCol, BTabs, BTab, BModal, BButtonGroup,
        TabBody
    },
})
export default class Main extends Vue {
    /** The list of automatas that are in the program */
    private automatas: Automata[] = [];

    /** Stores the tab the user is currently selected */
    private automataTab: number = 0;

    /**
     * When the user wants to rename a tab
     */
    private async renameTab(index: number) {
        let response = await (this as any).$dialog.prompt({
            text: `Type new automata name here`,
            title: `Renaming '${this.automatas[index].getName()}'`
        });

        // If it wasn't cancelled, rename
        if (response)
            this.automatas[index].setName(response);
    }

    /**
     * Closes the tab the user is on
     */
    private closeTab(index: number) {
        // Removes the cytoscape elements
        for (const dataObjKey of Object.keys(this.automatas[index].getData())) {
            // Gets cytoscape element
            const elem = (this.$refs[`tab${index}`] as any);

            // If it exists
            if (elem)
                elem[0]["automataPreview"].cy.remove(`#${dataObjKey}`);
        }

        // Destroys the Automata reference
        this.automatas.splice(index, 1);

        // Updates Vue
        this.$forceUpdate();
    }

    /**
     * Creates automata
     * @param type - the type of the new automata
     * @param name - the name of the new automata
     */
    private createAutomata(type: string, name: string) {
        let newAutomata: Automata;

        // Sets type
        switch (type) {
            case "FA":
            default:
                newAutomata = new FiniteAutomata();
                break;
            case "PDA":
                newAutomata = new PushdownAutomata();
                break;
            case "TM":
                newAutomata = new TuringMachine();
        }

        // Sets name
        newAutomata.setName(name);

        // Pushes to array
        this.automatas.push(newAutomata);
    }

    /**
     * When the user clicks the Load Automata button
     */
    private onLoadAutomataClick() {
        const fileInput: any = document.getElementById('loadFileInput');
        fileInput.value = null; // Resets what file had already been loaded, so we can load the same multiple times
        if (fileInput)
            fileInput.click();
    }

    /**
     * When the user loads an automata file
     * @param event - file selected event
     */
    private async onFileLoad(event: any) {
        // Gets handle on file input tag
        const fileInput: any = document.getElementById('loadFileInput');
        if (fileInput) {
            const file: File = fileInput.files[0];
            const contents: string = await readFileAsync(file) as string;
            const decryptedBase64: string = Base64.decode(contents);
            let jsonContents: any = JSON.parse(decryptedBase64);

            // Parses new automata
            const newAutomata: Automata = deserialize(jsonContents.automata);

            // Adds it to array and gets new index of this automata
            this.automatas.push(newAutomata);
            const automataTabIndex = this.automatas.length - 1;

            // Waits for next tick
            await this.$nextTick();

            // Gets cytoscape element
            const elem = (this.$refs[`tab${automataTabIndex}`] as any);
            const cy = elem[0]["automataPreview"].cy;

            // Updates json of cytoscape
            cy.json(jsonContents.cy);
        }
    }

    /**
     * When the user saves an automata
     * @param index - index of the automata which is being saved
     */
    private onSaveAutomataClick(index: any) {
        // Gets cytoscape element
        const elem = (this.$refs["tab" + index] as any);
        const cy = elem[0]["automataPreview"].cy;

        // Gets cytoscape json
        const cytoscapeJSON = cy.json();
        delete cytoscapeJSON.style;

        // Creates JSON object to save
        const jsonToSave = {
            cy: cytoscapeJSON,
            automata: this.automatas[index].serialize()
        };

        // Creates save blob and encodes into Base64
        let saveBlob: string = JSON.stringify(jsonToSave);
        saveBlob = Base64.encode(saveBlob);

        // If it exists
        if (elem) {
            let jsonBlob = new Blob([ saveBlob ], { type: 'text/plain;charset=utf-8' });
            saveAs(jsonBlob, `${this.automatas[index].getName()}.automata`);
        } else {
            console.log("Element doesn't exist!");
        }
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
