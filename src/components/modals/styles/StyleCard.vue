<template>

    <b-card class="mb-2 clickable"
            :bg-variant="selected ? 'success' : ''"
            :text-variant="selected ? 'white' : 'black'"
            @click="onCardClick">
        <b-row>
            <b-col :cols="all ? 12 : 9" class="p-0">
                <p>{{ all ? "All" : title }}</p>

                <!-- State names -->
                <div class="stateNames" v-if="!all">
                    <b-badge pill v-for="state in states" :key="state">{{ state }}</b-badge>
                </div>
            </b-col>

            <b-col cols="3" class="p-0" v-if="!all">
                <b-button href="#" variant="danger" @click.stop="onCloseClick">X</b-button>
            </b-col>
        </b-row>
    </b-card>

</template>

<script lang="ts">
    import Vue from "vue";
    import {Prop} from "vue-property-decorator";
    import Component from "vue-class-component";
    import {BButton, BCard, BCol, BRow, BButtonGroup, BBadge} from "bootstrap-vue";

    @Component({
        components: {
            BCard, BRow, BCol, BButton, BButtonGroup, BBadge
        }
    })
    export default class StyleCard extends Vue {
        /** If true, this style card is for all nodes */
        @Prop({default: false}) private readonly all!: boolean;

        /** Title of the card */
        @Prop() private readonly title!: string;

        /** If true, this card is selected. If false it is deselected */
        @Prop({default: false}) private readonly selected!: boolean;

        /** The states this style affects */
        @Prop({default: []}) private readonly states!: string[];

        /**
         * When the user clicks on the card
         */
        private onCardClick() {
            this.$emit("onCardClick");
        }

        /**
         * When the user clicks the close button
         */
        private onCloseClick() {
            this.$emit("onCloseClick");
        }
    }
</script>

<style scoped>
    .stateNames {
        overflow-y: scroll;
        width:100%;
        max-height: 100px;
    }
    .clickable:hover {
        background-color: lightgrey;
        cursor:pointer;
    }
</style>