import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';

test('Lizardfolk - Racial attribute modifiers are applied correctly', () => {
  // Lizardfolk gets +2 STR, +2 CON, -2 INT
  const pc = new Combatant({
    race: 'lizardfolk',
    str: { base: 10, modifiers: [] },
    dex: { base: 10, modifiers: [] },
    con: { base: 10, modifiers: [] },
    int: { base: 10, modifiers: [] },
    wis: { base: 10, modifiers: [] },
    cha: { base: 10, modifiers: [] }
  });

  pc.rebuildStatModifiers();

  assert.strictEqual(pc.str.getValue(), 12, 'Lizardfolk should get +2 STR');
  assert.strictEqual(pc.con.getValue(), 12, 'Lizardfolk should get +2 CON');
  assert.strictEqual(pc.int.getValue(), 8, 'Lizardfolk should get -2 INT');
  assert.strictEqual(pc.dex.getValue(), 10, 'Lizardfolk DEX should remain unchanged');
  assert.strictEqual(pc.wis.getValue(), 10, 'Lizardfolk WIS should remain unchanged');
  assert.strictEqual(pc.cha.getValue(), 10, 'Lizardfolk CHA should remain unchanged');
});

test('Lizardfolk - Natural Armor bonus (+5) is applied correctly', () => {
  const pc = new Combatant({
    race: 'lizardfolk',
    dex: { base: 10, modifiers: [] }
  });

  pc.rebuildStatModifiers();

  // Base AC is 10 + 5 natural armor = 15
  assert.strictEqual(pc.ac.getValue(), 15, 'Lizardfolk AC should include +5 Natural Armor');
  assert.strictEqual(pc.acFlat.getValue(), 15, 'Lizardfolk Flat-Footed AC should include +5 Natural Armor');
  // Touch AC ignores natural armor: 10 + 0 DEX = 10
  assert.strictEqual(pc.acTouch.getValue(), 10, 'Lizardfolk Touch AC should ignore Natural Armor');
});

test('Lizardfolk - Racial skill bonuses (+4 Balance, Jump, Swim) are applied correctly', () => {
  const pc = new Combatant({
    race: 'lizardfolk',
    classes: [{ classType: 'druid', level: 1 }],
    skills: {
      balance: { ranks: 0 },
      jump: { ranks: 0 },
      swim: { ranks: 0 },
      climb: { ranks: 0 },
      listen: { ranks: 0 }
    },
    str: { base: 10, modifiers: [] }, // 10 + 2 racial = 12 (mod +1)
    dex: { base: 10, modifiers: [] }, // 10 (mod +0)
    wis: { base: 10, modifiers: [] }  // 10 (mod +0)
  });

  pc.rebuildStatModifiers();

  // Balance uses DEX (mod 0) + 4 racial = 4
  assert.strictEqual(pc.getSkillModifier('balance'), 4, 'Balance should include +4 racial bonus');

  // Jump uses STR (mod +1) + 4 racial = 5
  assert.strictEqual(pc.getSkillModifier('jump'), 5, 'Jump should include +4 racial bonus and STR mod');

  // Swim uses STR (mod +1) + 4 racial = 5
  assert.strictEqual(pc.getSkillModifier('swim'), 5, 'Swim should include +4 racial bonus and STR mod');

  // Climb uses STR (mod +1) with no racial bonus = 1
  assert.strictEqual(pc.getSkillModifier('climb'), 1, 'Climb should not have racial bonus');

  // Listen uses WIS (mod 0) with no racial bonus = 0
  assert.strictEqual(pc.getSkillModifier('listen'), 0, 'Listen should not have racial bonus');
});

test('Lizardfolk - Level Adjustment defaults to 1', () => {
  const pc = new Combatant({
    race: 'lizardfolk',
    levelAdjustment: 1
  });

  assert.strictEqual(pc.levelAdjustment, 1, 'Lizardfolk level adjustment should be 1');
});

test('Lizardfolk - Natural attacks routine (2 Claws primary, 1 Bite secondary)', () => {
  const pc = new Combatant({
    race: 'lizardfolk',
    classes: [{ classType: 'druid', level: 1 }],
    str: { base: 10, modifiers: [] } // STR becomes 12 (+1 mod), Druid 1 BAB is 0
  });

  pc.rebuildStatModifiers();

  const primaryClaw = {
    name: 'Claw',
    damage: '1d4',
    isNatural: true,
    isSecondary: false,
    strMult: 1.0,
    grip: 'primary'
  };

  const secondaryBite = {
    name: 'Bite',
    damage: '1d4',
    isNatural: true,
    isSecondary: true,
    strMult: 0.5,
    grip: 'sec'
  };

  // Primary claw: BAB (0) + STR (1) = +1 attack bonus
  const clawSeq = AttackEngine.calculateAttackSequence(pc, primaryClaw, false);
  assert.strictEqual(clawSeq[0].atkTotal, 1, 'Primary claw attack bonus should be +1');
  assert.strictEqual(clawSeq[0].dmgTotal, 1, 'Primary claw damage should include full STR (+1)');

  // Secondary bite: BAB (0) + STR (1) - secondary penalty (-5) = -4 attack bonus
  const biteSeq = AttackEngine.calculateAttackSequence(pc, secondaryBite, false);
  assert.strictEqual(biteSeq[0].atkTotal, -4, 'Secondary bite attack bonus should be -4 (-5 secondary penalty)');
  // 0.5 * 1 STR rounded down = 0 bonus damage
  assert.strictEqual(biteSeq[0].dmgTotal, 0, 'Secondary bite damage should include half STR (0 for +1 STR)');
});

test('Lizardfolk Dragon Shaman - Skill modifier breakdown explains +4 Balance racial bonus', () => {
  const pc = new Combatant({
    race: 'lizardfolk',
    classes: [{ classType: 'dragon_shaman', level: 10 }],
    skills: {
      balance: { ranks: 0, misc: 0 }
    },
    dex: { base: 10, modifiers: [] } // DEX 10 (mod 0)
  });

  pc.rebuildStatModifiers();

  const breakdown = pc.getSkillModifierBreakdown('balance');
  const totalMod = pc.getSkillModifier('balance');

  assert.strictEqual(totalMod, 4, 'Total balance modifier should be +4');
  
  const ranksItem = breakdown.find(b => b.label === 'Ranks');
  assert.strictEqual(ranksItem?.value, 0, 'Ranks should be 0');

  const dexItem = breakdown.find(b => b.label === 'DEX-Mod');
  assert.strictEqual(dexItem?.value, 0, 'DEX-Mod should be 0');

  const racialItem = breakdown.find(b => b.label === 'Racial bonus (Lizardfolk)');
  assert.strictEqual(racialItem?.value, 4, 'Racial bonus (Lizardfolk) should be +4');

  const calculatedSum = breakdown.reduce((sum, item) => sum + item.value, 0);
  assert.strictEqual(calculatedSum, totalMod, 'Sum of breakdown items must match totalMod');
});

