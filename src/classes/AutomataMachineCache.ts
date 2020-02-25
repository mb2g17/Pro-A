import _ from 'lodash';
import Automata from "@/classes/Automata";

/**
 * Handles storing just the mappings concerning machines, such as states -> initial states
 * or initial states -> reachable final states
 */
class AutomataMachineCacheCacheMachine {
    /** Mapping from state --> set of initial states (stores machines) */
    private cacheMachine: any = {};

    /** Mapping from initial state --> set of reachable states */
    private cacheMachineReverse: any = {};

    /** Mapping from initial state --> set of reachable final states */
    private cacheMachineReverseFinal: any = {};

    /** Instance to automata this object is referring to */
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
     * Gets the states reachable by an initial state
     * @param initialState - the initial state name
     * @returns a set of states reachable by the specified initial state
     */
    public getReachableStates(initialState: string) : Set<string> {
        if (!this.cacheMachineReverse[initialState])
            return new Set();
        else
            return this.cacheMachineReverse[initialState];
    }

    /**
     * Gets the final states reachable by an initial state
     * @param initialState - the initial state name
     * @returns a set of final states reachable by the specified initial state
     */
    public getReachableFinalStates(initialState: string) : Set<string> {
        if (!this.cacheMachineReverseFinal[initialState])
            return new Set();
        else
            return this.cacheMachineReverseFinal[initialState];
    }

    /**
     * Adds a mapping from state to initial state
     * @param state - the state name
     * @param initialState - the initial state name
     */
    public addMapping(state: string, initialState: string) {
        // If mappings don't exist, instantiate them
        if (!this.cacheMachine[state])
            this.cacheMachine[state] = new Set();
        if (!this.cacheMachineReverse[initialState])
            this.cacheMachineReverse[initialState] = new Set();
        if (!this.cacheMachineReverseFinal[initialState])
            this.cacheMachineReverseFinal[initialState] = new Set();

        // Update caches
        this.cacheMachine[state].add(initialState);
        this.cacheMachineReverse[initialState].add(state);

        // If state is final, add to final mapping
        if (this.automata.getState(state).data.final)
            this.cacheMachineReverseFinal[initialState].add(state);
    }

    /**
     * Sets a mapping from state to initial states
     * @param state - the state name
     * @param initialStates - the set of initial states to set
     */
    public setMapping(state: string, initialStates: Set<string>) {
        // Sets default cache values, if they don't exist
        if (!this.cacheMachine[state])
            this.cacheMachine[state] = new Set();
        for (const initialState of initialStates) {
            if (!this.cacheMachineReverse[initialState])
                this.cacheMachineReverse[initialState] = new Set();
            if (!this.cacheMachineReverseFinal[initialState])
                this.cacheMachineReverseFinal[initialState] = new Set();
        }

        // Gathers initial states to delete and states to add
        const deleteInitialStates: Set<string> = new Set();
        const addInitialStates: Set<string> = new Set();
        for (const initialState of [...initialStates, ...this.cacheMachine[state]]) {
            // If it's not in the states we want to add and it's in the cache, we want to delete it
            if (!initialStates.has(initialState) && this.cacheMachine[state].has(initialState))
                deleteInitialStates.add(initialState);

            // If it's in the states we want to add, but not in the cache yet, we want to add it
            if (initialStates.has(initialState) && !this.cacheMachine[state].has(initialState))
                addInitialStates.add(initialState);
        }

        // Adds and deletes desired states
        for (const deleteInitialState of deleteInitialStates)
            this.deleteMapping(state, deleteInitialState);
        for (const addInitialState of addInitialStates)
            this.addMapping(state, addInitialState);
    }

    /**
     * Deletes a mapping from state to initial state
     * @param state - the state name
     * @param initialState - the initial state name
     */
    public deleteMapping(state: string, initialState: string) {
        // Removes mappings in initial states --> reachable states
        this.cacheMachineReverse[initialState].delete(state);
        this.cacheMachineReverseFinal[initialState].delete(state);

        // Removes mapping in state --> initial states
        this.cacheMachine[state].delete(initialState);
    }

