import Automata from "@/classes/Automata";

/**
 * Stores transition cache for quick access
 */
export class AutomataTransitionCache {
    /** Transition re-mapping from source --> target --> set of symbols */
    private cacheSourceTargetSymbol: any = {};

    /** Like cacheSourceTargetSymbol, but reverse, target --> source --> set of symbols */
    private cacheSourceTargetSymbolReverse: any = {};

    /** The number of transitions */
    private cacheNoOfTransitions = 0;

    /**
     * Refreshes the cache, used for serialisation
     */
    public refresh(automata: Automata) {
        this.cacheSourceTargetSymbol = {};
        this.cacheSourceTargetSymbolReverse = {};

        // Goes through all transitions
        Object.values(automata.getData()).forEach((dataObj: any) => {
            if (dataObj.data.type === "edge")
                this.addTransition(dataObj.data.sourceName, dataObj.data.targetName, dataObj.data.symbol);
        });
    }

    /**
     * Gets the number of transitions
     * @returns number of transitions that exist
     */
    public getNumberOfTransitions(): number {
        return this.cacheNoOfTransitions;
    }

    /**
     * Gets transitions based on source and target
     * @param source - the name of the source state of the transition
     * @param target - the name of the target state of the transition
     * @return a set of symbols that go between these states
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

    /**
     * Gets possible transitions with target state with mapping
     * @param target - the target name of the state
     * @return mapping from source --> set of symbols
     */
    public getSourceMappings(target: string) {
        return this.cacheSourceTargetSymbolReverse[target] ? this.cacheSourceTargetSymbolReverse[target] : {};
    }

    public removeState(state: string) {
        // Updates source --> target
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

        // Updates target --> source
        for (const targetState of Object.keys(this.cacheSourceTargetSymbolReverse)) {
            if (targetState === state)
                delete this.cacheSourceTargetSymbolReverse[targetState];
            else {
                for (const sourceState of Object.keys(this.cacheSourceTargetSymbolReverse[targetState])) {
                    if (sourceState === state)
                        delete this.cacheSourceTargetSymbolReverse[targetState][sourceState];
                }
            }
        }
    }

    public addTransition(sourceState: string, targetState: string, symbol: string) {
        if (!this.cacheSourceTargetSymbol[sourceState])
            this.cacheSourceTargetSymbol[sourceState] = {};
        if (!this.cacheSourceTargetSymbol[sourceState][targetState])
            this.cacheSourceTargetSymbol[sourceState][targetState] = new Set();

        if (!this.cacheSourceTargetSymbolReverse[targetState])
            this.cacheSourceTargetSymbolReverse[targetState] = {};
        if (!this.cacheSourceTargetSymbolReverse[targetState][sourceState])
            this.cacheSourceTargetSymbolReverse[targetState][sourceState] = new Set();

        // Add this transition
        this.cacheSourceTargetSymbol[sourceState][targetState].add(symbol);
        this.cacheSourceTargetSymbolReverse[targetState][sourceState].add(symbol);
        this.cacheNoOfTransitions++;
    }

    public removeTransition(sourceState: string, targetState: string, symbol: string) {
        if (this.cacheSourceTargetSymbol[sourceState])
            if (this.cacheSourceTargetSymbol[sourceState][targetState]) {
                // Deletes symbol
                this.cacheSourceTargetSymbol[sourceState][targetState].delete(symbol);
                this.cacheNoOfTransitions--;

                // If there's no more transitions, delete this mapping
                if (this.cacheSourceTargetSymbol[sourceState][targetState].size === 0)
                    delete this.cacheSourceTargetSymbol[sourceState][targetState];
            }

        if (this.cacheSourceTargetSymbolReverse[targetState])
            if (this.cacheSourceTargetSymbolReverse[targetState][sourceState]) {
                // Deletes symbol
                this.cacheSourceTargetSymbolReverse[targetState][sourceState].delete(symbol);

                // If there's no more transitions, delete this mapping
                if (this.cacheSourceTargetSymbolReverse[targetState][sourceState].size === 0)
                    delete this.cacheSourceTargetSymbolReverse[targetState][sourceState];
            }
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
