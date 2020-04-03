<template>

    <!-- Body -->
    <div>
        <b-container fluid>
            <b-row>

                <!-- LEFT PANE (FOLDING, AUTOMATA OPERATIONS, EXPLORATION AND SEARCH) -->
                <b-col>
                    <LeftPane :automata="automata"
                              ref="leftPane"
                              @onOperationButtonClick="onOperationButtonClick"
                              @onStateFoldCompute="onStateFoldCompute"
                              @onDuplicateCompute="onDuplicateCompute"
                              @onUnionCompute="onUnionCompute"
                              @onConcatenationCompute="onConcatenationCompute"
                              @onKleeneStarCompute="onKleeneStarCompute"
                              @onProductCompute="onProductCompute"

                              @onMultiLevelExplore="onMultiLevelExplore"
                              @onSearchItemClick="onSearchItemClick"
                    ></LeftPane>
                </b-col>

                <!-- MIDDLE PANE (CYTOSCAPE) -->
                <b-col cols="6">
                    <MiddlePane :automata="automata"
                                ref="middlePane"
                                @onCreateTransition="onCreateTransition"
                                @onEditTransition="onEditTransition"
                                @onEditState="onEditState"
                    ></MiddlePane>
                </b-col>

                <!-- RIGHT PANE (INPUTS) -->
                <b-col>
                    <RightPane  :automata="automata"
                                ref="rightPane"
                                @changeHighlightedNodes="onChangeHighlightedNodes"
                    ></RightPane>
                </b-col>

            </b-row>
        </b-container>

    </div>

