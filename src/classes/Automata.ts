import uuidv1 from 'uuid/v1';
import {Outcome} from '@/classes/Outcome';
import Vue from 'vue';
import AutomataConfig from '@/classes/AutomataConfig';
import FiniteAutomata from "@/classes/FiniteAutomata";

/**
 * Abstract class of an automata such as FA, PDA or TM
 */
export default abstract class Automata {
    /**
     * The input string stored in the automata
     */
    protected inputString: string = '';

    /** Mapping from node names "A" to ID */
    protected nodeID: any = {};

    /** Mapping from edge name "a: A: B" to ID */
    protected edgeID: any = {};

    /** Set of initial state names */
    protected initialStates: Set<string> = new Set();

    /** Set of final state names */
    protected finalStates: Set<string> = new Set();

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
    public getData(): object {
        return this.data;
    }

    public setData(newData: any) {
        Vue.set(this, 'data', newData);
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
        if (!this.nodeID[name]) {
            // If it's initial or final, add to sets
            if (initial) {
                this.initialStates.add(name);
            }
            if (final) {
                this.finalStates.add(name);
            }

            // Creates ID
            const ID = uuidv1();

            // Sets node name -> id mapping
            this.nodeID[name] = ID;

            // Sets data
            Vue.set(this.data, ID, {
                classes: [
                    initial ? 'initial-node' : '',
                    final ? 'final-node' : '',
                ],
                data: {
                    id: ID,
                    name,
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
        if (this.nodeID[source] && this.nodeID[target]) {
            // Creates the parent branches of edgeID
            if (!this.edgeID[symbol]) {
                this.edgeID[symbol] = {};
            }
            if (!this.edgeID[symbol][source]) {
                this.edgeID[symbol][source] = {};
            }

            // If the transition doesn't already exist
            if (!this.edgeID[symbol][source][target]) {
                // Create ID
                const ID = uuidv1();

                // Create edge name -> id mapping
                this.edgeID[symbol][source][target] = ID;

                // Gets IDs of the states
                const sourceID = this.nodeID[source];
                const targetID = this.nodeID[target];

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
            }
        }
    }

    /**
     * Gets a state by its name
     * @param name - the name of the state to get
     * @returns state object if found, null if not found
     */
    public getState(name: string): any | null {
        const ID = this.nodeID[name];
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

        // Edits edge ID lookup
        delete this.edgeID[currentSymbol][oldSourceName][currentTargetName];
        if (!this.edgeID[currentSymbol][newSourceName])
            this.edgeID[currentSymbol][newSourceName] = {};
        this.edgeID[currentSymbol][newSourceName][currentTargetName] = edgeID;
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
        delete this.edgeID[currentSymbol][currentSourceName][oldTargetName];
        this.edgeID[currentSymbol][currentSourceName][newTargetName] = edgeID;
    }

    /**
     * Gets a transition with symbol, source and target
     * @param symbol - the symbol of the transition
     * @param source - the source state
     * @param target - the target state
     * @returns the transition object if found, null if not found
     */
    public getTransition(symbol: string, source: string, target: string): object | null {
        // If edge branch exists, return transition object
        if (this.edgeID[symbol]) {
            if (this.edgeID[symbol][source]) {
                if (this.edgeID[symbol][source][target]) {
                    const edgeID = this.edgeID[symbol][source][target];
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
        if (this.nodeID[stateName]) {
            // Gets state ID
            const id = this.nodeID[stateName];

            // Delets nodeID entry
            delete this.nodeID[stateName];

            // Deletes data entry
            delete this.data[id];
        }
    }

    /**
     * Removes a transition
     * @param symbol - the symbol of the transition to remove
     * @param source - the source state of the transition to remove
     * @param target - the target state of the transition to remove
     */
    public removeTransition(symbol: string, source: string, target: string) {
        // If this transition exists
        if (this.edgeID[symbol][source][target]) {
            // Gets edge ID
            const id = this.edgeID[symbol][source][target];

            // Delete edgeID entry
            delete this.edgeID[symbol][source][target];

            // Deletes data entry
            delete this.data[id];
        }
    }

    /**
     * Gets the number of states
     * @returns the number of states
     */
    public getNumberOfStates(): number {
        return Object.keys(this.nodeID).length;
    }

    /**
     * Gets the number of transitions
     * @returns the number of transitions
     */
    public getNumberOfTransitions(): number {
        return Object.keys(this.edgeID).length;
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
        return this.initialStates;
    }

    /**
     * Gets a set of final states
     * @returns a Set of final state names
     */
    public getFinalStates(): Set<string> {
        return this.finalStates;
    }

    /**
     * Sets a state's initial property
     * @param stateName - the name of the state to change
     * @param initial - if true, set this state to initial, if false, stop it from being initial
     */
    public setInitialState(stateName: string, initial: boolean) {
        // Gets ID
        const id = this.nodeID[stateName];

        // Updates set and classes
        if (this.data[id].data.initial) {
            this.initialStates.delete(stateName);

            // Gets class index
            const classIndex = this.data[id].classes.indexOf('initial-node');
            this.data[id].classes.splice(classIndex, 1);
        } else {
            this.initialStates.add(stateName);
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
        const id = this.nodeID[stateName];

        // Updates set
        if (this.data[id].data.final) {
            this.finalStates.delete(stateName);

            // Gets class index
            const classIndex = this.data[id].classes.indexOf('final-node');
            this.data[id].classes.splice(classIndex, 1);
        } else {
            this.finalStates.add(stateName);
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
        const states = new Set(Object.keys(this.nodeID));

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
        // If there's no current states, add the initial ones
        this.configInit();

        // Remember the new set of current states
        const newCurrentConfigs: Set<AutomataConfig> = new Set();

        // Goes through each config
        for (const config of this.getCurrentConfigs()) {
            // Gets epsilon move target states
            let epsilonTargetStates = this.getTargetStates('__epsilon', config.state);

            // If there are none, change to empty array
            if (!epsilonTargetStates) {
                epsilonTargetStates = [];
            }

            // Apply this transition for each epsilon target state
            for (const targetState of epsilonTargetStates) {
                // Gets edge ID
                const edgeID = this.edgeID.__epsilon[config.state][targetState];

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
                    const edgeID = this.edgeID[inputSymbol][config.state][targetState];

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
        // Initial JSON
        let json: any = {
            modelName: this.getModelName(),
            name: this.name,
            edgeID: this.edgeID,
            nodeID: this.nodeID,
            data: {},
            initialStates: [...this.initialStates],
            finalStates : [...this.finalStates],
            folds: []
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
                }
            }
        }

        return window.btoa(JSON.stringify(json));
    }

    /**
     * Deserializes an automata
     * @param serializedAutomata - the serialization of the automata to instantiate
     * @returns a new Automata based on the passed serialization
     */
    public static deserialize(serializedAutomata: string): Automata {
        // Convert back to JSON
        const json: any = JSON.parse(window.atob(serializedAutomata));
        return new FiniteAutomata();
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
        if (this.edgeID[inputSymbol]) {
            if (this.edgeID[inputSymbol][sourceState]) {
                // Gets all the target states
                return Object.keys(this.edgeID[inputSymbol][sourceState]);
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
     */
    protected abstract configInit(): void;

    /**
     * Applies a transition from a source config to a destination config
     * @param srcConfig - the config to start from
     * @param edgeID - the ID of the transition to take
     * @param epsilonMove - true if it's an epsilon move, false if not
     * @returns the new config if this transition was successful, null if not
     */
    protected abstract applyTransition(srcConfig: AutomataConfig, edgeID: number, epsilonMove: boolean): AutomataConfig | null;
}
