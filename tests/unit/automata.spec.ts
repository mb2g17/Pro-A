import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import deserialize from '@/classes/AutomataDeserializer';

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

    // --------------------------------
    // --* MISC
    // --------------------------------
    it('can identify target states given an input symbol and a source state', () => {
        // Adds states
        automata.addState("A", 10, 10, true, false);
        automata.addState("B", 20, 10, true, false);
        automata.addState("C", 30, 10, false, false);

        // Asserts that the automata has no target states
        assert.isNull(automata["getTargetStates"]("a", "A"));

        // Adds transitions
        automata.addTransition("a", "A", "B");
        automata.addTransition("a", "A", "C");

        // Gets target states
        const targetStates = automata["getTargetStates"]("a", "A");

        // Asserts that there are target states and that there are two of them
        assert.isNotNull(targetStates);
        assert.equal(targetStates!.length, 2);
    });

    it('can deserialize a serialized automata', () => {
        automata.addState("s1", 10, 10, true, false);
        automata.addState("s2", 10, 10, false, true);
        automata.addTransition('a', 's1', "s2");

        // Serializes the string
        const serialization: string = automata.serialize();

        // Deserializes it
        const newAutomata: Automata = deserialize(serialization);

        // Checks states and transitions
        assert.isNotNull(newAutomata.getState("s1"));
        assert.isNotNull(newAutomata.getState("s2"));
        assert.isNotNull(newAutomata.getTransition("a", "s1", "s2"));
    });

    it('can search for states', () => {
        automata.addState("s1", 10, 10, true, false);
        automata.addState("s2", 10, 10, false, false);
        automata.addState("s3", 10, 10, false, false);
        automata.addState("s34", 10, 10, false, false);
        automata.addState("s4", 10, 10, false, false);

        // Finds state
        const foundStates: Set<string> = automata.findStates("s3");

        assert.isFalse(foundStates.has(automata.getState("s1").data.id), "s1 is in the search results for 's3'");
        assert.isFalse(foundStates.has(automata.getState("s2").data.id), "s2 is in the search results for 's3'");
        assert.isTrue(foundStates.has(automata.getState("s3").data.id), "s3 is not in the search results for 's3'");
        assert.isTrue(foundStates.has(automata.getState("s34").data.id), "s34 is not in the search results for 's3'");
        assert.isFalse(foundStates.has(automata.getState("s4").data.id), "s4 is in the search results for 's3'");
    });
});
