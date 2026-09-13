// Tests/dragon_shaman.test.js - Unit tests for RAW 3.5e Dragon Shaman implementation
import { test } from 'node:test';
import assert from 'node:assert';
import { CombatRules } from '../js/rules.js';
import { DRAGON_TOTEMS, isTotemAllowedForAlignment } from '../js/rules/data/dragonTotems.js';
import { recalculateDailyAbilities } from '../js/state/pc/PCGeneral.js';
import { applyClassModifiers } from '../js/models/helpers/modifiers/ClassModifierApplier.js';
import { Stat } from '../js/models/Stat.js';
import { getPHB2ClassFeatures } from '../src/components/player/features/registry/classes/phb2Classes.ts';
import { getFeatSlotsAtLevel } from '../src/components/player/wizard/helpers.feats.ts';

test('Dragon Shaman - Totem Dragons Data Integrity', () => {
  const totems = Object.keys(DRAGON_TOTEMS);
  assert.strictEqual(totems.length, 10, 'Must have exactly 10 true dragons');

  const requiredTotems = ['black', 'blue', 'brass', 'bronze', 'copper', 'gold', 'green', 'red', 'silver', 'white'];
  requiredTotems.forEach(key => {
    const t = DRAGON_TOTEMS[key];
    assert.ok(t, `Totem ${key} must exist`);
    assert.ok(Array.isArray(t.skills) && t.skills.length === 3, `${key} must have exactly 3 class skills`);
    assert.ok(Array.isArray(t.alignments) && t.alignments.length > 0, `${key} must have acceptable alignments`);
    assert.ok(t.energy, `${key} must have energy type`);
    assert.ok(t.shape === 'line' || t.shape === 'cone', `${key} shape must be line or cone`);
    assert.ok(t.adaptation, `${key} must have adaptation`);
  });

  // Black dragon check
  assert.deepStrictEqual(DRAGON_TOTEMS.black.skills, ['hide', 'move_silently', 'swim']);
  assert.strictEqual(DRAGON_TOTEMS.black.energy, 'acid');
  assert.strictEqual(DRAGON_TOTEMS.black.shape, 'line');

  // Red dragon check
  assert.deepStrictEqual(DRAGON_TOTEMS.red.skills, ['appraise', 'bluff', 'jump']);
  assert.strictEqual(DRAGON_TOTEMS.red.energy, 'fire');
  assert.strictEqual(DRAGON_TOTEMS.red.shape, 'cone');
});

test('Dragon Shaman - Alignment Restrictions Check', () => {
  // Red Dragon: NE, CE, CN
  assert.strictEqual(isTotemAllowedForAlignment('red', 'CE'), true);
  assert.strictEqual(isTotemAllowedForAlignment('red', 'CN'), true);
  assert.strictEqual(isTotemAllowedForAlignment('red', 'NE'), true);
  assert.strictEqual(isTotemAllowedForAlignment('red', 'LG'), false);

  // Gold Dragon: NG, LG, LN
  assert.strictEqual(isTotemAllowedForAlignment('gold', 'LG'), true);
  assert.strictEqual(isTotemAllowedForAlignment('gold', 'NG'), true);
  assert.strictEqual(isTotemAllowedForAlignment('gold', 'CE'), false);
});

