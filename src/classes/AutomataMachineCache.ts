import _ from 'lodash';
import Automata from "@/classes/Automata";

/**
 * Handles the machine cache of the automata class
 */
export default class AutomataMachineCache {
    /** Mapping from source state --> target states --> number of transitions */
    protected cacheEdgeIDNoSymbol: any = {};

    /** Mapping from target state --> source states --> number of transitions */
    protected cacheEdgeIDReverseNoSymbol: any = {};

    /** Mapping from state --> set of initial states (stores machines) */
    protected cacheMachine: any = {};

    /** Reference to the automata class this is referring to */
    private automata: Automata;

    public constructor(automata: Automata) {
        this.automata = automata;
    }

    /**
     * Gets the machines that have this state
     * @param state - the state to get the machines of
     * @returns a set of initial state names that can reach that state
     */
    public getMachine(state: string) : Set<string> {
        if (!this.cacheMachine[state])
            return new Set();
        else
            return this.cacheMachine[state];
    }

    /**
     * Updating cache when adding a state
     * @param state - the name of the new state
     */
    public addState(state: string) {
        // Adds entry to cache dictionary
        this.cacheMachine[state] = new Set();
        this.cacheEdgeIDNoSymbol[state] = {};
        this.cacheEdgeIDReverseNoSymbol[state] = {};

        // If we're making an initial state, add it to the machine
        if (this.automata.getState(state).data.initial)
            this.cacheMachine[state].add(state);
    }


    /**
     * Updating cache when adding a transition
     * @param sourceState - the name of the state this transition starts at
     * @param targetState - the name of the state this transition ends at
     */
    public addTransition(sourceState: string, targetState: string) {
        this.ensureCacheDictionariesHaveEntries(sourceState, targetState);

        // Updates cache based on transition
        this.cacheEdgeIDNoSymbol[sourceState][targetState] += 1;
        this.cacheEdgeIDReverseNoSymbol[targetState][sourceState] += 1;

        // If the source state is initial, add it to machine cache
        /*if (this.automata.getState(sourceState).data.initial) {
            if (!this.cacheMachine[targetState])
                this.cacheMachine[targetState] = new Set();
            this.cacheMachine[targetState].add(sourceState);
        }*/

        // Updates cache of sub-tree from target node
        this.updateMachineCache(targetState);
    }

    /**
     * Updating cache when removing a state
     * @param removedState - the name of the removed state
     */
    public removeState(removedState: string) {
        // Removes transition caches going to and from this state
        const prevStates = Object.keys(this.cacheEdgeIDReverseNoSymbol[removedState]);
        const nextStates = Object.keys(this.cacheEdgeIDNoSymbol[removedState]);

        // Removes caches of this state
        delete this.cacheMachine[removedState];
        delete this.cacheEdgeIDNoSymbol[removedState];
        delete this.cacheEdgeIDReverseNoSymbol[removedState];

        // Removes references to this state from other states
        for (const nextState of nextStates)
            delete this.cacheEdgeIDReverseNoSymbol[nextState][removedState];
        for (const prevState of prevStates)
            delete this.cacheEdgeIDNoSymbol[prevState][removedState];

        // Updates cache for all the following states
        for (const nextState of nextStates)
            this.updateMachineCache(nextState);
    }

    /**
     * Updating cache when removing a transition
     * @param sourceState - name of the state this transition started at
     * @param targetState - name of the state this transition ended at
     * @param shouldDoCacheUpdate - if true, will perform cache update on target node
     */
    public removeTransition(sourceState: string, targetState: string, shouldDoCacheUpdate: boolean) {
        this.ensureCacheDictionariesHaveEntries(sourceState, targetState);

        // Updates cache based on transition
        this.cacheEdgeIDNoSymbol[sourceState][targetState] -= 1;
        this.cacheEdgeIDReverseNoSymbol[targetState][sourceState] -= 1;

        // If this is the last of the transitions on those two states, remove the entry
        if (this.cacheEdgeIDNoSymbol[sourceState][targetState] === 0)
            delete this.cacheEdgeIDNoSymbol[sourceState][targetState];
        if (this.cacheEdgeIDReverseNoSymbol[targetState][sourceState] === 0)
            delete this.cacheEdgeIDReverseNoSymbol[targetState][sourceState];

        // Updates cache of sub-tree from target node (if we should)
        if (shouldDoCacheUpdate)
            this.updateMachineCache(targetState);
    }

