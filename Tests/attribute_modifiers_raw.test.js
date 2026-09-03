// Tests/attribute_modifiers_raw.test.js
// Test suite for Combatant D&D 3.5e RAW Ability & Attribute Modifiers
//
// Verification of getAttributeMod() against RAW D&D 3.5e Player's Handbook (p. 8)
// The universal formula Math.floor((score - 10) / 2) must be applied across all
// ability scores (1 through 25+), ensuring correct negative penalties for low scores (3–5).

import { test } from 'node:test';
import assert from 'node:assert';
import { createCombatant } from '../js/models/model-core.js';
import { Stat } from '../js/models/Stat.js';

test('Combatant.getAttributeMod() - RAW D&D 3.5e PHB p.8 formula for all scores (1-25+)', () => {
  const pc = createCombatant({ name: 'Test', type: 'p' });

  // Helper: set a raw score on a Stat and verify calculated modifier
  function checkMod(score, expectedMod) {
    pc.str = new Stat(score);
    const actual = pc.getAttributeMod('str');
    assert.strictEqual(
      actual,
      expectedMod,
      `Score ${score}: expected mod ${expectedMod}, got ${actual}`
    );
  }

  // Exact D&D 3.5e PHB table 1-1 values:
  checkMod(1,  -5); // floor((1-10)/2)  = floor(-4.5)  = -5
  checkMod(2,  -4); // floor((2-10)/2)  = floor(-4)    = -4
  checkMod(3,  -4); // floor((3-10)/2)  = floor(-3.5)  = -4
  checkMod(4,  -3); // floor((4-10)/2)  = floor(-3)    = -3
  checkMod(5,  -3); // floor((5-10)/2)  = floor(-2.5)  = -3
  checkMod(6,  -2); // floor((6-10)/2)  = floor(-2)    = -2
  checkMod(7,  -2); // floor((7-10)/2)  = floor(-1.5)  = -2
  checkMod(8,  -1); // floor((8-10)/2)  = floor(-1)    = -1
  checkMod(9,  -1); // floor((9-10)/2)  = floor(-0.5)  = -1
  checkMod(10,  0); // floor((10-10)/2) = 0
  checkMod(11,  0); // floor((11-10)/2) = floor(0.5) = 0
  checkMod(12,  1); // floor((12-10)/2) = 1
  checkMod(13,  1);
  checkMod(14,  2);
  checkMod(15,  2);
  checkMod(16,  3);
  checkMod(17,  3);
  checkMod(18,  4);
  checkMod(20,  5);
  checkMod(25,  7);
});

test('Combatant.getAttributeMod() - Resolves dynamic Stat modifiers (buffed/debuffed values)', () => {
  const pc = createCombatant({ name: 'Test', type: 'p' });

  // STR 16 base + 4 enhancement = 20 → mod +5
  pc.str = new Stat(16);
  pc.str.addModifier(4, 'enhancement', 'Belt of Giant Strength');
  const mod = pc.getAttributeMod('str');
  assert.strictEqual(mod, 5, 'Should use getValue() of Stat, not base score');
});

test('Combatant.getAttributeMod() - Fallback to 10 when attribute property is missing/undefined', () => {
  const pc = createCombatant({ name: 'Test', type: 'p' });
  delete pc.str; // Remove attribute entirely
  const mod = pc.getAttributeMod('str');
  assert.strictEqual(mod, 0, 'Missing attribute should default to score 10 → mod 0');
});
