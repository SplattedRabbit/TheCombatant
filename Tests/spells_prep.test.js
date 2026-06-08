import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { CombatSpells } from '../js/spells.js';

// Setup mock spells in registry for testing
CombatSpells.REGISTRY['prep_test_missile'] = {
  nameDe: 'Magisches Geschoss',
  nameEn: 'Magic Missile',
  school: 'Hervorrufung',
  level: 1,
  classLevels: [{ class: 'wizard', level: 1 }]
};

CombatSpells.REGISTRY['prep_test_fireball'] = {
  nameDe: 'Feuerball',
  nameEn: 'Fireball',
  school: 'Hervorrufung',
  level: 3,
  classLevels: [{ class: 'wizard', level: 5 }, { class: 'sorcerer', level: 6 }]
};

CombatSpells.REGISTRY['prep_test_shield'] = {
  nameDe: 'Schild',
  nameEn: 'Shield',
  school: 'Schutzmagie',
  level: 1,
  classLevels: [{ class: 'wizard', level: 1 }]
};

test('Spell Preparation - prepareSpell and unprepareSpell on Combatant', () => {
  const pc = new Combatant({
    classes: [{ classType: 'wizard', level: 3 }],
    spellSlots: {
      1: { max: 3, used: 0 },
      2: { max: 1, used: 0 }
    }
  });

  assert.strictEqual(pc.preparedSpells.length, 0);

  // Prepare a spell
  const id = pc.prepareSpell('prep_test_missile', [], false);
  assert.ok(id);
  assert.strictEqual(pc.preparedSpells.length, 1);
  assert.strictEqual(pc.preparedSpells[0].spellKey, 'prep_test_missile');
  assert.strictEqual(pc.preparedSpells[0].isUsed, false);
  assert.strictEqual(pc.preparedSpells[0].isSpecialist, false);

  // Unprepare the spell
  pc.unprepareSpell(id);
  assert.strictEqual(pc.preparedSpells.length, 0);
});

test('Spell Preparation - Metamagic level adjustment and slot consumption', () => {
  const pc = new Combatant({
    classes: [{ classType: 'wizard', level: 5 }],
    spellSlots: {
      1: { max: 4, used: 0 },
      2: { max: 3, used: 0 },
      3: { max: 2, used: 0 },
      4: { max: 1, used: 0 }
    }
  });

  // Prepare a spell (Magic Missile Level 1) with Extend Spell (+1 level) -> Adjusted level 2
  const id = pc.prepareSpell('prep_test_missile', ['extend_spell'], false);
  assert.strictEqual(pc.preparedSpells.length, 1);

  // Cast the prepared spell
  const casted = pc.castPreparedSpell(id);
  assert.ok(casted);
  assert.strictEqual(casted.isUsed, true);
  
  // Verify that the level 2 spell slot (adjusted level) was incremented
  assert.strictEqual(pc.spellSlots[2].used, 1, 'Spell slot of level 2 should be consumed.');
  assert.strictEqual(pc.spellSlots[1].used, 0, 'Base slot level should not be consumed.');
});

test('Spell Preparation - Spontaneous casting slot consumption', () => {
  const pc = new Combatant({
    classes: [{ classType: 'sorcerer', level: 6 }],
    spellSlots: {
      3: { max: 3, used: 1 }
    }
  });

  // Cast a spell spontaneously at level 3
  pc.castSpontaneousSpell('prep_test_fireball', 3);
  
  // Verify that the level 3 slot used count was incremented
  assert.strictEqual(pc.spellSlots[3].used, 2, 'Spontaneous slot used should increment.');
});

