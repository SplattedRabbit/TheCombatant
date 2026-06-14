// Tests/components.test.js - Test suite for player sheet UI components (Spellbook, Compendium, & Skills tabs)

import { test } from 'node:test';
import assert from 'node:assert';
import { CombatSpells, findSpell } from '../js/spells.js';
import {
  getAllCompendiumSpells,
  isSpellEligibleForPC,
  getEligibleSpellLevelsForPC
} from '../js/rules.js';
import { Combatant } from '../js/models/Combatant.js';

// Setup mock spells in registry
CombatSpells.REGISTRY['magic_missile'] = {
  nameDe: 'Magisches Geschoss',
  nameEn: 'Magic Missile',
  school: 'Hervorrufung',
  level: 1,
  classLevels: [{ class: 'wizard', level: 1 }]
};

CombatSpells.REGISTRY['fireball'] = {
  nameDe: 'Feuerball',
  nameEn: 'Fireball',
  school: 'Hervorrufung',
  level: 3,
  classLevels: [{ class: 'wizard', level: 3 }, { class: 'sorcerer', level: 3 }]
};

CombatSpells.REGISTRY['cure_light_wounds'] = {
  nameDe: 'Leichte Wunden heilen',
  nameEn: 'Cure Light Wounds',
  school: 'Beschwörung',
  level: 1,
  classLevels: [{ class: 'cleric', level: 1 }, { class: 'druid', level: 1 }]
};

test('PCSpellbookTab - findSpell finds standard and custom spells', () => {
  const pc = {
    customSpells: [
      { id: 'custom_test', nameDe: 'Eigener Testzauber', school: 'Illusion', level: 2 }
    ]
  };

  // Find standard spell
  const spell1 = findSpell(pc, 'magic_missile');
  assert.ok(spell1);
  assert.strictEqual(spell1.nameDe, 'Magisches Geschoss');

  // Find custom spell by ID
  const spell2 = findSpell(pc, 'custom_test');
  assert.ok(spell2);
  assert.strictEqual(spell2.nameDe, 'Eigener Testzauber');

  // Find custom spell by name
  const spell3 = findSpell(pc, 'Eigener Testzauber');
  assert.ok(spell3);
  assert.strictEqual(spell3.id, 'custom_test');

  // Non-existent spell
  const spellNone = findSpell(pc, 'invalid_key');
  assert.strictEqual(spellNone, null);
});

test('PCCompendiumTab - getAllCompendiumSpells gets all spells including custom', () => {
  const pc = {
    customSpells: [
      { id: 'custom_spell_1', nameDe: 'Schattenlauf', school: 'Illusion', level: 1 }
    ]
  };

  const all = getAllCompendiumSpells(pc);
  assert.ok(all.some(s => s.id === 'magic_missile'));
  assert.ok(all.some(s => s.id === 'custom_spell_1'));
  assert.strictEqual(all.find(s => s.id === 'custom_spell_1').nameDe, 'Schattenlauf');
});

test('PCCompendiumTab - isSpellEligibleForPC handles wizard prohibited schools', () => {
  // Wizard specializing in Evocation with Prohibited School: Illusion (ill) and Necromancy (nec)
  const pc = {
    classes: [{ classType: 'wizard', level: 3 }],
    wizardSpecialization: 'evocation',
    wizardProhibited1: 'Illusion',
    wizardProhibited2: 'Nekromantie'
  };

  const evocSpell = { id: 'magic_missile', school: 'Hervorrufung', classLevels: [{ class: 'wizard', level: 1 }] };
  const illusSpell = { id: 'custom_illus', school: 'Illusion', classLevels: [{ class: 'wizard', level: 1 }] };

  assert.strictEqual(isSpellEligibleForPC(evocSpell, pc), true, 'Evocation should be allowed');
  assert.strictEqual(isSpellEligibleForPC(illusSpell, pc), false, 'Prohibited school Illusion should be blocked');
});

test('PCCompendiumTab - getEligibleSpellLevelsForPC returns eligible spell levels per class table', () => {
  // Paladin Level 4 gets level 1 spells
  const pcPaladin = {
    classes: [{ classType: 'paladin', level: 4 }]
  };
  const paladinLevels = getEligibleSpellLevelsForPC(pcPaladin);
  assert.deepEqual(paladinLevels, [1]);

  // Wizard Level 3 gets levels 0, 1, 2
  const pcWizard = {
    classes: [{ classType: 'wizard', level: 3 }]
  };
  const wizardLevels = getEligibleSpellLevelsForPC(pcWizard);
  assert.deepEqual(wizardLevels, [0, 1, 2]);
});
