import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import deserialize from '@/classes/AutomataDeserializer';

/**
 * Tests the machine cache of the Automata class
 */
describe('Automata Machine Cache', () => {

    // Automata to test with
    let automata: Automata;

    beforeEach(() => {
        automata = new FiniteAutomata();
    });

    // ---------------------------------------------
    // --* ADDING STATES & TRANSITIONS
    // ---------------------------------------------
    it('can identify a machine of one straight line automata', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        assert.isTrue(automata.getMachine('s1').has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s2').has('s1'), "s2 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s3').has('s1'), "s3 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s4').has('s1'), "s4 is not in the machine 's1'");

        const reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s1'), "s1 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s2'), "s2 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s3'), "s3 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s4'), "s4 is not reachable from 's1'");

        const reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isTrue(reachableFinalStates.has('s4'), "Final state s4 is not reachable from 's1'");
    });

    it('can identify two machines in one automata, both straight lines', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, true);

        automata.addState('t1', 10, 10, true, false);
        automata.addState('t2', 10, 10, false, false);
        automata.addState('t3', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 't1', 't2');
        automata.addTransition('a', 't2', 't3');

        assert.isTrue(automata.getMachine('s1').has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s2').has('s1'), "s2 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s3').has('s1'), "s3 is not in the machine 's1'");

        assert.isTrue(automata.getMachine('t1').has('t1'), "t1 is not in the machine 't1'");
        assert.isTrue(automata.getMachine('t2').has('t1'), "t2 is not in the machine 't1'");
        assert.isTrue(automata.getMachine('t3').has('t1'), "t3 is not in the machine 't1'");

        let reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s1'), "s1 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s2'), "s2 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s3'), "s3 is not reachable from 's1'");

        reachableStates = automata.getReachableStates('t1');
        assert.isTrue(reachableStates.has('t1'), "t1 is not reachable from 't1'");
        assert.isTrue(reachableStates.has('t2'), "t2 is not reachable from 't1'");
        assert.isTrue(reachableStates.has('t3'), "t3 is not reachable from 't1'");

        let reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isTrue(reachableFinalStates.has('s3'), "Final state s3 is not reachable from 's1'");

        reachableFinalStates = automata.getReachableFinalStates('t1');
        assert.isTrue(reachableFinalStates.has('t3'), "Final state t3 is not reachable from 't1'");
    });

    it('can identify a state being in two machines at once', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, true, false);
        automata.addState('s3', 10, 10, false, true);

        automata.addTransition('a', 's1', 's3');
        automata.addTransition('a', 's2', 's3');

        assert.isTrue(automata.getMachine('s3').has('s1'), "s3 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s3').has('s2'), "s3 is not in the machine 's2'");

        const reachableStates1 = automata.getReachableStates('s1');
        const reachableStates2 = automata.getReachableStates('s2');
        assert.isTrue(reachableStates1.has('s3'), "s3 is not in the machine 's1'");
        assert.isTrue(reachableStates2.has('s3'), "s3 is not in the machine 's2'");

        const reachableFinalStates1 = automata.getReachableFinalStates('s1');
        const reachableFinalStates2 = automata.getReachableFinalStates('s2');
        assert.isTrue(reachableFinalStates1.has('s3'), "Final state s3 is not in the machine 's1'");
        assert.isTrue(reachableFinalStates2.has('s3'), "Final state s3 is not in the machine 's2'");
    });

    // ---------------------------------------------
    // --* REMOVING STATES
    // ---------------------------------------------
    it('can identify a state no longer being in a machine after previous states are deleted', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        automata.removeState('s3');

        assert.isTrue(automata.getMachine('s1').has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s2').has('s1'), "s2 is not in the machine 's1'");
        assert.isFalse(automata.getMachine('s4').has('s1'), "s4 is in the machine 's1'");
        assert.isTrue(automata.getMachine('s4').size === 0, "s4 has some machine associated to it");

        const reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s2'), "s2 is not in the machine 's1'");
        assert.isFalse(reachableStates.has('s4'), "s4 is in the machine 's1'");

        const reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isFalse(reachableFinalStates.has('s4'), "Final state s4 is in the machine 's1'");
    });

    it('can identify one machine out of two when a state linking the rest of the machine to an initial state is deleted', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, true, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, false);
        automata.addState('s5', 10, 10, false, false);
        automata.addState('s6', 10, 10, false, true);

        automata.addTransition('a', 's1', 's3');
        automata.addTransition('a', 's2', 's4');
        automata.addTransition('a', 's3', 's5');
        automata.addTransition('a', 's4', 's5');
        automata.addTransition('a', 's5', 's6');

        automata.removeState('s4');

        assert.isTrue(automata.getMachine('s5').has('s1'), "s5 is not in the machine 's1'");
        assert.isFalse(automata.getMachine('s5').has('s2'), "s5 is still in the machine 's2'");
        assert.isTrue(automata.getMachine('s6').has('s1'), "s6 is not in the machine 's1'");
        assert.isFalse(automata.getMachine('s6').has('s2'), "s6 is still in the machine 's2'");

        let reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s3'), "s3 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s5'), "s5 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s6'), "s6 is not in the machine 's1'");

        reachableStates = automata.getReachableStates('s2');
        assert.isFalse(reachableStates.has('s3'), "s3 is still in the machine 's2'");
        assert.isFalse(reachableStates.has('s5'), "s5 is still in the machine 's2'");
        assert.isFalse(reachableStates.has('s6'), "s6 is still in the machine 's2'");

        let reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isTrue(reachableFinalStates.has('s6'), "Final state s6 is not in the machine 's1'");

        reachableFinalStates = automata.getReachableFinalStates('s2');
        assert.isFalse(reachableFinalStates.has('s6'), "Final state s6 is still in the machine 's2'");
    });

    // ---------------------------------------------
    // --* REMOVING TRANSITIONS
    // ---------------------------------------------
    it('can identify a state no longer being in a machine if the only transition linking it is removed', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        automata.removeTransition('a', 's2', 's3');

        assert.isFalse(automata.getMachine('s3').has('s1'), "s3 is still in the machine 's1'");
        assert.isFalse(automata.getMachine('s4').has('s1'), "s4 is still in the machine 's1'");

        const reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s2'), "s2 is not in the machine 's1'");
        assert.isFalse(reachableStates.has('s3'), "s3 is still in the machine 's2'");
        assert.isFalse(reachableStates.has('s4'), "s4 is still in the machine 's2'");

        const reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isFalse(reachableFinalStates.has('s4'), "Final state s4 is still in the machine 's1'");
    });

    it('can identify one machine out of two when a transition linking it is deleted', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, true, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, false);
        automata.addState('s5', 10, 10, false, false);
        automata.addState('s6', 10, 10, false, true);

        automata.addTransition('a', 's1', 's3');
        automata.addTransition('a', 's2', 's4');
        automata.addTransition('a', 's3', 's5');
        automata.addTransition('a', 's4', 's5');
        automata.addTransition('a', 's5', 's6');

        automata.removeTransition('a', 's4', 's5');

        assert.isTrue(automata.getMachine('s5').has('s1'), "s5 is not in the machine 's1'");
        assert.isFalse(automata.getMachine('s5').has('s2'), "s5 is still in the machine 's2'");
        assert.isTrue(automata.getMachine('s6').has('s1'), "s6 is not in the machine 's1'");
        assert.isFalse(automata.getMachine('s6').has('s2'), "s6 is still in the machine 's2'");

        let reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s3'), "s3 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s5'), "s5 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s6'), "s6 is not in the machine 's1'");

        reachableStates = automata.getReachableStates('s2');
        assert.isTrue(reachableStates.has('s4'), "s4 is not in the machine 's2'");
        assert.isFalse(reachableStates.has('s3'), "s3 is still in the machine 's2'");
        assert.isFalse(reachableStates.has('s5'), "s5 is still in the machine 's2'");
        assert.isFalse(reachableStates.has('s6'), "s6 is still in the machine 's2'");

        let reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isTrue(reachableFinalStates.has('s6'), "Final state s6 is not in the machine 's1'");

        reachableFinalStates = automata.getReachableFinalStates('s2');
        assert.isFalse(reachableFinalStates.has('s6'), "Final state s6 is still in the machine 's2'");
    });

    // ---------------------------------------------
    // --* MOVE TRANSITIONS
    // ---------------------------------------------
    it('can identify the correct machine after moving a transition to a different initial state', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, true, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, false);

        automata.addTransition('a', 's1', 's3');

        automata.changeSourceOfTransition(
            automata.getTransition('a', 's1', 's3').data.id,
            automata.getState('s2').data.id);

        assert.isFalse(automata.getMachine('s3').has('s1'), "s3 is still in the machine 's1'");
        assert.isTrue(automata.getMachine('s3').has('s2'), "s3 is not in the machine 's2'");

        let reachableStates = automata.getReachableStates('s1');
        assert.isFalse(reachableStates.has('s3'), "s3 is still in the machine 's1'");

        reachableStates = automata.getReachableStates('s2');
        assert.isTrue(reachableStates.has('s3'), "s3 is not in the machine 's2'");
    });

    it('can identify the correct machine after moving a transition to a different target state', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, false);

        automata.addTransition('a', 's1', 's3');

        automata.changeTargetOfTransition(
            automata.getTransition('a', 's1', 's3').data.id,
            automata.getState('s4').data.id);

        assert.isFalse(automata.getMachine('s3').has('s1'), "s3 is still in the machine 's1'");
        assert.isTrue(automata.getMachine('s4').has('s1'), "s4 is not in the machine 's1'");

        const reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s4'), "s4 is not in the machine 's1'");
        assert.isFalse(reachableStates.has('s3'), "s3 is still in the machine 's1'");
    });

    // ---------------------------------------------
    // --* TOGGLING INITIAL STATE
    // ---------------------------------------------
    it('can no longer identify the machine if the initial state has been set to no longer be initial', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        automata.setInitialState('s1', false);

        assert.isFalse(automata.getMachine('s1').has('s1'), "s1 is still in the machine 's1'");
        assert.isFalse(automata.getMachine('s2').has('s1'), "s2 is still in the machine 's1'");
        assert.isFalse(automata.getMachine('s3').has('s1'), "s3 is still in the machine 's1'");
        assert.isFalse(automata.getMachine('s4').has('s1'), "s4 is still in the machine 's1'");

        const reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s1'), "s1 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s2'), "s2 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s3'), "s3 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s4'), "s4 is not reachable from 's1'");
    });

    it('can identify the machine if the starting state has been set to initial', () => {
        automata.addState('s1', 10, 10, false, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        automata.setInitialState('s1', true);

        assert.isTrue(automata.getMachine('s1').has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s2').has('s1'), "s2 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s3').has('s1'), "s3 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s4').has('s1'), "s4 is not in the machine 's1'");

        const reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s2'), "s2 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s3'), "s3 is not in the machine 's1'");
        assert.isTrue(reachableStates.has('s4'), "s4 is not in the machine 's1'");
    });

    // ---------------------------------------------
    // --* TOGGLING FINAL STATE
    // ---------------------------------------------
    it('can stop identifying final state if toggled to false', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        automata.setFinalState('s4', false);

        const reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isFalse(reachableFinalStates.has('s4'), "Final state s4 is still recognised as a reachable final state");
    });

    it('can identify a final state if toggled to true', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, false);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        automata.setFinalState('s4', true);

        const reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isTrue(reachableFinalStates.has('s4'), "Final state s4 is not recognised as a reachable final state");
    });

    // ---------------------------------------------
    // --* SERIALIZATION
    // ---------------------------------------------
    it('can identify a machine of one straight line automata even after serialization', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('a', 's2', 's3');
        automata.addTransition('a', 's3', 's4');

        const serialized: string = automata.serialize();
        automata = deserialize(serialized);

        assert.isTrue(automata.getMachine('s1').has('s1'), "s1 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s2').has('s1'), "s2 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s3').has('s1'), "s3 is not in the machine 's1'");
        assert.isTrue(automata.getMachine('s4').has('s1'), "s4 is not in the machine 's1'");

        const reachableStates = automata.getReachableStates('s1');
        assert.isTrue(reachableStates.has('s1'), "s1 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s2'), "s2 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s3'), "s3 is not reachable from 's1'");
        assert.isTrue(reachableStates.has('s4'), "s4 is not reachable from 's1'");

        const reachableFinalStates = automata.getReachableFinalStates('s1');
        assert.isTrue(reachableFinalStates.has('s4'), "Final state s4 is not reachable from 's1'");
    });
});
