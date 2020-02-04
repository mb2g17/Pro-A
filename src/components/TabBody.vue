<template>

    <!-- Body -->
    <b-container fluid>
        <b-row>

            <!-- FOLDING, AUTOMATA OPERATIONS, EXPLORATION AND SEARCH -->
            <b-col>
                <!-- Automata type display -->
                <h2>{{ automata.getModelName() }}</h2>

                <!-- Operations -->
                <div id="operations">
                    <b-button variant="warning" @click="onStateFoldClick">State fold</b-button>
                    <b-button variant="primary">Union</b-button>
                    <b-button variant="primary">Concatenation</b-button>
                    <b-button variant="primary">Kleene Star</b-button>
                </div>

                <!-- Multi-level exploration -->
                <div id="multilevel-exploration">
                    <b-form-checkbox
                            class="mt-2"
                            v-model="isMultilevelExplorationEnabled"
                            :value="true"
                            :unchecked-value="false"
                    >
                        Multi-level exploration
                    </b-form-checkbox>
                    <b-form-input :disabled="!isMultilevelExplorationEnabled" type="number"
                                  placeholder="Abstraction level"/>
                </div>

                <!-- Search -->
                <b-form-input type="text" placeholder="State search" class="mt-3"/>
            </b-col>

            <!-- CYTOSCAPE -->
            <b-col cols="6">

                <!-- Zoom and styles -->
                <div id="zoom-and-styles">
                    <div id="zoom">
                        <b-button variant="warning" @click="zoom('in')">
                            <font-awesome-icon :icon="['fas', 'search-plus']" />
                        </b-button>
                        <b-button variant="warning" @click="zoom('out')">
                            <font-awesome-icon :icon="['fas', 'search-minus']" />
                        </b-button>
                    </div>
                    <b-button variant="success">Styles</b-button>
                </div>

                <!-- AUTOMATA PREVIEW -->
                <AutomataPreview
                        :automata="automata"
                        :ref="`automata` + index"
                />

            </b-col>

            <!-- INPUTS -->
            <b-col>
                <b-form-textarea
                        class="mb-3"
                        v-model="inputString"
                        placeholder="Input string"
                        rows="3"
                        max-rows="6"
                />
                <div class="d-flex justify-content-center mb-2">
                    <b-button variant="primary" @click="onPassInputClick" class="mr-2">Compute immediately</b-button>
                    <b-button variant="primary" @click="onStepClick">Step</b-button>
                </div>
                <b-button variant="danger" class="mb-3" @click="onStepClick">Cancel</b-button>

                <!-- Decision -->
                <h2 id="decision">{{ outcome }}</h2>

                <!-- Config -->
                <ConfigTable :configs="automata.getCurrentConfigs()" />
            </b-col>

        </b-row>
    </b-container>

</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator';
    import { BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea, BFormCheckbox } from 'bootstrap-vue';
    import AutomataPreview from '@/components/AutomataPreview.vue';
    import ConfigTable from '@/components/ConfigTable.vue';
    import Automata from "../classes/Automata";
    import uuidv1 from "uuid/v1";

    @Component({
        components: {
            // Custom components
            ConfigTable, AutomataPreview,

            // Bootstrap components
            BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea, BFormCheckbox,
        },
    })
    export default class TabBody extends Vue {
        @Prop() public readonly automata!: Automata;
        @Prop() public readonly index!: number;

        /** The input string inputted by the user */
        private inputString: string = '';

        /** The outcome of an animation */
        private outcome: string = "UNDECIDED";

        /** If true, user wants to perform multi-level exploration */
        private isMultilevelExplorationEnabled: boolean = false;

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
            // Set new input
            this.automata.setInput(this.inputString);

            // Steps the automata
            this.automata.step();
            this.$forceUpdate();

            // Gets outcome
            this.outcome = this.automata.getOutcome().toLocaleString();
        }

        /**
         * Zooms the canvas in a direction
         * @param direction either the string 'in' or 'out' for zooming in and out; everything else will be ignored
         */
        public zoom(direction: string) {
            // Gets automata preview reference
            const automataPreview: AutomataPreview = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Gets new zoom level
            let zoomLevel = automataPreview.cy.zoom();
            if (direction === "in")
                zoomLevel += 0.15;
            else if (direction === "out")
                zoomLevel -= 0.15;

            // Sets new zoom level from the centre of the viewport
            automataPreview.cy.zoom({
                level: zoomLevel,
                renderedPosition: {x: automataPreview.cy.width() / 2, y: automataPreview.cy.height() / 2}
            });
        }

        /**
         * When the user clicks the "State fold" button
         */
        public onStateFoldClick() {
            // Gets automata preview
            const automataPreview: AutomataPreview = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Creates parent node
            let parentID = uuidv1();
            const parentNode = automataPreview.cy.add([
                {
                    group: 'nodes',
                    data: { id: parentID, name: "" },
                    position: { x: 100, y: 100 },
                    classes: ['parent']
                },
            ]);

            // Sets parent of all selected nodes
            let grandParent: any = null;
            for (const node of automataPreview.selectedNodes) {
                grandParent = automataPreview.cy.getElementById(node)[0]._private.data.parent;
                automataPreview.cy.getElementById(node).move({
                    parent: parentID
                });
            }

            // Sets grandparent (parent of parent)
            automataPreview.cy.getElementById(parentID).move({
                parent: grandParent
            });

            // Add this node to automata class
            let newData: any = this.automata.getData();
            newData[parentID] = automataPreview.cy.nodes("#" + parentID)[0]._private;
            this.automata.setData(newData);
        }
    }
</script>

<style lang="scss" scoped>
    #zoom-and-styles {
        display:flex;
        justify-content: space-between;

        padding: 5px 10px;
    }
    #zoom > * {
        margin-right: 10px;
    }
    #operations {
        display:flex;
        flex-direction: column;
        > * {
            height: 50px;
            text-align:left;
            margin-bottom: 10px;
            padding-left: 30px;
            font-weight: bold;
        }
    }
    #decision {
        margin: 30px 0;
        font-weight: bold;
    }
</style>