test('Dragon Shaman - Base & Totem Class Skills', () => {
  // Base skills for Dragon Shaman
  const baseSkills = CombatRules.CLASS_SKILLS.dragon_shaman;
  assert.deepStrictEqual(baseSkills, ['climb', 'craft', 'intimidate', 'knowledge_nature', 'search']);

  // PC with Black Dragon Totem
  const blackPC = {
    classes: [{ classType: 'dragon_shaman', level: 1 }],
    dragonTotem: 'black'
  };

  // Base class skills
  assert.strictEqual(CombatRules.isClassSkill('climb', blackPC), true);
  assert.strictEqual(CombatRules.isClassSkill('intimidate', blackPC), true);
  assert.strictEqual(CombatRules.isClassSkill('search', blackPC), true);

  // Black Dragon skills: hide, move_silently, swim
  assert.strictEqual(CombatRules.isClassSkill('hide', blackPC), true);
  assert.strictEqual(CombatRules.isClassSkill('move_silently', blackPC), true);
  assert.strictEqual(CombatRules.isClassSkill('swim', blackPC), true);

  // Cross-class skills for Black Dragon
  assert.strictEqual(CombatRules.isClassSkill('bluff', blackPC), false);
  assert.strictEqual(CombatRules.isClassSkill('spellcraft', blackPC), false);

  // PC with Blue Dragon Totem: bluff, hide, spellcraft
  const bluePC = {
    classes: [{ classType: 'dragon_shaman', level: 1 }],
    dragonTotem: 'blue'
  };
  assert.strictEqual(CombatRules.isClassSkill('bluff', bluePC), true);
  assert.strictEqual(CombatRules.isClassSkill('spellcraft', bluePC), true);
  assert.strictEqual(CombatRules.isClassSkill('swim', bluePC), false);
});

test('Dragon Shaman - Touch of Vitality Scaling & Clean Daily Resources', () => {
  // Level 5 Dragon Shaman: No Touch of Vitality yet (starts at 6th level)
  const pcLvl5 = {
    classes: [{ classType: 'dragon_shaman', level: 5 }],
    cha: 16, // +3 mod
    dailyAbilities: []
  };
  recalculateDailyAbilities(pcLvl5);
  assert.strictEqual(pcLvl5.touchOfVitalityMax, undefined);
  assert.strictEqual(pcLvl5.dailyAbilities.some(a => a.name === 'Touch of Vitality'), false);
  assert.strictEqual(pcLvl5.dailyAbilities.some(a => a.name === 'Breath Weapon'), false);

  // Level 7 Dragon Shaman with Cha 14 (+2 mod): 2 * 7 * 2 = 28 HP pool (PHB2 RAW example)
  const pcLvl7 = {
    classes: [{ classType: 'dragon_shaman', level: 7 }],
    cha: 14, // +2 mod
    dailyAbilities: []
  };
  recalculateDailyAbilities(pcLvl7);
  assert.strictEqual(pcLvl7.touchOfVitalityMax, 28, '7th lvl Dragon Shaman with +2 Cha should have 28 HP pool');
  const tov = pcLvl7.dailyAbilities.find(a => a.name === 'Touch of Vitality');
  assert.ok(tov);
  assert.strictEqual(tov.max, 28);
  assert.strictEqual(tov.used, 0);

  // Level 12 Dragon Shaman with Cha 18 (+4 mod): 2 * 12 * 4 = 96 HP pool
  const pcLvl12 = {
    classes: [{ classType: 'dragon_shaman', level: 12 }],
    cha: 18, // +4 mod
    dailyAbilities: []
  };
  recalculateDailyAbilities(pcLvl12);
  assert.strictEqual(pcLvl12.touchOfVitalityMax, 96);
});

test('Dragon Shaman - Natural Armor Bonus Application', () => {
  const getMod = (stat) => Math.floor(((stat?.base ?? stat ?? 10) - 10) / 2);

  const testNA = (level) => {
    const pc = {
      type: 'p',
      classes: [{ classType: 'dragon_shaman', level }],
      ac: new Stat(10),
      acFlat: new Stat(10),
      acTouch: new Stat(10)
    };
    applyClassModifiers(pc, getMod);
    return {
      ac: pc.ac.getValue(),
      flat: pc.acFlat.getValue(),
      touch: pc.acTouch.getValue()
    };
  };

  // Level 6: 0 Natural Armor
  assert.deepStrictEqual(testNA(6), { ac: 10, flat: 10, touch: 10 });

  // Level 7: +1 Natural Armor (applies to normal and flat-footed, NOT touch)
  assert.deepStrictEqual(testNA(7), { ac: 11, flat: 11, touch: 10 });
  assert.deepStrictEqual(testNA(11), { ac: 11, flat: 11, touch: 10 });

  // Level 12: +2 Natural Armor
  assert.deepStrictEqual(testNA(12), { ac: 12, flat: 12, touch: 10 });
  assert.deepStrictEqual(testNA(16), { ac: 12, flat: 12, touch: 10 });

  // Level 17: +3 Natural Armor
  assert.deepStrictEqual(testNA(17), { ac: 13, flat: 13, touch: 10 });
  assert.deepStrictEqual(testNA(20), { ac: 13, flat: 13, touch: 10 });
});

