import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';
import PushdownAutomata from "@/classes/PushdownAutomata";
import TuringMachine from "@/classes/TuringMachine";

/**
 * Tests the class TuringMachine.ts
 */
describe('TuringMachine.ts', () => {

    // Automata to test with
    let automata: TuringMachine;

    beforeEach(() => {
        automata = new TuringMachine();
    });

    it('can run a simple TM and accept by final state', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.addTransition('b', 'B', 'C', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.setInput('ab');
        automata.step();
        automata.step();
        assert.equal(automata.getOutcome(), Outcome.ACCEPT);
    });

    it('can run a simple TM and reject', () => {
        automata.addState('A', 10, 10, true, false);
        automata.addState('B', 50, 50, false, false);
        automata.addState('C', 50, 50, false, true);
        automata.addTransition('a', 'A', 'B', {
            writeTapeSymbol: 'b',
            direction: 'R'
        });
        automata.addTransition('b', 'B', 'C', {
            writeTapeSymbol: 'b',
            direction: 'L'
        });
        automata.addTransition('b', 'C', 'B', {
            writeTapeSymbol: 'a',
            direction: 'R'
        });
        automata.setInput('abb');
        automata.step();
        automata.step();
        automata.step();
        assert.equal(automata.getOutcome(), Outcome.REJECT);
    });
});
