import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';

/**
 * Tests the abstract class Automata.ts
 */
describe('Automata.ts', () => {

    // Automata to test with
    let automata: Automata;

    beforeEach(() => {
        automata = new FiniteAutomata();
    });

    // --------------------------------
    // --* STATES
    // --------------------------------
    it('adds a state', () => {
        automata.addState('A', 10, 10, false, false);
        assert.isNotNull(automata.getState('A'));
    });

    it('adds an initial state', () => {
        automata.addState('A', 10, 10, true, false);
        const state: any = automata.getState('A');
        if (state !== null) {
            assert.isTrue(state.initial);
        }
    });

    it('adds a final state', () => {
        automata.addState('A', 10, 10, false, true);
        const state: any = automata.getState('A');
        if (state !== null) {
            assert.isTrue(state.final);
        }
    });

    it('cannot add two of the same state', () => {
        automata.addState('A', 10, 10, false, false);
        automata.addState('A', 50, 50, false, false);
        assert.equal(automata.getData().length, 1);
    });

    // --------------------------------
    // --* TRANSITIONS
    // --------------------------------
    it('adds a transition', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B');
        assert.isNotNull(automata.getTransition('a', 'A', 'B'));
    });

    it('cannot add two of the same transition', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B');
        automata.addTransition('a', 'A', 'B');
        assert.equal(automata.getData().length, 3);
    });

    it('cannot add transitions to states that do not exist', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addTransition('a', 'A', 'C');
        assert.equal(automata.getData().length, 1);
    });
});