test('Dragon Shaman - Skill Focus Bonus Feats Progression', () => {
  const levelConfigs = [
    { classType: 'dragon_shaman', dragonTotem: 'red' },
    { classType: 'dragon_shaman', dragonTotem: 'red' }
  ];

  // Level 1: Character feat (1st)
  const lvl1Slots = getFeatSlotsAtLevel(0, 'dragon_shaman', 'human', levelConfigs);
  assert.ok(lvl1Slots.some(s => s.label.includes('Character Feat')));
  assert.ok(lvl1Slots.some(s => s.label.includes('Human Bonus Feat')));

  // Level 2: Skill Focus (Totem Skill)
  const lvl2Slots = getFeatSlotsAtLevel(1, 'dragon_shaman', 'human', levelConfigs);
  const sfSlot2 = lvl2Slots.find(s => s.label.includes('Skill Focus'));
  assert.ok(sfSlot2, 'Level 2 Dragon Shaman must have Skill Focus slot');
  assert.strictEqual(sfSlot2.defaultFeat, 'skill_focus');

  // Level 8: Skill Focus
  const lvl8Slots = getFeatSlotsAtLevel(7, 'dragon_shaman', 'dwarf', [
    ...Array(7).fill({ classType: 'dragon_shaman' }),
    { classType: 'dragon_shaman' }
  ]);
  const sfSlot8 = lvl8Slots.find(s => s.label.includes('Skill Focus'));
  assert.ok(sfSlot8, 'Level 8 Dragon Shaman must have Skill Focus slot');

  // Level 16: Skill Focus
  const lvl16Slots = getFeatSlotsAtLevel(15, 'dragon_shaman', 'dwarf', [
    ...Array(15).fill({ classType: 'dragon_shaman' }),
    { classType: 'dragon_shaman' }
  ]);
  const sfSlot16 = lvl16Slots.find(s => s.label.includes('Skill Focus'));
  assert.ok(sfSlot16, 'Level 16 Dragon Shaman must have Skill Focus slot');
});

