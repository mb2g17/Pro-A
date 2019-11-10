import Automata from '@/classes/Automata';
import { Outcome } from '@/classes/Outcome';

/**
 * Implementation of a finite automata
 */
export default class FiniteAutomata extends Automata {
    /** The current states we're on */
    private currentStates: Set<string> = new Set();

    public getOutcome(): Outcome {
        // If we have no surviving states, fail
        if (this.currentStates.size === 0) {
            return Outcome.REJECT;
        }

        // Checks if any of our current states are final
        for (const currentState of this.currentStates) {
            // Gets ID
            const currentStateID = this.nodeID[currentState];

            // If this is final, we're finished
            if (this.data[currentStateID].data.final)
                return Outcome.ACCEPT;
        }

        // We are not in a final state; reject
        return Outcome.REJECT;
    }

    public getDataStructure(): object | null {
        return null;
    }

    public reset(): void {
        // Resets state and clears input string
        this.currentStates = new Set();
        this.inputString = '';
    }

    public step(): void {
        // If there's no current states, add the initial ones
        if (this.currentStates.size === 0) {
            for (const initialState of this.initialStates) {
                this.currentStates.add(initialState);
            }
        }

        // Gets first input symbol
        const inputSymbol: string = this.inputString[0];

        // If this exists
        if (inputSymbol) {
            // Slices the rest of the input string
            this.inputString = this.inputString.slice(1, this.inputString.length);

            // Remember the new set of current states
            const newCurrentStates: Set<string> = new Set();

            // Gets a transition that 1) has our current state and 2) has this input symbol
            for (const currentState of this.currentStates) {
                // If a transition for this state exists
                if (this.edgeID[inputSymbol])
                    if (this.edgeID[inputSymbol][currentState]) {
                        // Gets all the target states
                        const targetStates = Object.keys(this.edgeID[inputSymbol][currentState]);

                        // Apply this transition
                        for (const targetState of targetStates)
                            newCurrentStates.add(targetState);
                    }
            }

            // Updates this set of current states with the new one
            this.currentStates = newCurrentStates;
        }
    }
}
