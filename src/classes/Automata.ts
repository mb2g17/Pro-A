import uuidv1 from "uuid/v1";

/**
 * Abstract class of an automata such as FA, PDA or TM
 */
export default abstract class Automata {
    /**
     * The input string stored in the automata
     */
    protected inputString: string = "";

    /**
     * The Cytoscape data that stores nodes and edges
     */
    protected data: object[] = [];

    /**
     * Sets the input string stored in the automata
     * @param inputString - the new input string to put into the automata
     */
    setInput(inputString: string) {
        this.inputString = inputString;
    }

    /**
     * Clones and returns the data to put into Cytoscape
     * @returns the object to insert into cytoscape
     */
    getData(): object[] {
        return this.data;
    }

    /**
     * Adds a state to the automata
     * @param name - the name of the automata
     * @param x - the X coordinate of the automata
     * @param y - the Y coordinate of the automata
     */
    addState(name: string, x: number, y: number) {
        this.data.push({
            data: {id: name},
            position: {x, y}
        });
    }

    /**
     * Adds a transition
     * @param symbol - the symbol of the transition
     * @param source - name of the state to go from
     * @param target - name of the state to go to
     */
    addTransition(symbol: string, source: string, target: string) {
        this.data.push({
            data: {
                id: uuidv1(),
                source, target,
                label: symbol
            }
        });
    }

    /**
     * Resets the animation of this automata
     */
    abstract reset(): void;

    /**
     * Reads the next input symbol and travels to the next state
     */
    abstract step(): void;

    /**
     * Returns the data structure the automata is using
     * @returns null for FA, stack for PDA, tape for TM
     */
    abstract getDataStructure(): object | null;
}