import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';
import PushdownAutomata from "@/classes/PushdownAutomata";
import deserialize from '@/classes/AutomataDeserializer';

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
            input: null,
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
            input: null,
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
            input: null,
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

        automata.addTransition('__epsilon', 'A', 'B', {
            input: null,
            output: []
        });
        automata.addTransition('__epsilon', 'A', 'C', {
            input: null,
            output: []
        });
        automata.addTransition('a', 'B', 'D', {
            input: null,
            output: ['A']
        });
        automata.addTransition('a', 'D', 'F', {
            input: 'A',
            output: []
        });
        automata.addTransition('b', 'C', 'E', {
            input: null,
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
            input: "__empty",
            output: []
        });
        automata.addTransition('b', 'A', 'B', {
            input: "__empty",
            output: ['A']
        });
        automata.addTransition('a', 'B', 'B', {
            input: "__empty",
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
            input: null,
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
            input: null,
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
            input: null,
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
            input: "__empty",
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
            input: null,
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
});
