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
    import {Vue, Component, Prop} from "vue-property-decorator";
    import Automata from "@/classes/Automata";
    import edgehandles from "cytoscape-edgehandles";

    import config from "./config";

    @Component
    export default class AutomataPreview extends Vue {
        @Prop() readonly automata!: Automata;

        preConfig(cytoscape: any) {
            cytoscape.use(edgehandles);
        }

        afterCreated(cy: any) {
            let eh = cy.edgehandles({
                handleInDrawMode: true,
                nodeLoopOffset: 50, // offset for edgeType: 'node' loops
                snap: true
            });

            // On edge creation
            cy.on("ehcomplete", (event: any, sourceNode: any, targetNode: any, addedEles: any) => {
                cy.remove(addedEles);
                let symbol = prompt("Please enter transition symbol:", "a");
                if (symbol !== null)
                    this.automata.addTransition(symbol, sourceNode._private.data.id, targetNode._private.data.id);
            });
        }

        myConfig: object = config;

        onMouseDown(e: any) {
            console.log(e);
        }

        onStart() {
            console.log("Start");
        }

        onStateClick() {
            console.log("On state click");
        }
    }
</script>

<style scoped>
</style>
