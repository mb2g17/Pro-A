<template>

    <!-- Styles modal -->
    <b-modal ref="stylesModal"
             v-model="isModalVisible"
             no-close-on-backdrop
             :static="true"
             size="xl"
    >
        <template v-slot:modal-title>
            Styles
        </template>

        <!-- Body -->
        <b-row>
            <!-- Cards -->
            <b-col cols="3" class="styleCards">
                <StyleCard v-for="(card, title) in cards"
                           :key="title"
                           :title="title"
                           :all="card.all"
                           :states="card.states"
                           :selected="card.selected"
                           @onCardClick="selectCard(title)"
                           @onCloseClick="deleteCard(title)"
                ></StyleCard>
            </b-col>

            <!-- Styles -->
            <b-col cols="9">

                <div v-show="!selectedCard">
                    <p>Select a style card from the left</p>
                </div>

                <b-row v-show="selectedCard">
                    <b-col v-for="(style, styleName) in styles" cols="4">
                        <StyleColourPicker
                                :label="styleName"
                                :ref="styleName"
                                @styleChange="onStyleChange"
                        ></StyleColourPicker>
                    </b-col>
                </b-row>

            </b-col>
        </b-row>

        <!-- Footer buttons -->
        <template v-slot:modal-footer>
            <div class="w-100">
                <b-button variant="danger" class="float-left" @click="onCancelClick">Cancel</b-button>

                <b-button variant="primary" class="float-right" @click="onApplyClick">Apply</b-button>
                <b-button variant="secondary" class="float-right mr-2" @click="resetToDefault">Reset to default</b-button>
            </div>
        </template>
    </b-modal>

</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";
    import {BForm, BModal, BRow, BCol, BCard, BButton, BCardText, BButtonGroup} from "bootstrap-vue";
    import StyleColourPicker from "@/components/modals/styles/StyleColourPicker.vue";
    import StyleUpdateEventHandler from "@/events/StyleUpdateEventHandler";
    import StyleCard from "@/components/modals/styles/StyleCard.vue";

    @Component({
        components: {
            BRow, BCol, BModal, BForm, BCard, BCardText, BButton, BButtonGroup,

            StyleColourPicker, StyleCard
        }
    })
    export default class StylesModal extends Vue {
        /** If true, modal is visible. If false, it is not */
        private isModalVisible: boolean = false;

        /** If true, we're editing all. If false, we're editing a selection */
        public isAll: boolean = true;

        /**
         * The different styles to take care of
         */
        private styles: any = {
            "Default node": {
                selector: 'node',
            },
            "Initial node": {
                selector: '.initial-node',
            },
            "Final node": {
                selector: '.final-node',
            },
            "Initial + final node": {
                selector: '.initial-node.final-node',
            },
            "Highlighted node": {
                selector: '.highlighted-node',
            },
        };

        /**
         * The style cards, mapping from title -> style card object
         */
        private cards: any = {};

        mounted() {
            //this.resetToDefault();
            this.show();
            this.addCard("All", []);
            Vue.set(this.cards["All"], 'all', true);

            this.addCard("Style1", ['s1', 's2', 's3', 's4', 's5', 's6', 's7']);
            this.addCard("Style2", ['s4', 's5']);
        }

        /**
         * Adds a new card
         * @param cardName - the name of the card
         * @param states - the states that this card affects
         */
        public addCard(cardName: string, states: string[]) {
            Vue.set(this.cards, cardName, {
                all: false,
                states,
                selected: false,
                styles: this.getDefaultStyles()
            });
        }

        /**
         * Shows this modal
         */
        public show() {
            (this.$refs['stylesModal'] as any).show();
        }

        /**
         * Hides this modal
         */
        public hide() {
            (this.$refs['stylesModal'] as any).hide();
        }

        /**
         * Selects a new card
         * @param title - the new card to select
         */
        private selectCard(title: string) {
            // If a card has already been selected, unselect that one
            if (this.selectedCard)
                this.cards[this.selectedCard].selected = false;

            // Select this card
            this.cards[title].selected = true;

            // Update colour pickers
            this.updateColourPickers();
        }

        /**
         * Deletes a card
         * @param title - the name of the card to delete
         */
        private deleteCard(title: string) {
            Vue.delete(this.cards, title);
        }

        /**
         * Updates colour pickers of currently selected card
         */
        private updateColourPickers() {
            // If no card is selected, leave
            if (!this.selectedCard)
                return;

            // Goes through each style of this card
            Object.keys(this.cards[this.selectedCard].styles).forEach(editableStyle => {
                // Gets style
                const style = this.cards[this.selectedCard].styles[editableStyle].style;

                // Get colour picker reference
                const picker = (this.$refs[editableStyle] as any)[0];

                // Sets colour and border
                picker.setColour(style['background-color']);
                picker.setOutline(style['border-width'] !== 0);
            });
        }

        /**
         * Gets the currently selected card by sequential search
         * @return the title of the selected card. Returns empty string if none is selected
         */
        private get selectedCard(): string {
            for (const cardTitle in this.cards) {
                if (this.cards[cardTitle].selected)
                    return cardTitle;
            }
            return "";
        }

        /**
         * Gets default styling for a card
         * @returns - the default styles as an object
         */
        private getDefaultStyles(): any {
            // Gets default styles
            const defaultStyles: any[] = require("../../../config/cytoscape-config").default.style;

            // Stores return value
            let rv: any = {};

            // Goes through every default style
            defaultStyles.forEach(defaultStyle => {
                // Goes through every editable style
                Object.keys(this.styles).forEach(editableStyle => {
                    // If we have a match
                    if (defaultStyle.selector === this.styles[editableStyle].selector) {
                        // Sets up object for this editable style
                        rv[editableStyle] = {
                            selector: defaultStyle.selector,
                            style: {}
                        };

                        // Saves main colour
                        rv[editableStyle]['style']['background-color'] = defaultStyle.style['background-color'];

                        // Loads outline
                        if (Object.keys(defaultStyle.style).includes('border-width') && defaultStyle.style['border-width'] > 0)
                            rv[editableStyle]['style']['border-width'] = 4;
                        else
                            rv[editableStyle]['style']['border-width'] = 0;
                    }
                });
            });

            // Returns style
            return rv;
        }


        /**
         * Resets styles back to default
         */
        private resetToDefault() {
            // If there is no selected style, quit
            if (!this.selectedCard)
                return;

            // Resets style to default
            Vue.set(this.cards[this.selectedCard], "styles", this.getDefaultStyles());

            // Update pickers
            this.updateColourPickers();
        }

        /**
         * When the user doesn't want to apply changes
         */
        private onCancelClick() {
            this.hide();
        }

        /**
         * When the user wants to apply changes
         */
        private onApplyClick() {
            StyleUpdateEventHandler.$emit("styleUpdate", this.cards);
            this.hide();
        }

        /**
         * When the style changes on a picker
         * @param args - the name of the updated picker and new style
         */
        private onStyleChange(args: any) {
            const {name, style} = args;

            // If a card is selected, update data
            if (this.selectedCard)
                this.cards[this.selectedCard].styles[name].style = style;
        }
    }
</script>

<style scoped>
    .styleCards {
        overflow-y: scroll;
        max-height: 450px;
    }
</style>