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

    it('returns the same character if you re-circle circled characters', () => {
        // Numbers
        assert.equal(Circle.circle('①'), '①');
        assert.equal(Circle.circle('④'), '④');
        assert.equal(Circle.circle('⑨'), '⑨');

        // Upper-case
        assert.equal(Circle.circle('Ⓐ'), 'Ⓐ');
        assert.equal(Circle.circle('Ⓓ'), 'Ⓓ');
        assert.equal(Circle.circle('Ⓙ'), 'Ⓙ');
        assert.equal(Circle.circle('Ⓣ'), 'Ⓣ');
        assert.equal(Circle.circle('Ⓩ'), 'Ⓩ');

        // Lower-case
        assert.equal(Circle.circle('ⓐ'), 'ⓐ');
        assert.equal(Circle.circle('ⓑ'), 'ⓑ');
        assert.equal(Circle.circle('ⓕ'), 'ⓕ');
        assert.equal(Circle.circle('ⓟ'), 'ⓟ');
        assert.equal(Circle.circle('ⓩ'), 'ⓩ');
    });

    it('returns the same character if you uncircle normal characters', () => {
        // Numbers
        assert.equal(Circle.uncircle('1'), '1');
        assert.equal(Circle.uncircle('8'), '8');
        assert.equal(Circle.uncircle('9'), '9');

        // Upper-case
        assert.equal(Circle.uncircle('A'), 'A');
        assert.equal(Circle.uncircle('E'), 'E');
        assert.equal(Circle.uncircle('R'), 'R');
        assert.equal(Circle.uncircle('Q'), 'Q');
        assert.equal(Circle.uncircle('Z'), 'Z');

        // Lower-case
        assert.equal(Circle.uncircle('a'), 'a');
        assert.equal(Circle.uncircle('c'), 'c');
        assert.equal(Circle.uncircle('h'), 'h');
        assert.equal(Circle.uncircle('o'), 'o');
        assert.equal(Circle.uncircle('z'), 'z');
    });

    it('can check if characters are circled or not', () => {
        // Numbers
        assert.isTrue(Circle.isCircled('①'));
        assert.isTrue(Circle.isCircled('④'));
        assert.isTrue(Circle.isCircled('⑨'));
        assert.isFalse(Circle.isCircled('3'));
        assert.isFalse(Circle.isCircled('5'));
        assert.isFalse(Circle.isCircled('8'));

        // Upper-case
        assert.isTrue(Circle.isCircled('Ⓐ'));
        assert.isTrue(Circle.isCircled('Ⓓ'));
        assert.isTrue(Circle.isCircled('Ⓙ'));
        assert.isTrue(Circle.isCircled('Ⓣ'));
        assert.isTrue(Circle.isCircled('Ⓩ'));
        assert.isFalse(Circle.isCircled('A'));
        assert.isFalse(Circle.isCircled('E'));
        assert.isFalse(Circle.isCircled('R'));
        assert.isFalse(Circle.isCircled('Q'));
        assert.isFalse(Circle.isCircled('Z'));

        // Lower-case
        assert.isTrue(Circle.isCircled('ⓐ'));
        assert.isTrue(Circle.isCircled('ⓑ'));
        assert.isTrue(Circle.isCircled('ⓕ'));
        assert.isTrue(Circle.isCircled('ⓟ'));
        assert.isTrue(Circle.isCircled('ⓩ'));
        assert.isFalse(Circle.isCircled('a'));
        assert.isFalse(Circle.isCircled('c'));
        assert.isFalse(Circle.isCircled('h'));
        assert.isFalse(Circle.isCircled('o'));
        assert.isFalse(Circle.isCircled('z'));

        // Obscure characters
        assert.isFalse(Circle.isCircled(AutomataCharacters.Epsilon));
        assert.isFalse(Circle.isCircled(AutomataCharacters.EmptyStackSymbol));
        assert.isFalse(Circle.isCircled(AutomataCharacters.EmptySymbol));
        assert.isFalse(Circle.isCircled(AutomataCharacters.NonEmptySymbol));
        assert.isFalse(Circle.isCircled(AutomataCharacters.WriteNothingSymbol));
        assert.isFalse(Circle.isCircled(AutomataCharacters.CircleSymbol));
        assert.isFalse(Circle.isCircled(AutomataCharacters.UncircleSymbol));
    });
});
