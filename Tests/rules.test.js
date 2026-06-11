// Tests/rules.test.js - Test suite for D&D 3.5e rules calculators (BAB, Saves, Spell Slots)

import { test } from 'node:test';
import assert from 'node:assert';
import { BABCalculator } from '../js/rules/BABCalculator.js';
import { SaveCalculator } from '../js/rules/SaveCalculator.js';
import { SpellSlotCalculator } from '../js/rules/SpellSlotCalculator.js';
import { Stat } from '../js/models/Stat.js';
import { CombatRules } from '../js/rules.js';
import { Combatant } from '../js/models/Combatant.js';

test('BABCalculator - Einzelklassen-Berechnung', () => {
  // Fighter Level 3 (guter BAB-Verlauf): BAB = 3
  const babFighter = BABCalculator.calculateBab([{ classType: 'fighter', level: 3 }]);
  assert.strictEqual(babFighter, 3);

  // Rogue Level 3 (mittlerer BAB-Verlauf): BAB = Math.floor(0.75 * 3) = 2
  const babRogue = BABCalculator.calculateBab([{ classType: 'rogue', level: 3 }]);
  assert.strictEqual(babRogue, 2);

  // Wizard Level 3 (schlechter BAB-Verlauf): BAB = Math.floor(0.5 * 3) = 1
  const babWizard = BABCalculator.calculateBab([{ classType: 'wizard', level: 3 }]);
  assert.strictEqual(babWizard, 1);
});

test('BABCalculator - Multiklassen-Berechnung', () => {
  // Fighter 3 (good, level 3 => 3) + Rogue 3 (avg, level 3 => 2) = BAB 5
  const classes = [
    { classType: 'fighter', level: 3 },
    { classType: 'rogue', level: 3 }
  ];
  const babMulti = BABCalculator.calculateBab(classes);
  assert.strictEqual(babMulti, 5);
});

test('BABCalculator - Randfälle', () => {
  assert.strictEqual(BABCalculator.calculateBab([]), 0);
  assert.strictEqual(BABCalculator.calculateBab(null), 0);
  assert.strictEqual(BABCalculator.calculateBab([{ classType: 'custom', level: 5 }]), 0);
});

test('SaveCalculator - Einzelklassen-Berechnung', () => {
  // Fighter Level 3: Fort = good (2 + 3/2 = 3), Ref = poor (3/3 = 1), Wil = poor (3/3 = 1)
  const savesFighter = SaveCalculator.calculateSaves([{ classType: 'fighter', level: 3 }]);
  assert.deepEqual(savesFighter, { fort: 3, ref: 1, wil: 1 });

  // Wizard Level 3: Fort = poor (1), Ref = poor (1), Wil = good (3)
  const savesWizard = SaveCalculator.calculateSaves([{ classType: 'wizard', level: 3 }]);
  assert.deepEqual(savesWizard, { fort: 1, ref: 1, wil: 3 });
});

test('SaveCalculator - Multiklassen-Berechnung', () => {
  // Fighter 3 + Wizard 3: Fort = 3 + 1 = 4, Ref = 1 + 1 = 2, Wil = 1 + 3 = 4
  const classes = [
    { classType: 'fighter', level: 3 },
    { classType: 'wizard', level: 3 }
  ];
  const savesMulti = SaveCalculator.calculateSaves(classes);
  assert.deepEqual(savesMulti, { fort: 4, ref: 2, wil: 4 });
});

test('SaveCalculator - Randfälle', () => {
  assert.deepEqual(SaveCalculator.calculateSaves([]), { fort: 0, ref: 0, wil: 0 });
  assert.deepEqual(SaveCalculator.calculateSaves(null), { fort: 0, ref: 0, wil: 0 });
});

test('SpellSlotCalculator - Wizard Basiszauberplätze ohne Attribute/Spezialisierung', () => {
  // Wizard Level 5, Int 10 (kein Modifikator), Spezialisierung 'none'
  const pc = {
    classes: [{ classType: 'wizard', level: 5 }],
    int: new Stat(10),
    wizardSpecialization: 'none'
  };

  const slots = SpellSlotCalculator.calculateSpellSlots(pc);
  // Base für Level 5 (WIZ_CLER_DRU_TABLE): [4, 3, 2, 1]
  // Slots 0: 4, Slots 1: 3, Slots 2: 2, Slots 3: 1, Slots 4-9: 0
  assert.strictEqual(slots[0], 4);
  assert.strictEqual(slots[1], 3);
  assert.strictEqual(slots[2], 2);
  assert.strictEqual(slots[3], 1);
  assert.strictEqual(slots[4], 0);
});

