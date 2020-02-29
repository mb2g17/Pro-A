import Automata from "@/classes/Automata";
import {Outcome} from "@/classes/Outcome";
import TuringMachineTape from "@/classes/TuringMachineTape";
import TuringMachineConfig from "@/classes/TuringMachineConfig";
import Vue from "vue";
import PushdownAutomataConfig from "@/classes/PushdownAutomataConfig";

/**
 * Implementation of a Turing machine
 */
export default class TuringMachine extends Automata {
    /** The current configurations we're on */
    private currentConfigs: Set<TuringMachineConfig> = new Set();

    public getModelName(): string {
        return "Turing Machine";
    }

    public getCurrentConfigs(): Set<TuringMachineConfig> {
        return this.currentConfigs;
    }

    protected setCurrentConfigs(newConfigs: Set<TuringMachineConfig>): void {
        this.currentConfigs = newConfigs;
    }

    addTransition(symbol: string, source: string, target: string, payload: any): void {
        super.addTransition(symbol, source, target, payload);

        /* Gets payload info
         * writeTapeSymbol: the symbol to write on the tape
         * direction: L to go left or R to go right
        */
        let {writeTapeSymbol, direction} = payload;

        // Gets transition ID
        const id = this.cacheEdgeID[symbol][source][target];

        // Adds payload to data, and sets the label
        Vue.set(this.data, id, {
            data: {
                ...this.data[id].data,
                writeTapeSymbol, direction,
                readTapeSymbol: symbol,
                label: symbol + " ; " + writeTapeSymbol + " , " + direction
            },
        });
    }

    protected configInit(): boolean {
        // If there is an outcome
        if (this.getOutcome() !== Outcome.UNDECIDED) {
            // Clear all the old configs
            Vue.set(this, "currentConfigs", new Set());

            // Add initial configs
            for (const initialState of this.cacheInitialStates) {
                this.currentConfigs.add(new TuringMachineConfig(initialState, new TuringMachineTape(this.inputString), 0));
            }
            return true;
        }
        return false;
    }

    /**
     * Applies a transition from a source TM config to a destination TM config
     * @param srcConfig - the config of the TM
     * @param edgeID - the ID of the transition to take
     * @param epsilonMove - true if epsilon move, false if not
     * @returns the new config of the TM
     */
    protected applyTransition(srcConfig: TuringMachineConfig, edgeID: number, epsilonMove: boolean): TuringMachineConfig | null {
        // Checks if the selected tape symbol is the transition symbol (or if it's an epsilon move)
        if (srcConfig.getInputSymbol() !== this.data[edgeID].data.readTapeSymbol && !epsilonMove)
            return null;

        // Gets src state info
        let [srcTape, srcTapeIndex] = [srcConfig.tape, srcConfig.index];

        // Creates new tape
        const newTape: TuringMachineTape = new TuringMachineTape(srcTape);

        // If write symbol is "empty", erase, otherwise write new symbol
        if (this.data[edgeID].data.writeTapeSymbol === "□")
            newTape.delete(srcTapeIndex);
        else
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
        return new TuringMachineConfig(targetState.data.name, newTape, srcTapeIndex);
    }

    getOutcome(): Outcome {
        // If we have no surviving configs, fail
        if (this.currentConfigs.size === 0) {
            return Outcome.REJECT;
        }

        // Checks if any of our current configs are on a final state
        for (const config of this.currentConfigs) {
            // Gets ID of current state
            const currentStateID = this.cacheNodeID[config.state];

            // If this is final, we're finished
            if (this.data[currentStateID].data.final)
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