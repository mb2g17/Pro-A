import uuidv1 from 'uuid/v1';
import {Outcome} from '@/classes/Outcome';
import Vue from 'vue';
import AutomataConfig from '@/classes/AutomataConfig';
import FiniteAutomata from "@/classes/FiniteAutomata";
import AutomataMachineCache from "@/classes/AutomataMachineCache";
import _ from "lodash";
import {AutomataCharacters} from '@/classes/AutomataCharacters';
import {AutomataTransitionCache} from "@/classes/AutomataTransitionCache";

/**
 * Abstract class of an automata such as FA, PDA or TM
 */
export default abstract class Automata {
    /** The input string stored in the automata */
    protected inputString: string = '';

    /** Mapping from node names "A" to ID */
    protected cacheNodeID: any = {};

    /** Mapping from edge name "a: A: B" to ID */
    protected cacheEdgeID: any = {};

    /** Set of initial state names */
    protected cacheInitialStates: Set<string> = new Set();

    /** Set of final state names */
    protected cacheFinalStates: Set<string> = new Set();

    /** Cache storing transition convenience */
    public cacheTransition: AutomataTransitionCache = new AutomataTransitionCache();

    /** Cytoscape data for all the graph objects */
    protected data: any = {};

    /** The name of the automata itself */
    private name: string = '';

    /**
     * Sets the input string stored in the automata
     * @param inputString - the new input string to put into the automata
     */
    public setInput(inputString: string) {
        this.inputString = inputString;
    }

    /**
     * Gets the input string of this automata
     * @returns the current input string
     */
    public getInput(): string {
        return this.inputString;
    }

    /**
     * Accessor for automata name
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Mutator for automata name
     * @param value - the new name for the automata
     */
    public setName(value: string) {
        this.name = value;
    }

    /**
     * Clones and returns the data to put into Cytoscape
     * @returns the object to insert into cytoscape
     */
    public getData(): any {
        return this.data;
    }

    public setData(newData: any) {
        Vue.set(this, 'data', newData);
    }

    /**
     * Updates one item in the data object
     * @param itemID - the ID of the data object to update
     * @param newItem - the new data object to replace
     */
    public updateItem(itemID: string, newItem: any) {
        Vue.set(this.data, itemID, newItem);
    }

    /**
     * Adds a state to the automata
     * @param name - the name of the automata
     * @param x - the X coordinate of the automata
     * @param y - the Y coordinate of the automata
     * @param initial - if true, this will be an initial state
     * @param final - if true, this will be a final state
     */
    public addState(name: string, x: number, y: number, initial: boolean, final: boolean) {
        // If this state doesn't already exist
        if (!this.cacheNodeID[name]) {
            // If it's initial or final, add to sets
            if (initial) {
                this.cacheInitialStates.add(name);
            }
            if (final) {
                this.cacheFinalStates.add(name);
            }

            // Creates ID
            const ID = uuidv1();

            // Sets node name -> id mapping
            Vue.set(this.cacheNodeID, name, ID);

            // Sets data
            Vue.set(this.data, ID, {
                classes: [
                    initial ? 'initial-node' : '',
                    final ? 'final-node' : '',
                ],
                data: {
                    id: ID,
                    name, // The original name
                    displayName: name, // The name that shows on the graph
                    type: 'node',
                    initial, final,
                },
                position: {x, y},
            });
        }
    }

    public addStateData(node: any) {
        Vue.set(this.data, node.data.id, node);
    }

    /**
     * Adds a transition
     * @param symbol - the symbol of the transition
     * @param source - name of the state to go from
     * @param target - name of the state to go to
     * @param payload - the information for this specific type of transition
     */
    public addTransition(symbol: string, source: string, target: string, payload?: any) {
        // If the source and target states exist
        if (this.cacheNodeID[source] && this.cacheNodeID[target]) {
            // Creates the parent branches of edgeID
            if (!this.cacheEdgeID[symbol]) {
                Vue.set(this.cacheEdgeID, symbol, {});
            }
            if (!this.cacheEdgeID[symbol][source]) {
                Vue.set(this.cacheEdgeID[symbol], source, {});
            }

            // If the transition doesn't already exist
            if (!this.cacheEdgeID[symbol][source][target]) {
                // Create ID
                const ID = uuidv1();

                // Create edge name -> id mapping
                Vue.set(this.cacheEdgeID[symbol][source], target, ID);

                // Gets IDs of the states
                const sourceID = this.cacheNodeID[source];
                const targetID = this.cacheNodeID[target];

                // Sets data
                Vue.set(this.data, ID, {
                    data: {
                        id: ID,
                        label: symbol,
                        symbol,
                        source: sourceID,
                        target: targetID,
                        sourceName: source,
                        targetName: target,
                        type: 'edge',
                    },
                });

                // Updates cache
                this.cacheTransition.addTransition(source, target, symbol);
            }
        }
    }