test('SpellSlotCalculator - Bonus-Zauberplätze durch hohes Hauptattribut', () => {
  // Wizard Level 5, Int 18 (+4 Modifikator), Spezialisierung 'none'
  // Attributsmodifikator = +4
  // Bonus Formel für Level > 0 und Score >= 10+lvl:
  // modifier = 4.
  // lvl 1: bonus = (4-1+1)/4 = 1 => 3 base + 1 bonus = 4 slots
  // lvl 2: bonus = (4-2+1)/4 = 3/4 = 0.75 => ceil = 1 => 2 base + 1 bonus = 3 slots
  // lvl 3: bonus = (4-3+1)/4 = 2/4 = 0.50 => ceil = 1 => 1 base + 1 bonus = 2 slots
  // lvl 4: base is undefined/0 (lvl 5 wizard has no lvl 4 slots) -> no bonus calculation applied because base is undefined
  // lvl 0: no attribute bonus applies to level 0 slots in D&D 3.5 rules
  const pc = {
    classes: [{ classType: 'wizard', level: 5 }],
    int: new Stat(18),
    wizardSpecialization: 'none'
  };

  const slots = SpellSlotCalculator.calculateSpellSlots(pc);
  assert.strictEqual(slots[0], 4, 'Kein Attributsbonus auf Stufe 0 Zauberplätze');
  assert.strictEqual(slots[1], 4, '1 Bonuszauberplatz für Stufe 1 Zauberplätze (3 base + 1 bonus)');
  assert.strictEqual(slots[2], 3, '1 Bonuszauberplatz für Stufe 2 Zauberplätze (2 base + 1 bonus)');
  assert.strictEqual(slots[3], 2, '1 Bonuszauberplatz für Stufe 3 Zauberplätze (1 base + 1 bonus)');
  assert.strictEqual(slots[4], 0, 'Keine Zauberplätze auf Stufe 4 (da Basis 0/undefined ist)');
});

test('SpellSlotCalculator - Spezialistenmagier Bonuszauberplätze', () => {
  // Wizard Level 5, Int 18 (+4 Modifikator), Spezialisierung 'evocation'
  // Magierspezialisierung gibt +1 Slot pro Zauberstufe (Stufe 1-9) sofern mindestens 1 Basisplatz vorhanden ist
  const pc = {
    classes: [{ classType: 'wizard', level: 5 }],
    int: new Stat(18),
    wizardSpecialization: 'evocation'
  };

  const slots = SpellSlotCalculator.calculateSpellSlots(pc);
  // Stufe 0: 4 (kein Bonus)
  // Stufe 1: 3 base + 1 attribute bonus + 1 specialist bonus = 5 slots
  // Stufe 2: 2 base + 1 attribute bonus + 1 specialist bonus = 4 slots
  // Stufe 3: 1 base + 1 attribute bonus + 1 specialist bonus = 3 slots
  // Stufe 4: 0 (da kein Basisplatz)
  assert.strictEqual(slots[0], 4);
  assert.strictEqual(slots[1], 5);
  assert.strictEqual(slots[2], 4);
  assert.strictEqual(slots[3], 3);
  assert.strictEqual(slots[4], 0);
});

test('SpellSlotCalculator - Multiklassen-Zauberer und Nicht-Zauberer', () => {
  // Wizard 3 (Int 18) + Cleric 3 (Wis 10)
  // Wizard 3 Base: [4, 2, 1] => Stufe 1: 2 base + 1 bonus (Int 18) = 3 slots. Stufe 2: 1 base + 1 bonus (Int 18) = 2 slots.
  // Cleric 3 Base: [4, 2, 1] => Stufe 1: 2 base. Stufe 2: 1 base. (Wis 10 has +0 mod)
  // Summe:
  // Lvl 0: 4 + 4 = 8
  // Lvl 1: 3 + 2 = 5
  // Lvl 2: 2 + 1 = 3
  const pc = {
    classes: [
      { classType: 'wizard', level: 3 },
      { classType: 'cleric', level: 3 }
    ],
    int: new Stat(18),
    wis: new Stat(10),
    wizardSpecialization: 'none'
  };

  const slots = SpellSlotCalculator.calculateSpellSlots(pc);
  assert.strictEqual(slots[0], 8);
  assert.strictEqual(slots[1], 5);
  assert.strictEqual(slots[2], 3);
  assert.strictEqual(slots[3], 0);

  // Nicht-Zauberer: Fighter 3
  const nonCasterPc = {
    classes: [{ classType: 'fighter', level: 3 }]
  };
  const emptySlots = SpellSlotCalculator.calculateSpellSlots(nonCasterPc);
  assert.deepEqual(emptySlots, { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 });
});

