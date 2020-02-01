import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';

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
});
