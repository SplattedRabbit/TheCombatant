// Tests/ca_feats.test.js - Verify Complete Adventurer feats registration and prerequisite evaluation
import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { CombatFeats, checkFeatPrerequisites } from '../js/data/feats-data.js';

test('Complete Adventurer Feats - Registration Audit', () => {
  const expectedFeats = [
    // Combat (9)
    'expert_tactician',
    'brutal_throw',
    'power_throw',
    'dual_strike',
    'deft_opportunist',
    'hear_the_unseen',
    'improved_diversion',
    'oversized_two_weapon_fighting',
    'staggering_strike',
    // General (20)
    'appraise_magic_value',
    'ascetic_hunter',
    'ascetic_knight',
    'ascetic_rogue',
    'combat_intuition',
    'danger_sense',
    'dash',
    'devoted_performer',
    'devoted_tracker',
    'dive_for_cover',
    'extra_music',
    'force_of_personality',
    'improved_flight',
    'improved_swimming',
    'insightful_reflexes',
    'jack_of_all_trades',
    'natural_bond',
    'open_minded',
    'subsonics',
    'versatile_performer',
    'tactile_trapsmith',
    // Magic (2)
    'ascetic_mage',
    'razing_strike'
  ];

  expectedFeats.forEach(id => {
    const feat = CombatFeats.REGISTRY[id];
    assert.ok(feat, `Feat "${id}" should be registered in CombatFeats.REGISTRY`);
    assert.strictEqual(feat.source, 'ca', `Feat "${id}" source should strictly be 'ca'`);
    assert.ok(feat.nameDe && feat.nameEn, `Feat "${id}" should have German and English names`);
  });
});

test('Expert Tactician - Prerequisite Evaluation', () => {
  // Prereqs: Dex 13, Combat Reflexes, BAB +2
  const pcLow = new Combatant({
    name: 'Novice',
    dex: 12,
    bab: 1,
    feats: []
  });
  const resLow = checkFeatPrerequisites('expert_tactician', pcLow);
  assert.strictEqual(resLow.met, false);
  assert.strictEqual(resLow.unmetDescs.length, 3); // Dex, feat, bab

  const pcHigh = new Combatant({
    name: 'Veteran Tactician',
    dex: 14,
    bab: 3,
    feats: [{ id: 'combat_reflexes' }]
  });
  const resHigh = checkFeatPrerequisites('expert_tactician', pcHigh);
  assert.strictEqual(resHigh.met, true);
  assert.strictEqual(resHigh.unmetDescs.length, 0);
});

test('Skill Prerequisite Engine - Combat Intuition', () => {
  const pc = new Combatant({
    name: 'Monk',
    dex: 14,
    bab: 5,
    feats: [{ id: 'dodge' }],
    skills: {
      tumble: { ranks: 5, misc: 0 },
      sense_motive: { ranks: 4, misc: 0 }
    }
  });

  const resIntuition = checkFeatPrerequisites('combat_intuition', pc);
  assert.strictEqual(resIntuition.met, true);
});

test('Feat Slot Progression - RAW D&D 3.5e Progression (Non-Human & Human)', async () => {
  const { calculateMaxFeats, validateFeatsAssignment } = await import('../js/rules/RulesFeats.js');

  const nonHumanL1 = new Combatant({ race: 'anima_construct', classes: [{ classType: 'cleric', level: 1 }] });
  assert.strictEqual(calculateMaxFeats(nonHumanL1), 1);

  const nonHumanL2 = new Combatant({ race: 'anima_construct', classes: [{ classType: 'cleric', level: 2 }] });
  assert.strictEqual(calculateMaxFeats(nonHumanL2), 1);

  const nonHumanL3 = new Combatant({ race: 'anima_construct', classes: [{ classType: 'cleric', level: 3 }] });
  assert.strictEqual(calculateMaxFeats(nonHumanL3), 2);

  const nonHumanL6 = new Combatant({ race: 'anima_construct', classes: [{ classType: 'cleric', level: 6 }] });
  assert.strictEqual(calculateMaxFeats(nonHumanL6), 3);

  const humanL6 = new Combatant({ race: 'human', isHuman: true, classes: [{ classType: 'cleric', level: 6 }] });
  assert.strictEqual(calculateMaxFeats(humanL6), 4);

  // Validate that 3 feats on Level 6 Anima Construct Cleric is valid
  const featsList3 = [{ id: 'extra_turning' }, { id: 'combat_casting' }, { id: 'iron_will' }];
  const val3 = validateFeatsAssignment(nonHumanL6, featsList3);
  assert.strictEqual(val3.success, true);
});

