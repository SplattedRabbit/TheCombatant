// Tests/unified_feature_registry.test.js - Unit tests for Modular Feature Registry and RAW Rule Texts
import { test } from 'node:test';
import assert from 'node:assert';
import { getAllUnifiedFeatures } from '../src/components/player/features/registry/index.ts';

test('Unified Feature Registry - Spellwarp Sniper RAW Compliance', () => {
  const pc = {
    race: 'human',
    classes: [
      { classType: 'wizard', level: 5 },
      { classType: 'spellwarp_sniper', level: 5 }
    ]
  };

  const features = getAllUnifiedFeatures(pc);
  const featureNames = features.map(f => f.name);

  // 1. Spellwarp should be present with full RAW rules
  const spellwarp = features.find(f => f.id === 'spellwarp_sniper_spellwarp');
  assert.ok(spellwarp, 'Spellwarp feature must exist');
  assert.strictEqual(spellwarp.category, 'combat');
  assert.ok(spellwarp.rawRules.includes('NO Reflex save'), 'Spellwarp RAW rules must specify no Reflex save');
  assert.ok(spellwarp.summary.includes('pinpoint rays'), 'Spellwarp summary must mention rays');

  // 2. Sudden Raystrike should be present with +2d6 (Level 5 / 2 = 2)
  const suddenRaystrike = features.find(f => f.id === 'spellwarp_sniper_sudden_raystrike');
  assert.ok(suddenRaystrike, 'Sudden Raystrike must exist');
  assert.ok(suddenRaystrike.name.includes('+2d6'), 'Sudden Raystrike must scale to +2d6 at Lv.5');
  assert.ok(suddenRaystrike.rawRules.includes('precision damage'), 'Sudden Raystrike must explain precision damage');

  // 3. Precise Shot bonus feat
  const preciseShot = features.find(f => f.id === 'spellwarp_sniper_precise_shot');
  assert.ok(preciseShot, 'Precise Shot bonus feat must exist');

  // 4. Ray Mastery
  const rayMastery = features.find(f => f.id === 'spellwarp_sniper_ray_mastery');
  assert.ok(rayMastery, 'Ray Mastery must exist');
  assert.ok(rayMastery.rawRules.includes('Empower Ray'), 'Ray Mastery must explain 1/day empower ray');

  // 5. Ensure NO placeholder text exists
  features.forEach(f => {
    assert.ok(!f.rawRules.includes('is granted by'), `Feature ${f.name} must not contain generic placeholder text`);
  });
});

test('Unified Feature Registry - Core Classes (Barbarian, Monk, Druid, Ranger)', () => {
  const pcBarb = {
    race: 'human',
    classes: [{ classType: 'barbarian', level: 12 }]
  };
  const barbFeats = getAllUnifiedFeatures(pcBarb);
  assert.ok(barbFeats.some(f => f.name.includes('Greater Rage')), 'Lv 12 Barbarian should have Greater Rage');
  assert.ok(barbFeats.some(f => f.name.includes('Damage Reduction')), 'Lv 12 Barbarian should have Damage Reduction');

  const pcMonk = {
    race: 'human',
    classes: [{ classType: 'monk', level: 12 }],
    wis: 16
  };
  const monkFeats = getAllUnifiedFeatures(pcMonk);
  assert.ok(monkFeats.some(f => f.id === 'monk_ac_bonus'), 'Monk AC Bonus should be present');
  assert.ok(monkFeats.some(f => f.id === 'monk_ki_strike'), 'Ki Strike should be present');
  assert.ok(monkFeats.some(f => f.id === 'monk_abundant_step'), 'Abundant Step should be present at Lv 12');

  const pcDruid = {
    race: 'human',
    classes: [{ classType: 'druid', level: 8 }]
  };
  const druidFeats = getAllUnifiedFeatures(pcDruid);
  assert.ok(druidFeats.some(f => f.id === 'druid_wild_shape'), 'Wild Shape should be present');
  const ws = druidFeats.find(f => f.id === 'druid_wild_shape');
  assert.ok(ws.rawRules.includes('Large'), 'Wild shape at Lv 8 must mention Large forms');

  const pcCleric = {
    race: 'human',
    classes: [{ classType: 'cleric', level: 7 }],
    clericDomains: ['war', 'healing'],
    cha: 14
  };
  const clericFeats = getAllUnifiedFeatures(pcCleric);
  assert.ok(clericFeats.some(f => f.id === 'cleric_spontaneous_casting'), 'Cleric spontaneous casting must be present');
  assert.ok(clericFeats.some(f => f.id === 'cleric_domain_war'), 'War domain must be present');
  assert.ok(clericFeats.some(f => f.id === 'turn_undead_merged'), 'Turn Undead must be present');
});