test('Dragon Shaman - Unified Features RAW Descriptions', () => {
  const pc = {
    classes: [{ classType: 'dragon_shaman', level: 14 }],
    dragonTotem: 'gold',
    con: 14,
    cha: 16
  };
  const classMap = new Map([['dragon_shaman', 14]]);
  const feats = getPHB2ClassFeatures(pc, classMap);

  // 1. Totem Dragon feature
  const totemFeat = feats.find(f => f.id === 'dragon_shaman_totem_dragon');
  assert.ok(totemFeat);
  assert.ok(totemFeat.name.includes('Gold Dragon'));
  assert.ok(totemFeat.summary.includes('FIRE'));

  // 2. Draconic Auras
  const auraFeat = feats.find(f => f.id === 'dragon_shaman_auras');
  assert.ok(auraFeat);
  assert.ok(auraFeat.name.includes('+3 Bonus')); // 1 + floor((14-1)/5) = 3
  assert.ok(auraFeat.summary.includes('Swift action'));

  // 3. Draconic Adaptation (shared at 13+)
  const adaptFeat = feats.find(f => f.id === 'dragon_shaman_draconic_adaptation');
  assert.ok(adaptFeat);
  assert.ok(adaptFeat.name.includes('Water Breathing'));
  assert.ok(adaptFeat.name.includes('Shared'));

  // 4. Breath Weapon
  const breathFeat = feats.find(f => f.id === 'dragon_shaman_breath_weapon');
  assert.ok(breathFeat);
  // Level 14: 2 + floor((14-4)/2) = 7d6
  assert.ok(breathFeat.name.includes('7d6 FIRE'));
  // DC: 10 + 7 + 2 = 19
  assert.ok(breathFeat.name.includes('DC 19 Ref'));
  assert.ok(breathFeat.summary.includes('30-ft cone'));
  assert.ok(breathFeat.summary.includes('1d4 rounds'));

  // 5. Touch of Vitality
  const tovFeat = feats.find(f => f.id === 'dragon_shaman_touch_vitality');
  assert.ok(tovFeat);
  // Level 14, Cha +3: 2 * 14 * 3 = 84 HP
  assert.ok(tovFeat.name.includes('84 HP'));

  // 6. Commune with Dragon Spirit (Level 14+)
  const communeFeat = feats.find(f => f.id === 'dragon_shaman_commune');
  assert.ok(communeFeat);
  // Questions: floor(14 / 3) = 4
  assert.ok(communeFeat.name.includes('4 Questions'));
  assert.ok(communeFeat.name.includes('1/Week'));
  assert.ok(communeFeat.summary.includes('7 days'));

  // 7. Energy Immunity
  const immFeat = feats.find(f => f.id === 'dragon_shaman_energy_immunity');
  assert.ok(immFeat);
  assert.ok(immFeat.name.includes('FIRE'));
});

test('Dragon Shaman - Feat Slots Calculation & Validation (RulesFeats)', async () => {
  const { calculateMaxFeats, validateFeatsAssignment } = await import('../js/rules/RulesFeats.js');

  // Level 1 Dragon Shaman (Human): 1 general + 1 human = 2
  const pcLvl1 = {
    race: 'human',
    isHuman: true,
    classes: [{ classType: 'dragon_shaman', level: 1 }]
  };
  assert.strictEqual(calculateMaxFeats(pcLvl1), 2);

  // Level 2 Dragon Shaman (Human): 1 general + 1 human + 1 DS (Skill Focus) = 3
  const pcLvl2 = {
    race: 'human',
    isHuman: true,
    classes: [{ classType: 'dragon_shaman', level: 2 }]
  };
  assert.strictEqual(calculateMaxFeats(pcLvl2), 3);

  // Level 8 Dragon Shaman (Human): 3 general (1,3,6) + 1 human + 2 DS (Skill Focus at 2, 8) = 6
  const pcLvl8 = {
    race: 'human',
    isHuman: true,
    classes: [{ classType: 'dragon_shaman', level: 8 }]
  };
  assert.strictEqual(calculateMaxFeats(pcLvl8), 6);

  // Level 16 Dragon Shaman (Human): 6 general (1,3,6,9,12,15) + 1 human + 3 DS = 10
  const pcLvl16 = {
    race: 'human',
    isHuman: true,
    classes: [{ classType: 'dragon_shaman', level: 16 }]
  };
  assert.strictEqual(calculateMaxFeats(pcLvl16), 10);

  // Validation: Level 2 DS with 2 general feats + 1 skill focus -> valid
  const validFeats = [
    { id: 'power_attack' },
    { id: 'cleave' },
    { id: 'skill_focus', option: 'Jump' }
  ];
  const resValid = validateFeatsAssignment(pcLvl2, validFeats);
  assert.strictEqual(resValid.success, true);

  // Validation: Level 2 DS with 3 general combat feats (no skill focus) -> fails bonus slot requirement
  const invalidFeats = [
    { id: 'power_attack' },
    { id: 'cleave' },
    { id: 'weapon_focus' }
  ];
  const resInvalid = validateFeatsAssignment(pcLvl2, invalidFeats);
  assert.strictEqual(resInvalid.success, false);
});

