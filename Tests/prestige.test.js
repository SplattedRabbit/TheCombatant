// Tests/prestige.test.js - Test suite for D&D 3.5e Prestige Classes (Prerequisites, Caster Level Linking, and Sneak Attack)

import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { CombatRules } from '../js/rules.js';
import { Stat } from '../js/models/Stat.js';

test('Prestige Classes - Mystic Theurge Prerequisite validation', () => {
  // 1. A PC who doesn't meet the requirements (no skills, no spells)
  const disqualifiedPC = new Combatant({
    classes: [
      { classType: 'wizard', level: 1 },
      { classType: 'cleric', level: 1 }
    ],
    skills: {}
  });

  const res1 = CombatRules.validatePrestigeClassPrereqs(disqualifiedPC, 'mystic_theurge');
  assert.strictEqual(res1.success, false, 'Should fail validation');
  assert.ok(res1.errors.length > 0, 'Should return error messages');

  // 2. A PC who meets all requirements (religion 6, arcana 6, wizard level 3, cleric level 3)
  const qualifiedPC = new Combatant({
    classes: [
      { classType: 'wizard', level: 3 }, // getMaxSpellLevel('wizard', 3) = 2 (can cast 2nd-level arcane spells)
      { classType: 'cleric', level: 3 }  // getMaxSpellLevel('cleric', 3) = 2 (can cast 2nd-level divine spells)
    ],
    skills: {
      knowledge_arcana: { ranks: 6, misc: 0 },
      knowledge_religion: { ranks: 6, misc: 0 }
    }
  });

  const res2 = CombatRules.validatePrestigeClassPrereqs(qualifiedPC, 'mystic_theurge');
  assert.strictEqual(res2.success, true, 'Should meet requirements');
  assert.strictEqual(res2.errors.length, 0, 'Should have no errors');
});

test('Prestige Classes - Arcane Trickster Prerequisite validation', () => {
  // 1. Disqualified PC (missing sneak attack +2d6, missing spells, missing skills)
  const disqualifiedPC = new Combatant({
    classes: [
      { classType: 'wizard', level: 3 },
      { classType: 'rogue', level: 1 } // Sneak attack is only +1d6
    ],
    alignment: 'Neutral',
    skills: {
      knowledge_arcana: { ranks: 4, misc: 0 }
    }
  });

  const res1 = CombatRules.validatePrestigeClassPrereqs(disqualifiedPC, 'arcane_trickster');
  assert.strictEqual(res1.success, false, 'Should fail validation');
  assert.ok(res1.errors.some(e => e.includes('Hinterhältiger Angriff')), 'Should complain about sneak attack');

  // 2. Qualified PC (Rogue 3 / Wizard 5, alignment nonlawful, high ranks in trickster skills)
  const qualifiedPC = new Combatant({
    classes: [
      { classType: 'wizard', level: 5 }, // 3rd-level arcane spells
      { classType: 'rogue', level: 3 }  // sneak attack +2d6
    ],
    alignment: 'Chaotic Good',
    skills: {
      decipher_script: { ranks: 7, misc: 0 },
      disable_device: { ranks: 7, misc: 0 },
      escape_artist: { ranks: 7, misc: 0 },
      knowledge_arcana: { ranks: 4, misc: 0 }
    }
  });

  const res2 = CombatRules.validatePrestigeClassPrereqs(qualifiedPC, 'arcane_trickster');
  assert.strictEqual(res2.success, true, 'Should pass validation');
  assert.strictEqual(res2.errors.length, 0, 'Should have no errors');
});

test('Prestige Classes - Dragon Disciple Prerequisite validation', () => {
  // 1. Disqualified PC (missing knowledge_arcana 8, missing spontaneous arcane casting)
  const disqualifiedPC = new Combatant({
    classes: [
      { classType: 'wizard', level: 1 }
    ],
    skills: {}
  });

  const res1 = CombatRules.validatePrestigeClassPrereqs(disqualifiedPC, 'dragon_disciple');
  assert.strictEqual(res1.success, false, 'Should fail validation');

  // 2. Qualified PC (Sorcerer 5 / Fighter 2, Knowledge Arcana 8, race Human)
  const qualifiedPC = new Combatant({
    classes: [
      { classType: 'sorcerer', level: 5 },
      { classType: 'fighter', level: 2 }
    ],
    race: 'human',
    skills: {
      knowledge_arcana: { ranks: 8, misc: 0 }
    }
  });

  const res2 = CombatRules.validatePrestigeClassPrereqs(qualifiedPC, 'dragon_disciple');
  assert.strictEqual(res2.success, true, 'Should pass validation');
});

