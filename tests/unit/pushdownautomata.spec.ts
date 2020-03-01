import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';
import PushdownAutomata from "@/classes/PushdownAutomata";
import deserialize from '@/classes/AutomataDeserializer';
import AutomataOperations from "@/classes/AutomataOperations";

/**
 * Tests the abstract class FiniteAutomata.ts
 */
describe('PushdownAutomata.ts', () => {

    // Automata to test with
    let automata: PushdownAutomata;

    beforeEach(() => {
        automata = new PushdownAutomata();
    });

    it('can run a simple PDA and accept by final state', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('b', 'B', 'C', {
            input: 'A',
            output: ['B']
        });
        automata.setInput('ab');
        automata.step();
        automata.step();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('can run a simple PDA and accept by empty stack', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, false);
        automata.addTransition('a', 'A', 'B', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('b', 'B', 'C', {
            input: 'A',
            output: []
        });
        automata.acceptByEmptyStack = true;
        automata.setInput('ab');
        automata.step();
        automata.step();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('can run a simple PDA and reject', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addTransition('a', 'A', 'B', {
            input: 'ε',
            output: ['A']
        });
        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('can run a PDA with epsilon moves in it', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, false);
        automata.addState('D', 50, 50, false, false);
        automata.addState('E', 50, 50, false, false);
        automata.addState('F', 50, 50, false, true);
        automata.addState('G', 50, 50, false, false);

        automata.addTransition('ε', 'A', 'B', {
            input: 'ε',
            output: []
        });
        automata.addTransition('ε', 'A', 'C', {
            input: 'ε',
            output: []
        });
        automata.addTransition('a', 'B', 'D', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('a', 'D', 'F', {
            input: 'A',
            output: []
        });
        automata.addTransition('b', 'C', 'E', {
            input: 'ε',
            output: ['B']
        });
        automata.addTransition('b', 'E', 'G', {
            input: 'B',
            output: []
        });

        automata.setInput('aa');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);

        automata.setInput('bb');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('can do transitions that do not require a top stack symbol', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            input: "⊥",
            output: []
        });
        automata.addTransition('b', 'A', 'B', {
            input: "⊥",
            output: ['A']
        });
        automata.addTransition('a', 'B', 'B', {
            input: "⊥",
            output: []
        });
        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);

        automata.reset();
        automata.setInput('ba');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('can reject by empty stack', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addTransition('a', 'A', 'A', {
            input: 'ε',
            output: []
        });

        // Rejects by empty stack
        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('can accept by empty stack', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addTransition('a', 'A', 'A', {
            input: 'ε',
            output: []
        });

        // Accepts by empty stack
        automata.acceptByEmptyStack = true;
        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('can run a more advanced PDA', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'A', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('b', 'A', 'B', {
            input: 'A',
            output: []
        });
        automata.addTransition('b', 'B', 'B', {
            input: 'A',
            output: []
        });
        automata.addTransition('c', 'B', 'C', {
            input: "⊥",
            output: []
        });
        // Accepts by final state
        automata.setInput('aabbc');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);

        // Accepts by final state
        automata.reset();
        automata.setInput('aaaabbbbc');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);

        // Rejects by empty stack
        automata.reset();
        automata.setInput('aaaabbbb');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);

        // Rejects
        automata.reset();
        automata.setInput('aaaabbb');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);

        // Rejects
        automata.reset();
        automata.setInput('aaabbbbc');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('can simulate a deserialized automata', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('b', 'B', 'C', {
            input: 'A',
            output: ['B']
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

    it('can run union on PDAs', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);

        automata.addState('A2', 10, 10, true, false);
        automata.addState('B2', 50, 50, false, false);
        automata.addState('C2', 50, 50, false, true);

        automata.addTransition('a', 'A', 'B', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('b', 'B', 'C', {
            input: 'A',
            output: ['B']
        });

        automata.addTransition('x', 'A2', 'B2', {
            input: 'ε',
            output: ['X']
        });
        automata.addTransition('y', 'B2', 'C2', {
            input: 'X',
            output: ['Y']
        });

        AutomataOperations.union(automata, new Set([
            automata.getState("A").data.id,
            automata.getState("B").data.id,
            automata.getState("C").data.id,
        ]), new Set([
            automata.getState("A2").data.id,
            automata.getState("B2").data.id,
            automata.getState("C2").data.id,
        ]));

        [
            ['ab', Outcome.ACCEPT],
            ['xy', Outcome.ACCEPT],
            ['ax', Outcome.REJECT],
            ['by', Outcome.REJECT]
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });
    });

    it('can run concatenation on PDAs', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);

        automata.addState('A2', 10, 10, true, false);
        automata.addState('B2', 50, 50, false, false);
        automata.addState('C2', 50, 50, false, true);

        automata.addTransition('a', 'A', 'B', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('b', 'B', 'C', {
            input: 'A',
            output: ['B']
        });

        automata.addTransition('x', 'A2', 'B2', {
            input: 'ε',
            output: ['X']
        });
        automata.addTransition('y', 'B2', 'C2', {
            input: 'X',
            output: ['Y']
        });

        AutomataOperations.concatenation(automata, new Set([
            automata.getState("C").data.id
        ]), new Set([
            automata.getState("A2").data.id
        ]));

        [
            ['abxy', Outcome.ACCEPT],
            ['ab', Outcome.REJECT],
            ['xy', Outcome.REJECT],
            ['abx', Outcome.REJECT]
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1], "Failed " + testCase[0]);
        });
    });

    it('can run kleene star on PDAs', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            input: 'ε',
            output: ['A']
        });
        automata.addTransition('b', 'B', 'C', {
            input: 'A',
            output: ['B']
        });

        AutomataOperations.kleeneStar(automata, new Set([
            automata.getState("C").data.id
        ]), new Set([
            automata.getState("A").data.id
        ]));

        [
            ['abab', Outcome.ACCEPT],
            ['ababab', Outcome.ACCEPT],
            ['abb', Outcome.REJECT],
            ['aab', Outcome.REJECT]
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1], "Failed " + testCase[0]);
        });
    });
});