    /**
     * Gets a state by its name
     * @param name - the name of the state to get
     * @returns state object if found, null if not found
     */
    public getState(name: string): any | null {
        const ID = this.cacheNodeID[name];
        return this.getStateById(ID);
    }

    /**
     * Gets a state by its ID
     * @param ID - the ID of the state to get
     * @returns state object if found, null if not found
     */
    public getStateById(ID: string): any | null {
        return !!this.data[ID] ? this.data[ID] : null;
    }

    /**
     * Changes the source node of a transition
     * @param edgeID - the edge to change
     * @param newSourceID - the new source of the edge
     */
    public changeSourceOfTransition(edgeID: string, newSourceID: string) {
        const currentSymbol = this.data[edgeID].data.symbol;
        const currentTargetName = this.data[edgeID].data.targetName;
        const oldSourceName = this.data[edgeID].data.sourceName;
        const newSourceName = this.data[newSourceID].data.name;

        // Edits data
        this.data[edgeID].data.source = newSourceID;
        this.data[edgeID].data.sourceName = newSourceName;

        // Edits edge ID lookup cache
        delete this.cacheEdgeID[currentSymbol][oldSourceName][currentTargetName];
        if (!this.cacheEdgeID[currentSymbol][newSourceName])
            this.cacheEdgeID[currentSymbol][newSourceName] = {};
        this.cacheEdgeID[currentSymbol][newSourceName][currentTargetName] = edgeID;

        // Updates cache
        this.cacheTransition.changeSourceOfTransition(oldSourceName, newSourceName, currentTargetName, currentSymbol);
    }

    /**
     * Changes the target node of a transition
     * @param edgeID - the edge to change
     * @param newTargetID - the new target of the edge
     */
    public changeTargetOfTransition(edgeID: string, newTargetID: string) {
        const currentSymbol = this.data[edgeID].data.symbol;
        const currentSourceName = this.data[edgeID].data.sourceName;
        const oldTargetName = this.data[edgeID].data.targetName;
        const newTargetName = this.data[newTargetID].data.name;

        // Edits data
        this.data[edgeID].data.target = newTargetID;
        this.data[edgeID].data.targetName = newTargetName;

        // Edits edge ID lookup
        Vue.delete(this.cacheEdgeID[currentSymbol][currentSourceName], oldTargetName);
        Vue.set(this.cacheEdgeID[currentSymbol][currentSourceName], newTargetName, edgeID);

        // Updates machine cache
        this.cacheTransition.changeTargetOfTransition(currentSourceName, oldTargetName, newTargetName, currentSymbol);
    }

    /**
     * Gets a transition with symbol, source and target
     * @param symbol - the symbol of the transition
     * @param source - the source state
     * @param target - the target state
     * @returns the transition object if found, null if not found
     */
    public getTransition(symbol: string, source: string, target: string): any | null {
        // If edge branch exists, return transition object
        if (this.cacheEdgeID[symbol]) {
            if (this.cacheEdgeID[symbol][source]) {
                if (this.cacheEdgeID[symbol][source][target]) {
                    const edgeID = this.cacheEdgeID[symbol][source][target];
                    return this.data[edgeID];
                }
            }
        }
        // It must not exist; return null
        return null;
    }

    /**
     * Removes a state
     * @param stateName - the name of the state to delete
     */
    public removeState(stateName: string) {
        // If this state exists
        if (this.cacheNodeID[stateName]) {
            // Gets state ID
            const id = this.cacheNodeID[stateName];

            // Delets nodeID entry
            Vue.delete(this.cacheNodeID, stateName);

            // Deletes data entry
            delete this.data[id];

            // Removes from initial / final state cache
            this.cacheInitialStates.delete(stateName);
            this.cacheFinalStates.delete(stateName);

            // Updates cache
            this.cacheTransition.removeState(stateName);
        }
    }

    public removeStateFold(foldID: string) {
        // Deletes data entry
        if (this.data[foldID])
            delete this.data[foldID];
    }

    /**
     * Removes a transition
     * @param symbol - the symbol of the transition to remove
     * @param source - the source state of the transition to remove
     * @param target - the target state of the transition to remove
     */
    public removeTransition(symbol: string, source: string, target: string) {
        // If this transition exists
        if (this.cacheEdgeID[symbol][source][target]) {
            // Gets edge ID
            const id = this.cacheEdgeID[symbol][source][target];

            // Delete edgeID entry
            Vue.delete(this.cacheEdgeID[symbol][source], target);

            // Deletes data entry
            delete this.data[id];

            // Updates cache
            this.cacheTransition.removeTransition(source, target, symbol);
        }
    }

