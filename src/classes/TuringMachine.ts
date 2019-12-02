import Automata from "@/classes/Automata";
import {Outcome} from "@/classes/Outcome";
import TuringMachineTape from "@/classes/TuringMachineTape";

/** Configuration of the TM
 * #0 the state name
 * #1 the tape
 * #2 the tape index
 */
export type TuringMachineConfig = [string, TuringMachineTape, number];

/**
 * Implementation of a Turing machine
 */
export default class TuringMachine extends Automata {
    /** The current configurations we're on */
    private _currentConfigs: Set<TuringMachineConfig> = new Set();

    /**
     * Set of current states
     */
    get currentConfigs(): Set<TuringMachineConfig> {
        return this._currentConfigs;
    }

    addTransition(symbol: string, source: string, target: string, payload: any): void {
        super.addTransition(symbol, source, target, payload);

        /* Gets payload info
         * writeTapeSymbol: the symbol to write on the tape
         * direction: L to go left or R to go right
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

    /**
     * Adds initial configs if there are no current configs
     */
    protected addInitialConfigsIfNoCurrentConfigs() {
        if (this._currentConfigs.size === 0) {
            for (const initialState of this.initialStates) {
                this._currentConfigs.add([initialState, new TuringMachineTape(this.inputString), 0]);
            }
        }
    }

    /**
     * Applies a transition from a source TM config to a destination TM config
     * @param srcConfig - the config of the TM
     * @param edgeID - the ID of the transition to take
     * @returns the new config of the TM
     */
    protected applyTransition(srcConfig: TuringMachineConfig, edgeID: number): TuringMachineConfig {
        // Gets src state info
        let [srcState, srcTape, srcTapeIndex] = srcConfig;

        // Creates new tape
        const newTape: TuringMachineTape = new TuringMachineTape(srcTape);

        // Write new symbol
        newTape.write(srcTapeIndex, this.data[edgeID].data.writeTapeSymbol);

        // Make tape index go left or right
        if (this.data[edgeID].data.direction == "L")
            srcTapeIndex = srcTapeIndex == 0 ? srcTapeIndex : srcTapeIndex - 1;
        else
            srcTapeIndex++;

        // Gets target state ID and target state
        const targetStateID = this.data[edgeID].data.target;
        const targetState = this.data[targetStateID];

        // Returns new state
        return [targetState.data.name, newTape, srcTapeIndex];
    }

    step(): void {
        // If there's no current states, add the initial ones
        this.addInitialConfigsIfNoCurrentConfigs();

        // Remember the new set of current states
        const newCurrentConfigs: Set<TuringMachineConfig> = new Set();

        // Goes through each state
        for (let [currentState, currentTape, currentTapeIndex] of this._currentConfigs) {
            // Gets first input symbol
            const inputSymbol: string = currentTape.read(currentTapeIndex);

            // If input symbol exists
            if (inputSymbol) {
                // If transition exists, gets target states and applies transitions
                const targetStates = this.getTargetStates(inputSymbol, currentState);
                if (targetStates) {
                    // Apply this transition for each target state
                    for (const targetState of targetStates) {
                        // Gets edge ID
                        const edgeID = this.edgeID[inputSymbol][currentState][targetState];

                        // Gets new config by applying transition
                        const newConfig = this.applyTransition([currentState, currentTape, currentTapeIndex], edgeID);

                        // Add new config
                        newCurrentConfigs.add(newConfig);
                    }
                }
            }
        }

        // Updates this set of current states with the new one
        this._currentConfigs = newCurrentConfigs;
    }

    getOutcome(): Outcome {
        // If we have no surviving configs, fail
        if (this._currentConfigs.size === 0) {
            return Outcome.REJECT;
        }

        // Checks if any of our current configs are on a final state
        for (const [currentState, currentTape, currentTapeIndex] of this._currentConfigs) {
            // Gets ID of current state
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
        this._currentConfigs = new Set();
        this.inputString = '';
    }
}