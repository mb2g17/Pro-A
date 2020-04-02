<template>
    <div>

        <b-card
                :title="label"
                class="mb-2"
        >
            <!-- Display -->
            <verte ref="verte"
                   model="rgb"
                   value="#F00"
                   class="mb-3"
                   v-model="colourValue"
                   :enableAlpha="false"
                   @input="onColourChange"
            >
                <svg height="24" width="24">
                    <circle cx="12" cy="12" r="10"
                            stroke="black"
                            :stroke-width="outline ? 3 : 0"
                    />
                </svg>
            </verte>

            <!-- Outline -->
            <b-form-checkbox v-model="outline">
                Outline
            </b-form-checkbox>

        </b-card>

    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {BCard} from "bootstrap-vue";

    @Component({
        components: {
            BCard
        }
    })
    export default class StyleColourPicker extends Vue {
        @Prop() private label!: string;

        /** Verte reference */
        private verte: any;

        /** The colour value as rgb string */
        private colourValue: string = "rgb(255, 0, 0)";

        /** If true, style has outline, if false it doesn't */
        private outline: boolean = false;

        /**
         * Sets the colour of the picker programmatically
         * @param newColourValue - the new colour value
         */
        public setColour(newColourValue: string) {
            this.colourValue = newColourValue;
        }

        /**
         * Sets the outline
         * @param value - if true, outline is enabled, If false, outline is disabled
         */
        public setOutline(value: boolean) {
            this.outline = value;
        }

        private mounted() {
            // Stores verte reference
            this.verte = this.$refs["verte"];

            // Hacky code that updates colour picker canvases
            const picker = this.verte.$children[0];
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

        /**
         * Gets the style represented by this picker
         */
        private getStyle(): any {
            return {
                'background-color': this.colourValue,
                'border-width': this.outline ? 4 : 0,
            };
        }

        /**
         * Emits a style change from this component
         */
        private emitStyleChange() {
            this.$emit("styleChange", {
                name: this.label,
                style: this.getStyle()
            });
        }

        /**
         * When colour has changed
         * @param colour - the new colour as a string
         */
        private onColourChange(colour: string) {
            this.emitStyleChange();
        }

        @Watch('outline')
        private onOutlineChange(val: boolean, oldVal: boolean) {
            this.emitStyleChange();
        }
    }
</script>

<style scoped>

</style>