    /**
     * Removes a transition via ID
     * @param transitionID - the ID of the transition to remove
     */
    public removeTransitionWithID(transitionID: string) {
        if (this.data[transitionID]) {
            // Gets transition object
            const transition = this.data[transitionID].data;

            // Deletes
            this.removeTransition(transition.symbol, transition.sourceName, transition.targetName);
        }
    }

    /**
     * Renames a state
     * @param stateID - the ID of the state to rename
     * @param newStateName - the new state name
     */
    public renameState(stateID: string, newStateName: string) {
        Vue.set(this.data[stateID].data, "displayName", newStateName);
    }

    /**
     * Gets the number of states
     * @returns the number of states
     */
    public getNumberOfStates(): number {
        return Object.keys(this.cacheNodeID).length;
    }

    /**
     * Gets the number of transitions
     * @returns the number of transitions
     */
    public getNumberOfTransitions(): number {
        return Object.keys(this.cacheEdgeID).length;
    }

    /**
     * Simulates the automata with an input string in it
     */
    public simulate() {
        // Check to see if the initial config accepts
        this.configInit();
        if (this.getOutcome() === Outcome.ACCEPT) {
            return;
        }

        // It doesn't; compute steps until we do or run out of configs
        do {
            this.step();
        } while (this.getOutcome() !== Outcome.ACCEPT && this.getCurrentConfigs().size > 0);
    }

    /**
     * Gets a set of initial states
     * @returns a Set of initial state names
     */
    public getInitialStates(): Set<string> {
        return this.cacheInitialStates;
    }

    /**
     * Gets a set of final states
     * @returns a Set of final state names
     */
    public getFinalStates(): Set<string> {
        return this.cacheFinalStates;
    }

    /**
     * Sets a state's initial property
     * @param stateName - the name of the state to change
     * @param initial - if true, set this state to initial, if false, stop it from being initial
     */
    public setInitialState(stateName: string, initial: boolean) {
        // Gets ID
        const id = this.cacheNodeID[stateName];

        // Updates set and classes
        if (this.data[id].data.initial) {
            this.cacheInitialStates.delete(stateName);

            // Gets class index
            const classIndex = this.data[id].classes.indexOf('initial-node');
            this.data[id].classes.splice(classIndex, 1);
        } else {
            this.cacheInitialStates.add(stateName);
            this.data[id].classes.push('initial-node');
        }

        // Sets initial
        Vue.set(this.data[id].data, 'initial', initial);
    }

    /**
     * Sets a state's final property
     * @param stateName - the name of the state to change
     * @param final - if true, set this state to final, if false, stop it from being final
     */
    public setFinalState(stateName: string, final: boolean) {
        // Gets ID
        const id = this.cacheNodeID[stateName];

        // Updates set
        if (this.data[id].data.final) {
            this.cacheFinalStates.delete(stateName);

            // Gets class index
            const classIndex = this.data[id].classes.indexOf('final-node');
            this.data[id].classes.splice(classIndex, 1);
        } else {
            this.cacheFinalStates.add(stateName);
            this.data[id].classes.push('final-node');
        }

        // Sets final
        Vue.set(this.data[id].data, 'final', final);
    }

    /**
     * Gets a new, unique name for a state
     */
    public getNewStateName(): string {
        // Gets set of states
        const states = new Set(Object.keys(this.cacheNodeID));

        // Gets the first state name number
        let stateNameNumber = states.size + 1;

        // Keep generating state names and incrementing the number until we get unique name
        while (states.has('s' + stateNameNumber)) {
            stateNameNumber++;
        }

        return 's' + stateNameNumber;
    }

