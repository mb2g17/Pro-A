import Automata from '@/classes/Automata';
import { Outcome } from '@/classes/Outcome';

/**
 * Implementation of a finite automata
 */
export default class FiniteAutomata extends Automata {
    /** The current states we're on */
    private currentStates: Set<string> = new Set();

    public get outcome(): Outcome {
        // If we have no final states, fail
        if (this.currentStates.size === 0) {
            return Outcome.REJECT;
        }

        // Checks if any of our current states are final
        for (const dataObject of this.data) {
            // If this satisfies the conditions, we're finished
            if (dataObject.type === 'node' && this.currentStates.has(dataObject.data.id) && dataObject.final) {
                return Outcome.ACCEPT;
            }
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
        // Gets first input symbol
        const inputSymbol: string = this.inputString[0];

        // If this exists
        if (inputSymbol) {
            // If there's no current states, add the initial ones
            if (this.currentStates.size === 0) {
                for (const dataObject of this.data) {
                    // If this satisfies the conditions, add to current states
                    if (dataObject.type === 'node' && dataObject.initial) {
                        this.currentStates.add(dataObject.data.id);
                    }
                }
            }

            // Slices the rest of the input string
            this.inputString = this.inputString.slice(1, this.inputString.length);

            // Remember the new set of current state
            const newCurrentStates: Set<string> = new Set();

            // Gets a transition that 1) has our current state and 2) has this input symbol
            for (const dataObject of this.data) {
                // If this satisfies the conditions
                if (dataObject.type === 'edge' &&
                    this.currentStates.has(dataObject.data.source) &&
                    dataObject.data.label === inputSymbol) {
                    // Add to the new set of current states
                    newCurrentStates.add(dataObject.data.target);
                }
            }

            // Updates this set of current states with the new one
            this.currentStates = newCurrentStates;
        }
    }
}
