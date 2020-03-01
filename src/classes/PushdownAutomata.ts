import Automata from "@/classes/Automata";
import {Outcome} from "@/classes/Outcome";
import AutomataConfig from "@/classes/AutomataConfig";
import PushdownAutomataConfig from "@/classes/PushdownAutomataConfig";
import Vue from "vue";

/**
 * Implementation of a push-down automata
 * For stack symbols, use "__empty" for an empty stack symbol and null for epsilon (any stack symbol)
 */
export default class PushdownAutomata extends Automata {
    /** The current configs we're on */
    private currentConfigs: Set<PushdownAutomataConfig> = new Set();

    /** If true, the PDA will accept by empty stack */
    public acceptByEmptyStack: boolean = false;

    public getModelName(): string {
        return "Pushdown Automata";
    }

    public getCurrentConfigs(): Set<AutomataConfig> {
        return this.currentConfigs;
    }

    protected setCurrentConfigs(newConfigs: Set<PushdownAutomataConfig>): void {
        this.currentConfigs = newConfigs;
    }

    protected configInit(): boolean {
        // If there is an outcome
        if (this.getOutcome() !== Outcome.UNDECIDED) {
            // Clear all the old configs
            Vue.set(this, "currentConfigs", new Set());

            // Add initial configs
            for (const initialState of this.cacheInitialStates) {
                this.currentConfigs.add(new PushdownAutomataConfig(initialState, this.inputString, []));
            }
            return true;
        }
        return false;
    }

    protected applyTransition(srcConfig: PushdownAutomataConfig, edgeID: number, epsilonMove: boolean): PushdownAutomataConfig | null {
        // If one of these conditions is true, do the transition
        const stackSymbol = this.data[edgeID].data.input === srcConfig.stack[srcConfig.stack.length - 1];
        const emptyStack = this.data[edgeID].data.input === '⊥' && srcConfig.stack.length === 0;
        const nullSymbol = this.data[edgeID].data.input === 'ε';
        if (stackSymbol || emptyStack || nullSymbol) {
            // Pops element off stack, then push output stack symbols
            let newStack = srcConfig.stack;
            if (stackSymbol)
                newStack = newStack.slice(0, newStack.length - 1);
            newStack = newStack.concat(this.data[edgeID].data.output);

            // Gets target state ID and target state
            const targetStateID = this.data[edgeID].data.target;
            const targetState = this.data[targetStateID];

            // Truncates input to get new input (if it's not an epsilon move)
            let newInput = srcConfig.getInput();
            if (!epsilonMove)
                newInput = srcConfig.getTruncatedInput();

            // Returns new config
            return new PushdownAutomataConfig(targetState.data.name, newInput, newStack);
        } else
            return null;
    }

    addTransition(symbol: string, source: string, target: string, payload: any): void {
        super.addTransition(symbol, source, target, payload);

        /* Gets payload info
         * input: the input stack symbol. Single string.
         * output: stack symbols to put on the stack. Array of strings.
        */
        let {input, output} = payload;

        // Converts string nulls to actual nulls
        if (input === "null")
            input = null;
        if (output.length > 0 && output[0] === "null")
            output = [];

        // Gets transition ID
        const id = this.cacheEdgeID[symbol][source][target];

        // Converts output stack symbol array to string
        const outputStr: string = output.length === 0 ? 'ε' : output.toString();

        // Adds input and output stack symbols to data, and sets the label
        this.data[id].data = {
            ...this.data[id].data,
            input, output,
            label: `${symbol} ; ${input} / ${outputStr}`,
        };
    }

    getOutcome(): Outcome {
        // If we have no surviving states, fail
        if (this.currentConfigs.size === 0) {
            return Outcome.REJECT;
        }

        // Checks if any of our current states are final
        for (const config of this.currentConfigs) {
            // If we haven't exhausted the whole input yet, it hasn't accepted
            if (config.getInputLength() > 0)
                continue;

            // Gets ID
            const currentStateID = this.cacheNodeID[config.state];

            // If this is final, we're finished
            if (this.data[currentStateID].data.final)
                return Outcome.ACCEPT;

            // If this is an empty stack AND we should accept that, we're finished
            if (config.stack.length === 0 && this.acceptByEmptyStack)
                return Outcome.ACCEPT;
        }

        // There are still configs, but they haven't accepted yet
        return Outcome.UNDECIDED;
    }

    reset(): void {
        // Resets state and clears input string
        this.currentConfigs = new Set();
        this.inputString = '';
    }
}