    /**
     * Reads the next input symbol and travels to the next state
     */
    public step(): void {
        // If there's no current states, add the initial ones and leave it at that
        if (this.configInit()) {
            this.setCurrentConfigs(this.getCurrentConfigs());
            return;
        }

        // Remember the new set of current states
        const newCurrentConfigs: Set<AutomataConfig> = new Set();

        // Goes through each config
        for (const config of this.getCurrentConfigs()) {
            // Gets epsilon move target states
            let epsilonTargetStates = this.getTargetStates('ε', config.state);

            // If there are none, change to empty array
            if (!epsilonTargetStates) {
                epsilonTargetStates = [];
            }

            // Apply this transition for each epsilon target state
            for (const targetState of epsilonTargetStates) {
                // Gets edge ID
                const edgeID = this.cacheEdgeID[AutomataCharacters.Epsilon][config.state][targetState];

                // Gets new config by applying transition
                const newConfig = this.applyTransition(config, edgeID, true);

                // If the transition was succesful, add
                if (newConfig) {
                    newCurrentConfigs.add(newConfig);
                }
            }

            // Gets first input symbol
            const inputSymbol: string = config.getInputSymbol();

            // If input symbol exists
            if (inputSymbol) {
                // Gets target states, from normal moves
                let normalTargetStates = this.getTargetStates(inputSymbol, config.state);

                // If they are null, replace with empty array
                if (!normalTargetStates) {
                    normalTargetStates = [];
                }

                // Apply this transition for each normal target state
                for (const targetState of normalTargetStates) {
                    // Gets edge ID
                    const edgeID = this.cacheEdgeID[inputSymbol][config.state][targetState];

                    // Gets new config by applying transition
                    const newConfig = this.applyTransition(config, edgeID, false);

                    // If the transition was succesful, add
                    if (newConfig) {
                        newCurrentConfigs.add(newConfig);
                    }
                }
            }
        }

        // Updates this set of current states with the new one
        this.setCurrentConfigs(newCurrentConfigs);
    }

    /**
     * Serializes this automata into a JSON string (does not include animations)
     * @returns JSON string representing this automata
     */
    public serialize(): string {
        // Sets up a quick function to convert str --> Set to str --> array
        function setToArrayMap(setObj: any) {
            return _.mapValues(setObj, set => [...set]);
        }

        // Initial JSON
        let json: any = {
            modelName: this.getModelName(),
            name: this.name,
            data: {},
            cacheEdgeID: this.cacheEdgeID,
            cacheNodeID: this.cacheNodeID,
            cacheInitialStates: [...this.cacheInitialStates],
            cacheFinalStates : [...this.cacheFinalStates],
        };

        // Goes through items, checking if they're good
        for (const itemID in this.data) {
            // Get item
            const item: any = this.data[itemID];

            // If there's no 'classes' property, it's a transition and it's good to go
            if (!item.classes)
                json.data[itemID] = item;
            else {
                // If there's no 'parent' class, it's a normal node and can be added
                if (![...item.classes].includes("parent")) {
                    json.data[itemID] = item;
                } else {
                    json.data[itemID] = {
                        data: item.data,
                        position: item.position,
                        autoWidth: item.autoWidth,
                        autoHeight: item.autoHeight,
                        group: item.group,
                        classes: [...item.classes]
                    };
                }
            }
        }

        return JSON.stringify(json);
    }

    /**
     * Gets the machines that have this state (proxy of AutomataMachineCache method)
     * @param state - the state to get the machines of
     * @returns a set of initial state names that can reach that state
     */
    public getMachine(state: string) : Set<string> {
        // Stores open and closed states
        const openStates: Set<string> = new Set([state]), closedStates: Set<string> = new Set();

        // Initial states to return
        const initialStates: Set<string> = new Set();

        // Searches through open states
        while (openStates.size > 0) {
            // Pop an open state
            const poppedState = [...openStates][0];
            openStates.delete(poppedState);

            // Put it in closed
            closedStates.add(poppedState);

            // If popped state is initial, add it
            if (this.getState(poppedState).data.initial)
                initialStates.add(poppedState);

            // Gets states that can go to this popped state
            const sourceMappings = this.cacheTransition.getSourceMappings(poppedState);
            Object.keys(sourceMappings).forEach((state: any) => {
                if (!closedStates.has(state))
                    openStates.add(state);
            });
        }

        return initialStates;
    }

    /**
     * Gets the machines that have this state, with transitions
     * @param state - the state name to get the machines of
     * @returns a set of IDs of all the objects within the machines
     */
    public getMachineWithTransitions(state: string) : Set<string> {
        // Gets the initial states from this state
        const initialStates: Set<string> = this.getMachine(state);

        // Gets all the states in these machines
        let states: Set<string> = new Set();
        for (const initialState of initialStates) {
            const reachableStates = this.getReachableStates(initialState);
            reachableStates.forEach((x) => states.add(x));
        }

        // Converts state names to IDs
        states = new Set([...states].map((state) => this.getState(state).data.id));

        // Gets all transitions from these states
        const items: Set<string> = new Set(states);
        for (const sourceStateID of states) {
            // Gets state name
            const sourceState = this.getStateById(sourceStateID).data.name;

            const mapping = this.cacheTransition.getTargetMappings(sourceState);
            Object.keys(mapping).forEach((targetState) => {
                mapping[targetState].forEach((symbol: any) => {
                    // Gets transition and adds to set
                    const transition = this.getTransition(symbol, sourceState, targetState);
                    items.add(transition.data.id);
                });
            });
        }
        return items;
    }

