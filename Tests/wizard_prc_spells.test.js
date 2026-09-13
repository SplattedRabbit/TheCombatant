// Tests/wizard_prc_spells.test.js
// Unit tests for prestige class spell learning quota resolution and wizard save helper persistence in character creation.

import { test } from 'node:test';
import assert from 'node:assert';
import { resolveSpellLevelInfo } from '../src/components/player/wizard/spells/spellSelectionRules.ts';
import { applyWizardCharacterToState } from '../src/components/player/wizard/wizardSaveHelper.ts';
import { CombatState, getState } from '../js/state.js';
import { CombatRules } from '../js/rules.js';
import { CombatSpells } from '../js/spells.js';

// Setup mock cantrips for character creation cantrip granting
CombatSpells.REGISTRY['read_magic'] = {
  id: 'read_magic',
  nameDe: 'Magie lesen',
  nameEn: 'Read Magic',
  school: 'divination',
  level: 0,
  classLevels: [{ class: 'wizard', level: 0 }]
};

CombatSpells.REGISTRY['detect_magic'] = {
  id: 'detect_magic',
  nameDe: 'Magie entdecken',
  nameEn: 'Detect Magic',
  school: 'divination',
  level: 0,
  classLevels: [{ class: 'wizard', level: 0 }]
};

test('Wizard PRC Spells - Base Wizard level 1 quota resolution', () => {
  const currentConfig = { classType: 'wizard' };
  const allLevelConfigs = [{ classType: 'wizard' }];
  const info = resolveSpellLevelInfo(currentConfig, allLevelConfigs, 0, 4); // INT 18 (+4)

  assert.strictEqual(info.isCaster, true);
  assert.strictEqual(info.targetCasterClass, 'wizard');
  assert.strictEqual(info.quota, 7, '3 + INT mod (+4) = 7 starting spells');
  assert.strictEqual(info.maxSpellLevel, 1);
  assert.strictEqual(info.autoCantrips, true);
});

test('Wizard PRC Spells - Spellwarp Sniper level 1 advancing Wizard 6 quota resolution', () => {
  // 6 levels of wizard, 7th level is Spellwarp Sniper
  const levelConfigs = [
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    {
      classType: 'spellwarp_sniper',
      prestigeSpellLinks: { spellwarp_sniper: 'wizard' }
    }
  ];

  const info = resolveSpellLevelInfo(levelConfigs[6], levelConfigs, 6, 4);

  assert.strictEqual(info.isCaster, true, 'Spellwarp Sniper advancing Wizard must be recognized as caster');
  assert.strictEqual(info.targetCasterClass, 'wizard', 'Target caster class must be wizard');
  assert.strictEqual(info.isPrestige, true, 'Must be flagged as prestige class');
  assert.strictEqual(info.effectiveCasterLevel, 7, '6 Wizard + 1 Spellwarp Sniper = CL 7');
  assert.strictEqual(info.maxSpellLevel, 4, 'CL 7 Wizard casts up to 4th level spells');
  assert.strictEqual(info.quota, 2, 'Gains 2 free spells for spellbook');
  assert.ok(info.allowedSpellLevels.includes(4), 'Allowed levels must include 4th level');
  assert.ok(info.label.includes('Spellwarp Sniper'), 'Label should mention prestige class');
  assert.ok(info.label.includes('Wizard'), 'Label should mention progressed class');
});

test('Wizard PRC Spells - Non-casting prestige class (Battle Trickster) does not trigger spell selection', () => {
  const levelConfigs = [
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'battle_trickster' }
  ];

  const info = resolveSpellLevelInfo(levelConfigs[5], levelConfigs, 5, 0);
  assert.strictEqual(info.isCaster, false, 'Battle Trickster has no spellcasting progression');
  assert.strictEqual(info.quota, 0);
});

test('Wizard PRC Spells - Character Creation Wizard persists prestigeSpellLinks and grants cantrips', () => {
  const levelConfigs = [
    { classType: 'wizard', hpRoll: 4, spells: ['magic_missile', 'mage_armor'] },
    { classType: 'wizard', hpRoll: 3, spells: ['shield', 'grease'] },
    { classType: 'wizard', hpRoll: 3, spells: ['web', 'mirror_image'] },
    { classType: 'wizard', hpRoll: 4, spells: ['scorching_ray', 'glitterdust'] },
    { classType: 'wizard', hpRoll: 2, spells: ['fireball', 'fly'] },
    { classType: 'wizard', hpRoll: 3, spells: ['haste', 'dispel_magic'] },
    {
      classType: 'spellwarp_sniper',
      hpRoll: 4,
      prestigeSpellLinks: { spellwarp_sniper: 'wizard' },
      spells: ['ice_storm', 'dimension_door']
    }
  ];

  const baseStats = { str: 10, dex: 14, con: 14, int: 18, wis: 10, cha: 8 };
  const completedDraft = {
    classesList: [
      { classType: 'wizard', level: 6 },
      { classType: 'spellwarp_sniper', level: 1 }
    ],
    statMods: { str: 0, dex: 2, con: 2, int: 4, wis: 0, cha: -1 },
    prestigeSpellLinks: { spellwarp_sniper: 'wizard' },
    wizardSpecialization: 'none',
    wizardProhibited1: '',
    wizardProhibited2: '',
    allSkills: {},
    allSkillTricks: []
  };

  applyWizardCharacterToState(
    'Archmage Sniper',
    'human',
    'Chaotic',
    'Good',
    baseStats,
    levelConfigs,
    completedDraft
  );

  const pc = CombatState.getActivePC();
  assert.ok(pc, 'PC must be active in state');
  assert.strictEqual(pc.name, 'Archmage Sniper');
  assert.strictEqual(pc.classes.length, 2, 'Should have 2 classes (Wizard 6 / Spellwarp Sniper 1)');

  // Verify prestigeSpellLinks is preserved
  assert.ok(pc.prestigeSpellLinks, 'prestigeSpellLinks must be defined');
  assert.strictEqual(pc.prestigeSpellLinks.spellwarp_sniper, 'wizard', 'spellwarp_sniper must link to wizard');

  // Verify effective caster level
  const cl = CombatRules.getEffectiveCasterLevel(pc, 'wizard');
  assert.strictEqual(cl, 7, 'Effective Wizard Caster Level must be 7 (6 Wizard + 1 Spellwarp Sniper)');

  // Verify learned spells contains both levelup spells and cantrips
  assert.ok(pc.learnedSpells.includes('fireball'), 'Must contain Fireball');
  assert.ok(pc.learnedSpells.includes('ice_storm'), 'Must contain Ice Storm chosen on PrC level');
  assert.ok(pc.learnedSpells.includes('read_magic'), 'Must contain auto-granted 0-level Cantrips (Read Magic)');
  assert.ok(pc.learnedSpells.includes('detect_magic'), 'Must contain auto-granted 0-level Cantrips (Detect Magic)');

  // Clean up
  const state = getState();
  state.combatants = state.combatants.filter(c => c.name !== 'Archmage Sniper');
});
