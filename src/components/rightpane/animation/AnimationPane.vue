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
            <b-button variant="primary" @click="onPassInputClick" class="mr-2">Compute immediately</b-button>
            <b-button variant="primary" @click="onStepClick">Step</b-button>
        </div>
        <b-button variant="danger" class="mb-3" @click="onCancelClick">Cancel</b-button>

        <!-- Decision -->
        <h2 id="decision" v-if="isSimulating">{{ outcome }}</h2>

        <!-- Config -->
        <ConfigTable :automata="automata"
                     :configs="currentConfigs"
        />

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

        /** The set of highlighted node names during animation */
        private highlightedNodes: Set<string> = new Set();

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
         * When the user clicks on "Step" button
         */
        private onStepClick() {
            // We are now simulating
            this.isSimulating = true;

            // Set new input
            this.automata.setInput(this.inputString);

            // Remembers old highlighted nodes and clears the set
            const oldHighlightedNodes: Set<string> = new Set(this.highlightedNodes);
            this.highlightedNodes.clear();

            // Steps the automata
            this.automata.step();

            // Updates outcome and current configurations
            this.updateOutcomeAndCurrentConfigs();

            // Fill in highlighted nodes
            this.currentConfigs.forEach((currentConfig: AutomataConfig) => {
                this.highlightedNodes.add(currentConfig.state);
            });

            // Emits event that toggles highlightings
            this.$emit("changeHighlightedNodes", {
                deselect: oldHighlightedNodes,
                select: new Set(this.highlightedNodes)
            });

            // Updates vue
            this.$forceUpdate();
        }

        /**
         * When the user clicks on "Pass input" button
         */
        private onPassInputClick() {
            // We are now simulating
            this.isSimulating = true;

            // Clears automata
            this.automata.reset();

            // Remembers old highlighted nodes and clears the set
            const oldHighlightedNodes: Set<string> = new Set(this.highlightedNodes);
            this.highlightedNodes.clear();

            // Sets the input string
            this.automata.setInput(this.inputString);
            this.inputString = '';
            this.automata.simulate();

            // Updates outcome and current configuration
            this.updateOutcomeAndCurrentConfigs();

            // Fill in highlighted nodes
            this.highlightedNodes.clear();
            this.currentConfigs.forEach((currentConfig: AutomataConfig) => {
                this.highlightedNodes.add(currentConfig.state);
            });

            // Emits event that toggles highlightings
            this.$emit("changeHighlightedNodes", {
                deselect: oldHighlightedNodes,
                select: new Set(this.highlightedNodes)
            });

            // Updates vue
            this.$forceUpdate();
        }

        /**
         * When the user clicks on "Cancel" button
         */
        private onCancelClick() {
            this.isSimulating = false; // We are no longer simulating
            this.$set(this, "currentConfigs", new Set());
            this.automata.reset(); // Reset automata configurations and input

            // Emits event that toggles highlightings
            this.$emit("changeHighlightedNodes", {
                deselect: new Set(this.highlightedNodes),
                select: new Set()
            });
            this.highlightedNodes.clear();

            // Updates vue
            this.$forceUpdate();
        }
    }
</script>

<style scoped>

</style>