test('CombatRules - calculateMaxFeats computes correct feat limits', () => {
  // Fighter level 4, human by default (pc.isHuman is undefined)
  const pcFighter = {
    classes: [{ classType: 'fighter', level: 4 }]
  };
  // General feats: level 4 gives 2 (lvl 1, 3). Fighter bonus: 1 + floor(4/2) = 3. Human bonus: 1. Total = 6.
  assert.strictEqual(CombatRules.calculateMaxFeats(pcFighter), 6);

  // Cleric level 5, non-human
  const pcCleric = {
    classes: [{ classType: 'cleric', level: 5 }],
    isHuman: false
  };
  // General feats: level 5 gives 2 (lvl 1, 3). Cleric bonus: 0. Human: 0. Total = 2.
  assert.strictEqual(CombatRules.calculateMaxFeats(pcCleric), 2);
});

test('CombatRules - checkSpellKnownLimit enforces spontaneous spells limit but allows wizard exceptions', () => {
  // Mock spell database finder
  const spellsDB = {
    'magic_missile': { id: 'magic_missile', classLevels: [{ class: 'sorcerer', level: 1 }, { class: 'wizard', level: 1 }], school: 'evocation' },
    'shield_spell': { id: 'shield_spell', classLevels: [{ class: 'sorcerer', level: 1 }, { class: 'wizard', level: 1 }], school: 'abjuration' },
    'grease': { id: 'grease', classLevels: [{ class: 'sorcerer', level: 1 }, { class: 'wizard', level: 1 }], school: 'conjuration' }
  };
  const findSpellFn = (key) => spellsDB[key] || null;

  // Sorcerer lvl 1 (Spells known limit for level 1 spells is 2)
  const pcSorc = {
    classes: [{ classType: 'sorcerer', level: 1 }],
    learnedSpells: ['magic_missile', 'shield_spell']
  };

  // Try to learn a 3rd level 1 spell (grease) - should be blocked
  const check1 = CombatRules.checkSpellKnownLimit(pcSorc, spellsDB['grease'], findSpellFn);
  assert.strictEqual(check1.success, false, 'Sollte das Limit blockieren');
  assert.ok(check1.error.includes('Limit'), 'Fehlermeldung sollte Limit erwähnen');

  // Wizard multiclass (has unlimited caster Wizard) - should pass despite sorcerer limit
  const pcMulti = {
    classes: [
      { classType: 'sorcerer', level: 1 },
      { classType: 'wizard', level: 1 }
    ],
    learnedSpells: ['magic_missile', 'shield_spell']
  };
  const check2 = CombatRules.checkSpellKnownLimit(pcMulti, spellsDB['grease'], findSpellFn);
  assert.strictEqual(check2.success, true, 'Sollte für Magier/Hexenmeister Multiklasse erlaubt sein');
});

test('CombatRules - calculateTotalSkillPoints calculates correct skill points', () => {
  // Fighter level 1, non-human, INT 12 (+1 mod)
  const pcFighter1 = {
    classes: [{ classType: 'fighter', level: 1 }],
    int: new Stat(12),
    isHuman: false
  };
  assert.strictEqual(CombatRules.calculateTotalSkillPoints(pcFighter1), 12);

  // Fighter level 2, non-human, INT 12 (+1 mod)
  const pcFighter2 = {
    classes: [{ classType: 'fighter', level: 2 }],
    int: new Stat(12),
    isHuman: false
  };
  assert.strictEqual(CombatRules.calculateTotalSkillPoints(pcFighter2), 15);

  // Rogue level 1, human, INT 10 (+0 mod)
  const pcRogue1 = {
    classes: [{ classType: 'rogue', level: 1 }],
    int: new Stat(10),
    isHuman: true
  };
  assert.strictEqual(CombatRules.calculateTotalSkillPoints(pcRogue1), 36);

  // Multiclass: Wizard 1 / Cleric 1, non-human, INT 14 (+2 mod)
  // Wizard 1: (2 + 2) * 4 = 16
  // Cleric 1: (2 + 2) = 4
  // Total: 20
  const pcMulti = {
    classes: [
      { classType: 'wizard', level: 1 },
      { classType: 'cleric', level: 1 }
    ],
    int: new Stat(14),
    isHuman: false
  };
  assert.strictEqual(CombatRules.calculateTotalSkillPoints(pcMulti), 20);
});