test('Dragon Shaman - Red Dragon Treasure Seeker Skill Bonus', async () => {
  const { calculateSkillModifier } = await import('../js/models/helpers/skills/CombatantSkills.js');

  const createMockPC = (level, totem) => ({
    type: 'p',
    race: 'human',
    classes: [{ classType: 'dragon_shaman', level }],
    dragonTotem: totem,
    int: { base: 10, modifiers: [], getValue: () => 10 },
    cha: { base: 10, modifiers: [], getValue: () => 10 },
    skills: { appraise: { ranks: 2 }, search: { ranks: 3 } },
    conditions: [],
    getSkillRanks(k) { return this.skills[k]?.ranks || 0; },
    getAttributeMod(abl) { return 0; },
    getSkillMisc(k) { return 0; },
    getArmorCheckPenalty() { return 0; }
  });

  // Level 2 Red Dragon Shaman: Adaptation not yet active
  const pcLvl2 = createMockPC(2, 'red');
  assert.strictEqual(calculateSkillModifier(pcLvl2, 'appraise'), 2);
  assert.strictEqual(calculateSkillModifier(pcLvl2, 'search'), 3);

  // Level 3 Red Dragon Shaman: Treasure Seeker gives +5 competence bonus on Appraise & Search
  const pcLvl3Red = createMockPC(3, 'red');
  assert.strictEqual(calculateSkillModifier(pcLvl3Red, 'appraise'), 7); // 2 ranks + 5 competence
  assert.strictEqual(calculateSkillModifier(pcLvl3Red, 'search'), 8);   // 3 ranks + 5 competence

  // Level 3 Black Dragon Shaman: Does NOT have Treasure Seeker (has Water Breathing)
  const pcLvl3Black = createMockPC(3, 'black');
  assert.strictEqual(calculateSkillModifier(pcLvl3Black, 'appraise'), 2);
  assert.strictEqual(calculateSkillModifier(pcLvl3Black, 'search'), 3);
});

test('Dragon Shaman - Alignment Hardlock & Wizard Validation', async () => {
  const { validateStep3Config } = await import('../src/components/player/wizard/wizardValidation.ts');
  const { checkPrestigeAlignment } = await import('../src/components/player/wizard/constants.ts');

  // 1. Target Class Guidance in Step 1
  assert.strictEqual(checkPrestigeAlignment('Neutral', 'Neutral', 'dragon_shaman').compatible, false);
  assert.strictEqual(checkPrestigeAlignment('Lawful', 'Good', 'dragon_shaman').compatible, true);
  assert.strictEqual(checkPrestigeAlignment('Chaotic', 'Evil', 'dragon_shaman').compatible, true);

  // 2. Wizard Validation: Missing totem
  const resNoTotem = validateStep3Config({
    currentConfig: { classType: 'dragon_shaman', hpRoll: '10' },
    currentLevelIndex: 0,
    currentLevelRemainingSkillPoints: 0,
    currentFeatSlots: [],
    alignmentEthical: 'Lawful',
    alignmentMoral: 'Good'
  });
  assert.strictEqual(resNoTotem.valid, false);
  assert.strictEqual(resNoTotem.alert?.title, 'Totem Dragon Required');

  // 3. Wizard Validation: True Neutral Hardlock
  const resTrueNeutral = validateStep3Config({
    currentConfig: { classType: 'dragon_shaman', dragonTotem: 'gold', hpRoll: '10' },
    currentLevelIndex: 0,
    currentLevelRemainingSkillPoints: 0,
    currentFeatSlots: [],
    alignmentEthical: 'Neutral',
    alignmentMoral: 'Neutral'
  });
  assert.strictEqual(resTrueNeutral.valid, false);
  assert.strictEqual(resTrueNeutral.alert?.title, 'Alignment Incompatible');

  // 4. Wizard Validation: Incompatible Alignment Hardlock (LG with Red Dragon CE)
  const resIncompatible = validateStep3Config({
    currentConfig: { classType: 'dragon_shaman', dragonTotem: 'red', hpRoll: '10' },
    currentLevelIndex: 0,
    currentLevelRemainingSkillPoints: 0,
    currentFeatSlots: [],
    alignmentEthical: 'Lawful',
    alignmentMoral: 'Good'
  });
  assert.strictEqual(resIncompatible.valid, false);
  assert.strictEqual(resIncompatible.alert?.title, 'Alignment Incompatible with Totem');

  // 5. Wizard Validation: Compatible Alignment Success (CE with Red Dragon)
  const resCompatibleRed = validateStep3Config({
    currentConfig: { classType: 'dragon_shaman', dragonTotem: 'red', hpRoll: '10' },
    currentLevelIndex: 0,
    currentLevelRemainingSkillPoints: 0,
    currentFeatSlots: [],
    alignmentEthical: 'Chaotic',
    alignmentMoral: 'Evil'
  });
  assert.strictEqual(resCompatibleRed.valid, true);

  // 6. Wizard Validation: Compatible Alignment Success (LG with Gold Dragon)
  const resCompatibleGold = validateStep3Config({
    currentConfig: { classType: 'dragon_shaman', dragonTotem: 'gold', hpRoll: '10' },
    currentLevelIndex: 0,
    currentLevelRemainingSkillPoints: 0,
    currentFeatSlots: [],
    alignmentEthical: 'Lawful',
    alignmentMoral: 'Good'
  });
  assert.strictEqual(resCompatibleGold.valid, true);
});

