<template>

    <!-- CYTOSCAPE -->
    <cytoscape
            ref="cy"
            :config="myConfig"
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

    @Component
    export default class AutomataPreview extends Vue {
        @Prop() readonly automata!: Automata;

        myConfig: object = {
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        'label': 'data(id)'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#ccc',
                        'label': 'data(label)',

                        'curve-style': 'bezier',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'arrow-scale': 2,
                    }
                }
            ],
            layout: {
                name: 'grid',
                rows: 1
            }
        };

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
