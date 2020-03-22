<template>

    <!-- CYTOSCAPE -->
    <cytoscape
            ref="cy"
            :config="myConfig"
            :preConfig="preConfig"
            :afterCreated="afterCreated">
        <cy-element
                v-for="def in automata.getData()"
                :key="`${def.data.id}`"
                :definition="def"
        />
    </cytoscape>

</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import $ from "jquery";
import edgehandles from 'cytoscape-edgehandles';
import contextMenus from 'cytoscape-context-menus';
import expandCollapse from 'cytoscape-expand-collapse';
import edgeEditing from 'cytoscape-edge-editing';
import dblclick from 'cytoscape-dblclick';

// Automata config
import config from '../../config/cytoscape-config';

// CSS for cytoscape-context-menus
import 'cytoscape-context-menus/cytoscape-context-menus.css';

// Custom components and classes
import Automata from '@/classes/Automata';
import PushdownAutomata from "@/classes/PushdownAutomata";
import TuringMachine from "@/classes/TuringMachine";

// Lodash
import _ from 'lodash';

@Component
export default class AutomataPreview extends Vue {
    /** The automata to preview */
    @Prop() public readonly automata!: Automata;

    /** Config object (exported data stored as property) */
    public myConfig: object = config;

    /** The cytoscape instance in this preview component */
    public cy: any;

    /** ID of selected items */
    public selectedNodes: Set<any> = new Set();

    /** The x position of the mouse on the automata canvas, updated by mousemove */
    public mousePositionX: number = 0;

    /** The y position of the mouse on the automata canvas, updated by mousemove */
    public mousePositionY: number = 0;

    /** If true, alt key is down, if false it's not */
    private isAltDown: boolean = false;

    /** If true, we are doing a machine select. Prevents infinite loop select events */
    private isDoingMachineSelect: boolean = false;

    public preConfig(cytoscape: any) {
        try {
            contextMenus(cytoscape, $);
            edgehandles(cytoscape, $);
            expandCollapse(cytoscape, $);
            edgeEditing(cytoscape, $);
            dblclick(cytoscape, $);
        } catch (e) {
            console.log(e.fullStackTrace);
        }
        //cytoscape.use(contextMenus, $);
        //cytoscape.use(edgehandles);
    }

    public afterCreated(cy: any) {
        this.cy = cy; // Stores cytoscape instance

        // Sets up extensions
        this.initEdgeHandles();
        this.initContextMenu();
        this.initExpandCollapse();
        this.initEdgeEditing();
        this.initDoubleClick();

        // Hacky event that remembers if ALT is held down
        document.body.addEventListener('keydown', evt => {
            /*if (evt.key === "ArrowUp")
            {
                for (const selectedObj of this.selectedNodes)
                {
                    this.cy.style()
                        .selector(`#${selectedObj}`)
                            .style('control-point-step-size', '200px')
                        .update();

                    let oldSize = cy.style().selector(`#${selectedObj}`).json();
                    console.log(oldSize);
                }
            }*/

            if (evt.key === "Alt")
                this.isAltDown = true;
        });
        document.body.addEventListener('keyup', evt => {
            if (evt.key === "Alt")
                this.isAltDown = false;
        });

        // When the user selects a node
        cy.on('select', (event: any) => {
            const id = event.target.id();
            this.selectedNodes.add(id);

            // If alt is held down, select the whole machine
            if (this.isAltDown && !this.isDoingMachineSelect) {
                // --
                console.log(this.automata.getMachine(this.automata.getStateById(id).data.name));
                // --

                this.isDoingMachineSelect = true;
                this.selectedNodes.clear();
                this.cy.$(`#${id}`).unselect();

                // Gets relevant items of this machine
                const selectedState: any = this.automata.getStateById(id);
                const machineItems: Set<string> = this.automata.getMachineWithTransitions(selectedState.data.name);

                // Selects all the states of the machine
                for (const machineItemID of machineItems) {
                    this.cy.$(`#${machineItemID}`).select();
                    this.selectedNodes.add(machineItemID);
                }

                // Sets flag to false
                this.isDoingMachineSelect = false;
            }
        });

        // When the user deselects a node
        cy.on('unselect', (event: any) => {
            const id = event.target.id();
            this.selectedNodes.delete(id);
        });

        // When the user taps on the screen
        cy.on('tap', (event: any) => {
            // If we clicked on a parent
            if (event.target[0]) {
                if (event.target[0]._private.classes.has("parent")) {
                    // Gets x and y of parent
                    const [parentX, parentY] = [event.target[0]._private.position.x, event.target[0]._private.position.y];
                    const [parentWidth, parentHeight] = [event.target[0]._private.autoWidth, event.target[0]._private.autoHeight];

                    // Gets x and y of click
                    const [tapX, tapY] = [event.position.x, event.position.y];

                    // Check if user tapped on cue (collapse version)
                    const [left, top] =  [parentX - (parentWidth / 2), parentY - (parentHeight / 2)];
                    if (Math.abs(tapX - left) < 6 && Math.abs(tapY - top) < 6) {
                        let api = this.cy.expandCollapse('get');
                        api.collapse(event.target);
                    }

                    // Check if user tapped on cue (expand version)
                    else if (tapX < parentX && tapY < parentY && event.target[0]._private.classes.has("cy-expand-collapse-collapsed-node")) {
                        let api = this.cy.expandCollapse('get');
                        api.expand(event.target);
                    }
                }
            }
        });

        // When the user moves the mouse
        cy.on('mousemove', (event: any) => {
            this.mousePositionX = event.position.x;
            this.mousePositionY = event.position.y;
        });

        // When the user drags an object and drops
        cy.on('dragfree', (event: any) => {
            // Gets ID and new position
            const stateID = event.target._private.data.id;

            // Updates position of state
            let state = this.automata.getData()[stateID];
            this.automata.updateItem(stateID, {
                ...state,
                position: event.target._private.position
            });
        });
    }

