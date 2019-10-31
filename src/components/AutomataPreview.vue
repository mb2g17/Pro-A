<template>

    <!-- CYTOSCAPE -->
    <cytoscape ref="cy" :config="myConfig" v-on:mousedown="onMouseDown" v-on:cxttapstart="onStart">
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
                }, {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'label': 'data(label)'
                    }
                }
            ],
            layout: {
                name: 'grid',
                rows: 1
            }
        };
    }
</script>

<style scoped>

</style>
