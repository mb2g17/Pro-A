<template>

    <!-- Body -->
    <div>
        <b-container fluid>
            <b-row>

                <!-- FOLDING, AUTOMATA OPERATIONS, EXPLORATION AND SEARCH -->
                <b-col>
                    <!-- Automata type display -->
                    <h2>{{ automata.getModelName() }}</h2>

                    <!-- Tabbed functionalities -->
                    <b-tabs>
                        <b-tab title="Operations" active>

                            <!-- Operations -->
                            <div id="operations">
                                <b-button variant="warning" @click="onStateFoldClick">State fold</b-button>
                                <b-button variant="primary" @click="onDuplicateClick">Duplicate</b-button>
                                <b-button :variant="operationState.operationName !== 'union' ? 'primary' : 'success'" @click="onUnionClick">Union</b-button>
                                <b-button :variant="operationState.operationName !== 'concatenation' ? 'primary' : 'success'" @click="onConcatenationClick">Concatenation</b-button>
                                <b-button :variant="operationState.operationName !== 'kleene-star' ? 'primary' : 'success'" @click="onKleeneStarClick">Kleene Star</b-button>
                                <b-button :variant="operationState.operationName !== 'product' ? 'primary' : 'success'" @click="onProductClick">Product</b-button>
                                <b-button v-if="operationState.operationName" variant="danger" @click="clearOperationState">Cancel</b-button>
                            </div>

                        </b-tab>

                        <b-tab title="Visualisation">

                            <!-- Multi-level exploration -->
                            <MultiLevelSelect @multiLevelExplore="onMultiLevelExplore"></MultiLevelSelect>

                            <!-- Search -->
                            <b-form-input type="text" placeholder="State search" class="mt-3" @keyup.enter="onSearch"/>
                            <SearchTable :automata="automata" :ref="`searchTable${index}`" @itemClick="onSearchItemClick"></SearchTable>

                        </b-tab>
                    </b-tabs>
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

                    <p>Number of states: {{ Object.keys(automata["cacheNodeID"]).length }}</p>
                    <p>Number of transitions: {{ automata["cacheTransition"].getNumberOfTransitions() }}</p>
                    <p>Number of objects: {{ Object.keys(automata["cacheNodeID"]).length + automata["cacheTransition"]["cacheNoOfTransitions"] }}</p>

                    <!-- Decision -->
                    <h2 id="decision" v-if="isSimulating">{{ outcome }}</h2>

                    <!-- Config -->
                    <ConfigTable :configs="currentConfigs" />
                </b-col>

            </b-row>
        </b-container>

        <!-- New transition modal -->
        <NewTransitionModal :ref="`newTransitionModal${index}`" :automata="automata" @hide="onNewTransitionModalHide" />

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
    import SearchTable from "@/components/SearchTable.vue";
    import AutomataConfig from "@/classes/AutomataConfig";
    import MultiLevelSelect from "@/components/MultiLevelSelect.vue";

    @Component({
        components: {
            // Custom components
            ConfigTable, AutomataPreview, NewTransitionModal, SearchTable, MultiLevelSelect,

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

        /** The set of current configurations of this automata (to be displayed) */
        private currentConfigs: Set<AutomataConfig> = new Set();

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
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

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
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

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
            // Gets automata preview
            const automataPreview: AutomataPreview = (this.$refs[`automata${this.index}`] as AutomataPreview);

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
                title: `Renaming '${state.data.displayName}'`
            });

            // If it wasn't cancelled, rename
            if (response) {
                this.automata.renameState(stateID, response);
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

            // Gets outcome and current configuration
            this.$set(this, "outcome", this.automata.getOutcome().toLocaleString());
            this.$set(this, "currentConfigs", this.automata.getCurrentConfigs());

            // Updates vue
            this.$forceUpdate();
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

            // Gets outcome and current configurations
            this.$set(this, "outcome", this.automata.getOutcome().toLocaleString());
            this.$set(this, "currentConfigs", this.automata.getCurrentConfigs());

            // Updates vue
            this.$forceUpdate();
        }

        /**
         * When the user clicks on "Cancel" button
         */
        public onCancelClick() {
            this.isSimulating = false; // We are no longer simulating
            this.$set(this, "currentConfigs", new Set());
            this.automata.reset(); // Reset automata configurations and input

            // Updates vue
            this.$forceUpdate();
        }

        /**
         * When the user clicks the "State fold" button
         */
        public onStateFoldClick() {
            // Gets automata preview
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

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
         * When the user clicks the "Duplicate" button
         */
        public async onDuplicateClick() {
            // Gets automata preview
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // If there are selected nodes
            if (automataPreview.selectedNodes.size > 0) {
                // Duplicates
                const newDuplicatedObjects: Set<string> = AutomataOperations.duplicate(this.automata, automataPreview.selectedNodes);

                // Waits for one
                await this.$nextTick();

                // De-selects the currently selected nodes
                for (const selectedObj of automataPreview.selectedNodes)
                    automataPreview.cy.getElementById(selectedObj).unselect();

                // Clears selected nodes
                automataPreview.selectedNodes.clear();

                // Selects all the duplicates
                for (const newDuplicatedObject of newDuplicatedObjects)
                    automataPreview.cy.getElementById(newDuplicatedObject).select();
            } else {
                // Tell user to select nodes
                this.$bvToast.toast("Select a group of states/transitions, then click 'Duplicate' to copy them.", {
                    title: 'Select a group first',
                    variant: "warning",
                    autoHideDelay: 5000
                });
            }
        }

        /**
         * When the user clicks the "Union" button
         */
        public onUnionClick() {
            // Gets automata preview
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

            switch (this.operationState.selectStage) {
                case 0:
                    // If there are selected nodes
                    if (automataPreview.selectedNodes.size > 0) {
                        this.operationState.selectStage = 1;

                        // Stores operation type
                        this.operationState.operationName = "union";

                        // Remember selected nodes
                        this.operationState.selectedStates = new Set(automataPreview.selectedNodes);

                        // Tell user to input another group
                        this.$bvToast.toast("Select the second automata and press Union.", {
                            title: 'Select the second automata',
                            variant: "warning",
                            autoHideDelay: 5000
                        });
                    } else {
                        // Tell user to input another group
                        this.$bvToast.toast("Select the first automata using ALT + click on a state in the automata, and press Union.", {
                            title: 'Select the first automata',
                            variant: "warning",
                            autoHideDelay: 5000
                        });
                    }
                    break;
                case 1:
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
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Acts based on automata stage
            switch (this.operationState.selectStage) {
                case 0:
                    if (automataPreview.selectedNodes.size > 0) {
                        // Stores operation type and increments stage
                        this.operationState.operationName = "concatenation";
                        this.operationState.selectStage = 1;

                        // Remembers the final states of 1st sub-automata
                        this.operationState.selectedStates = new Set(automataPreview.selectedNodes);

                        // Tells user to select initial states of the second sub-automata
                        this.$bvToast.toast("Select the second automata and press Concatenation.", {
                            title: 'Concatenation',
                            variant: "warning",
                            autoHideDelay: 5000
                        });
                    } else {
                        // Tells user to select final states of the first sub-automata
                        this.$bvToast.toast("Select the first automata using ALT + click on a state in the automata, and press Concatenation.", {
                            title: 'Concatenation',
                            variant: "warning",
                            autoHideDelay: 5000
                        });
                    }
                    break;

                case 1:
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
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

            if (automataPreview.selectedNodes.size > 0) {
                // Gets final states and initial states of the automata
                const finalStates = AutomataOperations.getFinalStates(this.automata, automataPreview.selectedNodes);
                const initialStates = AutomataOperations.getInitialStates(this.automata, automataPreview.selectedNodes);

                // Kleene star
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
            } else {
                // Tells user to select final states of the first sub-automata
                this.$bvToast.toast("Select the automata using ALT + click on a state in the automata, and press Kleene Star.", {
                    title: 'Kleene Star',
                    variant: "warning",
                    autoHideDelay: 5000
                });
            }
        }

        /**
         * When the user clicks the "product" button"
         */
        public onProductClick() {
            // Gets automata preview
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Acts based on automata stage
            switch (this.operationState.selectStage) {
                case 0:
                    if (automataPreview.selectedNodes.size > 0) {
                        // Stores operation type and increments stage
                        this.operationState.operationName = "product";
                        this.operationState.selectStage++;

                        // Remember selected nodes
                        this.operationState.selectedStates = new Set(automataPreview.selectedNodes);

                        // Tells user to select second machine
                        this.$bvToast.toast("Select the second automata using ALT + click on a state in the automata, and press Product.", {
                            title: 'Product',
                            variant: "warning",
                            autoHideDelay: 5000
                        });
                    } else {
                        // Tells user to select first machine
                        this.$bvToast.toast("Select the first automata using ALT + click on a state in the automata, and press Product.", {
                            title: 'Product',
                            variant: "warning",
                            autoHideDelay: 5000
                        });
                    }
                    break;

                case 1:
                    // Product
                    AutomataOperations.product(this.automata, this.operationState.selectedStates, automataPreview.selectedNodes, automataPreview.cy);
                    this.$forceUpdate();

                    // Tells user to select initial states of the second sub-automata
                    this.$bvToast.toast("Product successfully computed!", {
                        title: 'Product',
                        variant: "success",
                        autoHideDelay: 5000
                    });

                    // Clears state
                    this.clearOperationState();
                    break;
            }
        }

        /**
         * When the user wants to search for a state
         */
        public onSearch(event: any) {
            // Gets query string
            const query: string = event.target.value;

            // Gets search table reference
            const searchTable: any = (this.$refs[`searchTable${this.index}`] as any);

            // Sets table contents via query
            searchTable.setTable(query, this.automata.findStates(query));
        }

        /**
         * When the user clicked on an item in the search table
         */
        public onSearchItemClick(id: string) {
            // Gets automata preview and deselects everything
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Get position of node and pans there
            automataPreview.cy.center(automataPreview.cy.getElementById(id));
        }

        /**
         * When the user wants to see multi-levels
         */
        private onMultiLevelExplore(level: number) {
            // Gets automata preview and deselects everything
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);

            // Clear all selected nodes
            automataPreview.selectedNodes.forEach((selectedNode: any) => automataPreview.cy.getElementById(selectedNode).unselect());

            // If the level is -1, don't select anything
            if (level === -1)
                return;

            // Stores names of open and closed nodes
            const openNodes: [string, number][] = [];
            const closedNodes: Set<string> = new Set();

            // Fills open nodes with initial states
            this.automata.getInitialStates().forEach((initialState: any) => openNodes.push([initialState, 0]));

            // Goes through all open nodes
            while (openNodes.length > 0) {
                // Pops next node
                const currentNodePopped = openNodes.pop();
                if (currentNodePopped) {
                    const [currentNode, currentLevel]: [string, number] = currentNodePopped;

                    // If this node is closed, don't bother
                    if (closedNodes.has(currentNode))
                        continue;

                    // Select this node
                    console.log(currentNode);
                    const currentNodeID = this.automata.getState(currentNode).data.id;
                    automataPreview.cy.getElementById(currentNodeID).select();

                    // Close this node
                    closedNodes.add(currentNode);

                    // If there are still levels to go up by
                    if (currentLevel < level) {
                        // Get the next nodes we can go to and add to open nodes
                        const targetNodeNames = Object.keys(this.automata.cacheTransition.getTargetMappings(currentNode));
                        targetNodeNames.forEach((targetNodeName: any) => openNodes.push([
                            targetNodeName,
                            currentLevel + 1
                        ]));
                    }
                } else {
                    break;
                }
            }
        }

        /**
         * Is called when the new transition modal is hidden
         * (is mainly used for a bug fix)
         */
        private onNewTransitionModalHide() {
            // Gets automata preview and deselects everything
            const automataPreview: any = (this.$refs[`automata${this.index}`] as AutomataPreview);
            for (const selectedID of automataPreview.selectedNodes)
                automataPreview.cy.getElementById(selectedID).unselect();
            automataPreview.selectedNodes.clear();
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
