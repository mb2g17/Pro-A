import uuidv1 from 'uuid/v1';
import { Outcome } from '@/classes/Outcome';
import uuid from "uuid";
import Vue from "vue";

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
     * Clones and returns the data to put into Cytoscape
     * @returns the object to insert into cytoscape
     */
    public getData(): object {
        return this.data;
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
            if (initial)
                this.initialStates.add(name);
            if (final)
                this.finalStates.add(name);

            // Creates ID
            let ID = uuidv1();

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
                    initial, final
                },
                position: {x, y}
            });
        }
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
            if (!this.edgeID[symbol])
                this.edgeID[symbol] = {};
            if (!this.edgeID[symbol][source])
                this.edgeID[symbol][source] = {};

            // If the transition doesn't already exist
            if (!this.edgeID[symbol][source][target]) {
                // Create ID
                let ID = uuidv1();

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
                        source: sourceID,
                        target: targetID,
                        sourceName: source,
                        targetName: target,
                        type: 'edge'
                    },
                });

                // Saves payload stuff too
                this.addTransitionExtra(symbol, source, target, payload);
            }
        }
    }

    /**
     * Type-specific behaviour for adding a transition
     * @param symbol - the symbol of the transition
     * @param source - name of the state to go from
     * @param target - name of the state to go to
     * @param payload - the information for this specific type of transition
     */
    public abstract addTransitionExtra(symbol: string, source: string, target: string, payload: any): void;

    /**
     * Gets a state with an ID
     * @param name - the name of the state to get
     * @returns state object if found, null if not found
     */
    public getState(name: string): any | null {
        let ID = this.nodeID[name];
        return !!this.data[ID] ? this.data[ID] : null;
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
        if (this.edgeID[symbol])
            if (this.edgeID[symbol][source])
                if (this.edgeID[symbol][source][target]) {
                    let edgeID = this.edgeID[symbol][source][target];
                    return this.data[edgeID];
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
        do {
            this.step();
        } while (this.inputString.length > 0)
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
            const classIndex = this.data[id].classes.indexOf("initial-node");
            this.data[id].classes.splice(classIndex, 1);
        }
        else {
            this.initialStates.add(stateName);
            this.data[id].classes.push("initial-node");
        }

        // Sets initial
        Vue.set(this.data[id].data, "initial", initial);
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
        if (this.data[id].data.final){
            this.finalStates.delete(stateName);

            // Gets class index
            const classIndex = this.data[id].classes.indexOf("final-node");
            this.data[id].classes.splice(classIndex, 1);
        }
        else{
            this.finalStates.add(stateName);
            this.data[id].classes.push("final-node");
        }

        // Sets final
        Vue.set(this.data[id].data, "final", final);
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
        while (states.has("s" + stateNameNumber))
            stateNameNumber++;

        return "s" + stateNameNumber;
    }

    /**
     * Resets the animation of this automata
     */
    public abstract reset(): void;

    /**
     * Reads the next input symbol and travels to the next state
     */
    public abstract step(): void;

    /**
     * Returns the data structure the automata is using
     * @returns null for FA, stack for PDA, tape for TM
     */
    public abstract getDataStructure(): any | null;

    /**
     * The outcome of the automata: undecided, accept, reject
     */
    public abstract getOutcome(): Outcome;
}
