<template>
    <div id="middlePane">

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
                ref="automata"
                @createTransition="$emit('onCreateTransition', $event)"
                @editTransition="$emit('onEditTransition', $event)"
                @editState="$emit('onEditState', $event)"
        />

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import AutomataPreview from "./AutomataPreview.vue";
    import Vue from "vue";
    import Automata from "@/classes/Automata";

    @Component({
        components: {
            AutomataPreview
        }
    })
    export default class MiddlePane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        /**
         * Gets automata preview reference
         * @returns AutomataPreview reference (make sure to type it as 'any')
         */
        public getAutomataPreviewReference(): any {
            return this.$refs["automata"];
        }

        /**
         * Zooms the canvas in a direction
         * @param direction either the string 'in' or 'out' for zooming in and out; everything else will be ignored
         */
        private zoom(direction: string) {
            // Gets automata preview reference
            const automataPreview: any = this.getAutomataPreviewReference();

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
    }
</script>

<style scoped>
    #zoom-and-styles {
        display:flex;
        justify-content: space-between;

        padding: 5px 10px;
    }
    #zoom > * {
        margin-right: 10px;
    }
</style>