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
            <b-col cols="3" class="styleCards">
                <StyleCard v-for="(card, title) in cards"
                           :key="title"
                           :title="title"
                           :all="card.all"
                           :states="card.states"
                           :selected="card.selected"
                           @onCardClick="selectCard(title)"
                           @onCloseClick=""
                           @onMoveUpClick=""
                           @onMoveDownClick=""
                ></StyleCard>
            </b-col>

            <b-col cols="9">

                <b-row>
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

        private styles: any = {
            "Default node": {
                selector: 'node',
                style: {}
            },
            "Initial node": {
                selector: '.initial-node',
                style: {}
            },
            "Final node": {
                selector: '.final-node',
                style: {}
            },
            "Initial + final node": {
                selector: '.initial-node.final-node',
                style: {}
            },
            "Highlighted node": {
                selector: '.highlighted-node',
                style: {}
            },
        };

        /**
         * The style cards, mapping from title -> style card object
         */
        private cards: any = {
            "All": {
                all: true,
                states: [],
                selected: false,
            },
            "Style1": {
                all: false,
                states: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'],
                selected: false,
            },
            "Style2": {
                all: false,
                states: ['s4', 's5'],
                selected: false,
            }
        };

        mounted() {
            this.resetToDefault();
            this.show();
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
            if (this.selectedCard)
                this.cards[this.selectedCard].selected = false;
            this.cards[title].selected = true;
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
         * Resets styles back to default
         */
        private resetToDefault() {
            // Gets default styles
            const defaultStyles: any[] = require("../../../config/cytoscape-config").default.style;

            // Goes through every default style
            defaultStyles.forEach(defaultStyle => {
                // Goes through every editable style
                Object.keys(this.styles).forEach(editableStyle => {
                    // If we have a match
                    if (defaultStyle.selector === this.styles[editableStyle].selector) {
                        // Gets colour picker reference
                        const picker = (this.$refs[editableStyle] as any)[0];

                        // Loads main colour
                        picker.setColour(defaultStyle.style['background-color']);

                        // Loads outline
                        if (Object.keys(defaultStyle.style).includes('border-width') && defaultStyle.style['border-width'] > 0)
                            picker.setOutline(true);
                        else
                            picker.setOutline(false);
                    }
                });
            });
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
            StyleUpdateEventHandler.$emit("styleUpdate", this.styles);
            this.hide();
        }

        /**
         * When the style changes on a picker
         * @param args - the name of the updated picker and new style
         */
        private onStyleChange(args: any) {
            const {name, style} = args;
            this.styles[name].style = style;
        }
    }
</script>

<style scoped>
    .styleCards {
        overflow-y: scroll;
        max-height: 450px;
    }
</style>