    /**
     * Deletes anything to do with a state
     * @param state - the state name to delete
     */
    public deleteState(state: string) {
        if (this.cacheMachine[state]) {
            // Removes mappings in initial states --> reachable states
            for (const initialState of this.cacheMachine[state]) {
                this.cacheMachineReverse[initialState].delete(state);
                this.cacheMachineReverseFinal[initialState].delete(state);
            }

            // Removes mapping in state --> initial states
            delete this.cacheMachine[state];
        }
    }

    /**
     * Updating cache when toggling between final states
     * @param toggledState - the name of the state that has been toggled
     * @param final - if true, state has turned final. If false, state is no longer final
     */
    public setFinalState(toggledState: string, final: boolean) {
        // Sets default cache values, if they don't exist
        if (!this.cacheMachine[toggledState])
            this.cacheMachine[toggledState] = new Set();

        // Gets the initial states that lead to this toggled state
        const initialStates = this.cacheMachine[toggledState];
        for (const initialState of initialStates) {
            if (final) {
                this.cacheMachineReverseFinal[initialState].add(toggledState);
            } else {
                this.cacheMachineReverseFinal[initialState].delete(toggledState);
            }
        }
    }
}

/**
 * Handles the machine cache of the automata class
 */
export default class AutomataMachineCache {
    /** Mapping from source state --> target states --> number of transitions */
    protected cacheEdgeIDNoSymbol: any = {};

    /** Mapping from target state --> source states --> number of transitions */
    protected cacheEdgeIDReverseNoSymbol: any = {};

    /** Mapping from state --> set of initial states (stores machines) */
    protected readonly cacheMachine: AutomataMachineCacheCacheMachine;

    /** Reference to the automata class this is referring to */
    private readonly automata: Automata;

    public constructor(automata: Automata) {
        this.automata = automata;
        this.cacheMachine = new AutomataMachineCacheCacheMachine(this.automata);
    }

    /**
     * Gets the machines that have this state
     * @param state - the state to get the machines of
     * @returns a set of initial state names that can reach that state
     */
    public getMachine(state: string) : Set<string> {
        return this.cacheMachine.getMachine(state);
    }

    /**
     * Gets the states reachable by an initial state
     * @param initialState - the initial state name
     * @returns a set of states reachable by the specified initial state
     */
    public getReachableStates(initialState: string) : Set<string> {
        return this.cacheMachine.getReachableStates(initialState);
    }

    /**
     * Gets the final states reachable by an initial state
     * @param initialState - the initial state name
     * @returns a set of final states reachable by the specified initial state
     */
    public getReachableFinalStates(initialState: string) : Set<string> {
        return this.cacheMachine.getReachableFinalStates(initialState);
    }

    /**
     * Updating cache when adding a state
     * @param state - the name of the new state
     */
    public addState(state: string) {
        // Adds entry to cache dictionary
        this.cacheEdgeIDNoSymbol[state] = {};
        this.cacheEdgeIDReverseNoSymbol[state] = {};

        // If we're making an initial state, add it to the machine
        if (this.automata.getState(state).data.initial)
            this.cacheMachine.addMapping(state, state);
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
        this.cacheMachine.deleteState(removedState);
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
        if (initial)
            this.cacheMachine.addMapping(toggledState, toggledState);
        else
            this.cacheMachine.deleteMapping(toggledState, toggledState);

        // Updates cache for all the following states
        const nextStates = Object.keys(this.cacheEdgeIDNoSymbol[toggledState]);
        for (const nextState of nextStates)
            this.updateMachineCache(nextState);
    }

    /**
     * Updating cache when toggling between final states
     * @param toggledState - the name of the state that has been toggled
     * @param final - if true, state has turned final. If false, state is no longer final
     */
    public setFinalState(toggledState: string, final: boolean) {
        this.cacheMachine.setFinalState(toggledState, final);
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
        const machines: Set<string> = new Set();
        for (const prevState of prevStates) {
            const prevStateMachines = this.cacheMachine.getMachine(prevState);
            for (const machine of prevStateMachines)
                machines.add(machine);
        }

        const needRecursiveCase = !_.isEqual(this.cacheMachine.getMachine(state), machines);

        // Sets the union to this state
        this.cacheMachine.setMapping(state, machines);

        // Recursive case, if needed
        if (needRecursiveCase) {
            // Updates all the next states (states we can get to from this state)
            let nextStates = Object.keys(this.cacheEdgeIDNoSymbol[state]);
            for (const nextState of nextStates)
                this.updateMachineCache(nextState);
        }
    }
}