test('Unified Feature Registry - Expansion Classes (Duskblade, Scout, Ninja, Knight)', () => {
  const pcDusk = {
    race: 'human',
    classes: [{ classType: 'duskblade', level: 13 }]
  };
  const duskFeats = getAllUnifiedFeatures(pcDusk);
  assert.ok(duskFeats.some(f => f.id === 'duskblade_arcane_channeling'), 'Arcane Channeling must be present');
  const chan = duskFeats.find(f => f.id === 'duskblade_arcane_channeling');
  assert.ok(chan.name.includes('Full Attack'), 'Lv 13 Duskblade gets Full Attack Channeling');

  const pcScout = {
    race: 'elf',
    classes: [{ classType: 'scout', level: 9 }]
  };
  const scoutFeats = getAllUnifiedFeatures(pcScout);
  assert.ok(scoutFeats.some(f => f.id === 'scout_skirmish'), 'Skirmish must be present');
  const sk = scoutFeats.find(f => f.id === 'scout_skirmish');
  assert.ok(sk.name.includes('+3d6'), 'Lv 9 Scout gets +3d6 Skirmish');

  const pcNinja = {
    race: 'human',
    classes: [{ classType: 'ninja', level: 6 }],
    wis: 14
  };
  const ninjaFeats = getAllUnifiedFeatures(pcNinja);
  assert.ok(ninjaFeats.some(f => f.id === 'ninja_ki_power'), 'Ki Power must be present');
});

test('Unified Feature Registry - Prestige Classes (Assassin, Dragon Disciple, Shadowbane Inquisitor)', () => {
  const pcAss = {
    race: 'human',
    int: 16,
    classes: [
      { classType: 'rogue', level: 5 },
      { classType: 'assassin', level: 5 }
    ]
  };
  const assFeats = getAllUnifiedFeatures(pcAss);
  assert.ok(assFeats.some(f => f.id === 'assassin_death_attack'), 'Death Attack must be present');
  const deathAtk = assFeats.find(f => f.id === 'assassin_death_attack');
  assert.ok(deathAtk.name.includes('DC 18'), 'Death Attack DC for Lv5 Assassin with Int 16 should be 10+5+3 = DC 18');
  assert.ok(assFeats.some(f => f.id === 'sneak_attack_merged'), 'Sneak attack should be merged');

  const pcDD = {
    race: 'human',
    classes: [{ classType: 'dragon_disciple', level: 10 }]
  };
  const ddFeats = getAllUnifiedFeatures(pcDD);
  assert.ok(ddFeats.some(f => f.id === 'dragon_disciple_apotheosis'), 'Dragon Apotheosis must be present at Lv 10');
  assert.ok(ddFeats.some(f => f.id === 'dragon_disciple_wings'), 'Wings must be present at Lv 10');
});

test('Unified Feature Registry - Sneak Attack Multi-Source Stacking Formatting', () => {
  const pc = {
    race: 'human',
    classes: [
      { classType: 'rogue', level: 1 },
      { classType: 'spellwarp_sniper', level: 4 }
    ]
  };
  const features = getAllUnifiedFeatures(pc);
  const sa = features.find(f => f.id === 'sneak_attack_merged');
  assert.ok(sa, 'Sneak attack merged must exist');
  assert.strictEqual(sa.name, 'Sneak Attack +3d6');
  assert.strictEqual(sa.stackInfo, 'Combined from: Rogue Lv.1 (+1d6), Spellwarp Sniper Lv.4 (+2d6)');
  assert.strictEqual(sa.source, 'Rogue Lv.1 (+1d6) • Spellwarp Sniper Lv.4 (+2d6)');
  assert.ok(!sa.stackInfo.includes('spellwarp_sniper'), 'Must not display raw snake_case identifier in stackInfo');
  assert.ok(!sa.source.includes('spellwarp_sniper'), 'Must not display raw snake_case identifier in source');
});

