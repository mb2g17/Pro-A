import AutomataConfig from "@/classes/AutomataConfig";
import TuringMachineTape from "@/classes/TuringMachineTape";

/**
 * A configuration that the TM could be in
 */
export default class TuringMachineConfig extends AutomataConfig {
    /** The current tape this config has */
    private readonly _tape: TuringMachineTape;

    /** The current tape index this config has */
    private readonly _index: number;

    /**
     * Creates a TM configuration
     * @param state - the current state this config is on
     * @param tape - the current tape this config has
     * @param index - the current tape index this config has
     */
    public constructor(state: string, tape: TuringMachineTape, index: number) {
        super(state, "");
        this._tape = tape;
        this._index = index;
    }

    getInputSymbol(): string {
        const symbol = this._tape.read(this._index);
        return symbol ? symbol : "__empty";
    }

    getInputLength(): number {
        return this._tape.length;
    }

    /**
     * The current tape this config has
     */
    get tape(): TuringMachineTape {
        return this._tape;
    }

    /**
     * The current tape index this config has
     */
    get index(): number {
        return this._index;
    }
}