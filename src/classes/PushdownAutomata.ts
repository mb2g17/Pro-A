import Automata from "@/classes/Automata";
import {Outcome} from "@/classes/Outcome";

/**
 * Implementation of a push-down automata
 * For stack symbols, use "__empty" for an empty stack symbol and null for epsilon (any stack symbol)
 */
export default class PushdownAutomata extends Automata {
    /** The current states we're on, #0 being the state name, #1 being the stack */
    private currentStates: Set<[string, string[]]> = new Set();

    /** If true, the PDA will accept by empty stack */
    private _acceptByEmptyStack: boolean = false;

    /**
     * Returns if we accept by empty stack or not
     * @returns true if we accept by empty stack, false if not
     */
    get acceptByEmptyStack(): boolean {
        return this._acceptByEmptyStack;
    }

    /**
     * Sets the accept by empty stack property
     * @param value - if true, this PDA will accept by empty stack
     */
    set acceptByEmptyStack(value: boolean) {
        this._acceptByEmptyStack = value;
    }

    addTransitionExtra(symbol: string, source: string, target: string, payload: any): void {
        // Gets payload info
        const {input, output} = payload;

        // Gets transition ID
        const id = this.edgeID[symbol][source][target];

        // Adds input and output stack symbols to data
        this.data[id].data = {
            ...this.data[id].data,
            input, output
        };
    }

    step(): void {
        // If there's no current states, add the initial ones
        if (this.currentStates.size === 0) {
            for (const initialState of this.initialStates) {
                this.currentStates.add([initialState, []]);
            }
        }

        // Gets first input symbol
        const inputSymbol: string = this.inputString[0];

        // If this exists
        if (inputSymbol) {
            // Slices the rest of the input string
            this.inputString = this.inputString.slice(1, this.inputString.length);

            // Remember the new set of current states
            const newCurrentStates: Set<[string, string[]]> = new Set();

            // Gets a transition that 1) has our current state and 2) has this input symbol
            for (let [currentState, currentStack] of this.currentStates) {

                // Creates a new stack from current stack
                let newCurrentStack = Array.from(currentStack);

                // Gets top stack symbol
                const topStackSymbol: string = newCurrentStack[newCurrentStack.length - 1];

                // If a transition for this state exists
                if (this.edgeID[inputSymbol])
                    if (this.edgeID[inputSymbol][currentState]) {
                        // Gets all the target states
                        const targetStates = Object.keys(this.edgeID[inputSymbol][currentState]);

                        // Goes through all target states
                        for (const targetState of targetStates) {
                            // Gets ID
                            const id = this.edgeID[inputSymbol][currentState][targetState];

                            // Gets input stack symbol
                            const inputStackSymbol = this.data[id].data.input;

                            // If the top stack symbol is the input symbol OR if the input symbol is null and there is no top stack symbol
                            if (inputStackSymbol === topStackSymbol || (inputStackSymbol === "__empty" && !topStackSymbol) || inputStackSymbol === null) {
                                // Get output stack symbols
                                const outputStackSymbols = this.data[id].data.output;

                                // Pop from stack, if we should pop at all
                                if (inputStackSymbol !== null)
                                    newCurrentStack.pop();

                                // Put output symbols onto stack
                                for (const stackSymbol of outputStackSymbols)
                                    newCurrentStack.push(stackSymbol);

                                // Apply transition
                                newCurrentStates.add([targetState, newCurrentStack]);
                            }
                        }
                    }
            }

            // Updates this set of current states with the new one
            this.currentStates = newCurrentStates;
        }
    }

    getDataStructure(): any | null {
        return null; // TODO
    }

    getOutcome(): Outcome {
        // If we have no surviving states, fail
        if (this.currentStates.size === 0) {
            return Outcome.REJECT;
        }

        // Checks if any of our current states are final
        for (const [currentState, currentStack] of this.currentStates) {
            // Gets ID
            const currentStateID = this.nodeID[currentState];

            // If this is final, we're finished
            if (this.data[currentStateID].data.final)
                return Outcome.ACCEPT;

            // If this is an empty stack AND we should accept that, we're finished
            if (currentStack.length === 0 && this.acceptByEmptyStack)
                return Outcome.ACCEPT;
        }

        // We are not in a final state; reject
        return Outcome.REJECT;
    }

    reset(): void {
        // Resets state and clears input string
        this.currentStates = new Set();
        this.inputString = '';
    }
}