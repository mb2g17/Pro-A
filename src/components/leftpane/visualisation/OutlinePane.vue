<template>
    <div>

        <img class="outline-image"
             ref="outlineImage"
             :src="imageSrc"
             @click="test"
        />

    </div>
</template>

<script lang="ts">
    import {Component} from "vue-property-decorator";
    import Vue from "vue";

    @Component
    export default class OutlinePane extends Vue {
        /** What the image is displaying */
        private imageSrc: string = "";

        private test() {
            this.$emit("updateOutline");
        }

        /**
         * Updates the image outline
         * @param png - the image to update with
         */
        public updateOutline(png: any) {
            Vue.set(this, "imageSrc", png);
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