import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';
import { calculateSkillModifier, getSkillModifierBreakdown } from '../js/models/helpers/skills/CombatantSkills.js';

describe("Race: Tiefling", () => {
test('Tiefling - Racial attribute modifiers are applied correctly', () => {
  // A tiefling should get +2 Dex, +2 Int, -2 Cha
  const pc = new Combatant({
    race: 'tiefling',
    str: { base: 10, modifiers: [] },
    dex: { base: 10, modifiers: [] },
    con: { base: 10, modifiers: [] },
    int: { base: 10, modifiers: [] },
    wis: { base: 10, modifiers: [] },
    cha: { base: 10, modifiers: [] }
  });

  // Re-run modifiers calculation
  pc.rebuildStatModifiers();

  assert.strictEqual(pc.dex.getValue(), 12, 'Tiefling should get +2 DEX');
  assert.strictEqual(pc.int.getValue(), 12, 'Tiefling should get +2 INT');
  assert.strictEqual(pc.cha.getValue(), 8, 'Tiefling should get -2 CHA');
  assert.strictEqual(pc.str.getValue(), 10, 'Tiefling STR should remain unchanged');
});

test('Tiefling - Racial skill bonuses are applied correctly', () => {
  // A tiefling should get +2 on Bluff and Hide checks
  const pc = new Combatant({
    race: 'tiefling',
    classes: [{ classType: 'rogue', level: 1 }],
    skills: {
      bluff: { ranks: 0 },
      hide: { ranks: 0 },
      listen: { ranks: 0 }
    },
    dex: { base: 10, modifiers: [] },
    cha: { base: 10, modifiers: [] }
  });

  pc.rebuildStatModifiers();

  // Bluff uses CHA. Base CHA is 10 - 2 (racial) = 8 (modifier -1)
  // Total Bluff should be: 0 (ranks) - 1 (CHA mod) + 2 (racial Bluff bonus) = 1
  assert.strictEqual(pc.getSkillModifier('bluff'), 1, 'Tiefling Bluff should include +2 racial bonus');

  // Hide uses DEX. Base DEX is 10 + 2 (racial) = 12 (modifier +1)
  // Total Hide should be: 0 (ranks) + 1 (DEX mod) + 2 (racial Hide bonus) = 3
  assert.strictEqual(pc.getSkillModifier('hide'), 3, 'Tiefling Hide should include +2 racial bonus');

  // Listen uses WIS (base 10, mod 0). No racial bonus.
  assert.strictEqual(pc.getSkillModifier('listen'), 0, 'Tiefling Listen should not have racial bonus');
});

test('Tiefling - Level Adjustment and Resistances default correctly', () => {
  const pc = new Combatant({
    race: 'tiefling',
    levelAdjustment: 1,
    resistances: 'Cold 5, Electricity 5, Fire 5'
  });

  assert.strictEqual(pc.levelAdjustment, 1, 'Tiefling level adjustment should be 1');
  assert.strictEqual(pc.resistances, 'Cold 5, Electricity 5, Fire 5', 'Tiefling should have energy resistances');
});
});

describe("Race: Deep Halfling", () => {
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

test('Deep Halfling - Saving throws get +1 racial bonus (RAW Monster Manual p. 150)', () => {
  const pc = new Combatant({
    race: 'deep_halfling',
    baseZa: 0,
    baseRef: 0,
    baseWil: 0,
    dex: { base: 10, modifiers: [] } // dex mod 0 -> racial +2 dex gives mod +1
  });

  pc.rebuildStatModifiers();

  // Deep Halflings retain all halfling racial traits except Climb/Jump/Move Silently bonuses (MM p. 150).
  // Fortitude should be 1 (Base 0 + Con mod 0 + 1 racial)
  assert.strictEqual(pc.za.getValue(), 1, 'Deep Halfling should get +1 racial bonus on Fortitude');
  // Reflex should be 2 (Base 0 + Dex mod 1 + 1 racial)
  assert.strictEqual(pc.ref.getValue(), 2, 'Deep Halfling should get 1 Dex mod + 1 racial on Reflex');
  // Will should be 1 (Base 0 + Wis mod 0 + 1 racial)
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
});

describe("Race: Lizardfolk", () => {
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

test('Lizardfolk - Bug 22: Natural attack routine has 2 claws and 1 bite (Monster Manual p. 169)', () => {
  const lizardWeapons = [
    { id: 'natural-claw-1', name: 'Claw 1', damage: '1d4', isNatural: true, isSecondary: false, strMult: 1.0, damageType: 'Slashing', grip: 'primary' },
    { id: 'natural-claw-2', name: 'Claw 2', damage: '1d4', isNatural: true, isSecondary: false, strMult: 1.0, damageType: 'Slashing', grip: 'primary' },
    { id: 'natural-bite', name: 'Bite', damage: '1d4', isNatural: true, isSecondary: true, strMult: 0.5, damageType: 'Piercing/Slashing', grip: 'sec' }
  ];

  const claws = lizardWeapons.filter(w => w.name.startsWith('Claw'));
  const bites = lizardWeapons.filter(w => w.name.startsWith('Bite'));

  assert.strictEqual(claws.length, 2, 'Lizardfolk must have 2 claw attacks');
  assert.strictEqual(bites.length, 1, 'Lizardfolk must have 1 bite attack');
  assert.strictEqual(claws[0].isSecondary, false, 'Claw 1 is primary');
  assert.strictEqual(claws[1].isSecondary, false, 'Claw 2 is primary');
  assert.strictEqual(bites[0].isSecondary, true, 'Bite is secondary');
});
});

describe("Race: Dwarf", () => {
test('Bug #42: Dwarf Stonecunning grants +2 racial bonus to search and appraise in addition to craft', () => {
  const pc = new Combatant({
    name: 'Dwarf Hero',
    race: 'dwarf',
    classes: [{ classType: 'fighter', level: 1 }]
  });

  const craftBreakdown = getSkillModifierBreakdown(pc, 'craft');
  assert.ok(craftBreakdown.some(b => b.label === 'Racial bonus (Dwarf)' && b.value === 2), 'Dwarf must receive +2 Craft');

  const searchBreakdown = getSkillModifierBreakdown(pc, 'search');
  assert.ok(searchBreakdown.some(b => b.label === 'Racial bonus (Dwarf)' && b.value === 2), 'Dwarf must receive +2 Search (Stonecunning, RAW PHB p. 15)');

  const appraiseBreakdown = getSkillModifierBreakdown(pc, 'appraise');
  assert.ok(appraiseBreakdown.some(b => b.label === 'Racial bonus (Dwarf)' && b.value === 2), 'Dwarf must receive +2 Appraise (Stonecunning, RAW PHB p. 15)');

  // Verify that the total modifier also includes the +2 bonus
  assert.ok(calculateSkillModifier(pc, 'search') >= 2);
  assert.ok(calculateSkillModifier(pc, 'appraise') >= 2);
});
});
