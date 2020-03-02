import Automata from "@/classes/Automata";
import {Outcome} from "@/classes/Outcome";
import TuringMachineTape from "@/classes/TuringMachineTape";
import TuringMachineConfig from "@/classes/TuringMachineConfig";
import Vue from "vue";
import PushdownAutomataConfig from "@/classes/PushdownAutomataConfig";
import {AutomataCharacters} from '@/classes/AutomataCharacters';
import {Circle} from '@/classes/Circle';

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
        const nonEmptySymbol: boolean = symbol === AutomataCharacters.NonEmptySymbol;
        const circleSymbol: boolean = symbol === AutomataCharacters.CircleSymbol;
        const uncircleSymbol: boolean = symbol === AutomataCharacters.UncircleSymbol;
        // If transition looks for non-empty symbol or circle symbol, disguise it as an epsilon move
        if (nonEmptySymbol || circleSymbol || uncircleSymbol) {
            symbol = AutomataCharacters.Epsilon;
        }

        const readTapeSymbol = nonEmptySymbol ? AutomataCharacters.NonEmptySymbol :
            uncircleSymbol ? AutomataCharacters.UncircleSymbol :
            circleSymbol ? AutomataCharacters.CircleSymbol : symbol;

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
                writeTapeSymbol, direction, readTapeSymbol,
                label: readTapeSymbol + ' ; ' + writeTapeSymbol + ' , ' + direction,
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
        const nonEmptySymbol: boolean = this.data[edgeID].data.readTapeSymbol === AutomataCharacters.NonEmptySymbol;
        const circledSymbol: boolean = this.data[edgeID].data.readTapeSymbol === AutomataCharacters.CircleSymbol;
        const uncircledSymbol: boolean = this.data[edgeID].data.readTapeSymbol === AutomataCharacters.UncircleSymbol;

        // Quit if...
        if ((nonEmptySymbol && srcConfig.getInputSymbol() === AutomataCharacters.EmptySymbol) || // We're looking for non-empty symbol and we find empty symbol
            (circledSymbol && !Circle.isCircled(srcConfig.getInputSymbol())) || // We're looking for circled symbols and we find an uncircled symbol
            (uncircledSymbol && !Circle.isUncircled(srcConfig.getInputSymbol())) || // We're looking for uncircled symbols and we find something that's not un-circled
            (srcConfig.getInputSymbol() !== this.data[edgeID].data.readTapeSymbol && !epsilonMove)) // Selected tape symbol is not the transition symbol (as long as it's not an epsilon move)
            return null;

        // Gets src state info
        let [srcTape, srcTapeIndex] = [srcConfig.tape, srcConfig.index];

        // Creates new tape
        const newTape: TuringMachineTape = new TuringMachineTape(srcTape);

        // If there isn't a "write nothing" symbol (if we have to write something)
        if (this.data[edgeID].data.writeTapeSymbol !== AutomataCharacters.WriteNothingSymbol) {
            // If we want to circle
            if (this.data[edgeID].data.writeTapeSymbol === AutomataCharacters.CircleSymbol)
                newTape.write(srcTapeIndex, Circle.circle(srcConfig.getInputSymbol()));
            // If we want to uncircle
            else if (this.data[edgeID].data.writeTapeSymbol === AutomataCharacters.UncircleSymbol)
                newTape.write(srcTapeIndex, Circle.uncircle(srcConfig.getInputSymbol()));
            // If write symbol is "empty", erase, otherwise write new symbol
            else if (this.data[edgeID].data.writeTapeSymbol === AutomataCharacters.EmptySymbol)
                newTape.delete(srcTapeIndex);
            else
                newTape.write(srcTapeIndex, this.data[edgeID].data.writeTapeSymbol);
        }

        // Make tape index go left or right
        if (this.data[edgeID].data.direction === 'L')
            srcTapeIndex--;
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
