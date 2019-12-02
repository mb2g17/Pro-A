/**
 * The tape of a Turing machine
 */
export default class TuringMachineTape {
    /** The tape */
    private tape: { [index: number]: string } = {};

    /**
     * Copy constructor
     * @param initialTape - the tape to copy from
     */
    public constructor(initialTape: TuringMachineTape);

    /**
     * Initialises a Turing machine tape
     * @param initialTape - the initial tape state, as a string
     * @constructor
     */
    public constructor(initialTape: string);

    public constructor(initialTape: any) {
        if (typeof initialTape === "string") {
            for (let i = 0; i < initialTape.length; i++)
                this.tape[i] = initialTape[i];
        } else {
            this.tape = Object.assign({}, initialTape.tape);
        }
    }

    /**
     * Writes to the tape
     * @param index - the index of the tape to write to
     * @param symbol - the symbol to write
     */
    public write(index: number, symbol: string) {
        this.tape[index] = symbol;
    }

    /**
     * Reads from the tape
     * @param index - the index of the tape to read from
     * @returns the symbol on the tape at that position, and undefined if empty
     */
    public read(index: number): string {
        return this.tape[index];
    }

    /**
     * The length of the tape, as defined by the written symbols
     */
    get length(): number {
        return Object.keys(this.tape).length;
    }

    /**
     * Checks if this tape is equal to another tape
     * @param tape - the other tape to compare
     */
    public equals(tape: TuringMachineTape): boolean {
        // Check if it's the same number of keys
        if (this.length !== tape.length)
            return false;

        // Checks every value's equivalence
        for (const key in Object.keys(this.tape)) {
            const numberKey: number = parseInt(key);
            if (this.read(numberKey) !== tape.read(numberKey))
                return false;
        }

        // Assertions are OK; they're the same
        return true;
    }
}