import Automata from "@/classes/Automata";

/**
 * Stores transition cache for quick access
 */
export class AutomataTransitionCache {
    /** Instance of automata */
    private automata: Automata;

    /** Transition re-mapping from source --> target --> set of symbols */
    protected cacheSourceTargetSymbol: any = {};

    public constructor(automata: Automata) {
        this.automata = automata;
    }

    /**
     * Gets transitions based on source and target
     * @param source - the name of the source state of the transition
     * @param target - the name of the target state of the transition
     * @return a set of transitions that go between these states
     */
    public getTransitions(source: string, target: string): Set<string> {
        if (this.cacheSourceTargetSymbol[source]) {
            if (this.cacheSourceTargetSymbol[source][target]) {
                return this.cacheSourceTargetSymbol[source][target];
            }
        }
        return new Set();
    }

    /**
     * Gets possible transitions with source state with target mapping
     * @param source - the source target name
     * @return mapping from target --> set of symbols
     */
    public getTargetMappings(source: string) {
        return this.cacheSourceTargetSymbol[source] ? this.cacheSourceTargetSymbol[source] : {};
    }

    public removeState(state: string) {
        for (const sourceState of Object.keys(this.cacheSourceTargetSymbol)) {
            if (sourceState === state)
                delete this.cacheSourceTargetSymbol[sourceState];
            else {
                for (const targetState of Object.keys(this.cacheSourceTargetSymbol[sourceState])) {
                    if (targetState === state)
                        delete this.cacheSourceTargetSymbol[sourceState][targetState];
                }
            }
        }
    }

    public addTransition(sourceState: string, targetState: string, symbol: string) {
        if (!this.cacheSourceTargetSymbol[sourceState])
            this.cacheSourceTargetSymbol[sourceState] = {};
        if (!this.cacheSourceTargetSymbol[sourceState][targetState])
            this.cacheSourceTargetSymbol[sourceState][targetState] = new Set();

        // Add this transition
        this.cacheSourceTargetSymbol[sourceState][targetState].add(symbol);
    }

    public removeTransition(sourceState: string, targetState: string, symbol: string) {
        if (!this.cacheSourceTargetSymbol[sourceState])
            return;
        if (!this.cacheSourceTargetSymbol[sourceState][targetState])
            return;

        // Delete this transition
        this.cacheSourceTargetSymbol[sourceState][targetState].delete(symbol);
    }

    public changeSourceOfTransition(oldSourceName: string, newSourceName: string, currentTarget: string, symbol: string) {
        this.removeTransition(oldSourceName, currentTarget, symbol);
        this.addTransition(newSourceName, currentTarget, symbol);
    }

    public changeTargetOfTransition(currentSourceName: string, oldTargetName: string, newTargetName: string, symbol: string) {
        this.removeTransition(currentSourceName, oldTargetName, symbol);
        this.addTransition(currentSourceName, newTargetName, symbol);
    }
}