test('Prestige Classes - Mystic Theurge spell level linking and effective caster level / slots', () => {
  // Wizard 3 / Cleric 3 / Mystic Theurge 2
  // MT 2 links arcane to wizard and divine to cleric.
  // Effective Wizard level = 3 + 2 = 5
  // Effective Cleric level = 3 + 2 = 5
  const pc = new Combatant({
    classes: [
      { classType: 'wizard', level: 3 },
      { classType: 'cleric', level: 3 },
      { classType: 'mystic_theurge', level: 2 }
    ],
    int: new Stat(16), // +3 Int mod
    wis: new Stat(16), // +3 Wis mod
    prestigeSpellLinks: {
      mystic_theurge: {
        arcane: 'wizard',
        divine: 'cleric'
      }
    }
  });

  // Calculate slots
  const slots = CombatRules.calculateMaxSpellSlots(pc);

  // Level 5 Wizard spell slots: 0th: 4, 1st: 3 (+1 bonus), 2nd: 2 (+1 bonus), 3rd: 1 (+1 bonus)
  // Level 5 Cleric spell slots: 0th: 4, 1st: 3 (+1 bonus), 2nd: 2 (+1 bonus), 3rd: 1 (+1 bonus)
  // Combined slots:
  // 0th: 4 + 4 = 8 slots
  // 1st: (3+1) + (3+1) = 8 slots
  // 2nd: (2+1) + (2+1) = 6 slots
  // 3rd: (1+1) + (1+1) = 4 slots
  assert.strictEqual(slots[0], 8, 'Should have 8 level 0 slots');
  assert.strictEqual(slots[1], 8, 'Should have 8 level 1 slots');
  assert.strictEqual(slots[2], 6, 'Should have 6 level 2 slots');
  assert.strictEqual(slots[3], 4, 'Should have 4 level 3 slots');
  assert.strictEqual(slots[4], 0, 'Should have 0 level 4 slots');
});

test('Prestige Classes - Arcane Trickster spell level linking and effective caster level / slots', () => {
  // Rogue 3 / Wizard 5 / Arcane Trickster 2
  // AT 2 links arcane to wizard.
  // Effective Wizard level = 5 + 2 = 7
  const pc = new Combatant({
    classes: [
      { classType: 'rogue', level: 3 },
      { classType: 'wizard', level: 5 },
      { classType: 'arcane_trickster', level: 2 }
    ],
    int: new Stat(18), // +4 Int mod
    prestigeSpellLinks: {
      arcane_trickster: 'wizard'
    }
  });

  // Calculate slots
  const slots = CombatRules.calculateMaxSpellSlots(pc);

  // Level 7 Wizard spell slots: 0th: 4, 1st: 4 (+1 bonus), 2nd: 3 (+1 bonus), 3rd: 2 (+1 bonus), 4th: 1 (+1 bonus)
  // Let's assert:
  assert.strictEqual(slots[0], 4, 'Should have 4 level 0 slots');
  assert.strictEqual(slots[1], 5, 'Should have 5 level 1 slots');
  assert.strictEqual(slots[2], 4, 'Should have 4 level 2 slots');
  assert.strictEqual(slots[3], 3, 'Should have 3 level 3 slots');
  assert.strictEqual(slots[4], 2, 'Should have 2 level 4 slots');
});


test('Prestige Classes - Arcane Trickster sneak attack scaling', () => {
  // Rogue 5 / Wizard 5 / Arcane Trickster 2
  // Rogue 5 gives +3d6 sneak attack.
  // AT 2 gives +1d6 sneak attack.
  // Combined = +4d6 sneak attack.
  const pc = new Combatant({
    classes: [
      { classType: 'rogue', level: 5 },
      { classType: 'wizard', level: 5 },
      { classType: 'arcane_trickster', level: 2 }
    ]
  });

  assert.strictEqual(pc.getSneakAttackDiceCount(), 4, 'Should have 4d6 sneak attack');
});

test('Prestige Classes - Assassin Prerequisite validation', () => {
  // 1. Disqualified PC (missing skills, Neutral alignment)
  const disqualifiedPC = new Combatant({
    classes: [
      { classType: 'rogue', level: 5 }
    ],
    alignment: 'Neutral',
    skills: {}
  });

  const res1 = CombatRules.validatePrestigeClassPrereqs(disqualifiedPC, 'assassin');
  assert.strictEqual(res1.success, false, 'Should fail validation');
  assert.ok(res1.errors.some(e => e.includes('Böse Gesinnung')), 'Should complain about alignment');

  // 2. Qualified PC (Rogue 5, Neutral Evil, Disguise 4, Hide 8, Move Silently 8)
  const qualifiedPC = new Combatant({
    classes: [
      { classType: 'rogue', level: 5 }
    ],
    alignment: 'Neutral Evil',
    skills: {
      disguise: { ranks: 4, misc: 0 },
      hide: { ranks: 8, misc: 0 },
      move_silently: { ranks: 8, misc: 0 }
    }
  });

  const res2 = CombatRules.validatePrestigeClassPrereqs(qualifiedPC, 'assassin');
  assert.strictEqual(res2.success, true, 'Should pass validation');
  assert.strictEqual(res2.errors.length, 0, 'Should have no errors');
});

test('Prestige Classes - Assassin spell slots and sneak attack scaling', () => {
  // Rogue 5 / Assassin 2
  // Rogue 5 gives +3d6 sneak attack.
  // Assassin 2 gives +1d6 sneak attack.
  // Combined = +4d6 sneak attack.
  // Assassin 2 Int 14 (+2 mod) spells table level 2 has base 1 slot of 1st level.
  // Plus 1 bonus slot of 1st level for Int 14 -> total 2 slots of 1st level.
  const pc = new Combatant({
    classes: [
      { classType: 'rogue', level: 5 },
      { classType: 'assassin', level: 2 }
    ],
    int: new Stat(14),
    alignment: 'Neutral Evil'
  });

  assert.strictEqual(pc.getSneakAttackDiceCount(), 4, 'Should have 4d6 sneak attack');

  const slots = CombatRules.calculateMaxSpellSlots(pc);
  assert.strictEqual(slots[1], 2, 'Should have 2 level 1 slots');
  assert.strictEqual(slots[2], 0, 'Should have 0 level 2 slots');
});