test('Spell Templates - Save and delete template', () => {
  const pc = new Combatant({
    name: 'Mage',
    classes: [{ classType: 'wizard', level: 1 }]
  });

  assert.deepStrictEqual(pc.spellTemplates, {});

  // Save template
  const tempSpells = [
    { spellKey: 'prep_test_missile', metamagic: [], isSpecialist: false },
    { spellKey: 'prep_test_shield', metamagic: ['extend_spell'], isSpecialist: true }
  ];
  
  pc.spellTemplates['Kampf'] = tempSpells;
  assert.strictEqual(Object.keys(pc.spellTemplates).length, 1);
  assert.deepStrictEqual(pc.spellTemplates['Kampf'], tempSpells);

  // Serialize to verify toJSON handles templates
  const json = pc.toJSON();
  assert.ok(json.spellTemplates);
  assert.deepStrictEqual(json.spellTemplates['Kampf'], tempSpells);

  // Delete template
  delete pc.spellTemplates['Kampf'];
  assert.strictEqual(Object.keys(pc.spellTemplates).length, 0);
});

test('Spell Templates - Apply template (Normal slots)', () => {
  const pc = new Combatant({
    classes: [{ classType: 'cleric', level: 1 }],
    spellSlots: {
      1: { max: 3, used: 0 }
    }
  });

  pc.spellTemplates['Standard'] = [
    { spellKey: 'prep_test_missile', metamagic: [] },
    { spellKey: 'prep_test_shield', metamagic: [] }
  ];

  const res = pc.applySpellTemplate('Standard');
  assert.ok(res.success);
  assert.strictEqual(res.unplaced.length, 0);
  assert.strictEqual(pc.preparedSpells.length, 2);
  assert.strictEqual(pc.preparedSpells[0].spellKey, 'prep_test_missile');
  assert.strictEqual(pc.preparedSpells[0].isSpecialist, false);
  assert.strictEqual(pc.preparedSpells[1].spellKey, 'prep_test_shield');
});

test('Spell Templates - Apply template (Specialist prioritization)', () => {
  const pc = new Combatant({
    classes: [{ classType: 'wizard', level: 1 }],
    wizardSpecialization: 'evo', // Specialist in Evocation (Hervorrufung)
    spellSlots: {
      1: { max: 2, used: 0 } // 1 specialist slot + 1 regular slot
    }
  });

  pc.spellTemplates['WizardSetup'] = [
    { spellKey: 'prep_test_shield', metamagic: [] }, // Schutzmagie
    { spellKey: 'prep_test_missile', metamagic: [] }  // Hervorrufung (matches specialist school 'evo')
  ];

  // When applying the template:
  // - prep_test_missile matches specialized school 'evo', so it should go to the specialist slot (isSpecialist = true).
  // - prep_test_shield does not, so it goes to the regular slot (isSpecialist = false).
  const res = pc.applySpellTemplate('WizardSetup');
  assert.ok(res.success);
  assert.strictEqual(res.unplaced.length, 0);
  assert.strictEqual(pc.preparedSpells.length, 2);

  const prepMissile = pc.preparedSpells.find(s => s.spellKey === 'prep_test_missile');
  const prepShield = pc.preparedSpells.find(s => s.spellKey === 'prep_test_shield');

  assert.ok(prepMissile);
  assert.ok(prepShield);

  assert.strictEqual(prepMissile.isSpecialist, true, 'Hervorrufung spell should go to specialist slot.');
  assert.strictEqual(prepShield.isSpecialist, false, 'Schutzmagie spell should go to regular slot.');
});

test('Spell Templates - Apply template (Slot limit overflow warning)', () => {
  const pc = new Combatant({
    classes: [{ classType: 'cleric', level: 1 }],
    spellSlots: {
      1: { max: 1, used: 0 }
    }
  });

  pc.spellTemplates['TooMany'] = [
    { spellKey: 'prep_test_missile', metamagic: [] },
    { spellKey: 'prep_test_shield', metamagic: [] }
  ];

  const res = pc.applySpellTemplate('TooMany');
  assert.ok(res.success);
  assert.strictEqual(pc.preparedSpells.length, 1);
  assert.strictEqual(pc.preparedSpells[0].spellKey, 'prep_test_missile');
  
  assert.strictEqual(res.unplaced.length, 1);
  assert.strictEqual(res.unplaced[0], 'Schild', 'Spell that exceeded slot capacity should be marked as unplaced.');
});