    /**
     * Sets up edge handles extension
     */
    private initEdgeHandles() {
        const eh = this.cy.edgehandles({
            handleInDrawMode: true,
            nodeLoopOffset: 50, // offset for edgeType: 'node' loops
            snap: true,
            edgeType: (sourceNode: any, targetNode: any) => {
                // If we're selecting nothing
                if (targetNode.length === 0)
                    return "flat";

                // If we're trying to select a fold, don't allow the edge
                if (targetNode._private.classes.has("parent"))
                    return null;
                else
                    return "flat";
            },
            loopAllowed: function loopAllowed(node: any) {
                // for the specified node, return whether edges from itself to itself are allowed
                return true;
            },
            show: (sourceNode: any) => {
                // If we're hovering on a parent, hide the edge handle
                if (sourceNode[0]._private.classes.has("parent"))
                    eh.hide();
            }
        });

        // On edge creation
        this.cy.on('ehcomplete', (event: any, sourceNode: any, targetNode: any, addedEles: any) => {
            this.$emit('createTransition', {event, sourceNode, targetNode, addedEles});

            /*this.cy.remove(addedEles);
            const symbol = prompt('Please enter transition symbol (__epsilon for epsilon move. If TM, use __empty for empty tape symbol):', 'a');
            if (symbol === null)
                return;

            // If it's not finite, we need a payload
            let payload = {};

            // Pushdown automata
            if (this.automata instanceof PushdownAutomata) {
                const input = prompt('Please enter stack symbol (use __empty for empty stack symbol and null for epsilon):', 'A');
                let output: string | string[] | null = prompt('Please enter output stack symbols, separated by commas (use null for epsilon):', 'A,B');
                if (input && output) {
                    output = output.split(',');
                    payload = {
                        input, output
                    };
                }
            }

            // Turing machine
            if (this.automata instanceof TuringMachine) {
                const writeTapeSymbol = prompt('Please enter symbol to write on the tape', 'a');
                let direction = prompt('Please enter direction (L or R):', 'R');
                if (writeTapeSymbol && direction) {
                    payload = {
                        writeTapeSymbol, direction
                    };
                }
            }

            this.automata.addTransition(symbol, sourceNode._private.data.name, targetNode._private.data.name, payload);*/
        });
    }

