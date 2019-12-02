import {assert} from 'chai';
import Automata from '@/classes/Automata';
import FiniteAutomata from '@/classes/FiniteAutomata';
import {Outcome} from '@/classes/Outcome';
import PushdownAutomata from "@/classes/PushdownAutomata";
import TuringMachine, {TuringMachineConfig} from "@/classes/TuringMachine";
import TuringMachineTape from "@/classes/TuringMachineTape";

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

    it('can add an initial state if there are no current states', () => {
        // Adds states
        automata.addState("A", 10, 10, true, false);
        automata.addState("B", 20, 10, true, false);
        automata.addState("C", 30, 10, false, false);

        // Asserts that the automata does not have any current states
        assert.equal(automata.currentConfigs.size, 0);

        // Adds current states from initial states
        automata["addInitialConfigsIfNoCurrentConfigs"]();

        // Asserts that the automata has the same number of current states as initial states
        assert.equal(automata.currentConfigs.size, 2);
    });

    it('can apply a transition from one configuration to another', () => {
        // Adds states
        automata.addState("A", 10, 10, true, false);
        automata.addState("B", 20, 10, true, false);

        // Adds transition
        automata.addTransition("a", "A", "B", {
            writeTapeSymbol: 'b',
            direction: 'R'
        });

        // Sets up initial config
        const srcConfig: TuringMachineConfig = ["A", new TuringMachineTape("aab"), 0];

        // Applies the transition and gets the destination configuration
        const destConfig: TuringMachineConfig = automata["applyTransition"](srcConfig, automata["edgeID"]['a']["A"]["B"]);

        // Asserts that we're on B, the tape has changed and the tape index has moved
        assert.equal(destConfig[0], "B");
        assert.isTrue(destConfig[1].equals(new TuringMachineTape("bab")));
        assert.equal(destConfig[2], 1);
    });
});
