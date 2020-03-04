import Automata from "@/classes/Automata";

/**
 * Stores alphabet of machines
 */
export class AutomataAlphabetCache {
    /** Instance of automata */
    private automata: Automata;

    /** Transition re-mapping from source --> target --> set of symbols */
    protected cacheSourceTargetSymbol: any = {};

    public constructor(automata: Automata) {
        this.automata = automata;
    }

    public getAlphabet(state: string) {
        // Stores states we need to look through; initially add initial states from this state
        const openStates: string[] = [...this.automata.getMachine(state)];

        // Stores states we've already looked through
        const closedStates: Set<string> = new Set();

        // Stores alphabet to return
        const alphabet: Set<string> = new Set();

        // Goes through state fringe
        while (openStates.length > 0) {
            // Pops the next state
            const sourceState: string | undefined = openStates.pop();

            // If we've run out, then stop
            if (!sourceState)
                break;

            // We've now "looked" at this one
            closedStates.add(sourceState);

            // If we have no transitions with this, move on
            if (!this.cacheSourceTargetSymbol[sourceState])
                continue;

            // For every target state
            for (const targetState of Object.keys(this.cacheSourceTargetSymbol[sourceState])) {
                // If it's not closed, add to open states
                if (!closedStates.has(targetState))
                    openStates.push(targetState);

                // Gets the symbols we can use from src to target and add them to the set
                const symbols: Set<string> = this.cacheSourceTargetSymbol[sourceState][targetState];
                symbols.forEach(s => alphabet.add(s));
            }
        }

        // Return alphabet
        return alphabet;
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