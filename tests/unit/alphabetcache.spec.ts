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

    it('can identify a small alphabet', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's2', 's2');

        assert.isTrue(automata.getAlphabet('s1').has('a'), "'a' is not in the alphabet");
        assert.isTrue(automata.getAlphabet('s1').has('b'), "'b' is not in the alphabet");
    });

    it('can identify the alphabet after removing a transition', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's2', 's2');
        automata.addTransition('c', 's2', 's2');
        automata.removeTransition('c', 's2', 's2');

        assert.isTrue(automata.getAlphabet('s1').has('a'), "'a' is not in the alphabet");
        assert.isTrue(automata.getAlphabet('s1').has('b'), "'b' is not in the alphabet");
        assert.isFalse(automata.getAlphabet('s1').has('c'), "'c' is in the alphabet");
    });

    it('can identify the alphabet after removing a state', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's2', 's3');
        automata.addTransition('c', 's3', 's4');
        automata.removeState('s3');

        assert.isTrue(automata.getAlphabet('s1').has('a'), "'a' is not in the alphabet");
        assert.isFalse(automata.getAlphabet('s1').has('b'), "'b' is in the alphabet");
        assert.isFalse(automata.getAlphabet('s1').has('c'), "'c' is in the alphabet");
    });

    it('can identify the alphabet after moving the source state of a transition', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, true);
        automata.addState('s5', 10, 10, false, false);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's5', 's3');
        automata.addTransition('c', 's3', 's4');
        automata.changeSourceOfTransition(
            automata.getTransition('b', 's5', 's3').data.id,
            automata.getState('s2').data.id
        );

        assert.isTrue(automata.getAlphabet('s1').has('a'), "'a' is not in the alphabet");
        assert.isTrue(automata.getAlphabet('s1').has('b'), "'b' is not in the alphabet");
        assert.isTrue(automata.getAlphabet('s1').has('c'), "'c' is not in the alphabet");
    });

    it('can identify the alphabet after moving the target state of a transition', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, false);
        automata.addState('s3', 10, 10, false, false);
        automata.addState('s4', 10, 10, false, false);
        automata.addState('s5', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's2', 's3');
        automata.addTransition('c', 's4', 's5');
        automata.changeTargetOfTransition(
            automata.getTransition('b', 's2', 's3').data.id,
            automata.getState('s4').data.id
        );

        assert.isTrue(automata.getAlphabet('s1').has('a'), "'a' is not in the alphabet");
        assert.isTrue(automata.getAlphabet('s1').has('b'), "'b' is not in the alphabet");
        assert.isTrue(automata.getAlphabet('s1').has('c'), "'c' is not in the alphabet");
    });

    it('can still recognise an alphabet even after serialization', () => {
        automata.addState('s1', 10, 10, true, false);
        automata.addState('s2', 10, 10, false, true);

        automata.addTransition('a', 's1', 's2');
        automata.addTransition('b', 's2', 's2');

        const serialized: string = automata.serialize();
        automata = deserialize(serialized);

        assert.isTrue(automata.getAlphabet('s1').has('a'), "'a' is not in the alphabet");
        assert.isTrue(automata.getAlphabet('s1').has('b'), "'b' is not in the alphabet");
    });
});
