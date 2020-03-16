import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';
import AutomataOperations from "@/classes/AutomataOperations";
import deserialize from '@/classes/AutomataDeserializer';

/**
 * Tests the class FiniteAutomata.ts
 */
describe('FiniteAutomata.ts', () => {

    // Automata to test with
    let automata: FiniteAutomata;

    beforeEach(() => {
        automata = new FiniteAutomata();
    });

    it('computes one step of computation', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B');
        automata.setInput('aa');
        automata.step();
        automata.step();

        // Checks that the config input is now 'a'
        automata.getCurrentConfigs().forEach(config => {
            assert.equal(config.getInput(), 'a');
        });
    });

    it('simulates a finite automata and accepts an input', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B');
        automata.addTransition('a', 'B', 'A');
        automata.setInput('aaa');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('simulates a finite automata and rejects an input', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B');
        automata.addTransition('a', 'B', 'A');
        automata.setInput('aa');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    it('simulates a finite automata with only a state that is both initial and final', () => {
        automata.addState('A', 10, 10, true, true);
        automata.setInput('');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('simulates a finite automata with multiple final states', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addState('D', 50, 50, false, true);
        automata.addState('E', 50, 50, false, false);
        automata.addTransition('a', 'A', 'B');
        automata.addTransition('a', 'A', 'D');
        automata.addTransition('a', 'B', 'C');
        automata.addTransition('a', 'D', 'E');

        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);

        automata.reset();
        automata.setInput('aa');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('simulates non-determinism', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 60, 60, false, true);
        automata.addTransition('a', 'A', 'B');
        automata.addTransition('a', 'A', 'C');
        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('simulates an epsilon move', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('ε', 'A', 'B');
        automata.setInput('');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('simulates two epsilon moves', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('ε', 'A', 'B');
        automata.addTransition('ε', 'B', 'C');
        automata.setInput('');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('simulates automata with epsilon moves in it', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, false);
        automata.addState('D', 50, 50, false, true);
        automata.addState('E', 50, 50, false, false);
        automata.addTransition('ε', 'A', 'B');
        automata.addTransition('ε', 'A', 'C');
        automata.addTransition('a', 'B', 'D');
        automata.addTransition('b', 'C', 'E');

        automata.setInput('a');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);

        automata.setInput('b');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });

    /*it('can handle an epsilon loop', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addTransition('ε', 'A', 'B');
        automata.addTransition('ε', 'B', 'A');
        automata.setInput('');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });*/

    it('handles implicit union with multiple initial states and handles multiple final states', () => {
        automata.addState('s1', 0, 0, true, false);
        automata.addState('s2', 0, 0, false, true);
        automata.addState('s3', 0, 0, true, false);
        automata.addState('s4', 0, 0, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's3', 's4');

        [
            ['a', Outcome.ACCEPT],
            ['b', Outcome.ACCEPT]
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });
    });

    it('cannot simulate with incorrect symbols', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B');
        automata.addTransition('a', 'A', 'C');

        ['ab', 'abc', 'c'].forEach((input) => {
            automata.setInput(input);
            automata.simulate();
            assert.equal(automata.getOutcome(), Outcome.REJECT);
            automata.reset();
        });
    });

    it('has an outcome of UNDEFINED when simulation is not finished', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 60, 60, false, true);
        automata.addTransition('a', 'A', 'B');
        automata.addTransition('a', 'B', 'C');
        automata.setInput('aaaaaaaaaaa');
        automata.step();
        assert.equal(automata.getOutcome(), Outcome.UNDECIDED);
    });

    it('can union two smaller automata together', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 50, 50, true, false);
        automata.addState('s3', 60, 60, true, false);
        automata.addState('s4', 60, 60, false, true);
        automata.addState('s5', 60, 60, false, true);

        automata.addTransition('b', 's2', 's4');
        automata.addTransition('c', 's3', 's5');

        AutomataOperations.union(automata, new Set([
            automata.getState("s2").data.id,
            automata.getState("s4").data.id
        ]), new Set([
            automata.getState("s3").data.id,
            automata.getState("s5").data.id
        ]));

        automata.setInitialState('s6', false);
        automata.addTransition('a', 's1', 's6');

        [
            ['ab', Outcome.ACCEPT],
            ['ac', Outcome.ACCEPT],
            ['b', Outcome.REJECT],
            ['c', Outcome.REJECT]
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });
    });

    it('can concatenate two smaller automata together', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 50, 50, false, true);
        automata.addState('s3', 60, 60, true, false);
        automata.addState('s4', 60, 60, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's3', 's4');

        // Tests automata before
        [
            ['a', Outcome.ACCEPT],
            ['b', Outcome.ACCEPT],
            ['ab', Outcome.REJECT]
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });

        AutomataOperations.concatenation(automata, new Set([
            automata.getState("s2").data.id
        ]), new Set([
            automata.getState("s3").data.id
        ]));

        // Tests automata after
        [
            ['a', Outcome.REJECT],
            ['b', Outcome.REJECT],
            ['ab', Outcome.ACCEPT],
            ['ba', Outcome.REJECT],
            ['abb', Outcome.REJECT],
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });
    });

    it('can kleene star an automata', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 50, 50, false, false);
        automata.addState('s3', 60, 60, false, true);
        automata.addState('s4', 60, 60, true, false);
        automata.addState('s5', 60, 60, false, false);
        automata.addState('s6', 60, 60, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's2', 's3');
        automata.addTransition('c', 's4', 's5');
        automata.addTransition('d', 's5', 's6');

        // Tests automata before
        [
            ['a', Outcome.REJECT],
            ['d', Outcome.REJECT],
            ['ab', Outcome.ACCEPT],
            ['cd', Outcome.ACCEPT],
            ['abcd', Outcome.REJECT],
            ['cdcdab', Outcome.REJECT],
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });

        AutomataOperations.kleeneStar(automata, new Set([
            automata.getState("s3").data.id,
            automata.getState("s6").data.id,
        ]), new Set([
            automata.getState("s1").data.id,
            automata.getState("s4").data.id,
        ]));

        // Tests automata after
        [
            ['a', Outcome.REJECT],
            ['d', Outcome.REJECT],
            ['ab', Outcome.ACCEPT],
            ['cd', Outcome.ACCEPT],
            ['abcd', Outcome.ACCEPT],
            ['cdcdab', Outcome.ACCEPT],
            ['abcdabcdcdababcdabcd', Outcome.ACCEPT],
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });
    });

    it('can cross product (intersect) an automata', () => {
        automata.addState("s1", 10, 10, true, false);
        automata.addState("s2", 10, 10, false, true);
        automata.addState("s3", 10, 10, true, false);
        automata.addState("s4", 10, 10, false, true);
        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's1', 's2');
        automata.addTransition('a', 's3', 's4');
        automata.addTransition('c', 's3', 's4');

        // Product
        AutomataOperations.product(automata, automata.getMachineWithTransitions('s1'), automata.getMachineWithTransitions('s3'));

        // Tests automata
        [
            ['b', Outcome.REJECT],
            ['c', Outcome.REJECT],
            ['a', Outcome.ACCEPT],
        ].forEach(testCase => {
            automata.setInput(testCase[0]);
            automata.simulate();
            assert.equal(automata.getOutcome(), testCase[1]);
        });
    });

    it('can simulate a deserialized automata', () => {
        automata.addState("s1", 10, 10, true, false);
        automata.addState("s2", 10, 10, false, true);
        automata.addTransition('a', 's1', 's2');

        // Serializes the string
        const serialization: string = automata.serialize();

        // Deserializes it
        const newAutomata: Automata = deserialize(serialization);

        // Tests automata
        [
            ['a', Outcome.ACCEPT],
            ['aa', Outcome.REJECT],
            ['b', Outcome.REJECT],
        ].forEach(testCase => {
            newAutomata.setInput(testCase[0]);
            newAutomata.simulate();
            assert.equal(newAutomata.getOutcome(), testCase[1]);
        });
    });
});
