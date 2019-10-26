<template>
    <div class="about">

        <b-button variant="primary">Test button</b-button>
        <h1>Here is cytoscape:</h1>
        <cytoscape ref="cy" :config="myConfig" v-on:mousedown="onMouseDown" v-on:cxttapstart="onStart">
            <cy-element
                    v-for="def in elements"
                    :key="`${def.data.id}`"
                    :definition="def"
                    :sync="true"
                    v-on:mousedown="onStateClick"
            />
        </cytoscape>

    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator';
    import { Core, EventObject } from 'cytoscape'
    import { BButton } from 'bootstrap-vue'

    @Component({
        components: {
            BButton
        }
    })
    export default class About extends Vue {
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
                        'target-arrow-shape': 'triangle'
                    }
                }
            ],
            layout: {
                name: 'grid',
                rows: 1
            }
        };

        elements: object[] = [
            { // node a
                data: { id: 'a' },
                position: {x: 10, y: 10}
            }, { // node b
                data: { id: 'b' },
                position: {x: 50, y: 60}
            }, { // edge ab
                data: { id: 'ab', source: 'a', target: 'b' }
            }
        ];

        onMouseDown() {
            console.log("Mouse down");
        }

        onStart() {
            console.log("Start");
        }

        onStateClick() {
            console.log("On state click");
        }
    }

</script>
