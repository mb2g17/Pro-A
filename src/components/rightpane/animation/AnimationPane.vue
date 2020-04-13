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
                     @onDeleteConfig="onDeleteConfig"
                     @onPruneConfig="onPruneConfig"
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
            // Checks if input is legit
            if (!RegExp('^([A-Z]|[a-z]|[1-9])*$').test(this.inputString)) {
                // Tell the user
                this.$bvToast.toast(`Only letters and numbers are allowed as input symbols.`, {
                    title: `Invalid input string!`,
                    variant: "danger",
                    autoHideDelay: 5000
                });
                return;
            }

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
            // Checks if input is legit
            if (!RegExp('^([A-Z]|[a-z]|[1-9])*$').test(this.inputString)) {
                // Tell the user
                this.$bvToast.toast(`Only letters and numbers are allowed as input symbols.`, {
                    title: `Invalid input string!`,
                    variant: "danger",
                    autoHideDelay: 5000
                });
                return;
            }

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

        /**
         * When the user wants to delete a configuration
         * @param config - the configuration to delete
         */
        private onDeleteConfig(config: AutomataConfig) {
            this.automata.deleteConfig(config);
            this.updateOutcomeAndCurrentConfigs();

            // Check if any other configs have this state too
            let stateExistsAsConfig: boolean = false;
            this.automata.getCurrentConfigs().forEach(currentConfig => {
                if (currentConfig.state === config.state) {
                    stateExistsAsConfig = true;
                }
            });

            // If no other config shares this state, unhighlight it
            if (!stateExistsAsConfig) {
                // Emits event that toggles highlightings
                this.$emit("changeHighlightedNodes", {
                    deselect: new Set([config.state]),
                    select: new Set()
                });
            }
        }

        /**
         * When the user wants to delete all but one config
         * @param config - the config to leave
         */
        private onPruneConfig(config: AutomataConfig) {
            const deselect = this.automata.pruneConfig(config);
            this.updateOutcomeAndCurrentConfigs();

            // Deselects states that no longer have configs
            this.$emit("changeHighlightedNodes", {
                deselect: deselect,
                select: new Set()
            });
        }
    }
</script>

<style scoped>

</style>