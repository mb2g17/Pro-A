import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';
import AutomataOperations from "@/classes/AutomataOperations";

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
        automata.addTransition('__epsilon', 'A', 'B');
        automata.setInput('');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('simulates two epsilon moves', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('__epsilon', 'A', 'B');
        automata.addTransition('__epsilon', 'B', 'C');
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
        automata.addTransition('__epsilon', 'A', 'B');
        automata.addTransition('__epsilon', 'A', 'C');
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
        automata.addTransition('__epsilon', 'A', 'B');
        automata.addTransition('__epsilon', 'B', 'A');
        automata.setInput('');
        automata.simulate();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });*/

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
});
