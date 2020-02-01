import AutomataConfig from "@/classes/AutomataConfig";

/**
 * A configuration that the pushdown automata could be in
 */
export default class PushdownAutomataConfig extends AutomataConfig {
    /** The current stack this config has */
    private readonly _stack: (string | null)[];
    /**
     * Creates an automata configuration
     * @param state - the current state this config is on
     * @param input - the current input this config has
     * @param stack - the current stack this config has
     */
    public constructor(state: string, input: string, stack: (string | null)[]) {
        super(state, input);
        this._stack = stack;
    }

    /**
     * The current stack this config has
     */
    get stack(): (string | null)[] {
        return this._stack;
    }

    stackAsString(): string {
        return this.stack
            .filter((s) => s !== null) // Removes nulls
            .join(" ; "); // Join them all into a string
    }
}