    /**
     * Sets up context menu extension
     */
    private initContextMenu() {
        const cm = this.cy.contextMenus({
            menuItems: [
                // -- STATES --
                /*{
                    id: 'collapse',
                    content: 'Collapse state',
                    tooltipText: 'collapse',
                    selector: 'node',
                    onClickFunction: (event: any) => {
                        let api = this.cy.expandCollapse('get');
                        api.collapseAll();
                    }
                },
                {
                    id: 'Expand',
                    content: 'Expand state',
                    tooltipText: 'expand',
                    selector: 'node',
                    onClickFunction: (event: any) => {
                        let api = this.cy.expandCollapse('get');
                        api.expandAll();
                    }
                },*/
                {
                    id: 'add-to-fold',
                    content: 'Add selected state(s) to this fold',
                    tooltipText: 'add-to-fold',
                    selector: '.parent',
                    hasTrailingDivider: true,
                    onClickFunction: (event: any) => {
                        // If there are no selected nodes, send a toast
                        if (this.selectedNodes.size === 0) {
                            this.$bvToast.toast("No nodes selected to add to state fold!", {
                                title: 'Warning',
                                variant: "warning",
                                autoHideDelay: 5000
                            });
                            return;
                        }

                        // Gets parent ID
                        const parentID = event.target[0]._private.data.id;

                        // Goes through every selected node
                        for (const node of this.selectedNodes) {
                            // Sets parent of this node to new parent
                            this.cy.getElementById(node).move({
                                parent: parentID
                            });

                            // Sets parent property in data
                            let data: any = this.automata.getData();
                            data[node].parent = parentID;
                            this.automata.setData(data);
                        }
                    }
                },
                {
                    id: 'remove-from-fold',
                    content: 'Remove selected state(s) from folds',
                    tooltipText: 'remove-from-fold',
                    selector: 'node',
                    hasTrailingDivider: true,
                    onClickFunction: (event: any) => {
                        // If there are no selected nodes, send a toast
                        if (this.selectedNodes.size === 0) {
                            this.$bvToast.toast("No nodes selected to remove from state folds!", {
                                title: 'Warning',
                                variant: "warning",
                                autoHideDelay: 5000
                            });
                            return;
                        }
                        // Goes through every selected node
                        for (const node of this.selectedNodes) {
                            // Removes parent from this node
                            this.cy.getElementById(node).move({
                                parent: null
                            });

                            // Sets parent property in data
                            let data: any = this.automata.getData();
                            data[node].parent = null;
                            this.automata.setData(data);
                        }
                    }
                },
                {
                    id: 'initial',
                    content: 'Toggle initial state',
                    tooltipText: 'initial',
                    selector: 'node',
                    onClickFunction: (event: any) => {
                        // Gets state name and initial property
                        const stateName = event.target._private.data.name;
                        const initial = this.automata.getState(stateName).data.initial;

                        // Toggles initial state + class
                        this.automata.setInitialState(stateName, !initial);
                        event.target.toggleClass('initial-node');
                    }
                },
                {
                    id: 'final',
                    content: 'Toggle final state',
                    tooltipText: 'final',
                    selector: 'node',
                    onClickFunction: (event: any) => {
                        // Gets state name and final property
                        const stateName = event.target._private.data.name;
                        const final = this.automata.getState(stateName).data.final;

                        // Toggles initial state
                        this.automata.setFinalState(stateName, !final);
                        event.target.toggleClass('final-node');
                    }
                },
                {
                    id: 'remove',
                    content: 'Remove',
                    tooltipText: 'remove',
                    selector: 'node, edge',
                    onClickFunction: (event: any) => {
                        // Removes object from Cytoscape
                        let target = event.target || event.cyTarget;
                        const removedElements = target.remove();

                        // Goes through all removed elements
                        for (let i = 0; i < removedElements.length; i++) {
                            const elem = removedElements[i];

                            // If this is a state
                            if (elem._private.data.type === "node") {
                                // Removes node from data
                                const name = elem._private.data.name;
                                this.automata.removeState(name);
                            }
                            // If this is a transition
                            else if (elem._private.data.type === "edge") {
                                // Removes edge from data
                                const [symbol, source, target] = [
                                    elem._private.data.symbol,
                                    elem._private.data.sourceName,
                                    elem._private.data.targetName
                                ];
                                this.automata.removeTransition(symbol, source, target);
                            }
                            // If this is a state fold
                            else {
                                this.automata.removeStateFold(elem._private.data.id);
                            }
                        }
                    },
                    hasTrailingDivider: true
                },
                /*{
                    id: 'add-bend-point',
                    content: 'Add Bend Point',
                    selector: 'edge',
                    onClickFunction: (event: any) => {
                        let edge = event.target || event.cyTarget;
                        if(!bendPointUtilities.isIgnoredEdge(edge)) {

                            bendPointUtilities.addBendPoint();
                        }
                    }
                },*/
                {
                    id: 'add-node',
                    content: 'Add node',
                    tooltipText: 'add node',
                    coreAsWell: true,
                    onClickFunction: (event: any) => {
                        // Gets unique name
                        const uniqueName = this.automata.getNewStateName();

                        // Creates new state
                        this.automata.addState(uniqueName, event.position.x, event.position.y, false, false);
                    }
                },
            ]
        });
    }

