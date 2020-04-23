import Vue from "vue";
import Automata from "@/classes/Automata";

/**
 * Handles state fold cache
 */
export class AutomataFoldedStatesCache {
    /** One State ID --> One State fold ID */
    private stateToFold: any = {};

    /** One state fold ID --> Many state IDs (as a set) */
    private foldToState: any = {};

    /**
     * Gets whether a state is in a fold
     * @param stateID - the ID of the state
     * @returns true if the state is in a fold, false if not
     */
    public isStateInFold(stateID: string): boolean {
        return !!this.stateToFold[stateID];
    }

    /**
     * Gets the fold of a state
     * @param stateID - the state to get the fold of
     * @returns state fold ID
     */
    public getFoldOfState(stateID: string): string {
        return this.stateToFold[stateID];
    }

    /**
     * Gets contents of a state fold
     * @param foldID - the fold ID
     * @returns set of state IDs in that fold
     */
    public getFoldContents(foldID: string): Set<string> {
        return this.foldToState[foldID];
    }

    /**
     * Adds a state to a fold
     * @param stateID - the ID of the state
     * @param stateFoldID - the ID of the fold
     */
    public addStateToFold(stateID: string, stateFoldID: string) {
        // Add entry to state --> fold
        Vue.set(this.stateToFold, stateID, stateFoldID);

        // Add entry to fold --> state
        if (!this.foldToState[stateFoldID])
            this.foldToState[stateFoldID] = new Set();
        this.foldToState[stateFoldID].add(stateID);
    }

    /**
     * Removes a state from its fold
     * @param stateID - the ID of the state
     */
    public removeStateFromFold(stateID: string) {
        // Remembers fold this state is in
        const foldID = this.stateToFold[stateID];

        // Removes entry from state --> fold
        Vue.delete(this.stateToFold, stateID);

        // Removes entry from fold --> state
        if (this.foldToState[foldID])
            this.foldToState[foldID].delete(stateID);
    }

    /**
     * Removes a fold
     * @param foldID - the ID of the fold
     */
    public removeFold(foldID: string) {
        // Gets all states in this fold
        const states: Set<string> = this.foldToState[foldID];

        // Removes entry in fold --> state
        Vue.delete(this.foldToState, foldID);

        // Removes entries in state --> fold IF this fold had states
        if (states)
            states.forEach(state => this.removeStateFromFold(state));
    }

    /**
     * Refreshes cache with automata
     * @param automata - the automata to refresh cache with
     */
    public refresh(automata: Automata) {
        Vue.set(this, "stateToFold", {});
        Vue.set(this, "foldToState", {});

        // For every object
        Object.values(automata.getData()).forEach((item: any) => {
            // If it's a state
            if (item.data.type === "node") {
                // If it has a parnet
                if (item.parent) {
                    // Add it in to a state fold
                    this.addStateToFold(item.data.id, item.parent);
                }
            }
        });
    }
}