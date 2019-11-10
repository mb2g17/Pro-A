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

    it('recognises when there isn\'t a state', () => {
        automata.addState('A', 10, 10, false, false);
        assert.isNull(automata.getState('B'));
    });

    it('adds an initial state', () => {
        automata.addState('A', 10, 10, true, false);
        const state: any = automata.getState('A');
        if (state !== null) {
            assert.isTrue(state.data.initial);
        }
    });

    it('can get a set of initial states', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 10, 10, true, false);
        automata.addState('C', 10, 10, false, true);
        automata.addState('D', 10, 10, false, true);
        const initialStates = automata.getInitialStates();
        assert.isTrue(initialStates.has('A') &&
                    initialStates.has('B') &&
                    !initialStates.has('C') &&
                    !initialStates.has('D'));
    });

    it('can get a set of final states', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 10, 10, true, false);
        automata.addState('C', 10, 10, true, true);
        automata.addState('D', 10, 10, true, true);
        const initialStates = automata.getFinalStates();
        assert.isTrue(!initialStates.has('A') &&
            !initialStates.has('B') &&
            initialStates.has('C') &&
            initialStates.has('D'));
    });

    it('adds a final state', () => {
        automata.addState('A', 10, 10, false, true);
        const state: any = automata.getState('A');
        if (state !== null) {
            assert.isTrue(state.data.final);
        }
    });

    it('cannot add two of the same state', () => {
        automata.addState('A', 10, 10, false, false);
        automata.addState('A', 50, 50, false, false);
        assert.equal(automata.getNumberOfStates(), 1);
    });

    it('sets a state to initial', () => {
        automata.addState('A', 10, 10, false, false);
        automata.setInitialState('A', true);
        assert.isTrue(automata.getState('A').data.initial);
        assert.isTrue(automata.getState('A').classes.includes("initial-node"));
    });

    it('sets a state to final', () => {
        automata.addState('A', 10, 10, false, false);
        automata.setFinalState('A', true);
        assert.isTrue(automata.getState('A').data.final);
        assert.isTrue(automata.getState('A').classes.includes("final-node"));
    });

    it('unsets a state from initial', () => {
        automata.addState('A', 10, 10, true, true);
        automata.setInitialState('A', false);
        assert.isFalse(automata.getState('A').data.initial);
        assert.isFalse(automata.getState('A').classes.includes("initial-node"));
    });

    it('unsets a state from final', () => {
        automata.addState('A', 10, 10, true, true);
        automata.setFinalState('A', false);
        assert.isFalse(automata.getState('A').data.final);
        assert.isFalse(automata.getState('A').classes.includes("final-node"));
    });

    it('removes a state', () => {
        automata.addState('A', 10, 10, true, true);
        automata.removeState('A');
        assert.isNull(automata.getState('A'));
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
        assert.equal(automata.getNumberOfTransitions(), 1);
    });

    it('cannot add transitions to states that do not exist', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addTransition('a', 'A', 'C');
        assert.equal(automata.getNumberOfTransitions(), 0);
    });

    it('removes a transition', () => {
        automata.addState('A', 10, 10, true, true);
        automata.addTransition('a', 'A', 'A');
        automata.removeTransition('a', 'A', 'A');
        assert.isNull(automata.getTransition('a', 'A', 'A'));
    });
});