</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator';
    import { BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea, BFormCheckbox } from 'bootstrap-vue';
    import AutomataPreview from '@/components/middlepane/AutomataPreview.vue';
    import ConfigTable from '@/components/rightpane/animation/ConfigTable.vue';
    import Automata from "../classes/Automata";
    import uuidv1 from "uuid/v1";
    import AutomataOperations from "@/classes/AutomataOperations";
    import NewTransitionModal from "@/components/modals/NewTransitionModal.vue";
    import SearchTable from "@/components/leftpane/visualisation/SearchTable.vue";
    import MultiLevelSelect from "@/components/leftpane/visualisation/MultiLevelSelect.vue";

    import MiddlePane from "@/components/middlepane/MiddlePane.vue";
    import RightPane from "@/components/rightpane/RightPane.vue";
    import LeftPane from "@/components/leftpane/LeftPane.vue";
    import ModalsEventHandler from "@/events/ModalsEventHandler";
    import FiniteAutomata from "@/classes/FiniteAutomata";
    import PushdownAutomata from "@/classes/PushdownAutomata";
    import TuringMachine from "@/classes/TuringMachine";
    import OutlineUpdateEventHandler from "@/events/OutlineUpdateEventHandler";
    import StyleUpdateEventHandler from "@/events/StyleUpdateEventHandler";

    @Component({
        components: {
            // Custom components
            MiddlePane, RightPane, LeftPane,
            ConfigTable, AutomataPreview, NewTransitionModal, SearchTable, MultiLevelSelect,

            // Bootstrap components
            BButton, BContainer, BRow, BCol, BTabs, BTab, BFormTextarea, BFormCheckbox,
        },
    })
    export default class TabBody extends Vue {
        @Prop() public readonly automata!: Automata;
        @Prop() public readonly index!: number;

        /** Automata preview reference */
        private automataPreview: any;

        /** Right pane reference */
        private rightPane: any;

        /** Left pane reference */
        private leftPane: any;

        /** Middle pane reference */
        private middlePane: any;

        get RightPane(): any {
            return this.rightPane;
        }

        get LeftPane(): any {
            return this.leftPane;
        }

        get MiddlePane(): any {
            return this.middlePane;
        }

        private mounted() {
            this.automataPreview = (this.$refs["middlePane"] as any).getAutomataPreviewReference();
            this.rightPane = (this.$refs["rightPane"] as any);
            this.leftPane = (this.$refs["leftPane"] as any);
            this.middlePane = (this.$refs["middlePane"] as any);

            // Update outline pane if event is captured
            OutlineUpdateEventHandler.$on('updateOutline', () => {
                this.updateOutlinePane();
            });

            // Update styles if event is captured
            StyleUpdateEventHandler.$on("styleUpdate", (newStyles: any) => {
                if (this.automataPreview.selectedNodes.size > 0) {
                    // Goes through every editable style
                    Object.keys(newStyles).forEach(editedStyle => {
                        // Creates selector
                        const editableStyleSelector = newStyles[editedStyle].selector;
                        let selector = "";
                        let selectedNodeIndex = 0;

                        // Goes through every selected element
                        this.automataPreview.selectedNodes.forEach((selectedNode: string) => {
                            selector += ("#" +
                                selectedNode +
                                (editableStyleSelector === 'node' ? '' : editableStyleSelector) +
                                (selectedNodeIndex === this.automataPreview.selectedNodes.size - 1 ? '' : ',')
                            );
                            selectedNodeIndex++;
                        });

                        // Updates style
                        this.automataPreview.cy.style()
                            .selector(selector)
                            .style(newStyles[editedStyle].style)
                            .update();
                    });
                } else {
                    // Gets default styles
                    const defaultStyles: any[] = require("../config/cytoscape-config").default.style;

                    // Goes through every default style
                    defaultStyles.forEach((defaultStyle: any, defaultStyleIndex: number) => {
                        // Goes through every editable style
                        Object.keys(newStyles).forEach(editedStyle => {
                            // If we have a match
                            if (defaultStyle.selector === newStyles[editedStyle].selector) {
                                // Updates style
                                defaultStyles[defaultStyleIndex].style = {
                                    ...defaultStyles[defaultStyleIndex].style,
                                    ...newStyles[editedStyle].style
                                };
                            }
                        });
                    });

                    // Update stylesheet
                    this.automataPreview.cy.style(defaultStyles);
                }

                console.log(this.automataPreview.cy.style());

                // Waits for a tick and then updates outline
                this.$nextTick();
                this.updateOutlinePane();
            });
        }

        /**
         * Updates outline pane using Cytoscape instance
         */
        private updateOutlinePane() {
            // If the pane is disabled, don't update
            if (!this.leftPane.VisualisationPane.OutlinePane.Enabled)
                return;

            // Selects a cytoscape div where the bounding rect isn't 0
            let cytoscapeDiv: any = undefined;
            document.querySelectorAll("#cytoscape-div").forEach((div: Element) => {
                if (div.getBoundingClientRect().width != 0 && div.getBoundingClientRect().height != 0)
                    cytoscapeDiv = div;
            });

            // If cytoscape is still undefined, just leave
            if (!cytoscapeDiv)
                return;

            // Gets properties
            const w = cytoscapeDiv.getBoundingClientRect().width;
            const h = cytoscapeDiv.getBoundingClientRect().height;
            const bb = this.automataPreview.cy.elements().boundingBox();
            const zoom = Math.min(w / bb.w, h / bb.h);

            // Gets outline png and updates img with it
            const png = this.automataPreview.cy.png({
                full: true,
                scale: zoom,
                maxHeight: h,
                maxWidth: w
            });
            this.leftPane.VisualisationPane.OutlinePane.updateOutline(png);
        }

        /**
         * Swaps the stylesheet for another
         * @param newStyle - the new stylesheet
         */
        private changeStyle(newStyle: any) {
            this.automataPreview.cy.style(newStyle);
        }

        /**
         * When user wants to create a transition
         */
        private onCreateTransition(args: any) {
            // Destructures arguments
            const {event, sourceNode, targetNode, addedEles} = args;

            // Removes automatically created element
            this.automataPreview.cy.remove(addedEles);

            // Gets automata type
            let automataType: string = "";
            if (this.automata instanceof FiniteAutomata)
                automataType = "FA";
            if (this.automata instanceof PushdownAutomata)
                automataType = "PDA";
            if (this.automata instanceof TuringMachine)
                automataType = "TM";

            // Gets existing symbols
            const existingSymbols = this.automata.cacheTransition.getTransitions(
                sourceNode.json().data.name,
                targetNode.json().data.name);

            // Uses modal for transition creation
            ModalsEventHandler.$emit("onNewTransition", {
                automataType, existingSymbols,
                callback: (symbol: string, payload: any) => {
                    this.automata.addTransition(
                        symbol,
                        sourceNode.json().data.name,
                        targetNode.json().data.name,
                        payload
                    );
                }
            });
        }

        /**
         * When user wants to edit a transition
         * @param transitionID - the ID of the transition to edit
         */
        private onEditTransition(transitionID: string) {
            // Gets automata type
            let automataType: string = "";
            if (this.automata instanceof FiniteAutomata)
                automataType = "FA";
            if (this.automata instanceof PushdownAutomata)
                automataType = "PDA";
            if (this.automata instanceof TuringMachine)
                automataType = "TM";

            // Gets source and target nodes in advance
            const [sourceNode, targetNode] = [
                this.automata.getData()[transitionID].data.sourceName,
                this.automata.getData()[transitionID].data.targetName
            ];

            // Gets existing symbols
            const existingSymbols = this.automata.cacheTransition.getTransitions(sourceNode, targetNode);
            existingSymbols.delete(this.automata.getData()[transitionID].data.symbol);

            // Uses modal for transition editing
            ModalsEventHandler.$emit("onEditTransition", {
                automataType, existingSymbols,
                transition: this.automata.getData()[transitionID].data,
                callback: (symbol: string, payload: any) => {
                    // Remove old transition, add new one
                    this.automata.removeTransitionWithID(transitionID);
                    this.automata.addTransition(
                        symbol,
                        sourceNode,
                        targetNode,
                        payload
                    );
                }
            });
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

                // Updates outline pane
                await this.$nextTick();
                this.updateOutlinePane();
            }
        }

        /**
         * When the user needs to change highlighted nodes
         */
        private onChangeHighlightedNodes(args: any) {
            // Destructs the args
            const {deselect, select} = args;

            // Deselects nodes
            deselect.forEach((deselectNode: any) => {
                const id = this.automata.getState(deselectNode).data.id;

                // Removes from Automata
                const classIndex = this.automata.getData()[id].classes.indexOf('highlighted-node');
                this.automata["data"][id].classes.splice(classIndex, 1);

                // Removes from cytoscape
                this.automataPreview.cy.getElementById(id).removeClass('highlighted-node');
            });

            // Selects nodes
            select.forEach((selectNode: any) => {
                const id = this.automata.getState(selectNode).data.id;

                // Adds to Automata
                this.automata["data"][id].classes.push('highlighted-node');

                // Adds to cytoscape
                this.automataPreview.cy.getElementById(id).addClass('highlighted-node');
            });
        }

        /**
         * When the user clicks on an operation button
         */
        private onOperationButtonClick(callback: any) {
            // Creates callback argument (set of selected nodes)
            const callbackArg = new Set(this.automataPreview.selectedNodes);

            // Deselect all nodes
            for (const selectedID of this.automataPreview.selectedNodes)
                this.automataPreview.cy.getElementById(selectedID).unselect();

            // Calls back this event with the currently selected nodes
            callback(callbackArg);
        }

        /**
         * When the user wants to perform "State fold"
         */
        private onStateFoldCompute(selectedNodes: Set<string>[]) {
            // Creates parent node
            let parentID = uuidv1();
            const parentNode = this.automataPreview.cy.add([
                {
                    group: 'nodes',
                    data: { id: parentID, name: "" },
                    position: { x: 100, y: 100 },
                    classes: ['parent']
                },
            ]);

            // Sets parent of all selected nodes
            let grandParent: any = null;
            for (const node of selectedNodes[0]) {
                grandParent = this.automataPreview.cy.getElementById(node)[0]._private.data.parent;
                this.automataPreview.cy.getElementById(node).move({
                    parent: parentID
                });

                // Sets parent property in data
                let data: any = this.automata.getData();
                data[node].parent = parentID;
                this.automata.setData(data);
            }

            // Sets grandparent (parent of parent)
            this.automataPreview.cy.getElementById(parentID).move({
                parent: grandParent
            });

            // Add this node to automata class
            let newData: any = this.automata.getData();
            newData[parentID] = this.automataPreview.cy.nodes("#" + parentID)[0]._private;
            this.automata.setData(newData);
        }

        /**
         * When the user wants to perform "Duplicate"
         */
        private async onDuplicateCompute(selectedNodes: Set<string>[]) {
            // Duplicates
            const newDuplicatedObjects: Set<string> = AutomataOperations.duplicate(this.automata, selectedNodes[0]);

            // Waits for one tick
            await this.$nextTick();

            // De-selects the currently selected nodes
            for (const selectedObj of this.automataPreview.selectedNodes)
                this.automataPreview.cy.getElementById(selectedObj).unselect();

            // Clears selected nodes
            this.automataPreview.selectedNodes.clear();

            // Selects all the duplicates
            for (const newDuplicatedObject of newDuplicatedObjects)
                this.automataPreview.cy.getElementById(newDuplicatedObject).select();
        }

        /**
         * When the user wants to perform "Union"
         */
        private onUnionCompute(selectedNodes: Set<string>[]) {
            // Performs union
            AutomataOperations.union(this.automata, selectedNodes[0], selectedNodes[1], this.automataPreview.cy);
        }

        /**
         * When the user wants to perform "Concatenation"
         */
        private onConcatenationCompute(selectedNodes: Set<string>[]) {
            // Gets final states of automata 1 and initial states of automata 2
            const finalStateAutomata1 = AutomataOperations.getFinalStates(this.automata, selectedNodes[0]);
            const initialStateAutomata2 = AutomataOperations.getInitialStates(this.automata, selectedNodes[1]);

            // Concatenate
            AutomataOperations.concatenation(this.automata, finalStateAutomata1, initialStateAutomata2, this.automataPreview.cy);
            this.$forceUpdate();
        }

        /**
         * When the user wants to perform "Kleene star"
         */
        private onKleeneStarCompute(selectedNodes: Set<string>[]) {
            // Gets final states and initial states of the automata
            const finalStates = AutomataOperations.getFinalStates(this.automata, selectedNodes[0]);
            const initialStates = AutomataOperations.getInitialStates(this.automata, selectedNodes[0]);

            // Kleene star
            AutomataOperations.kleeneStar(this.automata, finalStates, initialStates, this.automataPreview.cy);
            this.$forceUpdate();
        }

        /**
         * When the user wants to perform "Product"
         */
        private onProductCompute(selectedNodes: Set<string>[]) {
            // Product
            AutomataOperations.product(this.automata, selectedNodes[0], selectedNodes[1], this.automataPreview.cy);
            this.$forceUpdate();
        }

        /**
         * When the user clicked on an item in the search table
         */
        private onSearchItemClick(id: string) {
            // Get position of node and pans there
            this.automataPreview.cy.center(this.automataPreview.cy.getElementById(id));
        }

        /**
         * When the user wants to see multi-levels
         */
        private onMultiLevelExplore(level: number) {
            // Clear all selected nodes
            this.automataPreview.selectedNodes.forEach((selectedNode: any) => this.automataPreview.cy.getElementById(selectedNode).unselect());

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
                    const currentNodeID = this.automata.getState(currentNode).data.id;
                    this.automataPreview.cy.getElementById(currentNodeID).select();

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
            for (const selectedID of this.automataPreview.selectedNodes)
                this.automataPreview.cy.getElementById(selectedID).unselect();
            this.automataPreview.selectedNodes.clear();
        }
    }
</script>

<style lang="scss" scoped>
    #decision {
        margin: 30px 0;
        font-weight: bold;
    }
</style>