test('Dragon Shaman - Totem Skill Feats and Bonus Slot Validation (RAW)', async () => {
  const { validateFeatsAssignment } = await import('../js/rules/RulesFeats.js');
  const { isSkillFeat, isTotemFeat, getTotemSkills, getDragonShamanClassSkills } = await import('../src/components/player/feats/skillFeatsHelper.ts');

  // 1. Helper checks
  assert.deepStrictEqual(getTotemSkills('red'), ['appraise', 'bluff', 'jump']);
  assert.strictEqual(isSkillFeat({ id: 'skill_focus' }), true);
  assert.strictEqual(isSkillFeat({ id: 'acrobatic' }), true);
  assert.strictEqual(isSkillFeat({ id: 'power_attack', category: 'combat' }), false);

  // Totem relevance checks for Red Dragon (Appraise, Bluff, Jump)
  assert.strictEqual(isTotemFeat({ id: 'skill_focus' }, 'red'), true);
  assert.strictEqual(isTotemFeat({ id: 'acrobatic' }, 'red'), true); // Jump
  assert.strictEqual(isTotemFeat({ id: 'diligent' }, 'red'), true); // Appraise
  assert.strictEqual(isTotemFeat({ id: 'persuasive' }, 'red'), true); // Bluff
  assert.strictEqual(isTotemFeat({ id: 'stealthy' }, 'red'), false); // Hide / Move Silently
  assert.strictEqual(isTotemFeat({ id: 'stealthy' }, 'black'), true); // Black Dragon has Hide/Move Silently

  // 2. Rules validation for Dragon Shaman Bonus Feat
  // Non-human Level 2 Red Dragon Shaman: 1 general feat (L1) + 1 Dragon Shaman bonus feat (L2) = 2 feats total
  const dsLvl2PC = {
    race: 'elf',
    isHuman: false,
    classes: [{ classType: 'dragon_shaman', level: 2 }],
    dragonTotem: 'red'
  };

  // Valid: 1 general feat + 1 Totem Skill Focus (Jump)
  const validFeats = [
    { id: 'power_attack' },
    { id: 'skill_focus', option: 'Jump' }
  ];
  const resValid = validateFeatsAssignment(dsLvl2PC, validFeats);
  assert.strictEqual(resValid.success, true);

  // Invalid: 1 general feat + 1 Skill Focus in non-totem, non-class skill (Ride)
  const invalidFeats = [
    { id: 'power_attack' },
    { id: 'skill_focus', option: 'Ride' }
  ];
  const resInvalid = validateFeatsAssignment(dsLvl2PC, invalidFeats);
  assert.strictEqual(resInvalid.success, false);
  assert.ok(resInvalid.error.includes('Totem skills'));
});

