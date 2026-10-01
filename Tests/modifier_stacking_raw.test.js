import test from 'node:test';
import assert from 'node:assert';
import { resolveModifierStacking } from '../js/models/helpers/modifiers/ModifierStacking.js';

test('resolveModifierStacking should stack negative values additively', () => {
  const modifiers = [
    { value: -2, type: 'untyped', source: 'Curse' },
    { value: -3, type: 'dodge', source: 'Fatigue' },
    { value: -1, type: 'enhancement', source: 'Blight' }
  ];
  const result = resolveModifierStacking(modifiers);
  assert.strictEqual(result.total, -6);
  assert.strictEqual(result.penaltiesSum, -6);
  assert.strictEqual(result.bonusSum, 0);
});

test('resolveModifierStacking should stack dodge and untyped bonuses additively', () => {
  const modifiers = [
    { value: 2, type: 'dodge', source: 'Feat' },
    { value: 1, type: 'dodge', source: 'Spell' },
    { value: 3, type: 'untyped', source: 'Trait' },
    { value: 1, type: 'untyped', source: 'Misc' }
  ];
  const result = resolveModifierStacking(modifiers);
  assert.strictEqual(result.total, 7);
  assert.strictEqual(result.bonusSum, 7);
});

test('resolveModifierStacking should take the highest for other typed bonuses', () => {
  const modifiers = [
    { value: 2, type: 'enhancement', source: 'Spell A' },
    { value: 4, type: 'enhancement', source: 'Spell B' },
    { value: 1, type: 'morale', source: 'Bard' },
    { value: 3, type: 'morale', source: 'Cleric' }
  ];
  const result = resolveModifierStacking(modifiers);
  assert.strictEqual(result.total, 7); // 4 (enhancement) + 3 (morale)
  assert.strictEqual(result.bonusSum, 7);
});

test('resolveModifierStacking should mix all rules correctly', () => {
  const modifiers = [
    { value: -2, type: 'untyped', source: 'Curse' },
    { value: 2, type: 'dodge', source: 'Feat' },
    { value: 1, type: 'dodge', source: 'Spell' },
    { value: 2, type: 'enhancement', source: 'Spell A' },
    { value: 4, type: 'enhancement', source: 'Spell B' },
    { value: 3, type: 'untyped', source: 'Trait' }
  ];
  const result = resolveModifierStacking(modifiers);
  // Penalties: -2
  // Dodge: 2 + 1 = 3
  // Untyped: 3
  // Enhancement: max(2, 4) = 4
  // Total: -2 + 3 + 3 + 4 = 8
  assert.strictEqual(result.total, 8);
  assert.strictEqual(result.penaltiesSum, -2);
  assert.strictEqual(result.bonusSum, 10);
});

test('resolveModifierStacking should handle empty arrays and invalid inputs gracefully', () => {
  assert.strictEqual(resolveModifierStacking([]).total, 0);
  assert.strictEqual(resolveModifierStacking(null).total, 0);
  assert.strictEqual(resolveModifierStacking([null, undefined, { value: 'NaN' }]).total, 0);
});

test('resolveModifierStacking should stack circumstance bonuses additively across different sources and take highest within same source (Bug #12, RAW PHB p. 305)', () => {
  const modifiers = [
    { value: 2, type: 'circumstance', source: 'Higher Ground' },
    { value: 1, type: 'circumstance', source: 'Higher Ground' }, // same source: only 2 applies
    { value: 3, type: 'circumstance', source: 'Tactical Cover' }  // different source: stacks additively
  ];
  const result = resolveModifierStacking(modifiers);
  // Higher Ground max is 2, Tactical Cover is 3 => 2 + 3 = 5
  assert.strictEqual(result.total, 5);
  assert.strictEqual(result.bonusSum, 5);
  assert.strictEqual(result.breakdown.length, 2);
});

