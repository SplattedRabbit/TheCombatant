import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  isSpellEligibleForPC,
  validateSpellLearnEligibility,
  getSpellClassLevels,
  isWizardProhibitedSchool
} from '../js/rules/RulesSpells.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Spell Eligibility - Non-caster character is not eligible for any spell', () => {
  const fighterPC = {
    classes: [{ classType: 'fighter', level: 5 }],
    learnedSpells: []
  };

  const fireball = {
    id: 'fireball',
    nameEn: 'Fireball',
    school: 'Evocation',
    classLevels: [{ class: 'sorcerer', level: 3 }, { class: 'wizard', level: 3 }]
  };

  assert.strictEqual(isSpellEligibleForPC(fireball, fighterPC), false);

  const res = validateSpellLearnEligibility(fighterPC, fireball, () => null);
  assert.strictEqual(res.allowed, false);
  assert.strictEqual(res.title, 'Kein Zauberwirker');
});

test('Spell Eligibility - Cleric cannot learn Sorc/Wiz-exclusive spells', () => {
  const clericPC = {
    classes: [{ classType: 'cleric', level: 5 }],
    learnedSpells: []
  };

  const arcaneTurmoil = {
    id: 'arcane_turmoil',
    nameEn: 'Arcane Turmoil',
    school: 'Abjuration',
    classLevels: [{ class: 'sorcerer', level: 2 }, { class: 'wizard', level: 2 }]
  };

  const dimensionHop = {
    id: 'dimension_hop',
    nameEn: 'Dimension Hop',
    school: 'Conjuration',
    classLevels: [{ class: 'sorcerer', level: 2 }, { class: 'wizard', level: 2 }]
  };

  const cureModerateWounds = {
    id: 'cure_moderate_wounds',
    nameEn: 'Cure Moderate Wounds',
    school: 'Conjuration (Healing)',
    classLevels: [{ class: 'cleric', level: 2 }]
  };

  // Filter & Eligibility check
  assert.strictEqual(isSpellEligibleForPC(arcaneTurmoil, clericPC), false, 'Cleric should not be eligible for Arcane Turmoil');
  assert.strictEqual(isSpellEligibleForPC(dimensionHop, clericPC), false, 'Cleric should not be eligible for Dimension Hop');
  assert.strictEqual(isSpellEligibleForPC(cureModerateWounds, clericPC), true, 'Cleric should be eligible for Cure Moderate Wounds');

  // Validation check on learn attempt
  const resTurmoil = validateSpellLearnEligibility(clericPC, arcaneTurmoil, () => null);
  assert.strictEqual(resTurmoil.allowed, false);
  assert.strictEqual(resTurmoil.title, 'Nicht erlernbar');

  const resCure = validateSpellLearnEligibility(clericPC, cureModerateWounds, () => null);
  assert.strictEqual(resCure.allowed, true);
});

test('Spell Eligibility - Wizard cannot learn Cleric/Druid spells or prohibited schools', () => {
  const wizardPC = {
    classes: [{ classType: 'wizard', level: 5 }],
    wizardSpecialization: 'evocation',
    wizardProhibited1: 'Nekromantie',
    wizardProhibited2: 'Illusion',
    learnedSpells: []
  };

  const animateDead = {
    id: 'animate_dead',
    nameEn: 'Animate Dead',
    school: 'Nekromantie',
    classLevels: [{ class: 'cleric', level: 3 }, { class: 'wizard', level: 4 }]
  };

  const cureLightWounds = {
    id: 'cure_light_wounds',
    nameEn: 'Cure Light Wounds',
    school: 'Conjuration (Healing)',
    classLevels: [{ class: 'cleric', level: 1 }, { class: 'druid', level: 1 }]
  };

  const fireball = {
    id: 'fireball',
    nameEn: 'Fireball',
    school: 'Evocation',
    classLevels: [{ class: 'sorcerer', level: 3 }, { class: 'wizard', level: 3 }]
  };

  // Prohibited school check
  assert.strictEqual(isWizardProhibitedSchool(animateDead, wizardPC), true);
  assert.strictEqual(isSpellEligibleForPC(animateDead, wizardPC), false);

  const resProhibited = validateSpellLearnEligibility(wizardPC, animateDead, () => null);
  assert.strictEqual(resProhibited.allowed, false);
  assert.strictEqual(resProhibited.title, 'Verbotene Schule');

  // Wrong class list check
  assert.strictEqual(isSpellEligibleForPC(cureLightWounds, wizardPC), false);
  const resWrongClass = validateSpellLearnEligibility(wizardPC, cureLightWounds, () => null);
  assert.strictEqual(resWrongClass.allowed, false);
  assert.strictEqual(resWrongClass.title, 'Nicht erlernbar');

  // Allowed spell
  assert.strictEqual(isSpellEligibleForPC(fireball, wizardPC), true);
  const resFireball = validateSpellLearnEligibility(wizardPC, fireball, () => null);
  assert.strictEqual(resFireball.allowed, true);
});

test('Spell Eligibility - Spell level exceeding maximum caster level is blocked', () => {
  const lowLevelWizard = {
    classes: [{ classType: 'wizard', level: 1 }],
    learnedSpells: []
  };

  const fireball = {
    id: 'fireball',
    nameEn: 'Fireball',
    school: 'Evocation',
    classLevels: [{ class: 'sorcerer', level: 3 }, { class: 'wizard', level: 3 }]
  };

  assert.strictEqual(isSpellEligibleForPC(fireball, lowLevelWizard), false);
  const res = validateSpellLearnEligibility(lowLevelWizard, fireball, () => null);
  assert.strictEqual(res.allowed, false);
});

test('Spellbook Audit - All spells across all 4 books have valid classLevels', () => {
  const books = [
    'data/spells-phb.json',
    'data/spells-phb2.json',
    'data/spells-ca.json',
    'data/spells-cs.json'
  ];

  for (const b of books) {
    const filePath = path.resolve(__dirname, '..', b);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const [id, s] of Object.entries(data)) {
      const clsLevels = getSpellClassLevels(s);
      assert.ok(
        Array.isArray(clsLevels) && clsLevels.length > 0,
        `Spell "${id}" in ${b} must have at least one valid classLevel entry`
      );

      for (const cl of clsLevels) {
        assert.ok(typeof cl.class === 'string' && cl.class.length > 0, `Spell "${id}" classLevel must have a class string`);
        assert.ok(typeof cl.level === 'number' && cl.level >= 0 && cl.level <= 9, `Spell "${id}" classLevel must have a valid level 0-9`);
      }
    }
  }
});
