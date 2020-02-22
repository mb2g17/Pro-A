<template>

    <!-- Body -->
    <div>
        <b-container fluid>
            <b-row>

                <!-- FOLDING, AUTOMATA OPERATIONS, EXPLORATION AND SEARCH -->
                <b-col>
                    <!-- Automata type display -->
                    <h2>{{ automata.getModelName() }}</h2>

                    <!-- Operations -->
                    <div id="operations">
                        <b-button variant="warning" @click="onStateFoldClick">State fold</b-button>
                        <b-button :variant="operationState.operationName !== 'union' ? 'primary' : 'success'" @click="onUnionClick">Union</b-button>
                        <b-button :variant="operationState.operationName !== 'concatenation' ? 'primary' : 'success'" @click="onConcatenationClick">Concatenation</b-button>
                        <b-button :variant="operationState.operationName !== 'kleene-star' ? 'primary' : 'success'" @click="onKleeneStarClick">Kleene Star</b-button>
                        <b-button v-if="operationState.operationName" variant="danger" @click="clearOperationState">Cancel</b-button>
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
                            :ref="`automata${index}`"
                            @createTransition="onCreateTransition"
                            @editTransition="onEditTransition"
                            @editState="onEditState"
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
                    <b-button variant="danger" class="mb-3" @click="onCancelClick">Cancel</b-button>

                    <!-- Decision -->
                    <h2 id="decision" v-if="isSimulating">{{ outcome }}</h2>

                    <!-- Config -->
                    <ConfigTable :configs="automata.getCurrentConfigs()" />
                </b-col>

            </b-row>
        </b-container>

        <!-- New transition modal -->
        <NewTransitionModal :ref="`newTransitionModal${index}`" :automata="automata" />

    </div>

