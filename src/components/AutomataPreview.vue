<template>

    <!-- CYTOSCAPE -->
    <cytoscape
            ref="cy"
            :config="myConfig"
            :preConfig="preConfig"
            :afterCreated="afterCreated"
            @tap="$emit('tapArea', $event)"
            @cxttapstart="onStart">
        <cy-element
                v-for="def in automata.getData()"
                :key="`${def.data.id}`"
                :definition="def"
                v-on:mousedown="onStateClick"
        />
    </cytoscape>

</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import Automata from '@/classes/Automata';
import jquery from "jquery";
import edgehandles from 'cytoscape-edgehandles';
import contextMenus from 'cytoscape-context-menus';

// Automata config
import config from './config';

// CSS for cytoscape-context-menus
import 'cytoscape-context-menus/cytoscape-context-menus.css';

@Component
export default class AutomataPreview extends Vue {
    @Prop() public readonly automata!: Automata;

    public myConfig: object = config;

    public preConfig(cytoscape: any) {
        //contextMenus(cytoscape, jquery);
        cytoscape.use(contextMenus, jquery);
        cytoscape.use(edgehandles);
    }

    public afterCreated(cy: any) {
        // -- EDGEHANDLES --
        const eh = cy.edgehandles({
            handleInDrawMode: true,
            nodeLoopOffset: 50, // offset for edgeType: 'node' loops
            snap: true,
            loopAllowed: function loopAllowed(node: any) {
                // for the specified node, return whether edges from itself to itself are allowed
                return true;
            },
        });

        // On edge creation
        cy.on('ehcomplete', (event: any, sourceNode: any, targetNode: any, addedEles: any) => {
            cy.remove(addedEles);
            const symbol = prompt('Please enter transition symbol:', 'a');
            if (symbol !== null) {
                this.automata.addTransition(symbol, sourceNode._private.data.name, targetNode._private.data.name);
            }
        });

        // -- CONTEXT MENU --
        const cm = cy.contextMenus({
            menuItems: [
                // -- STATES --
                {
                    id: 'initial',
                    content: 'Toggle initial state',
                    tooltipText: 'initial',
                    selector: 'node',
                    onClickFunction: (event: any) => {
                        // Gets state name and initial property
                        const stateName = event.target._private.data.name;
                        const initial = this.automata.getState(stateName).initial;

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
                        const final = this.automata.getState(stateName).final;

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
                            else {
                                // Removes edge from data
                                const [symbol, source, target] = [
                                    elem._private.data.label,
                                    elem._private.data.sourceName,
                                    elem._private.data.targetName
                                ];
                                this.automata.removeTransition(symbol, source, target);
                            }
                        }
                    },
                    hasTrailingDivider: true
                },
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

    public onMouseDown(e: any) {
    }

    public onStart() {
    }

    public onStateClick() {
    }
}
</script>

<style scoped>
</style>
