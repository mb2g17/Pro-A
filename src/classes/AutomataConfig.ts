/**
 * A configuration that the automata could be in
 */
export default class AutomataConfig {
    /** The current state this config is in */
    private readonly _state: string;

    /** The input this config has */
    private readonly _input: string;

    /**
     * Creates an automata configuration
     * @param state - the current state this config is on
     * @param input - the current input this config has
     */
    public constructor(state: string, input: string) {
        this._state = state;
        this._input = input;
    }

    /**
     * The current state this config is in
     */
    get state(): string {
        return this._state;
    }

    /**
     * Gets the length of the input
     */
    public getInputLength(): number {
        return this._input.length;
    }

    /**
     * Gets the selected input symbol of this configuration
     */
    public getInputSymbol(): string {
        return this._input[0];
    }

    /**
     * Gets the input string minus the selected input
     */
    public getTruncatedInput(): string {
        return this._input.slice(1);
    }

    /**
     * Gets input using the two methods that already exist
     */
    public getInput(): string {
        return this.getInputSymbol() + this.getTruncatedInput();
    }
}