test('Tactile Trapsmith - Prerequisites evaluation and clean display descriptions', async () => {
  const { checkPrerequisites } = await import('../js/rules/RulesFeats.js');
  const feat = CombatFeats.REGISTRY['tactile_trapsmith'];
  assert.ok(feat, 'Tactile Trapsmith must be registered');
  assert.strictEqual(feat.source, 'ca');

  const cleric = new Combatant({
    name: 'Cleric',
    classes: [{ classType: 'cleric', level: 6 }]
  });

  // RAW: Tactile Trapsmith has no prerequisites
  const clericCheck = checkPrerequisites(feat, cleric);
  assert.strictEqual(clericCheck.met, true);
  assert.strictEqual(clericCheck.details.length, 0);
});

test('Force of Personality, Steadfast Determination & Insightful Reflexes - Save Modifiers', async () => {
  const { rebuildCombatantModifiers } = await import('../js/models/helpers/modifiers/CombatantModifiers.js');

  // 1. Force of Personality: CHA instead of WIS on Will save
  const sorcerer = new Combatant({
    name: 'Sorcerer',
    type: 'p',
    race: 'human',
    baseWil: 2,
    wis: 10, // mod +0
    cha: 18, // mod +4
    dex: 12, // mod +1
    int: 14, // mod +2
    classes: [{ classType: 'sorcerer', level: 1 }],
    feats: [{ id: 'force_of_personality' }]
  });

  rebuildCombatantModifiers(sorcerer);
  // Base Will for Sorcerer 1 = 2, CHA mod = +4 -> Total Will = 6 (instead of 2 + 0 = 2)
  assert.strictEqual(sorcerer.wil.getValue(), 6);
  assert.strictEqual(sorcerer.wil.modifiers.some(m => m.source.includes('Force of Personality')), true);

  // 2. Insightful Reflexes: INT instead of DEX on Reflex save
  const wizard = new Combatant({
    name: 'Wizard',
    type: 'p',
    race: 'human',
    dex: 10, // mod +0
    int: 18, // mod +4
    wis: 12,
    classes: [{ classType: 'wizard', level: 1 }],
    feats: [{ id: 'insightful_reflexes' }]
  });

  rebuildCombatantModifiers(wizard);
  // Base Ref for Wizard 1 = 0, INT mod = +4 -> Total Ref = 4 (instead of 0 + 0 = 0)
  assert.strictEqual(wizard.ref.getValue(), 4);
  assert.strictEqual(wizard.ref.modifiers.some(m => m.source.includes('Insightful Reflexes')), true);

  // 3. Steadfast Determination: CON instead of WIS on Will save
  const fighter = new Combatant({
    name: 'Fighter',
    type: 'p',
    race: 'human',
    con: 16, // mod +3
    wis: 8,  // mod -1
    classes: [{ classType: 'fighter', level: 1 }],
    feats: [{ id: 'steadfast_determination' }]
  });

  rebuildCombatantModifiers(fighter);
  // Base Will for Fighter 1 = 0, CON mod = +3 -> Total Will = 3 (instead of 0 - 1 = -1)
  assert.strictEqual(fighter.wil.getValue(), 3);
  assert.strictEqual(fighter.wil.modifiers.some(m => m.source.includes('Steadfast Determination')), true);
});



