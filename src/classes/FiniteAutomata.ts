import Automata from '@/classes/Automata';
import { Outcome } from '@/classes/Outcome';
import AutomataConfig from "@/classes/AutomataConfig";
import TuringMachineTape from "@/classes/TuringMachineTape";
import Vue from 'vue';

/**
 * Implementation of a finite automata
 */
export default class FiniteAutomata extends Automata {
    /** The current configs we're on */
    private currentConfigs: Set<AutomataConfig> = new Set();

    public getModelName(): string {
        return "Finite Automata";
    }

    public getOutcome(): Outcome {
        // If we have no surviving configs, fail
        if (this.currentConfigs.size === 0) {
            return Outcome.REJECT;
        }

        // Checks if any of our current configs are on a final state
        for (const config of this.currentConfigs) {
            // If we haven't exhuasted the whole input yet, it hasn't accepted
            if (config.getInputLength() > 0)
                continue;

            // Gets ID of state of this config
            const currentStateID = this.cacheNodeID[config.state];

            // If this is final, we're finished
            if (this.data[currentStateID].data.final)
                return Outcome.ACCEPT;
        }

        // We still have configs, but none of them accept yet
        return Outcome.UNDECIDED;
    }

    protected configInit(): void {
        // If there is an outcome
        if (this.getOutcome() !== Outcome.UNDECIDED) {
            // Clear all the old configs
            this.currentConfigs.clear();

            // Add initial configs
            for (const initialState of this.cacheInitialStates) {
                this.currentConfigs.add(new AutomataConfig(initialState, this.inputString));
            }
        }
    }

    protected applyTransition(srcConfig: AutomataConfig, edgeID: number, epsilonMove: boolean): AutomataConfig {
        // Gets target state ID and target state
        const targetStateID = this.data[edgeID].data.target;
        const targetState = this.data[targetStateID];

        // Truncates input to get new input (if it's not an epsilon move)
        let newInput = srcConfig.getInput();
        if (!epsilonMove)
            newInput = srcConfig.getTruncatedInput();

        // Returns new config
        return new AutomataConfig(targetState.data.name, newInput);
    }

    getCurrentConfigs(): Set<AutomataConfig> {
        return this.currentConfigs;
    }

    protected setCurrentConfigs(newConfigs: Set<AutomataConfig>): void {
        Vue.set(this, 'currentConfigs', newConfigs);
        //this.currentConfigs = newConfigs;
    }

    public reset(): void {
        // Resets configs and clears input string
        Vue.set(this, "currentConfigs", new Set());
        Vue.set(this, "inputString", '');
    }
}
