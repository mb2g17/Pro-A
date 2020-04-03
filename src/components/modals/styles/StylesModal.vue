<template>

    <!-- Styles modal -->
    <b-modal ref="stylesModal"
             v-model="isModalVisible"
             no-close-on-backdrop
             :static="true"
             size="lg"
    >
        <template v-slot:modal-title>
            Styles {{ isAll ? '(all)' : '(selection)' }}
        </template>

        <!-- Body -->
        <b-row>
            <b-col v-for="(style, styleName) in styles" cols="6">
                <StyleColourPicker
                        :label="styleName"
                        :ref="styleName"
                        @styleChange="onStyleChange"
                ></StyleColourPicker>
            </b-col>
        </b-row>

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
    import {BForm, BModal, BRow, BCol} from "bootstrap-vue";
    import StyleColourPicker from "@/components/modals/styles/StyleColourPicker.vue";
    import StyleUpdateEventHandler from "@/events/StyleUpdateEventHandler";

    @Component({
        components: {
            BRow, BCol, BModal, BForm,

            StyleColourPicker
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
            "Initial and final node": {
                selector: '.initial-node.final-node',
                style: {}
            },
            "Highlighted node": {
                selector: '.highlighted-node',
                style: {}
            },
        };

        mounted() {
            this.resetToDefault();
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

</style>