import Automata from "@/classes/Automata";
import {Outcome} from "@/classes/Outcome";
import TuringMachineTape from "@/classes/TuringMachineTape";

/**
 * Implementation of a Turing machine
 */
export default class TuringMachine extends Automata {
    /** The current states we're on, #0 being the state name, #1 being the tape and #2 being the tape index */
    private currentStates: Set<[string, TuringMachineTape, number]> = new Set();

    addTransition(symbol: string, source: string, target: string, payload: any): void {
        super.addTransition(symbol, source, target, payload);

        /* Gets payload info
         * input: the input stack symbol. Single string.
         * output: stack symbols to put on the stack. Array of strings.
        */
        let {writeTapeSymbol, direction} = payload;

        // Gets transition ID
        const id = this.edgeID[symbol][source][target];

        // Adds input and output stack symbols to data, and sets the label
        this.data[id].data = {
            ...this.data[id].data,
            writeTapeSymbol, direction,
            label: symbol + " , " + writeTapeSymbol + " , " + direction
        };
    }

    step(): void {
        // If there's no current states, add the initial ones
        if (this.currentStates.size === 0) {
            for (const initialState of this.initialStates) {
                this.currentStates.add([initialState, new TuringMachineTape(this.inputString), 0]);
            }
        }

        // Remember the new set of current states
        const newCurrentStates: Set<[string, TuringMachineTape, number]> = new Set();

        // Goes through each state
        for (let [currentState, currentTape, currentTapeIndex] of this.currentStates) {
            // Gets first input symbol
            const inputSymbol: string = currentTape.read(currentTapeIndex);

            // If input symbol exists
            if (inputSymbol) {
                // If a transition for this state exists
                if (this.edgeID[inputSymbol])
                    if (this.edgeID[inputSymbol][currentState]) {
                        // Gets all the target states
                        const targetStates = Object.keys(this.edgeID[inputSymbol][currentState]);

                        // Apply this transition for each target state
                        for (const targetState of targetStates) {
                            // Gets edge ID
                            const edgeID = this.edgeID[inputSymbol][currentState][targetState];

                            // Creates new tape
                            const newTape: TuringMachineTape = new TuringMachineTape(currentTape);

                            // Write new symbol
                            newTape.write(currentTapeIndex, this.data[edgeID].data.writeTapeSymbol);

                            // Make tape index go left or right
                            if (this.data[edgeID].data.direction == "L")
                                currentTapeIndex = currentTapeIndex == 0 ? currentTapeIndex : currentTapeIndex - 1;
                            else
                                currentTapeIndex++;

                            // Add new state
                            newCurrentStates.add([targetState, newTape, currentTapeIndex]);
                        }
                    }
            }
        }

        // Updates this set of current states with the new one
        this.currentStates = newCurrentStates;
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
        for (const [currentState, currentTape, currentTapeIndex] of this.currentStates) {
            // Gets ID
            const currentStateID = this.nodeID[currentState];

            // If this is final, we're finished
            if (this.data[currentStateID].data.final)
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