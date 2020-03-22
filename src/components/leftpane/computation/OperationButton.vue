<template>
    <div>

        <!-- Singular button -->
        <b-button v-if="currentStage === 0"
                  :variant="currentStage === 0 ? variant : 'success'"
                  class="button"
                  @click="onClick">
            {{ name }}
        </b-button>

        <!-- Button group w/ cancel -->
        <b-button-group v-else
                        class="button p-0">

            <!-- Operation button -->
            <b-button :variant="currentStage === 0 ? variant : 'success'"
                      class="button"
                      @click="onClick">
                {{ name }}
            </b-button>

            <!-- Cancel -->
            <b-button variant="danger" @click="onCancelClick">Cancel</b-button>

        </b-button-group>

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import Vue from "vue";
    import ordinal from "ordinal";

    @Component
    export default class OperationButton extends Vue {
        /** The name of this operation */
        @Prop() private readonly name!: string;

        /** The variant of the button */
        @Prop({default: 'primary'}) private readonly variant!: string;

        /** The number of stages this button should go through */
        @Prop({default: 1}) private readonly maxStages!: number;

        /** If true, success messages will be enabled. If false, they will not show up */
        @Prop({default: true}) private readonly successMessageEnabled!: boolean;

        /** The current stage this button is on */
        private currentStage: number = 0;

        /** Selected nodes for each stage, with the index being the stage */
        private selectedNodes: Set<string>[] = [];

        /**
         * When the user clicks on this operation button
         */
        private onClick() {
            // Uses an event and a callback to get the currently selected nodes
            this.$emit("onOperationButtonClick", (nodes: Set<string>) => {
                // If nodes have been selected
                if (nodes.size > 0) {
                    // Push nodes and increment stage
                    this.selectedNodes.push(nodes);
                    this.currentStage++;

                    // If we've reached the final stage, emit event that we're done and clear properties
                    if (this.currentStage >= this.maxStages) {
                        this.$emit("onOperationCompute", this.selectedNodes);
                        this.currentStage = 0;
                        Vue.set(this, "selectedNodes", []);

                        // Give the user a success message, if it's enabled
                        if (this.successMessageEnabled) {
                            this.$bvToast.toast(`${this.name} successfully computed!`, {
                                title: 'Success!',
                                variant: "success",
                                autoHideDelay: 5000
                            });
                        }
                    } else {
                        // Tell the user to select the next group
                        this.$bvToast.toast(`Select the ${ordinal(this.currentStage + 1)} machine and press ${this.name} again.`, {
                            title: `Select another machine`,
                            variant: "warning",
                            autoHideDelay: 5000
                        });
                    }
                } else {
                    // Tell the user to select something this time
                    this.$bvToast.toast(`Please select a machine and press ${this.name} again.`, {
                        title: `No machines selected!`,
                        variant: "warning",
                        autoHideDelay: 5000
                    });
                }
            });
        }

        /**
         * When the user wants to cancel this operation
         */
        private onCancelClick() {
            this.currentStage = 0;
            Vue.set(this, "selectedNodes", []);
        }
    }
</script>

<style scoped>
    .button {
        width: 100%;
        height: 50px;
        text-align:left;
        margin-bottom: 10px;
        padding-left: 30px;
        font-weight: bold;
    }
</style>