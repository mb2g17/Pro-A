<template>

    <!-- Styles modal -->
    <b-modal ref="stylesModal" v-model="isModalVisible" no-close-on-backdrop :static="true" @shown="onShown">
        <template v-slot:modal-title>
            Styles
        </template>

        <!-- Body -->
        <p>Default state</p>
        <verte ref="verte" model="rgb" :enableAlpha="false" value="#F00">
            <svg height="24" width="24">
                <circle cx="12" cy="12" r="10" stroke="black" stroke-width="3" />
            </svg>
        </verte>

        <template v-slot:modal-footer>
            <div class="w-100">
                <b-button variant="danger" class="float-left" @click="onCancelClick">Cancel</b-button>
                <b-button variant="primary" class="float-right" @click="onApplyClick">Apply</b-button>
            </div>
        </template>
    </b-modal>

</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";
    import {BForm, BModal} from "bootstrap-vue";

    @Component({
        components: {
            BModal, BForm
        }
    })
    export default class StylesModal extends Vue {
        /** If true, modal is visible. If false, it is not */
        private isModalVisible: boolean = true;

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
         * When the user doesn't want to apply changes
         */
        private onCancelClick() {
            this.hide();
        }

        /**
         * When the user wants to apply changes
         */
        private onApplyClick() {
            this.hide();
        }

        /**
         * Just after the modal is shown
         */
        private onShown() {
            // Hacky code that updates colour picker canvases
            const picker = this.$refs["verte"].$children[0];
            //picker.pickerRect = picker.$refs.canvas.getBoundingClientRect();
            picker.pickerRect = {
                x: 595,
                y: 164,
                width: 250,
                height: 150,
                top: 164,
                right: 845,
                bottom: 314,
                left: 595
            };
            picker.updateSquareColors();
        }
    }
</script>

<style scoped>

</style>