import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';
import PushdownAutomata from "@/classes/PushdownAutomata";
import TuringMachine from "@/classes/TuringMachine";
import TuringMachineTape from "@/classes/TuringMachineTape";
import TuringMachineConfig from "@/classes/TuringMachineConfig";
import deserialize from '@/classes/AutomataDeserializer';

/**
 * Tests the class TuringMachine.ts
 */
describe('TuringMachine.ts', () => {

    // Automata to test with
    let automata: TuringMachine;

    beforeEach(() => {
        automata = new TuringMachine();
    });

    it('can run a simple TM and accept by final state', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.addTransition('b', 'B', 'C', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.setInput('ab');
        automata.step();
        automata.step();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('can run a simple TM and reject', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            writeTapeSymbol: 'b',
            direction: 'R'
        });
        automata.addTransition('b', 'B', 'C', {
            writeTapeSymbol: 'b',
            direction: 'L'
        });
        automata.addTransition('b', 'C', 'B', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.setInput('aa');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('can run a TM with epsilon moves in it', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, false);
        automata.addState('D', 50, 50, false, false);
        automata.addState('E', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.addTransition('b', 'A', 'B', {
            writeTapeSymbol: 'b',
            direction: 'R'
        });
        automata.addTransition('__epsilon', 'B', 'C', {
            writeTapeSymbol: 'a',
            direction: 'L'
        });
        automata.addTransition('a', 'C', 'D', {
            writeTapeSymbol: 'A',
            direction: 'R'
        });
        automata.addTransition('a', 'D', 'E', {
            writeTapeSymbol: 'A',
            direction: 'R'
        });

        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
        automata.reset();

        automata.setInput('b');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('can add an initial state if there are no current states', () => {
        // Adds states
        automata.addState("A", 10, 10, true, false);
        automata.addState("B", 20, 10, true, false);
        automata.addState("C", 30, 10, false, false);

        // Asserts that the automata does not have any current states
        assert.equal(automata.getCurrentConfigs().size, 0);

        // Adds current states from initial states
        automata["configInit"]();

        // Asserts that the automata has the same number of current states as initial states
        assert.equal(automata.getCurrentConfigs().size, 2);
    });

    it('can apply a transition from one configuration to another', () => {
        // Adds states
        automata.addState("A", 10, 10, true, false);
        automata.addState("B", 20, 10, true, false);

        // Adds transition
        automata.addTransition("a", "A", "B", {
            writeTapeSymbol: 'b',
            direction: 'R'
        });

        // Sets up initial config
        const srcConfig: TuringMachineConfig = new TuringMachineConfig("A", new TuringMachineTape("aab"), 0);

        // Applies the transition and gets the destination configuration
        const destConfig: TuringMachineConfig | null = automata["applyTransition"](srcConfig, automata["cacheEdgeID"]['a']["A"]["B"], false);

        // Assert that the transition actually worked
        assert.isNotNull(destConfig);

        // Asserts that we're on B, the tape has changed and the tape index has moved
        assert.equal(destConfig!.state, "B");
        assert.isTrue(destConfig!.tape.equals(new TuringMachineTape("bab")));
        assert.equal(destConfig!.index, 1);
    });

    it('can run the TM for the language a^n b^n c^n', () => {
        // Adds states
        automata.addState("q0", 10, 10, true, false);
        automata.addState("q1", 20, 10, false, false);
        automata.addState("q2", 20, 10, false, false);
        automata.addState("q3", 20, 10, false, false);
        automata.addState("q4", 20, 10, false, false);
        automata.addState("qf", 20, 10, false, true);

        // Adds transition
        automata.addTransition("a", "q0", "q1", {
            writeTapeSymbol: 'X',
            direction: 'R'
        });
        automata.addTransition("a", "q1", "q1", {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.addTransition("Y", "q1", "q1", {
            writeTapeSymbol: 'Y',
            direction: 'R'
        });
        automata.addTransition("b", "q1", "q2", {
            writeTapeSymbol: 'Y',
            direction: 'R'
        });
        automata.addTransition("b", "q2", "q2", {
            writeTapeSymbol: 'b',
            direction: 'R'
        });
        automata.addTransition("Z", "q2", "q2", {
            writeTapeSymbol: 'Z',
            direction: 'R'
        });
        automata.addTransition("c", "q2", "q3", {
            writeTapeSymbol: 'Z',
            direction: 'L'
        });
        automata.addTransition("Z", "q3", "q3", {
            writeTapeSymbol: 'Z',
            direction: 'L'
        });
        automata.addTransition("b", "q3", "q3", {
            writeTapeSymbol: 'b',
            direction: 'L'
        });
        automata.addTransition("Y", "q3", "q3", {
            writeTapeSymbol: 'Y',
            direction: 'L'
        });
        automata.addTransition("a", "q3", "q3", {
            writeTapeSymbol: 'a',
            direction: 'L'
        });
        automata.addTransition("X", "q3", "q0", {
            writeTapeSymbol: 'X',
            direction: 'R'
        });
        automata.addTransition("Y", "q0", "q4", {
            writeTapeSymbol: 'Y',
            direction: 'R'
        });
        automata.addTransition("Y", "q4", "q4", {
            writeTapeSymbol: 'Y',
            direction: 'R'
        });
        automata.addTransition("Z", "q4", "q4", {
            writeTapeSymbol: 'Z',
            direction: 'R'
        });
        automata.addTransition("__empty", "q4", "qf", {
            writeTapeSymbol: '__empty',
            direction: 'L'
        });

        // Asserts a few accepting cases
        for (const input of ["abc", "aabbcc", "aaabbbccc", "aaaaaaaaabbbbbbbbbccccccccc"]) {
            automata.reset();
            automata.setInput(input);
            automata.simulate();
            assert.equal(automata.getOutcome(), Outcome.ACCEPT);
        }

        // Asserts a few failing cases
        for (const input of ["aabc", "abbc", "abcc", "d", "a", "aaaaabbbbccccc"]) {
            automata.reset();
            automata.setInput(input);
            automata.simulate();
            assert.equal(automata.getOutcome(), Outcome.REJECT);
        }
    });

    it('can simulate a deserialized automata', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.addTransition('b', 'B', 'C', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });

        // Serializes the string
        const serialization: string = automata.serialize();

        // Deserializes it
        const newAutomata: Automata = deserialize(serialization);

        // Tests automata
        [
            ['ab', Outcome.ACCEPT],
            ['a', Outcome.REJECT],
            ['b', Outcome.REJECT],
        ].forEach(testCase => {
            newAutomata.setInput(testCase[0]);
            newAutomata.simulate();
            assert.equal(newAutomata.getOutcome(), testCase[1]);
        });
    });
});