    /**
     * Sets up expand collapse extension
     */
    private initExpandCollapse() {
        const ec = this.cy.expandCollapse({
            layoutBy: null,
            fisheye: false,
            animate: false,
            undoable: false,
            ready: () => console.log("Expand collapse is ready"),

            cueEnabled: true,
            expandCollapseCueSensitivity: 0.001
        });

        this.cy.nodes().on("expandcollapse.beforecollapse", (event: any) => {
            console.log("beforecollapse");
        });
        this.cy.nodes().on("expandcollapse.aftercollapse", (event: any) => {
            console.log("aftercollapse");
        });
        this.cy.nodes().on("expandcollapse.beforeexpand", (event: any) => {
            console.log("beforeexpand");
        });
        this.cy.nodes().on("expandcollapse.afterexpand", (event: any) => {
            console.log("afterexpand");
        });
    }

    /**
     * Sets up edge editing
     */
    private initEdgeEditing() {
        (window as any)['$'] = $; // Globally defines jQuery so that this dumb plugin will work
        let instance = this.cy.edgeEditing({
            bendRemovalSensitivity: 16,
            handleReconnectEdge: (sourceID: any, targetID: any, edge: any) => {
                // Gets source and target names
                const sourceName = this.automata.getStateById(sourceID).data.name;
                const targetName = this.automata.getStateById(targetID).data.name;

                // Updates on automata instance
                this.automata.changeSourceOfTransition(edge.id, sourceID);
                this.automata.changeTargetOfTransition(edge.id, targetID);

                // Updates on cytoscape
                let edgeData = this.cy.getElementById(edge.id)[0].json();
                edgeData.data.source = sourceID;
                edgeData.data.sourceName = sourceName;
                edgeData.data.target = targetID;
                edgeData.data.targetName = targetName;
                this.cy.getElementById(edge.id)[0].json(edgeData);
            }
        });
        this.cy.style().update();
    }

    /**
     * Sets up double clicking
     */
    private initDoubleClick() {
        this.cy.dblclick();

        this.cy.on('dblclick', (event: any) => {
            // If we're double clicking on empty space, create a new state
            if (event.target.constructor.name === "Core") {
                // Gets unique name
                const uniqueName = this.automata.getNewStateName();

                // Creates new state
                this.automata.addState(uniqueName, this.mousePositionX, this.mousePositionY, false, false);
            }
            else {
                // If we're double clicking on a transition
                if (event.target._private.data.type === "edge") {
                    // Get edge ID
                    const edgeID = event.target._private.data.id;

                    // Call event
                    this.$emit("editTransition", edgeID);
                } else {
                    // Get node ID
                    const nodeID = event.target._private.data.id;

                    // Call event
                    this.$emit("editState", nodeID);
                }
            }
        });
    }
}
</script>

<style lang="scss">
    /* Sets the hight of cytoscape div to min-height */
    #cytoscape-div {
        height: 1px;
    }
</style>
