<template>
    <div>

        <b-form-checkbox
                class="mt-2"
                v-model="enabled"
        >
            Outline pane: {{ enabled ? 'Enabled' : 'Disabled' }}
        </b-form-checkbox>

        <img class="outline-image"
             ref="outlineImage"
             :src="imageSrc"
             v-if="enabled"
             @click="onPaneClick"
        />

    </div>
</template>

<script lang="ts">
    import {Component, Watch} from "vue-property-decorator";
    import Vue from "vue";
    import OutlineUpdateEventHandler from "@/events/OutlineUpdateEventHandler";

    @Component
    export default class OutlinePane extends Vue {
        /** What the image is displaying */
        private imageSrc: string = "";

        /** If true, outline pane will be visible and updated */
        private enabled: boolean = false;
        get Enabled(): boolean {
            return this.enabled;
        }

        private mounted() {
            // Updates outline pane
            OutlineUpdateEventHandler.$emit('updateOutline');
        }

        /**
         * Updates the image outline
         * @param png - the image to update with
         */
        public updateOutline(png: any) {
            Vue.set(this, "imageSrc", png);
        }

        /**
         * When the user clicks on the pane, perform a manual update
         */
        private onPaneClick() {
            OutlineUpdateEventHandler.$emit('updateOutline');
        }

        @Watch("enabled")
        private onEnabledChange(val: number, oldVal: number) {
            // If we're enabling, update pane
            if (val)
                OutlineUpdateEventHandler.$emit('updateOutline');
        }
    }
</script>

<style scoped>
    .outline-image {
        width:300px;
        height: 300px;
        border:1px solid black;
        object-fit: contain;
    }
</style>