test('Spellwarp Sniper - RAW 100% Rules Compliance Audit (Saves, Skills, Feats, Prereqs)', async () => {
  const { CLASSES, CLASS_SKILLS } = await import('../js/rules/RulesData.js');
  const { Combatant } = await import('../js/models/Combatant.js');
  const { validatePrestigeClassPrereqs } = await import('../js/rules/classValidation.js');

  // 1. Saves Check (Table 2-14: Fort poor, Ref poor, Will good)
  const swsDef = CLASSES.find(c => c.key === 'spellwarp_sniper');
  assert.ok(swsDef, 'Spellwarp Sniper must be registered in CLASSES');
  assert.strictEqual(swsDef.saves.fort, 'poor', 'Fortitude save must be poor');
  assert.strictEqual(swsDef.saves.ref, 'poor', 'Reflex save must be poor');
  assert.strictEqual(swsDef.saves.wil, 'good', 'Will save must be good');

  // 2. Class Skills Check (Complete Scoundrel p. 64: exactly 9 skills)
  const skills = CLASS_SKILLS.spellwarp_sniper;
  const expectedSkills = ['concentration', 'craft', 'hide', 'intimidate', 'knowledge_arcana', 'move_silently', 'profession', 'spellcraft', 'spot'];
  assert.strictEqual(skills.length, 9, 'Must have exactly 9 class skills');
  expectedSkills.forEach(sk => {
    assert.ok(skills.includes(sk), `Class skills must include ${sk}`);
  });

  // 3. Automatic Feats Check: Precise Shot at level >= 3
  const pc2 = new Combatant({
    name: 'Tessa',
    classes: [
      { classType: 'wizard', level: 5 },
      { classType: 'spellwarp_sniper', level: 2 }
    ]
  });
  assert.strictEqual(pc2.hasFeat('precise_shot'), false, 'Level 2 Spellwarp Sniper should not have Precise Shot');

  const pc3 = new Combatant({
    name: 'Tessa',
    classes: [
      { classType: 'wizard', level: 5 },
      { classType: 'spellwarp_sniper', level: 3 }
    ]
  });
  assert.strictEqual(pc3.hasFeat('precise_shot'), true, 'Level 3 Spellwarp Sniper must automatically have Precise Shot');

  // 4. Prerequisite Validation: Ninja 1 (Sudden Strike 1d6) + Wizard 5 meets prereqs
  const ninjaWizardPC = new Combatant({
    name: 'Ninja Mage',
    classes: [
      { classType: 'ninja', level: 1 },
      { classType: 'wizard', level: 5 }
    ],
    feats: [{ id: 'point_blank_shot' }],
    skills: {
      concentration: { ranks: 8 },
      spellcraft: { ranks: 8 }
    }
  });
  const valResult = validatePrestigeClassPrereqs(ninjaWizardPC, 'spellwarp_sniper');
  assert.strictEqual(valResult.success, true, 'Ninja 1 / Wizard 5 with Point Blank Shot and 8 ranks in Concentration/Spellcraft must qualify');
});

test('Ninja, Wizard & Spellwarp Sniper - Complete Multi-Class Integration Audit', async () => {
  const { Combatant } = await import('../js/models/Combatant.js');
  const { recalculateDailyAbilities, recalculatePCStats } = await import('../js/state/pc/PCGeneral.js');

  // 1. Build Ninja 1 / Wizard 5 / Spellwarp Sniper 5 character (Level 11)
  const pc = new Combatant({
    name: 'Shadow Caster',
    autoAC: true,
    wis: 14, // Wis mod +2
    int: 18, // Int mod +4
    dex: 16, // Dex mod +3
    classes: [
      { classType: 'ninja', level: 1 },
      { classType: 'wizard', level: 5 },
      { classType: 'spellwarp_sniper', level: 5 }
    ],
    feats: [{ id: 'point_blank_shot' }]
  });

  // Calculate stats & daily abilities
  recalculatePCStats(pc);
  recalculateDailyAbilities(pc);

  // A. Ninja Ki Power daily resource allocation: 1/2 lvl (min 1) + Wis mod (+2) = 3
  const ki = pc.dailyAbilities.find(a => a.name === 'Ki Power');
  assert.ok(ki, 'Ki Power must be registered in dailyAbilities');
  assert.strictEqual(ki.max, 3, 'Ninja Lv.1 with Wis 14 (+2) must have 3 Ki uses/day');

  // B. Spellwarp Sniper Ray Mastery Empower daily ability: 1/day
  const empower = pc.dailyAbilities.find(a => a.name === 'Ray Mastery: Empower');
  assert.ok(empower, 'Ray Mastery: Empower must be registered in dailyAbilities for SWS Lv.5');
  assert.strictEqual(empower.max, 1, 'Ray Mastery Empower must have 1 use/day');

  // C. Unarmored AC Bonus from Ninja: 10 (base) + 3 (Dex) + 2 (Wis) = 15
  assert.strictEqual(pc.ac.getValue(), 15, 'Unarmored AC must include Dex (+3) and Ninja Wis (+2)');
  assert.strictEqual(pc.acTouch.getValue(), 15, 'Touch AC must include Dex (+3) and Ninja Wis (+2)');

  // D. Precision Damage: Ninja 1d6 + Spellwarp Sniper 2d6 = 3d6
  assert.strictEqual(pc.getSneakAttackDiceCount(), 3, 'Total precision damage pool must be +3d6 (Ninja 1d6 + SWS 2d6)');

  // E. Automatic Feats: Wizard gives Scribe Scroll, SWS 3+ gives Precise Shot
  assert.strictEqual(pc.hasFeat('scribe_scroll'), true, 'Must have Scribe Scroll from Wizard');
  assert.strictEqual(pc.hasFeat('precise_shot'), true, 'Must have Precise Shot from Spellwarp Sniper Lv.3+');

  // F. Unified Features Check
  const features = getAllUnifiedFeatures(pc);
  assert.ok(features.some(f => f.id === 'ninja_sudden_strike'), 'Ninja Sudden Strike feature present');
  assert.ok(features.some(f => f.id === 'ninja_ki_power'), 'Ninja Ki Power feature present');
  assert.ok(features.some(f => f.id === 'wizard_spellcasting'), 'Wizard Spellcasting feature present');
  assert.ok(features.some(f => f.id === 'spellwarp_sniper_spellwarp'), 'Spellwarp feature present');
  assert.ok(features.some(f => f.id === 'spellwarp_sniper_ray_mastery'), 'Ray Mastery feature present');
});