    /**
     * Updating cache when moving a transition (to a new source state)
     * @param oldSourceState - the name of the old source state
     * @param newSourceState - the name of the new source state
     * @param targetState - the name of the target state
     */
    public moveTransitionNewSourceState(oldSourceState: string, newSourceState: string, targetState: string) {
        this.removeTransition(oldSourceState, targetState, false);
        this.addTransition(newSourceState, targetState);
    }

    /**
     * Updating cache when moving a transition (to a new target state)
     * @param sourceState - the name of the source state
     * @param oldTargetState - the name of the old target state
     * @param newTargetState - the name of the new target state
     */
    public moveTransitionNewTargetState(sourceState: string, oldTargetState: string, newTargetState: string) {
        this.removeTransition(sourceState, oldTargetState, true);
        this.addTransition(sourceState, newTargetState);
    }

    /**
     * Updating cache when toggling between initial states
     * @param toggledState - the name of the state that has been toggled
     * @param initial - if true, state has turned initial. If false, state is no longer initial
     */
    public setInitialState(toggledState: string, initial: boolean) {
        // Update cache machine for toggled state
        if (!this.cacheMachine[toggledState])
            this.cacheMachine[toggledState] = new Set();

        if (initial)
            this.cacheMachine[toggledState].add(toggledState);
        else
            this.cacheMachine[toggledState].delete(toggledState);

        // Updates cache for all the following states
        const nextStates = Object.keys(this.cacheEdgeIDNoSymbol[toggledState]);
        for (const nextState of nextStates)
            this.updateMachineCache(nextState);
    }

    /**
     * Makes sure the cache dictionaries have the entries we need
     * @param sourceState - name of the source state
     * @param targetState - name of the target state
     */
    private ensureCacheDictionariesHaveEntries(sourceState: string, targetState: string) {
        if (!this.cacheEdgeIDNoSymbol[sourceState])
            this.cacheEdgeIDNoSymbol[sourceState] = {};
        if (!this.cacheEdgeIDNoSymbol[sourceState][targetState])
            this.cacheEdgeIDNoSymbol[sourceState][targetState] = 0;

        if (!this.cacheEdgeIDReverseNoSymbol[targetState])
            this.cacheEdgeIDReverseNoSymbol[targetState] = {};
        if (!this.cacheEdgeIDReverseNoSymbol[targetState][sourceState])
            this.cacheEdgeIDReverseNoSymbol[targetState][sourceState] = 0;
    }

    /**
     * Updates cache of a certain state with respect to its machine
     * @param state - the state name to update the machine cache of
     */
    private updateMachineCache(state: string) {
        // Gets set of previous states (states you need to go through transitions to get to this state)
        const prevStates = Object.keys(this.cacheEdgeIDReverseNoSymbol[state]);

        // Gets the union of all the machines the previous states are in
        const machines = new Set();
        for (const prevState of prevStates) {
            const prevStateMachines = this.cacheMachine[prevState];
            for (const machine of prevStateMachines)
                machines.add(machine);
        }

        const needRecursiveCase = !_.isEqual(this.cacheMachine[state], machines);

        // Sets the union to this state
        this.cacheMachine[state] = machines;

        // Recursive case, if needed
        if (needRecursiveCase) {
            // Updates all the next states (states we can get to from this state)
            let nextStates = Object.keys(this.cacheEdgeIDNoSymbol[state]);
            for (const nextState of nextStates)
                this.updateMachineCache(nextState);
        }
    }
}