</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator';
    import { BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea, BFormCheckbox } from 'bootstrap-vue';
    import AutomataPreview from '@/components/AutomataPreview.vue';
    import ConfigTable from '@/components/ConfigTable.vue';
    import Automata from "../classes/Automata";
    import uuidv1 from "uuid/v1";
    import AutomataOperations from "@/classes/AutomataOperations";
    import NewTransitionModal from "@/components/NewTransitionModal.vue";

    @Component({
        components: {
            // Custom components
            ConfigTable, AutomataPreview, NewTransitionModal,

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

        /** If true, we are simulating. If false, we aren't */
        private isSimulating: boolean = false;

        /** The state of an automata operation */
        private operationState: any = {
            operationName: '', // The name of the operation we're doing
            selectStage: 0, // Stages of selecting nodes; used for automata operations
            selectedStates: new Set() // The selected states for this stage
        };

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
         * Clears the automata operation state
         */
        public clearOperationState() {
            this.$set(this, "operationState", {});
            this.$set(this.operationState, "operationName", '');
            this.$set(this.operationState, "selectStage", 0);
            this.$set(this.operationState, "selectedStates", new Set());
        }

        /**
         * When user wants to create a transition
         */
        private onCreateTransition(args: any) {
            // Gets automata preview
            const automataPreview: AutomataPreview = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Destructures arguments
            const {event, sourceNode, targetNode, addedEles} = args;

            // Removes automatically created element
            automataPreview.cy.remove(addedEles);

            // Shows modal
            (this.$refs[`newTransitionModal${this.index}`] as any).show(sourceNode, targetNode);
        }

        /**
         * When user wants to edit a transition
         * @param transitionID - the ID of the transition to edit
         */
        private onEditTransition(transitionID: string) {
            // Shows modal
            (this.$refs[`newTransitionModal${this.index}`] as any).showEdit(transitionID);
        }

        /**
         * When user wants to edit a state
         * @param stateID - the ID of the state to edit
         */
        private async onEditState(stateID: string) {
            // Gets state
            let state = this.automata.getData()[stateID];

            let response = await (this as any).$dialog.prompt({
                text: `Type new state name here`,
                title: `Renaming '${state.data.name}'`
            });

            // If it wasn't cancelled, rename
            if (response) {
                state.data.name = response;
                this.automata.updateItem(stateID, state);
            }
        }

        /**
         * When the user clicks on "Pass input" button
         */
        public onPassInputClick() {
            // We are now simulating
            this.isSimulating = true;

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
            // We are now simulating
            this.isSimulating = true;

            // Set new input
            this.automata.setInput(this.inputString);

            // Steps the automata
            this.automata.step();
            this.$forceUpdate();

            // Gets outcome
            this.outcome = this.automata.getOutcome().toLocaleString();
        }

        /**
         * When the user clicks on "Cancel" button
         */
        public onCancelClick() {
            this.isSimulating = false; // We are no longer simulating
            this.automata.reset(); // Reset automata configurations and input
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

                // Sets parent property in data
                let data: any = this.automata.getData();
                data[node].parent = parentID;
                this.automata.setData(data);
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

        /**
         * When the user clicks the "Union" button
         */
        public onUnionClick() {
            // Gets automata preview
            const automataPreview: AutomataPreview = (this.$refs[`automata${this.index}`] as AutomataPreview);

            switch (this.operationState.selectStage) {
                case 0:
                    this.operationState.selectStage = 1;

                    // Stores operation type
                    this.operationState.operationName = "union";

                    // Tell user to input another group
                    this.$bvToast.toast("Select the first automata using ALT + click on a state in the automata, and press Union.", {
                        title: 'Select the first automata',
                        variant: "warning",
                        autoHideDelay: 5000
                    });
                    break;
                case 1:
                    this.operationState.selectStage = 2;

                    // Remember selected nodes
                    this.operationState.selectedStates = new Set(automataPreview.selectedNodes);

                    // Tell user to input another group
                    this.$bvToast.toast("Select the second automata and press Union.", {
                        title: 'Select the second automata',
                        variant: "warning",
                        autoHideDelay: 5000
                    });
                    break;
                case 2:
                    this.operationState.selectStage = 0;

                    // Performs union
                    AutomataOperations.union(this.automata, this.operationState.selectedStates, automataPreview.selectedNodes, automataPreview.cy);

                    // Tell user that union is finished
                    this.$bvToast.toast("Union successfully computed!", {
                        title: 'Success!',
                        variant: "success",
                        autoHideDelay: 5000
                    });

                    // Updates operation state to be empty
                    this.clearOperationState();
                    break;
            }
        }

        /**
         * When the user clicks the "Concatenation" button
         */
        public onConcatenationClick() {
            // Gets automata preview
            const automataPreview: AutomataPreview = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Acts based on automata stage
            switch (this.operationState.selectStage) {
                case 0:
                    // Stores operation type and increments stage
                    this.operationState.operationName = "concatenation";
                    this.operationState.selectStage++;

                    // Tells user to select final states of the first sub-automata
                    this.$bvToast.toast("Select the first automata using ALT + click on a state in the automata, and press Concatenation.", {
                        title: 'Concatenation',
                        variant: "warning",
                        autoHideDelay: 5000
                    });
                    break;

                case 1:
                    // Remembers the final states of 1st sub-automata
                    this.operationState.selectedStates = new Set(automataPreview.selectedNodes);

                    // Increments operation stage
                    this.operationState.selectStage++;

                    // Tells user to select initial states of the second sub-automata
                    this.$bvToast.toast("Select the second automata and press Concatenation.", {
                        title: 'Concatenation',
                        variant: "warning",
                        autoHideDelay: 5000
                    });
                    break;

                case 2:
                    // Gets final states of automata 1 and initial states of automata 2
                    const finalStateAutomata1 = AutomataOperations.getFinalStates(this.automata, this.operationState.selectedStates);
                    const initialStateAutomata2 = AutomataOperations.getInitialStates(this.automata, automataPreview.selectedNodes);

                    // Concatenate
                    AutomataOperations.concatenation(this.automata, finalStateAutomata1, initialStateAutomata2, automataPreview.cy);
                    this.$forceUpdate();

                    // Tells user to select initial states of the second sub-automata
                    this.$bvToast.toast("Concatenation successfully computed!", {
                        title: 'Concatenation',
                        variant: "success",
                        autoHideDelay: 5000
                    });

                    // Clears state
                    this.clearOperationState();
                    break;
            }
        }

        /**
         * When the user clicks the "Kleene star" button
         */
        public onKleeneStarClick() {
            // Gets automata preview
            const automataPreview: AutomataPreview = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Acts based on automata stage
            switch (this.operationState.selectStage) {
                case 0:
                    // Stores operation type and increments stage
                    this.operationState.operationName = "kleene-star";
                    this.operationState.selectStage++;

                    // Tells user to select final states of the first sub-automata
                    this.$bvToast.toast("Select the automata using ALT + click on a state in the automata, and press Kleene Star.", {
                        title: 'Kleene Star',
                        variant: "warning",
                        autoHideDelay: 5000
                    });
                    break;

                case 1:
                    // Gets final states and initial states of the automata
                    const finalStates = AutomataOperations.getFinalStates(this.automata, automataPreview.selectedNodes);
                    const initialStates = AutomataOperations.getInitialStates(this.automata, automataPreview.selectedNodes);

                    // Concatenate
                    AutomataOperations.kleeneStar(this.automata, finalStates, initialStates, automataPreview.cy);
                    this.$forceUpdate();

                    // Tells user to select initial states of the second sub-automata
                    this.$bvToast.toast("Kleene Star successfully computed!", {
                        title: 'Kleene Star',
                        variant: "success",
                        autoHideDelay: 5000
                    });

                    // Clears state
                    this.clearOperationState();
                    break;
            }
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