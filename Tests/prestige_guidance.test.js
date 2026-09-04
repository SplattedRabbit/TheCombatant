// Tests/prestige_guidance.test.js - Unit tests for Prestige Class Guidance logic
import { test } from 'node:test';
import assert from 'node:assert';
import { checkPrestigeAlignment, PRESTIGE_PREREQS, CLASS_KEY_ATTRIBUTES, CLASSES_LIST } from '../src/components/player/wizard/constants.ts';
import { Combatant } from '../js/models/Combatant.js';
import { validatePrestigeClassPrereqs } from '../js/rules/classValidation.js';

test('Prestige Class Alignment Guidance - RAW Compliance', () => {
  // 1. Shadowbane Inquisitor requires Lawful Good
  const siLG = checkPrestigeAlignment('Lawful', 'Good', 'shadowbane_inquisitor');
  assert.strictEqual(siLG.compatible, true, 'Shadowbane Inquisitor must accept Lawful Good');

  const siCG = checkPrestigeAlignment('Chaotic', 'Good', 'shadowbane_inquisitor');
  assert.strictEqual(siCG.compatible, false, 'Shadowbane Inquisitor must reject Chaotic Good');
  assert.ok(siCG.requirementLabel.includes('Lawful Good'));

  const siLE = checkPrestigeAlignment('Lawful', 'Evil', 'shadowbane_inquisitor');
  assert.strictEqual(siLE.compatible, false, 'Shadowbane Inquisitor must reject Lawful Evil');

  // 2. Assassin requires Any Evil
  const assNE = checkPrestigeAlignment('Neutral', 'Evil', 'assassin');
  assert.strictEqual(assNE.compatible, true, 'Assassin must accept Neutral Evil');

  const assLE = checkPrestigeAlignment('Lawful', 'Evil', 'assassin');
  assert.strictEqual(assLE.compatible, true, 'Assassin must accept Lawful Evil');

  const assTN = checkPrestigeAlignment('Neutral', 'Neutral', 'assassin');
  assert.strictEqual(assTN.compatible, false, 'Assassin must reject True Neutral');

  // 3. Arcane Trickster requires Non-Lawful
  const atCG = checkPrestigeAlignment('Chaotic', 'Good', 'arcane_trickster');
  assert.strictEqual(atCG.compatible, true, 'Arcane Trickster must accept Chaotic Good');

  const atTN = checkPrestigeAlignment('Neutral', 'Neutral', 'arcane_trickster');
  assert.strictEqual(atTN.compatible, true, 'Arcane Trickster must accept Neutral');

  const atLG = checkPrestigeAlignment('Lawful', 'Good', 'arcane_trickster');
  assert.strictEqual(atLG.compatible, false, 'Arcane Trickster must reject Lawful Good');

  // 4. Classes without alignment restrictions
  const mt = checkPrestigeAlignment('Chaotic', 'Evil', 'mystic_theurge');
  assert.strictEqual(mt.compatible, true, 'Mystic Theurge has no alignment requirement');
});

test('Prestige Class Key Attributes & Attribute Hints Registry', () => {
  const allPrCs = CLASSES_LIST.filter(c => c.isPrestige).map(c => c.key);
  assert.ok(allPrCs.length >= 7, 'Must have at least 7 canonical prestige classes');

  for (const prcKey of allPrCs) {
    const keyAttrs = CLASS_KEY_ATTRIBUTES[prcKey];
    assert.ok(Array.isArray(keyAttrs) && keyAttrs.length > 0, `Prestige class "${prcKey}" must define key attributes`);
  }

  // Shadowbane Inquisitor must have STR, WIS, CHA, CON mapped
  const siAttrs = CLASS_KEY_ATTRIBUTES['shadowbane_inquisitor'];
  assert.ok(siAttrs.includes('str') && siAttrs.includes('wis') && siAttrs.includes('cha'));

  // Pre-requisites info registry must contain hints
  assert.ok(PRESTIGE_PREREQS['shadowbane_inquisitor']?.attributeHints?.str?.includes('Power Attack'));
});

test('Shadowbane Inquisitor Prerequisite Validation in Level Progression', () => {
  // Paladin 5 / Rogue 1 with required skills and feats
  const pc = new Combatant({
    name: 'Torm Undaunted',
    alignment: 'Lawful Good',
    classes: [
      { classType: 'paladin', level: 5 },
      { classType: 'rogue', level: 1 }
    ],
    skills: {
      gather_information: { ranks: 4, misc: 0 },
      knowledge_religion: { ranks: 2, misc: 0 },
      sense_motive: { ranks: 8, misc: 0 }
    },
    feats: [{ id: 'power_attack' }]
  });
  pc.bab.base = 5;

  const res = validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(res.success, true, 'Fully qualified character must pass Shadowbane Inquisitor prereqs');
  assert.strictEqual(res.errors.length, 0);

  // Missing BAB check
  const lowLevelPC = new Combatant({
    name: 'Novice',
    alignment: 'Lawful Good',
    classes: [{ classType: 'paladin', level: 1 }],
    skills: {
      gather_information: { ranks: 4, misc: 0 },
      knowledge_religion: { ranks: 2, misc: 0 },
      sense_motive: { ranks: 8, misc: 0 }
    },
    feats: [{ id: 'power_attack' }]
  });
  lowLevelPC.bab.base = 1;

  const lowRes = validatePrestigeClassPrereqs(lowLevelPC, 'shadowbane_inquisitor');
  assert.strictEqual(lowRes.success, false, 'Low level PC without BAB +5 must fail prereqs');
  assert.ok(lowRes.errors.some(e => e.includes('BAB')));
});
