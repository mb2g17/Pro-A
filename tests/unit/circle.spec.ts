import {assert} from 'chai';
import Automata from '@/classes/Automata';
import {Outcome} from '@/classes/Outcome';
import TuringMachine from '@/classes/TuringMachine';
import TuringMachineTape from '@/classes/TuringMachineTape';
import TuringMachineConfig from '@/classes/TuringMachineConfig';
import deserialize from '@/classes/AutomataDeserializer';
import {AutomataCharacters} from '@/classes/AutomataCharacters';
import {Circle} from '@/classes/Circle';

/**
 * Tests the class Circle.ts
 */
describe('Circle.ts', () => {

    it('can circle letters and numbers', () => {
        // Numbers
        assert.equal(Circle.circle('1'), '①');
        assert.equal(Circle.circle('4'), '④');
        assert.equal(Circle.circle('9'), '⑨');

        // Upper-case
        assert.equal(Circle.circle('A'), 'Ⓐ');
        assert.equal(Circle.circle('D'), 'Ⓓ');
        assert.equal(Circle.circle('J'), 'Ⓙ');
        assert.equal(Circle.circle('T'), 'Ⓣ');
        assert.equal(Circle.circle('Z'), 'Ⓩ');

        // Lower-case
        assert.equal(Circle.circle('a'), 'ⓐ');
        assert.equal(Circle.circle('b'), 'ⓑ');
        assert.equal(Circle.circle('f'), 'ⓕ');
        assert.equal(Circle.circle('p'), 'ⓟ');
        assert.equal(Circle.circle('z'), 'ⓩ');
    });

    it('can uncircle letters and numbers', () => {
        // Numbers
        assert.equal(Circle.uncircle('①'), '1');
        assert.equal(Circle.uncircle('⑧'), '8');
        assert.equal(Circle.uncircle('⑨'), '9');

        // Upper-case
        assert.equal(Circle.uncircle('Ⓐ'), 'A');
        assert.equal(Circle.uncircle('Ⓔ'), 'E');
        assert.equal(Circle.uncircle('Ⓡ'), 'R');
        assert.equal(Circle.uncircle('Ⓠ'), 'Q');
        assert.equal(Circle.uncircle('Ⓩ'), 'Z');

        // Lower-case
        assert.equal(Circle.uncircle('ⓐ'), 'a');
        assert.equal(Circle.uncircle('ⓒ'), 'c');
        assert.equal(Circle.uncircle('ⓗ'), 'h');
        assert.equal(Circle.uncircle('ⓞ'), 'o');
        assert.equal(Circle.uncircle('ⓩ'), 'z');
    });
});
