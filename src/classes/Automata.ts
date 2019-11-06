import uuidv1 from 'uuid/v1';
import { Outcome } from '@/classes/Outcome';

/**
 * Abstract class of an automata such as FA, PDA or TM
 */
export default abstract class Automata {
    /**
     * The input string stored in the automata
     */
    protected inputString: string = '';

    /**
     * The Cytoscape data that stores nodes and edges
     */
    protected data: any[] = [];

    /**
     * Sets the input string stored in the automata
     * @param inputString - the new input string to put into the automata
     */
    public setInput(inputString: string) {
        this.inputString = inputString;
    }

    /**
     * Clones and returns the data to put into Cytoscape
     * @returns the object to insert into cytoscape
     */
    public getData(): object[] {
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
        this.data.push({
            type: 'node',
            classes: [
                initial ? 'initial-node' : '',
                final ? 'final-node' : '',
            ],
            data: {id: name},
            position: {x, y},
            initial, final,
        });
    }

    /**
     * Adds a transition
     * @param symbol - the symbol of the transition
     * @param source - name of the state to go from
     * @param target - name of the state to go to
     */
    public addTransition(symbol: string, source: string, target: string) {
        this.data.push({
            type: 'edge',
            data: {
                id: uuidv1(),
                label: symbol,
                source, target,
            },
        });
    }

    /**
     * Simulates the automata with an input string in it
     */
    public simulate() {
        while (this.inputString.length > 0) {
            this.step();
        }
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
    public abstract getDataStructure(): object | null;

    /**
     * The outcome of the automata: undecided, accept, reject
     */
    public abstract get outcome(): Outcome;
}
