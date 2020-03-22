<template>
    <div id="animationPane">

        <b-form-textarea
                class="mb-3"
                v-model="inputString"
                placeholder="Input string"
                rows="3"
                max-rows="6"
        />
        <div class="d-flex justify-content-center mb-2">
            <b-button variant="primary" @click="$emit('onPassInputClick')" class="mr-2">Compute immediately</b-button>
            <b-button variant="primary" @click="$emit('onStepClick')">Step</b-button>
        </div>
        <b-button variant="danger" class="mb-3" @click="onCancelClick">Cancel</b-button>

        <!-- Decision -->
        <h2 id="decision" v-if="isSimulating">{{ outcome }}</h2>

        <!-- Config -->
        <ConfigTable :configs="currentConfigs" />

    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import Automata from "@/classes/Automata";
    import Vue from "vue";
    import ConfigTable from "@/components/rightpane/animation/ConfigTable.vue";
    import AutomataConfig from "@/classes/AutomataConfig";

    @Component({
        components: {
            ConfigTable
        }
    })
    export default class AnimationPane extends Vue {
        /** Automata reference */
        @Prop() private readonly automata!: Automata;

        /** The input string inputted by the user */
        public inputString: string = '';

        /** If true, we are simulating. If false, we aren't */
        public isSimulating: boolean = false;

        /** The set of current configurations of this automata (to be displayed) */
        private currentConfigs: Set<AutomataConfig> = new Set();

        /** The outcome of an animation */
        private outcome: string = "UNDECIDED";

        /**
         * Updates outcome and currentConfigs fields to reflect Automata
         */
        public updateOutcomeAndCurrentConfigs() {
            this.$set(this, "outcome", this.automata.getOutcome().toLocaleString());
            this.$set(this, "currentConfigs", this.automata.getCurrentConfigs());
        }

        /**
         * When the user clicks on "Cancel" button
         */
        private onCancelClick() {
            this.isSimulating = false; // We are no longer simulating
            this.$set(this, "currentConfigs", new Set());
            this.automata.reset(); // Reset automata configurations and input

            // Updates vue
            this.$forceUpdate();
        }
    }
</script>

<style scoped>

</style>