    /**
     * Gets the states reachable by a state
     * @param state - the state name
     * @returns a set of states reachable by the specified state
     */
    public getReachableStates(state: string) : Set<string> {
        // Stores open and closed states
        const openStates: Set<string> = new Set([state]), closedStates: Set<string> = new Set();

        // Searches through open states
        while (openStates.size > 0) {
            // Pop an open state
            const poppedState = [...openStates][0];
            openStates.delete(poppedState);

            // Put it in closed
            closedStates.add(poppedState);

            // Gets next states from this popped state
            const targetMappings = this.cacheTransition.getTargetMappings(poppedState);
            Object.keys(targetMappings).forEach((state: any) => {
                if (!closedStates.has(state))
                    openStates.add(state);
            });
        }

        return closedStates;
    }

    /**
     * Gets the final states reachable by an initial state
     * @param initialState - the initial state name
     * @returns a set of final states reachable by the specified initial state
     */
    public getReachableFinalStates(initialState: string) : Set<string> {
        // Stores open and closed states
        const openStates: Set<string> = new Set([initialState]), closedStates: Set<string> = new Set();

        // Stores final states to return
        const finalStates: Set<string> = new Set();

        // Searches through open states
        while (openStates.size > 0) {
            // Pop an open state
            const poppedState = [...openStates][0];
            openStates.delete(poppedState);

            // Put it in closed
            closedStates.add(poppedState);

            // If it's final, add to set
            if (this.getState(poppedState).data.final)
                finalStates.add(poppedState);

            // Gets next states from this popped state
            const targetMappings = this.cacheTransition.getTargetMappings(poppedState);
            Object.keys(targetMappings).forEach((state: any) => {
                if (!closedStates.has(state))
                    openStates.add(state);
            });
        }

        return finalStates;
    }

    /**
     * Gets the alphabet of the machine belonging to this state
     * @param state - the state to get the alphabet of
     */
    public getAlphabet(state: string) : Set<string> {
        // Stores states we need to look through; initially add initial states from this state
        const openStates: string[] = [...this.getMachine(state)];

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
            if (!this.cacheTransition.getTargetMappings(sourceState))
                continue;

            // For every target state
            for (const targetState of Object.keys(this.cacheTransition.getTargetMappings(sourceState))) {
                // If it's not closed, add to open states
                if (!closedStates.has(targetState))
                    openStates.push(targetState);

                // Gets the symbols we can use from src to target and add them to the set
                const symbols: Set<string> = this.cacheTransition.getTransitions(sourceState, targetState);
                symbols.forEach((s) => alphabet.add(s));
            }
        }

        // Return alphabet
        return alphabet;
    }

    /**
     * Returns a list of the current configurations of the automata
     */
    public abstract getCurrentConfigs(): Set<AutomataConfig>;

    /**
     * Resets the animation of this automata
     */
    public abstract reset(): void;

    /**
     * The outcome of the automata: undecided, accept, reject
     */
    public abstract getOutcome(): Outcome;

    /**
     * Returns the name of this model
     */
    public abstract getModelName(): string;

    /**
     * Gets the target states from an input symbol and source state
     * @param inputSymbol - the input symbol of the transition
     * @param sourceState - the source state of the transition
     * @returns an array of target state IDs if the transition exists, null if it doesn't
     */
    protected getTargetStates(inputSymbol: string, sourceState: string): any[] | null {
        // If a transition for this state exists
        if (this.cacheEdgeID[inputSymbol]) {
            if (this.cacheEdgeID[inputSymbol][sourceState]) {
                // Gets all the target states
                return Object.keys(this.cacheEdgeID[inputSymbol][sourceState]);
            }
        }
        return null;
    }

    /**
     * Sets the set of configs to a new one
     * @param newConfigs - a new set of configs
     */
    protected abstract setCurrentConfigs(newConfigs: Set<AutomataConfig>): void;

    /**
     * Sets up initial configurations if needed
     * @returns true if initial configs were added, false if not
     */
    protected abstract configInit(): boolean;

    /**
     * Applies a transition from a source config to a destination config
     * @param srcConfig - the config to start from
     * @param edgeID - the ID of the transition to take
     * @param epsilonMove - true if it's an epsilon move, false if not
     * @returns the new config if this transition was successful, null if not
     */
    protected abstract applyTransition(srcConfig: AutomataConfig, edgeID: number, epsilonMove: boolean): AutomataConfig | null;
}