test('CombatRules - calculateSpentSkillPoints calculates correct spent points', () => {
  // Cleric: jump is cross-class (classType cleric doesn't have jump)
  // concentration is class skill for cleric
  const pcCleric = {
    classes: [{ classType: 'cleric', level: 1 }],
    skills: {
      jump: { ranks: 2, misc: 0 }, // 2 ranks * 2 (cross-class) = 4 SP
      concentration: { ranks: 4, misc: 0 } // 4 ranks * 1 (class) = 4 SP
    }
  };
  assert.strictEqual(CombatRules.calculateSpentSkillPoints(pcCleric), 8);
});

test('CombatRules - Racial Attribute Modifiers and Size AC are applied correctly', () => {
  // Elf (+2 Dex, -2 Con)
  const pcElf = new Combatant({
    race: 'elf',
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
  });
  // After rebuildCombatantModifiers (run in constructor)
  assert.strictEqual(pcElf.dex.getValue(), 12, 'Elfen sollten +2 Ges erhalten');
  assert.strictEqual(pcElf.con.getValue(), 8, 'Elfen sollten -2 Kon erhalten');

  // Gnome (+2 Con, -2 Str, Small size AC +1)
  const pcGnome = new Combatant({
    race: 'gnome',
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
  });
  assert.strictEqual(pcGnome.con.getValue(), 12, 'Gnome sollten +2 Kon erhalten');
  assert.strictEqual(pcGnome.str.getValue(), 8, 'Gnome sollten -2 Str erhalten');
  assert.strictEqual(pcGnome.ac.getValue(), 11, 'Gnome sollten +1 Größenbonus auf RK erhalten');
  assert.strictEqual(pcGnome.acTouch.getValue(), 11, 'Gnome sollten +1 Größenbonus auf Touch-RK erhalten');
  assert.strictEqual(pcGnome.acFlat.getValue(), 11, 'Gnome sollten +1 Größenbonus auf Flat-RK erhalten');
});

test('CombatRules - Racial Speed calculations and Dwarf armor immunity', () => {
  // Halfling speed 20 ft
  const pcHalfling = new Combatant({
    race: 'halfling',
    baseBw: 20
  });
  assert.strictEqual(pcHalfling.bw, 20);

  // Dwarf speed 20 ft, immune to medium/heavy armor speed penalties
  const pcDwarf = new Combatant({
    race: 'dwarf',
    baseBw: 20,
    armors: [{ type: 'half_plate', speedCategory: 'heavy', isEquipped: true, checkPenalty: -7 }]
  });
  // Heavy armor speed penalty should NOT reduce Dwarf speed below 20 ft
  assert.strictEqual(pcDwarf.bw, 20, 'Zwerg sollte in schwerer Rüstung keine Verlangsamung erleiden');
});

test('CombatRules - Racial Skill and Saving Throw bonuses are applied correctly', () => {
  // Elf gets +2 on Listen/Search/Spot
  const pcElf = new Combatant({
    race: 'elf',
    skills: {
      listen: { ranks: 0, misc: 0 },
      search: { ranks: 2, misc: 0 } // 2 ranks + 0 (Int mod) + 2 (Elf bonus) = 4
    }
  });
  assert.strictEqual(pcElf.getSkillModifier('listen'), 2, 'Elf sollte +2 Volksbonus auf Lauschen erhalten');
  assert.strictEqual(pcElf.getSkillModifier('search'), 4, 'Elf sollte +2 Volksbonus auf Suchen erhalten');

  // Halfling gets +1 on all saves
  const pcHalfling = new Combatant({
    race: 'halfling',
    baseZa: 2, baseRef: 2, baseWil: 2
  });
  assert.strictEqual(pcHalfling.za.getValue(), 3, 'Halbling sollte +1 Volksbonus auf ZÄ erhalten');
  // Reflex save: 2 base + 1 Dex (from racial +2 Dex) + 1 racial Reflex bonus = 4
  assert.strictEqual(pcHalfling.ref.getValue(), 4, 'Halbling sollte +1 Volksbonus auf REF erhalten (+1 Dex-Bonus)');
  assert.strictEqual(pcHalfling.wil.getValue(), 3, 'Halbling sollte +1 Volksbonus auf WIL erhalten');
});
