// Tests/ca_feats.test.js - Verify Complete Adventurer feats registration and prerequisite evaluation
import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { CombatFeats, checkFeatPrerequisites } from '../js/data/feats-data.js';

test('Complete Adventurer Feats - Registration Audit', () => {
  const expectedFeats = [
    'expert_tactician',
    'brutal_throw',
    'power_throw',
    'dual_strike',
    'deft_boxer',
    'deft_opportunist',
    'disemboweling_strike',
    'eyes_in_the_back_of_your_head',
    'gloom_strike',
    'greater_heavy_armor_optimization',
    'greater_multishot',
    'greater_two_weapon_defense',
    'hamstring',
    'hear_the_unseen',
    'heavy_armor_optimization',
    'improved_buckler_defense',
    'improved_combat_expertise',
    'improved_diversion',
    'improved_multiweapon_fighting',
    'improved_two_weapon_defense',
    'oversized_two_weapon_fighting',
    'prone_attack',
    'ranged_disarm',
    'ranged_pin',
    'ranged_sunder',
    'staggering_strike',
    'telling_blow',
    'appraise_magic_value',
    'ascetic_hunter',
    'ascetic_knight',
    'ascetic_rogue',
    'combat_intuition',
    'danger_sense',
    'daring_outlaw',
    'daring_warrior',
    'dash',
    'devoted_performer',
    'devoted_tracker',
    'dive_for_cover',
    'extra_music',
    'extra_wild_shape',
    'fleet_of_foot',
    'flyby_attack',
    'force_of_personality',
    'go_for_the_throat',
    'improved_flight',
    'improved_swimming',
    'improved_toughness',
    'insightful_reflexes',
    'insightful_strike',
    'jack_of_all_trades',
    'leap_of_the_heavens',
    'natural_bond',
    'open_minded',
    'subsonics',
    'tactical_trapsmith',
    'touch_of_golden_ice',
    'versatile_performer',
    'wild_cohort',
    'ascetic_mage',
    'razing_strike',
    'improved_familiar'
  ];

  expectedFeats.forEach(id => {
    const feat = CombatFeats.REGISTRY[id];
    assert.ok(feat, `Feat "${id}" should be registered in CombatFeats.REGISTRY`);
    assert.ok(['ca', 'phb2'].includes(feat.source), `Feat "${id}" source should be 'ca' or 'phb2'`);
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

test('Skill Prerequisite Engine - Deft Boxer and Combat Intuition', () => {
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

  const resBoxer = checkFeatPrerequisites('deft_boxer', pc);
  assert.strictEqual(resBoxer.met, true);

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

test('Tactical Trapsmith - Prerequisites evaluation and clean display descriptions', async () => {
  const { checkPrerequisites } = await import('../js/rules/RulesFeats.js');
  const feat = CombatFeats.REGISTRY['tactical_trapsmith'];
  assert.ok(feat, 'Tactical Trapsmith must be registered');

  // Cleric 6 without skills or trapfinding
  const cleric = new Combatant({
    name: 'Cleric',
    classes: [{ classType: 'cleric', level: 6 }]
  });

  const clericCheck = checkPrerequisites(feat, cleric);
  assert.strictEqual(clericCheck.met, false);
  assert.strictEqual(clericCheck.details.length, 3);
  assert.strictEqual(clericCheck.details[0].met, false);
  assert.strictEqual(clericCheck.details[0].desc, 'Special: Trapfinding class feature (Rogue 1+)');
  assert.strictEqual(clericCheck.details[1].met, false);
  assert.strictEqual(clericCheck.details[1].desc, 'Disable Device 3 ranks (Current: 0)');
  assert.strictEqual(clericCheck.details[2].met, false);
  assert.strictEqual(clericCheck.details[2].desc, 'Search 3 ranks (Current: 0)');

  // Rogue with required ranks
  const rogue = new Combatant({
    name: 'Rogue',
    classes: [{ classType: 'rogue', level: 1 }],
    skills: {
      disable_device: { ranks: 4, misc: 0 },
      search: { ranks: 4, misc: 0 }
    }
  });

  const rogueCheck = checkPrerequisites(feat, rogue);
  assert.strictEqual(rogueCheck.met, true);
  assert.strictEqual(rogueCheck.details[0].met, true);
  assert.strictEqual(rogueCheck.details[1].met, true);
  assert.strictEqual(rogueCheck.details[2].met, true);
});


