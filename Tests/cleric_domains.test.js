import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DEITIES_REGISTRY,
  DOMAINS_REGISTRY,
  isAlignmentWithinOneStep,
  getDeitiesForAlignment,
  getDeity,
  getDomain,
  getSpellDomains,
  isDomainSpellForPC,
  isSpellEligibleForPC,
  validateSpellLearnEligibility,
  calculateMaxSpellSlots
} from '../js/rules.js';

import { prepareSpell } from '../js/models/helpers/spells/SpellPreparation.js';
import { SpellSlotCalculator } from '../js/rules/SpellSlotCalculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Deities & Domains - One-Step-Alignment rule', () => {
  // Pelor is NG
  assert.strictEqual(isAlignmentWithinOneStep('LG', 'NG'), true);
  assert.strictEqual(isAlignmentWithinOneStep('NG', 'NG'), true);
  assert.strictEqual(isAlignmentWithinOneStep('CG', 'NG'), true);
  assert.strictEqual(isAlignmentWithinOneStep('N', 'NG'), true);
  assert.strictEqual(isAlignmentWithinOneStep('LN', 'NG'), false); // 2 steps
  assert.strictEqual(isAlignmentWithinOneStep('LE', 'NG'), false); // 3 steps
  assert.strictEqual(isAlignmentWithinOneStep('CE', 'NG'), false); // 3 steps

  // St. Cuthbert is LN
  assert.strictEqual(isAlignmentWithinOneStep('LG', 'LN'), true);
  assert.strictEqual(isAlignmentWithinOneStep('LN', 'LN'), true);
  assert.strictEqual(isAlignmentWithinOneStep('LE', 'LN'), true);
  assert.strictEqual(isAlignmentWithinOneStep('N', 'LN'), true);
  assert.strictEqual(isAlignmentWithinOneStep('CG', 'LN'), false);

  // None / Abstract Cause is compatible with any alignment
  assert.strictEqual(isAlignmentWithinOneStep('CE', 'ANY'), true);
  assert.strictEqual(isAlignmentWithinOneStep('LG', 'ANY'), true);
});

test('Deities & Domains - Domain registry integrity (All 22 domains have 9 spells, all exist in database)', () => {
  const phbPath = path.join(__dirname, '..', 'data', 'spells-phb.json');
  const phb2Path = path.join(__dirname, '..', 'data', 'spells-phb2.json');
  const caPath = path.join(__dirname, '..', 'data', 'spells-ca.json');
  const csPath = path.join(__dirname, '..', 'data', 'spells-cs.json');

  const allSpells = {
    ...JSON.parse(fs.readFileSync(phbPath, 'utf8')),
    ...JSON.parse(fs.readFileSync(phb2Path, 'utf8')),
    ...JSON.parse(fs.readFileSync(caPath, 'utf8')),
    ...JSON.parse(fs.readFileSync(csPath, 'utf8'))
  };

  const domainKeys = Object.keys(DOMAINS_REGISTRY);
  assert.strictEqual(domainKeys.length, 22, 'Must contain all 22 Core PHB domains');

  for (const [domId, dom] of Object.entries(DOMAINS_REGISTRY)) {
    assert.ok(dom.name, `Domain ${domId} must have a name`);
    assert.ok(dom.grantedPower?.desc, `Domain ${domId} must have a granted power description`);
    assert.strictEqual(Object.keys(dom.spells).length, 9, `Domain ${domId} must have 9 spell levels`);

    for (let lvl = 1; lvl <= 9; lvl++) {
      const spellId = dom.spells[lvl];
      assert.ok(spellId, `Domain ${domId} missing spell for level ${lvl}`);
      assert.ok(allSpells[spellId], `Domain ${domId} spell '${spellId}' (Level ${lvl}) not found in spell database`);
    }
  }
});

