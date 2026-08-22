import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';

test('Deep Halfling - Racial attribute modifiers and size modifier', () => {
  // Deep Halfling should get +2 Dex, -2 Str, Small size (+1 AC)
  const pc = new Combatant({
    race: 'deep_halfling',
    str: { base: 10, modifiers: [] },
    dex: { base: 10, modifiers: [] },
    con: { base: 10, modifiers: [] },
    int: { base: 10, modifiers: [] },
    wis: { base: 10, modifiers: [] },
    cha: { base: 10, modifiers: [] }
  });

  pc.rebuildStatModifiers();

  assert.strictEqual(pc.dex.getValue(), 12, 'Deep Halfling should get +2 DEX');
  assert.strictEqual(pc.str.getValue(), 8, 'Deep Halfling should get -2 STR');
  assert.strictEqual(pc.getSizeModifier(), 1, 'Deep Halfling should have Small size (+1)');
});

test('Deep Halfling - Saving throws get +1 racial bonus', () => {
  const pc = new Combatant({
    race: 'deep_halfling',
    baseZa: 0,
    baseRef: 0,
    baseWil: 0,
    dex: { base: 10, modifiers: [] } // dex mod 0 -> racial +2 dex gives mod +1
  });

  pc.rebuildStatModifiers();

  assert.strictEqual(pc.za.getValue(), 1, 'Deep Halfling should get +1 racial bonus on Fortitude');
  assert.strictEqual(pc.ref.getValue(), 2, 'Deep Halfling should get +1 racial bonus + 1 Dex mod on Reflex');
  assert.strictEqual(pc.wil.getValue(), 1, 'Deep Halfling should get +1 racial bonus on Will');
});

test('Deep Halfling - Skill bonuses (Listen, Appraise, Craft, Search vs Climb/Jump/Move Silently)', () => {
  const pc = new Combatant({
    race: 'deep_halfling',
    classes: [{ classType: 'rogue', level: 1 }],
    skills: {
      listen: { ranks: 0 },
      appraise: { ranks: 0 },
      craft: { ranks: 0 },
      search: { ranks: 0 },
      climb: { ranks: 0 },
      jump: { ranks: 0 },
      move_silently: { ranks: 0 }
    },
    str: { base: 10, modifiers: [] }, // mod -1
    dex: { base: 10, modifiers: [] }, // mod +1
    int: { base: 10, modifiers: [] }, // mod 0
    wis: { base: 10, modifiers: [] }  // mod 0
  });

  pc.rebuildStatModifiers();

  // Listen (Wis mod 0) + 2 racial = 2
  assert.strictEqual(pc.getSkillModifier('listen'), 2, 'Listen should have +2 racial bonus');
  // Appraise (Int mod 0) + 2 racial = 2
  assert.strictEqual(pc.getSkillModifier('appraise'), 2, 'Appraise should have +2 racial bonus');
  // Craft (Int mod 0) + 2 racial = 2
  assert.strictEqual(pc.getSkillModifier('craft'), 2, 'Craft should have +2 racial bonus');
  // Search (Int mod 0) + 2 racial = 2
  assert.strictEqual(pc.getSkillModifier('search'), 2, 'Search should have +2 racial bonus');

  // Climb (Str mod -1) + 0 racial = -1 (lost racial bonus)
  assert.strictEqual(pc.getSkillModifier('climb'), -1, 'Climb should NOT have racial bonus');
  // Jump (Str mod -1) + 0 racial = -1 (lost racial bonus)
  assert.strictEqual(pc.getSkillModifier('jump'), -1, 'Jump should NOT have racial bonus');
  // Move Silently (Dex mod +1) + 0 racial = 1 (lost racial bonus)
  assert.strictEqual(pc.getSkillModifier('move_silently'), 1, 'Move Silently should NOT have racial bonus');
});
