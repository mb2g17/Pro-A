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
            <div>
                <b-button variant="success" @click="onAddStyleClick">Add style</b-button>
                <b-button variant="warning" @click="onStylesClick" class="ml-2">View styles</b-button>
            </div>
        </div>

        <!-- AUTOMATA PREVIEW -->
        <AutomataPreview
                :automata="automata"
                ref="automata"
                @createTransition="$emit('onCreateTransition', $event)"
                @editTransition="$emit('onEditTransition', $event)"
                @editState="$emit('onEditState', $event)"
        />

        <!-- Styles modal -->
        <StylesModal ref="stylesModal"></StylesModal>

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import AutomataPreview from "./AutomataPreview.vue";
    import Vue from "vue";
    import Automata from "@/classes/Automata";
    import ModalsEventHandler from "@/events/ModalsEventHandler";
    import StylesModal from "@/components/modals/styles/StylesModal.vue";
    import ordinal from "ordinal";

    @Component({
        components: {
            AutomataPreview, StylesModal
        }
    })
    export default class MiddlePane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        /** Styles modal reference */
        private stylesModal: any;

        mounted() {
            this.stylesModal = this.$refs["stylesModal"];

            // When the user wants to change styles
            ModalsEventHandler.$on("onStylesChange", (automataID: any) => {
            });

            ModalsEventHandler.$on("onAddStyle", (args: any) => {
            });
        }

        /**
         * Updates style cards
         */
        public updateStyleCards(cards: any) {
            this.stylesModal.cards = cards;
        }

        public get isThereSelectedNodes(): boolean {
            const automataPreview = this.getAutomataPreviewReference();
            console.log(automataPreview);
            return automataPreview ? this.getAutomataPreviewReference().selectedNodes.size > 0 : false;
        }

        /**
         * Gets automata preview reference
         * @returns AutomataPreview reference (make sure to type it as 'any')
         */
        public getAutomataPreviewReference(): any {
            return this.$refs["automata"];
        }

        /**
         * When the user wants to view styles
         * @param callback - run when the user tries to apply styles
         */
        public viewStyles(callback: any) {
            this.stylesModal.show(callback);
        }

        /**
         * When the user wants to add a style
         * @param callback - run when the user tries to apply styles
         * @param selectedNodes - the nodes of the new style
         */
        public addStyle(callback: any, selectedNodes: string[]) {
            this.stylesModal.show(callback);
            this.stylesModal.addCard(selectedNodes);
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

        /**
         * When the user wants to change styles
         */
        private onStylesClick() {
            // Emits event to open up style modal
            ModalsEventHandler.$emit("onStylesChange", this.automata.getID());
            this.viewStyles((cards: any) => this.$emit("onStylesChange", cards));
        }

        /**
         * When the user wants to add a style
         */
        private onAddStyleClick() {
            // Gets automata preview reference
            const automataPreview: any = this.getAutomataPreviewReference();

            // If there are no selected nodes, don't do anything
            if (automataPreview.selectedNodes.size === 0) {
                // Tell the user to select nodes next time
                this.$bvToast.toast(`Please select the nodes you wish to customise before adding a style.`, {
                    title: `No selected nodes to stylise!`,
                    variant: "danger",
                    autoHideDelay: 5000
                });
                return;
            }

            // Converts selected node IDs to names
            const selectedNodes = [...automataPreview.selectedNodes].map(id => this.automata.getStateById(id).data.name);

            // Emits event to open up style modal
            this.addStyle((cards: any) => this.$emit("onStylesChange", cards), selectedNodes);
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