test('Cleric Spell Slots - Cleric gains +1 Domain Slot per level (1-9), not level 0', () => {
  const clericLvl5 = {
    classes: [{ classType: 'cleric', level: 5 }],
    wis: { getValue: () => 16 }, // +3 mod -> Bonus slots: 1st (+1), 2nd (+1), 3rd (+1)
    wizardSpecialization: 'none',
    prestigeSpellLinks: {}
  };

  // At CL 5, Cleric base slots from table:
  // Lvl 0: 5 base + 0 bonus + 0 domain = 5
  // Lvl 1: 3 base + 1 bonus + 1 domain = 5
  // Lvl 2: 2 base + 1 bonus + 1 domain = 4
  // Lvl 3: 1 base + 1 bonus + 1 domain = 3
  // Lvl 4: 0
  const slots = calculateMaxSpellSlots(clericLvl5);

  assert.strictEqual(slots[0], 4, 'Level 0 slots do not receive domain bonus (base 4)');
  assert.strictEqual(slots[1], 5, 'Level 1 slots = 3 base + 1 bonus + 1 domain');
  assert.strictEqual(slots[2], 4, 'Level 2 slots = 2 base + 1 bonus + 1 domain');
  assert.strictEqual(slots[3], 3, 'Level 3 slots = 1 base + 1 bonus + 1 domain');
  assert.strictEqual(slots[4], 0, 'Level 4 slots = 0 for CL 5 cleric');
});

test('Cleric Domain Access - Travel Cleric can learn and prepare Fly, non-Travel Cleric cannot', () => {
  const travelCleric = {
    classes: [{ classType: 'cleric', level: 5 }],
    deity: 'fharlanghn',
    clericDomains: ['travel', 'luck'],
    learnedSpells: []
  };

  const sunCleric = {
    classes: [{ classType: 'cleric', level: 5 }],
    deity: 'pelor',
    clericDomains: ['sun', 'healing'],
    learnedSpells: []
  };

  const flySpell = {
    id: 'fly',
    nameEn: 'Fly',
    school: 'Transmutation',
    level: 3,
    classLevels: [{ class: 'wizard', level: 3 }, { class: 'sorcerer', level: 3 }]
  };

  // Travel cleric has Travel domain -> Fly is Travel 3 -> Eligible!
  assert.strictEqual(isDomainSpellForPC('fly', travelCleric), true);
  assert.strictEqual(isSpellEligibleForPC(flySpell, travelCleric), true);
  const travelValidation = validateSpellLearnEligibility(travelCleric, flySpell, () => null);
  assert.strictEqual(travelValidation.allowed, true);

  // Sun cleric does NOT have Travel domain -> Not eligible for Fly!
  assert.strictEqual(isDomainSpellForPC('fly', sunCleric), false);
  assert.strictEqual(isSpellEligibleForPC(flySpell, sunCleric), false);
  const sunValidation = validateSpellLearnEligibility(sunCleric, flySpell, () => null);
  assert.strictEqual(sunValidation.allowed, false);
});

test('Cleric Domain Preparation - Tracking isDomain slot in prepared spells', () => {
  const pc = {
    classes: [{ classType: 'cleric', level: 5 }],
    clericDomains: ['travel', 'luck'],
    preparedSpells: [],
    findSpell: (k) => {
      if (k === 'fly') return { id: 'fly', level: 3 };
      if (k === 'cure_serious_wounds') return { id: 'cure_serious_wounds', level: 3 };
      return null;
    }
  };

  // Prepare standard cure spell in standard slot
  prepareSpell(pc, 'cure_serious_wounds', [], false, false);
  assert.strictEqual(pc.preparedSpells.length, 1);
  assert.strictEqual(pc.preparedSpells[0].isDomain, false);
  assert.strictEqual(SpellSlotCalculator.countPreparedDomainSpellsAtLevel(pc, 3), 0);

  // Prepare Fly in domain slot
  prepareSpell(pc, 'fly', [], false, true);
  assert.strictEqual(pc.preparedSpells.length, 2);
  assert.strictEqual(pc.preparedSpells[1].isDomain, true);
  assert.strictEqual(SpellSlotCalculator.countPreparedDomainSpellsAtLevel(pc, 3), 1);
});
