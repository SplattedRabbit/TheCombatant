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
